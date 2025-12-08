// src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { RaceLabLogo } from './brand';

interface NavItem {
  href: string;
  tab: string;
  label: string;
  icon: string;
  color: string;
  hoverColor: string;
  activeColor: string;
  activeBackground: string;
  focusRing: string;
}

const navItems: NavItem[] = [
  {
    href: '/?tab=horse',
    tab: 'horse',
    label: '경마',
    icon: '🐎',
    color: 'text-on-surface',
    hoverColor: 'hover:text-horse',
    activeColor: 'text-horse-on-container',
    activeBackground: 'bg-horse-container',
    focusRing: 'focus:ring-horse',
  },
  {
    href: '/?tab=cycle',
    tab: 'cycle',
    label: '경륜',
    icon: '🚴',
    color: 'text-on-surface',
    hoverColor: 'hover:text-cycle',
    activeColor: 'text-cycle-on-container',
    activeBackground: 'bg-cycle-container',
    focusRing: 'focus:ring-cycle',
  },
  {
    href: '/?tab=boat',
    tab: 'boat',
    label: '경정',
    icon: '🚤',
    color: 'text-on-surface',
    hoverColor: 'hover:text-boat',
    activeColor: 'text-boat-on-container',
    activeBackground: 'bg-boat-container',
    focusRing: 'focus:ring-boat',
  },
];

const Header: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = searchParams.get('tab');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (tab: string) => currentTab === tab;
  const isResultsPage = pathname === '/results';

  return (
    <header className="bg-white shadow-rl-1 border-b border-neutral-divider">
      {/* Skip to main content link - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cycle focus:text-white focus:rounded-rl-md focus:outline-none"
      >
        본문으로 건너뛰기
      </a>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <RaceLabLogo
            variant="full"
            size="md"
            onClick={() => router.push('/')}
            aria-label="RaceLab 홈으로 이동"
            className="focus:outline-none focus:ring-2 focus:ring-cycle focus:ring-offset-2 rounded-rl-sm"
          />

          {/* Desktop Navigation */}
          <nav aria-label="주요 네비게이션" className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.tab}
                href={item.href}
                aria-current={isActive(item.tab) ? 'page' : undefined}
                title={`${item.label} 경기 보기`}
                className={`
                  relative min-h-touch min-w-touch px-5 py-3
                  font-semibold text-body-medium rounded-rl-md
                  transition-all duration-rl-fast ease-rl-standard
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isActive(item.tab)
                    ? `${item.activeColor} ${item.activeBackground} ${item.focusRing}`
                    : `${item.color} ${item.hoverColor} hover:bg-surface-dim focus:ring-outline`
                  }
                `}
              >
                <span aria-hidden="true">{item.icon}</span>{' '}
                <span>{item.label}</span>
                {/* Active indicator */}
                {isActive(item.tab) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-current rounded-full" />
                )}
              </Link>
            ))}
            {/* Results link */}
            <Link
              href="/results"
              aria-current={isResultsPage ? 'page' : undefined}
              title="경기 결과 보기"
              className={`
                relative min-h-touch min-w-touch px-5 py-3
                font-semibold text-body-medium rounded-rl-md
                transition-all duration-rl-fast ease-rl-standard
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isResultsPage
                  ? 'text-boat-on-container bg-boat-container focus:ring-boat'
                  : 'text-on-surface hover:text-boat hover:bg-surface-dim focus:ring-outline'
                }
              `}
            >
              <span aria-hidden="true">📊</span>{' '}
              <span>결과</span>
              {isResultsPage && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-current rounded-full" />
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden min-h-touch min-w-touch p-3 rounded-rl-md text-on-surface hover:bg-surface-dim focus:outline-none focus:ring-2 focus:ring-cycle focus:ring-offset-2 transition-colors duration-rl-fast"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav
            id="mobile-menu"
            aria-label="모바일 네비게이션"
            className="md:hidden mt-4 pt-4 border-t border-neutral-divider"
          >
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.tab}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.tab) ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center min-h-touch px-5 py-4
                      font-semibold text-body-medium rounded-rl-md
                      transition-all duration-rl-fast ease-rl-standard
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${isActive(item.tab)
                        ? `${item.activeColor} ${item.activeBackground} ${item.focusRing}`
                        : `${item.color} ${item.hoverColor} hover:bg-surface-dim focus:ring-outline`
                      }
                    `}
                  >
                    <span aria-hidden="true" className="mr-3 text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                    {isActive(item.tab) && (
                      <span className="ml-auto text-label-small">현재 페이지</span>
                    )}
                  </Link>
                </li>
              ))}
              {/* Results link in mobile menu */}
              <li>
                <Link
                  href="/results"
                  aria-current={isResultsPage ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center min-h-touch px-5 py-4
                    font-semibold text-body-medium rounded-rl-md
                    transition-all duration-rl-fast ease-rl-standard
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isResultsPage
                      ? 'text-boat-on-container bg-boat-container focus:ring-boat'
                      : 'text-on-surface hover:text-boat hover:bg-surface-dim focus:ring-outline'
                    }
                  `}
                >
                  <span aria-hidden="true" className="mr-3 text-xl">📊</span>
                  <span>결과</span>
                  {isResultsPage && (
                    <span className="ml-auto text-label-small">현재 페이지</span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
