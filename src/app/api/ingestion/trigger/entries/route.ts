import { NextRequest, NextResponse } from 'next/server';
import { withIngestionAuth } from '@/lib/api-helpers/ingestionAuth';
import { pollEntries } from '@/ingestion/jobs/entryPoller';

/**
 * POST /api/ingestion/trigger/entries
 *
 * Manually trigger entry collection for specific race IDs.
 * Requires X-Ingestion-Key header for authentication.
 */
export const POST = withIngestionAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const raceIds = body.raceIds as string[];

    if (!raceIds || !Array.isArray(raceIds) || raceIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'raceIds array is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log(`[API] Trigger entry collection for ${raceIds.length} races`);

    const result = await pollEntries({ raceIds });

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
    console.error('[API] Entry trigger error:', error);

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
