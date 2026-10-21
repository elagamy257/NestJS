import { forwardRef, Module } from "@nestjs/common";
import { ProductsControllers } from "./products.controller.js";
import { ProductsService } from "./products.service.js";
import { UsersModules } from "../users/users.module.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product.entity.js";

@Module ({
  controllers: [ProductsControllers],
  providers: [ProductsService],
  exports: [ProductsService],
  imports: [
    forwardRef(()=>UsersModules),
    TypeOrmModule.forFeature([Product])
  ],
})
export class ProductsModules {}