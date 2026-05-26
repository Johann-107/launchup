import { Controller, Get, Query } from '@nestjs/common';
import { AiMetricsService } from './ai-metrics.service';

@Controller('ai/metrics')
export class AiMetricsController {
  constructor(private readonly metrics: AiMetricsService) {}

  @Get()
  async list(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 100;
    return this.metrics.getRecent(n);
  }
}
