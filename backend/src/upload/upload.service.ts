import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from '@aws-sdk/client-s3';
import type {
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  ListObjectsV2CommandInput,
} from '@aws-sdk/client-s3';
import { UploadResponseDto, MultipleUploadResponseDto } from './dto';

@Injectable()
export class UploadService {
  private s3: S3;
  private bucketName: string;
  private endpoint: string;
  private enabled = false;   // <-- new flag

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('DO_SPACES_KEY');
    const secretAccessKey = this.configService.get<string>('DO_SPACES_SECRET');
    const endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT');
    const bucketName = this.configService.get<string>('DO_SPACES_BUCKET');
    const region = this.configService.get<string>('DO_SPACES_REGION');

    if (!accessKeyId || !secretAccessKey || !endpoint || !bucketName || !region) {
      console.warn('⚠️  DigitalOcean Spaces not configured – file uploads will be disabled.');
      this.enabled = false;
      return;
    }

    this.endpoint = endpoint;
    this.bucketName = bucketName;
    this.enabled = true;

    this.s3 = new S3({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: false,
    });
  }

  async uploadSingle(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadResponseDto> {
    if (!this.enabled) {
      throw new ServiceUnavailableException('File upload is currently unavailable – DigitalOcean Spaces not configured.');
    }
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      this.validateFile(file);

      const key = this.generateKey(file.originalname, folder);
      const url = await this.uploadToSpaces(file, key);

      return {
        key,
        url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<MultipleUploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) => this.uploadSingle(file, folder));
    const uploadResults = await Promise.all(uploadPromises);

    const totalSize = uploadResults.reduce(
      (sum, result) => sum + result.size,
      0,
    );

    return {
      files: uploadResults,
      totalFiles: uploadResults.length,
      totalSize,
    };
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const params: DeleteObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3.deleteObject(params);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async testConnection(): Promise<void> {
    try {
      const params: ListObjectsV2CommandInput = {
        Bucket: this.bucketName,
        MaxKeys: 1,
      };

      await this.s3.listObjectsV2(params);
    } catch (error) {
      console.error('Connection test failed:', error);
      throw new InternalServerErrorException(
        `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async uploadToSpaces(
    file: Express.Multer.File,
    key: string,
  ): Promise<string> {
    try {
      const params: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      await this.s3.putObject(params);

      // Construct the public URL
      return `${this.endpoint}/${this.bucketName}/${key}`;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private generateKey(originalName: string, folder?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');

    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedBaseName}_${timestamp}_${randomString}.${extension}`;

    return folder ? `${folder}/${fileName}` : fileName;
  }

  private validateFile(file: Express.Multer.File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }
  }
}
