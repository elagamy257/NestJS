
import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service.js";
import { UsersService } from "../users/users.service.js";
import { CreateProductDto } from "./dtos/create-products.dto.js";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ProductsControllers } from "./products.controller.js";
import { UserType } from "../utils/enums.js";
import { JWTPayloadType } from "../utils/type.js";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NotFoundException } from "@nestjs/common";
import { UpdateProductDto } from "./dtos/update-products.dto.js";

type ProductsTestType = {
  id: number;
  title: string;
  price: number;
};

describe("ProductsController", () => {
  let productsControllers: ProductsControllers;
  let productsService: ProductsService;
  const currentUser: JWTPayloadType = {
    id: 1,
    userType: UserType.ADMIN,
  };

  const createProductDto: CreateProductDto = {
    title: "book",
    description: "this is a book",
    price: 100,
  };

  let products: ProductsTestType[];

  beforeEach(async () => {
    products = [
      { id: 1, title: "book", price: 10 },
      { id: 2, title: "phone", price: 20 },
      { id: 3, title: "book", price: 30 },
      { id: 4, title: "laptop", price: 90 },
    ];

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsControllers],
      providers: [
        { provide: ConfigService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: JwtService, useValue: {} },
        {
          provide: ProductsService,
          useValue: {
            CreateProduct: vi.fn(
              (dto: CreateProductDto, userId: number) =>
                Promise.resolve({ ...dto, id: 1, userId }),
            ),

            getAll: vi.fn(
              (
                title?: string,
                minPrice?: string,
                maxPrice?: string,
              ) => {
                let result = [...products];

                if (title) {
                  result = result.filter((p) => p.title === title);
                }

                if (minPrice !== undefined && minPrice !== "") {
                  result = result.filter(
                    (p) => p.price >= Number(minPrice),
                  );
                }

                if (maxPrice !== undefined && maxPrice !== "") {
                  result = result.filter(
                    (p) => p.price <= Number(maxPrice),
                  );
                }

                return Promise.resolve(result);
              },
            ),

            getOneBy: vi.fn((id: number) => {
              const product = products.find((p) => p.id === id);

              if (!product) {
                return Promise.reject(
                  new NotFoundException("Product not found"),
                );
              }

              return Promise.resolve(product);
            }),

            update: vi.fn((productId: number, dto: UpdateProductDto) => {
              const product = products.find((p) => p.id === productId);

              if (!product) {
                return Promise.reject(
                  new NotFoundException("Product not found"),
                );
              }

              return Promise.resolve({ ...product, ...dto });
            }),

            delete: vi.fn((productId: number) => {
              const productExists = products.some((p) => p.id === productId);

              if (!productExists) {
                return Promise.reject(
                  new NotFoundException("Product not found"),
                );
              }

              return Promise.resolve(true);
            }),
          },
        },
      ],
    }).compile();

    productsControllers =
      module.get<ProductsControllers>(ProductsControllers);

    productsService = module.get<ProductsService>(ProductsService);
  });

  it("should productsControllers be defined", () => {
    expect(productsControllers).toBeDefined();
  });

  it("should productsService be defined", () => {
    expect(productsService).toBeDefined();
  });

  // Create product tests
  describe("CreateNewProduct()", () => {
    it("should call CreateProduct method in productsService", async () => {
      await productsControllers.CreateNewProduct(
        createProductDto,
        currentUser,
      );

      expect(productsService.CreateProduct).toHaveBeenCalledTimes(1);
      expect(productsService.CreateProduct).toHaveBeenCalledWith(
        createProductDto,
        currentUser.id,
      );
    });

    it("should return the new product with the given data", async () => {
      const result = await productsControllers.CreateNewProduct(
        createProductDto,
        currentUser,
      );

      expect(result).toMatchObject(createProductDto);
      expect(result.id).toBe(1);
    });
  });

  // Get all products tests
  describe("getAllProducts()", () => {
    it("should call getAll method in productsService", async () => {
      const data = await productsControllers.getAllProducts(undefined, undefined, undefined,);
      expect(productsService.getAll).toHaveBeenCalledTimes(1);
    });

    it("should return products based on title", async () => {
      const data = await productsControllers.getAllProducts("book", undefined, undefined);
      expect(data).toHaveLength(2);
      expect(data[0]).toMatchObject({ title: "book" });
      expect(data[1]).toMatchObject({ title: "book" });
    });

    it("should return products based on minPrice and maxPrice", async () => {
      const data = await productsControllers.getAllProducts(
        undefined,
        "10",
        "20",
      );

      expect(data).toHaveLength(2);
      expect(data.every((p) => p.price >= 10 && p.price <= 20)).toBe(
        true,
      );
    });

    it("should return all products if no arguments are passed", async () => {
      const data = await productsControllers.getAllProducts(undefined, undefined, undefined);

      expect(data).toHaveLength(4);
      expect(data).toEqual(products);
    });
  });

  // Get single product by ID tests
  describe("getSingleProduct()", () => {
    it("should call getOneBy method in productsService", async () => {
      await productsControllers.getSingleProducts(2);

      expect(productsService.getOneBy).toHaveBeenCalledTimes(1);
      expect(productsService.getOneBy).toHaveBeenCalledWith(2);
    });

    it("should return the product with the given ID", async () => {
      const product = await productsControllers.getSingleProducts(2);

      expect(product).toMatchObject({
        id: 2,
        title: "phone",
        price: 20,
      });
    });

    it("should throw NotFoundException if product was not found", async () => {
      await expect(
        productsControllers.getSingleProducts(20),
      ).rejects.toThrow("Product not found");
    });
  });

  // Update product tests
  describe("updateProduct()", () => {
    const title = "product updated";

    it("should call update method in productsService", async () => {
      await productsControllers.UpdateProduct(2, { title });

      expect(productsService.update).toHaveBeenCalledTimes(1);
      expect(productsService.update).toHaveBeenCalledWith(2, {
        title,
      });
    });

    it("should throw NotFoundException if product was not found", async () => {
      await expect(
        productsControllers.UpdateProduct(20, { title }),
      ).rejects.toThrow("Product not found");
    });
  });

  // Delete product tests
  describe("deleteProduct()", () => {
    it("should call delete method in productsService", async () => {
      await productsControllers.DeleteProduct(2);

      expect(productsService.delete).toHaveBeenCalledTimes(1);
      expect(productsService.delete).toHaveBeenCalledWith(2);
    });

    it("should throw NotFoundException if product was not found", async () => {
      await expect(
        productsControllers.DeleteProduct(20),
      ).rejects.toThrow("Product not found");
    });
  });
});
