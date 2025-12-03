// src/components/HorseEntryTable.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import HorseEntryTable from './HorseEntryTable';
import { Race, Entry } from '@/types';

describe('HorseEntryTable', () => {
  const makeRace = (entries: Entry[]): Race => ({
    id: 'horse-1-3-20240101',
    type: 'horse',
    raceNo: 3,
    track: '서울',
    date: '20240101',
    startTime: '14:00',
    status: 'upcoming',
    entries,
    results: [],
    dividends: [],
  });

  it('renders a table when entries exist', () => {
    const entries: Entry[] = [
      { no: 5, name: '썬더볼트', age: 4, trainer: '박조교', recentRecord: '1-2-1' },
      { no: 3, name: '스피드킹', trainer: '김조교' },
    ];

    render(<HorseEntryTable race={makeRace(entries)} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('썬더볼트')).toBeVisible();
    expect(screen.getByText('스피드킹')).toBeVisible();
    expect(screen.getByText('연령')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(1);
  });

  it('shows placeholder text when no entries', () => {
    render(<HorseEntryTable race={makeRace([])} />);
    expect(screen.getByText('등록된 선수 정보가 없습니다.')).toBeVisible();
  });
});
