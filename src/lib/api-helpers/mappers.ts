// src/lib/api-helpers/mappers.ts
import { Race, Entry, Odds, KSPOOddsResponse } from '@/types';

// Type definitions for raw API response items
export interface KRAHorseRaceItem {
  meet?: string;
  rcNo?: string;
  rcDate?: string;
  rcTime?: string;
  rcDist?: string;
  rank?: string;
  hrNo?: string;
  hrName?: string;
  jkName?: string;
  trName?: string;
  age?: string;
  wgHr?: string;
  rcRst?: string;
}

export interface KSPORaceItem {
  meet?: string;
  rcNo?: string;
  rcDate?: string;
  rcTime?: string;
  rcDist?: string;
  hrNo?: string;
  hrName?: string;
  age?: string;
  recentRecord?: string;
}

// Helper function to map KRA API response item to our internal Race type
export function mapKRAHorseRaceToRace(item: KRAHorseRaceItem): Race {
  // Extract entry data for horse races
  const entries: Entry[] = [];
  // For KRA API, entry data seems to be directly within the race item
  // based on API_SPECIFICATION.md and test mock.
  // Note: This is a simplified mapping. Real API might require separate calls for entries.
  if (item.hrNo && item.hrName) { // Check if entry data is present
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      jockey: item.jkName,
      trainer: item.trName,
      age: item.age ? parseInt(item.age) : undefined,
      weight: item.wgHr ? parseInt(item.wgHr) : undefined,
      recentRecord: item.rcRst,
      // odds will be added in Phase 2
    });
  }

  return {
    id: `horse-${item.meet || '0'}-${item.rcNo || '0'}-${item.rcDate || ''}`, // Construct unique ID
    type: 'horse',
    raceNo: item.rcNo ? parseInt(item.rcNo) : 0,
    track: item.meet === '1' ? '서울' : item.meet === '2' ? '부산경남' : '제주', // Basic mapping
    startTime: item.rcTime || '',
    distance: item.rcDist ? parseInt(item.rcDist) : undefined,
    grade: item.rank,
    status: 'upcoming', // Default status for now
    entries: entries,
  };
}

// Helper function to map KSPO Cycle API response item to our internal Race type
export function mapKSPOCycleRaceToRace(item: KSPORaceItem): Race {
  // Extract entry data for cycle races
  const entries: Entry[] = [];
  if (item.hrNo && item.hrName) { // hrNo from test mock implies entry data
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      age: item.age ? parseInt(item.age) : undefined,
      recentRecord: item.recentRecord,
    });
  }

  return {
    id: `cycle-${item.meet || '0'}-${item.rcNo || '0'}-${item.rcDate || ''}`, // Construct unique ID
    type: 'cycle',
    raceNo: item.rcNo ? parseInt(item.rcNo) : 0,
    track: item.meet === '1' ? '광명' : item.meet === '2' ? '창원' : '부산', // Basic mapping
    startTime: item.rcTime || '',
    distance: item.rcDist ? parseInt(item.rcDist) : undefined,
    grade: undefined, // Not available in this endpoint
    status: 'upcoming', // Default status for now
    entries: entries,
  };
}

// Helper function to map KSPO Boat API response item to our internal Race type
export function mapKSPOBoatRaceToRace(item: KSPORaceItem): Race {
  // Extract entry data for boat races
  const entries: Entry[] = [];
  if (item.hrNo && item.hrName) { // hrNo from test mock implies entry data
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      age: item.age ? parseInt(item.age) : undefined,
      recentRecord: item.recentRecord,
    });
  }

  return {
    id: `boat-${item.meet || '0'}-${item.rcNo || '0'}-${item.rcDate || ''}`, // Construct unique ID (meet will be constant for Boat: Misari)
    type: 'boat',
    raceNo: item.rcNo ? parseInt(item.rcNo) : 0,
    track: '미사리', // Only one track for boat, as per API_SPECIFICATION.md
    startTime: item.rcTime || '',
    distance: undefined, // Not available in this endpoint
    grade: undefined, // Not available in this endpoint
    status: 'upcoming', // Default status for now
    entries: entries,
  };
}

// Helper function to parse odds value from string
function parseOddsValue(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

// Helper function to map KSPO odds response to our internal Odds type
export function mapOddsResponse(kspoResponse: KSPOOddsResponse): Odds {
  return {
    win: parseOddsValue(kspoResponse.oddsDansng),
    place: parseOddsValue(kspoResponse.oddsBoksng),
    quinella: parseOddsValue(kspoResponse.oddsSsangsng),
  };
}