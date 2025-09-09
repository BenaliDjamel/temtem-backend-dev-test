import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth/auth.guard';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoresModule } from './stores/stores.module';
import { RolesGuard } from './common/guards/roles.guards';
import { ProductsModule } from './products/products.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: () => {
        const isProd = process.env.NODE_ENV === 'production';
        return {
          pinoHttp: {
            level: isProd ? 'info' : 'debug',
            transport: isProd
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
                    ignore: 'pid,hostname',
                  },
                },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'res.headers["set-cookie"]',
              ],
              remove: true,
            },
            customProps: (req) => ({
              requestId: (req as any).id,
            }),
          },
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test'),
        APP_PORT: Joi.number().port(),
        MONGO_CONTAINER: Joi.string().optional(),
        MONGO_PORT: Joi.number().port(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        SALT_OR_ROUNDS: Joi.number().required(),
        AWS_REGION: Joi.string().optional(),
        AWS_S3_BUCKET: Joi.string().optional(),
        AWS_ACCESS_KEY_ID: Joi.string().optional(),
        AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
      }),
      validationOptions: {
        abortEarly: true,
      },
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UsersModule,
    AuthModule,
    StoresModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    HttpExceptionFilter,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
