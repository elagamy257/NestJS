import { IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class ForgetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;

}
