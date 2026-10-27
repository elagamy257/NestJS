import { BadRequestException, Module } from "@nestjs/common";
import { UsersControllers } from "./users.controller.js";
import { UsersService } from "./users.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthProvider } from "./auth.provider.js";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";

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
          signOptions: { expiresIn: (config.get<string>("JWT_EXPIRES_IN") ?? '1d') as any, },
        };
      },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './images/users',
        filename: (_req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        }
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file format'), false);
        }
      },
      limits: { fileSize: 1024 * 1024 * 2 } // 2 MB
    })
  ],
})
export class UsersModules { }
