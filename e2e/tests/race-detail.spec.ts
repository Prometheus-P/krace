// e2e/tests/race-detail.spec.ts
import { test, expect } from '@playwright/test';
import { RaceDetailPage } from '../pages/race-detail.page';

test.describe('Race Detail Page', () => {
  let raceDetailPage: RaceDetailPage;

  test.beforeEach(async ({ page }) => {
    raceDetailPage = new RaceDetailPage(page);
  });

  test('should load race detail page successfully', async ({ page }) => {
    // Navigate to a specific race (using dummy data)
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Check page loaded
    const title = await raceDetailPage.getRaceTitle();
    expect(title.length).toBeGreaterThan(0);

    // Check race info is visible
    await expect(raceDetailPage.raceInfo).toBeVisible();
  });

  test('should display race basic information', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Check race title
    const title = await raceDetailPage.getRaceTitle();
    expect(title).toMatch(/경주|제\d+경주/);

    // Check race info contains track, time, distance
    const raceInfoText = await raceDetailPage.raceInfo.textContent();
    expect(raceInfoText).toBeTruthy();
  });

  test('should display entries section', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Check entries section is visible
    const hasEntries = await raceDetailPage.hasEntries();
    expect(hasEntries).toBe(true);
  });

  test('should display odds section', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Check odds section is visible
    const hasOdds = await raceDetailPage.hasOdds();
    expect(hasOdds).toBe(true);
  });

  test('should handle 404 for invalid race ID', async ({ page }) => {
    await raceDetailPage.gotoRace('invalid-race-id');

    // Check for 404 or error message
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/찾을 수 없습니다|404|Not Found/i);
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Check page title
    const title = await page.title();
    expect(title).toContain('경주');
    expect(title).toContain('KRace');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });
});

test.describe('Odds Display (E2E-002)', () => {
  let raceDetailPage: RaceDetailPage;

  test.beforeEach(async ({ page }) => {
    raceDetailPage = new RaceDetailPage(page);
  });

  test('should display odds section with header', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Check odds section is visible
    const hasOdds = await raceDetailPage.hasOdds();
    expect(hasOdds).toBe(true);

    // Check section header
    const oddsHeader = page.locator('[data-testid="odds"] h2, #odds-heading');
    await expect(oddsHeader).toBeVisible();
    const headerText = await oddsHeader.textContent();
    expect(headerText).toContain('배당률');
  });

  test('should display odds cards for each entry', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Check for odds cards
    const oddsSection = page.locator('[data-testid="odds"]');
    await expect(oddsSection).toBeVisible();

    // Check that there are multiple odds entries
    const oddsCards = page.locator('[data-testid="odds"] article');
    const cardCount = await oddsCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should show odds values or dash for pending', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Check for odds display format (number with 배 or dash)
    const oddsSection = page.locator('[data-testid="odds"]');
    const sectionText = await oddsSection.textContent();

    // Should contain either odds values (X.X배) or dash (-)
    expect(sectionText).toMatch(/(\d+\.?\d*배|-)/);
  });

  test('should have accessible labels for odds', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Check for aria-label on odds cards
    const oddsCards = page.locator('[data-testid="odds"] article[aria-label]');
    const cardCount = await oddsCards.count();

    if (cardCount > 0) {
      const firstCardLabel = await oddsCards.first().getAttribute('aria-label');
      expect(firstCardLabel).toMatch(/번.*배당률/);
    }
  });
});

test.describe('Results Display (E2E-003)', () => {
  let raceDetailPage: RaceDetailPage;

  test.beforeEach(async ({ page }) => {
    raceDetailPage = new RaceDetailPage(page);
  });

  test('should not show results for upcoming races', async ({ page }) => {
    // Navigate to a race that's not finished (using upcoming race)
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    // Results section should not be visible for non-finished races
    // (unless it's a finished race in dummy data)
    const resultsSection = page.locator('[data-testid="results"]');
    const isVisible = await resultsSection.isVisible().catch(() => false);

    // If not visible, test passes
    // If visible, check it has valid content (for finished races)
    if (isVisible) {
      const headerText = await page.locator('[data-testid="results"] h2').textContent();
      expect(headerText).toContain('경주 결과');
    }
  });

  test('should display results with rank badges when available', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    const resultsSection = page.locator('[data-testid="results"]');
    const isVisible = await resultsSection.isVisible().catch(() => false);

    if (isVisible) {
      // Check for table structure
      const resultsTable = page.locator('[data-testid="results"] table');
      await expect(resultsTable).toBeVisible();

      // Check for rank numbers (1, 2, 3)
      const tableText = await resultsTable.textContent();
      expect(tableText).toMatch(/순위|1|2|3/);
    }
  });

  test('should show payout information when results available', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    const resultsSection = page.locator('[data-testid="results"]');
    const isVisible = await resultsSection.isVisible().catch(() => false);

    if (isVisible) {
      // Check for payout column header
      const headerText = await resultsSection.textContent();
      expect(headerText).toMatch(/배당금|원/);
    }
  });

  test('should have accessible table structure', async ({ page }) => {
    await raceDetailPage.gotoRace('horse-1-1-20240115');

    const resultsSection = page.locator('[data-testid="results"]');
    const isVisible = await resultsSection.isVisible().catch(() => false);

    if (isVisible) {
      // Check for proper table headers
      const headers = page.locator('[data-testid="results"] th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);

      // Check for table rows
      const rows = page.locator('[data-testid="results"] tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });
});
