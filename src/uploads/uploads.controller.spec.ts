import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { UploadsController } from './uploads.controller';

describe('UploadsController', () => {
  const controller = new UploadsController();

  it('returns uploaded file details and rejects a missing file', () => {
    expect(controller.uploadFile({ filename: 'photo.png' } as Express.Multer.File)).toEqual({
      message: 'File uploaded successfully',
      filename: 'photo.png',
    });
    expect(() => controller.uploadFile(undefined as never)).toThrow(BadRequestException);
  });

  it('returns a multi-file count and rejects an empty upload', () => {
    const files = [{ filename: 'first.png' }, { filename: 'second.png' }] as Express.Multer.File[];

    expect(controller.uploadMultiFile(files)).toEqual({
      message: 'Files uploaded successfully',
      count: 2,
    });
    expect(() => controller.uploadMultiFile([])).toThrow(BadRequestException);
    expect(() => controller.uploadMultiFile(undefined as never)).toThrow(BadRequestException);
  });

  it('sends requested images from the uploads directory', () => {
    const response = { sendFile: vi.fn(() => 'sent') };

    expect(controller.showUploadedImage('photo.png', response as never)).toBe('sent');
    expect(response.sendFile).toHaveBeenCalledWith('photo.png', { root: 'images' });
  });
});
