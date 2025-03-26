import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
    imports: [
        TerminusModule.forRoot({
            logger: true,
        }),
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
    ],
    controllers: [HealthController],
    providers: [],
    exports: [],
})
export class HealthModule {}
