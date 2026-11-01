import { Test, TestingModule } from "@nestjs/testing"
import { ProductsService } from "./products.service.js"
import { UsersService } from "../users/users.service.js"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Product } from "./product.entity.js"
import { Repository } from "typeorm"
import { CreateProductDto } from "./dtos/create-products.dto.js"
import { vi } from 'vitest';

describe('ProductsService', () => {
  let productsService: ProductsService
  let productsRepository: Repository<Product>
  const Repository_Token = getRepositoryToken(Product)
  const createProductDto: CreateProductDto = {
    title: "book",
    description: "this is a book ",
    price: 100
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: UsersService,
          useValue: {
            getCurrentUser: vi.fn((userId: number) => Promise.resolve({ id: userId }))
          }
        },
        {
          provide: Repository_Token,
          useValue: {
            create: vi.fn((dto: CreateProductDto) => dto),
            save: vi.fn((dto: CreateProductDto) => Promise.resolve({ ...dto, id: 10 }))
          }
        }
      ]
    }).compile();

    productsService = module.get<ProductsService>(ProductsService)
    productsRepository = module.get<Repository<Product>>(Repository_Token)
  })

  it("should product service be defined", () => {
    expect(ProductsService).toBeDefined();
  })

  it("should productsRepository be defined", () => {
    expect(productsRepository).toBeDefined();
  })

  describe('createProduct', () => {
    it("should call create method in product Repository", async () => {
      await productsService.CreateProduct(createProductDto, 1);
      expect(productsRepository.create).toHaveBeenCalled();
      expect(productsRepository.create).toHaveBeenCalledTimes(1);
    })
    it("should call save method in product Repository", async () => {
      await productsService.CreateProduct(createProductDto, 1);
      expect(productsRepository.save).toHaveBeenCalled();
      expect(productsRepository.save).toHaveBeenCalledTimes(1);
    })
    it("should create a new product", async () => {
      const result = await productsService.CreateProduct(createProductDto, 1);
      expect(result).toBeDefined();
      expect(result.title).toBe("book");
      expect(result.id).toBe(10);
    })
  })

})