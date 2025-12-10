// src/components/race-detail/RaceSummaryCard.tsx
'use client';

import React from 'react';
import { Race, RaceType, RaceStatus } from '@/types';
import { getRaceTypeEmoji } from '@/lib/utils/ui';
import StatusBadge from '@/components/StatusBadge';

// Race type configuration
const raceTypeConfig: Record<
  RaceType,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  horse: {
    label: '경마',
    color: 'text-horse',
    bgColor: 'bg-horse/10',
    borderColor: 'border-horse',
  },
  cycle: {
    label: '경륜',
    color: 'text-cycle',
    bgColor: 'bg-cycle/10',
    borderColor: 'border-cycle',
  },
  boat: {
    label: '경정',
    color: 'text-boat',
    bgColor: 'bg-boat/10',
    borderColor: 'border-boat',
  },
};

interface RaceSummaryCardProps {
  race: Race;
  className?: string;
}

export default function RaceSummaryCard({ race, className = '' }: RaceSummaryCardProps) {
  const config = raceTypeConfig[race.type];
  const raceTitle = `${race.track} 제${race.raceNo}경주`;

  return (
    <section
      className={`rounded-xl border-l-4 bg-white p-4 shadow-sm md:p-6 ${config.borderColor} ${className}`}
      data-testid="race-summary-card"
      aria-label="경주 요약 정보"
      role="region"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left section: Race type, title, and metadata */}
        <div className="flex items-start gap-4">
          {/* Race type emoji */}
          <span className="text-4xl md:text-5xl" aria-hidden="true">
            {getRaceTypeEmoji(race.type)}
          </span>

          {/* Race info */}
          <div className="min-w-0 flex-1">
            {/* Badges row: race type, grade, status */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${config.bgColor} ${config.color}`}
              >
                {config.label}
              </span>

              {race.grade && (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {race.grade}
                </span>
              )}

              <StatusBadge status={race.status as RaceStatus} />
            </div>

            {/* Race title */}
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{raceTitle}</h1>

            {/* Track and distance */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {race.track}
              </span>

              {race.distance && (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  {race.distance.toLocaleString()}m
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right section: Start time */}
        <div className="flex items-center gap-3 border-t border-gray-100 pt-3 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="text-left md:text-right">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              출발 시간
            </p>
            <time
              dateTime={race.startTime}
              className={`font-mono text-2xl font-bold md:text-3xl ${config.color}`}
            >
              {race.startTime}
            </time>
          </div>
        </div>
      </div>
    </section>
  );
}
