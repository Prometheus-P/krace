/**
 * @jest-environment node
 *
 * Integration tests for race detail page metadata generation (T018)
 * Verifies that generateMetadata in src/app/race/[id]/page.tsx produces
 * correct dynamic metadata for SEO.
 */
import { describe, expect, it } from '@jest/globals';
import { generateRaceMetadata } from '@/lib/seo/metadata';

describe('Race Detail Page Metadata Integration', () => {
  // Mock race data simulating what would be fetched from API
  const mockHorseRace = {
    id: 'horse-sel-20241215-03',
    type: 'horse',
    track: '서울',
    raceNo: 3,
    date: '2024-12-15',
    distance: 1400,
  };

  const mockCycleRace = {
    id: 'cycle-gwangmyeong-20241215-05',
    type: 'cycle',
    track: '광명',
    raceNo: 5,
    date: '2024-12-15',
    distance: 1000,
  };

  describe('Dynamic title generation', () => {
    it('generates unique title for each race', () => {
      const meta1 = generateRaceMetadata(mockHorseRace);
      const meta2 = generateRaceMetadata(mockCycleRace);

      expect(meta1.title).not.toBe(meta2.title);
    });

    it('includes track name in title', () => {
      const metadata = generateRaceMetadata(mockHorseRace);

      expect(metadata.title).toContain('서울');
    });

    it('includes race number in title', () => {
      const metadata = generateRaceMetadata(mockHorseRace);

      expect(metadata.title).toContain('제3경주');
    });

    it('includes race type in Korean in title', () => {
      const horseMetadata = generateRaceMetadata(mockHorseRace);
      const cycleMetadata = generateRaceMetadata(mockCycleRace);

      expect(horseMetadata.title).toContain('경마');
      expect(cycleMetadata.title).toContain('경륜');
    });

    it('includes site name in title', () => {
      const metadata = generateRaceMetadata(mockHorseRace);

      expect(metadata.title).toContain('RaceLab');
    });
  });

  describe('Dynamic description generation', () => {
    it('generates description with track and race number', () => {
      const metadata = generateRaceMetadata(mockHorseRace);

      expect(metadata.description).toContain('서울');
      expect(metadata.description).toContain('제3경주');
    });

    it('includes correct data source for horse racing', () => {
      const metadata = generateRaceMetadata(mockHorseRace);

      expect(metadata.description).toContain('한국마사회');
    });

    it('includes correct data source for cycle racing', () => {
      const metadata = generateRaceMetadata(mockCycleRace);

      expect(metadata.description).toContain('국민체육진흥공단');
    });
  });

  describe('Canonical URL generation', () => {
    it('generates canonical URL with race ID', () => {
      const metadata = generateRaceMetadata(mockHorseRace);

      expect(metadata.alternates?.canonical).toContain('/race/horse-sel-20241215-03');
    });

    it('generates unique canonical URL for each race', () => {
      const meta1 = generateRaceMetadata(mockHorseRace);
      const meta2 = generateRaceMetadata(mockCycleRace);

      expect(meta1.alternates?.canonical).not.toBe(meta2.alternates?.canonical);
    });
  });

  describe('OpenGraph metadata', () => {
    it('generates OpenGraph title matching page title', () => {
      const metadata = generateRaceMetadata(mockHorseRace);
      const og = metadata.openGraph as Record<string, unknown>;

      expect(og?.title).toBeDefined();
      expect(og?.title).toContain('서울');
    });

    it('sets correct OpenGraph type', () => {
      const metadata = generateRaceMetadata(mockHorseRace);
      const og = metadata.openGraph as Record<string, unknown>;

      expect(og?.type).toBe('website');
    });

    it('includes OpenGraph image for social sharing', () => {
      const metadata = generateRaceMetadata(mockHorseRace);
      const og = metadata.openGraph as Record<string, unknown>;
      const images = og?.images as Array<{ width: number; height: number }>;

      expect(images).toBeDefined();
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Twitter card metadata', () => {
    it('generates Twitter card metadata', () => {
      const metadata = generateRaceMetadata(mockHorseRace);
      const twitter = metadata.twitter as Record<string, unknown>;

      expect(twitter).toBeDefined();
      expect(twitter?.card).toBe('summary_large_image');
    });
  });
});
