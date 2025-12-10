// src/app/home-components/TrackGuideSection.tsx
import React from 'react';

const horseTracks = [
  { name: '서울경마공원', location: '경기도 과천시', schedule: '토, 일', feature: '국내 최대 규모, 잔디 트랙' },
  { name: '부산경남경마공원', location: '부산광역시 강서구', schedule: '금, 토, 일', feature: '모래 트랙, 야간 경마' },
  { name: '제주경마공원', location: '제주특별자치도', schedule: '토, 일', feature: '조랑말 경주 특화' },
];

const otherTracks = [
  { name: '광명스피돔', sport: '경륜', location: '경기도 광명시', schedule: '금, 토, 일', colorClass: 'text-cycle' },
  { name: '미사리경정공원', sport: '경정', location: '경기도 하남시', schedule: '금, 토, 일', colorClass: 'text-boat' },
];

function HorseTracksTable() {
  return (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">경마장 정보</caption>
        <thead>
          <tr className="border-b border-gray-200 bg-horse/5">
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">경기장</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">위치</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">개최 요일</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">특징</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {horseTracks.map((track) => (
            <tr key={track.name}>
              <td className="px-3 py-2 font-medium">{track.name}</td>
              <td className="px-3 py-2 text-gray-600">{track.location}</td>
              <td className="px-3 py-2 text-gray-600">{track.schedule}</td>
              <td className="px-3 py-2 text-gray-600">{track.feature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OtherTracksTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">경륜/경정장 정보</caption>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">경기장</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">종목</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">위치</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">개최 요일</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {otherTracks.map((track) => (
            <tr key={track.name}>
              <td className={`px-3 py-2 font-medium ${track.colorClass}`}>{track.name}</td>
              <td className="px-3 py-2 text-gray-600">{track.sport}</td>
              <td className="px-3 py-2 text-gray-600">{track.location}</td>
              <td className="px-3 py-2 text-gray-600">{track.schedule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TrackGuideSection() {
  return (
    <section
      aria-labelledby="track-guide-heading"
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <h2 id="track-guide-heading" className="mb-4 text-xl font-bold text-gray-900">
        전국 경기장 안내
      </h2>
      <p className="mb-6 text-gray-600">
        대한민국의 공영 경주 경기장은 서울, 부산, 제주, 광명, 미사리에 위치하고 있습니다. 각
        경기장의 특성과 개최 일정을 확인하세요.
      </p>

      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-horse">
        <span aria-hidden="true">🐎</span>
        경마장 (한국마사회)
      </h3>
      <HorseTracksTable />

      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <span aria-hidden="true">🚴</span>
        <span aria-hidden="true">🚤</span>
        경륜 · 경정장 (국민체육진흥공단)
      </h3>
      <OtherTracksTable />
    </section>
  );
}
