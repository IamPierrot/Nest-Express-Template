import {
    DynamicModule,
    Module,
} from '@nestjs/common';
import { RateLimitService } from './services/rate-limit.service';
import { AppLoggerModule } from './modules/app-logger.module';
import { AppLoggerService } from './services/app-logger.service';
import { RateLimitModule } from './modules/rate-limit.module';
import ApiKeyGuard from './guards/api-key.guard';
import FormatResponseInterceptor from './interceptors/response-format.interceptor';
import { RequestLoggerInterceptor } from './interceptors/request-logger.interceptor';

@Module({})
export default class CommonModule {
    private static initialized = false;
    private static moduleRef: DynamicModule;

    static register(): DynamicModule {
        if (this.initialized) {
            return this.moduleRef;
        }

        this.initialized = true;
        this.moduleRef = {
            module: CommonModule,
            imports: [
                AppLoggerModule,
                RateLimitModule,
            ],
            providers: [
                RateLimitService,
                AppLoggerService,
                ApiKeyGuard,
                FormatResponseInterceptor,
                RequestLoggerInterceptor,
            ],
            exports: [
                RateLimitService,
                AppLoggerService,
                ApiKeyGuard,
                AppLoggerModule,
                FormatResponseInterceptor,
                RequestLoggerInterceptor,
            ],
        };

        return this.moduleRef;
    }
}
