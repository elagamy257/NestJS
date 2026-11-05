import { config } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { Product } from '../products/product.entity.js';
import { Review } from '../reviews/review.entity.js';
import { User } from '../users/user.entity.js';

// Only load .env file when running CLI migrations locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  config({ path: '.env' });
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Product, Review],
  migrations: ['dist/migrations/*.js'],
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
};

export default new DataSource(dataSourceOptions);
