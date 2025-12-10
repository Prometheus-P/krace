/**
 * Failure Recovery Job
 *
 * Automatically retries failed ingestion jobs based on retry schedule.
 * Uses exponential backoff to avoid overwhelming external APIs.
 */

import {
  getRetryableFailures,
  updateFailureStatus,
  incrementRetryCount,
} from '@/ingestion/utils/failureLogger';
import {
  notifyRecoveryComplete,
  notifyMaxRetriesExceeded,
} from '@/ingestion/services/slackNotifier';
import { pollSchedules } from './schedulePoller';
import { pollEntries } from './entryPoller';
import { pollResults } from './resultPoller';
import { pollOdds } from './oddsPoller';
import type { IngestionFailure } from '@/lib/db/schema';

export interface RecoveryResult {
  processed: number;
  recovered: number;
  failed: number;
  maxRetriesExceeded: number;
}

/**
 * Process retryable failures
 *
 * @param limit - Maximum number of failures to process
 * @returns Recovery results
 */
export async function processFailures(limit: number = 10): Promise<RecoveryResult> {
  const result: RecoveryResult = {
    processed: 0,
    recovered: 0,
    failed: 0,
    maxRetriesExceeded: 0,
  };

  const failures = await getRetryableFailures(limit);

  if (failures.length === 0) {
    console.log('[FailureRecovery] No retryable failures found');
    return result;
  }

  console.log(`[FailureRecovery] Processing ${failures.length} retryable failures`);

  for (const failure of failures) {
    result.processed++;

    try {
      await updateFailureStatus(failure.id, 'retrying');

      const success = await retryFailure(failure);

      if (success) {
        await updateFailureStatus(failure.id, 'resolved');
        result.recovered++;

        await notifyRecoveryComplete({
          failureId: String(failure.id),
          jobType: failure.jobType,
          entityId: failure.entityId,
        });

        console.log(`[FailureRecovery] Recovered: ${failure.id}`);
      } else {
        const updated = await incrementRetryCount(failure.id);
        result.failed++;

        if (updated && updated.retryCount >= updated.maxRetries) {
          result.maxRetriesExceeded++;
          await notifyMaxRetriesExceeded({
            failureId: String(failure.id),
            jobType: failure.jobType,
            entityId: failure.entityId,
            retryCount: updated.retryCount,
          });
        }

        console.log(
          `[FailureRecovery] Retry failed: ${failure.id} (${updated?.retryCount ?? 'unknown'}/${failure.maxRetries})`
        );
      }
    } catch (error) {
      console.error(`[FailureRecovery] Error processing ${failure.id}:`, error);
      await incrementRetryCount(failure.id);
      result.failed++;
    }

    // Small delay between retries to avoid rate limiting
    await sleep(1000);
  }

  console.log(
    `[FailureRecovery] Complete: processed=${result.processed}, recovered=${result.recovered}, failed=${result.failed}`
  );

  return result;
}

/**
 * Retry a single failure
 *
 * @param failure - Failure record to retry
 * @returns true if retry was successful
 */
async function retryFailure(failure: IngestionFailure): Promise<boolean> {
  try {
    switch (failure.jobType) {
      case 'schedule_poll':
        await pollSchedules({
          date: extractDateFromEntityId(failure.entityId),
        });
        return true;

      case 'entry_poll':
        const entryResult = await pollEntries({ raceIds: [failure.entityId] });
        return entryResult.errors === 0;

      case 'result_poll':
        const resultResult = await pollResults({ raceIds: [failure.entityId] });
        return resultResult.errors === 0;

      case 'odds_poll':
        const oddsResult = await pollOdds({ raceIds: [failure.entityId] });
        return oddsResult.errors === 0;

      default:
        console.warn(`[FailureRecovery] Unknown job type: ${failure.jobType}`);
        return false;
    }
  } catch (error) {
    console.error(`[FailureRecovery] Retry error for ${failure.id}:`, error);
    return false;
  }
}

/**
 * Extract date from entity ID
 */
function extractDateFromEntityId(entityId: string): string {
  const parts = entityId.split('-');
  if (parts.length >= 4) {
    const dateStr = parts[3];
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run failure recovery as a background process
 *
 * @param intervalMs - Check interval in milliseconds (default: 5 minutes)
 * @param maxIterations - Maximum iterations (default: unlimited)
 */
export async function runRecoveryLoop(
  intervalMs: number = 5 * 60 * 1000,
  maxIterations?: number
): Promise<void> {
  let iterations = 0;

  console.log(`[FailureRecovery] Starting recovery loop (interval: ${intervalMs}ms)`);

  while (maxIterations === undefined || iterations < maxIterations) {
    iterations++;

    try {
      await processFailures();
    } catch (error) {
      console.error('[FailureRecovery] Loop error:', error);
    }

    await sleep(intervalMs);
  }

  console.log(`[FailureRecovery] Loop completed after ${iterations} iterations`);
}
