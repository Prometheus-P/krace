// src/app/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

// Mock the child Server Components
jest.mock('@/components/QuickStats', () => {
  return function DummyQuickStats() {
    return (
      <div>
        <span>총 경주</span>
        <span>3</span>
      </div>
    );
  };
});

jest.mock('@/components/TodayRaces', () => {
  return function DummyTodayRaces() {
    return (
      <div>
        <p>서울 제1경주</p>
        <p>광명 제1경주</p>
        <p>미사리 제1경주</p>
      </div>
    );
  };
});

describe('HomePage', () => {
  it('should render QuickStats and TodayRaces components', () => {
    // Render the synchronous HomePage component
    render(<HomePage searchParams={{ tab: 'horse' }} />);

    // Check for content from the mocked QuickStats
    expect(screen.getByText('총 경주')).toBeInTheDocument();
    // Use getAllByText since '3' may appear in GEO content (step numbers, etc.)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);

    // Check for content from the mocked TodayRaces
    expect(screen.getByText('서울 제1경주')).toBeInTheDocument();
    expect(screen.getByText('광명 제1경주')).toBeInTheDocument();
    expect(screen.getByText('미사리 제1경주')).toBeInTheDocument();
  });
});
