import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Logger,
    LoggerService,
    Optional,
    Inject,
    ConsoleLogger,
    Global,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { RequestData, RequestLoggerOptions } from '../../types/logger';
import AppConfig from 'src/app.config';

const defaultOptions: RequestLoggerOptions = {
    headerName: 'X-Request-ID',
    excludePaths: ['/metrics'],
    sensitiveHeaders: ['authorization', 'cookie', 'set-cookie'],
    sensitiveParams: ['password', 'token', 'secret', 'key'],
    maskText: '[REDACTED]',
    logHeaders: false,
    logParams: true,
    logBody: false,
    maxBodyLength: 1000,
};

@Global()
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
    private readonly options: RequestLoggerOptions;
    private readonly logger: LoggerService;
    private readonly metricsMap = new Map<string, number[]>();

    constructor(
        @Optional()
        @Inject('REQUEST_LOGGER_OPTIONS')
        options?: RequestLoggerOptions,
    ) {
        this.options = { ...defaultOptions, ...options };
        this.logger =
            options?.loggerService ||
            new ConsoleLogger('HTTP', {
                prefix: AppConfig.app.consolePrefix,
            });

        setInterval(() => this.reportMetrics(), 60000);
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
        const req = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();

        // Skip logging for excluded paths
        if (this.shouldSkip(req)) {
            return next.handle();
        }

        // Add request ID
        const requestId = this.getOrGenerateRequestId(req);
        
        // Capture request data
        const requestData = this.captureRequestData(req, requestId);
        
        // Log request
        this.logRequest(requestData);
        
        // Set custom headers
        res.set('X-Powered-By', 'Animal-Party-Engine');
        res.set('ETag', 'Toi yeu em');
        
        // Remove sensitive headers
        res.removeHeader('Access-Control-Allow-Origin');
        res.removeHeader('Access-Control-Allow-Credentials');
        res.removeHeader('Access-Control-Allow-Methods');

        const startTime = process.hrtime();

        return next.handle().pipe(
            tap({
                next: () => {
                    const duration = process.hrtime(startTime);
                    this.logResponse(res, requestData, duration);
                    this.trackRequestMetrics(req.method, req.path, duration);
                },
                error: (error) => {
                    const duration = process.hrtime(startTime);
                    this.logResponse(res, requestData, duration, error);
                    this.trackRequestMetrics(req.method, req.path, duration);
                },
            }),
        );
    }

    private shouldSkip(req: Request): boolean {
        const { excludePaths, excludePathRegex } = this.options;

        if (
            excludePaths?.some(
                (path) =>
                    req.path.includes(path) || req.originalUrl.includes(path),
            )
        ) {
            return true;
        }

        if (excludePathRegex?.some((regex) => regex.test(req.path))) {
            return true;
        }

        return false;
    }

    private getOrGenerateRequestId(req: Request): string {
        const headerName = this.options.headerName || 'X-Request-ID';

        const headerRequestId = req.header(headerName);
        if (headerRequestId) {
            req['requestId'] = headerRequestId;
            return headerRequestId;
        }

        const newRequestId = randomUUID();
        req['requestId'] = newRequestId;
        req.headers[headerName.toLowerCase()] = newRequestId;

        return newRequestId;
    }

    private captureRequestData(req: Request, requestId: string): RequestData {
        const { method, originalUrl, path } = req;
        const ip = req.ip || req.socket.remoteAddress || req.hostname;
        const userAgent = req.get('user-agent') || '';

        const requestData: RequestData = {
            requestId,
            timestamp: new Date().toISOString(),
            method,
            originalUrl,
            path,
            ip,
            userAgent,
        };

        if (this.options.logParams) {
            requestData['params'] = this.maskSensitiveData(req.query);
        }

        if (this.options.logHeaders) {
            requestData['headers'] = this.maskSensitiveData(req.headers);
        }

        if (this.options.logBody && req.body) {
            const bodyStr =
                typeof req.body === 'object'
                    ? JSON.stringify(this.maskSensitiveData(req.body))
                    : String(req.body);

            requestData['body'] =
                bodyStr.length > (this.options.maxBodyLength || 1000)
                    ? `${bodyStr.substring(0, this.options.maxBodyLength)}... [truncated]`
                    : bodyStr;
        }

        return requestData;
    }

    private maskSensitiveData(data: any): any {
        if (!data || typeof data !== 'object') return data;

        const { sensitiveHeaders, sensitiveParams, maskText } = this.options;
        const maskedData = { ...data };

        const sensitiveKeys = [
            ...(sensitiveHeaders || []),
            ...(sensitiveParams || []),
        ].map((key) => key.toLowerCase());

        Object.keys(maskedData).forEach((key) => {
            if (sensitiveKeys.includes(key.toLowerCase())) {
                maskedData[key] = maskText || '[REDACTED]';
            } else if (
                typeof maskedData[key] === 'object' &&
                maskedData[key] !== null
            ) {
                maskedData[key] = this.maskSensitiveData(maskedData[key]);
            }
        });

        return maskedData;
    }

    private logRequest(requestData: RequestData): void {
        const { requestId, method, originalUrl, ip, userAgent } = requestData;

        if (
            (this.options.logParams ||
                this.options.logHeaders ||
                this.options.logBody) &&
            (requestData.params || requestData.headers || requestData.body)
        ) {
            const logDetails = {
                ...requestData,
                requestId: requestId,
                method: method,
                originalUrl: originalUrl,
                ip: ip,
                userAgent: userAgent,
                timestamp: requestData.timestamp,
            };

            if (typeof this.logger.debug === 'function') {
                this.logger.debug(
                    `[${requestId}] Request details:`,
                    logDetails,
                );
            } else {
                this.logger.verbose?.(
                    `[${requestId}] Request details:`,
                    logDetails,
                );
            }
        }
    }

    private logResponse(
        res: Response,
        requestData: RequestData,
        hrDuration: [number, number],
        error?: Error,
    ): void {
        const { requestId, method, originalUrl } = requestData;
        const statusCode = res.statusCode;
        const contentLength = res.get('content-length') || 0;

        const durationMs = (
            hrDuration[0] * 1000 +
            hrDuration[1] / 1000000
        ).toFixed(2);

        const logMessage = `[${requestId}] ${method} ${originalUrl} ${statusCode} ${contentLength}B - ${durationMs}ms`;

        if (error || statusCode >= 500) {
            this.logger.error(logMessage, error?.stack);
        } else if (statusCode >= 400) {
            this.logger.warn(logMessage);
        } else {
            this.logger.log(logMessage);
        }
    }

    private trackRequestMetrics(
        method: string,
        path: string,
        hrDuration: [number, number],
    ): void {
        const durationMs = hrDuration[0] * 1000 + hrDuration[1] / 1000000;
        const key = `${method}:${path}`;

        if (!this.metricsMap.has(key)) {
            this.metricsMap.set(key, []);
        }

        const metrics = this.metricsMap.get(key)!;
        metrics.push(durationMs);

        if (metrics.length > 100) {
            metrics.shift();
        }
    }

    private reportMetrics(): void {
        if (this.metricsMap.size === 0) return;

        const metrics: Record<string, any> = {};

        this.metricsMap.forEach((durations, key) => {
            if (durations.length === 0) return;

            const sum = durations.reduce((a, b) => a + b, 0);
            const avg = sum / durations.length;
            const min = Math.min(...durations);
            const max = Math.max(...durations);
            const sorted = [...durations].sort((a, b) => a - b);
            const p95 = sorted[Math.floor(sorted.length * 0.95)];

            metrics[key] = {
                count: durations.length,
                avg: avg.toFixed(2),
                min: min.toFixed(2),
                max: max.toFixed(2),
                p95: p95.toFixed(2),
            };
        });

        this.logger.verbose?.('Request metrics (last minute):', metrics);
    }
}