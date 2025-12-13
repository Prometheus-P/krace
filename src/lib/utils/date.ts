// src/lib/utils/date.ts

const KOREA_TIMEZONE = 'Asia/Seoul';

export function formatYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getKoreanDateParts(date: Date): { year: number; month: string; day: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return { year, month, day };
}

/**
 * Get current date/time in Korean timezone (Asia/Seoul)
 * Returns a Date object representing the current time in Korea
 */
export function getKoreanDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: KOREA_TIMEZONE }));
}

/**
 * Returns today's date in YYYYMMDD format (Korean timezone)
 */
export function getTodayYYYYMMDD(): string {
  const koreanDate = getKoreanDate();
  const { year, month, day } = getKoreanDateParts(koreanDate);
  return `${year}${month}${day}`;
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const { year, month, day } = getKoreanDateParts(date);
  return `${year}-${month}-${day}`;
}

export function getKoreanDateRange(days: number): { start: string; end: string } {
  const endDate = getKoreanDate();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - days);

  return {
    start: formatYYYYMMDD(startDate),
    end: formatYYYYMMDD(endDate),
  };
}

/**
 * Check if a given date is today (in Korean timezone)
 */
export function isToday(date: Date): boolean {
  const today = getKoreanDate();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}
