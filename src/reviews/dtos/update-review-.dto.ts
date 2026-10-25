import { IsString, IsNumber, Min, MinLength, Max, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  comment?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;
}