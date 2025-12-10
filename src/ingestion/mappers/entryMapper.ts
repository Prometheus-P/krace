/**
 * Entry Mapper
 *
 * Transforms raw API responses into database-ready entry records.
 */

import type { NewEntry } from '@/lib/db/schema';
import type { KraEntryItem } from '../clients/kraClient';
import type { KspoEntryItem } from '../clients/kspoClient';

/**
 * Map KRA entry item to NewEntry (horse racing)
 */
export function mapKraEntry(item: KraEntryItem, raceId: string): NewEntry {
  return {
    raceId,
    entryNo: item.hrNo,
    name: item.hrName || '미등록',
    entityType: 'horse',
    jockeyName: item.jkName || null,
    trainerName: item.trName || null,
    ownerName: item.owName || null,
    birthYear: item.age ? new Date().getFullYear() - item.age : null,
    sex: item.sex || null,
    weight: item.wgHr ? String(item.wgHr) : null,
    burdenWeight: item.wgBudam ? String(item.wgBudam) : null,
    rating: item.rating || null,
    recentRecord: item.rcsPt || null,
    status: 'active',
  };
}

/**
 * Map KSPO entry item to NewEntry (cycle/boat racing)
 */
export function mapKspoEntry(
  item: KspoEntryItem,
  raceId: string,
  raceType: 'cycle' | 'boat'
): NewEntry {
  const entityType = raceType === 'cycle' ? 'cyclist' : 'boat_racer';

  return {
    raceId,
    entryNo: item.playerNo,
    name: item.playerName || '미등록',
    entityType,
    racerId: String(item.playerNo),
    racerGrade: item.grade || null,
    gearRatio: item.gearRatio ? String(item.gearRatio) : null,
    motorNo: item.motorNo || null,
    boatNo: item.boatNo || null,
    recentRecord: item.record || null,
    status: 'active',
  };
}

/**
 * Batch map KRA entry items
 */
export function mapKraEntries(items: KraEntryItem[], raceId: string): NewEntry[] {
  return items.map((item) => mapKraEntry(item, raceId));
}

/**
 * Batch map KSPO entry items
 */
export function mapKspoEntries(
  items: KspoEntryItem[],
  raceId: string,
  raceType: 'cycle' | 'boat'
): NewEntry[] {
  return items.map((item) => mapKspoEntry(item, raceId, raceType));
}

/**
 * Update entry status to scratched
 */
export function markAsScratched(entry: NewEntry): NewEntry {
  return {
    ...entry,
    status: 'scratched',
  };
}
