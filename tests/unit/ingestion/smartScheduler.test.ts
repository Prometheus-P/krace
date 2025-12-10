/**
 * @jest-environment node
 */
import { describe, expect, it } from '@jest/globals';

describe('smartScheduler', () => {
  describe('getCollectionInterval', () => {
    it('should return 5 minutes when 60-15 minutes before race start', async () => {
      const { getCollectionInterval } = await import('@/ingestion/utils/smartScheduler');

      // 45 minutes before race
      expect(getCollectionInterval(45)).toBe(5 * 60 * 1000);

      // 30 minutes before race
      expect(getCollectionInterval(30)).toBe(5 * 60 * 1000);

      // 16 minutes before race
      expect(getCollectionInterval(16)).toBe(5 * 60 * 1000);
    });

    it('should return 1 minute when 15-5 minutes before race start', async () => {
      const { getCollectionInterval } = await import('@/ingestion/utils/smartScheduler');

      // 14 minutes before race
      expect(getCollectionInterval(14)).toBe(1 * 60 * 1000);

      // 10 minutes before race
      expect(getCollectionInterval(10)).toBe(1 * 60 * 1000);

      // 6 minutes before race
      expect(getCollectionInterval(6)).toBe(1 * 60 * 1000);
    });

    it('should return 30 seconds when less than 5 minutes before race start', async () => {
      const { getCollectionInterval } = await import('@/ingestion/utils/smartScheduler');

      // 4 minutes before race
      expect(getCollectionInterval(4)).toBe(30 * 1000);

      // 2 minutes before race
      expect(getCollectionInterval(2)).toBe(30 * 1000);

      // 1 minute before race
      expect(getCollectionInterval(1)).toBe(30 * 1000);
    });

    it('should return null when race has started', async () => {
      const { getCollectionInterval } = await import('@/ingestion/utils/smartScheduler');

      // Race started (negative minutes)
      expect(getCollectionInterval(-5)).toBeNull();

      // Race just started
      expect(getCollectionInterval(0)).toBeNull();
    });
  });

  describe('shouldCollectNow', () => {
    it('should return true at correct intervals based on time to race', async () => {
      const { shouldCollectNow } = await import('@/ingestion/utils/smartScheduler');

      // At 30 minutes, should collect (5-min interval, 30 % 5 = 0)
      expect(shouldCollectNow(30)).toBe(true);

      // At 32 minutes, should not collect (not on 5-min boundary)
      expect(shouldCollectNow(32)).toBe(false);

      // At 10 minutes, should collect (1-min interval)
      expect(shouldCollectNow(10)).toBe(true);

      // At 3 minutes, should always collect (30-sec interval means always true at minute boundary)
      expect(shouldCollectNow(3)).toBe(true);
    });
  });

  describe('getUpcomingRacesForCollection', () => {
    it('should filter races within collection window (60 minutes)', async () => {
      const { getUpcomingRacesForCollection } = await import('@/ingestion/utils/smartScheduler');

      const now = new Date();
      const races = [
        { id: 'race1', startTime: new Date(now.getTime() + 30 * 60 * 1000).toISOString() }, // 30 min
        { id: 'race2', startTime: new Date(now.getTime() + 90 * 60 * 1000).toISOString() }, // 90 min
        { id: 'race3', startTime: new Date(now.getTime() + 5 * 60 * 1000).toISOString() }, // 5 min
        { id: 'race4', startTime: new Date(now.getTime() - 10 * 60 * 1000).toISOString() }, // past
      ];

      const upcoming = getUpcomingRacesForCollection(races as any);

      expect(upcoming).toHaveLength(2);
      expect(upcoming.map((r) => r.id)).toContain('race1');
      expect(upcoming.map((r) => r.id)).toContain('race3');
    });
  });
});
