import { NextRequest, NextResponse } from 'next/server';
import { pollSchedules } from '@/ingestion/jobs/schedulePoller';

/**
 * GET /api/ingestion/cron/schedules
 *
 * Vercel Cron endpoint for daily schedule collection.
 * Configured to run at 06:00 KST daily.
 *
 * Authentication via CRON_SECRET in Authorization header.
 */
export async function GET(request: NextRequest) {
  // Verify Vercel Cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron] Unauthorized schedule cron request');
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' },
      },
      { status: 401 }
    );
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`[Cron] Starting daily schedule collection for ${today}`);

    const result = await pollSchedules({
      date: today,
      raceTypes: ['horse', 'cycle', 'boat'],
    });

    console.log(`[Cron] Schedule collection complete: ${result.collected} races collected`);

    return NextResponse.json(
      {
        success: true,
        data: {
          date: today,
          collected: result.collected,
          skipped: result.skipped,
          errors: result.errors,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cron] Schedule collection error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CRON_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
