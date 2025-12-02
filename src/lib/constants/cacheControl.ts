// src/lib/constants/cacheControl.ts
/**
 * Cache-Control header constants for API responses
 *
 * These values control browser and CDN caching behavior:
 * - public: Response can be cached by browsers and CDNs
 * - s-maxage: CDN cache duration in seconds
 * - stale-while-revalidate: Serve stale content while revalidating in background
 * - no-store: Disable all caching
 */

/**
 * Cache control for successful API responses
 * 5 minute CDN cache with 1 minute stale-while-revalidate
 */
export const SUCCESS_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=60';

/**
 * Cache control for error responses
 * No caching to ensure errors don't persist
 */
export const ERROR_CACHE_CONTROL = 'no-store';
