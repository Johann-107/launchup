import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiMetricsService } from './ai-metrics.service';
import { AiMetricsController } from './ai-metrics.controller';

@Module({
  providers: [AiService, AiMetricsService],
  controllers: [AiMetricsController],
  exports: [AiService, AiMetricsService],
})
export class AiModule {}
