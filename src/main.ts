import { ModuleRef, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
    ValidationPipe,
    INestApplication,
    ConsoleLogger,
} from '@nestjs/common';
import { AppLoggerService } from './common/services/app-logger.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import './types';
import ApiKeyGuard from './common/guards/api-key.guard';
import { config } from 'dotenv';
import AppConfig from './app.config';
import FormatResponseInterceptor from './common/interceptors/response-format.interceptor';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';

async function bootstrap() {
    setUpEnvironment();

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: true,
        logger: new ConsoleLogger({
            prefix: AppConfig.app.consolePrefix,
        }),
    });

    const moduleRef = app.get(ModuleRef);
    const logger = moduleRef.get(AppLoggerService, { strict: false });
    logger.initPerformanceMonitoring();

    if (AppConfig.app.useCors) {
        setupMiddleware(app);
    }

    setupGracefulShutdown(app, logger);

    setupGlobalPipes(app, moduleRef);
    setupGlobalGuards(app, moduleRef);
    setupGlobalInterceptors(app, moduleRef);

    if (AppConfig.app?.API_PREFIX)
        app.setGlobalPrefix(AppConfig.app.API_PREFIX);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.logStartup(+port, process.env.NODE_ENV || 'development');
}

function setupMiddleware(app: INestApplication) {
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
}

function setupGlobalPipes(app: INestApplication, moduleRef: ModuleRef) {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            forbidNonWhitelisted: true,
        }),
    );
}

function setupGlobalGuards(app: INestApplication, moduleRef: ModuleRef) {
    const apiKeyGuard = moduleRef.get(ApiKeyGuard, { strict: false });
    app.useGlobalGuards(apiKeyGuard);
}

function setupGlobalInterceptors(app: INestApplication, moduleRef: ModuleRef) {
    const formatResponseInterceptor = moduleRef.get(FormatResponseInterceptor, {
        strict: false,
    });
    const requestLoggerInterceptor = moduleRef.get(RequestLoggerInterceptor, {
        strict: false,
    });
    app.useGlobalInterceptors(formatResponseInterceptor, requestLoggerInterceptor);
}

function setupGracefulShutdown(
    app: INestApplication,
    logger: AppLoggerService,
) {
    const signals = ['SIGTERM', 'SIGINT'];

    signals.forEach((signal) => {
        process.on(signal, async () => {
            logger.logShutdown(signal);

            await app.close();

            process.exit(0);
        });
    });

    process.on('uncaughtException', (error) => {
        logger.logUnhandledException(error);
    });

    process.on('unhandledRejection', (reason) => {
        const error =
            reason instanceof Error ? reason : new Error(String(reason));
        logger.logUnhandledException(error);
    });
}

function setUpEnvironment() {
    // Load environment variables from .env file in all environments
    // but give precedence to system environment variables
    config();
}

bootstrap();
