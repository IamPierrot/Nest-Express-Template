import { Controller, Get } from '@nestjs/common';
import { 
    HealthCheck, 
    HealthCheckService, 
    DiskHealthIndicator, 
    MemoryHealthIndicator,
    HttpHealthIndicator
} from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Controller('health')
export class HealthController {
    private readonly storagePath: string;

    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private disk: DiskHealthIndicator,
        private memory: MemoryHealthIndicator,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        this.storagePath = process.platform === 'win32' ? 'C:\\' : '/';
    }

    /**
     * Basic health check endpoint using Terminus
     */
    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
            () => this.disk.checkStorage('storage', { path: this.storagePath, thresholdPercent: 90 }),
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
        ]);
    }

    /**
     * Detailed health check with additional system information
     */
    @Get('details')
    @HealthCheck()
    details() {
        return this.health.check([
            () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
            () => this.disk.checkStorage('storage', { path: this.storagePath, thresholdPercent: 90 }),
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
        ]);
    }

    /**
     * Simple ping endpoint for quick connectivity tests
     * Uses cache to demonstrate cache manager integration
     */
    @Get('ping')
    async ping() {
        const cacheKey = 'health:ping:timestamp';
        const cachedTimestamp = await this.cacheManager.get(cacheKey);
        
        const currentTimestamp = new Date().toISOString();
        await this.cacheManager.set(cacheKey, currentTimestamp, 60);

        return { 
            ping: 'pong', 
            timestamp: currentTimestamp,
            cachedTimestamp: cachedTimestamp || 'none'
        };
    }
}
