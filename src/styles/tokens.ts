// src/styles/tokens.ts
// Material Design 3 (M3) Design Tokens for KRace
// Reference: https://m3.material.io/styles

/**
 * M3 Color Tokens
 * Using neutral palette as primary brand with semantic race colors as accents
 */
export const colors = {
  // M3 Neutral Palette (Primary Brand)
  primary: {
    DEFAULT: '#1d4ed8',
    onPrimary: '#ffffff',
    container: '#dbeafe',
    onContainer: '#1e3a8a',
  },

  // M3 Surface Colors
  surface: {
    DEFAULT: '#ffffff',
    dim: '#f8fafc',
    bright: '#ffffff',
    containerLowest: '#ffffff',
    containerLow: '#f8fafc',
    container: '#f1f5f9',
    containerHigh: '#e2e8f0',
    containerHighest: '#cbd5e1',
  },

  // M3 On-Surface Colors
  onSurface: {
    DEFAULT: '#1e293b',
    variant: '#475569',
  },

  // M3 Outline Colors
  outline: {
    DEFAULT: '#94a3b8',
    variant: '#cbd5e1',
  },

  // Semantic Race Colors (Accent)
  race: {
    horse: {
      DEFAULT: '#2d5a27',
      container: '#dcfce7',
      onContainer: '#166534',
    },
    cycle: {
      DEFAULT: '#dc2626',
      container: '#fee2e2',
      onContainer: '#b91c1c',
    },
    boat: {
      DEFAULT: '#0369a1',
      container: '#e0f2fe',
      onContainer: '#075985',
    },
  },

  // M3 Error Colors
  error: {
    DEFAULT: '#dc2626',
    container: '#fee2e2',
    onContainer: '#991b1b',
  },
} as const;

/**
 * M3 Elevation Tokens
 * Elevation levels for shadows (in dp)
 */
export const elevation = {
  level0: 'none',
  level1: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  level2: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  level3: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  level4: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  level5: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

/**
 * M3 Spacing Tokens
 * Consistent spacing scale
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

/**
 * M3 Border Radius Tokens
 */
export const borderRadius = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '28px',
  full: '9999px',
} as const;

/**
 * M3 Typography Scale
 * Using Pretendard font family
 */
export const typography = {
  fontFamily: {
    sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
  },
  fontSize: {
    // Display
    'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '400' }],
    'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px', fontWeight: '400' }],
    'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px', fontWeight: '400' }],
    // Headline
    'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0px', fontWeight: '400' }],
    'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0px', fontWeight: '400' }],
    'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '400' }],
    // Title
    'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '500' }],
    'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
    'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
    // Body
    'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px', fontWeight: '400' }],
    'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px', fontWeight: '400' }],
    'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px', fontWeight: '400' }],
    // Label
    'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
    'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
    'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
  },
} as const;

/**
 * M3 Motion Tokens
 */
export const motion = {
  duration: {
    short1: '50ms',
    short2: '100ms',
    short3: '150ms',
    short4: '200ms',
    medium1: '250ms',
    medium2: '300ms',
    medium3: '350ms',
    medium4: '400ms',
    long1: '450ms',
    long2: '500ms',
    long3: '550ms',
    long4: '600ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  },
} as const;

/**
 * Touch target minimum size (accessibility)
 */
export const touchTarget = {
  min: '48px',
} as const;
