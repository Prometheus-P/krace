/**
 * @jest-environment node
 *
 * Tests for sitemap generation with historical data (T019)
 * Verifies that sitemap includes historical race URLs correctly
 */
import { describe, expect, it } from '@jest/globals';
import {
  generateSitemapEntries,
  getStaticSitemapEntries,
  calculateSitemapCount,
  type RaceForSitemap,
} from '@/lib/seo/sitemap';

describe('Sitemap Generation with Historical Data', () => {
  describe('Historical race URL generation', () => {
    it('generates sitemap entries for historical races', () => {
      const historicalRaces: RaceForSitemap[] = [
        { id: 'horse-sel-20241115-01', status: 'finished', date: '2024-11-15' },
        { id: 'horse-sel-20241115-02', status: 'finished', date: '2024-11-15' },
        { id: 'horse-sel-20241116-01', status: 'finished', date: '2024-11-16' },
      ];

      const entries = generateSitemapEntries(historicalRaces);

      expect(entries).toHaveLength(3);
      expect(entries[0].url).toContain('/race/horse-sel-20241115-01');
      expect(entries[1].url).toContain('/race/horse-sel-20241115-02');
      expect(entries[2].url).toContain('/race/horse-sel-20241116-01');
    });

    it('sets correct priority for finished historical races', () => {
      const historicalRaces: RaceForSitemap[] = [
        { id: 'horse-sel-20241115-01', status: 'finished', date: '2024-11-15' },
      ];

      const entries = generateSitemapEntries(historicalRaces);

      expect(entries[0].priority).toBe(0.7);
    });

    it('sets changeFrequency to never for finished races', () => {
      const historicalRaces: RaceForSitemap[] = [
        { id: 'horse-sel-20241115-01', status: 'finished', date: '2024-11-15' },
      ];

      const entries = generateSitemapEntries(historicalRaces);

      expect(entries[0].changeFrequency).toBe('never');
    });

    it('uses race date for lastModified', () => {
      const historicalRaces: RaceForSitemap[] = [
        { id: 'horse-sel-20241115-01', status: 'finished', date: '2024-11-15' },
      ];

      const entries = generateSitemapEntries(historicalRaces);

      expect(entries[0].lastModified).toEqual(new Date('2024-11-15'));
    });
  });

  describe('Mixed today and historical races', () => {
    it('handles both upcoming and finished races', () => {
      const mixedRaces: RaceForSitemap[] = [
        { id: 'horse-sel-20241215-01', status: 'upcoming', date: '2024-12-15' },
        { id: 'horse-sel-20241115-01', status: 'finished', date: '2024-11-15' },
      ];

      const entries = generateSitemapEntries(mixedRaces);

      expect(entries).toHaveLength(2);
      // Upcoming race should have higher priority
      expect(entries[0].priority).toBe(0.9);
      // Finished race should have lower priority
      expect(entries[1].priority).toBe(0.7);
    });
  });

  describe('Large historical dataset handling', () => {
    it('calculates correct sitemap count for large datasets', () => {
      // 50,000+ races require sitemap splitting
      const totalUrls = 55000;
      const urlsPerChunk = 10000;

      const count = calculateSitemapCount(totalUrls, urlsPerChunk);

      expect(count).toBe(6); // ceil(55000/10000) = 6
    });

    it('includes static pages in URL count', () => {
      const staticEntries = getStaticSitemapEntries();
      const historicalCount = 9995;
      const totalUrls = staticEntries.length + historicalCount;

      // With 3 static + 9995 dynamic = 9998, should fit in 1 sitemap
      const count = calculateSitemapCount(totalUrls, 10000);
      expect(count).toBe(1);
    });

    it('splits when static + historical exceeds chunk size', () => {
      const staticEntries = getStaticSitemapEntries();
      const historicalCount = 10000;
      const totalUrls = staticEntries.length + historicalCount;

      // With 3 static + 10000 dynamic = 10003, needs 2 sitemaps
      const count = calculateSitemapCount(totalUrls, 10000);
      expect(count).toBe(2);
    });
  });

  describe('URL format correctness', () => {
    it('generates full URLs with domain', () => {
      const races: RaceForSitemap[] = [
        { id: 'horse-sel-20241115-01', status: 'finished', date: '2024-11-15' },
      ];

      const entries = generateSitemapEntries(races);

      expect(entries[0].url).toMatch(/^https:\/\/racelab\.kr\/race\//);
    });

    it('generates valid URLs for all race types', () => {
      const races: RaceForSitemap[] = [
        { id: 'horse-sel-20241115-01', status: 'finished', date: '2024-11-15' },
        { id: 'cycle-gwangmyeong-20241115-01', status: 'finished', date: '2024-11-15' },
        { id: 'boat-misari-20241115-01', status: 'finished', date: '2024-11-15' },
      ];

      const entries = generateSitemapEntries(races);

      expect(entries[0].url).toContain('horse-sel');
      expect(entries[1].url).toContain('cycle-gwangmyeong');
      expect(entries[2].url).toContain('boat-misari');
    });
  });
});
