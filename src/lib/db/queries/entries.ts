/**
 * Entry Query Functions
 *
 * Database queries for race entry data retrieval.
 */

import { db } from '@/lib/db/client';
import { entries, races } from '@/lib/db/schema';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import type { Entry } from '@/lib/db/schema';

/**
 * Get entries for a specific race
 *
 * @param raceId - Race ID
 * @returns Array of entries ordered by entry number
 */
export async function getEntriesByRace(raceId: string): Promise<Entry[]> {
  return db
    .select()
    .from(entries)
    .where(eq(entries.raceId, raceId))
    .orderBy(entries.entryNo);
}

/**
 * Get a single entry by ID
 *
 * @param entryId - Entry ID (numeric)
 * @returns Entry or null if not found
 */
export async function getEntryById(entryId: number): Promise<Entry | null> {
  const result = await db.select().from(entries).where(eq(entries.id, entryId));

  return result[0] ?? null;
}

/**
 * Get entries for multiple races (batch query)
 *
 * @param raceIds - Array of race IDs
 * @returns Map of race ID to entries
 */
export async function getEntriesForRaces(raceIds: string[]): Promise<Map<string, Entry[]>> {
  if (raceIds.length === 0) {
    return new Map();
  }

  const allEntries = await db
    .select()
    .from(entries)
    .where(inArray(entries.raceId, raceIds))
    .orderBy(entries.raceId, entries.entryNo);

  const entriesByRace = new Map<string, Entry[]>();

  for (const entry of allEntries) {
    const raceEntries = entriesByRace.get(entry.raceId) ?? [];
    raceEntries.push(entry);
    entriesByRace.set(entry.raceId, raceEntries);
  }

  return entriesByRace;
}

/**
 * Get entry statistics for a race
 *
 * @param raceId - Race ID
 * @returns Entry statistics
 */
export async function getEntryStats(raceId: string): Promise<{
  total: number;
  scratched: number;
  active: number;
  avgWeight: number | null;
}> {
  const result = await db
    .select({
      total: sql<number>`count(*)::int`,
      scratched: sql<number>`count(*) filter (where ${entries.status} = 'scratched')::int`,
      active: sql<number>`count(*) filter (where ${entries.status} = 'active')::int`,
      avgWeight: sql<number>`avg(${entries.weight})`,
    })
    .from(entries)
    .where(eq(entries.raceId, raceId));

  return (
    result[0] ?? {
      total: 0,
      scratched: 0,
      active: 0,
      avgWeight: null,
    }
  );
}

/**
 * Get entries by jockey name (horse racing)
 *
 * @param jockeyName - Jockey name
 * @param limit - Maximum results
 * @returns Array of entries
 */
export async function getEntriesByJockey(jockeyName: string, limit: number = 50): Promise<Entry[]> {
  return db
    .select()
    .from(entries)
    .where(eq(entries.jockeyName, jockeyName))
    .orderBy(desc(entries.createdAt))
    .limit(limit);
}

/**
 * Get entries by name (horse/cyclist/boat racer name)
 *
 * @param name - Entry name
 * @param limit - Maximum results
 * @returns Array of entries with race info
 */
export async function getEntriesByName(
  name: string,
  limit: number = 50
): Promise<Array<{ entry: Entry; race: { id: string; raceDate: string } }>> {
  return db
    .select({
      entry: entries,
      race: {
        id: races.id,
        raceDate: races.raceDate,
      },
    })
    .from(entries)
    .innerJoin(races, eq(entries.raceId, races.id))
    .where(eq(entries.name, name))
    .orderBy(desc(races.raceDate))
    .limit(limit);
}

/**
 * Get entry count by race type
 *
 * @returns Count of entries by race type
 */
export async function getEntryCountsByType(): Promise<Array<{ raceType: string; count: number }>> {
  return db
    .select({
      raceType: races.raceType,
      count: sql<number>`count(${entries.id})::int`,
    })
    .from(entries)
    .innerJoin(races, eq(entries.raceId, races.id))
    .groupBy(races.raceType);
}
