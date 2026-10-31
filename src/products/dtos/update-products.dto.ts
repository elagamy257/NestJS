import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  Length,
  IsOptional,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;

  @IsString()
  @Length(5, 200)
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  @Min(0, { message: 'price should be positive num' })
  price?: number;
}