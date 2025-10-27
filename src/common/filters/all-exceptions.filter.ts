import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Get client IP address
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    
    // Determine HTTP status and error details
    let httpStatus: number;
    let errorMessage: string;
    let errorCode: string;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
        errorCode = exception.constructor.name;
      } else if (typeof exceptionResponse === 'object') {
        errorMessage = (exceptionResponse as any).message || exception.message;
        errorCode = (exceptionResponse as any).error || exception.constructor.name;
      } else {
        errorMessage = exception.message;
        errorCode = exception.constructor.name;
      }
    } else if (exception instanceof Error) {
      // Handle TypeORM and other database errors
      if (exception.name === 'QueryFailedError') {
        httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
        errorMessage = 'Database operation failed';
        errorCode = 'DatabaseError';
      } else if (exception.name === 'EntityNotFoundError') {
        httpStatus = HttpStatus.NOT_FOUND;
        errorMessage = 'Resource not found';
        errorCode = 'NotFoundError';
      } else {
        httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        errorMessage = 'Internal server error';
        errorCode = 'InternalServerError';
      }
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Internal server error';
      errorCode = 'UnknownError';
    }

    // Create response body
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      errorCode,
      message: errorMessage,
    };

    // Log the error
    const logMessage = `${request.method} ${responseBody.path} - ${httpStatus} ${errorCode}: ${errorMessage}`;
    
    if (httpStatus >= 500) {
      // Log as error for server errors
      this.logger.error(
        logMessage,
        'ExceptionFilter',
        ip,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (httpStatus >= 400) {
      // Log as warning for client errors
      this.logger.warn(logMessage, 'ExceptionFilter', ip);
    } else {
      // Log as info for other cases
      this.logger.log(logMessage, 'ExceptionFilter', ip);
    }

    // Send response
    httpAdapter.reply(response, responseBody, httpStatus);
  }
}