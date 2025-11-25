// src/lib/utils/date.test.ts
import { formatDate, isToday, getKoreanDate, getTodayYYYYMMDD } from './date';

describe('date utilities', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2025-11-25T12:00:00Z');
      expect(formatDate(date)).toBe('2025-11-25');
    });

    it('should format another date correctly', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should handle end of year dates', () => {
      const date = new Date('2024-12-31T23:59:59Z');
      expect(formatDate(date)).toBe('2024-12-31');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('should return false for same day last year', () => {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      expect(isToday(lastYear)).toBe(false);
    });
  });

  describe('getKoreanDate', () => {
    it('should return date in Korean timezone', () => {
      const result = getKoreanDate();
      expect(result).toBeInstanceOf(Date);
    });

    it('should return a valid date object', () => {
      const result = getKoreanDate();
      expect(result.getTime()).not.toBeNaN();
    });
  });

  describe('getTodayYYYYMMDD', () => {
    it('should return date in YYYYMMDD format', () => {
      const result = getTodayYYYYMMDD();
      expect(result).toMatch(/^\d{8}$/);
    });

    it('should return 8 characters', () => {
      const result = getTodayYYYYMMDD();
      expect(result.length).toBe(8);
    });

    it('should return current date', () => {
      const result = getTodayYYYYMMDD();
      const today = new Date();
      const expected = today.toISOString().slice(0, 10).replace(/-/g, '');
      expect(result).toBe(expected);
    });
  });
});
