import { Module } from "@nestjs/common";
import { ReviewsControllers } from "./reviews.controller.js";
import { ReviewsService } from "./reviews.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./review.entity.js";
import { ProductsModules } from "../products/products.module.js";
import { UsersModules } from "../users/users.module.js";
import { JwtModule } from "@nestjs/jwt";

@Module({
  controllers: [ReviewsControllers],
  providers: [ReviewsService],
  imports: [
    TypeOrmModule.forFeature([Review]),
    ProductsModules, UsersModules, JwtModule
  ]
})
export class ReviewsModules { }