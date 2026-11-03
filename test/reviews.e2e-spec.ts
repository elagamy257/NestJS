import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import request from 'supertest';
import { Product } from '../src/products/product.entity.js';
import { Review } from '../src/reviews/review.entity.js';
import { User } from '../src/users/user.entity.js';
import { UserType } from '../src/utils/enums.js';
import {
  clearDatabase,
  createAccessToken,
  createE2eContext,
  createUser,
} from './e2e-test-utils.js';

describe('ReviewsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let admin: User;
  let author: User;
  let otherUser: User;
  let adminToken: string;
  let authorToken: string;
  let otherUserToken: string;
  let product: Product;

  beforeEach(async () => {
    ({ app, dataSource } = await createE2eContext());
    await clearDatabase(dataSource);

    admin = await createUser(dataSource, {
      email: 'admin@example.com',
      username: 'admin',
      userType: UserType.ADMIN,
    });
    author = await createUser(dataSource, {
      email: 'author@example.com',
      username: 'author',
    });
    otherUser = await createUser(dataSource, {
      email: 'other@example.com',
      username: 'other',
    });
    product = await dataSource.getRepository(Product).save({
      title: 'book',
      description: 'A useful book',
      price: 10,
      user: admin,
    });
    adminToken = await createAccessToken(app, admin);
    authorToken = await createAccessToken(app, author);
    otherUserToken = await createAccessToken(app, otherUser);
  });

  afterEach(async () => {
    await clearDatabase(dataSource);
    await app.close();
  });

  async function saveReview(user = author, rating = 4): Promise<Review> {
    return dataSource.getRepository(Review).save({
      comment: 'Helpful review',
      rating,
      user,
      product,
    });
  }

  describe('GET /api/reviews', () => {
    it('returns a paginated collection to an admin', async () => {
      await saveReview(author, 5);
      await saveReview(otherUser, 4);
      await saveReview(admin, 3);

      const response = await request(app.getHttpServer())
        .get('/api/reviews?pageNumber=1&reviewPerPage=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('rejects a normal user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reviews?pageNumber=1&reviewPerPage=2')
        .set('Authorization', `Bearer ${authorToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/reviews/:productId', () => {
    it('creates a review for an authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/reviews/${product.id}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ comment: 'Excellent', rating: 5 });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        comment: 'Excellent',
        rating: 5,
        userId: author.id,
        productId: product.id,
      });
    });

    it('validates the review payload and requires credentials', async () => {
      const invalid = await request(app.getHttpServer())
        .post(`/api/reviews/${product.id}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ comment: 'x', rating: 6 });
      const missingToken = await request(app.getHttpServer())
        .post(`/api/reviews/${product.id}`)
        .send({ comment: 'Excellent', rating: 5 });

      expect(invalid.status).toBe(400);
      expect(missingToken.status).toBe(401);
    });
  });

  describe('GET /api/reviews/:id', () => {
    it('returns a review by id and reports a missing review', async () => {
      const review = await saveReview();

      const found = await request(app.getHttpServer()).get(`/api/reviews/${review.id}`);
      const missing = await request(app.getHttpServer()).get('/api/reviews/999999');

      expect(found.status).toBe(200);
      expect(found.body).toMatchObject({ id: review.id, comment: 'Helpful review' });
      expect(missing.status).toBe(404);
    });
  });

  describe('PUT /api/reviews/:id', () => {
    it('allows the review author to update their review', async () => {
      const review = await saveReview();

      const response = await request(app.getHttpServer())
        .put(`/api/reviews/${review.id}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ comment: 'Updated review', rating: 3 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: review.id,
        comment: 'Updated review',
        rating: 3,
      });
    });

    it('prevents another normal user from updating a review', async () => {
      const review = await saveReview();

      const response = await request(app.getHttpServer())
        .put(`/api/reviews/${review.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ rating: 3 });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('allows an admin to delete any review', async () => {
      const review = await saveReview();

      const response = await request(app.getHttpServer())
        .delete(`/api/reviews/${review.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'review deleted' });
      await expect(dataSource.getRepository(Review).findOneBy({ id: review.id })).resolves.toBeNull();
    });
  });
});
