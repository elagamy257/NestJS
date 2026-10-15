import { Module } from '@nestjs/common';
import { ProdutsModules } from './products/products.module.js';
import { ReviewsModules } from './reviews/reviews.module.js';
import { UsersModules } from './users/users.module.js';
@Module({
  imports: [ProdutsModules, ReviewsModules, UsersModules ],

  // exports: [],
  // providers: [],
  // controllers: [],
})
export class AppModule {}
