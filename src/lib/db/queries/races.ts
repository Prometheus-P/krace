/**
 * Race Query Functions
 *
 * Database queries for race data retrieval.
 */

import { db } from '@/lib/db/client';
import { races, entries, tracks } from '@/lib/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import type { Race, Entry } from '@/lib/db/schema';

export type RaceType = 'horse' | 'cycle' | 'boat';

export interface GetRacesOptions {
  raceType?: RaceType;
  trackId?: number;
  status?: 'scheduled' | 'in_progress' | 'finished' | 'cancelled';
  limit?: number;
}

/**
 * Get races for a specific date
 *
 * @param date - Date string in YYYY-MM-DD format
 * @param options - Filter options
 * @returns Array of races
 */
export async function getRacesByDate(
  date: string,
  options: GetRacesOptions = {}
): Promise<Race[]> {
  const { raceType, trackId, status, limit = 100 } = options;

  // raceDate is stored as date string (YYYY-MM-DD)
  const conditions = [eq(races.raceDate, date)];

  if (raceType) {
    conditions.push(eq(races.raceType, raceType));
  }

  if (trackId) {
    conditions.push(eq(races.trackId, trackId));
  }

  if (status) {
    conditions.push(eq(races.status, status));
  }

  return db
    .select()
    .from(races)
    .where(and(...conditions))
    .orderBy(asc(races.raceNo))
    .limit(limit);
}

/**
 * Get a single race by ID
 *
 * @param raceId - Race ID
 * @returns Race or null if not found
 */
export async function getRaceById(raceId: string): Promise<Race | null> {
  const result = await db.select().from(races).where(eq(races.id, raceId));

  return result[0] ?? null;
}

/**
 * Get race with associated entries
 *
 * @param raceId - Race ID
 * @returns Race with entries or null
 */
export async function getRaceWithEntries(
  raceId: string
): Promise<{ race: Race; entries: Entry[] } | null> {
  const race = await getRaceById(raceId);

  if (!race) {
    return null;
  }

  const raceEntries = await db.select().from(entries).where(eq(entries.raceId, raceId));

  return { race, entries: raceEntries };
}

/**
 * Get races for a specific track
 *
 * @param trackId - Track ID
 * @param options - Filter and pagination options
 * @returns Array of races
 */
export async function getRacesByTrack(
  trackId: number,
  options: { limit?: number; offset?: number; status?: string } = {}
): Promise<Race[]> {
  const { limit = 50, offset = 0, status } = options;

  const conditions = [eq(races.trackId, trackId)];

  if (status) {
    conditions.push(eq(races.status, status as Race['status']));
  }

  return db
    .select()
    .from(races)
    .where(and(...conditions))
    .orderBy(desc(races.raceDate), asc(races.raceNo))
    .limit(limit)
    .offset(offset);
}

/**
 * Get races with track information
 *
 * @param date - Date string in YYYY-MM-DD format
 * @returns Races with track details
 */
export async function getRacesWithTrack(date: string): Promise<
  Array<{
    race: Race;
    track: { id: number; name: string; code: string };
  }>
> {
  return db
    .select({
      race: races,
      track: {
        id: tracks.id,
        name: tracks.name,
        code: tracks.code,
      },
    })
    .from(races)
    .innerJoin(tracks, eq(races.trackId, tracks.id))
    .where(eq(races.raceDate, date))
    .orderBy(asc(races.startTime));
}

/**
 * Get upcoming races (scheduled for today)
 *
 * @param _hours - Unused, kept for API compatibility
 * @returns Array of upcoming races
 */
export async function getUpcomingRaces(_hours: number = 24): Promise<Race[]> {
  const today = new Date().toISOString().split('T')[0];

  return db
    .select()
    .from(races)
    .where(
      and(
        eq(races.status, 'scheduled'),
        eq(races.raceDate, today)
      )
    )
    .orderBy(asc(races.startTime));
}

/**
 * Count races by status for a date
 *
 * @param date - Date string in YYYY-MM-DD format
 * @returns Count by status
 */
export async function getRaceCountsByStatus(
  date: string
): Promise<Array<{ status: string; count: number }>> {
  return db
    .select({
      status: races.status,
      count: sql<number>`count(*)::int`,
    })
    .from(races)
    .where(eq(races.raceDate, date))
    .groupBy(races.status);
}
