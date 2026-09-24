import { test, expect, type Page } from '@playwright/test';
import { useEnglish, openNewQuote, addBlock, setTitle, saveQuote, toast } from './helpers';

test.beforeEach(async ({ page }) => useEnglish(page));

async function createQuote(page: Page, title: string) {
  await openNewQuote(page);
  await addBlock(page, 'Header');
  await setTitle(page, title);
  return saveQuote(page);
}

const row = (page: Page, title: string) => page.getByRole('row').filter({ hasText: title });

test('saved quotes are listed and open in the builder', async ({ page }) => {
  const title = `Listed ${Date.now()}`;
  const id = await createQuote(page, title);
  await page.goto('/quotes');
  await expect(row(page, title)).toBeVisible();
  await row(page, title).getByRole('button', { name: /edit/i }).click();
  await expect(page).toHaveURL(new RegExp(`/builder\\?id=${id}`));
  await expect(page.getByRole('textbox', { name: 'UNTITLED QUOTE' })).toHaveValue(title);
});

test('status changes from the list persist', async ({ page }) => {
  const title = `Status ${Date.now()}`;
  await createQuote(page, title);
  await page.goto('/quotes');
  await row(page, title).getByRole('combobox').selectOption('accepted');
  await page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().includes('/api/quotes/'));
  await page.reload();
  await expect(row(page, title).getByRole('combobox')).toHaveValue('accepted');
});

test('delete can be undone', async ({ page }) => {
  const title = `Undo delete ${Date.now()}`;
  await createQuote(page, title);
  await page.goto('/quotes');
  await row(page, title).getByRole('button', { name: /delete/i }).click();
  await expect(row(page, title)).toHaveCount(0);
  await toast(page, `Deleted "${title}"`).getByRole('button', { name: 'UNDO' }).click();
  await expect(row(page, title)).toBeVisible();
  await page.reload();
  await expect(row(page, title)).toBeVisible();
});

test('delete goes through once the undo window passes', async ({ page }) => {
  const title = `Really delete ${Date.now()}`;
  await createQuote(page, title);
  await page.goto('/quotes');
  const deleted = page.waitForResponse((r) => r.request().method() === 'DELETE', { timeout: 15_000 });
  await row(page, title).getByRole('button', { name: /delete/i }).click();
  expect((await deleted).status()).toBe(200);
  await page.reload();
  await expect(row(page, title)).toHaveCount(0);
});

test('delete still happens if the user navigates away during the undo window', async ({ page }) => {
  const title = `Leave page ${Date.now()}`;
  await createQuote(page, title);
  await page.goto('/quotes');
  await row(page, title).getByRole('button', { name: /delete/i }).click();
  await page.getByRole('link', { name: /templates/i }).click();
  await expect(page).toHaveURL(/\/templates/);
  await page.goto('/quotes');
  await expect(row(page, title)).toHaveCount(0);
});

test('sorting by title', async ({ page }) => {
  await createQuote(page, 'AAA first');
  await createQuote(page, 'ZZZ last');
  await page.goto('/quotes');
  await page.getByRole('button', { name: /^title/i }).click();
  const titles = await page.getByRole('row').locator('td:first-child').allTextContents();
  const aIndex = titles.findIndex((t) => t.startsWith('AAA first'));
  const zIndex = titles.findIndex((t) => t.startsWith('ZZZ last'));
  expect(aIndex).toBeLessThan(zIndex);
});
