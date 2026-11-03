import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module.js';
import { MailService } from '../src/mail/mail.service.js';
import { Product } from '../src/products/product.entity.js';
import { Review } from '../src/reviews/review.entity.js';
import { User } from '../src/users/user.entity.js';
import { UserType } from '../src/utils/enums.js';

export type E2eContext = {
  app: INestApplication;
  dataSource: DataSource;
};

export async function createE2eContext(): Promise<E2eContext> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue({
      sendLogEmail: async () => undefined,
      sendVerifyEmailTemplete: async () => undefined,
      sendResetPassTemplete: async () => undefined,
    })
    .compile();

  const app = module.createNestApplication();
  await app.init();

  return { app, dataSource: app.get(DataSource) };
}

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.getRepository(Review).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Product).createQueryBuilder().delete().execute();
  await dataSource.getRepository(User).createQueryBuilder().delete().execute();
}

export async function createUser(
  dataSource: DataSource,
  options: {
    email: string;
    username: string;
    password?: string;
    userType?: UserType;
    isAccountVerified?: boolean;
  },
): Promise<User> {
  const password = options.password ?? 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  return dataSource.getRepository(User).save({
    email: options.email,
    username: options.username,
    password: passwordHash,
    userType: options.userType ?? UserType.NORMaL_USER,
    isAccountVerified: options.isAccountVerified ?? true,
  });
}

export async function createAccessToken(
  app: INestApplication,
  user: User,
): Promise<string> {
  return app
    .get(JwtService)
    .signAsync({ id: user.id, userType: user.userType });
}
