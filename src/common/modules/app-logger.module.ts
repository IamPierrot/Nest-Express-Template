import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from '../services/app-logger.service';
import { LoggerModule } from './logger.module';

@Global()
@Module({
    imports: [
        LoggerModule.register({
            logHeaders: false,
            logParams: true,
            excludePaths: ['/health', '/favicon.ico', '/metrics'],
            logBody: process.env.NODE_ENV !== 'production',
        }),
    ],
    providers: [AppLoggerService],
    exports: [AppLoggerService],
})
export class AppLoggerModule {}
