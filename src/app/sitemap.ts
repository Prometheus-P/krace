// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import {
  fetchHorseRaceSchedules,
  fetchCycleRaceSchedules,
  fetchBoatRaceSchedules,
  fetchHistoricalRaceIds,
} from '@/lib/api';
import { getStaticSitemapEntries, generateSitemapEntries } from '@/lib/seo';

// ISR revalidation: regenerate sitemap every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // baseUrl is handled by SEO utilities

  // Get today's date in YYYYMMDD format
  const today = new Date();
  const rcDate = today.toISOString().split('T')[0].replace(/-/g, '');

  // Fetch today's races and historical races in parallel
  let todaysRaces: Array<{ id: string; status: string; date: string }> = [];
  let historicalRaces: Array<{ id: string; status: string; date: string }> = [];

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
      date: today.toISOString().split('T')[0],
    }));

    historicalRaces = historical;
  } catch {
    // API failures during build are expected - continue with static routes only
  }

  // Combine today's races with historical (avoid duplicates)
  const todayIds = new Set(todaysRaces.map((r) => r.id));
  const uniqueHistorical = historicalRaces.filter((r) => !todayIds.has(r.id));
  const allRaces = [...todaysRaces, ...uniqueHistorical];

  // Generate static routes using SEO utility
  const staticRoutes = getStaticSitemapEntries();

  // Generate race routes using SEO utility (with proper priority/changeFrequency)
  const raceRoutes = generateSitemapEntries(allRaces);

  return [...staticRoutes, ...raceRoutes];
}
