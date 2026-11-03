import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserType } from '../utils/enums';
import { AuthProvider } from './auth.provider';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let authProvider: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    hashPassword: ReturnType<typeof vi.fn>;
    sendResetPasswordLink: ReturnType<typeof vi.fn>;
    getResetPasswordLink: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
  };
  let users: User[];

  beforeEach(async () => {
    users = [
      {
        id: 1,
        email: 'member@example.com',
        username: 'member',
        password: 'old-hash',
        userType: UserType.NORMaL_USER,
        isAccountVerified: false,
        verificationToken: 'verify-token',
        resetPasswordToken: null,
        profileImage: null,
      } as User,
      {
        id: 2,
        email: 'admin@example.com',
        username: 'admin',
        password: 'admin-hash',
        userType: UserType.ADMIN,
        isAccountVerified: true,
        verificationToken: null,
        resetPasswordToken: null,
        profileImage: null,
      } as User,
    ];

    repository = {
      findOne: vi.fn(({ where: { id } }: { where: { id: number } }) =>
        Promise.resolve(users.find((user) => user.id === id) ?? null),
      ),
      find: vi.fn(() => Promise.resolve(users)),
      save: vi.fn((user: User) => Promise.resolve(user)),
      remove: vi.fn((user: User) => Promise.resolve(user)),
    };
    authProvider = {
      register: vi.fn((dto) => Promise.resolve({ message: dto.email })),
      login: vi.fn(() => Promise.resolve({ accessToken: 'token' })),
      hashPassword: vi.fn(() => Promise.resolve('new-hash')),
      sendResetPasswordLink: vi.fn(() => Promise.resolve({ message: 'sent' })),
      getResetPasswordLink: vi.fn(() => Promise.resolve({ message: 'valid' })),
      resetPassword: vi.fn(() => Promise.resolve({ message: 'reset' })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
        { provide: AuthProvider, useValue: authProvider },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('delegates registration and login to AuthProvider', async () => {
    const registration = { email: 'new@example.com', password: 'password', username: 'new' };
    const login = { email: registration.email, password: registration.password };

    await expect(service.register(registration)).resolves.toEqual({ message: registration.email });
    await expect(service.login(login)).resolves.toEqual({ accessToken: 'token' });
    expect(authProvider.register).toHaveBeenCalledWith(registration);
    expect(authProvider.login).toHaveBeenCalledWith(login);
  });

  it('gets one current user and rejects an unknown id', async () => {
    await expect(service.getCurrentUser(1)).resolves.toBe(users[0]);
    await expect(service.getCurrentUser(99)).rejects.toThrow(BadRequestException);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('returns all users', async () => {
    await expect(service.getAll()).resolves.toBe(users);
    expect(repository.find).toHaveBeenCalledOnce();
  });

  it('updates supplied user fields and hashes a new password', async () => {
    const result = await service.update(1, { username: 'renamed', password: 'new-password' });

    expect(authProvider.hashPassword).toHaveBeenCalledWith('new-password');
    expect(repository.save).toHaveBeenCalledWith(users[0]);
    expect(result).toMatchObject({ username: 'renamed', password: 'new-hash' });
  });

  it('rejects updating an unknown user', async () => {
    await expect(service.update(99, { username: 'missing' })).rejects.toThrow(NotFoundException);
  });

  it('allows a user to delete itself or an admin to delete another user', async () => {
    await expect(
      service.delete(1, { id: 1, userType: UserType.NORMaL_USER }),
    ).resolves.toEqual({ message: 'User has been deleted' });
    await expect(
      service.delete(1, { id: 2, userType: UserType.ADMIN }),
    ).resolves.toEqual({ message: 'User has been deleted' });
    expect(repository.remove).toHaveBeenCalledTimes(2);
  });

  it('prevents a user from deleting someone else', async () => {
    await expect(
      service.delete(1, { id: 2, userType: UserType.NORMaL_USER }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('sets and removes a profile image', async () => {
    await expect(service.setProfileImage(1, 'avatar.png')).resolves.toMatchObject({
      profileImage: 'avatar.png',
    });
    await expect(service.removeProfileImage(1)).resolves.toMatchObject({ profileImage: null });
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it('rejects removal when the user has no profile image', async () => {
    await expect(service.removeProfileImage(1)).rejects.toThrow(BadRequestException);
  });

  it('verifies an email only when its token matches', async () => {
    await expect(service.verifyEmail(1, 'verify-token')).resolves.toEqual({
      message: 'Your email has been verified, please log in to your account',
    });
    expect(users[0]).toMatchObject({ isAccountVerified: true, verificationToken: null });

    users[0].verificationToken = 'another-token';
    await expect(service.verifyEmail(1, 'wrong-token')).rejects.toThrow(BadRequestException);
    users[0].verificationToken = null;
    await expect(service.verifyEmail(1, 'any-token')).rejects.toThrow(NotFoundException);
  });

  it('delegates all password reset operations to AuthProvider', async () => {
    const resetDto = { userId: 1, resetPasswordToken: 'reset-token', newPassword: 'new-password' };

    await expect(service.sendResetPassword('member@example.com')).resolves.toEqual({ message: 'sent' });
    await expect(service.getResetPassword(1, 'reset-token')).resolves.toEqual({ message: 'valid' });
    await expect(service.resetPassword(resetDto)).resolves.toEqual({ message: 'reset' });
    expect(authProvider.sendResetPasswordLink).toHaveBeenCalledWith('member@example.com');
    expect(authProvider.getResetPasswordLink).toHaveBeenCalledWith(1, 'reset-token');
    expect(authProvider.resetPassword).toHaveBeenCalledWith(resetDto);
  });
});
