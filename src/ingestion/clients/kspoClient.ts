/**
 * KSPO (Korea Sports Promotion Organization) API Client
 *
 * Handles cycle racing and boat racing data from KSPO API.
 * Similar structure to KRA client for consistency.
 */

import { withRetry } from '../utils/retry';

const KSPO_API_BASE = 'https://apis.data.go.kr/B551014';
const KSPO_API_KEY = process.env.KSPO_API_KEY;

export interface KspoScheduleItem {
  gamePlace: string;
  gameNo: number;
  gameDate: string;
  gameTime: string;
  gameDist: number;
  gameName: string;
  grade: string;
}

export interface KspoEntryItem {
  playerNo: number;
  playerName: string;
  grade: string;
  gearRatio?: number;
  motorNo?: number;
  boatNo?: number;
  record: string;
}

export interface KspoOddsItem {
  playerNo: number;
  winOdds: number;
  plcOdds: number;
  rank: number;
}

export interface KspoResultItem {
  playerNo: number;
  rank: number;
  time: string;
  winDividend: number;
  plcDividend: number;
}

export type KspoRaceType = 'cycle' | 'boat';

/**
 * Get API endpoint based on race type
 */
function getApiEndpoint(raceType: KspoRaceType): string {
  return raceType === 'cycle' ? 'cycleRace' : 'boatRace';
}

/**
 * Fetch race schedules from KSPO API
 */
export async function fetchKspoSchedules(
  date: string,
  raceType: KspoRaceType
): Promise<KspoScheduleItem[]> {
  if (!KSPO_API_KEY) {
    console.warn('[KSPO] API key not configured, returning empty results');
    return [];
  }

  const endpoint = getApiEndpoint(raceType);

  const result = await withRetry(async () => {
    const params = new URLSearchParams({
      serviceKey: KSPO_API_KEY,
      pageNo: '1',
      numOfRows: '100',
      game_date: date.replace(/-/g, ''),
      _type: 'json',
    });

    const response = await fetch(
      `${KSPO_API_BASE}/${endpoint}/schedule?${params}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`KSPO API error: status ${response.status}`);
    }

    const data = await response.json();
    return data?.response?.body?.items?.item || [];
  });

  if (!result.success) {
    console.error('[KSPO] Failed to fetch schedules:', result.error);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [result.data].filter(Boolean);
}

/**
 * Fetch entries for a specific race from KSPO API
 */
export async function fetchKspoEntries(
  trackCode: string,
  raceNo: number,
  date: string,
  raceType: KspoRaceType
): Promise<KspoEntryItem[]> {
  if (!KSPO_API_KEY) {
    console.warn('[KSPO] API key not configured, returning empty results');
    return [];
  }

  const endpoint = getApiEndpoint(raceType);

  const result = await withRetry(async () => {
    const params = new URLSearchParams({
      serviceKey: KSPO_API_KEY,
      pageNo: '1',
      numOfRows: '30',
      game_place: trackCode,
      game_no: String(raceNo),
      game_date: date.replace(/-/g, ''),
      _type: 'json',
    });

    const response = await fetch(
      `${KSPO_API_BASE}/${endpoint}/entry?${params}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`KSPO API error: status ${response.status}`);
    }

    const data = await response.json();
    return data?.response?.body?.items?.item || [];
  });

  if (!result.success) {
    console.error('[KSPO] Failed to fetch entries:', result.error);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [result.data].filter(Boolean);
}

/**
 * Fetch current odds from KSPO API
 */
export async function fetchKspoOdds(
  trackCode: string,
  raceNo: number,
  date: string,
  raceType: KspoRaceType
): Promise<KspoOddsItem[]> {
  if (!KSPO_API_KEY) {
    console.warn('[KSPO] API key not configured, returning empty results');
    return [];
  }

  const endpoint = getApiEndpoint(raceType);

  const result = await withRetry(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KSPO_API_KEY,
        game_place: trackCode,
        game_no: String(raceNo),
        game_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      const response = await fetch(
        `${KSPO_API_BASE}/${endpoint}/odds?${params}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error(`KSPO API error: status ${response.status}`);
      }

      const data = await response.json();
      return data?.response?.body?.items?.item || [];
    },
    { maxRetries: 3 }
  );

  if (!result.success) {
    console.error('[KSPO] Failed to fetch odds:', result.error);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [result.data].filter(Boolean);
}

/**
 * Fetch race results from KSPO API
 */
export async function fetchKspoResults(
  trackCode: string,
  raceNo: number,
  date: string,
  raceType: KspoRaceType
): Promise<KspoResultItem[]> {
  if (!KSPO_API_KEY) {
    console.warn('[KSPO] API key not configured, returning empty results');
    return [];
  }

  const endpoint = getApiEndpoint(raceType);

  const result = await withRetry(async () => {
    const params = new URLSearchParams({
      serviceKey: KSPO_API_KEY,
      pageNo: '1',
      numOfRows: '30',
      game_place: trackCode,
      game_no: String(raceNo),
      game_date: date.replace(/-/g, ''),
      _type: 'json',
    });

    const response = await fetch(
      `${KSPO_API_BASE}/${endpoint}/result?${params}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`KSPO API error: status ${response.status}`);
    }

    const data = await response.json();
    return data?.response?.body?.items?.item || [];
  });

  if (!result.success) {
    console.error('[KSPO] Failed to fetch results:', result.error);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [result.data].filter(Boolean);
}
