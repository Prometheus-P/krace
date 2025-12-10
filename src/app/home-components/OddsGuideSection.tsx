// src/app/home-components/OddsGuideSection.tsx
import React from 'react';

const bettingTypes = [
  { type: '단승식', description: '1위를 정확히 맞추는 방식', difficulty: '쉬움', difficultyClass: 'text-green-600', avgOdds: '2~10배' },
  { type: '복승식', description: '1~2위를 순서 상관없이 맞추기', difficulty: '보통', difficultyClass: 'text-yellow-600', avgOdds: '5~30배' },
  { type: '쌍승식', description: '1~2위를 순서대로 맞추기', difficulty: '어려움', difficultyClass: 'text-red-600', avgOdds: '10~100배' },
  { type: '삼복승식', description: '1~3위를 순서 상관없이 맞추기', difficulty: '어려움', difficultyClass: 'text-red-600', avgOdds: '20~200배' },
];

function BettingTypesTable() {
  return (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">베팅 유형별 설명</caption>
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">
              베팅 유형
            </th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">
              설명
            </th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">
              난이도
            </th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">
              평균 배당률
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bettingTypes.map((betting) => (
            <tr key={betting.type}>
              <td className="px-3 py-2 font-medium">{betting.type}</td>
              <td className="px-3 py-2 text-gray-600">{betting.description}</td>
              <td className="px-3 py-2">
                <span className={betting.difficultyClass}>{betting.difficulty}</span>
              </td>
              <td className="px-3 py-2 text-gray-600">{betting.avgOdds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OddsGuideSection() {
  return (
    <section
      aria-labelledby="odds-guide-heading"
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <h2 id="odds-guide-heading" className="mb-4 text-xl font-bold text-gray-900">
        배당률 이해하기
      </h2>
      <p className="mb-4 text-gray-600">
        경주 배당률은 각 출전 선수/마필의 승리 예상 확률을 나타냅니다. 배당률이 낮을수록 우승 확률이
        높다고 예상되며, 높을수록 이변의 가능성을 의미합니다.
      </p>

      <h3 className="mb-3 text-lg font-semibold text-gray-800">베팅 유형 소개</h3>
      <BettingTypesTable />

      <h3 className="mb-3 text-lg font-semibold text-gray-800">배당률 계산 원리</h3>
      <p className="text-sm text-gray-600">
        배당률은 총 베팅 금액에서 특정 선수/마필에 베팅된 금액의 비율로 결정됩니다. 많은 사람이
        베팅할수록 배당률이 낮아지고, 적게 베팅할수록 배당률이 높아집니다. 경주 직전까지 배당률은
        계속 변동됩니다.
      </p>
    </section>
  );
}
