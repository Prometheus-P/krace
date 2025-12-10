/**
 * Database Type Definitions
 * Re-exports schema types and defines additional types for type safety
 */

// Re-export schema types
export type {
  Track,
  Race,
  Entry,
  OddsSnapshot,
  Result,
  IngestionFailure,
  NewTrack,
  NewRace,
  NewEntry,
  NewOddsSnapshot,
  NewResult,
  NewIngestionFailure,
} from '@/lib/db/schema';

// Enum types for type safety
export type RaceType = 'horse' | 'cycle' | 'boat';
export type RaceStatus = 'scheduled' | 'upcoming' | 'live' | 'finished' | 'canceled' | 'postponed';
export type EntryStatus = 'active' | 'scratched';
export type EntityType = 'horse' | 'cyclist' | 'boat_racer';
export type IngestionSource = 'kra' | 'kspo';

// Query result types
export interface RaceWithEntries {
  id: string;
  raceType: string;
  trackId: number | null;
  raceNo: number;
  raceDate: string;
  startTime: string | null;
  distance: number | null;
  grade: string | null;
  status: string;
  entries: Array<{
    id: number;
    entryNo: number;
    name: string;
    jockeyName: string | null;
    rating: number | null;
  }>;
}

export interface RaceWithResults {
  id: string;
  raceType: string;
  raceNo: number;
  raceDate: string;
  results: Array<{
    entryNo: number;
    finishPosition: number;
    time: string | null;
    dividendWin: number | null;
    dividendPlace: number | null;
  }>;
}

export interface OddsSummary {
  raceId: string;
  entryNo: number;
  oddsOpen: number;
  oddsClose: number;
  oddsHigh: number;
  oddsLow: number;
  oddsChange: number; // (close - open) / open * 100
  snapshotCount: number;
}

// Ingestion job types
export interface IngestionJobData {
  date?: string;
  raceTypes?: RaceType[];
  raceIds?: string[];
}

export interface IngestionResult {
  collected: number;
  skipped: number;
  errors: number;
}
