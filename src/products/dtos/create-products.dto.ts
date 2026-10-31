import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Length } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  @ApiProperty({description: "title of the product" })
  title: string;

  @IsString()
  @Length(5, 200)
  @ApiProperty({description: "describtion of the product" })
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({description: "price of the product" })
  @Min(0, { message: 'price should be positive num' })
  price: number;
}