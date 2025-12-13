// src/app/race/[id]/page.tsx
import { fetchRaceById } from '@/lib/api';
import type { Metadata, ResolvingMetadata } from 'next';
import Script from 'next/script';
import { RaceResult, Dividend } from '@/types';
import { RaceNotFound, BackNavigation } from './components';
import { RaceSummaryCard, EntryTable, RaceResultsOdds, KeyInsightBlock } from '@/components/race-detail';
import { generateRaceMetadata, generateSportsEventSchema, generateBreadcrumbListSchema } from '@/lib/seo';
import { AISummary } from '@/components/seo';
import ViewModeToggle from '@/components/shared/ViewModeToggle';
import PrintPdfButton from '@/components/shared/PrintPdfButton';
import RunnerTableDense from '@/components/race/RunnerTableDense';
import RunnerTableExpert from '@/components/race/RunnerTableExpert';
import { BookViewMode, RunnerVM } from '@/lib/view-models/bookVM';

type Props = {
  params: { id: string };
  searchParams?: { view?: BookViewMode };
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const race = await fetchRaceById(params.id);

  if (!race) {
    return { title: '경주 정보 - RaceLab' };
  }

  // Use centralized SEO metadata generator with canonical URL
  return generateRaceMetadata({
    id: race.id,
    type: race.type,
    track: race.track,
    raceNo: race.raceNo,
    date: race.date,
    distance: race.distance,
  });
}

// Mock results for demonstration (will be replaced with API data)
function getMockResults(
  raceStatus: string,
  entries: { no: number; name: string; jockey?: string; odds?: number }[]
): RaceResult[] {
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

// Mock dividends for demonstration (will be replaced with API data)
function getMockDividends(raceStatus: string, results: RaceResult[]): Dividend[] {
  if (raceStatus !== 'finished' || results.length < 2) {
    return [];
  }

  return [
    { type: 'win', entries: [results[0].no], amount: results[0].payout || 3500 },
    { type: 'place', entries: [results[0].no, results[1].no], amount: 1200 },
    { type: 'quinella', entries: [results[0].no, results[1].no], amount: 5600 },
  ];
}

export default async function RaceDetailPage({ params, searchParams = {} }: Props) {
  const race = await fetchRaceById(params.id);

  if (!race) {
    return <RaceNotFound />;
  }

  const results = getMockResults(race.status, race.entries);
  const dividends = getMockDividends(race.status, results);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

  // Race type in Korean
  const raceTypeKorean = race.type === 'horse' ? '경마' : race.type === 'cycle' ? '경륜' : '경정';

  // JSON-LD BreadcrumbList schema (FR-008) using centralized utility
  const breadcrumbSchema = generateBreadcrumbListSchema([
    { name: '홈', url: '/' },
    { name: raceTypeKorean, url: `/?tab=${race.type}` },
    { name: `${race.track} 제${race.raceNo}경주`, url: `/race/${race.id}` },
  ]);

  // JSON-LD SportsEvent schema using centralized utility with ImageObject for AI crawlers
  const sportsEventSchemaBase = generateSportsEventSchema(race, results);
  const sportsEventSchema = {
    ...sportsEventSchemaBase,
    image: {
      '@type': 'ImageObject',
      url: `${baseUrl}/opengraph-image.svg`,
      contentUrl: `${baseUrl}/opengraph-image.svg`,
      caption: `${race.track} 제${race.raceNo}경주 ${raceTypeKorean} 정보 - RaceLab`,
      width: 1200,
      height: 630,
      encodingFormat: 'image/svg+xml',
    },
  };

  const viewMode: BookViewMode = searchParams.view === 'expert' ? 'expert' : 'compact';
  const runnerVMs: RunnerVM[] = race.entries.map((entry) => ({
    number: entry.no,
    name: entry.name,
    age: entry.age,
    sex: undefined,
    jockey: entry.jockey,
    trainer: entry.trainer,
    odds: entry.odds,
    popularity: undefined,
    formLines: [],
  }));

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="sports-event-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventSchema) }}
      />

      {/* AI Summary for LLM parsing (sr-only) */}
      <AISummary race={race} results={results} dividends={dividends} />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackNavigation raceType={race.type} />
          <div className="flex flex-wrap items-center gap-2">
            <ViewModeToggle viewMode={viewMode} />
            <PrintPdfButton label="PDF/인쇄" />
          </div>
        </div>
        <RaceSummaryCard race={race} />
        <KeyInsightBlock race={race} results={results} />
        {viewMode === 'expert' ? (
          <RunnerTableExpert runners={runnerVMs} />
        ) : (
          <RunnerTableDense runners={runnerVMs} viewMode={viewMode} />
        )}
        <EntryTable race={race} />
        <RaceResultsOdds race={race} results={results} dividends={dividends} />
      </div>
    </>
  );
}
