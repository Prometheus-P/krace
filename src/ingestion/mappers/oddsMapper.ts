/**
 * Odds Mapper
 *
 * Transforms raw API responses into database-ready odds snapshot records.
 */

import type { NewOddsSnapshot } from '@/lib/db/schema';
import type { KraOddsItem } from '../clients/kraClient';
import type { KspoOddsItem } from '../clients/kspoClient';

/**
 * Map KRA odds item to NewOddsSnapshot
 */
export function mapKraOdds(
  item: KraOddsItem,
  raceId: string,
  timestamp: Date
): NewOddsSnapshot {
  return {
    time: timestamp,
    raceId,
    entryNo: item.hrNo,
    oddsWin: item.winOdds ? String(item.winOdds) : null,
    oddsPlace: item.plcOdds ? String(item.plcOdds) : null,
    popularityRank: item.ord || null,
  };
}

/**
 * Map KSPO odds item to NewOddsSnapshot
 */
export function mapKspoOdds(
  item: KspoOddsItem,
  raceId: string,
  timestamp: Date
): NewOddsSnapshot {
  return {
    time: timestamp,
    raceId,
    entryNo: item.playerNo,
    oddsWin: item.winOdds ? String(item.winOdds) : null,
    oddsPlace: item.plcOdds ? String(item.plcOdds) : null,
    popularityRank: item.rank || null,
  };
}

/**
 * Batch map KRA odds items with same timestamp
 */
export function mapKraOddsBatch(
  items: KraOddsItem[],
  raceId: string,
  timestamp?: Date
): NewOddsSnapshot[] {
  const ts = timestamp || new Date();
  return items.map((item) => mapKraOdds(item, raceId, ts));
}

/**
 * Batch map KSPO odds items with same timestamp
 */
export function mapKspoOddsBatch(
  items: KspoOddsItem[],
  raceId: string,
  timestamp?: Date
): NewOddsSnapshot[] {
  const ts = timestamp || new Date();
  return items.map((item) => mapKspoOdds(item, raceId, ts));
}

/**
 * Calculate odds change percentage
 */
export function calculateOddsChange(
  oldOdds: number | null,
  newOdds: number | null
): number | null {
  if (!oldOdds || !newOdds || oldOdds === 0) return null;

  return ((newOdds - oldOdds) / oldOdds) * 100;
}

/**
 * Format odds for display (e.g., 3.5 -> "3.5배")
 */
export function formatOddsDisplay(odds: number | string | null): string {
  if (odds === null || odds === undefined) return '-';

  const numOdds = typeof odds === 'string' ? parseFloat(odds) : odds;

  if (isNaN(numOdds)) return '-';

  return `${numOdds.toFixed(1)}배`;
}
