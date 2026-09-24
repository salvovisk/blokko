import { test, expect } from '@playwright/test';
import { useEnglish, toast } from './helpers';

test.beforeEach(async ({ page }) => useEnglish(page));

test('profile name can be updated', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByLabel('EMAIL (READ-ONLY)')).toHaveValue('demo@blokko.com');
  await page.getByLabel('NAME', { exact: true }).fill('Demo Renamed');
  await page.getByRole('button', { name: 'UPDATE PROFILE' }).click();
  await expect(toast(page, 'Profile updated')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('NAME', { exact: true })).toHaveValue('Demo Renamed');
});

test('a weak new password is explained before hitting the server', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('CURRENT PASSWORD').fill('demo123');
  await page.getByLabel('NEW PASSWORD', { exact: true }).fill('abcdefgh');
  await page.getByLabel('CONFIRM NEW PASSWORD').fill('abcdefgh');
  await page.getByRole('button', { name: 'CHANGE PASSWORD' }).click();
  await expect(toast(page, /uppercase letter, a lowercase letter and a number/)).toBeVisible();
});

test('wrong current password is reported', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('CURRENT PASSWORD').fill('not-my-password');
  await page.getByLabel('NEW PASSWORD', { exact: true }).fill('Password9');
  await page.getByLabel('CONFIRM NEW PASSWORD').fill('Password9');
  await page.getByRole('button', { name: 'CHANGE PASSWORD' }).click();
  await expect(toast(page, 'Current password is incorrect')).toBeVisible();
});

test('switching language translates the app and sticks', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('button', { name: /switch to italian/i }).click();
  await expect(page.getByRole('heading', { name: 'IMPOSTAZIONI' })).toBeVisible();
  await page.goto('/quotes');
  await expect(page.getByRole('heading', { name: 'I MIEI PREVENTIVI' })).toBeVisible();
  await page.goto('/settings');
  await page.getByRole('button', { name: /switch to english/i }).click();
  await expect(page.getByRole('heading', { name: 'SETTINGS' })).toBeVisible();
});
