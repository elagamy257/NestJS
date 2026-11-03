import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserType } from '../utils/enums';
import { UsersControllers } from './users.controller';
import { UsersService } from './users.service';

describe('UsersControllers', () => {
  let controller: UsersControllers;
  let service: Record<string, ReturnType<typeof vi.fn>>;
  const payload = { id: 1, userType: UserType.NORMaL_USER };

  beforeEach(async () => {
    service = {
      register: vi.fn((body) => Promise.resolve({ message: body.email })),
      login: vi.fn(() => Promise.resolve({ accessToken: 'token' })),
      getCurrentUser: vi.fn((id) => Promise.resolve({ id })),
      getAll: vi.fn(() => Promise.resolve([{ id: 1 }])),
      update: vi.fn((id, body) => Promise.resolve({ id, ...body })),
      delete: vi.fn(() => Promise.resolve({ message: 'deleted' })),
      setProfileImage: vi.fn((id, filename) => Promise.resolve({ id, profileImage: filename })),
      removeProfileImage: vi.fn(() => Promise.resolve({ profileImage: null })),
      verifyEmail: vi.fn(() => Promise.resolve({ message: 'verified' })),
      sendResetPassword: vi.fn(() => Promise.resolve({ message: 'sent' })),
      getResetPassword: vi.fn(() => Promise.resolve({ message: 'valid' })),
      resetPassword: vi.fn(() => Promise.resolve({ message: 'reset' })),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersControllers],
      providers: [
        { provide: UsersService, useValue: service },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: Reflector, useValue: {} },
      ],
    }).compile();
    controller = module.get(UsersControllers);
  });

  it('forwards authentication and user retrieval requests', async () => {
    const registration = { email: 'user@example.com', password: 'password', username: 'user' };
    const login = { email: registration.email, password: registration.password };

    await expect(controller.register(registration)).resolves.toEqual({ message: registration.email });
    await expect(controller.login(login)).resolves.toEqual({ accessToken: 'token' });
    await expect(controller.getCurrentUser(payload)).resolves.toEqual({ id: 1 });
    await expect(controller.getAllUsers()).resolves.toEqual([{ id: 1 }]);
    expect(service.register).toHaveBeenCalledWith(registration);
    expect(service.login).toHaveBeenCalledWith(login);
    expect(service.getCurrentUser).toHaveBeenCalledWith(1);
    expect(service.getAll).toHaveBeenCalledOnce();
  });

  it('forwards update and deletion requests with the authenticated user', async () => {
    await expect(controller.updaetUser(payload, { username: 'updated' })).resolves.toEqual({
      id: 1,
      username: 'updated',
    });
    await expect(controller.deleteUser(2, payload)).resolves.toEqual({ message: 'deleted' });
    expect(service.update).toHaveBeenCalledWith(1, { username: 'updated' });
    expect(service.delete).toHaveBeenCalledWith(2, payload);
  });

  it('uploads a profile image and rejects a missing upload', async () => {
    const file = { filename: 'avatar.png' } as Express.Multer.File;
    await expect(controller.uploadProfileImage(file, payload)).resolves.toEqual({
      id: 1,
      profileImage: 'avatar.png',
    });
    expect(service.setProfileImage).toHaveBeenCalledWith(1, 'avatar.png');
    expect(() => controller.uploadProfileImage(undefined as never, payload)).toThrow(BadRequestException);
  });

  it('forwards image, verification, and password-reset endpoints', async () => {
    const response = { sendFile: vi.fn() };
    const resetDto = { userId: 1, resetPasswordToken: 'reset-token', newPassword: 'new-password' };

    await expect(controller.removeProfileImage(payload)).resolves.toEqual({ profileImage: null });
    expect(controller.showProfileImage('avatar.png', response as never)).toBeUndefined();
    await expect(controller.verifyEmail(1, 'verify-token')).resolves.toEqual({ message: 'verified' });
    await expect(controller.forgetPassword({ email: 'user@example.com' })).resolves.toEqual({ message: 'sent' });
    await expect(controller.getResrtPassword(1, 'reset-token')).resolves.toEqual({ message: 'valid' });
    await expect(controller.resrtPassword(resetDto)).resolves.toEqual({ message: 'reset' });
    expect(response.sendFile).toHaveBeenCalledWith('avatar.png', { root: 'images/users' });
    expect(service.removeProfileImage).toHaveBeenCalledWith(1);
    expect(service.verifyEmail).toHaveBeenCalledWith(1, 'verify-token');
    expect(service.sendResetPassword).toHaveBeenCalledWith('user@example.com');
    expect(service.getResetPassword).toHaveBeenCalledWith(1, 'reset-token');
    expect(service.resetPassword).toHaveBeenCalledWith(resetDto);
  });
});
