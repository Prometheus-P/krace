/**
 * @jest-environment node
 *
 * Unit tests for SEO metadata generation
 */
import { describe, expect, it } from '@jest/globals';
import { generateRaceMetadata, isHistoricalRace, type RaceMetadataInput } from '@/lib/seo/metadata';

describe('generateRaceMetadata', () => {
  const mockRace: RaceMetadataInput = {
    id: 'horse-sel-20251211-01',
    type: 'horse',
    track: '서울',
    raceNo: 1,
    date: '2025-12-11',
    distance: 1600,
  };

  it('generates title with track and race number', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.title).toContain('서울');
    expect(metadata.title).toContain('제1경주');
    expect(metadata.title).toContain('RaceLab');
  });

  it('includes race type in Korean in title', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.title).toContain('경마');
  });

  it('includes date in title for historical races', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.title).toContain('2025-12-11');
  });

  it('generates description with track, race number, and data source', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.description).toContain('서울');
    expect(metadata.description).toContain('제1경주');
    expect(metadata.description).toContain('한국마사회(KRA)');
  });

  it('includes canonical URL with race ID', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.alternates?.canonical).toContain('/race/horse-sel-20251211-01');
  });

  it('generates openGraph metadata', () => {
    const metadata = generateRaceMetadata(mockRace);
    const og = metadata.openGraph as Record<string, unknown>;

    expect(og).toBeDefined();
    expect(og?.title).toContain('서울');
    expect(og?.type).toBe('website');
    expect(og?.siteName).toBe('RaceLab');
    expect(og?.locale).toBe('ko_KR');
  });

  it('includes openGraph images', () => {
    const metadata = generateRaceMetadata(mockRace);
    const og = metadata.openGraph as Record<string, unknown>;
    const images = og?.images as Array<{ width: number; height: number }>;

    expect(images).toBeDefined();
    expect(images).toHaveLength(1);
    expect(images?.[0].width).toBe(1200);
    expect(images?.[0].height).toBe(630);
  });

  it('generates twitter metadata', () => {
    const metadata = generateRaceMetadata(mockRace);
    const twitter = metadata.twitter as Record<string, unknown>;

    expect(twitter).toBeDefined();
    expect(twitter?.card).toBe('summary_large_image');
    expect(twitter?.title).toContain('서울');
  });

  it('uses KSPO data source for cycle racing', () => {
    const cycleRace = { ...mockRace, type: 'cycle' };
    const metadata = generateRaceMetadata(cycleRace);

    expect(metadata.description).toContain('국민체육진흥공단(KSPO)');
  });

  it('uses KSPO data source for boat racing', () => {
    const boatRace = { ...mockRace, type: 'boat' };
    const metadata = generateRaceMetadata(boatRace);

    expect(metadata.description).toContain('국민체육진흥공단(KSPO)');
  });

  it('handles missing date gracefully', () => {
    const raceWithoutDate = { ...mockRace, date: undefined };
    const metadata = generateRaceMetadata(raceWithoutDate);

    expect(metadata.title).toBeDefined();
    expect(metadata.description).toContain('오늘');
  });
});

describe('isHistoricalRace', () => {
  it('returns true for past dates', () => {
    const pastDate = '2020-01-01';
    expect(isHistoricalRace(pastDate)).toBe(true);
  });

  it('returns false for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isHistoricalRace(today)).toBe(false);
  });

  it('returns false for future dates', () => {
    const futureDate = '2099-12-31';
    expect(isHistoricalRace(futureDate)).toBe(false);
  });
});

describe('generateRaceMetadata - Historical Race Discovery', () => {
  // Tests for historical race discoverability via search engines
  // "2024년 11월 서울경마 결과 site:racelab.kr" should find pages

  it('generates searchable title for historical November 2024 race', () => {
    const historicalRace = {
      id: 'horse-sel-20241115-05',
      type: 'horse',
      track: '서울',
      raceNo: 5,
      date: '2024-11-15',
      distance: 1400,
    };
    const metadata = generateRaceMetadata(historicalRace);

    // Should include year-month for date-based search
    expect(metadata.title).toContain('2024-11');
    expect(metadata.title).toContain('서울');
  });

  it('includes full date in description for historical races', () => {
    const historicalRace = {
      id: 'horse-sel-20241115-05',
      type: 'horse',
      track: '서울',
      raceNo: 5,
      date: '2024-11-15',
    };
    const metadata = generateRaceMetadata(historicalRace);

    expect(metadata.description).toContain('2024-11-15');
  });

  it('generates unique canonical URL for each historical race', () => {
    const race1 = {
      id: 'horse-sel-20241115-01',
      type: 'horse',
      track: '서울',
      raceNo: 1,
      date: '2024-11-15',
    };
    const race2 = {
      id: 'horse-sel-20241115-02',
      type: 'horse',
      track: '서울',
      raceNo: 2,
      date: '2024-11-15',
    };

    const meta1 = generateRaceMetadata(race1);
    const meta2 = generateRaceMetadata(race2);

    expect(meta1.alternates?.canonical).not.toBe(meta2.alternates?.canonical);
    expect(meta1.alternates?.canonical).toContain('horse-sel-20241115-01');
    expect(meta2.alternates?.canonical).toContain('horse-sel-20241115-02');
  });

  it('supports multiple years of historical data', () => {
    const races = [
      { id: 'horse-sel-20230601-01', type: 'horse', track: '서울', raceNo: 1, date: '2023-06-01' },
      { id: 'horse-sel-20240601-01', type: 'horse', track: '서울', raceNo: 1, date: '2024-06-01' },
    ];

    const metadata = races.map(generateRaceMetadata);

    expect(metadata[0].title).toContain('2023-06');
    expect(metadata[1].title).toContain('2024-06');
  });
});
