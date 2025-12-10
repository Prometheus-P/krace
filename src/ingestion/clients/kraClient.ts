/**
 * KRA (Korea Racing Authority) API Client
 *
 * Wraps the existing KRA API functions for use in the ingestion pipeline.
 * Handles horse racing data: schedules, entries, odds, and results.
 */

import { withRetry } from '../utils/retry';

const KRA_API_BASE = 'https://apis.data.go.kr/B551015';
const KRA_API_KEY = process.env.KRA_API_KEY;

export interface KraScheduleItem {
  meet: string;
  rcNo: number;
  rcDate: string;
  rcTime: string;
  rcDist: number;
  rcName: string;
  rank: string;
  weather: string;
  budam: string;
}

export interface KraEntryItem {
  hrNo: number;
  hrName: string;
  jkName: string;
  trName: string;
  owName: string;
  age: number;
  sex: string;
  wgBudam: number;
  wgHr: number;
  rating: number;
  rcsPt: string;
}

export interface KraOddsItem {
  hrNo: number;
  winOdds: number;
  plcOdds: number;
  ord: number;
}

export interface KraResultItem {
  hrNo: number;
  ord: number;
  rcTime: string;
  winOdds: number;
  plcOdds: number;
  chaksun1: number;
  chaksun2: number;
}

/**
 * Fetch race schedules for a specific date from KRA API
 */
export async function fetchKraSchedules(date: string): Promise<KraScheduleItem[]> {
  if (!KRA_API_KEY) {
    console.warn('[KRA] API key not configured, returning empty results');
    return [];
  }

  const result = await withRetry(async () => {
    const params = new URLSearchParams({
      serviceKey: KRA_API_KEY,
      pageNo: '1',
      numOfRows: '100',
      rc_date: date.replace(/-/g, ''),
      _type: 'json',
    });

    const response = await fetch(
      `${KRA_API_BASE}/API186_1/raceInfo_1?${params}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error(`KRA API error: status ${response.status}`);
    }

    const data = await response.json();
    return data?.response?.body?.items?.item || [];
  });

  if (!result.success) {
    console.error('[KRA] Failed to fetch schedules:', result.error);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [result.data].filter(Boolean);
}

/**
 * Fetch entries for a specific race from KRA API
 */
export async function fetchKraEntries(
  trackCode: string,
  raceNo: number,
  date: string
): Promise<KraEntryItem[]> {
  if (!KRA_API_KEY) {
    console.warn('[KRA] API key not configured, returning empty results');
    return [];
  }

  const result = await withRetry(async () => {
    const params = new URLSearchParams({
      serviceKey: KRA_API_KEY,
      pageNo: '1',
      numOfRows: '30',
      meet: trackCode,
      rc_no: String(raceNo),
      rc_date: date.replace(/-/g, ''),
      _type: 'json',
    });

    const response = await fetch(
      `${KRA_API_BASE}/API323/SeoulRace_1?${params}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`KRA API error: status ${response.status}`);
    }

    const data = await response.json();
    return data?.response?.body?.items?.item || [];
  });

  if (!result.success) {
    console.error('[KRA] Failed to fetch entries:', result.error);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [result.data].filter(Boolean);
}

/**
 * Fetch current odds for a specific race from KRA API
 */
export async function fetchKraOdds(
  trackCode: string,
  raceNo: number,
  date: string
): Promise<KraOddsItem[]> {
  if (!KRA_API_KEY) {
    console.warn('[KRA] API key not configured, returning empty results');
    return [];
  }

  const result = await withRetry(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KRA_API_KEY,
        meet: trackCode,
        rc_no: String(raceNo),
        rc_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      const response = await fetch(
        `${KRA_API_BASE}/API214_17/oddsInfo_1?${params}`,
        { cache: 'no-store' } // Always fetch fresh odds
      );

      if (!response.ok) {
        throw new Error(`KRA API error: status ${response.status}`);
      }

      const data = await response.json();
      return data?.response?.body?.items?.item || [];
    },
    { maxRetries: 3 } // Fewer retries for time-sensitive odds
  );

  if (!result.success) {
    console.error('[KRA] Failed to fetch odds:', result.error);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [result.data].filter(Boolean);
}

/**
 * Fetch race results from KRA API
 */
export async function fetchKraResults(
  trackCode: string,
  raceNo: number,
  date: string
): Promise<KraResultItem[]> {
  if (!KRA_API_KEY) {
    console.warn('[KRA] API key not configured, returning empty results');
    return [];
  }

  const result = await withRetry(async () => {
    const params = new URLSearchParams({
      serviceKey: KRA_API_KEY,
      pageNo: '1',
      numOfRows: '30',
      meet: trackCode,
      rc_no: String(raceNo),
      rc_date: date.replace(/-/g, ''),
      _type: 'json',
    });

    const response = await fetch(
      `${KRA_API_BASE}/API299/result_1?${params}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`KRA API error: status ${response.status}`);
    }

    const data = await response.json();
    return data?.response?.body?.items?.item || [];
  });

  if (!result.success) {
    console.error('[KRA] Failed to fetch results:', result.error);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [result.data].filter(Boolean);
}
