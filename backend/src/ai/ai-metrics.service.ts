import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

const METRICS_PATH = path.join(__dirname, '..', '..', 'data', 'ai-metrics.json');

type AiMetricRecord = {
  timestamp: string;
  type?: string;
  detail?: any;
};

@Injectable()
export class AiMetricsService {
  async recordFailure(entry: { timestamp?: string; type?: string; detail?: any }) {
    const record = { timestamp: new Date().toISOString(), ...entry };
    try {
      await fs.mkdir(path.dirname(METRICS_PATH), { recursive: true });
      let arr: AiMetricRecord[] = [];
      try {
        const content = await fs.readFile(METRICS_PATH, 'utf-8');
        arr = JSON.parse(content || '[]') as AiMetricRecord[];
      } catch (err) {
        arr = [];
      }
      arr.push(record);
      await fs.writeFile(METRICS_PATH, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write AI metrics:', err);
    }
  }

  async getRecent(limit = 100) {
    try {
      const content = await fs.readFile(METRICS_PATH, 'utf-8');
      const arr = JSON.parse(content || '[]');
      return arr.slice(-limit).reverse();
    } catch (err) {
      return [];
    }
  }
}
