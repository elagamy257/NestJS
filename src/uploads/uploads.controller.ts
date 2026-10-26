import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import type { Response } from "express";

@Controller("api/uploads")
export class UploadsController {

  // POST: ~/api/uploads
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './images',
      filename: (_req, file, cb) => {
        const prefix = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
        const filename = `${prefix}-${file.originalname}`;
        cb(null, filename);
      }
    }),
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Unsupported file format'), false);
      }
    },
    limits: { fileSize: 1024 * 1024 * 2 } // 2 MB
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file provided");
    return { message: "File uploaded successfully", filename: file.filename };
  }

  // GET: ~/api/uploads/:image
  @Get(":image")
  showUploadedImage(@Param("image") image: string, @Res() res: Response) {
    return res.sendFile(image, { root: 'images' });
  }
}
