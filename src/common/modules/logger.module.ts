import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { RequestLoggerOptions } from '../../types/logger';
import { RequestLoggerMiddleware } from '../middlewares/request-logger.middleware';

/**
 * Global module for logging functionality
 */
@Global()
@Module({
    providers: [RequestLoggerMiddleware],
    exports: [RequestLoggerMiddleware],
})
export class LoggerModule {
    /**
     * Register the LoggerModule with custom options
     * @param options Configuration options for the request logger
     * @returns A configured logger module
     */
    static register(options?: RequestLoggerOptions): DynamicModule {
        const optionsProvider: Provider = {
            provide: 'REQUEST_LOGGER_OPTIONS',
            useValue: options || {},
        };

        return {
            module: LoggerModule,
            providers: [optionsProvider, RequestLoggerMiddleware],
            exports: [RequestLoggerMiddleware],
        };
    }
}
