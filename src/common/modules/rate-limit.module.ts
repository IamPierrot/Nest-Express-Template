import { Module } from '@nestjs/common';
import {
    RateLimitMiddleware,
    RATE_LIMIT_OPTIONS,
} from '../middlewares/rate-limit.middleware';
import { RateLimitService } from '../services/rate-limit.service';
import { AppLoggerModule } from './app-logger.module';

@Module({
    imports: [AppLoggerModule],
    providers: [
        RateLimitMiddleware,
        RateLimitService,
        {
            provide: RATE_LIMIT_OPTIONS,
            useValue: { limit: 50, windowMs: 60000 },
        },
    ],
    exports: [
        RateLimitMiddleware,
        RateLimitService,
        {
            provide: RATE_LIMIT_OPTIONS,
            useValue: { limit: 50, windowMs: 60000 },
        },
    ],
})
export class RateLimitModule {}
