import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/enums/roles.enum';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'images');

mkdirSync(UPLOADS_DIR, { recursive: true });

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role(Roles.Creator, Roles.Admin)
export class UploadsController {
  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, callback) => {
          const safeExt = extname(file.originalname) || '.png';
          callback(null, `${randomUUID()}${safeExt}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new BadRequestException('Only image uploads are allowed'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return {
      url: `/uploads/images/${file.filename}`,
      filename: file.filename,
      size: file.size,
    };
  }
}
