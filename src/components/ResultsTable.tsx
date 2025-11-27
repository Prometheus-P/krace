// src/components/ResultsTable.tsx
import React from 'react';
import { RaceType, RaceResult } from '@/types';

interface ResultsTableProps {
  results: RaceResult[];
  raceType: RaceType;
  isLoading?: boolean;
}

const raceTypeConfig: Record<RaceType, { color: string }> = {
  horse: { color: 'text-horse' },
  cycle: { color: 'text-cycle' },
  boat: { color: 'text-boat' },
};

const rankStyles: Record<number, string> = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-gray-300 text-gray-700',
  3: 'bg-orange-300 text-orange-900',
};

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-3" data-testid="results-loading">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-16 bg-gray-200 rounded-lg" />
    ))}
  </div>
);

interface ResultRowProps {
  result: RaceResult;
  raceColor: string;
}

const ResultRow = ({ result, raceColor }: ResultRowProps) => {
  const rankStyle = rankStyles[result.rank] || 'bg-gray-100 text-gray-600';

  return (
    <tr className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      <td className="p-3 text-center">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${rankStyle}`}
        >
          {result.rank}
        </span>
      </td>
      <td className={`p-3 text-center font-bold ${raceColor}`}>
        {result.no}번
      </td>
      <td className="p-3">
        <span className="font-semibold text-gray-900">{result.name}</span>
        {result.jockey && (
          <span className="text-sm text-gray-500 ml-2">({result.jockey})</span>
        )}
      </td>
      <td className="p-3 text-right">
        {result.payout ? (
          <span className={`font-bold ${raceColor}`}>
            {result.payout.toLocaleString()}
            <span className="text-xs font-normal text-gray-500 ml-1">원</span>
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
    </tr>
  );
};

export default function ResultsTable({
  results,
  raceType,
  isLoading,
}: ResultsTableProps) {
  const config = raceTypeConfig[raceType];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (results.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">경주 결과가 없습니다</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="border-b">
            <th className="p-3 text-center font-medium text-gray-700 w-20">순위</th>
            <th className="p-3 text-center font-medium text-gray-700 w-20">번호</th>
            <th className="p-3 text-left font-medium text-gray-700">마명/선수명</th>
            <th className="p-3 text-right font-medium text-gray-700 w-32">배당금</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <ResultRow
              key={result.rank}
              result={result}
              raceColor={config.color}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
