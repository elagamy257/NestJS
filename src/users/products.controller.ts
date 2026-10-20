import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { ProductsService } from "../products/products.service.js";

@Controller("api/users")
export class UsersControllers {
  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService
  ) { }

  // GET:  ~/api/users
  @Get()
  getAllUsers() {
    return this.usersService.getAll();
  }
}