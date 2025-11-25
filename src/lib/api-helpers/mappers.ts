// src/lib/api-helpers/mappers.ts
import { Race, Entry } from '@/types';

// Helper function to map KRA API response item to our internal Race type
export function mapKRAHorseRaceToRace(item: any): Race {
  // Extract entry data for horse races
  const entries: Entry[] = [];
  // For KRA API, entry data seems to be directly within the race item
  // based on API_SPECIFICATION.md and test mock.
  // Note: This is a simplified mapping. Real API might require separate calls for entries.
  if (item.hrNo) { // Check if entry data is present
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      jockey: item.jkName,
      trainer: item.trName,
      age: parseInt(item.age),
      weight: parseInt(item.wgHr),
      recentRecord: item.rcRst,
      // odds will be added in Phase 2
    });
  }

  return {
    id: `horse-${item.meet}-${item.rcNo}-${item.rcDate}`, // Construct unique ID
    type: 'horse',
    raceNo: parseInt(item.rcNo),
    track: item.meet === '1' ? '서울' : item.meet === '2' ? '부산경남' : '제주', // Basic mapping
    startTime: item.rcTime,
    distance: parseInt(item.rcDist),
    grade: item.rank,
    status: 'upcoming', // Default status for now
    entries: entries,
  };
}

// Helper function to map KSPO Cycle API response item to our internal Race type
export function mapKSPOCycleRaceToRace(item: any): Race {
  // Extract entry data for cycle races
  const entries: Entry[] = [];
  if (item.hrNo) { // hrNo from test mock implies entry data
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      age: parseInt(item.age),
      recentRecord: item.recentRecord,
    });
  }

  return {
    id: `cycle-${item.meet}-${item.rcNo}-${item.rcDate}`, // Construct unique ID
    type: 'cycle',
    raceNo: parseInt(item.rcNo),
    track: item.meet === '1' ? '광명' : item.meet === '2' ? '창원' : '부산', // Basic mapping
    startTime: item.rcTime,
    distance: parseInt(item.rcDist),
    grade: undefined, // Not available in this endpoint
    status: 'upcoming', // Default status for now
    entries: entries,
  };
}

// Helper function to map KSPO Boat API response item to our internal Race type
export function mapKSPOBoatRaceToRace(item: any): Race {
  // Extract entry data for boat races
  const entries: Entry[] = [];
  if (item.hrNo) { // hrNo from test mock implies entry data
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      age: parseInt(item.age),
      recentRecord: item.recentRecord,
    });
  }

  return {
    id: `boat-${item.meet}-${item.rcNo}-${item.rcDate}`, // Construct unique ID (meet will be constant for Boat: Misari)
    type: 'boat',
    raceNo: parseInt(item.rcNo),
    track: '미사리', // Only one track for boat, as per API_SPECIFICATION.md
    startTime: item.rcTime,
    distance: undefined, // Not available in this endpoint (or is it? API_SPECIFICATION.md has it as 파라미터가 경륜과 동일, 경륜 Response fields 에는 distance 있음)
    grade: undefined, // Not available in this endpoint
    status: 'upcoming', // Default status for now
    entries: entries,
  };
}