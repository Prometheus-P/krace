// src/components/ui/M3Card.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { M3Card } from './M3Card';

describe('M3Card', () => {
  it('renders children content', () => {
    render(<M3Card>Card Content</M3Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default elevation (level 1)', () => {
    render(<M3Card data-testid="card">Content</M3Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-m3-1');
  });

  it('applies specified elevation level', () => {
    render(<M3Card elevation={3} data-testid="card">Content</M3Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-m3-3');
  });

  it('applies elevated variant styles', () => {
    render(<M3Card variant="elevated" data-testid="card">Content</M3Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-surface');
  });

  it('applies filled variant styles', () => {
    render(<M3Card variant="filled" data-testid="card">Content</M3Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-surface-container-highest');
  });

  it('applies outlined variant styles', () => {
    render(<M3Card variant="outlined" data-testid="card">Content</M3Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-outline-variant');
  });

  it('applies M3 border radius', () => {
    render(<M3Card data-testid="card">Content</M3Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-m3-md');
  });

  it('is interactive when onClick is provided', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<M3Card onClick={handleClick} data-testid="card">Clickable</M3Card>);
    const card = screen.getByTestId('card');

    await user.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has proper touch target size (min 48px)', () => {
    render(<M3Card data-testid="card">Content</M3Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('min-h-[48px]');
  });

  it('accepts custom className', () => {
    render(<M3Card className="custom-class" data-testid="card">Content</M3Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('renders as button when interactive', () => {
    render(<M3Card onClick={() => {}} data-testid="card">Clickable</M3Card>);
    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('BUTTON');
  });

  it('renders as div when not interactive', () => {
    render(<M3Card data-testid="card">Static</M3Card>);
    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('DIV');
  });
});
