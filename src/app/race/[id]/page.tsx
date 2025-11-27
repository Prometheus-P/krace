// src/app/race/[id]/page.tsx
import { fetchRaceById } from '@/lib/api';
import type { Metadata, ResolvingMetadata } from 'next';
import OddsDisplay from '@/components/OddsDisplay';
import ResultsTable from '@/components/ResultsTable';
import { RaceResult } from '@/types';
import {
  RaceNotFound,
  BackNavigation,
  RaceHeader,
  EntriesSection,
} from './components';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const race = await fetchRaceById(params.id);

  if (!race) {
    return { title: '경주 정보 - KRace' };
  }

  return {
    title: `${race.track} 제${race.raceNo}경주 - KRace`,
    description: `${race.track} 제${race.raceNo}경주 경마 상세 정보, 출전표, 배당률을 확인하세요.`,
  };
}

// Mock results for demonstration (will be replaced with API data)
function getMockResults(raceStatus: string, entries: { no: number; name: string; jockey?: string; odds?: number }[]): RaceResult[] {
  if (raceStatus !== 'finished' || entries.length < 3) {
    return [];
  }

  // Generate mock results from entries
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((entry, index) => ({
    rank: index + 1,
    no: entry.no,
    name: entry.name,
    jockey: entry.jockey,
    odds: entry.odds,
    payout: entry.odds ? Math.round(entry.odds * 1000) : undefined,
  }));
}

export default async function RaceDetailPage({ params }: Props) {
  const race = await fetchRaceById(params.id);

  if (!race) {
    return <RaceNotFound />;
  }

  const isFinished = race.status === 'finished';
  const results = getMockResults(race.status, race.entries);

  return (
    <div className="space-y-6">
      <BackNavigation raceType={race.type} />
      <RaceHeader race={race} />
      <EntriesSection race={race} />

      {/* Odds section */}
      <section
        className="bg-white p-4 md:p-6 rounded-xl shadow-sm"
        data-testid="odds"
        aria-labelledby="odds-heading"
      >
        <h2 id="odds-heading" className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span aria-hidden="true">💰</span>
          단승 배당률
        </h2>
        <OddsDisplay entries={race.entries} raceType={race.type} />
      </section>

      {/* Results section (only for finished races) */}
      {isFinished && results.length > 0 && (
        <section
          className="bg-white p-4 md:p-6 rounded-xl shadow-sm"
          data-testid="results"
          aria-labelledby="results-heading"
        >
          <h2 id="results-heading" className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span aria-hidden="true">🏆</span>
            경주 결과
          </h2>
          <ResultsTable results={results} raceType={race.type} />
        </section>
      )}
    </div>
  );
}
