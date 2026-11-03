import { config } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { Product } from '../products/product.entity';
import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';

config({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Product, Review],
  migrations: ['dist/migrations/*.js'],
};

export default new DataSource(dataSourceOptions);
