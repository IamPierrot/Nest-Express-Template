import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Global,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ResponseFormatted } from 'src/types';
import { AppLoggerService } from '../services/app-logger.service';
import { Request } from 'express';

@Global()
@Injectable()
export default class FormatResponseInterceptor<T>
    implements NestInterceptor<T, ResponseFormatted<T>>
{
    constructor(private loggerService: AppLoggerService) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<ResponseFormatted<T>> {
        const response = context.switchToHttp().getResponse() satisfies Request;

        return next.handle().pipe(
            map((data: T) => {
                const statusCode = response.statusCode;
                return {
                    status: true,
                    statusCode,
                    data,
                };
            }),
            catchError((error) => {
                const statusCode = response.statusCode || error.status || 500;
                this.loggerService.getLogger('Response').error(error);

                return throwError(() => ({
                    status: false,
                    statusCode,
                    error:
                        error.response ||
                        error.message ||
                        'Internal Server Error',
                }));
            }),
        );
    }
}
