import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MailService } from '../mail/mail.service';
import { UserType } from '../utils/enums';
import { AuthProvider } from './auth.provider';
import { User } from './user.entity';

describe('AuthProvider authentication and password recovery', () => {
  let provider: AuthProvider;
  let repository: Record<string, ReturnType<typeof vi.fn>>;
  let jwt: Record<string, ReturnType<typeof vi.fn>>;
  let mail: Record<string, ReturnType<typeof vi.fn>>;
  const registerDto = { email: 'user@example.com', username: 'user', password: 'password' };

  const user = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      email: registerDto.email,
      username: registerDto.username,
      password: 'password-hash',
      userType: UserType.NORMaL_USER,
      isAccountVerified: false,
      verificationToken: 'verify-token',
      resetPasswordToken: null,
      ...overrides,
    }) as User;

  beforeEach(async () => {
    repository = {
      findOne: vi.fn(() => Promise.resolve(null)),
      create: vi.fn((newUser) => newUser),
      save: vi.fn((savedUser) =>
        Promise.resolve({
          ...savedUser,
          id: savedUser.id ?? 1,
          userType: savedUser.userType ?? UserType.NORMaL_USER,
        }),
      ),
    };
    jwt = { signAsync: vi.fn(() => Promise.resolve('signed-token')) };
    mail = {
      sendVerifyEmailTemplete: vi.fn(() => Promise.resolve()),
      sendResetPassTemplete: vi.fn(() => Promise.resolve()),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProvider,
        { provide: getRepositoryToken(User), useValue: repository },
        { provide: JwtService, useValue: jwt },
        { provide: MailService, useValue: mail },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) =>
              key === 'DOMAIN' ? 'https://api.example.com' : 'https://client.example.com',
            ),
          },
        },
      ],
    }).compile();
    provider = module.get(AuthProvider);
  });

  it('registers a unique user, sends a verification email, and signs a token', async () => {
    vi.spyOn(provider, 'hashPassword').mockResolvedValue('hashed-password');

    await expect(provider.register(registerDto)).resolves.toEqual({
      message: 'verification token has been send to your email, please verify your email address',
    });
    expect(repository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: registerDto.email,
        username: registerDto.username,
        password: 'hashed-password',
        verificationToken: expect.any(String),
      }),
    );
    expect(mail.sendVerifyEmailTemplete).toHaveBeenCalledWith(
      registerDto.email,
      expect.stringMatching(/^https:\/\/api\.example\.com\/api\/users\/verify-email\/1\//),
    );
    expect(jwt.signAsync).toHaveBeenCalledWith({ id: 1, userType: UserType.NORMaL_USER });
  });

  it('rejects registering an address that already exists', async () => {
    repository.findOne.mockResolvedValue(user());

    await expect(provider.register(registerDto)).rejects.toThrow(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
    expect(mail.sendVerifyEmailTemplete).not.toHaveBeenCalled();
  });

  it('rejects login with an unknown email or invalid password', async () => {
    await expect(provider.login({ email: registerDto.email, password: 'password' })).rejects.toThrow(
      'invalid email or password',
    );

    repository.findOne.mockResolvedValue(user({ password: await bcrypt.hash('different-password', 4) }));
    await expect(provider.login({ email: registerDto.email, password: 'password' })).rejects.toThrow(
      'invalid email or password',
    );
  });

  it('resends verification for an unverified account, including a newly generated token', async () => {
    const unverified = user({
      verificationToken: null,
      password: await bcrypt.hash('password', 4),
    });
    repository.findOne.mockResolvedValue(unverified);

    await expect(provider.login({ email: registerDto.email, password: 'password' })).resolves.toEqual({
      message: 'verification token has been send to your email, please verify your email address',
    });
    expect(repository.save).toHaveBeenCalledWith(unverified);
    expect(unverified.verificationToken).toEqual(expect.any(String));
    expect(mail.sendVerifyEmailTemplete).toHaveBeenCalledWith(
      registerDto.email,
      expect.stringContaining('/api/users/verify-email/1/'),
    );
  });

  it('returns an access token for a verified account', async () => {
    repository.findOne.mockResolvedValue(
      user({
        isAccountVerified: true,
        password: await bcrypt.hash('password', 4),
      }),
    );

    await expect(provider.login({ email: registerDto.email, password: 'password' })).resolves.toEqual({
      accessToken: 'signed-token',
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({ id: 1, userType: UserType.NORMaL_USER });
  });

  it('sends a reset link for an existing user and rejects an unknown address', async () => {
    await expect(provider.sendResetPasswordLink(registerDto.email)).rejects.toThrow(
      'invalid email or password',
    );

    const account = user();
    repository.findOne.mockResolvedValue(account);
    await expect(provider.sendResetPasswordLink(registerDto.email)).resolves.toEqual({
      message: 'password reset link sent to your email, please check your inbox ',
    });
    expect(account.resetPasswordToken).toEqual(expect.any(String));
    expect(mail.sendResetPassTemplete).toHaveBeenCalledWith(
      registerDto.email,
      expect.stringMatching(/^https:\/\/client\.example\.com\/reset-password\/1\//),
    );
  });

  it('validates a reset link only when the persisted token matches', async () => {
    await expect(provider.getResetPasswordLink(1, 'reset-token')).rejects.toThrow('invalid link');

    repository.findOne.mockResolvedValue(user({ resetPasswordToken: null }));
    await expect(provider.getResetPasswordLink(1, 'reset-token')).rejects.toThrow('invalid link');

    repository.findOne.mockResolvedValue(user({ resetPasswordToken: 'different-token' }));
    await expect(provider.getResetPasswordLink(1, 'reset-token')).rejects.toThrow('invalid link');

    repository.findOne.mockResolvedValue(user({ resetPasswordToken: 'reset-token' }));
    await expect(provider.getResetPasswordLink(1, 'reset-token')).resolves.toEqual({ message: 'valid link' });
  });

  it('resets a password, clears the token, and rejects invalid reset links', async () => {
    const resetDto = { userId: 1, resetPasswordToken: 'reset-token', newPassword: 'new-password' };
    await expect(provider.resetPassword(resetDto)).rejects.toThrow('invalid link');

    const account = user({ resetPasswordToken: 'reset-token' });
    repository.findOne.mockResolvedValue(account);
    vi.spyOn(provider, 'hashPassword').mockResolvedValue('new-password-hash');
    await expect(provider.resetPassword(resetDto)).resolves.toEqual({
      message: 'password reset success, please login ',
    });
    expect(account).toMatchObject({ password: 'new-password-hash', resetPasswordToken: null });
    expect(repository.save).toHaveBeenCalledWith(account);
  });

  it('hashes passwords with bcrypt', async () => {
    const hash = await provider.hashPassword('password');
    await expect(bcrypt.compare('password', hash)).resolves.toBe(true);
  });
});
