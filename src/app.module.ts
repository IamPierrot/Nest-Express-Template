import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import ModuleReflection from './utils/ModuleReflection';
import { RateLimitService } from './common/services/rate-limit.service';
import CommonModule from './common/index.module';
import { RequestLoggerMiddleware } from './common/middlewares/request-logger.middleware';
import AppConfig from './app.config';

/**
 * Main application module
 */
@Module({
    imports: [
        forwardRef(() => CommonModule.register()),
        CacheModule.registerAsync({
            isGlobal: true, // This ensures the module is available globally
            useFactory: () => ({
                store: process.env.REDIS_URL ? 
                    redisStore({ 
                        url: process.env.REDIS_URL,
                        ttl: 60 * 60 // 1 hour default TTL
                    }) : 
                    'memory',
                max: 100, // maximum number of items in cache when using memory store
                ttl: 60 * 60 * 1000, // 1 hour in milliseconds
            }),
        }),
        ...ModuleReflection(),
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    constructor(private readonly rateLimitService: RateLimitService) {}

    configure(consumer: MiddlewareConsumer) {
        if (AppConfig.app.useLogger) {
            consumer.apply(RequestLoggerMiddleware).forRoutes('*');
        }
        
        consumer
            .apply(this.rateLimitService.getMiddleware())
            .exclude('health')
            .forRoutes('*');
    }
}
