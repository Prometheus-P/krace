// src/components/OddsDisplay.tsx
import React from 'react';
import { Entry, RaceType } from '@/types';

interface OddsDisplayProps {
  entries: Entry[];
  raceType: RaceType;
  isLoading?: boolean;
  lastUpdated?: string;
}

const raceTypeConfig: Record<
  RaceType,
  {
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  horse: {
    color: 'text-horse',
    bgColor: 'bg-horse/5',
    borderColor: 'border-horse',
  },
  cycle: {
    color: 'text-cycle',
    bgColor: 'bg-cycle/5',
    borderColor: 'border-cycle',
  },
  boat: {
    color: 'text-boat',
    bgColor: 'bg-boat/5',
    borderColor: 'border-boat',
  },
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" data-testid="odds-loading">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-6 w-12 rounded bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
);

interface OddsCardProps {
  entry: Entry;
  config: typeof raceTypeConfig.horse;
}

const OddsCard = ({ entry, config }: OddsCardProps) => {
  const oddsLabel = entry.odds ? `${entry.odds}배` : '미정';

  return (
    <article
      className={`rounded-lg border p-3 ${config.borderColor} ${config.bgColor} transition-shadow hover:shadow-sm`}
      aria-label={`${entry.no}번 ${entry.name} 배당률: ${oddsLabel}`}
    >
      <div className="flex items-center justify-between">
        <span className="mr-2 truncate font-semibold text-gray-900">
          <span className={`${config.color} font-bold`}>{entry.no}.</span> {entry.name}
        </span>
        <span className={`text-lg font-bold tabular-nums ${config.color} flex-shrink-0`}>
          {entry.odds ? (
            <>
              {entry.odds}
              <span className="ml-0.5 text-xs font-normal">배</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </span>
      </div>
    </article>
  );
};

export default function OddsDisplay({
  entries,
  raceType,
  isLoading,
  lastUpdated,
}: OddsDisplayProps) {
  const config = raceTypeConfig[raceType];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (entries.length === 0) {
    return <p className="py-8 text-center text-gray-500">배당률 정보가 없습니다</p>;
  }

  return (
    <div>
      {lastUpdated && (
        <p className="mb-3 text-right text-xs text-gray-500">마지막 업데이트: {lastUpdated}</p>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => (
          <OddsCard key={entry.no} entry={entry} config={config} />
        ))}
      </div>
    </div>
  );
}
