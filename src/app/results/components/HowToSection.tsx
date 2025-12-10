// src/app/results/components/HowToSection.tsx
import React from 'react';

const steps = [
  { title: '날짜 선택', description: '조회하고 싶은 경주 날짜를 선택합니다. 기본값은 오늘입니다.' },
  { title: '경주 유형 필터', description: '경마, 경륜, 경정 중 원하는 경주 유형을 선택합니다.' },
  {
    title: '경기장 선택 (선택사항)',
    description: '서울, 부산경남, 제주, 광명, 미사리 중 특정 경기장을 선택할 수 있습니다.',
  },
  { title: '결과 확인', description: '순위, 기록 시간, 배당금 등 상세 결과를 확인합니다.' },
];

export function HowToSection() {
  return (
    <section
      aria-labelledby="howto-heading"
      className="mt-6 rounded-xl border border-outline-variant bg-surface p-6"
    >
      <h2 id="howto-heading" className="mb-4 text-title-large font-semibold text-on-surface">
        경주 결과 조회 방법
      </h2>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-on-primary">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold text-on-surface">{step.title}</h3>
              <p className="text-sm text-on-surface-variant">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
