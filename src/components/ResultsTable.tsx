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
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-16 rounded-lg bg-gray-200" />
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
    <tr className="border-b transition-colors last:border-b-0 hover:bg-gray-50">
      <td className="p-3 text-center">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${rankStyle}`}
        >
          {result.rank}
        </span>
      </td>
      <td className={`p-3 text-center font-bold ${raceColor}`}>{result.no}번</td>
      <td className="p-3">
        <span className="font-semibold text-gray-900">{result.name}</span>
        {result.jockey && <span className="ml-2 text-sm text-gray-500">({result.jockey})</span>}
      </td>
      <td className="p-3 text-right">
        {result.payout ? (
          <span className={`font-bold ${raceColor}`}>
            {result.payout.toLocaleString()}
            <span className="ml-1 text-xs font-normal text-gray-500">원</span>
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
    </tr>
  );
};

export default function ResultsTable({ results, raceType, isLoading }: ResultsTableProps) {
  const config = raceTypeConfig[raceType];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (results.length === 0) {
    return <p className="py-8 text-center text-gray-500">경주 결과가 없습니다</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="border-b">
            <th className="w-20 p-3 text-center font-medium text-gray-700">순위</th>
            <th className="w-20 p-3 text-center font-medium text-gray-700">번호</th>
            <th className="p-3 text-left font-medium text-gray-700">마명/선수명</th>
            <th className="w-32 p-3 text-right font-medium text-gray-700">배당금</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <ResultRow key={result.rank} result={result} raceColor={config.color} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
