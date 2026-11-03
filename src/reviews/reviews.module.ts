import { Module } from "@nestjs/common";
import { ReviewsControllers } from "./reviews.controller.js";
import { ReviewsService } from "./reviews.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./review.entity.js";
import { ProductsModules } from "../products/products.module.js";
import { UsersModules } from "../users/users.module.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [ReviewsControllers],
  providers: [ReviewsService],
  imports: [
    TypeOrmModule.forFeature([Review]),
    ProductsModules,
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
  ]
})
export class ReviewsModules { }
