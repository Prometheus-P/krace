// src/lib/seo/index.ts
// Re-export all SEO utilities

export {
  generateSportsEventSchema,
  generateFAQSchema,
  generateBreadcrumbListSchema,
  type SportsEventSchema,
  type FAQSchema,
  type BreadcrumbListSchema,
} from './schemas';

export {
  generateRaceMetadata,
  isHistoricalRace,
  type RaceMetadataInput,
} from './metadata';

export {
  shouldSplitSitemap,
  generateSitemapEntries,
  getStaticSitemapEntries,
  calculateSitemapCount,
  getSitemapChunkParams,
  getChunkOffset,
  sliceRacesForChunk,
  type RaceForSitemap,
} from './sitemap';
