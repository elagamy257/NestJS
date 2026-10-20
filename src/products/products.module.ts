import { Module } from "@nestjs/common";
import { ProductsControllers } from "./products.controller.js";
import { ProductsService } from "./products.service.js";

@Module ({
  controllers: [ProductsControllers],
  providers: [ProductsService]
})
export class ProductsModules {}