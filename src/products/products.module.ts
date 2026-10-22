import { Module } from "@nestjs/common";
import { ProductsControllers } from "./products.controller.js";
import { ProductsService } from "./products.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product.entity.js";

@Module ({
  controllers: [ProductsControllers],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product])
  ],
})
export class ProductsModules {}