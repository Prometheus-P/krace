/**
 * Odds Ingestion Trigger API Route
 *
 * POST /api/ingestion/trigger/odds
 * Manually triggers odds collection for specified race IDs.
 *
 * Request body:
 * {
 *   raceIds: string[]  // Array of race IDs to collect odds for
 * }
 *
 * Requires X-Ingestion-Key header for authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withIngestionAuth } from '@/lib/api-helpers/ingestionAuth';
import { pollOdds } from '@/ingestion/jobs/oddsPoller';

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { raceIds } = body;

    if (!raceIds || !Array.isArray(raceIds)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'raceIds array is required' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (raceIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'raceIds array cannot be empty' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate race ID format
    const invalidIds = raceIds.filter((id) => {
      const parts = id.split('-');
      return parts.length < 4 || !['horse', 'cycle', 'boat'].includes(parts[0]);
    });

    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_RACE_IDS',
            message: `Invalid race ID format: ${invalidIds.join(', ')}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log(`[API] Odds trigger received for ${raceIds.length} races`);

    const result = await pollOdds({ raceIds });

    return NextResponse.json({
      success: true,
      data: {
        snapshots: result.snapshots,
        races: result.races,
        errors: result.errors,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Odds trigger error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to trigger odds collection',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const POST = withIngestionAuth(handler);
