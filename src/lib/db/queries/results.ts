/**
 * Result Query Functions
 *
 * Database queries for race result data.
 */

import { db } from '@/lib/db/client';
import { results, entries, races } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { Result, Entry } from '@/lib/db/schema';

/**
 * Get results for a specific race
 *
 * @param raceId - Race ID
 * @returns Array of results ordered by finish position
 */
export async function getResultsByRace(raceId: string): Promise<Result[]> {
  return db
    .select()
    .from(results)
    .where(eq(results.raceId, raceId))
    .orderBy(results.finishPosition);
}

/**
 * Get result with entry details for a race
 *
 * @param raceId - Race ID
 * @returns Results with entry information
 */
export async function getResultsWithEntries(
  raceId: string
): Promise<Array<{ result: Result; entry: Entry | null }>> {
  return db
    .select({
      result: results,
      entry: entries,
    })
    .from(results)
    .leftJoin(entries, and(eq(results.raceId, entries.raceId), eq(results.entryNo, entries.entryNo)))
    .where(eq(results.raceId, raceId))
    .orderBy(results.finishPosition);
}

/**
 * Get win rate for an entry by name
 *
 * @param name - Entry name (horse, cyclist, etc.)
 * @returns Win statistics
 */
export async function getEntryWinRate(name: string): Promise<{
  totalRaces: number;
  wins: number;
  places: number;
  shows: number;
  winRate: number;
  placeRate: number;
}> {
  const entryResults = await db
    .select({
      finishPosition: results.finishPosition,
    })
    .from(results)
    .innerJoin(entries, and(eq(results.raceId, entries.raceId), eq(results.entryNo, entries.entryNo)))
    .where(eq(entries.name, name));

  const totalRaces = entryResults.length;
  const wins = entryResults.filter((r) => r.finishPosition === 1).length;
  const places = entryResults.filter((r) => r.finishPosition !== null && r.finishPosition <= 2).length;
  const shows = entryResults.filter((r) => r.finishPosition !== null && r.finishPosition <= 3).length;

  return {
    totalRaces,
    wins,
    places,
    shows,
    winRate: totalRaces > 0 ? wins / totalRaces : 0,
    placeRate: totalRaces > 0 ? places / totalRaces : 0,
  };
}

/**
 * Get jockey statistics
 *
 * @param jockeyName - Jockey name
 * @returns Jockey performance stats
 */
export async function getJockeyStats(jockeyName: string): Promise<{
  totalRaces: number;
  wins: number;
  places: number;
  shows: number;
  winRate: number;
  avgFinishPos: number | null;
}> {
  const jockeyResults = await db
    .select({
      finishPosition: results.finishPosition,
    })
    .from(results)
    .innerJoin(entries, and(eq(results.raceId, entries.raceId), eq(results.entryNo, entries.entryNo)))
    .where(eq(entries.jockeyName, jockeyName));

  const totalRaces = jockeyResults.length;
  const wins = jockeyResults.filter((r) => r.finishPosition === 1).length;
  const places = jockeyResults.filter((r) => r.finishPosition !== null && r.finishPosition <= 2).length;
  const shows = jockeyResults.filter((r) => r.finishPosition !== null && r.finishPosition <= 3).length;

  const validPositions = jockeyResults.filter((r) => r.finishPosition !== null);
  const avgFinishPos =
    validPositions.length > 0
      ? validPositions.reduce((sum, r) => sum + (r.finishPosition ?? 0), 0) / validPositions.length
      : null;

  return {
    totalRaces,
    wins,
    places,
    shows,
    winRate: totalRaces > 0 ? wins / totalRaces : 0,
    avgFinishPos,
  };
}

/**
 * Get trainer statistics
 *
 * @param trainerName - Trainer name
 * @returns Trainer performance stats
 */
export async function getTrainerStats(trainerName: string): Promise<{
  totalRaces: number;
  wins: number;
  winRate: number;
}> {
  const trainerResults = await db
    .select({
      finishPosition: results.finishPosition,
    })
    .from(results)
    .innerJoin(entries, and(eq(results.raceId, entries.raceId), eq(results.entryNo, entries.entryNo)))
    .where(eq(entries.trainerName, trainerName));

  const totalRaces = trainerResults.length;
  const wins = trainerResults.filter((r) => r.finishPosition === 1).length;

  return {
    totalRaces,
    wins,
    winRate: totalRaces > 0 ? wins / totalRaces : 0,
  };
}

