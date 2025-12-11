/**
 * @jest-environment jsdom
 *
 * Tests for FAQJsonLd component (T027)
 * Verifies that FAQPage JSON-LD schema is generated correctly
 */
import React from 'react';
import { render } from '@testing-library/react';
import FAQJsonLd from '@/components/seo/FAQJsonLd';

// Mock next/script since it doesn't render in test environment
jest.mock('next/script', () => {
  return function MockScript({
    id,
    dangerouslySetInnerHTML,
  }: {
    id: string;
    type: string;
    dangerouslySetInnerHTML: { __html: string };
  }) {
    return (
      <script
        id={id}
        type="application/ld+json"
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      />
    );
  };
});

describe('FAQJsonLd Component', () => {
  const mockFAQItems = [
    {
      question: '경마 배팅은 어떻게 하나요?',
      answer: '경마 배팅은 마권구매소나 온라인에서 할 수 있습니다.',
    },
    {
      question: '경륜과 경정의 차이는 무엇인가요?',
      answer: '경륜은 자전거 경주이고, 경정은 보트 경주입니다.',
    },
  ];

  it('renders without crashing', () => {
    const { container } = render(<FAQJsonLd items={mockFAQItems} />);
    expect(container).toBeDefined();
  });

  it('renders script tag with correct id', () => {
    const { container } = render(<FAQJsonLd items={mockFAQItems} />);
    const script = container.querySelector('#faq-schema');
    expect(script).toBeTruthy();
  });

  it('renders script tag with application/ld+json type', () => {
    const { container } = render(<FAQJsonLd items={mockFAQItems} />);
    const script = container.querySelector('#faq-schema');
    expect(script?.getAttribute('type')).toBe('application/ld+json');
  });

  describe('JSON-LD schema structure', () => {
    it('generates valid FAQPage schema', () => {
      const { container } = render(<FAQJsonLd items={mockFAQItems} />);
      const script = container.querySelector('#faq-schema');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('FAQPage');
    });

    it('includes all FAQ items in mainEntity', () => {
      const { container } = render(<FAQJsonLd items={mockFAQItems} />);
      const script = container.querySelector('#faq-schema');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.mainEntity).toHaveLength(2);
    });

    it('formats questions correctly', () => {
      const { container } = render(<FAQJsonLd items={mockFAQItems} />);
      const script = container.querySelector('#faq-schema');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.mainEntity[0]['@type']).toBe('Question');
      expect(jsonLd.mainEntity[0].name).toBe('경마 배팅은 어떻게 하나요?');
    });

    it('formats answers correctly', () => {
      const { container } = render(<FAQJsonLd items={mockFAQItems} />);
      const script = container.querySelector('#faq-schema');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
      expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe(
        '경마 배팅은 마권구매소나 온라인에서 할 수 있습니다.'
      );
    });
  });

  describe('Edge cases', () => {
    it('handles empty FAQ items array', () => {
      const { container } = render(<FAQJsonLd items={[]} />);
      const script = container.querySelector('#faq-schema');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.mainEntity).toHaveLength(0);
    });

    it('handles single FAQ item', () => {
      const singleItem = [mockFAQItems[0]];
      const { container } = render(<FAQJsonLd items={singleItem} />);
      const script = container.querySelector('#faq-schema');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.mainEntity).toHaveLength(1);
    });

    it('handles Korean characters in questions and answers', () => {
      const koreanFAQ = [
        {
          question: '한글 질문입니다',
          answer: '한글 답변입니다',
        },
      ];
      const { container } = render(<FAQJsonLd items={koreanFAQ} />);
      const script = container.querySelector('#faq-schema');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.mainEntity[0].name).toBe('한글 질문입니다');
      expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe('한글 답변입니다');
    });
  });
});
