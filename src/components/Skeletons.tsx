// src/components/Skeletons.tsx
import React from 'react';

export function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-label="통계 로딩 중" role="status">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
          <div className="mb-3 h-4 w-16 rounded bg-gray-200" />
          <div className="h-8 w-20 rounded bg-gray-200" />
        </div>
      ))}
      <span className="sr-only">통계 정보를 불러오는 중입니다</span>
    </div>
  );
}

export function RaceListSkeleton() {
  return (
    <div className="space-y-3" aria-label="경주 목록 로딩 중" role="status">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg bg-gray-50 p-4">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />
          <div className="min-w-0 flex-1">
            <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-48 rounded bg-gray-200" />
          </div>
          <div className="h-6 w-16 flex-shrink-0 rounded bg-gray-200" />
        </div>
      ))}
      <span className="sr-only">경주 목록을 불러오는 중입니다</span>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
          <div className="hidden items-center gap-6 md:flex">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function ResultsSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-label="결과 로딩 중"
      role="status"
      data-testid="results-skeleton"
    >
      {/* Count skeleton */}
      <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />

      {/* Result cards skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-m3-md border-l-4 border-gray-200 bg-white p-4 shadow-m3-1"
        >
          {/* Header */}
          <div className="mb-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div>
              <div className="mb-1 h-4 w-32 rounded bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-gray-200" />
                <div className="h-4 max-w-[120px] flex-1 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
            ))}
          </div>

          {/* Dividend */}
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="h-4 w-28 rounded bg-gray-200" />
          </div>
        </div>
      ))}
      <span className="sr-only">경주 결과를 불러오는 중입니다</span>
    </div>
  );
}
