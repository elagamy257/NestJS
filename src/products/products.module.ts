import { Module } from "@nestjs/common";
import { ProductsControllers } from "./products.controller.js";
import { ProductsService } from "./products.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./product.entity.js";
import { UsersModules } from "../users/users.module.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [ProductsControllers],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product]),
    UsersModules,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1d') as any,
        },
      }),
    }),
  ],
  exports: [ProductsService]
})
export class ProductsModules { }
