import { expect, test } from '@playwright/test';
import { signIn } from './helpers.ts';

test('ledger: a fiscal year from April to March names and sets the report periods', async ({ page }) => {
  await signIn(page);
  // The fiscal year that contains today, starting in April.
  const now = new Date();
  const y = now.getFullYear() - (now.getMonth() < 3 ? 1 : 0);
  const label = (x: number) => `${x}/${String((x + 1) % 100).padStart(2, '0')}`;

  await page.goto('/buchhaltung/einstellungen');
  const start = page.getByLabel('Wirtschaftsjahr beginnt am');
  const confirm = page.getByRole('group', { name: 'Wirtschaftsjahr umstellen' });
  // Earlier flows booked entries: changing the year asks first, and cancelling keeps it.
  await start.selectOption({ label: '1. April' });
  await expect(confirm).toContainText('Es gibt schon Buchungen');
  await confirm.getByRole('button', { name: 'Abbrechen' }).click();
  await expect(confirm).toBeHidden();
  await expect(start.locator('option:checked')).toHaveText('1. Januar (Kalenderjahr)');
  await start.selectOption({ label: '1. April' });
  await confirm.getByRole('button', { name: 'Umstellen' }).click();
  await expect(page.getByText(`${label(y)}: 01.04.${y} bis 31.03.${y + 1}`)).toBeVisible();

  try {
    await page.goto('/buchhaltung/euer');
    const years = page.getByRole('group', { name: 'Wirtschaftsjahr' });
    await expect(years.getByRole('button', { name: label(y) })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Von')).toHaveValue(`${y}-04-01`);
    await expect(page.getByLabel('Bis')).toHaveValue(`${y + 1}-03-31`);
    await expect(page.getByRole('link', { name: `Kassenbericht ${label(y)} (PDF)` })).toBeVisible();

    await years.getByRole('button', { name: label(y - 1) }).click();
    await expect(page).toHaveURL(new RegExp(`von=${y - 1}-04-01&bis=${y}-03-31`));
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: `Kassenbericht ${label(y - 1)} (PDF)` }).click();
    expect((await download).suggestedFilename()).toBe(`Kassenbericht-${y - 1}-${String(y % 100).padStart(2, '0')}.pdf`);

    await page.goto('/buchhaltung/haushaltsplan');
    await expect(page.getByLabel('Wirtschaftsjahr')).toHaveValue(String(y));
    await expect(page.getByLabel('Wirtschaftsjahr').locator('option:checked')).toHaveText(label(y));
  } finally {
    // Other flows expect calendar years.
    await page.goto('/buchhaltung/einstellungen');
    await page.getByLabel('Wirtschaftsjahr beginnt am').selectOption({ label: '1. Januar (Kalenderjahr)' });
    await page.getByRole('group', { name: 'Wirtschaftsjahr umstellen' }).getByRole('button', { name: 'Umstellen' }).click();
    await expect(page.getByText(`${now.getFullYear()}: 01.01.`)).toBeVisible();
  }
});
