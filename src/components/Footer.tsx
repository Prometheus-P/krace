// src/components/Footer.tsx
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-label="사이트 푸터"
      className="bg-surface-dim border-t border-neutral-divider mt-12"
    >
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-title-small text-on-surface mb-4">RaceLab</h3>
            <p className="text-body-small text-on-surface-variant leading-relaxed">
              경마, 경륜, 경정 정보를 한 곳에서 확인하세요.
              공공데이터포털의 공식 API를 활용하여 신뢰할 수 있는 정보를 제공합니다.
            </p>
          </div>

          {/* Data Sources - E-E-A-T 신뢰성 강화 */}
          <div>
            <h3 className="font-bold text-title-small text-on-surface mb-4">데이터 출처</h3>
            <ul className="space-y-3 text-body-small text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-horse mt-0.5">✓</span>
                <span>
                  <a
                    href="https://www.data.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-boat transition-colors duration-rl-fast underline focus:outline-none focus:ring-2 focus:ring-boat focus:ring-offset-2 rounded"
                  >
                    공공데이터포털
                  </a>
                  {' '}(data.go.kr)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-horse mt-0.5">✓</span>
                <span>한국마사회 (KRA) 공식 데이터</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-horse mt-0.5">✓</span>
                <span>국민체육진흥공단 (KSPO) 공식 데이터</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <nav aria-label="푸터 네비게이션">
            <h3 className="font-bold text-title-small text-on-surface mb-4">빠른 링크</h3>
            <ul className="space-y-3 text-body-small">
              <li>
                <Link
                  href="/?tab=horse"
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-horse transition-colors duration-rl-fast focus:outline-none focus:ring-2 focus:ring-horse focus:ring-offset-2 rounded px-1 -ml-1"
                >
                  <span aria-hidden="true">🐎</span> 경마 일정
                </Link>
              </li>
              <li>
                <Link
                  href="/?tab=cycle"
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-cycle transition-colors duration-rl-fast focus:outline-none focus:ring-2 focus:ring-cycle focus:ring-offset-2 rounded px-1 -ml-1"
                >
                  <span aria-hidden="true">🚴</span> 경륜 일정
                </Link>
              </li>
              <li>
                <Link
                  href="/?tab=boat"
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-boat transition-colors duration-rl-fast focus:outline-none focus:ring-2 focus:ring-boat focus:ring-offset-2 rounded px-1 -ml-1"
                >
                  <span aria-hidden="true">🚤</span> 경정 일정
                </Link>
              </li>
              <li>
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-boat transition-colors duration-rl-fast focus:outline-none focus:ring-2 focus:ring-boat focus:ring-offset-2 rounded px-1 -ml-1"
                >
                  <span aria-hidden="true">📊</span> 경주 결과
                </Link>
              </li>
            </ul>
          </nav>

          {/* Info */}
          <div>
            <h3 className="font-bold text-title-small text-on-surface mb-4">안내</h3>
            <ul className="space-y-3 text-body-small text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-outline mt-0.5">•</span>
                본 서비스는 정보 제공 목적입니다
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-outline mt-0.5">•</span>
                베팅 결과를 보장하지 않습니다
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-status-warning mt-0.5">⚠</span>
                <span>
                  도박 문제 상담:{' '}
                  <a
                    href="tel:1336"
                    className="font-bold text-cycle hover:underline focus:outline-none focus:ring-2 focus:ring-cycle focus:ring-offset-2 rounded"
                  >
                    1336
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-divider mt-10 pt-8 text-center text-body-small text-on-surface-variant">
          <p>© {currentYear} RaceLab. 공공데이터포털 API 활용.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
