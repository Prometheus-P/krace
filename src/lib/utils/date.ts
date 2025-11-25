// src/lib/utils/date.ts

export function getTodayYYYYMMDD(): string {
  const today = new Date();
  return today.toISOString().slice(0, 10).replace(/-/g, '');
}
