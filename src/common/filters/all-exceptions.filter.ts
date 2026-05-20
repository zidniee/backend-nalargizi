import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: Array<{ field?: string; message: string }> = [];

    // Handle Prisma known request errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          const target = (exception.meta?.target as string[]) || [];
          message = `Duplicate entry for field(s): ${target.join(', ')}`;
          errors = target.map((field) => ({
            field,
            message: `Value for '${field}' already exists`,
          }));
          break;
        }
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          const fieldName = (exception.meta?.field_name as string) || 'unknown';
          message = `Invalid reference: related record not found for '${fieldName}'`;
          errors = [
            {
              field: fieldName,
              message: `Referenced record does not exist`,
            },
          ];
          break;
        }
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Database error: ${exception.code}`;
      }
      this.logger.warn(`Prisma error ${exception.code}: ${exception.message}`);
    }
    // Handle standard NestJS HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || exception.message;

        // Handle class-validator errors (array of messages)
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          errors = (resp.message as string[]).map((msg) => ({
            message: msg,
          }));
        }
      }
    }
    // Handle unknown exceptions
    else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
      message = 'An unexpected error occurred';
    }

    response.status(status).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
    });
  }
}
