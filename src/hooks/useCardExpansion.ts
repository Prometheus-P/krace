// src/hooks/useCardExpansion.ts
'use client';

import { useState, useCallback, useMemo } from 'react';

export interface UseCardExpansionOptions {
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export interface UseCardExpansionReturn {
  isExpanded: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  animationProps: {
    duration: number;
    easing: string;
  };
  ariaProps: {
    'aria-expanded': boolean;
  };
}

export function useCardExpansion(
  options: UseCardExpansionOptions = {}
): UseCardExpansionReturn {
  const { defaultExpanded = false, expanded, onExpandedChange } = options;

  const isControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isExpanded = isControlled ? expanded : internalExpanded;

  const setExpanded = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalExpanded(value);
      }
      onExpandedChange?.(value);
    },
    [isControlled, onExpandedChange]
  );

  const toggle = useCallback(() => {
    setExpanded(!isExpanded);
  }, [isExpanded, setExpanded]);

  const expand = useCallback(() => {
    setExpanded(true);
  }, [setExpanded]);

  const collapse = useCallback(() => {
    setExpanded(false);
  }, [setExpanded]);

  const animationProps = useMemo(
    () => ({
      duration: 300,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    }),
    []
  );

  const ariaProps = useMemo(
    () => ({
      'aria-expanded': isExpanded,
    }),
    [isExpanded]
  );

  return {
    isExpanded,
    toggle,
    expand,
    collapse,
    animationProps,
    ariaProps,
  };
}
