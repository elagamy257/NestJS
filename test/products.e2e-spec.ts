import { INestApplication } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CreateProductDto } from "../src/products/dtos/create-products.dto.js";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module.js";
import { Product } from "../src/products/product.entity.js";
import request from "supertest";


describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let dataSourece: DataSource;
  let productsToSave: CreateProductDto[];

  beforeEach(async () => {
    productsToSave = [
      { title: 'book', description: "about book 1", price: 10 },
      { title: 'laptop', description: "laptop ", price: 100 },
      { title: 'CARPET', description: "about book 1", price: 70 },
      { title: 'char', description: "about book 1", price: 20 },
    ]

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();
    await app.init();
    dataSourece = app.get(DataSource);
  })

  afterEach(async () => {
    await dataSourece.createQueryBuilder().delete().from(Product).execute();
    await app.close();
  })

  //GET: ~/api/products
  describe('GET', () => {
    it("should return all products from the db", async () => {
      await dataSourece.createQueryBuilder().insert().into(Product).values(productsToSave).execute();

      const response = await request(app.getHttpServer()).get("/api/products")
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(4);
    })
    it("should return all products based on title", async () => {
      await dataSourece.createQueryBuilder().insert().into(Product).values(productsToSave).execute();

      const response = await request(app.getHttpServer()).get("/api/products?title=book")
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    })
    it("should return all products based minPrice & maxPrice ", async () => {
      await dataSourece.createQueryBuilder().insert().into(Product).values(productsToSave).execute();

      const response = await request(app.getHttpServer()).get("/api/products?minPrice=20&maxPrice=100")
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
    })
  })
})