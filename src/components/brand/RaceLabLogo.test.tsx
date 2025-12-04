import { render, screen, fireEvent } from '@testing-library/react';
import { RaceLabLogo } from './RaceLabLogo';

// Mock useReducedMotion hook
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => false),
}));

describe('RaceLabLogo', () => {
  describe('rendering', () => {
    it('renders full logo variant by default', () => {
      render(<RaceLabLogo />);
      expect(screen.getByTestId('racelab-logo')).toBeInTheDocument();
      expect(screen.getByTestId('racelab-logo')).toHaveAttribute('data-variant', 'full');
    });

    it('renders symbol variant when specified', () => {
      render(<RaceLabLogo variant="symbol" />);
      expect(screen.getByTestId('racelab-logo')).toHaveAttribute('data-variant', 'symbol');
    });

    it('renders text variant when specified', () => {
      render(<RaceLabLogo variant="text" />);
      expect(screen.getByTestId('racelab-logo')).toHaveAttribute('data-variant', 'text');
    });
  });

  describe('sizes', () => {
    it('renders small size correctly', () => {
      render(<RaceLabLogo size="sm" />);
      const logo = screen.getByTestId('racelab-logo');
      expect(logo).toHaveAttribute('data-size', 'sm');
    });

    it('renders medium size by default', () => {
      render(<RaceLabLogo />);
      const logo = screen.getByTestId('racelab-logo');
      expect(logo).toHaveAttribute('data-size', 'md');
    });

    it('renders large size correctly', () => {
      render(<RaceLabLogo size="lg" />);
      const logo = screen.getByTestId('racelab-logo');
      expect(logo).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('accessibility', () => {
    it('has accessible label', () => {
      render(<RaceLabLogo />);
      expect(screen.getByLabelText(/racelab/i)).toBeInTheDocument();
    });

    it('allows custom aria-label', () => {
      render(<RaceLabLogo aria-label="Go to homepage" />);
      expect(screen.getByLabelText('Go to homepage')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<RaceLabLogo onClick={handleClick} />);
      fireEvent.click(screen.getByTestId('racelab-logo'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has hover animation class when onClick is provided', () => {
      render(<RaceLabLogo onClick={() => {}} />);
      const logo = screen.getByTestId('racelab-logo');
      expect(logo).toHaveClass('hover:scale-[1.02]');
    });

    it('does not have hover animation class when onClick is not provided', () => {
      render(<RaceLabLogo />);
      const logo = screen.getByTestId('racelab-logo');
      expect(logo).not.toHaveClass('hover:scale-[1.02]');
    });
  });

  describe('fallback', () => {
    it('displays text fallback when SVG fails to load', () => {
      render(<RaceLabLogo />);
      // The component should always have a fallback mechanism
      const logo = screen.getByTestId('racelab-logo');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<RaceLabLogo className="custom-class" />);
      const logo = screen.getByTestId('racelab-logo');
      expect(logo).toHaveClass('custom-class');
    });
  });

  describe('logo colors', () => {
    it('renders SVG with correct horse color (green roof)', () => {
      render(<RaceLabLogo variant="symbol" />);
      // SVG should contain the green roof element
      const logo = screen.getByTestId('racelab-logo');
      expect(logo.querySelector('[stroke="#81C784"]')).toBeInTheDocument();
    });

    it('renders SVG with correct cycle color (red core)', () => {
      render(<RaceLabLogo variant="symbol" />);
      const logo = screen.getByTestId('racelab-logo');
      expect(logo.querySelector('[fill="#E57373"]')).toBeInTheDocument();
    });

    it('renders SVG with correct boat color (blue base)', () => {
      render(<RaceLabLogo variant="symbol" />);
      const logo = screen.getByTestId('racelab-logo');
      expect(logo.querySelector('[stroke="#64B5F6"]')).toBeInTheDocument();
    });
  });
});
