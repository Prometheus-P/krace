// src/app/sitemap.test.ts
import sitemap, { generateSitemaps } from './sitemap';
import {
  fetchHorseRaceSchedules,
  fetchCycleRaceSchedules,
  fetchBoatRaceSchedules,
  fetchHistoricalRaceIds,
  getHistoricalRaceCount,
} from '@/lib/api';
import { Race } from '@/types';

jest.mock('@/lib/api', () => ({
  fetchHorseRaceSchedules: jest.fn(),
  fetchCycleRaceSchedules: jest.fn(),
  fetchBoatRaceSchedules: jest.fn(),
  fetchHistoricalRaceIds: jest.fn(),
  getHistoricalRaceCount: jest.fn(),
}));

describe('sitemap', () => {
  const mockHorseRaces: Race[] = [
    {
      id: 'horse-1-1-20240115',
      type: 'horse',
      raceNo: 1,
      track: '서울',
      startTime: '11:30',
      distance: 1200,
      status: 'upcoming',
      entries: [],
    },
  ];
  const mockCycleRaces: Race[] = [
    {
      id: 'cycle-1-1-20240115',
      type: 'cycle',
      raceNo: 1,
      track: '광명',
      startTime: '11:00',
      distance: 1000,
      status: 'upcoming',
      entries: [],
    },
  ];

  beforeEach(() => {
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(mockHorseRaces);
    (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue(mockCycleRaces);
    (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue([]);
    (fetchHistoricalRaceIds as jest.Mock).mockResolvedValue([]);
    (getHistoricalRaceCount as jest.Mock).mockResolvedValue(0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a sitemap with static and dynamic routes', async () => {
    const sitemapEntries = await sitemap({ id: 0 });

    const urls = sitemapEntries.map((entry) => entry.url);

    // Check for static routes
    expect(urls).toContain('https://racelab.kr/');

    // Check for dynamic race routes
    expect(urls).toContain('https://racelab.kr/race/horse-1-1-20240115');
    expect(urls).toContain('https://racelab.kr/race/cycle-1-1-20240115');

    // Check that there are no boat races in the sitemap for this test
    expect(urls.some((url) => url.includes('/boat-'))).toBe(false);
  });

  it('should generate multiple sitemaps for large datasets', async () => {
    (getHistoricalRaceCount as jest.Mock).mockResolvedValue(25000);

    const sitemaps = await generateSitemaps();

    // 3 static + 25000 races = 25003 → 3 chunks (10000 per chunk)
    expect(sitemaps.length).toBe(3);
    expect(sitemaps[0].id).toBe(0);
    expect(sitemaps[2].id).toBe(2);
  });

  it('should fallback to single sitemap on error', async () => {
    (getHistoricalRaceCount as jest.Mock).mockRejectedValue(new Error('API error'));

    const sitemaps = await generateSitemaps();

    expect(sitemaps.length).toBe(1);
    expect(sitemaps[0].id).toBe(0);
  });
});
