import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res) {
        const resObj = res as Record<string, unknown>;
        if (resObj.message !== undefined) {
          message = resObj.message as string | string[];
        } else if ((resObj as any).error) {
          message = String((resObj as any).error);
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }
    } else if (exception && typeof (exception as any).message === 'string') {
      message = (exception as any).message;
    }

    const normalizedMessage = Array.isArray(message)
      ? message.join(', ')
      : message;
    const endpoint = `${request.method}: ${request.route?.path || request.url}`;

    response.status(status).json({
      status,
      message: normalizedMessage,
      endpoint,
    });
  }
}
