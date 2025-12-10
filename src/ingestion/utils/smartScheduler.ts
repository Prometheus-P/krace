/**
 * Smart Scheduler Utility
 *
 * Determines odds collection intervals based on time to race start.
 * Implements variable collection frequency:
 * - T-60 to T-15: Every 5 minutes
 * - T-15 to T-5: Every 1 minute
 * - T-5 to T-0: Every 30 seconds
 */

/** Collection interval in milliseconds */
const INTERVAL_5_MIN = 5 * 60 * 1000;
const INTERVAL_1_MIN = 1 * 60 * 1000;
const INTERVAL_30_SEC = 30 * 1000;

/** Collection window boundaries (in minutes) */
const WINDOW_START = 60; // Start collecting 60 minutes before race
const THRESHOLD_INTENSIVE = 15; // Switch to 1-min at T-15
const THRESHOLD_FINAL = 5; // Switch to 30-sec at T-5

/**
 * Get the appropriate collection interval based on minutes to race start
 *
 * @param minutesToStart - Minutes until race starts (negative if already started)
 * @returns Interval in milliseconds, or null if race has started
 */
export function getCollectionInterval(minutesToStart: number): number | null {
  if (minutesToStart <= 0) {
    // Race has started - no more collection
    return null;
  }

  if (minutesToStart <= THRESHOLD_FINAL) {
    // T-5 to T-0: Every 30 seconds
    return INTERVAL_30_SEC;
  }

  if (minutesToStart <= THRESHOLD_INTENSIVE) {
    // T-15 to T-5: Every 1 minute
    return INTERVAL_1_MIN;
  }

  // T-60 to T-15: Every 5 minutes
  return INTERVAL_5_MIN;
}

/**
 * Determine if odds should be collected now based on time to race
 *
 * Called from 1-minute cron to decide if collection should happen.
 * For the T-5 window (30-sec interval), always returns true at minute boundary.
 *
 * @param minutesToStart - Minutes until race starts
 * @returns true if collection should happen now
 */
export function shouldCollectNow(minutesToStart: number): boolean {
  if (minutesToStart <= 0 || minutesToStart > WINDOW_START) {
    return false;
  }

  // T-5 window: Always collect (cron runs every minute, but we need 30-sec)
  if (minutesToStart <= THRESHOLD_FINAL) {
    return true;
  }

  // T-15 window: Collect every minute
  if (minutesToStart <= THRESHOLD_INTENSIVE) {
    return true;
  }

  // T-60 window: Collect every 5 minutes (0, 5, 10, 15, ... minute marks)
  return minutesToStart % 5 === 0;
}

/**
 * Calculate minutes until race start
 *
 * @param raceStartTime - ISO timestamp or Date of race start
 * @param now - Current time (default: now)
 * @returns Minutes until race starts (negative if past)
 */
export function getMinutesToStart(
  raceStartTime: string | Date,
  now: Date = new Date()
): number {
  const startTime = typeof raceStartTime === 'string' ? new Date(raceStartTime) : raceStartTime;
  const diffMs = startTime.getTime() - now.getTime();
  return Math.floor(diffMs / (60 * 1000));
}

/**
 * Filter races that are within the odds collection window
 *
 * @param races - Array of races with startTime
 * @param now - Current time (default: now)
 * @returns Races that should have odds collected
 */
export function getUpcomingRacesForCollection(
  races: Array<{ id: string; startTime: string | Date | null }>,
  now: Date = new Date()
): Array<{ id: string; startTime: string | Date; minutesToStart: number }> {
  return races
    .filter((race) => race.startTime !== null)
    .map((race) => ({
      id: race.id,
      startTime: race.startTime!,
      minutesToStart: getMinutesToStart(race.startTime!, now),
    }))
    .filter((race) => race.minutesToStart > 0 && race.minutesToStart <= WINDOW_START);
}

/**
 * Determine if a second collection pass is needed within the current minute
 *
 * For T-5 window (30-sec interval), we need two collections per minute.
 * This function is called after the first collection to determine if
 * we should schedule a delayed second collection.
 *
 * @param minutesToStart - Minutes until race starts
 * @returns true if a second collection (after 30-sec delay) is needed
 */
export function needsSecondPass(minutesToStart: number): boolean {
  return minutesToStart > 0 && minutesToStart <= THRESHOLD_FINAL;
}

/**
 * Sleep utility for implementing delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
