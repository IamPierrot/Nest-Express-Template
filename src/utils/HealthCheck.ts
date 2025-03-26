import { Injectable } from '@nestjs/common';

/**
 * Singleton utility class for health checks
 */
@Injectable()
export class HealthCheck {
    private static instance: HealthCheck;
    private startTime: number;

    private constructor() {
        this.startTime = Date.now();
    }

    /**
     * Get the singleton instance of HealthCheck
     */
    public static getInstance(): HealthCheck {
        if (!HealthCheck.instance) {
            HealthCheck.instance = new HealthCheck();
        }
        return HealthCheck.instance;
    }

    /**
     * Get basic health status information
     */
    public getStatus(): Record<string, any> {
        const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: this.formatUptime(uptimeSeconds),
            environment: process.env.NODE_ENV || 'development',
            memory: this.getMemoryUsage(),
        };
    }

    /**
     * Get detailed health information including system details
     */
    public getDetailedStatus(): Record<string, any> {
        const status = this.getStatus();

        return {
            ...status,
            node: {
                versions: process.versions,
                platform: process.platform,
                arch: process.arch,
            },
            cpu: this.getCpuInfo(),
        };
    }

    /**
     * Format uptime in human-readable format
     */
    private formatUptime(seconds: number): string {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const parts: string[] = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (remainingSeconds > 0 || parts.length === 0)
            parts.push(`${remainingSeconds}s`);

        return parts.join(' ');
    }

    /**
     * Get memory usage information
     */
    private getMemoryUsage(): Record<string, string> {
        const memoryUsage = process.memoryUsage();
        return {
            rss: this.formatBytes(memoryUsage.rss),
            heapTotal: this.formatBytes(memoryUsage.heapTotal),
            heapUsed: this.formatBytes(memoryUsage.heapUsed),
            external: this.formatBytes(memoryUsage.external || 0),
            arrayBuffers: this.formatBytes(memoryUsage.arrayBuffers || 0),
        };
    }

    /**
     * Format bytes to human-readable format
     */
    private formatBytes(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * Get CPU information
     */
    private getCpuInfo(): Record<string, any> {
        try {
            const cpuUsage = process.cpuUsage();
            return {
                user: `${Math.round(cpuUsage.user / 1000)} ms`,
                system: `${Math.round(cpuUsage.system / 1000)} ms`,
            };
        } catch (error) {
            return { error: 'CPU info unavailable' };
        }
    }
}
