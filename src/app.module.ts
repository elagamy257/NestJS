import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ProductsModules } from './products/products.module.js';
import { ReviewsModules } from './reviews/reviews.module.js';
import { UsersModules } from './users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity.js';
import { Review } from './reviews/revew.entity.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
@Module({
  imports: [
    ProductsModules,
    ReviewsModules,
    UsersModules,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          database: config.get<string>("DB_DATABASE"),
          username: config.get<string>("DB_USERNAME"),
          password: config.get<string>("DB_PASSWORD")?.toString() ?? '',
          port: config.get<number>("DB_PORT"),
          host: 'localhost',
          synchronize: process.env.NODE_ENV !== 'production',
          entities: [Product, User, Review]
        }
      }

    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
    })
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ],

  // exports: [],
  // controllers: [],
})
export class AppModule { }
