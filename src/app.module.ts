import { Module } from '@nestjs/common';
import { ProductsModules } from './products/products.module.js';
import { ReviewsModules } from './reviews/reviews.module.js';
import { UsersModules } from './users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity.js';
@Module({
  imports: [
    ProductsModules,
    ReviewsModules,
    UsersModules,
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: 'nestjs-app-dp',
      username: 'postgres',
      password: '2572004',
      port: 5432,
      host: 'localhost',
      synchronize: true, //only in develop
      entities: [Product]

    })
  ],

  // exports: [],
  // providers: [],
  // controllers: [],
})
export class AppModule { }
