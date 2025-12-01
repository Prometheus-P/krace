// src/components/OddsDisplay.test.tsx
import { render, screen } from '@testing-library/react';
import OddsDisplay from './OddsDisplay';
import { Entry } from '@/types';

describe('OddsDisplay', () => {
  const mockEntries: Entry[] = [
    { no: 1, name: '번개', odds: 2.5 },
    { no: 2, name: '태풍', odds: 3.8 },
    { no: 3, name: '질풍', odds: 5.2 },
  ];

  describe('rendering', () => {
    it('should render all entries with odds', () => {
      render(<OddsDisplay entries={mockEntries} raceType="horse" />);

      expect(screen.getByText('번개')).toBeInTheDocument();
      expect(screen.getByText('태풍')).toBeInTheDocument();
      expect(screen.getByText('질풍')).toBeInTheDocument();
    });

    it('should display odds values correctly', () => {
      render(<OddsDisplay entries={mockEntries} raceType="horse" />);

      expect(screen.getByText('2.5')).toBeInTheDocument();
      expect(screen.getByText('3.8')).toBeInTheDocument();
      expect(screen.getByText('5.2')).toBeInTheDocument();
    });

    it('should display entry numbers', () => {
      render(<OddsDisplay entries={mockEntries} raceType="horse" />);

      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getByText('3.')).toBeInTheDocument();
    });

    it('should display dash for entries without odds', () => {
      const entriesWithoutOdds: Entry[] = [
        { no: 1, name: '번개' },
        { no: 2, name: '태풍', odds: 3.8 },
      ];

      render(<OddsDisplay entries={entriesWithoutOdds} raceType="horse" />);

      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('3.8')).toBeInTheDocument();
    });
  });

  describe('race type styling', () => {
    it('should apply horse type colors', () => {
      const { container } = render(
        <OddsDisplay entries={mockEntries} raceType="horse" />
      );

      expect(container.querySelector('.border-horse')).toBeInTheDocument();
    });

    it('should apply cycle type colors', () => {
      const { container } = render(
        <OddsDisplay entries={mockEntries} raceType="cycle" />
      );

      expect(container.querySelector('.border-cycle')).toBeInTheDocument();
    });

    it('should apply boat type colors', () => {
      const { container } = render(
        <OddsDisplay entries={mockEntries} raceType="boat" />
      );

      expect(container.querySelector('.border-boat')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should display empty message when no entries', () => {
      render(<OddsDisplay entries={[]} raceType="horse" />);

      expect(screen.getByText('배당률 정보가 없습니다')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should display loading skeleton when isLoading is true', () => {
      render(<OddsDisplay entries={[]} raceType="horse" isLoading />);

      expect(screen.getByTestId('odds-loading')).toBeInTheDocument();
    });
  });

  describe('last updated time', () => {
    it('should display last updated time when provided', () => {
      render(
        <OddsDisplay
          entries={mockEntries}
          raceType="horse"
          lastUpdated="14:30:00"
        />
      );

      expect(screen.getByText(/14:30:00/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible labels for odds values', () => {
      render(<OddsDisplay entries={mockEntries} raceType="horse" />);

      const oddsCard = screen.getByLabelText(/1번 번개 배당률: 2.5배/);
      expect(oddsCard).toBeInTheDocument();
    });

    it('should indicate pending odds accessibly', () => {
      const entriesWithoutOdds: Entry[] = [{ no: 1, name: '번개' }];

      render(<OddsDisplay entries={entriesWithoutOdds} raceType="horse" />);

      const oddsCard = screen.getByLabelText(/1번 번개 배당률: 미정/);
      expect(oddsCard).toBeInTheDocument();
    });
  });
});
