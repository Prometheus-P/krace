/**
 * Odds Query Functions
 *
 * Database queries for odds time-series data.
 * Uses TimescaleDB continuous aggregates for efficient queries.
 */

import { db } from '@/lib/db/client';
import { oddsSnapshots } from '@/lib/db/schema';
import { eq, and, gte, lte, asc, sql } from 'drizzle-orm';
import type { OddsSnapshot } from '@/lib/db/schema';

export interface OddsHistoryOptions {
  entryNo?: number;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

/**
 * Get odds history for a race
 *
 * @param raceId - Race ID
 * @param options - Filter options
 * @returns Array of odds snapshots
 */
export async function getOddsHistory(
  raceId: string,
  options: OddsHistoryOptions = {}
): Promise<OddsSnapshot[]> {
  const { entryNo, startTime, endTime, limit = 1000 } = options;

  const conditions = [eq(oddsSnapshots.raceId, raceId)];

  if (entryNo !== undefined) {
    conditions.push(eq(oddsSnapshots.entryNo, entryNo));
  }

  if (startTime) {
    conditions.push(gte(oddsSnapshots.time, startTime));
  }

  if (endTime) {
    conditions.push(lte(oddsSnapshots.time, endTime));
  }

  return db
    .select()
    .from(oddsSnapshots)
    .where(and(...conditions))
    .orderBy(asc(oddsSnapshots.time))
    .limit(limit);
}

/**
 * Get odds summary statistics for a race
 *
 * @param raceId - Race ID
 * @returns Summary statistics per entry
 */
export async function getOddsSummary(
  raceId: string
): Promise<
  Array<{
    entryNo: number;
    minWinOdds: number;
    maxWinOdds: number;
    avgWinOdds: number;
    snapshotCount: number;
  }>
> {
  return db
    .select({
      entryNo: oddsSnapshots.entryNo,
      minWinOdds: sql<number>`min(${oddsSnapshots.oddsWin})`,
      maxWinOdds: sql<number>`max(${oddsSnapshots.oddsWin})`,
      avgWinOdds: sql<number>`avg(${oddsSnapshots.oddsWin})`,
      snapshotCount: sql<number>`count(*)::int`,
    })
    .from(oddsSnapshots)
    .where(eq(oddsSnapshots.raceId, raceId))
    .groupBy(oddsSnapshots.entryNo)
    .orderBy(oddsSnapshots.entryNo);
}

/**
 * Get latest odds for each entry in a race
 *
 * Uses DISTINCT ON for efficient latest row retrieval
 *
 * @param raceId - Race ID
 * @returns Latest odds per entry
 */
export async function getLatestOdds(
  raceId: string
): Promise<Array<{ entryNo: number; winOdds: number; plcOdds: number | null; time: Date }>> {
  // Using raw SQL for DISTINCT ON (PostgreSQL specific)
  const result = await db.execute<{
    entry_no: number;
    odds_win: number;
    odds_place: number | null;
    time: Date;
  }>(sql`
    SELECT DISTINCT ON (entry_no)
      entry_no,
      odds_win,
      odds_place,
      time
    FROM odds_snapshots
    WHERE race_id = ${raceId}
    ORDER BY entry_no, time DESC
  `);

  return result.rows.map((row) => ({
    entryNo: row.entry_no,
    winOdds: Number(row.odds_win),
    plcOdds: row.odds_place ? Number(row.odds_place) : null,
    time: new Date(row.time),
  }));
}

/**
 * Get time-series odds data with time bucketing
 *
 * Uses TimescaleDB time_bucket for efficient aggregation
 *
 * @param raceId - Race ID
 * @param options - Bucket options
 * @returns Time-bucketed odds data
 */
export async function getOddsTimeSeries(
  raceId: string,
  options: { bucketMinutes?: number; entryNo?: number } = {}
): Promise<Array<{ bucket: Date; entryNo: number; avgWinOdds: number; avgPlcOdds: number | null }>> {
  const { bucketMinutes = 5, entryNo } = options;

  const entryFilter = entryNo !== undefined ? sql`AND entry_no = ${entryNo}` : sql``;

  const result = await db.execute<{
    bucket: Date;
    entry_no: number;
    avg_odds_win: number;
    avg_odds_place: number | null;
  }>(sql`
    SELECT
      time_bucket(${bucketMinutes + ' minutes'}::interval, time) AS bucket,
      entry_no,
      avg(odds_win) AS avg_odds_win,
      avg(odds_place) AS avg_odds_place
    FROM odds_snapshots
    WHERE race_id = ${raceId} ${entryFilter}
    GROUP BY bucket, entry_no
    ORDER BY bucket, entry_no
  `);

  return result.rows.map((row) => ({
    bucket: new Date(row.bucket),
    entryNo: row.entry_no,
    avgWinOdds: Number(row.avg_odds_win),
    avgPlcOdds: row.avg_odds_place ? Number(row.avg_odds_place) : null,
  }));
}

/**
 * Get odds change (drift) for each entry
 *
 * Calculates the difference between first and last odds
 *
 * @param raceId - Race ID
 * @returns Odds drift per entry
 */
export async function getOddsDrift(
  raceId: string
): Promise<Array<{ entryNo: number; firstOdds: number; lastOdds: number; drift: number }>> {
  const result = await db.execute<{
    entry_no: number;
    first_odds: number;
    last_odds: number;
  }>(sql`
    WITH first_last AS (
      SELECT
        entry_no,
        first_value(odds_win) OVER (PARTITION BY entry_no ORDER BY time ASC) AS first_odds,
        first_value(odds_win) OVER (PARTITION BY entry_no ORDER BY time DESC) AS last_odds
      FROM odds_snapshots
      WHERE race_id = ${raceId}
    )
    SELECT DISTINCT
      entry_no,
      first_odds,
      last_odds
    FROM first_last
    ORDER BY entry_no
  `);

  return result.rows.map((row) => ({
    entryNo: row.entry_no,
    firstOdds: Number(row.first_odds),
    lastOdds: Number(row.last_odds),
    drift: Number(row.last_odds) - Number(row.first_odds),
  }));
}

/**
 * Get snapshot count for a race (diagnostic)
 *
 * @param raceId - Race ID
 * @returns Total snapshot count
 */
export async function getSnapshotCount(raceId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(oddsSnapshots)
    .where(eq(oddsSnapshots.raceId, raceId));

  return result[0]?.count ?? 0;
}
