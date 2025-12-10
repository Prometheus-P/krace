/**
 * Schedule Mapper
 *
 * Transforms raw API responses into database-ready race records.
 */

import type { NewRace } from '@/lib/db/schema';
import type { KraScheduleItem } from '../clients/kraClient';
import type { KspoScheduleItem } from '../clients/kspoClient';
import type { RaceType } from '@/types/db';

/**
 * Map KRA track code to database track ID
 */
const KRA_TRACK_MAP: Record<string, number> = {
  '1': 1, // 서울
  '2': 2, // 부산경남
  '3': 3, // 제주
};

/**
 * Map KSPO track code to database track ID
 */
const KSPO_TRACK_MAP: Record<string, number> = {
  gwangmyeong: 4,
  changwon: 5,
  busan: 6,
  misari: 7,
};

/**
 * Generate unique race ID
 * Format: {type}-{trackCode}-{raceNo}-{YYYYMMDD}
 */
export function generateRaceId(
  raceType: RaceType,
  trackCode: string,
  raceNo: number,
  date: string
): string {
  const dateStr = date.replace(/-/g, '');
  return `${raceType}-${trackCode}-${raceNo}-${dateStr}`;
}

/**
 * Map KRA schedule item to NewRace
 */
export function mapKraSchedule(item: KraScheduleItem, date: string): NewRace {
  const trackCode = item.meet;
  const trackId = KRA_TRACK_MAP[trackCode] || null;

  return {
    id: generateRaceId('horse', trackCode, item.rcNo, date),
    raceType: 'horse',
    trackId,
    raceNo: item.rcNo,
    raceDate: date,
    startTime: item.rcTime ? formatTime(item.rcTime) : null,
    distance: item.rcDist || null,
    grade: item.rank || null,
    status: 'scheduled',
    weather: item.weather || null,
    trackCondition: item.budam || null,
  };
}

/**
 * Map KSPO schedule item to NewRace
 */
export function mapKspoSchedule(
  item: KspoScheduleItem,
  date: string,
  raceType: 'cycle' | 'boat'
): NewRace {
  const trackCode = item.gamePlace?.toLowerCase() || '';
  const trackId = KSPO_TRACK_MAP[trackCode] || null;

  return {
    id: generateRaceId(raceType, trackCode, item.gameNo, date),
    raceType,
    trackId,
    raceNo: item.gameNo,
    raceDate: date,
    startTime: item.gameTime ? formatTime(item.gameTime) : null,
    distance: item.gameDist || null,
    grade: item.grade || null,
    status: 'scheduled',
  };
}

/**
 * Batch map KRA schedule items
 */
export function mapKraSchedules(items: KraScheduleItem[], date: string): NewRace[] {
  return items.map((item) => mapKraSchedule(item, date));
}

/**
 * Batch map KSPO schedule items
 */
export function mapKspoSchedules(
  items: KspoScheduleItem[],
  date: string,
  raceType: 'cycle' | 'boat'
): NewRace[] {
  return items.map((item) => mapKspoSchedule(item, date, raceType));
}

/**
 * Format time string to HH:MM format
 */
function formatTime(time: string): string {
  // Handle various formats: "1000", "10:00", "10:00:00"
  const cleaned = time.replace(/[^0-9]/g, '');

  if (cleaned.length >= 4) {
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
  }

  return time;
}
