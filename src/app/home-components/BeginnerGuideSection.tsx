// src/app/home-components/BeginnerGuideSection.tsx
import React from 'react';

const viewingSteps = [
  { title: '출마표 확인', description: '출전 마필/선수의 정보와 최근 성적을 확인합니다.' },
  { title: '배당률 확인', description: '실시간 배당률을 확인하여 예상을 세웁니다.' },
  { title: '경주 관람', description: '현장 또는 온라인으로 경주를 관람합니다.' },
  { title: '결과 확인', description: '경주 종료 후 결과와 배당금을 확인합니다.' },
];

const tips = [
  { title: '기록 분석:', description: '최근 5경주 이상의 기록을 참고하세요.' },
  { title: '날씨 영향:', description: '비 오는 날은 경주 결과에 영향을 줄 수 있습니다.' },
  { title: '트랙 특성:', description: '각 경기장마다 트랙 특성이 다릅니다.' },
  { title: '마체중 변화:', description: '급격한 체중 변화는 컨디션 지표입니다.' },
  { title: '기수/선수 성적:', description: '숙련된 기수/선수가 유리합니다.' },
];

function ViewingStepsList() {
  return (
    <ol className="space-y-3">
      {viewingSteps.map((step, index) => (
        <li key={step.title} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {index + 1}
          </span>
          <div>
            <strong className="text-gray-900">{step.title}</strong>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function TipsList() {
  return (
    <ul className="space-y-2">
      {tips.map((tip) => (
        <li key={tip.title} className="flex items-start gap-2 text-sm">
          <span aria-hidden="true" className="mt-0.5 text-green-600">✓</span>
          <span className="text-gray-600">
            <strong className="text-gray-900">{tip.title}</strong> {tip.description}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BeginnerGuideSection() {
  return (
    <section
      aria-labelledby="beginner-guide-heading"
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <h2 id="beginner-guide-heading" className="mb-4 text-xl font-bold text-gray-900">
        초보자를 위한 경주 관람 가이드
      </h2>
      <p className="mb-6 text-gray-600">
        처음 경마, 경륜, 경정을 접하는 분들을 위한 기본 안내입니다. 경주 관람 전 알아두면 좋은
        정보를 정리했습니다.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-800">경주 관람 순서</h3>
          <ViewingStepsList />
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-800">알아두면 좋은 팁</h3>
          <TipsList />
        </div>
      </div>
    </section>
  );
}
