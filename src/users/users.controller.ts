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
  @Post("auth/login")//201
  @HttpCode(HttpStatus.OK) //200
  login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  // Get:  ~/api/users/auth/current-user
  @Get("current-user")
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser() payload: type.JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }

  // Get:  ~/api/users
  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  getAllUsers() {
    return this.usersService.getAll();
  }

  // Put:  ~/api/users
  @Put()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.NORMaL_USER)
  updaetUser(@CurrentUser() payload: type.JWTPayloadType, @Body() body: UpdateUserDto) {
    return this.usersService.update(payload.id, body);
  }

  // Delete:  ~/api/users/:id
  @Delete(":id")
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.NORMaL_USER)
  deleteUser(@Param("id", ParseIntPipe) id: number, @CurrentUser() payload: type.JWTPayloadType) {
    return this.usersService.delete(id, payload);
  }

  // POST:  ~/api/users/upload-image
  @Post("upload-image")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('user-image'))
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: type.JWTPayloadType
  ) {
    if (!file) throw new BadRequestException("No file provided");
    return this.usersService.setProfileImage(payload.id, file.filename);

  }

  // DELETE:  ~/api/users/images/remove-profile-image
  @Delete("images/remove-profile-image")
  @UseGuards(AuthGuard)
  removeProfileImage(@CurrentUser() payload: type.JWTPayloadType) {
    return this.usersService.removeProfileImage(payload.id);
  }

  // GET:  ~/api/users/images/remove-profile-image
  @Get("images/:image")
  @UseGuards(AuthGuard)
  showProfileImage(@Param('image') image: string, @Res() res: express.Response) {
    return res.sendFile(image, { root: 'images/users' });
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
