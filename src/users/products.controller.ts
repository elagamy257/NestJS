import { Body, Controller, Get, Post } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { RegisterDto } from "./dtos/register.dto.js";

@Controller("api/users")
export class UsersControllers {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  // GET:  ~/api/users
  @Get()
  getAllUsers() {

  }

  // POST:  ~/api/users/auth/register
  @Post("auth/register")
  register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }
}
