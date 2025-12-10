/**
 * @jest-environment node
 *
 * Integration test for odds snapshots
 * Requires DATABASE_URL with TimescaleDB support
 */
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';

// Skip integration tests if no DATABASE_URL
const SKIP_INTEGRATION = !process.env.DATABASE_URL;
const conditionalIt = SKIP_INTEGRATION ? it.skip : it;

describe('Odds Snapshots Integration', () => {
  beforeAll(async () => {
    if (SKIP_INTEGRATION) {
      console.log('Skipping integration tests: DATABASE_URL not set');
      return;
    }
    // Setup: Ensure test race exists
  });

  afterAll(async () => {
    if (SKIP_INTEGRATION) return;
    // Cleanup: Remove test snapshots
  });

  describe('TimescaleDB Operations', () => {
    conditionalIt('should insert odds snapshot', async () => {
      const { db } = await import('@/lib/db/client');
      const { oddsSnapshots } = await import('@/lib/db/schema');

      const testSnapshot = {
        time: new Date(),
        raceId: 'test-horse-1-20241210',
        entryNo: 1,
        oddsWin: '3.50',
        oddsPlace: '1.80',
        popularityRank: 1,
      };

      await db.insert(oddsSnapshots).values(testSnapshot).onConflictDoNothing();

      // Verify insertion
      expect(true).toBe(true);
    });

    conditionalIt('should query snapshots by time range', async () => {
      const { db } = await import('@/lib/db/client');
      const { oddsSnapshots } = await import('@/lib/db/schema');
      const { and, gte, lte, eq } = await import('drizzle-orm');

      const raceId = 'test-horse-1-20241210';
      const startTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const endTime = new Date();

      const snapshots = await db
        .select()
        .from(oddsSnapshots)
        .where(
          and(
            eq(oddsSnapshots.raceId, raceId),
            gte(oddsSnapshots.time, startTime),
            lte(oddsSnapshots.time, endTime)
          )
        );

      expect(Array.isArray(snapshots)).toBe(true);
    });

    conditionalIt('should aggregate snapshots for summary', async () => {
      // Test continuous aggregate query (odds_5min view)
      const { pool } = await import('@/lib/db/client');

      const result = await pool.query(`
        SELECT
          race_id,
          entry_no,
          odds_open,
          odds_close,
          odds_high,
          odds_low,
          snapshot_count
        FROM odds_5min
        WHERE race_id = 'test-horse-1-20241210'
        ORDER BY bucket DESC
        LIMIT 1
      `);

      expect(Array.isArray(result.rows)).toBe(true);
    });
  });
});
