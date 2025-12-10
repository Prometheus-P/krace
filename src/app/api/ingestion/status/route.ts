/**
 * Ingestion Status API Route
 *
 * GET /api/ingestion/status
 * Returns current ingestion status and monitoring metrics.
 *
 * Query parameters:
 * - date: Optional date string (YYYY-MM-DD), defaults to today
 * - full: If 'true', includes detailed dashboard data
 *
 * Requires X-Ingestion-Key header for authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withIngestionAuth } from '@/lib/api-helpers/ingestionAuth';
import {
  getIngestionStatus,
  getOddsCollectionStatus,
  getFailureStatus,
  getHealthCheck,
  getDashboardStatus,
} from '@/ingestion/services/statusService';

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const full = searchParams.get('full') === 'true';

    if (full) {
      // Return comprehensive dashboard data
      const dashboard = await getDashboardStatus();

      return NextResponse.json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString(),
      });
    }

    // Return basic status
    const [ingestion, odds, failures, health] = await Promise.all([
      getIngestionStatus(date ?? undefined),
      getOddsCollectionStatus(),
      getFailureStatus(),
      getHealthCheck(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        health: health.status,
        date: ingestion.date,
        races: {
          total: ingestion.races.total,
          finished: ingestion.races.finished,
          successRate: ingestion.successRate,
        },
        odds: {
          totalSnapshots: odds.totalSnapshots,
          lastCollection: odds.lastCollectionTime,
        },
        failures: {
          pending: failures.pending,
          total: failures.total,
        },
        lastUpdated: ingestion.lastUpdated,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get status',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const GET = withIngestionAuth(handler);
