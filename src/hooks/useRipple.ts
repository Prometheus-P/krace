'use client';

import { useState, useCallback, useRef, ReactNode, MouseEvent, KeyboardEvent, createElement } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface RippleConfig {
  /** Ripple color (CSS color value) */
  color?: string;
  /** Ripple duration in ms */
  duration?: number;
  /** Disable ripple effect */
  disabled?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface UseRippleReturn {
  /** Props to spread on the target element */
  rippleProps: {
    onMouseDown: (e: MouseEvent<HTMLElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  };
  /** Ripple elements to render inside the target */
  ripples: ReactNode;
}

/**
 * Hook to add M3 ripple effect to interactive elements
 *
 * @param config - Ripple configuration options
 * @returns Object with rippleProps to spread and ripples to render
 *
 * @example
 * const { rippleProps, ripples } = useRipple({ color: 'rgba(255,255,255,0.3)' });
 * return (
 *   <button {...rippleProps} className="relative overflow-hidden">
 *     Click me
 *     {ripples}
 *   </button>
 * );
 */
export function useRipple(config: RippleConfig = {}): UseRippleReturn {
  const { color = 'rgba(0, 0, 0, 0.2)', duration = 300, disabled = false } = config;

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  const createRipple = useCallback(
    (x: number, y: number, rect: DOMRect) => {
      if (disabled || prefersReducedMotion) return;

      // Calculate ripple size (should cover the entire element)
      const size = Math.max(rect.width, rect.height) * 2;

      // Position relative to element
      const rippleX = x - rect.left - size / 2;
      const rippleY = y - rect.top - size / 2;

      const newRipple: Ripple = {
        id: nextId.current++,
        x: rippleX,
        y: rippleY,
        size,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, duration);
    },
    [disabled, prefersReducedMotion, duration]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      createRipple(e.clientX, e.clientY, rect);
    },
    [createRipple]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      // Trigger ripple on Enter or Space
      if (e.key === 'Enter' || e.key === ' ') {
        const rect = e.currentTarget.getBoundingClientRect();
        // Center the ripple for keyboard activation
        createRipple(rect.left + rect.width / 2, rect.top + rect.height / 2, rect);
      }
    },
    [createRipple]
  );

  // Create ripple elements
  const rippleElements: ReactNode =
    ripples.length > 0
      ? createElement(
          'span',
          {
            className: 'pointer-events-none absolute inset-0 overflow-hidden',
            'aria-hidden': 'true',
          },
          ripples.map((ripple) =>
            createElement('span', {
              key: ripple.id,
              className: 'absolute rounded-full animate-ripple',
              style: {
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: color,
                animation: `ripple ${duration}ms ease-out forwards`,
              },
            })
          )
        )
      : null;

  return {
    rippleProps: {
      onMouseDown: handleMouseDown,
      onKeyDown: handleKeyDown,
    },
    ripples: rippleElements,
  };
}

export default useRipple;
