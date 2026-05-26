import { EntityManager } from '@mikro-orm/core';
import { ReadinessType } from '../entities/enums/readiness-type.enum';
import { ReadinessService } from './readiness.service';

describe('ReadinessService', () => {
  it('returns a weighted score, tier, and prioritized recommendations', async () => {
    const em = {
      find: jest.fn().mockResolvedValue([
        { readinessLevel: { level: 5, readinessType: ReadinessType.A } },
        { readinessLevel: { level: 4, readinessType: ReadinessType.M } },
        { readinessLevel: { level: 3, readinessType: ReadinessType.T } },
        { readinessLevel: { level: 2, readinessType: ReadinessType.O } },
        { readinessLevel: { level: 1, readinessType: ReadinessType.I } },
      ]),
    };

    const service = new ReadinessService(em as unknown as EntityManager);
    const result = await service.getReadinessForStartup(12);

    expect(em.find).toHaveBeenCalledTimes(1);
    expect(result.compositeScore).toBeGreaterThan(0);
    expect(result.tierLabel).toBeDefined();
    expect(result.dimensions).toHaveLength(5);
    expect(result.recommendations).toHaveLength(3);
    expect(result.weightRationale).toHaveLength(5);
    expect(result.recommendations[0].priority).toBe(1);
  });

  it('exposes weight rationale for the UI', () => {
    const service = new ReadinessService({} as EntityManager);
    const rationale = service.getWeightRationale();

    expect(rationale.map((item) => item.key)).toEqual([
      'team',
      'market',
      'product',
      'traction',
      'funding',
    ]);
  });
});
