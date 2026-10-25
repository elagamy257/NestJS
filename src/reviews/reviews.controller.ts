import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ReviewsService } from "./reviews.service.js";
import { CurrentUser } from "../users/decorators/current-user-decorator.js";
import { AuthRolesGuard } from "../users/guards/auth.roles.guard.js";
import { Roles } from "../users/decorators/user-role-decorator.js";
import { UserType } from "../utils/enums.js";
import { CreateReviewDto } from "./dtos/create-review-.dto.js";
import * as type from "../utils/type.js";
import { UpdateReviewDto } from "./dtos/update-review-.dto.js";

@Controller("api/reviews")
export class ReviewsControllers {
  constructor(private readonly reviewsService: ReviewsService) { }

  // GET:  ~/api/reviews
  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  getAllReviews(
    @Query('pageNumber') pageNumber: number,
    @Query('reviewPerPage') reviewPerPage: number,
  ) {
    return this.reviewsService.getAll(pageNumber, reviewPerPage);
  }

  // Post:  ~/api/reviews/:productId
  @Post(':productId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.NORMaL_USER)
  createNewReview(
    @Param('productId', ParseIntPipe) ProductId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() payload: type.JWTPayloadType
  ) {
    return this.reviewsService.createReview(ProductId, payload.id, body)
  }

  // GET:  ~/api/review/:id
  @Get(':id')
  getSingleReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getOneBy(id);
  }

  // PUT:  ~/api/reviews/:id
  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.NORMaL_USER)
  UpdateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: type.JWTPayloadType
  ) {
    return this.reviewsService.Update(id, payload.id, body);
  }

  // Delete:  ~/api/reviews/:id
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.NORMaL_USER)
  DeleteProduct(@Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: type.JWTPayloadType) {
    return this.reviewsService.Delete(id, payload);
  }
}