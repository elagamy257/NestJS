import { IsString, IsNotEmpty, MinLength, IsNumber, Min } from 'class-validator';

export class ResetPassDto {

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  userId: number;

  @IsString()
  @MinLength(10)
  @IsNotEmpty()
  resetPasswordToken: string;

}
