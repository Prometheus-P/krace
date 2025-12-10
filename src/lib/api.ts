// src/lib/api.ts
// Barrel file for API functions

import {
  Race,
  Entry,
  RaceResult,
  Odds,
  HistoricalRace,
  ResultsSearchParams,
  PaginatedResults,
  RaceType,
} from '@/types';

import { MOCK_HISTORICAL_RACES } from './mockHistoricalResults';
import { getDummyRaces } from './api-helpers/dummy';

// Re-export client functions
export { fetchHorseRaceSchedules } from './api/kraClient';
export { fetchCycleRaceSchedules } from './api/kspoCycleClient';
export { fetchBoatRaceSchedules } from './api/kspoBoatClient';

/**
 * Fetch race by ID
 * @param id Race ID in format type-meetCode-raceNo-date
 */
export async function fetchRaceById(id: string): Promise<Race | null> {
  // Parse ID to get type and date
  const parts = id.split('-');
  if (parts.length < 4) {
    console.warn(`Invalid race ID format: ${id}`);
    return null;
  }

  const [type, _meetCode, _raceNo, date] = parts;

  // Get races for that date and type
  let races: Race[] = [];

  try {
    if (type === 'horse') {
      const { fetchHorseRaceSchedules } = await import('./api/kraClient');
      races = await fetchHorseRaceSchedules(date);
    } else if (type === 'cycle') {
      const { fetchCycleRaceSchedules } = await import('./api/kspoCycleClient');
      races = await fetchCycleRaceSchedules(date);
    } else if (type === 'boat') {
      const { fetchBoatRaceSchedules } = await import('./api/kspoBoatClient');
      races = await fetchBoatRaceSchedules(date);
    }
  } catch (error) {
    console.error(`Error fetching race ${id}:`, error);
  }

  // If no races from API, try dummy data
  if (races.length === 0) {
    races = getDummyRaces(type as RaceType);
  }

  // Find the race by ID
  const race = races.find((r) => r.id === id);
  return race || null;
}

/**
 * Fetch entries for a specific race
 * @param raceId Race ID in format type-meetCode-raceNo-date
 */
export async function fetchRaceEntries(raceId: string): Promise<Entry[]> {
  const race = await fetchRaceById(raceId);
  return race?.entries || [];
}

/**
 * Fetch odds for a specific race
 * @param raceId Race ID in format type-meetCode-raceNo-date
 */
export async function fetchRaceOdds(_raceId: string): Promise<Odds | null> {
  // TODO: Implement actual odds fetching from API
  // For now, return null as odds are not yet available
  return null;
}

/**
 * Fetch results for a specific race
 * @param raceId Race ID in format type-meetCode-raceNo-date
 */
export async function fetchRaceResults(_raceId: string): Promise<RaceResult[]> {
  // TODO: Implement actual results fetching from API
  // For now, return empty array
  return [];
}

/**
 * Fetch historical race results with pagination and filtering
 */
export async function fetchHistoricalResults(
  params: ResultsSearchParams
): Promise<PaginatedResults<HistoricalRace>> {
  const { page = 1, limit = 20, types, dateFrom, dateTo, track, jockey: _jockey } = params;

  // Filter mock data based on params
  let filteredRaces = [...MOCK_HISTORICAL_RACES];

  if (types && types.length > 0) {
    filteredRaces = filteredRaces.filter((race) => types.includes(race.type));
  }

  if (dateFrom) {
    filteredRaces = filteredRaces.filter((race) => race.date >= dateFrom);
  }

  if (dateTo) {
    filteredRaces = filteredRaces.filter((race) => race.date <= dateTo);
  }

  if (track) {
    filteredRaces = filteredRaces.filter((race) =>
      race.track.toLowerCase().includes(track.toLowerCase())
    );
  }

  // Calculate pagination
  const total = filteredRaces.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const items = filteredRaces.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetch a specific historical race result by ID
 */
export async function fetchHistoricalResultById(
  id: string
): Promise<HistoricalRace | null> {
  const race = MOCK_HISTORICAL_RACES.find((r) => r.id === id);
  return race || null;
}

/**
 * Fetch horse entry detail (for detailed entry information)
 */
export async function fetchHorseEntryDetail(
  raceId: string
): Promise<Entry[] | null> {
  const race = await fetchRaceById(raceId);
  return race?.entries || null;
}
