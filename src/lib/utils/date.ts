// src/lib/utils/date.ts

/**
 * Returns today's date in YYYYMMDD format
 */
export function getTodayYYYYMMDD(): string {
  const today = new Date();
  return today.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Check if a given date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Get current date in Korean timezone (Asia/Seoul, UTC+9)
 */
export function getKoreanDate(): Date {
  const now = new Date();
  // Korea is UTC+9
  const koreaOffset = 9 * 60; // in minutes
  const localOffset = now.getTimezoneOffset(); // in minutes
  const koreaTime = new Date(now.getTime() + (koreaOffset + localOffset) * 60000);
  return koreaTime;
}
