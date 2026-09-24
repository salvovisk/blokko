import { test, expect } from '@playwright/test';
import { DEMO, useEnglish } from './helpers';

test.use({ storageState: { cookies: [], origins: [] } });
test.beforeEach(async ({ page }) => useEnglish(page));

test('protected pages send visitors to login and back after signing in', async ({ page }) => {
  await page.goto('/templates');
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Ftemplates/);
  await page.getByLabel('Email Address').fill(DEMO.email);
  await page.getByLabel('Password').fill(DEMO.password);
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).toHaveURL(/\/templates$/);
});

test('login ignores off-site callback URLs', async ({ page }) => {
  await page.goto('/login?callbackUrl=//evil.example.com');
  await page.getByLabel('Email Address').fill(DEMO.email);
  await page.getByLabel('Password').fill(DEMO.password);
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).toHaveURL(/localhost:3100\/quotes/);
});

test('wrong password shows an error and stays on login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(DEMO.email);
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Invalid email or password' })).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('register a new account, then log in with it', async ({ page }) => {
  const email = `new-${Date.now()}@example.com`;
  await page.goto('/register');
  await page.getByLabel('Full Name').fill('New Person');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('Password1');
  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/login\?registered=true/);
  await expect(page.getByRole('status').filter({ hasText: 'Account created' })).toBeVisible();

  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill('Password1');
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).toHaveURL(/\/quotes/);
  await expect(page.getByText("You haven't created any quotes yet.")).toBeVisible();
});

test('registering an existing email is refused', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Full Name').fill('Dup');
  await page.getByLabel('Email Address').fill(DEMO.email);
  await page.getByLabel('Password', { exact: true }).fill('Password1');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/register/);
});

test('logout ends the session', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(DEMO.email);
  await page.getByLabel('Password').fill(DEMO.password);
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).toHaveURL(/\/quotes/);
  await page.getByRole('button', { name: /logout/i }).click();
  await expect(page).toHaveURL(/localhost:3100\/$/);
  await page.goto('/quotes');
  await expect(page).toHaveURL(/\/login/);
});
