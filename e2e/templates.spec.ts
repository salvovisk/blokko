import { test, expect } from '@playwright/test';
import { useEnglish, canvasBlocks, toast } from './helpers';

test.beforeEach(async ({ page }) => useEnglish(page));

test('system templates are listed and can be used to start a quote', async ({ page }) => {
  await page.goto('/templates');
  const row = page.getByRole('row').filter({ hasText: 'Basic Quote' }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /^use$/i }).click();
  await expect(page).toHaveURL(/\/builder$/);
  await expect(page.getByRole('textbox', { name: 'UNTITLED QUOTE' })).toHaveValue('Basic Quote - Copy');
  expect(await canvasBlocks(page).count()).toBeGreaterThan(0);
});

test('system templates cannot be renamed or deleted', async ({ page }) => {
  await page.goto('/templates');
  const row = page.getByRole('row').filter({ hasText: 'Basic Quote' }).first();
  await expect(row.getByRole('button', { name: /rename/i })).toHaveCount(0);
  await expect(row.getByRole('button', { name: /delete/i })).toHaveCount(0);
});

test('own templates can be renamed and deleted', async ({ page, request }) => {
  const name = `Mine ${Date.now()}`;
  // Create one through the API the way the builder does
  const csrf = (await (await request.get('/api/csrf')).json()).csrfToken;
  const created = await request.post('/api/templates', {
    headers: { 'x-csrf-token': csrf },
    data: { name, blocks: [{ id: 'h', type: 'HEADER', data: {} }] },
  });
  expect(created.status()).toBe(201);

  await page.goto('/templates');
  const row = page.getByRole('row').filter({ hasText: name });
  await row.getByRole('button', { name: /rename/i }).click();
  const input = page.getByRole('textbox', { name: 'RENAME' });
  await input.fill(`${name} renamed`);
  await input.press('Enter');
  await expect(toast(page, 'Template renamed')).toBeVisible();
  await expect(page.getByText(`${name} renamed`)).toBeVisible();

  await page.getByRole('row').filter({ hasText: `${name} renamed` }).getByRole('button', { name: /delete/i }).click();
  await page.getByRole('button', { name: /^delete$/i }).last().click();
  await expect(toast(page, 'Template deleted')).toBeVisible();
  await expect(page.getByText(`${name} renamed`)).toHaveCount(0);
});
