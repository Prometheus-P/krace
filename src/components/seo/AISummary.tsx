// src/components/seo/AISummary.tsx
// Plain-text summary for LLM parsing (GEO optimization)

import { Race, RaceResult, Dividend } from '@/types';

interface AISummaryProps {
  race: Race;
  results?: RaceResult[];
  dividends?: Dividend[];
}

const RACE_TYPE_KO: Record<string, string> = {
  horse: '경마',
  cycle: '경륜',
  boat: '경정',
};

const DATA_SOURCE: Record<string, string> = {
  horse: '한국마사회 (KRA) 공식 데이터',
  cycle: '국민체육진흥공단 (KSPO) 공식 데이터',
  boat: '국민체육진흥공단 (KSPO) 공식 데이터',
};

const STATUS_KO: Record<string, string> = {
  upcoming: '경주 예정',
  live: '진행 중',
  finished: '경주 종료',
  canceled: '취소됨',
};

/**
 * AISummary component renders a screen-reader-only summary of race data
 * in plain text format optimized for LLM parsing (ChatGPT, Perplexity, etc.)
 *
 * Format follows the contract in ai-summary.schema.json:
 * - 경주 정보: {date} {track} 제{raceNo}경주 {raceType} ({distance}m)
 * - 상태: {status}
 * - 경주 결과: 1착 {name} (배당 {odds}배, 기수: {jockey}), 2착 ..., 3착 ...
 * - 배당금: 단승 {win}원, 복승 {place}원, 쌍승 {quinella}원
 * - 데이터 출처: {dataSource}
 */
export default function AISummary({ race, results, dividends }: AISummaryProps) {
  const raceType = RACE_TYPE_KO[race.type] || race.type;
  const distance = race.distance ? ` (${race.distance}m)` : '';
  const statusText = STATUS_KO[race.status] || '경주 예정';
  const dataSource = DATA_SOURCE[race.type];

  // Format results text
  const resultText =
    results && results.length > 0
      ? results
          .slice(0, 3)
          .map((r) => {
            const parts = [`${r.rank}착 ${r.name}`];
            if (r.odds) parts.push(`배당 ${r.odds}배`);
            if (r.jockey) parts.push(`기수: ${r.jockey}`);
            return parts.join(' ');
          })
          .join(', ')
      : null;

  // Format dividends text
  const dividendText =
    dividends && dividends.length > 0
      ? dividends
          .map((d) => {
            const typeKo = d.type === 'win' ? '단승' : d.type === 'place' ? '복승' : '쌍승';
            return `${typeKo} ${d.amount.toLocaleString()}원`;
          })
          .join(', ')
      : null;

  return (
    <section
      data-testid="ai-summary"
      className="sr-only"
      aria-label="경주 요약 정보 (AI/검색엔진용)"
    >
      <p>
        경주 정보: {race.date || new Date().toISOString().split('T')[0]} {race.track} 제
        {race.raceNo}경주 {raceType}
        {distance}
      </p>
      <p>상태: {statusText}</p>
      {resultText && <p>경주 결과: {resultText}</p>}
      {dividendText && <p>배당금: {dividendText}</p>}
      <p>데이터 출처: {dataSource}</p>
    </section>
  );
}
