import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import request from 'supertest';
import { Product } from '../src/products/product.entity.js';
import { User } from '../src/users/user.entity.js';
import { UserType } from '../src/utils/enums.js';
import {
  clearDatabase,
  createAccessToken,
  createE2eContext,
  createUser,
} from './e2e-test-utils.js';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let admin: User;
  let normalUser: User;
  let adminToken: string;
  let normalUserToken: string;

  const productDto = {
    title: 'Book',
    description: 'A useful book',
    price: 10,
  };

  beforeEach(async () => {
    ({ app, dataSource } = await createE2eContext());
    await clearDatabase(dataSource);

    admin = await createUser(dataSource, {
      email: 'admin@example.com',
      username: 'admin',
      userType: UserType.ADMIN,
    });
    normalUser = await createUser(dataSource, {
      email: 'user@example.com',
      username: 'user',
    });
    adminToken = await createAccessToken(app, admin);
    normalUserToken = await createAccessToken(app, normalUser);
  });

  afterEach(async () => {
    await clearDatabase(dataSource);
    await app.close();
  });

  async function saveProduct(title: string, price: number): Promise<Product> {
    return dataSource.getRepository(Product).save({
      title,
      description: `${title} description`,
      price,
      user: admin,
    });
  }

  describe('GET /api/products', () => {
    it('returns every product and supports title and price filters', async () => {
      await saveProduct('book', 10);
      await saveProduct('laptop', 100);
      await saveProduct('carpet', 70);
      await saveProduct('chair', 20);

      const all = await request(app.getHttpServer()).get('/api/products');
      const byTitle = await request(app.getHttpServer()).get('/api/products?title=book');
      const byPrice = await request(app.getHttpServer()).get(
        '/api/products?minPrice=20&maxPrice=100',
      );

      expect(all.status).toBe(200);
      expect(all.body).toHaveLength(4);
      expect(byTitle.body).toHaveLength(1);
      expect(byTitle.body[0]).toMatchObject({ title: 'book' });
      expect(byPrice.body).toHaveLength(3);
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a product by id', async () => {
      const product = await saveProduct('book', 10);

      const response = await request(app.getHttpServer()).get(`/api/products/${product.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: product.id, title: 'book', price: 10 });
    });

    it('returns 404 for a product that does not exist', async () => {
      const response = await request(app.getHttpServer()).get('/api/products/999999');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    it('creates a product for an authenticated admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productDto);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ ...productDto, title: 'book' });
      expect(response.body.id).toBeDefined();
    });

    it('rejects an invalid payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...productDto, title: 'no' });

      expect(response.status).toBe(400);
    });

    it('rejects missing and non-admin credentials', async () => {
      const missingToken = await request(app.getHttpServer())
        .post('/api/products')
        .send(productDto);
      const normalUser = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send(productDto);

      expect(missingToken.status).toBe(401);
      expect(normalUser.status).toBe(403);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('updates an existing product for an authenticated admin', async () => {
      const product = await saveProduct('book', 10);

      const response = await request(app.getHttpServer())
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'notebook', price: 15 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: product.id,
        title: 'notebook',
        price: 15,
      });
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('deletes an existing product for an authenticated admin', async () => {
      const product = await saveProduct('book', 10);

      const response = await request(app.getHttpServer())
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'product deleted' });
      await expect(dataSource.getRepository(Product).findOneBy({ id: product.id })).resolves.toBeNull();
    });
  });
});
