import { Controller, Get } from "@nestjs/common";
import { ReviewsService } from "./reviews.service.js";

@Controller("api/reviews")
export class ReviewsControllers {
  constructor(private readonly reviewsService: ReviewsService) { }

  // GET:  ~/api/reviews
  @Get()
  getAllReviews() {
    return this.reviewsService.getAll();
  }
}