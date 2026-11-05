import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import type { Response } from "express";
import { FilesUploadDto } from "./dtos/files-upload.dto.js";

@Controller("api/uploads")
export class UploadsController {

  // POST: ~/api/uploads
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file provided");
    // In serverless (memoryStorage) the file is in file.buffer — no filename on disk
    return {
      message: "File uploaded successfully",
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  // POST: ~/api/uploads/multiple-files
  @Post('multiple-files')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: FilesUploadDto, description: 'upload multiple images' })
  uploadMultiFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) throw new BadRequestException("No file provided");
    return {
      message: "Files uploaded successfully",
      count: files.length,
      files: files.map((f) => ({ originalname: f.originalname, size: f.size })),
    };
  }

  // GET: ~/api/uploads/:image
  // NOTE: This endpoint serves files from disk and will NOT work in serverless
  // deployments (Vercel). Use a cloud storage service (e.g. Cloudinary, S3)
  // for persistent file serving in production.
  @Get(":image")
  showUploadedImage(@Param("image") image: string, @Res() res: Response) {
    return res.status(501).json({
      message:
        "File serving from disk is not supported in serverless deployments. Use a cloud storage provider.",
    });
  }
}
