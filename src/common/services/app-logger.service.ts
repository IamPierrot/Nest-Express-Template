import {
    ConsoleLogger,
    Injectable,
    Logger,
    LoggerService,
    LogLevel,
} from '@nestjs/common';
import AppConfig from 'src/app.config';

@Injectable()
export class AppLoggerService {
    private contextLoggers: Map<string, LoggerService> = new Map();
    private defaultLogger: ConsoleLogger;

    constructor() {
        this.defaultLogger = new ConsoleLogger('Application', {
            prefix: AppConfig.app.consolePrefix,
        });
    }

    getLogger(context: string): LoggerService {
        if (!this.contextLoggers.has(context)) {
            this.contextLoggers.set(
                context,
                new ConsoleLogger({
                    context,
                    prefix: AppConfig.app.consolePrefix,
                }),
            );
        }
        return this.contextLoggers.get(context)!;
    }

    logStartup(port: number, env: string): void {
        this.defaultLogger.log(
            `🚀 Application starting in ${env.toUpperCase()} mode`,
        );
        this.defaultLogger.log(`🔌 Server listening on port ${port}`);
        this.defaultLogger.log(`📝 API Documentation available at /api/docs`);
    }

    logShutdown(signal: string): void {
        this.defaultLogger.log(`🛑 Application shutting down... (${signal})`);
    }

    logUnhandledException(error: Error): void {
        this.defaultLogger.error(
            `💥 Unhandled Exception: ${error.message}`,
            error.stack,
        );
    }

    formatObject(obj: any): string {
        return JSON.stringify(obj, null, 2);
    }

    setLogLevels(levels: LogLevel[]): void {
        Logger.overrideLogger(levels);
        this.defaultLogger.log(`🔧 Log levels set to: ${levels.join(', ')}`);
    }

    initPerformanceMonitoring(): void {
        if (typeof process !== 'undefined') {
            const startUsage = process.cpuUsage();
            const startMemory = process.memoryUsage();

            setInterval(() => {
                const cpuUsage = process.cpuUsage(startUsage);
                const memoryUsage = process.memoryUsage();

                this.defaultLogger.verbose(`📊 Performance Metrics:`, {
                    cpu: {
                        user: `${Math.round(cpuUsage.user / 1000000)} seconds`,
                        system: `${Math.round(cpuUsage.system / 1000000)} seconds`,
                        upRateCpu: `${Math.round((cpuUsage.user + cpuUsage.system) / 1000000)} seconds`,
                    },
                    memory: {
                        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                        external: `${Math.round((memoryUsage.external || 0) / 1024 / 1024)} MB`,
                        upRateMemory: `${Math.round((memoryUsage.rss - startMemory.rss) / 1024 / 1024)} MB`,
                    },
                });
            }, 300000);
        }
    }
}
