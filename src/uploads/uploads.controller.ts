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
import type { Response } from "express";

@Controller("api/uploads")
export class UploadsController {

  // POST: ~/api/uploads
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file provided");
    return { message: "File uploaded successfully", filename: file.filename };
  }

  // POST: ~/api/uploads/multiple-files
  @Post('multiple-files')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultiFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) throw new BadRequestException("No file provided");
    return { message: "Files uploaded successfully", count: files.length };
  }

  // GET: ~/api/uploads/:image
  @Get(":image")
  showUploadedImage(@Param("image") image: string, @Res() res: Response) {
    return res.sendFile(image, { root: 'images' });
  }
}
