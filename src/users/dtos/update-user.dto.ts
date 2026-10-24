import { IsString, IsNotEmpty, Length, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  @Length(2, 150)
  username?: string;
}
