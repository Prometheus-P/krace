// src/components/QuickStats.test.tsx
import { render, screen } from '@testing-library/react';
import QuickStats from './QuickStats';
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  fetchHorseRaceSchedules: jest.fn(),
  fetchCycleRaceSchedules: jest.fn(),
  fetchBoatRaceSchedules: jest.fn(),
}));

// Mock the date utility
jest.mock('@/lib/utils/date', () => ({
  getTodayYYYYMMDD: jest.fn(() => '20240115'),
}));

describe('QuickStats Component', () => {
  beforeEach(() => {
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(new Array(5));
    (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue(new Array(3));
    (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue(new Array(2));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should_render_total_and_individual_race_counts', async () => {
    const resolvedComponent = await QuickStats();
    render(resolvedComponent);

    // Check for the labels and corresponding numbers
    expect(screen.getByText('총 경주')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // 5 + 3 + 2

    expect(screen.getByText('경마')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('경륜')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    expect(screen.getByText('경정')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should_call_all_api_functions_with_today_date', async () => {
    await QuickStats();

    expect(fetchHorseRaceSchedules).toHaveBeenCalledWith('20240115');
    expect(fetchCycleRaceSchedules).toHaveBeenCalledWith('20240115');
    expect(fetchBoatRaceSchedules).toHaveBeenCalledWith('20240115');
  });

  it('should_render_four_stat_cards', async () => {
    const resolvedComponent = await QuickStats();
    render(resolvedComponent);

    // Check for 4 stat cards (total + 3 race types)
    const statLabels = ['총 경주', '경마', '경륜', '경정'];
    statLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should_render_zero_when_no_races_available', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue([]);
      (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue([]);
      (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue([]);

      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      // All counts should be 0
      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(4); // total + horse + cycle + boat
    });

    it('should_render_correctly_when_only_horse_races_exist', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(new Array(10));
      (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue([]);
      (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue([]);

      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      // Both total and horse should show '10', cycle/boat show '0'
      const tens = screen.getAllByText('10');
      expect(tens).toHaveLength(2); // total + horse both equal 10
      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(2); // cycle + boat
    });

    it('should_handle_large_numbers', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(new Array(100));
      (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue(new Array(50));
      (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue(new Array(25));

      const resolvedComponent = await QuickStats();
      render(resolvedComponent);

      expect(screen.getByText('175')).toBeInTheDocument(); // total
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });
});
