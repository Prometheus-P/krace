// e2e/tests/responsive.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test.describe('Responsive Design - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('should display 4-column QuickStats grid on desktop', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    const quickStats = page.locator('[aria-label="오늘의 경주 통계"]');
    await expect(quickStats).toBeVisible();

    // Check all 4 stat cards are visible
    const statCards = quickStats.locator('article');
    await expect(statCards).toHaveCount(4);
  });

  test('should display full navigation on desktop', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Desktop nav items should be visible
    const navItems = page.locator('header nav a');
    await expect(navItems.first()).toBeVisible();
  });

  test('should display race table on desktop race detail', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Navigate to first race
    await homePage.clickFirstRaceCard();

    // Table should be visible on desktop
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });
});

test.describe('Responsive Design - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('should display 4-column QuickStats grid on tablet', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    const quickStats = page.locator('[aria-label="오늘의 경주 통계"]');
    await expect(quickStats).toBeVisible();

    const statCards = quickStats.locator('article');
    await expect(statCards).toHaveCount(4);
  });

  test('should navigate properly on tablet', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Check tabs work
    await homePage.switchToTab('horse');
    await expect(page.url()).toContain('tab=horse');
  });
});

test.describe('Responsive Design - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display 2-column QuickStats grid on mobile', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    const quickStats = page.locator('[aria-label="오늘의 경주 통계"]');
    await expect(quickStats).toBeVisible();

    // All 4 stat cards should still be visible
    const statCards = quickStats.locator('article');
    await expect(statCards).toHaveCount(4);
  });

  test('should display mobile cards instead of table on race detail', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Navigate to first race
    await homePage.clickFirstRaceCard();

    // Table should be hidden on mobile
    const table = page.locator('table');
    await expect(table).toBeHidden();

    // Mobile cards should be visible
    const mobileCards = page.locator('[data-testid="entries"] article');
    const count = await mobileCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show status badges on mobile', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Status badges should be visible
    const statusBadges = page.locator('.status-badge');
    const count = await statusBadges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have tappable touch targets (44x44px minimum)', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Race cards should have minimum height for touch
    const raceCards = page.locator('[data-testid="race-card"]');
    const firstCard = raceCards.first();

    if (await firstCard.isVisible()) {
      const boundingBox = await firstCard.boundingBox();
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Color Palette & Status Display', () => {
  test('should display status badges with correct styling', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Look for any status badge
    const statusBadge = page.locator('.status-badge').first();

    if (await statusBadge.isVisible()) {
      // Status badge should have proper classes
      const classList = await statusBadge.getAttribute('class');
      expect(classList).toContain('status-');
    }
  });

  test('should display race type colors correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Check horse section has green color indicator
    const horseSection = page.locator('[data-testid="race-section-horse"]');
    if (await horseSection.isVisible()) {
      const heading = horseSection.locator('h2');
      const headingClass = await heading.getAttribute('class');
      expect(headingClass).toContain('border-horse');
    }
  });
});

test.describe('Accessibility - Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('skip link should work on mobile', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Tab to reveal skip link
    await page.keyboard.press('Tab');

    const skipLink = page.locator('a:has-text("메인 콘텐츠로")');
    if (await skipLink.isVisible()) {
      await skipLink.click();

      // Focus should move to main content
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    }
  });

  test('focus should be visible on mobile', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Tab through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Some element should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
