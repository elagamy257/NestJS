import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "./review.entity.js";
import { Repository } from "typeorm";
import { ProductsService } from "../products/products.service.js";
import { UsersService } from "../users/users.service.js";
import { CreateReviewDto } from "./dtos/create-review-.dto.js";
import { UpdateReviewDto } from "./dtos/update-review-.dto.js";
import { JWTPayloadType } from "../utils/type.js";
import { UserType } from "../utils/enums.js";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService
  ) { }

  /**
   * create new review
   * @param productId id of the product
   * @param userId id of the user that create review
   * @param dto data for creating new review
   * @returns the created review from db
   */
  async createReview(productId: number, userId: number, dto: CreateReviewDto) {
    const product = await this.productsService.getOneBy(productId);
    const user = await this.usersService.getCurrentUser(userId);

    const revew = await this.reviewsRepository.create({ ...dto, user, product });
    const result = await this.reviewsRepository.save(revew);

    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      createdAt: result.createdAt,
      userId: user.id,
      productId: product.id,
    }

  }

  /**
  * get All Reviews
  * @param pageNumber num of the current page
  * @param reviewPerPage data per page
  * @returns collections of reviews
  */
  getAll(pageNumber: number, reviewPerPage: number) {
    return this.reviewsRepository.find({
      skip: reviewPerPage * ( pageNumber -1),
      take: 3,
      order: { createdAt: "ASC" } });

  }


  /**
   * Update Review
   * @param reviewId for the review
   * @param userId for the user
   * @param dto data for the updating review
   * @returns updated review 
  */
  async Update(reviewId: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.getOneBy(reviewId);
    if (review.user.id !== userId) {
      throw new ForbiddenException("access denied, U are not allowed")
    }
    review.rating = dto.rating ?? review.rating;
    review.comment = dto.comment ?? review.comment;

    return this.reviewsRepository.save(review);
  }

  /**
   * Delete review
   * @param reviewId for the review
   * @param payload JWTPayload
   * @returns successs message 
  */
  async Delete(reviewId: number, payload: JWTPayloadType) {
    const review = await this.getOneBy(reviewId);

    if (review.user.id === payload.id || payload.userType === UserType.ADMIN) {
      await this.reviewsRepository.remove(review);
      return { message: 'review deleted' };
    }
    throw new ForbiddenException("U are not allowed");
  }

  /**
  * Get review By Id
  * @param id for the review
  * @returns review from the db
  */
  async getOneBy(id: number) {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('review not found');
    return review;
  }
}