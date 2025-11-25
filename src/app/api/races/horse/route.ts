// src/app/api/races/horse/route.ts
import { NextResponse } from 'next/server';
import { fetchHorseRaceSchedules } from '@/lib/api';
import { Race } from '@/types';
import { handleApiRequest, ApiResponse } from '@/lib/utils/apiResponse'; // Import handleApiRequest and ApiResponse

export async function GET(request: Request) {
  // Use the generic handleApiRequest function
  return handleApiRequest<Race>(fetchHorseRaceSchedules, 'horse race');
}