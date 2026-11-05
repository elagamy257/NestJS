import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { RegisterDto } from "./dtos/register.dto.js";
import { LoginDto } from "./dtos/login.dto.js";
import { AuthGuard } from "./guards/auth.guard.js";
import { CurrentUser } from "./decorators/current-user-decorator.js";
import * as type from "../utils/type.js";
import { Roles } from "./decorators/user-role-decorator.js";
import { UserType } from "../utils/enums.js";
import { AuthRolesGuard } from "./guards/auth.roles.guard.js";
import { UpdateUserDto } from "./dtos/update-user.dto.js";
import { FileInterceptor } from "@nestjs/platform-express";
import express from "express";
import { ForgetPasswordDto } from "./dtos/forget-password.dto.js";
import { ResetPassDto } from "./dtos/reset-password.dto.js";
import { ApiBody, ApiConsumes, ApiSecurity } from "@nestjs/swagger";
import { ImageUploadDto } from "./dtos/image-upload.dto.js";

@Controller("api/users")
export class UsersControllers {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  // POST:  ~/api/users/auth/register
  @Post("auth/register")
  register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  // POST:  ~/api/users/auth/login
  @Post("auth/login")
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  // GET:  ~/api/users/current-user
  @Get("current-user")
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser() payload: type.JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }

  // GET:  ~/api/users
  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  getAllUsers() {
    return this.usersService.getAll();
  }

  // PUT:  ~/api/users
  @Put()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.NORMaL_USER)
  updaetUser(@CurrentUser() payload: type.JWTPayloadType, @Body() body: UpdateUserDto) {
    return this.usersService.update(payload.id, body);
  }

  // DELETE:  ~/api/users/:id
  @Delete(":id")
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.NORMaL_USER)
  deleteUser(@Param("id", ParseIntPipe) id: number, @CurrentUser() payload: type.JWTPayloadType) {
    return this.usersService.delete(id, payload);
  }

  // POST:  ~/api/users/upload-image
  // NOTE: In serverless environments (Vercel) the file is in memory (buffer).
  // For persistent profile images integrate a cloud storage provider (S3/Cloudinary).
  @Post("upload-image")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('user-image'))
  @ApiSecurity('bearer')
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: ImageUploadDto, description: 'profile image' })
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: type.JWTPayloadType
  ) {
    if (!file) throw new BadRequestException("No file provided");
    // In serverless (memoryStorage) file.filename is undefined — use originalname as identifier
    const imageIdentifier = file.filename ?? file.originalname;
    return this.usersService.setProfileImage(payload.id, imageIdentifier);
  }

  // DELETE:  ~/api/users/images/remove-profile-image
  @Delete("images/remove-profile-image")
  @UseGuards(AuthGuard)
  removeProfileImage(@CurrentUser() payload: type.JWTPayloadType) {
    return this.usersService.removeProfileImage(payload.id);
  }

  // GET:  ~/api/users/images/:image
  // NOTE: Serving files from disk is not supported in serverless (Vercel).
  @Get("images/:image")
  @UseGuards(AuthGuard)
  showProfileImage(@Param('image') _image: string, @Res() res: express.Response) {
    return res.status(501).json({
      message:
        "File serving from disk is not supported in serverless deployments. Use a cloud storage provider.",
    });
  }

  // GET:  ~/api/users/verify-email/:id/:verificationToken
  @Get("verify-email/:id/:verificationToken")
  verifyEmail(
    @Param('id', ParseIntPipe) id: number,
    @Param('verificationToken') verificationToken: string) {
    return this.usersService.verifyEmail(id, verificationToken);
  }

  // POST:  ~/api/users/forget-password
  @Post("forget-password")
  @HttpCode(HttpStatus.OK)
  forgetPassword(@Body() body: ForgetPasswordDto) {
    return this.usersService.sendResetPassword(body.email);
  }

  // GET:  ~/api/users/reset-password/:id/:resetPasswordToken
  @Get("reset-password/:id/:resetPasswordToken")
  getResrtPassword(
    @Param("id", ParseIntPipe) id: number,
    @Param("resetPasswordToken") resetPasswordToken: string
  ) {
    return this.usersService.getResetPassword(id, resetPasswordToken);
  }

  // POST:  ~/api/users/reset-password
  @Post("reset-password")
  resrtPassword(@Body() body: ResetPassDto) {
    return this.usersService.resetPassword(body);
  }
}
