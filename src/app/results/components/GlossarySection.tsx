// src/app/results/components/GlossarySection.tsx
import React from 'react';

const glossaryItems = [
  { term: '단승식 (Win)', description: '1위를 정확히 맞추는 베팅 방식' },
  { term: '복승식 (Place)', description: '1~2위를 순서 상관없이 맞추는 방식' },
  { term: '쌍승식 (Quinella)', description: '1~2위를 순서대로 맞추는 방식' },
  { term: '배당률 (Odds)', description: '베팅 금액 대비 수익 비율' },
  { term: '기수 (Jockey)', description: '경마에서 말을 조종하는 선수' },
  { term: '출마표', description: '경주에 출전하는 마필/선수 목록' },
  { term: '마체중', description: '경주마의 현재 체중 (kg)' },
  { term: '부담중량', description: '기수와 안장 등의 총 무게' },
  { term: '착차 (Time Diff)', description: '1위와의 시간 차이' },
];

export function GlossarySection() {
  return (
    <section
      aria-labelledby="glossary-heading"
      className="mt-8 rounded-xl border border-outline-variant bg-surface p-6"
    >
      <h2 id="glossary-heading" className="mb-4 text-title-large font-semibold text-on-surface">
        경주 용어 사전
      </h2>
      <p className="mb-6 text-body-medium text-on-surface-variant">
        경마, 경륜, 경정에서 자주 사용되는 용어를 알아보세요.
      </p>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {glossaryItems.map((item) => (
          <div key={item.term} className="rounded-lg bg-surface-container p-3">
            <dt className="font-semibold text-on-surface">{item.term}</dt>
            <dd className="mt-1 text-sm text-on-surface-variant">{item.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
