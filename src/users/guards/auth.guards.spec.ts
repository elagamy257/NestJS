import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { UserType } from '../../utils/enums';
import { CURRENT_USER_KEY } from '../../utils/constans';
import { AuthGuard } from './auth.guard';
import { AuthRolesGuard } from './auth.roles.guard';

const contextFor = (request: { headers: { authorization?: string }; user?: unknown }) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => 'handler',
    getClass: () => 'class',
  }) as unknown as ExecutionContext;

describe('AuthGuard', () => {
  it('attaches a verified JWT payload to the request', async () => {
    const request = { headers: { authorization: 'Bearer token' } };
    const jwt = { verifyAsync: vi.fn(() => Promise.resolve({ id: 1, userType: UserType.NORMaL_USER })) };
    const config = { get: vi.fn(() => 'jwt-secret') };
    const guard = new AuthGuard(jwt as never, config as never);

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(jwt.verifyAsync).toHaveBeenCalledWith('token', { secret: 'jwt-secret' });
    expect(request[CURRENT_USER_KEY]).toEqual({ id: 1, userType: UserType.NORMaL_USER });
  });

  it('rejects missing and invalid tokens', async () => {
    const jwt = { verifyAsync: vi.fn(() => Promise.reject(new Error('invalid'))) };
    const guard = new AuthGuard(jwt as never, { get: vi.fn() } as never);

    await expect(guard.canActivate(contextFor({ headers: {} }))).rejects.toThrow('no token provided');
    await expect(
      guard.canActivate(contextFor({ headers: { authorization: 'Bearer invalid' } })),
    ).rejects.toThrow(UnauthorizedException);
  });
});

describe('AuthRolesGuard', () => {
  it('accepts a bearer token when the database user has a required role', async () => {
    const request = { headers: { authorization: 'Bearer token' } };
    const jwt = { verifyAsync: vi.fn(() => Promise.resolve({ id: 1, userType: UserType.NORMaL_USER })) };
    const reflector = { getAllAndOverride: vi.fn(() => [UserType.NORMaL_USER]) };
    const users = { getCurrentUser: vi.fn(() => Promise.resolve({ id: 1, userType: UserType.NORMaL_USER })) };
    const guard = new AuthRolesGuard(jwt as never, { get: vi.fn(() => 'secret') } as never, reflector as never, users as never);

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request[CURRENT_USER_KEY]).toEqual({ id: 1, userType: UserType.NORMaL_USER });
  });

  it('rejects endpoints without roles, missing tokens, and unauthorized roles', async () => {
    const reflector = { getAllAndOverride: vi.fn(() => []) };
    const jwt = { verifyAsync: vi.fn(() => Promise.resolve({ id: 1, userType: UserType.NORMaL_USER })) };
    const users = { getCurrentUser: vi.fn(() => Promise.resolve({ id: 1, userType: UserType.NORMaL_USER })) };
    const guard = new AuthRolesGuard(jwt as never, { get: vi.fn() } as never, reflector as never, users as never);

    await expect(guard.canActivate(contextFor({ headers: {} }))).resolves.toBe(false);
    reflector.getAllAndOverride.mockReturnValue([UserType.ADMIN]);
    await expect(guard.canActivate(contextFor({ headers: {} }))).rejects.toThrow('no token provided');
    await expect(
      guard.canActivate(contextFor({ headers: { authorization: 'Bearer token' } })),
    ).resolves.toBe(false);
  });
});
