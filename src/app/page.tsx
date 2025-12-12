import { Suspense } from 'react';
import Script from 'next/script';
import TodayRaces from '@/components/TodayRaces';
import QuickStats from '@/components/QuickStats';
import Link from 'next/link';
import { RaceType } from '@/types';
import { QuickStatsSkeleton, RaceListSkeleton } from '@/components/Skeletons';
import { getFormattedKoreanDate, formatDate, getKoreanDate } from '@/lib/utils/date';
import {
  RaceTypesGuide,
  OddsGuideSection,
  TrackGuideSection,
  BeginnerGuideSection,
  faqSchema,
  howToSchema,
} from './home-components';

// Tab configuration for consistent styling and accessibility
const tabConfig: Record<
  RaceType,
  {
    icon: string;
    label: string;
    activeClass: string;
    inactiveHoverClass: string;
  }
> = {
  horse: {
    icon: '🐎',
    label: '경마',
    activeClass: 'text-horse bg-horse/10 border-b-2 border-horse',
    inactiveHoverClass: 'hover:text-horse hover:bg-horse/5',
  },
  cycle: {
    icon: '🚴',
    label: '경륜',
    activeClass: 'text-cycle bg-cycle/10 border-b-2 border-cycle',
    inactiveHoverClass: 'hover:text-cycle hover:bg-cycle/5',
  },
  boat: {
    icon: '🚤',
    label: '경정',
    activeClass: 'text-boat bg-boat/10 border-b-2 border-boat',
    inactiveHoverClass: 'hover:text-boat hover:bg-boat/5',
  },
};

const tabIds = ['horse', 'cycle', 'boat'] as const;

interface TabLinkProps {
  tabId: RaceType;
  isActive: boolean;
}

function TabLink({ tabId, isActive }: TabLinkProps) {
  const config = tabConfig[tabId];

  return (
    <Link
      href={`/?tab=${tabId}`}
      role="tab"
      id={`tab-${tabId}`}
      aria-selected={isActive}
      aria-controls={`tabpanel-${tabId}`}
      tabIndex={isActive ? 0 : -1}
      className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:text-base ${isActive ? config.activeClass : `text-gray-500 ${config.inactiveHoverClass}`} `}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </Link>
  );
}

function AnnouncementBanner() {
  return (
    <aside
      aria-label="서비스 안내"
      className="to-secondary rounded-xl bg-gradient-to-r from-primary p-6 text-white shadow-lg"
    >
      <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
        <span aria-hidden="true">📊</span>
        RaceLab 베타 서비스
      </h2>
      <p className="mb-3 text-sm leading-relaxed text-white/90">
        경마, 경륜, 경정 정보를 한 곳에서 확인하세요. 실시간 배당률과 경주 결과를 무료로 제공합니다.
      </p>
      <Link
        href="/results"
        className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/30"
      >
        <span aria-hidden="true">📈</span>
        과거 경주 결과 조회하기
      </Link>
    </aside>
  );
}

function PageHeader() {
  const todayFormatted = getFormattedKoreanDate();
  const todayISO = formatDate(getKoreanDate());

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">오늘의 경주</h1>
      <time dateTime={todayISO} className="text-sm text-gray-600 md:text-base">
        {todayFormatted}
      </time>
    </header>
  );
}

interface RaceTabsProps {
  currentTab: RaceType;
}

function RaceTabs({ currentTab }: RaceTabsProps) {
  return (
    <section
      data-testid="today-races"
      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
    >
      <div role="tablist" aria-label="경주 종목 선택" className="flex border-b border-gray-100">
        {tabIds.map((tabId) => (
          <TabLink key={tabId} tabId={tabId} isActive={currentTab === tabId} />
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${currentTab}`}
        aria-labelledby={`tab-${currentTab}`}
        tabIndex={0}
        className="p-4 focus:outline-none"
      >
        <Suspense key={currentTab} fallback={<RaceListSkeleton />}>
          <TodayRaces filter={currentTab} />
        </Suspense>
      </div>
    </section>
  );
}

function JsonLdScripts() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    </>
  );
}

export default function Home({ searchParams }: { searchParams: { tab?: string } }) {
  const currentTab = (searchParams.tab as RaceType) || 'horse';

  return (
    <>
      <JsonLdScripts />

      <div className="space-y-6">
        <PageHeader />
        <section aria-label="경주 요약 통계" data-testid="quick-stats">
          <Suspense fallback={<QuickStatsSkeleton />}>
            <QuickStats />
          </Suspense>
        </section>
        <RaceTabs currentTab={currentTab} />
        <AnnouncementBanner />
        <RaceTypesGuide />
        <OddsGuideSection />
        <TrackGuideSection />
        <BeginnerGuideSection />
      </div>
    </>
  );
}
