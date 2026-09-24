import { test, expect } from '@playwright/test';
import { useEnglish } from './helpers';

test.use({ storageState: { cookies: [], origins: [] } });
test.beforeEach(async ({ page }) => useEnglish(page));

test('landing page explains the product and links to sign up', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: /start building/i }).first().click();
  await expect(page).toHaveURL(/\/register/);
});

test('unknown pages redirect home, unknown APIs 404', async ({ page, request }) => {
  await page.goto('/definitely-not-a-page');
  await expect(page).toHaveURL(/localhost:3100\/$/);
  expect((await request.get('/api/nope')).status()).toBe(404);
});

test('security headers are sent', async ({ request }) => {
  const res = await request.get('/');
  expect(res.headers()['x-frame-options']).toBe('SAMEORIGIN');
  expect(res.headers()['content-security-policy']).toContain("default-src 'self'");
});

test('health check responds', async ({ request }) => {
  const res = await request.get('/api/health');
  expect((await res.json()).status).toBe('ok');
});

test('API writes without a CSRF token are refused', async ({ request }) => {
  const res = await request.post('/api/quotes', { data: { title: 'x', blocks: [] } });
  expect([401, 403]).toContain(res.status());
});
