// src/hooks/useCardExpansion.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCardExpansion } from './useCardExpansion';

describe('useCardExpansion', () => {
  it('returns initial expanded state as false', () => {
    const { result } = renderHook(() => useCardExpansion());
    expect(result.current.isExpanded).toBe(false);
  });

  it('returns initial expanded state based on defaultExpanded prop', () => {
    const { result } = renderHook(() => useCardExpansion({ defaultExpanded: true }));
    expect(result.current.isExpanded).toBe(true);
  });

  it('toggles expanded state when toggle is called', () => {
    const { result } = renderHook(() => useCardExpansion());

    expect(result.current.isExpanded).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isExpanded).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isExpanded).toBe(false);
  });

  it('expands when expand is called', () => {
    const { result } = renderHook(() => useCardExpansion());

    act(() => {
      result.current.expand();
    });

    expect(result.current.isExpanded).toBe(true);
  });

  it('collapses when collapse is called', () => {
    const { result } = renderHook(() => useCardExpansion({ defaultExpanded: true }));

    act(() => {
      result.current.collapse();
    });

    expect(result.current.isExpanded).toBe(false);
  });

  it('calls onExpandedChange callback when state changes', () => {
    const onExpandedChange = jest.fn();
    const { result } = renderHook(() => useCardExpansion({ onExpandedChange }));

    act(() => {
      result.current.toggle();
    });

    expect(onExpandedChange).toHaveBeenCalledWith(true);

    act(() => {
      result.current.toggle();
    });

    expect(onExpandedChange).toHaveBeenCalledWith(false);
  });

  it('provides animation props for accordion behavior', () => {
    const { result } = renderHook(() => useCardExpansion());

    expect(result.current.animationProps).toEqual({
      duration: 300,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    });
  });

  it('returns aria attributes for accessibility', () => {
    const { result } = renderHook(() => useCardExpansion());

    expect(result.current.ariaProps).toHaveProperty('aria-expanded', false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.ariaProps).toHaveProperty('aria-expanded', true);
  });

  it('supports controlled mode with expanded prop', () => {
    const { result, rerender } = renderHook(({ expanded }) => useCardExpansion({ expanded }), {
      initialProps: { expanded: false },
    });

    expect(result.current.isExpanded).toBe(false);

    rerender({ expanded: true });

    expect(result.current.isExpanded).toBe(true);
  });
});
