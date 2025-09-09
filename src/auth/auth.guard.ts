import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/constants';
import { IS_PUBLIC_KEY } from '../common/metadata/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private readonly logger: PinoLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const url = request.url || '';

    if (url.startsWith('/docs') || url.startsWith('/docs-json')) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn({ url }, 'Missing bearer token');

      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      request['user'] = payload;
    } catch (err) {
      this.logger.warn({ err, url }, 'Invalid token');

      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
