import { forwardRef, Inject, Injectable } from "@nestjs/common";
import type { ProductsService } from "../products/products.service.js";
import { ProductsService as ProductsServiceRef } from "../products/products.service.js";

@Injectable()
export class UsersService {
 constructor(
  @Inject( forwardRef(() =>ProductsServiceRef))
  private readonly productsService: ProductsService
) { }
  getAll() {
    return [
      { id: 1, email: 'aya@gmail.com' },
      { id: 2, email: 'aya@gmail.com' },
      { id: 3, email: 'aya@gmail.com' },
      { id: 4, email: 'aya@gmail.com' },
    ]
  }
}