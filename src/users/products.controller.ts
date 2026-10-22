import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { RegisterDto } from "./dtos/register.dto.js";
import { LoginDto } from "./dtos/login.dto.js";
import { AuthGuard } from "./guards/auth.guard.js";
import { CurrentUser } from "./decorators/current-user-decorator.js";
import * as type from "../utils/type.js";


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

  // Get:  ~/api/users/auth/me
  @Get("current-user")
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser() payload: type.JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }
}
