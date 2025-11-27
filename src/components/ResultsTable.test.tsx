// src/components/ResultsTable.test.tsx
import { render, screen } from '@testing-library/react';
import ResultsTable from './ResultsTable';
import { RaceResult } from '@/types';

describe('ResultsTable', () => {
  const mockResults: RaceResult[] = [
    { rank: 1, no: 3, name: '번개', jockey: '김철수', odds: 2.5, payout: 2500 },
    { rank: 2, no: 7, name: '태풍', jockey: '이영희', odds: 4.2, payout: 4200 },
    { rank: 3, no: 1, name: '질풍', jockey: '박민수', odds: 6.8, payout: 6800 },
  ];

  describe('rendering', () => {
    it('should render all results with rankings', () => {
      render(<ResultsTable results={mockResults} raceType="horse" />);

      expect(screen.getByText('번개')).toBeInTheDocument();
      expect(screen.getByText('태풍')).toBeInTheDocument();
      expect(screen.getByText('질풍')).toBeInTheDocument();
    });

    it('should display rank badges (1st, 2nd, 3rd)', () => {
      render(<ResultsTable results={mockResults} raceType="horse" />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display entry numbers', () => {
      render(<ResultsTable results={mockResults} raceType="horse" />);

      expect(screen.getByText('3번')).toBeInTheDocument();
      expect(screen.getByText('7번')).toBeInTheDocument();
      expect(screen.getByText('1번')).toBeInTheDocument();
    });

    it('should display payout information', () => {
      render(<ResultsTable results={mockResults} raceType="horse" />);

      expect(screen.getByText('2,500')).toBeInTheDocument();
      expect(screen.getByText('4,200')).toBeInTheDocument();
      expect(screen.getByText('6,800')).toBeInTheDocument();
    });

    it('should display jockey names when available', () => {
      render(<ResultsTable results={mockResults} raceType="horse" />);

      expect(screen.getByText(/김철수/)).toBeInTheDocument();
      expect(screen.getByText(/이영희/)).toBeInTheDocument();
      expect(screen.getByText(/박민수/)).toBeInTheDocument();
    });
  });

  describe('race type styling', () => {
    it('should apply horse type colors', () => {
      const { container } = render(
        <ResultsTable results={mockResults} raceType="horse" />
      );

      expect(container.querySelector('.text-horse')).toBeInTheDocument();
    });

    it('should apply cycle type colors', () => {
      const { container } = render(
        <ResultsTable results={mockResults} raceType="cycle" />
      );

      expect(container.querySelector('.text-cycle')).toBeInTheDocument();
    });

    it('should apply boat type colors', () => {
      const { container } = render(
        <ResultsTable results={mockResults} raceType="boat" />
      );

      expect(container.querySelector('.text-boat')).toBeInTheDocument();
    });
  });

  describe('rank styling', () => {
    it('should apply gold styling for 1st place', () => {
      const { container } = render(
        <ResultsTable results={mockResults} raceType="horse" />
      );

      expect(container.querySelector('.bg-yellow-400')).toBeInTheDocument();
    });

    it('should apply silver styling for 2nd place', () => {
      const { container } = render(
        <ResultsTable results={mockResults} raceType="horse" />
      );

      expect(container.querySelector('.bg-gray-300')).toBeInTheDocument();
    });

    it('should apply bronze styling for 3rd place', () => {
      const { container } = render(
        <ResultsTable results={mockResults} raceType="horse" />
      );

      expect(container.querySelector('.bg-orange-300')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should display empty message when no results', () => {
      render(<ResultsTable results={[]} raceType="horse" />);

      expect(screen.getByText('경주 결과가 없습니다')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should display loading skeleton when isLoading is true', () => {
      render(<ResultsTable results={[]} raceType="horse" isLoading />);

      expect(screen.getByTestId('results-loading')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible table structure', () => {
      render(<ResultsTable results={mockResults} raceType="horse" />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 results
    });

    it('should have column headers', () => {
      render(<ResultsTable results={mockResults} raceType="horse" />);

      expect(screen.getByText('순위')).toBeInTheDocument();
      expect(screen.getByText('번호')).toBeInTheDocument();
      expect(screen.getByText('마명/선수명')).toBeInTheDocument();
      expect(screen.getByText('배당금')).toBeInTheDocument();
    });
  });
});
