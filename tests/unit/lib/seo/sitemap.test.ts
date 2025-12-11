/**
 * @jest-environment node
 *
 * Unit tests for sitemap generation utilities
 */
import { describe, expect, it } from '@jest/globals';
import {
  shouldSplitSitemap,
  generateSitemapEntries,
  getStaticSitemapEntries,
  calculateSitemapCount,
  getSitemapChunkParams,
  getChunkOffset,
  sliceRacesForChunk,
  type RaceForSitemap,
} from '@/lib/seo/sitemap';

describe('shouldSplitSitemap', () => {
  it('returns false for less than 50000 URLs', () => {
    expect(shouldSplitSitemap(49999)).toBe(false);
  });

  it('returns true for exactly 50000 URLs', () => {
    expect(shouldSplitSitemap(50000)).toBe(true);
  });

  it('returns true for more than 50000 URLs', () => {
    expect(shouldSplitSitemap(50001)).toBe(true);
  });

  it('returns false for 0 URLs', () => {
    expect(shouldSplitSitemap(0)).toBe(false);
  });
});

describe('generateSitemapEntries', () => {
  const mockRaces: RaceForSitemap[] = [
    { id: 'race-1', status: 'finished', date: '2025-12-10' },
    { id: 'race-2', status: 'upcoming', date: '2025-12-11' },
    { id: 'race-3', status: 'live', date: '2025-12-11' },
  ];

  it('generates sitemap entries for all races', () => {
    const entries = generateSitemapEntries(mockRaces);

    expect(entries).toHaveLength(3);
  });

  it('includes correct URL format for each race', () => {
    const entries = generateSitemapEntries(mockRaces);

    expect(entries[0].url).toContain('/race/race-1');
    expect(entries[1].url).toContain('/race/race-2');
  });

  it('sets correct priority for finished races (0.7)', () => {
    const races = [{ id: 'finished-race', status: 'finished', date: '2025-12-10' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].priority).toBe(0.7);
  });

  it('sets correct priority for upcoming races (0.9)', () => {
    const races = [{ id: 'upcoming-race', status: 'upcoming', date: '2025-12-11' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].priority).toBe(0.9);
  });

  it('sets changeFrequency to never for finished races', () => {
    const races = [{ id: 'finished-race', status: 'finished', date: '2025-12-10' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].changeFrequency).toBe('never');
  });

  it('sets changeFrequency to hourly for upcoming races', () => {
    const races = [{ id: 'upcoming-race', status: 'upcoming', date: '2025-12-11' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].changeFrequency).toBe('hourly');
  });

  it('sets changeFrequency to hourly for live races', () => {
    const races = [{ id: 'live-race', status: 'live', date: '2025-12-11' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].changeFrequency).toBe('hourly');
  });

  it('uses updatedAt for lastModified when available', () => {
    const races = [
      { id: 'race-1', status: 'finished', date: '2025-12-10', updatedAt: '2025-12-10T15:00:00Z' },
    ];
    const entries = generateSitemapEntries(races);

    expect(entries[0].lastModified).toEqual(new Date('2025-12-10T15:00:00Z'));
  });

  it('falls back to date for lastModified when updatedAt not available', () => {
    const races = [{ id: 'race-1', status: 'finished', date: '2025-12-10' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].lastModified).toEqual(new Date('2025-12-10'));
  });

  it('handles empty array', () => {
    const entries = generateSitemapEntries([]);

    expect(entries).toHaveLength(0);
  });
});

describe('getStaticSitemapEntries', () => {
  it('returns entries for homepage', () => {
    const entries = getStaticSitemapEntries();
    // Homepage is the entry without any path after domain, or priority 1.0
    const homepage = entries.find((e) => e.priority === 1.0);

    expect(homepage).toBeDefined();
    expect(homepage?.changeFrequency).toBe('hourly');
  });

  it('returns entries for results page', () => {
    const entries = getStaticSitemapEntries();
    const results = entries.find((e) => e.url.includes('/results'));

    expect(results).toBeDefined();
    expect(results?.priority).toBe(0.9);
    expect(results?.changeFrequency).toBe('always');
  });

  it('returns entries for guide page', () => {
    const entries = getStaticSitemapEntries();
    const guide = entries.find((e) => e.url.includes('/guide'));

    expect(guide).toBeDefined();
    expect(guide?.priority).toBe(0.8);
    expect(guide?.changeFrequency).toBe('weekly');
  });

  it('returns at least 3 static entries', () => {
    const entries = getStaticSitemapEntries();

    expect(entries.length).toBeGreaterThanOrEqual(3);
  });

  it('all entries have lastModified set', () => {
    const entries = getStaticSitemapEntries();

    entries.forEach((entry) => {
      expect(entry.lastModified).toBeDefined();
      expect(entry.lastModified).toBeInstanceOf(Date);
    });
  });
});

