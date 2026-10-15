 import { Controller, Get } from "@nestjs/common";
import { title } from "process";

@Controller ({})
export class ReviewsControllers{

  // GET:  ~/api/reviews
  @Get("/api/reviews")
  getAllReviews(){
    return [
      { id:1, comment: 'good', rating: 10},
      { id:2, comment: 'good', rating: 100},
      { id:3, comment: 'good', rating: 105},
      { id:4, comment: 'good', rating: 101},
    ]
  }
}