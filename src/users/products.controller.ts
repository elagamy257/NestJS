import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { RegisterDto } from "./dtos/register.dto.js";
import { LoginDto } from "./dtos/login.dto.js";

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
}
