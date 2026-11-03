import { INestApplication } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CreateProductDto } from "../src/products/dtos/create-products.dto.js";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module.js";
import { Product } from "../src/products/product.entity.js";
import request from "supertest";
import { User } from "../src/users/user.entity.js";
import { UserType } from "../src/utils/enums.js";
import bcrypt from "bcryptjs";


describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let dataSourece: DataSource;
  let productsToSave: CreateProductDto[];
  let accessToken: string;
  let dto: CreateProductDto;

  beforeEach(async () => {
    dto = { title: 'book', description: "about book 1", price: 10 };
    productsToSave = [
      { title: 'book', description: "about book 1", price: 10 },
      { title: 'laptop', description: "laptop ", price: 100 },
      { title: 'CARPET', description: "about book 1", price: 70 },
      { title: 'char', description: "about book 1", price: 20 },
    ]

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    dataSourece = app.get(DataSource);

    // saving a new user (admin) to the db
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    await dataSourece.createQueryBuilder().insert().into(User).values([
      { username: 'admin', email: 'admin@gmail.com', userType: UserType.ADMIN, password: hash, isAccountVerified: true }
    ]).execute();

    // login to admin account and get the token
    const { body } = await request(app.getHttpServer())
      .post('/api/users/auth/login')
      .send({ email: 'admin@gmail.com', password: '123456' })
    accessToken = body.accessToken;
  })

  afterEach(async () => {
    await dataSourece.createQueryBuilder().delete().from(Product).execute();
    await dataSourece.createQueryBuilder().delete().from(User).execute();
    await app.close();
  })

  //GET: ~/api/products
  describe('GET', () => {
    beforeEach(async()=>{
      await dataSourece.createQueryBuilder().insert().into(Product).values(productsToSave).execute();
    })

    it("should return all products from the db", async () => {
      const response = await request(app.getHttpServer()).get("/api/products")
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(4);
    })
    it("should return all products based on title", async () => {
      const response = await request(app.getHttpServer()).get("/api/products?title=book")
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    })
    it("should return all products based minPrice & maxPrice ", async () => {
      const response = await request(app.getHttpServer()).get("/api/products?minPrice=20&maxPrice=100")
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
    })
  })

  //POST: ~/api/products
  describe('POST', () => {
    it("should create a new product and save it to the db", async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body).toMatchObject(dto);
    })

    it("should return 400 status code if title was less than 2 char", async () => {
      dto.title='b';
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)

      expect(response.status).toBe(400);
    });

    it("should return 401 status code if bearer wan not provided", async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send(dto)

      expect(response.status).toBe(401);
    });
  })
})