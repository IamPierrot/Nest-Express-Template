import { Injectable, Inject } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppLoggerService } from 'src/common/services/app-logger.service';
import {
    RateLimitOptions,
    RATE_LIMIT_OPTIONS,
    RateLimitMiddleware,
} from '../middlewares/rate-limit.middleware';

@Injectable()
export class RateLimitService {
    private middleware: RateLimitMiddleware;

    constructor(
        private readonly logger: AppLoggerService,
        @Inject(RATE_LIMIT_OPTIONS) readonly options: RateLimitOptions,
    ) {
        this.middleware = new RateLimitMiddleware(logger, options);
    }

    getMiddleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            return this.middleware.use(req, res, next);
        };
    }
}
