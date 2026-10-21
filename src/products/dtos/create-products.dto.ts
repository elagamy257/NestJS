import { IsString, IsNumber, IsNotEmpty, Min, Length } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'price should be positive num' })
  price: number;
}