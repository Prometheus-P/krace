// src/lib/utils/apiResponse.test.ts
import { handleApiRequest, ApiResponse } from './apiResponse';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
}));

// Mock date utility
jest.mock('./date', () => ({
  getTodayYYYYMMDD: jest.fn(() => '20251201'),
}));

describe('apiResponse utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handleApiRequest', () => {
    it('should return success response with data', async () => {
      const mockData = [{ id: 1, name: 'test' }];
      const mockFetchFn = jest.fn().mockResolvedValue(mockData);

      const response = await handleApiRequest(mockFetchFn, 'test');
      const body = await response.json() as ApiResponse<typeof mockData>;

      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockData);
      expect(body.timestamp).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should call fetch function with today date', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue([]);

      await handleApiRequest(mockFetchFn, 'test');

      expect(mockFetchFn).toHaveBeenCalledWith('20251201');
    });

    it('should return error response on fetch failure', async () => {
      const mockError = new Error('Network error');
      const mockFetchFn = jest.fn().mockRejectedValue(mockError);

      const response = await handleApiRequest(mockFetchFn, 'test');
      const body = await response.json() as ApiResponse<unknown[]>;

      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('SERVER_ERROR');
      expect(body.error?.message).toBe('Network error');
      expect(response.status).toBe(500);
    });

    it('should handle non-Error thrown values', async () => {
      const mockFetchFn = jest.fn().mockRejectedValue('string error');

      const response = await handleApiRequest(mockFetchFn, 'customApi');
      const body = await response.json() as ApiResponse<unknown[]>;

      expect(body.success).toBe(false);
      expect(body.error?.message).toBe('Failed to fetch customApi schedules');
    });

    it('should include timestamp in ISO format', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue([]);

      const response = await handleApiRequest(mockFetchFn, 'test');
      const body = await response.json() as ApiResponse<unknown[]>;

      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should log error to console on failure', async () => {
      const mockError = new Error('Test error');
      const mockFetchFn = jest.fn().mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, 'error');

      await handleApiRequest(mockFetchFn, 'testApi');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching testApi schedules:',
        mockError
      );
    });
  });

  describe('ApiResponse interface', () => {
    it('should accept valid success response structure', () => {
      const response: ApiResponse<string[]> = {
        success: true,
        data: ['item1', 'item2'],
        timestamp: new Date().toISOString(),
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
    });

    it('should accept valid error response structure', () => {
      const response: ApiResponse<string[]> = {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test message',
        },
        timestamp: new Date().toISOString(),
      };

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('TEST_ERROR');
    });
  });
});
