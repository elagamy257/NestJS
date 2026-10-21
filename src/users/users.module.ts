import { forwardRef, Module } from "@nestjs/common";
import { UsersControllers } from "./products.controller.js";
import { UsersService } from "./users.service.js";
import { ProductsModules } from "../products/products.module.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity.js";

@Module({
  controllers: [UsersControllers],
  providers: [UsersService],
  exports: [UsersService],
  imports: [forwardRef(()=> ProductsModules), TypeOrmModule.forFeature([User])]
})
export class UsersModules { }