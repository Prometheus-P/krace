// src/components/DateRangeFilter.tsx
'use client';

import React from 'react';

interface DateRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (date: string) => void;
  onDateToChange?: (date: string) => void;
  className?: string;
  'data-testid'?: string;
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  className = '',
  'data-testid': testId,
}: DateRangeFilterProps) {
  const today = new Date().toISOString().split('T')[0];

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateFromChange?.(e.target.value);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateToChange?.(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`} data-testid={testId}>
      <div className="flex flex-col gap-1">
        <label htmlFor="date-from" className="text-label-medium text-on-surface-variant">
          시작일
        </label>
        <input
          id="date-from"
          type="date"
          value={dateFrom || ''}
          onChange={handleDateFromChange}
          max={dateTo || today}
          aria-label="시작일"
          className="rounded-lg border border-outline bg-surface px-3 py-2 text-body-medium text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date-to" className="text-label-medium text-on-surface-variant">
          종료일
        </label>
        <input
          id="date-to"
          type="date"
          value={dateTo || ''}
          onChange={handleDateToChange}
          min={dateFrom}
          max={today}
          aria-label="종료일"
          className="rounded-lg border border-outline bg-surface px-3 py-2 text-body-medium text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
