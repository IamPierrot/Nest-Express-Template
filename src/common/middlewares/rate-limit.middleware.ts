import {
    Global,
    Injectable,
    NestMiddleware,
    Scope,
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppLoggerService } from 'src/common/services/app-logger.service';

export interface RateLimitOptions {
    limit: number;
    windowMs: number;
}

export const RATE_LIMIT_OPTIONS = 'RATE_LIMIT_OPTIONS';

@Global()
@Injectable({
    scope: Scope.REQUEST,
    durable: true,
})
export class RateLimitMiddleware implements NestMiddleware {
    private readonly rateCounter = new Map<
        string,
        { count: number; lastRequest: number }
    >();
    private readonly limit: number;
    private readonly windowMs: number;

    constructor(
        @Inject(AppLoggerService)
        private readonly loggerService: AppLoggerService,
        @Inject(RATE_LIMIT_OPTIONS) private readonly options: RateLimitOptions,
    ) {
        this.limit = options.limit;
        this.windowMs = options.windowMs;
    }

    use(req: Request, res: Response, next: NextFunction) {
        const ip = req.ip || req.socket.remoteAddress;
        if (!ip) {
            throw new HttpException(
                'Cannot determine IP address',
                HttpStatus.BAD_REQUEST,
            );
        }

        const now = Date.now();
        const requestLog = this.rateCounter.get(ip);

        if (!requestLog || now - requestLog.lastRequest > this.windowMs) {
            this.rateCounter.set(ip, { count: 1, lastRequest: now });
        } else {
            requestLog.count++;
            requestLog.lastRequest = now;
            this.rateCounter.set(ip, requestLog);

            if (requestLog.count > this.limit) {
                this.loggerService
                    .getLogger('RateLimit')
                    .warn(`Rate limit exceeded for IP ${ip}`);
                throw new HttpException(
                    'Too many requests, please try again later.',
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }
        }
        next();
    }
}
