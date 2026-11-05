import { BadRequestException, Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller.js";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

@Module({
  controllers: [UploadsController],
  imports: [
    MulterModule.register({
      // Use memoryStorage so the app works in serverless environments (Vercel)
      // where the filesystem is read-only. Files are available via buffer.
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file format'), false);
        }
      },
      limits: { fileSize: 1024 * 1024 * 2 }, // 2 MB
    }),
  ],
})
export class UploadsModule {}
