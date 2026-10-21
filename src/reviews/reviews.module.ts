import { Module } from "@nestjs/common";
import { ReviewsControllers } from "./products.controller.js";
import { ReviewsService } from "./reviews.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./revew.entity.js";

@Module({
  controllers: [ReviewsControllers],
  providers: [ReviewsService],
  imports: [TypeOrmModule.forFeature([Review])]
})
export class ReviewsModules { }