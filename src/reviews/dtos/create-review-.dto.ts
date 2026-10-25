import { IsString, IsNumber, Min, MinLength, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @MinLength(2)
  comment: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}