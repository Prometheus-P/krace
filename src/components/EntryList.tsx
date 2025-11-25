// src/components/EntryList.tsx
import React from 'react';
import { Entry } from '@/types';

interface EntryListProps {
  entries: Entry[];
  isLoading?: boolean;
  error?: Error | null;
}

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-12 bg-gray-200 rounded" />
    ))}
  </div>
);

const EntryRow = ({ entry }: { entry: Entry }) => (
  <tr className="border-b last:border-b-0 hover:bg-gray-50">
    <td className="p-3 text-center font-semibold">{entry.no}</td>
    <td className="p-3 font-semibold">{entry.name}</td>
    {entry.jockey !== undefined && (
      <td className="p-3 text-gray-600">{entry.jockey}</td>
    )}
    {entry.trainer !== undefined && (
      <td className="p-3 text-gray-600">{entry.trainer}</td>
    )}
    {entry.age !== undefined && (
      <td className="p-3 text-center">{entry.age}</td>
    )}
    {entry.weight !== undefined && (
      <td className="p-3 text-center">{entry.weight}kg</td>
    )}
    {entry.recentRecord !== undefined && (
      <td className="p-3 text-gray-600">{entry.recentRecord}</td>
    )}
  </tr>
);

export default function EntryList({ entries, isLoading, error }: EntryListProps) {
  if (isLoading) {
    return (
      <div className="py-8" data-testid="loading-skeleton">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 text-center py-8" data-testid="error-message">
        오류: {error.message}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">출주마 정보가 없습니다</p>
    );
  }

  // Determine which columns to show based on available data
  const hasJockey = entries.some(e => e.jockey !== undefined);
  const hasTrainer = entries.some(e => e.trainer !== undefined);
  const hasAge = entries.some(e => e.age !== undefined);
  const hasWeight = entries.some(e => e.weight !== undefined);
  const hasRecentRecord = entries.some(e => e.recentRecord !== undefined);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="border-b">
            <th className="p-3 text-center font-medium w-16">번호</th>
            <th className="p-3 text-left font-medium">마명/선수명</th>
            {hasJockey && <th className="p-3 text-left font-medium">기수</th>}
            {hasTrainer && <th className="p-3 text-left font-medium">조교사</th>}
            {hasAge && <th className="p-3 text-center font-medium">연령</th>}
            {hasWeight && <th className="p-3 text-center font-medium">중량</th>}
            {hasRecentRecord && <th className="p-3 text-left font-medium">최근성적</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <EntryRow key={entry.no} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
