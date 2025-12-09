// src/components/ResultDetail.tsx
'use client';

import React from 'react';
import { HistoricalRace, DividendType } from '@/types';

interface ResultDetailProps {
  race: HistoricalRace;
  className?: string;
  'data-testid'?: string;
}

const DIVIDEND_LABELS: Record<DividendType, string> = {
  win: '단승',
  place: '복승',
  quinella: '쌍승',
};

function formatAmount(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

function formatEntries(entries: number[]): string {
  return entries.map((e) => `${e}번`).join('-');
}

export function ResultDetail({ race, className = '', 'data-testid': testId }: ResultDetailProps) {
  return (
    <div className={`mt-4 border-t border-outline/30 pt-4 ${className}`} data-testid={testId}>
      {/* Race info */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-body-small text-on-surface-variant">
        {race.distance && <span>{race.distance}m</span>}
        {race.grade && <span>{race.grade}</span>}
        <span>{race.startTime} 발주</span>
      </div>

      {/* Full finisher table */}
      <div className="overflow-x-auto">
        <table role="table" className="w-full text-body-medium">
          <thead>
            <tr className="border-b border-outline/30 text-left text-label-medium text-on-surface-variant">
              <th className="w-10 py-2 pr-2">순위</th>
              <th className="w-12 py-2 pr-2">번호</th>
              <th className="py-2 pr-2">이름</th>
              {race.type === 'horse' && <th className="py-2 pr-2">기수</th>}
              <th className="py-2 pr-2 text-right">기록</th>
              <th className="py-2 text-right">착차</th>
            </tr>
          </thead>
          <tbody>
            {race.results.map((result) => (
              <tr key={result.entryNo} className="border-b border-outline/10 last:border-b-0">
                <td className="py-2 pr-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-label-small font-medium ${result.rank === 1 ? 'bg-yellow-100 text-yellow-800' : ''} ${result.rank === 2 ? 'bg-gray-100 text-gray-700' : ''} ${result.rank === 3 ? 'bg-orange-100 text-orange-800' : ''} ${result.rank > 3 ? 'text-on-surface-variant' : ''} `}
                  >
                    {result.rank}
                  </span>
                </td>
                <td className="py-2 pr-2 text-on-surface-variant">{result.entryNo}번</td>
                <td className="py-2 pr-2 font-medium">{result.name}</td>
                {race.type === 'horse' && (
                  <td className="py-2 pr-2 text-on-surface-variant">{result.jockey || '-'}</td>
                )}
                <td className="py-2 pr-2 text-right text-on-surface-variant">
                  {result.time || '-'}
                </td>
                <td className="py-2 text-right text-on-surface-variant">
                  {result.timeDiff || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dividends */}
      {race.dividends.length > 0 && (
        <div className="mt-4 border-t border-outline/30 pt-4">
          <h4 className="mb-2 text-label-large text-on-surface-variant">배당금</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {race.dividends.map((dividend, index) => (
              <div
                key={`${dividend.type}-${index}`}
                className="rounded-lg bg-surface-container-high p-2"
              >
                <div className="text-label-small text-on-surface-variant">
                  {DIVIDEND_LABELS[dividend.type]} ({formatEntries(dividend.entries)})
                </div>
                <div className="text-body-medium font-medium text-on-surface">
                  {formatAmount(dividend.amount)}원
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
