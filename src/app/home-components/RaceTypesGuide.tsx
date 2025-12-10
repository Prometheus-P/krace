// src/app/home-components/RaceTypesGuide.tsx
import React from 'react';

const raceTypes = [
  {
    type: 'horse',
    icon: '🐎',
    title: '경마 (Horse Racing)',
    description: '말과 기수가 함께 달리는 경주. 서울(과천), 부산경남, 제주에서 개최됩니다.',
    details: ['주관: 한국마사회 (KRA)', '경기장: 서울, 부산경남, 제주', '거리: 1,000m ~ 2,000m'],
    borderClass: 'border-horse/20',
    bgClass: 'bg-horse/5',
    textClass: 'text-horse',
  },
  {
    type: 'cycle',
    icon: '🚴',
    title: '경륜 (Cycle Racing)',
    description: '사이클 선수들이 경쟁하는 트랙 경주. 광명에서 개최됩니다.',
    details: ['주관: 국민체육진흥공단 (KSPO)', '경기장: 광명스피돔', '거리: 1,500m ~ 2,400m'],
    borderClass: 'border-cycle/20',
    bgClass: 'bg-cycle/5',
    textClass: 'text-cycle',
  },
  {
    type: 'boat',
    icon: '🚤',
    title: '경정 (Boat Racing)',
    description: '모터보트 선수들의 수상 경주. 미사리에서 개최됩니다.',
    details: ['주관: 국민체육진흥공단 (KSPO)', '경기장: 미사리경정공원', '거리: 600m (3바퀴)'],
    borderClass: 'border-boat/20',
    bgClass: 'bg-boat/5',
    textClass: 'text-boat',
  },
];

function RaceTypeCard({
  icon,
  title,
  description,
  details,
  borderClass,
  bgClass,
  textClass,
}: (typeof raceTypes)[0]) {
  return (
    <article className={`rounded-lg border ${borderClass} ${bgClass} p-4`}>
      <h3 className={`mb-2 flex items-center gap-2 font-semibold ${textClass}`}>
        <span aria-hidden="true">{icon}</span>
        {title}
      </h3>
      <p className="mb-3 text-sm text-gray-600">{description}</p>
      <ul className="space-y-1 text-xs text-gray-500">
        {details.map((detail) => (
          <li key={detail}>• {detail}</li>
        ))}
      </ul>
    </article>
  );
}

export function RaceTypesGuide() {
  return (
    <section
      aria-labelledby="race-types-heading"
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <h2 id="race-types-heading" className="mb-4 text-xl font-bold text-gray-900">
        경마 · 경륜 · 경정이란?
      </h2>
      <p className="mb-6 text-gray-600">
        대한민국에서 합법적으로 운영되는 세 가지 공영 경주 스포츠입니다. 각 경주는 고유한 특성과
        매력을 가지고 있으며, RaceLab에서 모든 정보를 한눈에 확인할 수 있습니다.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {raceTypes.map((raceType) => (
          <RaceTypeCard key={raceType.type} {...raceType} />
        ))}
      </div>
    </section>
  );
}
