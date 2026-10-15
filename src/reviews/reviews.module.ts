import { Module } from "@nestjs/common";
import { ReviewsControllers } from "./products.controller.js";

@Module ({
  controllers: [ReviewsControllers]
})
export class ReviewsModules{}