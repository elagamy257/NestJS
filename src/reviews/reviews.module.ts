import { Module } from "@nestjs/common";
import { ReviewsControllers } from "./products.controller.js";
import { ReviewsService } from "./reviews.service.js";

@Module({
  controllers: [ReviewsControllers],
  providers: [ReviewsService]
})
export class ReviewsModules { }