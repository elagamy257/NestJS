import { forwardRef, Module } from "@nestjs/common";
import { UsersControllers } from "./products.controller.js";
import { UsersService } from "./users.service.js";
import { ProductsModules } from "../products/products.module.js";

@Module({
  controllers: [UsersControllers],
  providers: [UsersService],
  exports: [UsersService],
  imports: [forwardRef(()=> ProductsModules)]
})
export class UsersModules { }