/**
 * Get dividends for a race
 *
 * @param raceId - Race ID
 * @returns Dividend information
 */
export async function getDividends(raceId: string): Promise<{
  win: { entryNo: number; dividend: number } | null;
  place: Array<{ entryNo: number; dividend: number }>;
}> {
  const raceResults = await db
    .select({
      finishPosition: results.finishPosition,
      entryNo: results.entryNo,
      dividendWin: results.dividendWin,
      dividendPlace: results.dividendPlace,
    })
    .from(results)
    .where(eq(results.raceId, raceId))
    .orderBy(results.finishPosition);

  const winner = raceResults.find((r) => r.finishPosition === 1);
  const placers = raceResults.filter((r) => r.finishPosition !== null && r.finishPosition <= 3);

  return {
    win: winner?.dividendWin
      ? { entryNo: winner.entryNo, dividend: Number(winner.dividendWin) }
      : null,
    place: placers
      .filter((r) => r.dividendPlace)
      .map((r) => ({
        entryNo: r.entryNo,
        dividend: Number(r.dividendPlace),
      })),
  };
}

/**
 * Get results for a date range
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Results within date range
 */
export async function getResultsByDateRange(
  startDate: string,
  endDate: string
): Promise<Array<{ result: Result; raceDate: string }>> {
  // Use raw SQL for date range comparison
  const resultData = await db.execute<{
    result_id: number;
    race_id: string;
    entry_no: number;
    finish_position: number;
    time: string | null;
    margin: string | null;
    split_times: unknown;
    dividend_win: number | null;
    dividend_place: number | null;
    created_at: Date;
    race_date: string;
  }>(sql`
    SELECT
      r.id as result_id,
      r.race_id,
      r.entry_no,
      r.finish_position,
      r.time,
      r.margin,
      r.split_times,
      r.dividend_win,
      r.dividend_place,
      r.created_at,
      ra.race_date
    FROM results r
    INNER JOIN races ra ON r.race_id = ra.id
    WHERE ra.race_date >= ${startDate} AND ra.race_date <= ${endDate}
    ORDER BY ra.race_date DESC, r.race_id, r.finish_position
  `);

  return resultData.rows.map((row) => ({
    result: {
      id: row.result_id,
      raceId: row.race_id,
      entryNo: row.entry_no,
      finishPosition: row.finish_position,
      time: row.time,
      margin: row.margin,
      splitTimes: row.split_times,
      dividendWin: row.dividend_win,
      dividendPlace: row.dividend_place,
      createdAt: row.created_at,
    },
    raceDate: row.race_date,
  }));
}

/**
 * Get top performers (most wins) within a date range
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @param entityType - 'entry' | 'jockey' | 'trainer'
 * @param limit - Max results
 */
export async function getTopPerformers(
  startDate: string,
  endDate: string,
  entityType: 'entry' | 'jockey' | 'trainer',
  limit: number = 10
): Promise<Array<{ name: string; wins: number; races: number }>> {
  const nameColumn =
    entityType === 'entry'
      ? 'e.name'
      : entityType === 'jockey'
        ? 'e.jockey_name'
        : 'e.trainer_name';

  const result = await db.execute<{
    name: string;
    wins: number;
    races: number;
  }>(sql`
    SELECT
      ${sql.raw(nameColumn)} as name,
      count(*) filter (where r.finish_position = 1)::int as wins,
      count(*)::int as races
    FROM results r
    INNER JOIN entries e ON r.race_id = e.race_id AND r.entry_no = e.entry_no
    INNER JOIN races ra ON r.race_id = ra.id
    WHERE ra.race_date >= ${startDate} AND ra.race_date <= ${endDate}
    GROUP BY ${sql.raw(nameColumn)}
    ORDER BY wins DESC
    LIMIT ${limit}
  `);

  return result.rows.map((r) => ({
    name: r.name ?? 'Unknown',
    wins: r.wins,
    races: r.races,
  }));
}

// Keep old function name for backwards compatibility
export const getHorseWinRate = getEntryWinRate;
