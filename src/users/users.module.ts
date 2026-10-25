import { Module } from "@nestjs/common";
import { UsersControllers } from "./users.controller.js";
import { UsersService } from "./users.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthProvider } from "./auth.provider.js";

@Module({
  controllers: [UsersControllers],
  providers: [UsersService, AuthProvider],
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>("JWT_SECRET"),
          signOptions: {
            expiresIn: (config.get<string>("JWT_EXPIRES_IN") ?? '1d') as any,
          },
        };
      },
    }),
  ],
})
export class UsersModules { }
