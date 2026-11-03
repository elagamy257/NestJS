import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import request from 'supertest';
import { User } from '../src/users/user.entity.js';
import { UserType } from '../src/utils/enums.js';
import {
  clearDatabase,
  createAccessToken,
  createE2eContext,
  createUser,
} from './e2e-test-utils.js';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let admin: User;
  let normalUser: User;
  let adminToken: string;
  let normalUserToken: string;

  beforeEach(async () => {
    ({ app, dataSource } = await createE2eContext());
    await clearDatabase(dataSource);

    admin = await createUser(dataSource, {
      email: 'admin@example.com',
      username: 'admin',
      password: 'admin-password',
      userType: UserType.ADMIN,
    });
    normalUser = await createUser(dataSource, {
      email: 'user@example.com',
      username: 'user',
      password: 'user-password',
    });
    adminToken = await createAccessToken(app, admin);
    normalUserToken = await createAccessToken(app, normalUser);
  });

  afterEach(async () => {
    await clearDatabase(dataSource);
    await app.close();
  });

  describe('POST /api/users/auth/register', () => {
    it('registers, verifies, and logs in a new user without using SMTP', async () => {
      const registration = {
        email: 'new-user@example.com',
        username: 'new-user',
        password: 'new-password',
      };

      const registered = await request(app.getHttpServer())
        .post('/api/users/auth/register')
        .send(registration);
      const user = await dataSource.getRepository(User).findOneByOrFail({
        email: registration.email,
      });
      const verified = await request(app.getHttpServer()).get(
        `/api/users/verify-email/${user.id}/${user.verificationToken}`,
      );
      const loggedIn = await request(app.getHttpServer())
        .post('/api/users/auth/login')
        .send({ email: registration.email, password: registration.password });

      expect(registered.status).toBe(201);
      expect(registered.body.message).toContain('verification token');
      expect(verified.status).toBe(200);
      expect(loggedIn.status).toBe(200);
      expect(loggedIn.body.accessToken).toEqual(expect.any(String));
    });

    it('rejects an invalid registration payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/auth/register')
        .send({ email: 'invalid-email', password: 'short' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/users/auth/login', () => {
    it('returns an access token for verified credentials and rejects invalid credentials', async () => {
      const loggedIn = await request(app.getHttpServer())
        .post('/api/users/auth/login')
        .send({ email: normalUser.email, password: 'user-password' });
      const invalid = await request(app.getHttpServer())
        .post('/api/users/auth/login')
        .send({ email: normalUser.email, password: 'wrong-password' });

      expect(loggedIn.status).toBe(200);
      expect(loggedIn.body.accessToken).toEqual(expect.any(String));
      expect(invalid.status).toBe(400);
    });
  });

  describe('GET /api/users/current-user', () => {
    it('returns the authenticated user and requires a bearer token', async () => {
      const authenticated = await request(app.getHttpServer())
        .get('/api/users/current-user')
        .set('Authorization', `Bearer ${normalUserToken}`);
      const unauthenticated = await request(app.getHttpServer()).get('/api/users/current-user');

      expect(authenticated.status).toBe(200);
      expect(authenticated.body).toMatchObject({
        id: normalUser.id,
        email: normalUser.email,
      });
      expect(authenticated.body.password).toBeUndefined();
      expect(unauthenticated.status).toBe(401);
    });
  });

  describe('GET /api/users', () => {
    it('returns all users to an admin and rejects a normal user', async () => {
      const asAdmin = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      const asUser = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(asAdmin.status).toBe(200);
      expect(asAdmin.body).toHaveLength(2);
      expect(asAdmin.body.every((user: User) => user.password === undefined)).toBe(true);
      expect(asUser.status).toBe(403);
    });
  });

  describe('PUT /api/users', () => {
    it('updates the authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/users')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({ username: 'renamed-user' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: normalUser.id, username: 'renamed-user' });
      expect(response.body.password).toBeUndefined();
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('allows a user to delete their own account', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/users/${normalUser.id}`)
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User has been deleted' });
    });

    it('allows an admin to delete another account but rejects another normal user', async () => {
      const otherUser = await createUser(dataSource, {
        email: 'other@example.com',
        username: 'other',
      });
      const otherUserToken = await createAccessToken(app, otherUser);

      const denied = await request(app.getHttpServer())
        .delete(`/api/users/${normalUser.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`);
      const deleted = await request(app.getHttpServer())
        .delete(`/api/users/${normalUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(denied.status).toBe(403);
      expect(deleted.status).toBe(200);
    });
  });
});
