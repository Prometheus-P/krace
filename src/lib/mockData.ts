import { Race } from '@/types';
export { MOCK_HISTORICAL_RACES } from './mockHistoricalResults';

export const MOCK_RACES: Race[] = [
  {
    id: 'horse-1-1-20240115',
    type: 'horse',
    raceNo: 1,
    track: '서울',
    startTime: '10:30',
    distance: 1200,
    grade: '일반',
    status: 'finished',
    entries: [
      {
        no: 1,
        name: '스피드레이서',
        jockey: '김철수',
        trainer: '박코치',
        age: 3,
        weight: 54,
        recentRecord: '1-2-3',
        odds: 2.5
      },
      {
        no: 2,
        name: '윈드브레이커',
        jockey: '이영희',
        trainer: '최감독',
        age: 4,
        weight: 56,
        recentRecord: '3-1-2',
        odds: 3.2
      },
      {
        no: 3,
        name: '썬더볼트',
        jockey: '박민수',
        trainer: '정매니저',
        age: 3,
        weight: 55,
        recentRecord: '2-3-1',
        odds: 5.0
      }
    ]
  }
];
