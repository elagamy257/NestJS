import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
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

}
