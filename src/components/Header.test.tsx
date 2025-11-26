// src/components/Header.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}));

describe('Header Component', () => {
  beforeEach(() => {
    render(<Header />);
  });

  it('should_render_project_title_with_link_to_home', () => {
    const titleLink = screen.getByRole('link', { name: /KRace/i });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', '/');
  });

  it('should_render_navigation_links_with_correct_hrefs', () => {
    const horseLink = screen.getByRole('link', { name: /경마/i });
    expect(horseLink).toBeInTheDocument();
    expect(horseLink).toHaveAttribute('href', '/?tab=horse');

    const cycleLink = screen.getByRole('link', { name: /경륜/i });
    expect(cycleLink).toBeInTheDocument();
    expect(cycleLink).toHaveAttribute('href', '/?tab=cycle');

    const boatLink = screen.getByRole('link', { name: /경정/i });
    expect(boatLink).toBeInTheDocument();
    expect(boatLink).toHaveAttribute('href', '/?tab=boat');
  });

  it('should_render_all_race_type_links', () => {
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(4); // logo + 3 nav links
  });

  it('should_have_semantic_header_element', () => {
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
