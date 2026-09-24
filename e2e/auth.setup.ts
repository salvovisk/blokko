import { test as setup, expect } from '@playwright/test';
import { DEMO } from './helpers';

setup('log in as the demo user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(DEMO.email);
  await page.getByLabel('Password').fill(DEMO.password);
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).toHaveURL(/\/quotes/);
  await page.context().storageState({ path: 'e2e/.auth/demo.json' });
});
