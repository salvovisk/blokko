import { expect, type Page } from '@playwright/test';

export const DEMO = { email: 'demo@blokko.com', password: 'demo123' };

/** Force English regardless of the machine's locale. */
export async function useEnglish(page: Page) {
  await page.addInitScript(() => localStorage.setItem('blokko-locale', 'en'));
}

export async function openNewQuote(page: Page) {
  await page.goto('/builder?new=1');
  await expect(page).toHaveURL(/\/builder$/);
  await expect(page.getByText('Add a block to start building')).toBeVisible();
}

export async function addBlock(page: Page, label: string) {
  await page.getByRole('button', { name: new RegExp(`^${label}:`) }).click();
}

export function canvasBlocks(page: Page) {
  return page.locator('.quote-block');
}

export async function setTitle(page: Page, title: string) {
  const input = page.getByRole('textbox', { name: 'UNTITLED QUOTE' });
  await input.fill(title);
}

export async function saveQuote(page: Page) {
  const saved = page.waitForResponse((r) => /\/api\/quotes/.test(r.url()) && ['POST', 'PUT'].includes(r.request().method()));
  await page.getByRole('button', { name: /^save/i }).first().click();
  const res = await saved;
  expect(res.status(), await res.text()).toBeLessThan(300);
  await expect(page.getByRole('status').filter({ hasText: 'Quote saved' })).toBeVisible();
  await expect(page).toHaveURL(/\/builder\?id=/);
  return new URL(page.url()).searchParams.get('id')!;
}

export function toast(page: Page, text: string | RegExp) {
  return page.locator('[role="status"],[role="alert"]').filter({ hasText: text });
}
