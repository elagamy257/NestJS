import { Module } from "@nestjs/common";
import { ProductsControllers } from "./products.controller.js";
import { ProductsService } from "./products.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product.entity.js";
import { UsersModules } from "../users/users.module.js";
import { JwtModule } from "@nestjs/jwt";

@Module({
  controllers: [ProductsControllers],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product]),
    UsersModules,
    JwtModule
  ],
})
export class ProductsModules { }