// src/app/api/races/[type]/[id]/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRaceDetail } from '@/lib/services/raceService';
import { getErrorMessage } from '@/lib/utils/errors';
import { ApiResponse } from '@/lib/utils/apiResponse';
import { RaceResult } from '@/types';

// ISR: Revalidate every 60 seconds for results
export const revalidate = 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
): Promise<NextResponse<ApiResponse<RaceResult[]>>> {
  try {
    const { id } = await params;

    // Call service to get race detail bundle
    const raceDetail = await getRaceDetail(id);

    if (!raceDetail) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Race not found',
        },
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: raceDetail.results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error fetching race results:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: getErrorMessage(error),
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
