import { test, expect } from '@playwright/test';
import { useEnglish, openNewQuote, addBlock, canvasBlocks, setTitle, saveQuote, toast } from './helpers';

const ALL = ['Header', 'Text', 'Table', 'Timeline', 'Prices', 'Discount', 'Payment', 'Terms', 'FAQ', 'Contact', 'Signature'];

test.beforeEach(async ({ page }) => {
  await useEnglish(page);
  await openNewQuote(page);
});

test('a quote with every block type saves and reloads intact', async ({ page }) => {
  for (const label of ALL) await addBlock(page, label);
  await expect(canvasBlocks(page)).toHaveCount(ALL.length);

  await setTitle(page, 'Everything quote');
  const id = await saveQuote(page);

  await page.goto(`/builder?id=${id}`);
  await expect(canvasBlocks(page)).toHaveCount(ALL.length);
  await expect(page.getByRole('textbox', { name: 'UNTITLED QUOTE' })).toHaveValue('Everything quote');
  // Nothing comes back stuck in the "saving" state
  await expect(page.getByText('Saving…')).toHaveCount(0);
});

test('saving twice updates the same quote instead of creating a copy', async ({ page, request }) => {
  await addBlock(page, 'Header');
  await setTitle(page, 'Only once');
  const id = await saveQuote(page);
  await setTitle(page, 'Only once, edited');
  await saveQuote(page);
  const list = await (await request.get('/api/quotes')).json();
  const matches = list.data.filter((q: { title: string }) => q.title.startsWith('Only once'));
  expect(matches).toHaveLength(1);
  expect(matches[0].id).toBe(id);
});

test('undo and redo with keyboard shortcuts', async ({ page }) => {
  await addBlock(page, 'Header');
  await addBlock(page, 'Prices');
  await expect(canvasBlocks(page)).toHaveCount(2);
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('ControlOrMeta+z');
  await expect(canvasBlocks(page)).toHaveCount(1);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(canvasBlocks(page)).toHaveCount(2);
});

test('undo still works after the first save', async ({ page }) => {
  await addBlock(page, 'Header');
  await addBlock(page, 'Text');
  await setTitle(page, 'Undo after save');
  await saveQuote(page);
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('ControlOrMeta+z');
  await expect(canvasBlocks(page)).toHaveCount(1);
});

test('clear builder can be undone from the toast', async ({ page }) => {
  await addBlock(page, 'Header');
  await addBlock(page, 'Terms');
  await page.getByRole('button', { name: /^clear$/i }).click();
  await expect(canvasBlocks(page)).toHaveCount(0);
  await toast(page, 'Builder cleared').getByRole('button', { name: 'UNDO' }).click();
  await expect(canvasBlocks(page)).toHaveCount(2);
});

test('deleting a block offers undo', async ({ page }) => {
  await addBlock(page, 'Header');
  await addBlock(page, 'FAQ');
  await canvasBlocks(page).first().hover();
  await page.getByRole('button', { name: /^Delete \(/ }).first().click();
  await expect(canvasBlocks(page)).toHaveCount(1);
  await toast(page, /block deleted/).getByRole('button', { name: 'UNDO' }).click();
  await expect(canvasBlocks(page)).toHaveCount(2);
});

test('duplicate places the copy right after the original', async ({ page }) => {
  await addBlock(page, 'Header');
  await addBlock(page, 'Terms');
  await canvasBlocks(page).first().hover();
  await page.getByRole('button', { name: /^Duplicate \(/ }).first().click();
  await expect(canvasBlocks(page)).toHaveCount(3);
  await expect(canvasBlocks(page).nth(1)).toContainText(/quote header/i);
});

test('command palette adds blocks by search', async ({ page }) => {
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('ControlOrMeta+k');
  const search = page.getByRole('textbox', { name: /type a command/i });
  await expect(search).toBeFocused();
  await search.fill('timeline');
  await page.keyboard.press('Enter');
  await expect(canvasBlocks(page)).toHaveCount(1);
  await expect(canvasBlocks(page).first()).toContainText(/timeline/i);
});

test('prices block totals line items with tax', async ({ page }) => {
  await addBlock(page, 'Prices');
  await page.getByRole('button', { name: /add row/i }).click();
  await page.getByRole('spinbutton', { name: 'Quantity' }).fill('2');
  await page.getByRole('spinbutton', { name: 'Unit price' }).fill('150');
  await expect(canvasBlocks(page).first()).toContainText('€366.00');
});

test('status control appears once saved and persists', async ({ page }) => {
  await addBlock(page, 'Header');
  await expect(page.getByRole('combobox', { name: 'STATUS' })).toHaveCount(0);
  await setTitle(page, 'Status quote');
  const id = await saveQuote(page);
  const status = page.getByRole('combobox', { name: 'STATUS' });
  await expect(status).toHaveValue('draft');
  const put = page.waitForResponse((r) => r.url().includes(`/api/quotes/${id}`) && r.request().method() === 'PUT');
  await status.selectOption('sent');
  expect((await put).status()).toBe(200);
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'STATUS' })).toHaveValue('sent');
});

test('preview opens the PDF and closes again', async ({ page }) => {
  await addBlock(page, 'Header');
  await page.getByRole('button', { name: /^preview$/i }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /^data:application\/pdf/);
  await page.getByRole('button', { name: /^close$/i }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('export downloads a PDF named after the quote', async ({ page }) => {
  await addBlock(page, 'Header');
  await setTitle(page, 'Acme Proposal');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /export pdf/i }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/\.pdf$/i);
  expect(file.suggestedFilename().toLowerCase()).toContain('acme');
});

test('save as template shows up on the templates page', async ({ page }) => {
  await addBlock(page, 'Header');
  await addBlock(page, 'Prices');
  const name = `My template ${Date.now()}`;
  await page.getByRole('button', { name: /save as template/i }).click();
  await page.getByPlaceholder(/Standard Service Quote/).fill(name);
  await page.getByRole('button', { name: 'SAVE TEMPLATE' }).click();
  await expect(toast(page, 'Template saved')).toBeVisible();
  await page.goto('/templates');
  await expect(page.getByText(name)).toBeVisible();
});

test('"+ New quote" starts blank even after editing another quote', async ({ page }) => {
  await addBlock(page, 'Header');
  await setTitle(page, 'Previous quote');
  await saveQuote(page);
  await page.goto('/quotes');
  await page.getByRole('link', { name: '+ NEW QUOTE' }).click();
  await expect(page).toHaveURL(/\/builder$/);
  await expect(canvasBlocks(page)).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'UNTITLED QUOTE' })).toHaveValue('Untitled Quote');
});

test('a missing quote id shows a clear error', async ({ page }) => {
  await page.goto('/builder?id=does-not-exist');
  await expect(toast(page, "Couldn't open this quote")).toBeVisible();
});
