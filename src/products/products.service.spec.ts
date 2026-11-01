import { Test, TestingModule } from "@nestjs/testing"
import { ProductsService } from "./products.service.js"
import { UsersService } from "../users/users.service.js"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Product } from "./product.entity.js"
import { Repository } from "typeorm"
import { CreateProductDto } from "./dtos/create-products.dto.js"
import { vi } from 'vitest';
type ProductsTestType = { id: number, title: string, price: number }
type Options = { where: { title?: string, minPrice?: number, maxPrice?: number } }
type FindOneParam = { where: { id: number } }

describe('ProductsService', () => {
  let productsService: ProductsService
  let productsRepository: Repository<Product>
  const Repository_Token = getRepositoryToken(Product)
  const createProductDto: CreateProductDto = {
    title: "book",
    description: "this is a book ",
    price: 100
  }

  let products: ProductsTestType[];

  beforeEach(async () => {
    products = [
      { id: 1, title: 'p1', price: 10 },
      { id: 2, title: 'p1', price: 10 },
      { id: 3, title: 'p1', price: 10 },
      { id: 4, title: 'p1', price: 10 }
    ]
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
            save: vi.fn((dto: CreateProductDto) => Promise.resolve({ ...dto, id: 10 })),
            find: vi.fn((options?: Options) => {
              if (options?.where.title) return Promise.resolve([products[0], products[1]]);
              return Promise.resolve(products);
            }),
            findOne: vi.fn((param: FindOneParam) => Promise.resolve(products.find(p => p.id === param.where.id))),
            remove: vi.fn((product: Product) => {
              const index = products.indexOf(product)
              if (index !== -1) return Promise.resolve(products.splice(index, 1));
            })
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

  //create new product tests
  describe('createProduct()', () => {
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

  // get all products
  describe('getAll()', () => {
    it("should call 'find' method in product Repository", async () => {
      await productsService.getAll();
      expect(productsRepository.find).toHaveBeenCalled();
      expect(productsRepository.find).toHaveBeenCalledTimes(1);
    })

    it("should return 2 products if an argument pass ", async () => {
      const data = await productsService.getAll("book");
      expect(data).toHaveLength(2);
    })

    it("should return all products if no argument pass ", async () => {
      const data = await productsService.getAll();
      expect(data).toHaveLength(4);
      expect(data).toBe(products);
    })


  })

  // get single product by id
  describe('getOneBy()', () => {
    it("should call 'find' method in product Repository", async () => {
      await productsService.getOneBy(1);
      expect(productsRepository.findOne).toHaveBeenCalled();
      expect(productsRepository.findOne).toHaveBeenCalledTimes(1);
    })

    it("should return a products with the given id ", async () => {
      const product = await productsService.getOneBy(1);
      expect(product).toMatchObject(products[0]);
    })

    it("should throw NotFoundException if product was not found", async () => {
      await expect(productsService.getOneBy(20))
        .rejects
        .toThrow("Product not found");
    });

  })

  // update product
  describe('update()', () => {
    const title = "product updated ";

    it("should call 'save' method in product Repository and update the product", async () => {
      const result = await productsService.update(1, { title });
      expect(productsRepository.save).toHaveBeenCalled();
      expect(productsRepository.save).toHaveBeenCalledTimes(1);
      expect(result.title).toBe(title)
    })

    it("should throw NotFoundException if product was not found", async () => {
      expect.assertions(1);
      await expect(productsService.update(20, { title }))
        .rejects
        .toThrow("Product not found");
    });

  })

  // delete product
  describe('delete()', () => {
    it("should call 'remove' method in product Repository", async () => {
      await productsService.delete(1);
      expect(productsRepository.remove).toHaveBeenCalled();
      expect(productsRepository.remove).toHaveBeenCalledTimes(1);
    })

    it("should remove a product and success message", async () => {
      const result = await productsService.delete(1);
      expect(result).toMatchObject({ message: 'product deleted' });
    })

    it("should throw NotFoundException if product was not found", async () => {
      expect.assertions(1);
      await expect(productsService.delete(20))
        .rejects
        .toThrow("Product not found");
    });

  })

})