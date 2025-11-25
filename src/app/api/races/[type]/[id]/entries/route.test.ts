// src/app/api/races/[type]/[id]/entries/route.test.ts
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

describe('GET /api/races/[type]/[id]/entries', () => {
    const mockEntries = [
        { no: 1, name: '번개', jockey: '김기수', trainer: '박조교', age: 4, weight: 55, odds: 2.3, recentRecord: '1-2-1' },
        { no: 2, name: '청풍', jockey: '이기수', trainer: '최조교', age: 5, weight: 56, odds: 4.1, recentRecord: '3-1-2' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return entries for a valid race', async () => {
        (api.fetchRaceEntries as jest.Mock).mockResolvedValue(mockEntries);

        const request = new NextRequest('http://localhost:3000/api/races/horse/horse-1-1-20240115/entries');
        const response = await GET(request, { params: { type: 'horse', id: 'horse-1-1-20240115' } });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toEqual(mockEntries);
        expect(data.data).toHaveLength(2);
    });

    it('should return 404 when race not found', async () => {
        (api.fetchRaceEntries as jest.Mock).mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/races/horse/invalid-id/entries');
        const response = await GET(request, { params: { type: 'horse', id: 'invalid-id' } });

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
        (api.fetchRaceEntries as jest.Mock).mockRejectedValue(new Error('API error'));

        const request = new NextRequest('http://localhost:3000/api/races/horse/horse-1-1-20240115/entries');
        const response = await GET(request, { params: { type: 'horse', id: 'horse-1-1-20240115' } });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
    });
});
