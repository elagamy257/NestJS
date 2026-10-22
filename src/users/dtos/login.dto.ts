import { IsString, IsNotEmpty, IsEmail, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

}
