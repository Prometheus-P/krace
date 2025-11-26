// src/components/Footer.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  describe('Sections', () => {
    it('should_render_about_section_with_description', () => {
      expect(screen.getByText('KRace')).toBeInTheDocument();
      expect(screen.getByText(/경마, 경륜, 경정 정보를 한 곳에서 확인하세요/i)).toBeInTheDocument();
    });

    it('should_render_quick_links_section', () => {
      expect(screen.getByText('빠른 링크')).toBeInTheDocument();

      const horseLink = screen.getByRole('link', { name: /경마 일정/i });
      expect(horseLink).toHaveAttribute('href', '/?tab=horse');

      const cycleLink = screen.getByRole('link', { name: /경륜 일정/i });
      expect(cycleLink).toHaveAttribute('href', '/?tab=cycle');

      const boatLink = screen.getByRole('link', { name: /경정 일정/i });
      expect(boatLink).toHaveAttribute('href', '/?tab=boat');
    });

    it('should_render_info_section_with_disclaimers', () => {
      expect(screen.getByText('안내')).toBeInTheDocument();
      expect(screen.getByText(/본 서비스는 정보 제공 목적입니다/i)).toBeInTheDocument();
      expect(screen.getByText(/베팅 결과를 보장하지 않습니다/i)).toBeInTheDocument();
    });
  });

  describe('Legal & Contact', () => {
    it('should_display_gambling_helpline', () => {
      expect(screen.getByText(/도박 문제 상담:/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '1336' })).toHaveAttribute('href', 'tel:1336');
    });

    it('should_display_copyright_and_data_source', () => {
      expect(screen.getByText(/© 2025 KRace. 공공데이터포털 API 활용./i)).toBeInTheDocument();
    });
  });

  it('should_have_semantic_footer_element', () => {
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should_render_all_navigation_links', () => {
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4); // 3 nav links + 1 helpline link
  });
});
