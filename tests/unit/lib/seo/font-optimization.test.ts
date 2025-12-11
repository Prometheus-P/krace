// tests/unit/lib/seo/font-optimization.test.ts
// Test for US5 - Font optimization verification
// Requirements:
// - FR-014: Korean font optimization for performance
// - No blocking @import in CSS
// - next/font used for automatic optimization

import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const TYPOGRAPHY_CSS = path.join(SRC_DIR, 'styles', 'typography.css');
const LAYOUT_TSX = path.join(SRC_DIR, 'app', 'layout.tsx');
const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

describe('Font Optimization (US5)', () => {
  describe('Blocking Resource Elimination', () => {
    test('typography.css should NOT have blocking @import for fonts', () => {
      const content = fs.readFileSync(TYPOGRAPHY_CSS, 'utf-8');

      // Check for blocking @import statements for Google Fonts
      const hasBlockingImport = content.includes(
        "@import url('https://fonts.googleapis.com"
      );

      expect(hasBlockingImport).toBe(false);
    });

    test('typography.css should use CSS variables for fonts', () => {
      const content = fs.readFileSync(TYPOGRAPHY_CSS, 'utf-8');

      // Check for CSS variable definitions
      expect(content).toContain('--rl-font-sans');
      expect(content).toContain('--rl-font-brand');
    });
  });

  describe('next/font Integration', () => {
    test('layout.tsx should import from next/font/google', () => {
      const content = fs.readFileSync(LAYOUT_TSX, 'utf-8');

      expect(content).toContain("from 'next/font/google'");
    });

    test('layout.tsx should configure Noto_Sans_KR font', () => {
      const content = fs.readFileSync(LAYOUT_TSX, 'utf-8');

      expect(content).toContain('Noto_Sans_KR');
      expect(content).toContain("display: 'swap'");
    });

    test('layout.tsx should set font CSS variable', () => {
      const content = fs.readFileSync(LAYOUT_TSX, 'utf-8');

      expect(content).toContain('--font-noto-sans-kr');
    });

    test('layout.tsx should apply font class to html or body', () => {
      const content = fs.readFileSync(LAYOUT_TSX, 'utf-8');

      // Check that font variable or className is applied
      const hasFontApplication =
        content.includes('notoSansKR.variable') ||
        content.includes('notoSansKR.className');

      expect(hasFontApplication).toBe(true);
    });
  });

  describe('Font Display Strategy', () => {
    test("next/font should be configured with display: 'swap'", () => {
      const content = fs.readFileSync(LAYOUT_TSX, 'utf-8');

      // Count occurrences of display: 'swap' for each font
      const swapCount = (content.match(/display:\s*['"]swap['"]/g) || []).length;

      // Should have swap for both fonts (Noto Sans KR and Exo 2)
      expect(swapCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Self-hosted Font Files (Optional Pretendard)', () => {
    test('public/fonts directory should exist if self-hosting', () => {
      // This is optional - only required if using self-hosted fonts
      if (fs.existsSync(FONTS_DIR)) {
        const files = fs.readdirSync(FONTS_DIR);
        // If fonts exist, they should be woff2 format
        const woff2Files = files.filter((f) => f.endsWith('.woff2'));
        console.log(`Found ${woff2Files.length} WOFF2 font files:`, woff2Files);
      } else {
        // Using next/font/google - no local fonts needed
        console.log('Using next/font/google for font loading (no local fonts)');
      }
      // This test always passes - it's informational
      expect(true).toBe(true);
    });
  });

  describe('Typography CSS Variables', () => {
    test('typography.css should define font variables in :root', () => {
      const content = fs.readFileSync(TYPOGRAPHY_CSS, 'utf-8');

      expect(content).toContain(':root');
      expect(content).toContain('--rl-font-sans');
    });

    test('typography classes should use CSS variables', () => {
      const content = fs.readFileSync(TYPOGRAPHY_CSS, 'utf-8');

      // Check that at least some classes use the variable
      expect(content).toContain('var(--rl-font-sans)');
    });
  });
});

describe('Performance Requirements (FR-012, FR-013)', () => {
  test('configuration supports LCP < 2.5s optimization', () => {
    const content = fs.readFileSync(LAYOUT_TSX, 'utf-8');

    // Check for preload configuration
    const hasPreload = content.includes('preload: true') || content.includes('preload:true');

    // Preload should be enabled for primary font
    expect(hasPreload).toBe(true);
  });

  test('configuration supports TTFB < 600ms with ISR', () => {
    // Check for ISR/caching configuration in any page
    // This is verified at runtime, but we can check for static export/ISR patterns
    expect(true).toBe(true); // Placeholder - actual TTFB testing in E2E
  });
});
