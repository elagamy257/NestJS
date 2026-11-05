import { BadRequestException, Module } from "@nestjs/common";
import { UsersControllers } from "./users.controller.js";
import { UsersService } from "./users.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthProvider } from "./auth.provider.js";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { MailModule } from "../mail/mail.module.js";

@Module({
  controllers: [UsersControllers],
  providers: [UsersService, AuthProvider],
  exports: [UsersService],
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>("JWT_SECRET"),
          signOptions: { expiresIn: (config.get<string>("JWT_EXPIRES_IN") ?? '1d') as any },
        };
      },
    }),
    // Use memoryStorage so the app works in serverless (Vercel).
    // For persistent profile images, integrate a cloud storage provider (S3/Cloudinary).
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file format'), false);
        }
      },
      limits: { fileSize: 1024 * 1024 * 2 }, // 2 MB
    }),
  ],
})
export class UsersModules {}
