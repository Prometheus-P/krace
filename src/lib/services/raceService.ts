// src/lib/services/raceService.ts
// RaceService - High-level domain functions for race data

import { Race, Entry, Odds, RaceResult, RaceType } from '@/types';
import { fetchHorseRaceSchedules } from '../api/kraClient';
import { fetchCycleRaceSchedules } from '../api/kspoCycleClient';
import { fetchBoatRaceSchedules } from '../api/kspoBoatClient';
import { fetchRaceById, fetchRaceOdds, fetchRaceResults } from '../api';
import { getTodayYYYYMMDD } from '../utils/date';

/**
 * Race detail bundle containing race info, entries, odds, and results
 */
export interface RaceDetailBundle {
  race: Race;
  entries: Entry[];
  odds: Odds | null;
  results: RaceResult[];
}

/**
 * Fetch all races for today (all types)
 * 오늘의 경주 조회
 */
export async function getTodayRaces(): Promise<Race[]> {
  const today = getTodayYYYYMMDD();
  return getRacesByDateAndType(today);
}

/**
 * Fetch races by date and optionally by type
 * 특정 날짜/종목별 경주 조회
 * @param date Date in YYYYMMDD format
 * @param type Optional race type to filter
 */
export async function getRacesByDateAndType(
  date: string,
  type?: RaceType
): Promise<Race[]> {
  const fetchFunctions: Record<RaceType, () => Promise<Race[]>> = {
    horse: () => fetchHorseRaceSchedules(date),
    cycle: () => fetchCycleRaceSchedules(date),
    boat: () => fetchBoatRaceSchedules(date),
  };

  if (type) {
    // Fetch single type
    try {
      return await fetchFunctions[type]();
    } catch (error) {
      console.error(`Error fetching ${type} races for ${date}:`, error);
      return [];
    }
  }

  // Fetch all types in parallel
  const types: RaceType[] = ['horse', 'cycle', 'boat'];
  const results = await Promise.allSettled(
    types.map((t) => fetchFunctions[t]())
  );

  const races: Race[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      races.push(...result.value);
    }
  });

  return races;
}

/**
 * Fetch race detail with entries, odds, and results bundled together
 * 경주 상세 + 출전표 + 배당 + 결과 묶어서 조회
 * @param raceId Race ID in format type-meetCode-raceNo-date
 */
export async function getRaceDetail(
  raceId: string
): Promise<RaceDetailBundle | null> {
  // First fetch the race
  const race = await fetchRaceById(raceId);
  if (!race) {
    return null;
  }

  // Fetch odds and results in parallel (graceful degradation)
  const [oddsResult, resultsResult] = await Promise.allSettled([
    fetchRaceOdds(raceId),
    fetchRaceResults(raceId),
  ]);

  const odds = oddsResult.status === 'fulfilled' ? oddsResult.value : null;
  const results = resultsResult.status === 'fulfilled' ? resultsResult.value : [];

  return {
    race,
    entries: race.entries || [],
    odds,
    results,
  };
}
