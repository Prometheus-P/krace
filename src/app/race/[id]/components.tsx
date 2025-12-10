// src/app/race/[id]/components.tsx
import React from 'react';
import Link from 'next/link';
import { Entry, Race, RaceType } from '@/types';
import { getRaceTypeEmoji } from '@/lib/utils/ui';

// Race type configuration
export const raceTypeConfig: Record<
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
    bgColor: 'bg-horse/5',
    borderColor: 'border-horse',
  },
  cycle: {
    label: '경륜',
    color: 'text-cycle',
    bgColor: 'bg-cycle/5',
    borderColor: 'border-cycle',
  },
  boat: {
    label: '경정',
    color: 'text-boat',
    bgColor: 'bg-boat/5',
    borderColor: 'border-boat',
  },
};

// Entry row component for desktop table
export function EntryRow({ entry, raceType }: { entry: Entry; raceType: RaceType }) {
  const config = raceTypeConfig[raceType];

  return (
    <tr className="border-b transition-colors last:border-b-0 hover:bg-gray-50">
      <td className="p-3 text-center">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor} ${config.color} font-bold`}
        >
          {entry.no}
        </span>
      </td>
      <td className="p-3 font-semibold text-gray-900">{entry.name}</td>
      <td className="p-3 text-gray-700">{entry.jockey || '-'}</td>
      <td className="p-3 text-gray-700">{entry.trainer || '-'}</td>
      <td className="p-3 text-center text-gray-700">{entry.age || '-'}</td>
      <td className="p-3 text-center text-gray-700">{entry.weight ? `${entry.weight}kg` : '-'}</td>
      <td className="p-3 font-mono text-xs text-gray-600">{entry.recentRecord || '-'}</td>
    </tr>
  );
}

// Mobile entry card component
export function EntryCard({ entry, raceType }: { entry: Entry; raceType: RaceType }) {
  const config = raceTypeConfig[raceType];

  return (
    <article
      className={`rounded-lg border p-4 ${config.borderColor} ${config.bgColor}`}
      aria-label={`${entry.no}번 ${entry.name}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ${config.color} text-lg font-bold shadow-sm`}
        >
          {entry.no}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-gray-900">{entry.name}</h3>
          <div className="mt-1 space-y-0.5 text-sm text-gray-600">
            {entry.jockey && <p>기수: {entry.jockey}</p>}
            {entry.trainer && <p>조교사: {entry.trainer}</p>}
            <div className="flex gap-4 text-xs text-gray-500">
              {entry.age && <span>연령: {entry.age}</span>}
              {entry.weight && <span>중량: {entry.weight}kg</span>}
            </div>
          </div>
        </div>
        {entry.odds && (
          <div className="text-right">
            <span className="text-xs text-gray-500">단승</span>
            <p className={`text-lg font-bold ${config.color}`}>
              {entry.odds}
              <span className="ml-0.5 text-xs font-normal">배</span>
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

// Not found component
export function RaceNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="h-10 w-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="mb-2 text-xl font-bold text-gray-900">경주 정보를 찾을 수 없습니다</h1>
      <p className="mb-6 text-gray-500">요청하신 경주 정보가 존재하지 않거나 삭제되었습니다.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        홈으로 돌아가기
      </Link>
    </div>
  );
}

// Back navigation component
export function BackNavigation({ raceType }: { raceType: RaceType }) {
  const config = raceTypeConfig[raceType];

  return (
    <nav aria-label="브레드크럼">
      <Link
        href={`/?tab=${raceType}`}
        className="-ml-1 inline-flex items-center gap-2 rounded px-1 text-sm text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {config.label} 목록으로
      </Link>
    </nav>
  );
}

// Race header component
export function RaceHeader({ race }: { race: Race }) {
  const config = raceTypeConfig[race.type];
  const raceTitle = `${race.track} 제${race.raceNo}경주`;

  return (
    <header className={`rounded-xl border-l-4 bg-white p-4 shadow-sm md:p-6 ${config.borderColor}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center" data-testid="race-info">
        <div className="flex items-center gap-4">
          <span className="text-4xl md:text-5xl" aria-hidden="true">
            {getRaceTypeEmoji(race.type)}
          </span>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
              >
                {config.label}
              </span>
              {race.grade && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {race.grade}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
              {raceTitle}
              {race.distance && (
                <span className="ml-2 font-normal text-gray-500">
                  ({race.distance.toLocaleString()}m)
                </span>
              )}
            </h1>
          </div>
        </div>
        <div className="text-left md:ml-auto md:text-right">
          <p className="mb-1 text-sm text-gray-500">출발 시간</p>
          <time
            dateTime={race.startTime}
            className={`font-mono text-2xl font-bold md:text-3xl ${config.color}`}
          >
            {race.startTime}
          </time>
        </div>
      </div>
    </header>
  );
}

// Entries section component
export function EntriesSection({ race }: { race: Race }) {
  const raceTitle = `${race.track} 제${race.raceNo}경주`;

  return (
    <section
      className="overflow-hidden rounded-xl bg-white shadow-sm"
      data-testid="entries"
      aria-labelledby="entries-heading"
    >
      <div className="border-b border-gray-100 p-4 md:p-6">
        <h2
          id="entries-heading"
          className="flex items-center gap-2 text-xl font-bold text-gray-900"
        >
          <span aria-hidden="true">📋</span>
          출전표
          <span className="text-sm font-normal text-gray-500">({race.entries.length}두/명)</span>
        </h2>
      </div>

      {/* Desktop table view */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {raceTitle} 출전표 - {race.entries.length}두/명 참가
          </caption>
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th scope="col" className="w-16 p-3 text-center font-medium text-gray-700">
                번호
              </th>
              <th scope="col" className="p-3 text-left font-medium text-gray-700">
                마명/선수명
              </th>
              <th scope="col" className="p-3 text-left font-medium text-gray-700">
                기수
              </th>
              <th scope="col" className="p-3 text-left font-medium text-gray-700">
                조교사
              </th>
              <th scope="col" className="w-16 p-3 text-center font-medium text-gray-700">
                연령
              </th>
              <th scope="col" className="w-24 p-3 text-center font-medium text-gray-700">
                부담중량
              </th>
              <th scope="col" className="p-3 text-left font-medium text-gray-700">
                최근성적
              </th>
            </tr>
          </thead>
          <tbody>
            {race.entries.map((entry) => (
              <EntryRow key={entry.no} entry={entry} raceType={race.type} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 p-4 md:hidden">
        {race.entries.map((entry) => (
          <EntryCard key={entry.no} entry={entry} raceType={race.type} />
        ))}
      </div>
    </section>
  );
}
