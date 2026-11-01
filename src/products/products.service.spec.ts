import { Test, TestingModule } from "@nestjs/testing"
import { ProductsService } from "./products.service.js"
import { UsersService } from "../users/users.service.js"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Product } from "./product.entity.js"

describe('ProductsService', () => {
  let productsService: ProductsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: UsersService, useValue: {} },
        { provide: getRepositoryToken(Product), useValue: {} }
      ]
    }).compile();

    productsService = module.get<ProductsService>(ProductsService)
  })

  it("should product service be defined", () => {
    expect(ProductsService).toBeDefined();
  })
})