'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';

export type LogoVariant = 'full' | 'symbol' | 'text';
export type LogoSize = 'sm' | 'md' | 'lg';

export interface RaceLabLogoProps {
  /** Logo display variant */
  variant?: LogoVariant;
  /** Logo size */
  size?: LogoSize;
  /** Click handler - enables hover animation when provided */
  onClick?: () => void;
  /** Accessible label */
  'aria-label'?: string;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for automated testing */
  'data-testid'?: string;
}

const SIZE_MAP: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 72, height: 72 },
};

/**
 * RaceLab Logo Component
 *
 * Displays the RaceLab balanced gate logo with three colors:
 * - Green roof (#81C784) - Horse racing
 * - Red core (#E57373) - Cycle racing
 * - Blue base (#64B5F6) - Boat racing
 *
 * @example
 * // Full logo with text
 * <RaceLabLogo />
 *
 * // Symbol only for favicon/small spaces
 * <RaceLabLogo variant="symbol" size="sm" />
 *
 * // Clickable logo linking to home
 * <RaceLabLogo onClick={() => router.push('/')} />
 */
export function RaceLabLogo({
  variant = 'full',
  size = 'md',
  onClick,
  'aria-label': ariaLabel = 'RaceLab - 경마/경륜/경정 통합 정보',
  className = '',
  'data-testid': testId = 'racelab-logo',
}: RaceLabLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const { width, height } = SIZE_MAP[size];

  const isInteractive = !!onClick;
  const hoverClass = isInteractive && !prefersReducedMotion ? 'hover:scale-[1.02]' : '';
  const transitionClass = !prefersReducedMotion
    ? 'transition-transform duration-500 ease-in-out'
    : '';
  const cursorClass = isInteractive ? 'cursor-pointer' : '';

  // Inline SVG for the symbol (allows color queries in tests)
  const LogoSymbol = () => (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      role="img"
    >
      {/* Roof (Horse - Green) */}
      <path
        d="M60 130 C 60 130, 140 150, 200 150 C 260 150, 340 130, 340 130"
        stroke="#81C784"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />

      {/* Core (Cycle - Red) */}
      <rect x="120" y="190" width="160" height="20" rx="10" fill="#E57373" />

      {/* Base (Boat - Blue) */}
      <path
        d="M100 240 L 100 320 M 300 240 L 300 320"
        stroke="#64B5F6"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M100 240 C 100 240, 140 270, 200 270 C 260 270, 300 240, 300 240"
        stroke="#64B5F6"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />

      {/* Data Nodes */}
      <circle cx="200" cy="150" r="6" fill="#81C784" />
      <circle cx="200" cy="200" r="6" fill="#E57373" />
      <circle cx="200" cy="270" r="6" fill="#64B5F6" />
    </svg>
  );

  // Text logo (for text-only variant)
  const LogoText = () => (
    <span
      className="font-bold tracking-widest"
      style={{
        fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : '24px',
      }}
    >
      <span className="text-zinc-800">RACE</span>
      <span className="text-zinc-500">LAB</span>
    </span>
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  const baseClassName =
    `inline-flex items-center gap-2 ${hoverClass} ${transitionClass} ${cursorClass} ${className}`.trim();

  const Element = isInteractive ? 'button' : 'div';

  return (
    <Element
      className={baseClassName}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      aria-label={ariaLabel}
      data-testid={testId}
      data-variant={variant}
      data-size={size}
      type={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {/* Symbol */}
      {(variant === 'full' || variant === 'symbol') && <LogoSymbol />}

      {/* Text */}
      {(variant === 'full' || variant === 'text') && <LogoText />}

      {/* Fallback for screen readers when image fails */}
      <span className="sr-only">RACELAB</span>
    </Element>
  );
}

export default RaceLabLogo;
