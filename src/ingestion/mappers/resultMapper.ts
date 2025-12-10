/**
 * Result Mapper
 *
 * Transforms raw API responses into database-ready result records.
 */

import type { NewResult } from '@/lib/db/schema';
import type { KraResultItem } from '../clients/kraClient';
import type { KspoResultItem } from '../clients/kspoClient';

/**
 * Map KRA result item to NewResult (horse racing)
 */
export function mapKraResult(item: KraResultItem, raceId: string): NewResult {
  return {
    raceId,
    entryNo: item.hrNo,
    finishPosition: item.ord,
    time: parseRaceTime(item.rcTime),
    dividendWin: item.chaksun1 ? item.chaksun1 * 100 : null, // Convert to KRW
    dividendPlace: item.chaksun2 ? item.chaksun2 * 100 : null,
  };
}

/**
 * Map KSPO result item to NewResult (cycle/boat racing)
 */
export function mapKspoResult(item: KspoResultItem, raceId: string): NewResult {
  return {
    raceId,
    entryNo: item.playerNo,
    finishPosition: item.rank,
    time: parseRaceTime(item.time),
    dividendWin: item.winDividend || null,
    dividendPlace: item.plcDividend || null,
  };
}

/**
 * Batch map KRA result items
 */
export function mapKraResults(items: KraResultItem[], raceId: string): NewResult[] {
  return items
    .filter((item) => item.ord > 0) // Filter out non-finishers
    .sort((a, b) => a.ord - b.ord) // Sort by finish position
    .map((item) => mapKraResult(item, raceId));
}

/**
 * Batch map KSPO result items
 */
export function mapKspoResults(items: KspoResultItem[], raceId: string): NewResult[] {
  return items
    .filter((item) => item.rank > 0)
    .sort((a, b) => a.rank - b.rank)
    .map((item) => mapKspoResult(item, raceId));
}

/**
 * Parse race time string to decimal seconds
 * Handles formats: "1:12.5", "72.5", "1분12초5"
 */
function parseRaceTime(timeStr: string | null | undefined): string | null {
  if (!timeStr) return null;

  // Already in seconds format
  if (/^\d+\.?\d*$/.test(timeStr)) {
    return timeStr;
  }

  // Format: "1:12.5" (min:sec.ms)
  const colonMatch = timeStr.match(/^(\d+):(\d+\.?\d*)$/);
  if (colonMatch) {
    const minutes = parseInt(colonMatch[1], 10);
    const seconds = parseFloat(colonMatch[2]);
    return String(minutes * 60 + seconds);
  }

  // Format: "1분12초5" (Korean)
  const koreanMatch = timeStr.match(/(\d+)분(\d+)초(\d*)/);
  if (koreanMatch) {
    const minutes = parseInt(koreanMatch[1], 10);
    const seconds = parseInt(koreanMatch[2], 10);
    const ms = koreanMatch[3] ? parseInt(koreanMatch[3], 10) / 10 : 0;
    return String(minutes * 60 + seconds + ms);
  }

  return null;
}

/**
 * Calculate margin between finishers (for display)
 */
export function calculateMargin(
  currentTime: string | null,
  previousTime: string | null
): string | null {
  if (!currentTime || !previousTime) return null;

  const diff = parseFloat(currentTime) - parseFloat(previousTime);

  if (diff < 0.1) return '목';
  if (diff < 0.3) return '코';
  if (diff < 0.5) return '1/2마신';
  if (diff < 1.0) return '1마신';
  if (diff < 2.0) return `${Math.round(diff)}마신`;

  return `${diff.toFixed(1)}초`;
}
