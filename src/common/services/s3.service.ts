import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly awsRegion: string;

  constructor(private readonly configService: ConfigService) {
    this.awsRegion = this.configService.get<string>('AWS_REGION');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');

    if (!this.awsRegion || !this.bucketName) {
      throw new Error(
        'Missing AWS configuration. Please set AWS_REGION and AWS_S3_BUCKET.',
      );
    }

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.s3Client = new S3Client({
      region: this.awsRegion,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    });
  }

  async uploadPublicFile(options: {
    fileBuffer: Buffer;
    contentType: string;
    keyPrefix?: string;
    extension?: string;
  }): Promise<string> {
    const {
      fileBuffer,
      contentType,
      keyPrefix = 'uploads',
      extension,
    } = options;

    const fileExtension =
      extension || this.getExtensionFromContentType(contentType) || 'bin';

    const key = `${keyPrefix}/${randomUUID()}.${fileExtension}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ACL: 'public-read',
        ContentType: contentType,
      }),
    );

    return `https://${this.bucketName}.s3.${this.awsRegion}.amazonaws.com/${key}`;
  }

  private getExtensionFromContentType(contentType: string): string | null {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return map[contentType] || null;
  }
}
