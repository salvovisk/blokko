import { test, expect } from '@playwright/test';
import { useEnglish, openNewQuote, canvasBlocks } from './helpers';

test.beforeEach(async ({ page }) => useEnglish(page));

test('menu button opens navigation', async ({ page }) => {
  await page.goto('/quotes');
  await page.getByRole('button', { name: /open navigation menu/i }).click();
  await page.getByRole('navigation', { name: /main navigation/i }).getByText('TEMPLATES').click();
  await expect(page).toHaveURL(/\/templates/);
});

test('blocks are added from the bottom sheet', async ({ page }) => {
  await openNewQuote(page);
  await page.getByRole('button', { name: 'BLOCK LIBRARY' }).click();
  await page.getByRole('button', { name: /^Prices:/ }).click();
  await expect(canvasBlocks(page)).toHaveCount(1);
  // Sheet closes after adding
  await expect(page.getByRole('button', { name: /^Prices:/ })).not.toBeInViewport();
});

test('page never scrolls sideways', async ({ page }) => {
  for (const path of ['/quotes', '/templates', '/settings', '/builder']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(1);
  }
});
