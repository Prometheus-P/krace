import { NextRequest, NextResponse } from 'next/server';
import { withIngestionAuth } from '@/lib/api-helpers/ingestionAuth';
import { pollSchedules } from '@/ingestion/jobs/schedulePoller';
import type { RaceType } from '@/types/db';

/**
 * POST /api/ingestion/trigger/schedules
 *
 * Manually trigger schedule collection for a specific date.
 * Requires X-Ingestion-Key header for authentication.
 */
export const POST = withIngestionAuth(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const date = body.date || new Date().toISOString().split('T')[0];
    const raceTypes = body.raceTypes as RaceType[] | undefined;

    console.log(`[API] Trigger schedule collection for ${date}`);

    const result = await pollSchedules({ date, raceTypes });

    return NextResponse.json(
      {
        success: true,
        data: {
          collected: result.collected,
          skipped: result.skipped,
          errors: result.errors,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Schedule trigger error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});
