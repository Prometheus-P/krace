'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ResultsList } from './ResultsList';
import { HistoricalRace, PaginatedResults } from '@/types';

interface ResultsListClientProps {
  results: PaginatedResults<HistoricalRace>;
}

export function ResultsListClient({ results }: ResultsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }

    const queryString = params.toString();
    router.push(queryString ? `/results?${queryString}` : '/results');
  };

  return <ResultsList results={results} onPageChange={handlePageChange} />;
}
