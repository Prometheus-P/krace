/**
 * Failure Retry API Route
 *
 * POST /api/ingestion/failures/[id]/retry
 * Manually triggers a retry for a specific failure.
 *
 * Requires X-Ingestion-Key header for authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateIngestionAuth } from '@/lib/api-helpers/ingestionAuth';
import {
  getFailureById,
  updateFailureStatus,
  incrementRetryCount,
} from '@/ingestion/utils/failureLogger';
import { notifyRecoveryComplete, notifyMaxRetriesExceeded } from '@/ingestion/services/slackNotifier';
import { pollSchedules } from '@/ingestion/jobs/schedulePoller';
import { pollEntries } from '@/ingestion/jobs/entryPoller';
import { pollResults } from '@/ingestion/jobs/resultPoller';
import { pollOdds } from '@/ingestion/jobs/oddsPoller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  // Validate authentication
  const authResult = validateIngestionAuth(request);
  if (!authResult.authenticated) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: authResult.error || 'Unauthorized' },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_ID', message: 'Failure ID must be a number' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get failure record
    const failure = await getFailureById(numericId);

    if (!failure) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: `Failure ${id} not found` },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Check if already resolved
    if (failure.status === 'resolved') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ALREADY_RESOLVED', message: 'Failure has already been resolved' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if max retries exceeded
    if (failure.retryCount >= failure.maxRetries) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MAX_RETRIES_EXCEEDED',
            message: `Failure has exceeded maximum retries (${failure.maxRetries})`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log(`[API] Retrying failure ${id}: ${failure.jobType}/${failure.entityId}`);

    // Update status to retrying
    await updateFailureStatus(numericId, 'retrying');

    // Execute the appropriate job based on job type
    let retrySuccess = false;
    let retryResult: unknown;

    try {
      switch (failure.jobType) {
        case 'schedule_poll':
          retryResult = await pollSchedules({
            date: extractDateFromEntityId(failure.entityId),
          });
          retrySuccess = true;
          break;

        case 'entry_poll':
          retryResult = await pollEntries({ raceIds: [failure.entityId] });
          retrySuccess = true;
          break;

        case 'result_poll':
          retryResult = await pollResults({ raceIds: [failure.entityId] });
          retrySuccess = true;
          break;

        case 'odds_poll':
          retryResult = await pollOdds({ raceIds: [failure.entityId] });
          retrySuccess = true;
          break;

        default:
          throw new Error(`Unknown job type: ${failure.jobType}`);
      }
    } catch (retryError) {
      console.error(`[API] Retry failed for ${id}:`, retryError);
      retrySuccess = false;
    }

    if (retrySuccess) {
      // Mark as resolved
      await updateFailureStatus(numericId, 'resolved');

      // Send success notification
      await notifyRecoveryComplete({
        failureId: id,
        jobType: failure.jobType,
        entityId: failure.entityId,
      });

      return NextResponse.json({
        success: true,
        data: {
          failureId: id,
          status: 'resolved',
          result: retryResult,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      // Increment retry count
      const updated = await incrementRetryCount(numericId);

      // Check if max retries now exceeded
      if (updated && updated.retryCount >= updated.maxRetries) {
        await notifyMaxRetriesExceeded({
          failureId: id,
          jobType: failure.jobType,
          entityId: failure.entityId,
          retryCount: updated.retryCount,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RETRY_FAILED',
            message: 'Retry attempt failed',
          },
          data: {
            failureId: id,
            retryCount: updated?.retryCount ?? failure.retryCount + 1,
            maxRetries: failure.maxRetries,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] Failure retry error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to retry',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Extract date from entity ID
 * Entity IDs are formatted as: {type}-{track}-{raceNo}-{date}
 */
function extractDateFromEntityId(entityId: string): string {
  const parts = entityId.split('-');
  if (parts.length >= 4) {
    const dateStr = parts[3];
    // Format: YYYYMMDD -> YYYY-MM-DD
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  // Default to today
  return new Date().toISOString().split('T')[0];
}
