// src/components/race-detail/RaceSummaryCard.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import RaceSummaryCard from './RaceSummaryCard';
import { Race, RaceType, RaceStatus } from '@/types';

// Helper to create mock race data
function createMockRace(overrides: Partial<Race> = {}): Race {
  return {
    id: 'horse-1-5-20251210',
    type: 'horse' as RaceType,
    raceNo: 5,
    track: '서울',
    date: '2024-12-10',
    meetCode: '1',
    startTime: '14:30',
    distance: 1400,
    grade: '국내산 3세',
    status: 'upcoming' as RaceStatus,
    entries: [],
    ...overrides,
  };
}

describe('RaceSummaryCard', () => {
  describe('rendering', () => {
    it('should render the component with all race information', () => {
      const race = createMockRace();
      render(<RaceSummaryCard race={race} />);

      // 종목 (race type)
      expect(screen.getByText('경마')).toBeInTheDocument();

      // 경주장 (track)
      expect(screen.getByText('서울')).toBeInTheDocument();

      // 회차 (race number)
      expect(screen.getByText(/제5경주/)).toBeInTheDocument();

      // 등급 (grade)
      expect(screen.getByText('국내산 3세')).toBeInTheDocument();

      // 거리 (distance)
      expect(screen.getByText(/1,400m/)).toBeInTheDocument();

      // 출발 시간 (start time)
      expect(screen.getByText('14:30')).toBeInTheDocument();

      // 상태 (status)
      expect(screen.getByText('예정')).toBeInTheDocument();
    });

    it('should render without distance when not provided', () => {
      const race = createMockRace({ distance: undefined });
      render(<RaceSummaryCard race={race} />);

      expect(screen.queryByText(/m$/)).not.toBeInTheDocument();
    });

    it('should render without grade when not provided', () => {
      const race = createMockRace({ grade: undefined });
      render(<RaceSummaryCard race={race} />);

      expect(screen.queryByText('국내산 3세')).not.toBeInTheDocument();
    });
  });

  describe('race types', () => {
    it('should display correct label and styling for horse racing', () => {
      const race = createMockRace({ type: 'horse' });
      render(<RaceSummaryCard race={race} />);

      const typeBadge = screen.getByText('경마');
      expect(typeBadge).toHaveClass('text-horse');
    });

    it('should display correct label and styling for cycle racing', () => {
      const race = createMockRace({ type: 'cycle', track: '광명' });
      render(<RaceSummaryCard race={race} />);

      const typeBadge = screen.getByText('경륜');
      expect(typeBadge).toHaveClass('text-cycle');
    });

    it('should display correct label and styling for boat racing', () => {
      const race = createMockRace({ type: 'boat', track: '미사리' });
      render(<RaceSummaryCard race={race} />);

      const typeBadge = screen.getByText('경정');
      expect(typeBadge).toHaveClass('text-boat');
    });
  });

  describe('race status', () => {
    it('should display status badge for upcoming race', () => {
      const race = createMockRace({ status: 'upcoming' });
      render(<RaceSummaryCard race={race} />);

      expect(screen.getByText('예정')).toBeInTheDocument();
    });

    it('should display status badge for live race', () => {
      const race = createMockRace({ status: 'live' });
      render(<RaceSummaryCard race={race} />);

      expect(screen.getByText('진행중')).toBeInTheDocument();
    });

    it('should display status badge for finished race', () => {
      const race = createMockRace({ status: 'finished' });
      render(<RaceSummaryCard race={race} />);

      expect(screen.getByText('완료')).toBeInTheDocument();
    });

    it('should display status badge for canceled race', () => {
      const race = createMockRace({ status: 'canceled' });
      render(<RaceSummaryCard race={race} />);

      expect(screen.getByText('취소')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      const race = createMockRace();
      render(<RaceSummaryCard race={race} />);

      // Race title should be in a heading
      expect(screen.getByRole('heading', { name: /서울 제5경주/ })).toBeInTheDocument();
    });

    it('should have accessible time element', () => {
      const race = createMockRace();
      render(<RaceSummaryCard race={race} />);

      const timeElement = screen.getByText('14:30');
      expect(timeElement).toHaveAttribute('datetime', '14:30');
    });

    it('should have a descriptive aria-label on the card', () => {
      const race = createMockRace();
      render(<RaceSummaryCard race={race} />);

      expect(screen.getByRole('region', { name: /경주 요약/ })).toBeInTheDocument();
    });
  });

  describe('data-testid', () => {
    it('should have data-testid for integration testing', () => {
      const race = createMockRace();
      render(<RaceSummaryCard race={race} />);

      expect(screen.getByTestId('race-summary-card')).toBeInTheDocument();
    });
  });
});
