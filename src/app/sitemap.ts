// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import {
  fetchHorseRaceSchedules,
  fetchCycleRaceSchedules,
  fetchBoatRaceSchedules,
  fetchHistoricalRaceIds,
  getHistoricalRaceCount,
} from '@/lib/api';
import {
  getStaticSitemapEntries,
  generateSitemapEntries,
  calculateSitemapCount,
  sliceRacesForChunk,
  type RaceForSitemap,
} from '@/lib/seo';

// ISR revalidation: regenerate sitemap every hour
export const revalidate = 3600;

// URLs per sitemap chunk (Google limit is 50,000)
const URLS_PER_SITEMAP = 10000;

/**
 * Fetch all races (today + historical) with error handling
 */
async function fetchAllRaces(): Promise<RaceForSitemap[]> {
  const today = new Date();
  const rcDate = today.toISOString().split('T')[0].replace(/-/g, '');
  const todayDateStr = today.toISOString().split('T')[0];

  let todaysRaces: RaceForSitemap[] = [];
  let historicalRaces: RaceForSitemap[] = [];

  try {
    const [horseRaces, cycleRaces, boatRaces, historical] = await Promise.all([
      fetchHorseRaceSchedules(rcDate).catch(() => []),
      fetchCycleRaceSchedules(rcDate).catch(() => []),
      fetchBoatRaceSchedules(rcDate).catch(() => []),
      fetchHistoricalRaceIds(365).catch(() => []),
    ]);

    // Map today's races to sitemap format
    const allTodaysRaces = [...horseRaces, ...cycleRaces, ...boatRaces];
    todaysRaces = allTodaysRaces.map((race) => ({
      id: race.id,
      status: race.status,
      date: todayDateStr,
    }));

    historicalRaces = historical;
  } catch {
    // API failures during build are expected - continue with static routes only
  }

  // Combine today's races with historical (avoid duplicates)
  const todayIds = new Set(todaysRaces.map((r) => r.id));
  const uniqueHistorical = historicalRaces.filter((r) => !todayIds.has(r.id));

  return [...todaysRaces, ...uniqueHistorical];
}

/**
 * Generate multiple sitemaps for large datasets
 * This function is called by Next.js to determine how many sitemap files to generate
 * Results in /sitemap/0.xml, /sitemap/1.xml, etc.
 */
export async function generateSitemaps(): Promise<Array<{ id: number }>> {
  try {
    // Estimate total URL count (static pages + races)
    const staticCount = getStaticSitemapEntries().length;
    const historicalCount = await getHistoricalRaceCount().catch(() => 0);
    const totalUrls = staticCount + historicalCount;

    // Calculate number of sitemap chunks needed
    const chunkCount = calculateSitemapCount(totalUrls, URLS_PER_SITEMAP);

    return Array.from({ length: chunkCount }, (_, i) => ({ id: i }));
  } catch {
    // Fallback to single sitemap on error
    return [{ id: 0 }];
  }
}

/**
 * Generate sitemap entries for a specific chunk
 */
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const allRaces = await fetchAllRaces();

  // First sitemap includes static routes
  if (id === 0) {
    const staticRoutes = getStaticSitemapEntries();
    const racesForFirstChunk = sliceRacesForChunk(
      allRaces,
      0,
      URLS_PER_SITEMAP - staticRoutes.length
    );
    const raceRoutes = generateSitemapEntries(racesForFirstChunk);

    return [...staticRoutes, ...raceRoutes];
  }

  // Subsequent sitemaps contain only race routes
  // Account for static routes taking space in first chunk
  const staticCount = getStaticSitemapEntries().length;
  const firstChunkRaceCount = URLS_PER_SITEMAP - staticCount;
  const adjustedOffset = firstChunkRaceCount + (id - 1) * URLS_PER_SITEMAP;
  const racesForChunk = allRaces.slice(adjustedOffset, adjustedOffset + URLS_PER_SITEMAP);
  const raceRoutes = generateSitemapEntries(racesForChunk);

  return raceRoutes;
}
