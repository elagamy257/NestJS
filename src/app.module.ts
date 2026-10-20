import { Module } from '@nestjs/common';
import { ProductsModules } from './products/products.module.js';
import { ReviewsModules } from './reviews/reviews.module.js';
import { UsersModules } from './users/users.module.js';
@Module({
  imports: [ProductsModules, ReviewsModules, UsersModules],

  // exports: [],
  // providers: [],
  // controllers: [],
})
export class AppModule {}
