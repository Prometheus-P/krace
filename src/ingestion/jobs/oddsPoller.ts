/**
 * Odds Poller Job
 *
 * Fetches current odds from KRA/KSPO APIs and saves to TimescaleDB.
 * Supports variable collection intervals based on time to race start.
 */

import { db } from '@/lib/db/client';
import { oddsSnapshots } from '@/lib/db/schema';
import { fetchKraOdds } from '../clients/kraClient';
import { fetchKspoOdds } from '../clients/kspoClient';
import { mapKraOddsBatch, mapKspoOddsBatch } from '../mappers/oddsMapper';
import { withRetryAndLogging } from '../utils/retry';

export interface PollOddsOptions {
  raceIds: string[];
}

export interface OddsIngestionResult {
  snapshots: number;
  races: number;
  errors: number;
}

/**
 * Parse race ID to extract components
 */
function parseRaceId(raceId: string): {
  raceType: 'horse' | 'cycle' | 'boat';
  trackCode: string;
  raceNo: number;
  date: string;
} | null {
  const parts = raceId.split('-');
  if (parts.length < 4) return null;

  const raceType = parts[0] as 'horse' | 'cycle' | 'boat';
  const trackCode = parts[1];
  const raceNo = parseInt(parts[2], 10);
  const dateRaw = parts[3];
  const date = `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`;

  return { raceType, trackCode, raceNo, date };
}

/**
 * Poll and save odds for specified race IDs
 *
 * @param options - Polling options with race IDs
 * @returns Result with counts of snapshots and errors
 */
export async function pollOdds(options: PollOddsOptions): Promise<OddsIngestionResult> {
  const { raceIds } = options;
  const timestamp = new Date();

  const result: OddsIngestionResult = {
    snapshots: 0,
    races: 0,
    errors: 0,
  };

  if (raceIds.length === 0) {
    console.log('[OddsPoller] No race IDs provided');
    return result;
  }

  console.log(`[OddsPoller] Polling odds for ${raceIds.length} races at ${timestamp.toISOString()}`);

  for (const raceId of raceIds) {
    const parsed = parseRaceId(raceId);
    if (!parsed) {
      console.warn(`[OddsPoller] Invalid race ID format: ${raceId}`);
      continue;
    }

    const { raceType, trackCode, raceNo, date } = parsed;

    try {
      let mappedSnapshots;

      if (raceType === 'horse') {
        const items = await withRetryAndLogging(
          () => fetchKraOdds(trackCode, raceNo, date),
          {
            jobType: 'odds_poll',
            entityType: 'odds',
            entityId: raceId,
            maxRetries: 2,
            initialDelay: 400,
          }
        );
        if (!items.success || !items.data) {
          result.errors += 1;
          continue;
        }
        mappedSnapshots = mapKraOddsBatch(items.data, raceId, timestamp);
      } else {
        const items = await withRetryAndLogging(
          () => fetchKspoOdds(trackCode, raceNo, date, raceType),
          {
            jobType: 'odds_poll',
            entityType: 'odds',
            entityId: raceId,
            maxRetries: 2,
            initialDelay: 400,
          }
        );
        if (!items.success || !items.data) {
          result.errors += 1;
          continue;
        }
        mappedSnapshots = mapKspoOddsBatch(items.data, raceId, timestamp);
      }

      if (mappedSnapshots.length > 0) {
        // Use onConflictDoNothing since (time, race_id, entry_no) is primary key
        // Duplicate timestamps for same race/entry should be ignored
        await db.insert(oddsSnapshots).values(mappedSnapshots).onConflictDoNothing();

        result.snapshots += mappedSnapshots.length;
        result.races += 1;
        console.log(`[OddsPoller] Collected ${mappedSnapshots.length} odds for ${raceId}`);
      }
    } catch (error) {
      console.error(`[OddsPoller] Error fetching odds for ${raceId}:`, error);
      result.errors += 1;
    }
  }

  console.log(
    `[OddsPoller] Complete: snapshots=${result.snapshots}, races=${result.races}, errors=${result.errors}`
  );

  return result;
}

/**
 * Poll odds for a single race (used by cron job)
 */
export async function pollOddsForRace(raceId: string): Promise<number> {
  const result = await pollOdds({ raceIds: [raceId] });
  return result.snapshots;
}
