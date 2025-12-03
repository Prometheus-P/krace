// src/components/ui/M3Card.tsx
'use client';

import React from 'react';

export type M3CardVariant = 'elevated' | 'filled' | 'outlined';
export type M3ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface M3CardProps {
  children: React.ReactNode;
  variant?: M3CardVariant;
  elevation?: M3ElevationLevel;
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

const elevationClasses: Record<M3ElevationLevel, string> = {
  0: '',
  1: 'shadow-m3-1',
  2: 'shadow-m3-2',
  3: 'shadow-m3-3',
  4: 'shadow-m3-4',
  5: 'shadow-m3-5',
};

const variantClasses: Record<M3CardVariant, string> = {
  elevated: 'bg-surface',
  filled: 'bg-surface-container-highest',
  outlined: 'bg-surface border border-outline-variant',
};

export function M3Card({
  children,
  variant = 'elevated',
  elevation = 1,
  onClick,
  className = '',
  'data-testid': testId,
}: M3CardProps) {
  const isInteractive = !!onClick;

  const baseClasses = [
    'rounded-m3-md',
    'min-h-[48px]',
    'p-4',
    'transition-shadow',
    'duration-m3-medium',
    'ease-m3-standard',
    variantClasses[variant],
    variant === 'elevated' ? elevationClasses[elevation] : '',
    isInteractive ? 'cursor-pointer hover:shadow-m3-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2' : '',
    className,
  ].filter(Boolean).join(' ');

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={baseClasses}
        data-testid={testId}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={baseClasses} data-testid={testId}>
      {children}
    </div>
  );
}
