/**
 * Ingestion Failures API Route
 *
 * GET /api/ingestion/failures
 * Lists ingestion failures with optional filtering.
 *
 * Query parameters:
 * - status: 'pending' | 'retrying' | 'resolved' | 'max_retries_exceeded'
 * - jobType: 'schedule_poll' | 'entry_poll' | 'result_poll' | 'odds_poll'
 * - limit: number (default: 50)
 *
 * Requires X-Ingestion-Key header for authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withIngestionAuth } from '@/lib/api-helpers/ingestionAuth';
import { getFailures, getFailureStats } from '@/ingestion/utils/failureLogger';
import type { FailureStatus, JobType } from '@/ingestion/utils/failureLogger';

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as FailureStatus | null;
    const jobType = searchParams.get('jobType') as JobType | null;
    const limitParam = searchParams.get('limit');
    const includeStats = searchParams.get('includeStats') === 'true';

    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    if (isNaN(limit) || limit < 1 || limit > 500) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_LIMIT', message: 'Limit must be between 1 and 500' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const failures = await getFailures({
      status: status ?? undefined,
      jobType: jobType ?? undefined,
      limit,
    });

    const response: {
      success: boolean;
      data: {
        failures: typeof failures;
        count: number;
        stats?: Awaited<ReturnType<typeof getFailureStats>>;
      };
      timestamp: string;
    } = {
      success: true,
      data: {
        failures,
        count: failures.length,
      },
      timestamp: new Date().toISOString(),
    };

    if (includeStats) {
      response.data.stats = await getFailureStats();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Failures list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list failures',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const GET = withIngestionAuth(handler);
