import { Module } from "@nestjs/common";
import { ProductsControllers } from "./products.controller.js";

@Module ({
  controllers: [ProductsControllers]
})
export class ProductsModules {}