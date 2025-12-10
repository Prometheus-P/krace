// src/app/results/components/ComparisonSection.tsx
import React from 'react';

const comparisonData = [
  {
    feature: '핵심 변수',
    horse: '마필 컨디션, 기수 실력',
    cycle: '선수 컨디션, 작전',
    boat: '모터 상태, 코스 위치',
  },
  {
    feature: '날씨 영향',
    horse: '높음 (트랙 상태)',
    cycle: '중간 (실내)',
    boat: '매우 높음 (수면 상태)',
  },
  {
    feature: '이변 빈도',
    horse: '중간',
    cycle: '높음 (낙차 등)',
    boat: '높음 (전복 등)',
  },
  {
    feature: '분석 난이도',
    horse: '중간',
    cycle: '높음',
    boat: '높음',
  },
  {
    feature: '평균 경주 시간',
    horse: '1분 ~ 2분 30초',
    cycle: '2분 ~ 3분',
    boat: '1분 40초 ~ 2분',
  },
];

export function ComparisonSection() {
  return (
    <section
      aria-labelledby="comparison-heading"
      className="mt-6 rounded-xl border border-outline-variant bg-surface p-6"
    >
      <h2 id="comparison-heading" className="mb-4 text-title-large font-semibold text-on-surface">
        종목별 특성 비교
      </h2>
      <p className="mb-6 text-body-medium text-on-surface-variant">
        경마, 경륜, 경정의 결과 분석 시 고려해야 할 종목별 특성입니다.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">종목별 특성 비교표</caption>
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-on-surface">
                특성
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-horse">
                경마
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-cycle">
                경륜
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-boat">
                경정
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {comparisonData.map((row) => (
              <tr key={row.feature}>
                <td className="px-4 py-3 font-medium text-on-surface">{row.feature}</td>
                <td className="px-4 py-3 text-on-surface-variant">{row.horse}</td>
                <td className="px-4 py-3 text-on-surface-variant">{row.cycle}</td>
                <td className="px-4 py-3 text-on-surface-variant">{row.boat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
