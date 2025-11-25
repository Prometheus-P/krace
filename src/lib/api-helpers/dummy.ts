// src/lib/api-helpers/dummy.ts
import { Race } from '@/types';
import { mapKRAHorseRaceToRace, mapKSPOCycleRaceToRace, mapKSPOBoatRaceToRace } from './mappers';

// Function to generate dummy horse race data as per DEVELOPMENT_GUIDE.md
export function getDummyHorseRaces(rcDate: string = '20240115'): Race[] {
  return [
    mapKRAHorseRaceToRace({ meet: '1', rcNo: '1', rcDate, rcTime: '11:30', rcDist: '1200', rank: '국산5등급' }),
    mapKRAHorseRaceToRace({ meet: '2', rcNo: '2', rcDate, rcTime: '12:00', rcDist: '1400', rank: '국산4등급' }),
  ];
}

// Function to generate dummy cycle race data
export function getDummyCycleRaces(rcDate: string = '20240115'): Race[] {
  return [
    mapKSPOCycleRaceToRace({ meet: '1', rcNo: '1', rcDate, rcTime: '11:00', rcDist: '1000' }),
    mapKSPOCycleRaceToRace({ meet: '2', rcNo: '2', rcDate, rcTime: '12:00', rcDist: '1200' }),
  ];
}

// Function to generate dummy boat race data
export function getDummyBoatRaces(rcDate: string = '20240115'): Race[] {
  return [
    mapKSPOBoatRaceToRace({ meet: '1', rcNo: '1', rcDate, rcTime: '10:30' }),
    mapKSPOBoatRaceToRace({ meet: '1', rcNo: '2', rcDate, rcTime: '11:00' }),
  ];
}