describe('calculateSitemapCount', () => {
  it('returns 1 for URL count less than chunk size', () => {
    expect(calculateSitemapCount(5000, 10000)).toBe(1);
  });

  it('returns 1 for URL count equal to chunk size', () => {
    expect(calculateSitemapCount(10000, 10000)).toBe(1);
  });

  it('returns 2 for URL count slightly over chunk size', () => {
    expect(calculateSitemapCount(10001, 10000)).toBe(2);
  });

  it('returns correct count for large datasets', () => {
    expect(calculateSitemapCount(35000, 10000)).toBe(4);
  });

  it('uses default chunk size of 10000', () => {
    expect(calculateSitemapCount(25000)).toBe(3);
  });
});

describe('getSitemapChunkParams', () => {
  it('returns array with single chunk for small datasets', () => {
    const params = getSitemapChunkParams(5000, 10000);

    expect(params).toHaveLength(1);
    expect(params[0]).toEqual({ id: '0' });
  });

  it('returns correct number of chunks for large datasets', () => {
    const params = getSitemapChunkParams(35000, 10000);

    expect(params).toHaveLength(4);
    expect(params[0]).toEqual({ id: '0' });
    expect(params[1]).toEqual({ id: '1' });
    expect(params[2]).toEqual({ id: '2' });
    expect(params[3]).toEqual({ id: '3' });
  });

  it('uses default chunk size of 10000', () => {
    const params = getSitemapChunkParams(25000);

    expect(params).toHaveLength(3);
  });
});

describe('getChunkOffset', () => {
  it('returns 0 for first chunk', () => {
    const offset = getChunkOffset(0, 10000);
    expect(offset).toBe(0);
  });

  it('returns correct offset for second chunk', () => {
    const offset = getChunkOffset(1, 10000);
    expect(offset).toBe(10000);
  });

  it('returns correct offset for third chunk', () => {
    const offset = getChunkOffset(2, 10000);
    expect(offset).toBe(20000);
  });

  it('uses default chunk size of 10000', () => {
    const offset = getChunkOffset(3);
    expect(offset).toBe(30000);
  });
});

describe('sliceRacesForChunk', () => {
  const mockRaces: RaceForSitemap[] = Array.from({ length: 25 }, (_, i) => ({
    id: `race-${i}`,
    status: 'finished',
    date: '2024-11-15',
  }));

  it('returns first chunk of races', () => {
    const chunk = sliceRacesForChunk(mockRaces, 0, 10);

    expect(chunk).toHaveLength(10);
    expect(chunk[0].id).toBe('race-0');
    expect(chunk[9].id).toBe('race-9');
  });

  it('returns second chunk of races', () => {
    const chunk = sliceRacesForChunk(mockRaces, 1, 10);

    expect(chunk).toHaveLength(10);
    expect(chunk[0].id).toBe('race-10');
    expect(chunk[9].id).toBe('race-19');
  });

  it('returns partial last chunk', () => {
    const chunk = sliceRacesForChunk(mockRaces, 2, 10);

    expect(chunk).toHaveLength(5);
    expect(chunk[0].id).toBe('race-20');
    expect(chunk[4].id).toBe('race-24');
  });

  it('returns empty array for out of range chunk', () => {
    const chunk = sliceRacesForChunk(mockRaces, 10, 10);

    expect(chunk).toHaveLength(0);
  });

  it('handles empty races array', () => {
    const chunk = sliceRacesForChunk([], 0, 10);

    expect(chunk).toHaveLength(0);
  });
});

describe('Sitemap Index - Historical Race Splitting', () => {
  // Tests for splitting historical races across multiple sitemap files
  // Required for large datasets (50k+ URLs)

  it('splits 60000 historical races into 6 chunks of 10000', () => {
    const count = calculateSitemapCount(60000, 10000);
    expect(count).toBe(6);
  });

  it('generates correct params for 100000 historical races', () => {
    const params = getSitemapChunkParams(100000, 10000);

    expect(params).toHaveLength(10);
    expect(params[0].id).toBe('0');
    expect(params[9].id).toBe('9');
  });

  it('handles edge case of exactly chunk size', () => {
    const params = getSitemapChunkParams(10000, 10000);

    expect(params).toHaveLength(1);
  });

  it('includes static pages in calculation', () => {
    const staticEntries = getStaticSitemapEntries();
    const totalUrls = staticEntries.length + 9998;
    const count = calculateSitemapCount(totalUrls, 10000);

    // 3 static + 9998 dynamic = 10001 → Math.ceil(10001/10000) = 2
    expect(count).toBe(2);
  });
});
