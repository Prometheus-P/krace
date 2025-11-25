// src/app/api/races/[type]/[id]/odds/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchRaceOdds } from '@/lib/api';

export async function GET(
    _request: NextRequest,
    { params }: { params: { type: string; id: string } }
) {
    try {
        const odds = await fetchRaceOdds(params.id);

        if (odds === null) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Race not found',
                    },
                    timestamp: new Date().toISOString(),
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: odds,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Error fetching race odds:', error);

        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: errorMessage,
                },
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
