// src/lib/api-helpers/dummy.ts
// Dummy data helpers for development and fallback scenarios

import { Race, RaceType } from '@/types';

const DUMMY_HORSE_RACES: Race[] = [
  {
    id: 'horse-1-1-20240115',
    type: 'horse',
    raceNo: 1,
    track: '서울',
    startTime: '10:30',
    distance: 1200,
    grade: '일반',
    status: 'upcoming',
    entries: [
      { no: 1, name: '스피드레이서', jockey: '김철수', odds: 2.5 },
      { no: 2, name: '윈드브레이커', jockey: '이영희', odds: 3.2 },
      { no: 3, name: '썬더볼트', jockey: '박민수', odds: 5.0 },
    ],
  },
];

const DUMMY_CYCLE_RACES: Race[] = [
  {
    id: 'cycle-1-1-20240115',
    type: 'cycle',
    raceNo: 1,
    track: '광명',
    startTime: '11:00',
    distance: 1000,
    status: 'upcoming',
    entries: [
      { no: 1, name: '선수A', odds: 2.0 },
      { no: 2, name: '선수B', odds: 3.5 },
      { no: 3, name: '선수C', odds: 4.0 },
    ],
  },
];

const DUMMY_BOAT_RACES: Race[] = [
  {
    id: 'boat-1-1-20240115',
    type: 'boat',
    raceNo: 1,
    track: '미사리',
    startTime: '12:00',
    distance: 600,
    status: 'upcoming',
    entries: [
      { no: 1, name: '선수X', odds: 2.2 },
      { no: 2, name: '선수Y', odds: 3.0 },
      { no: 3, name: '선수Z', odds: 4.5 },
    ],
  },
];

/**
 * Get dummy races by type for development/fallback
 */
export function getDummyRaces(type: RaceType): Race[] {
  switch (type) {
    case 'horse':
      return DUMMY_HORSE_RACES;
    case 'cycle':
      return DUMMY_CYCLE_RACES;
    case 'boat':
      return DUMMY_BOAT_RACES;
    default:
      return [];
  }
}
