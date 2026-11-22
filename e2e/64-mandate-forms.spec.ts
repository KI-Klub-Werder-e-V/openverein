import { randomUUID } from 'node:crypto';
import { expect, test, type Locator } from '@playwright/test';
import { signIn } from './helpers.ts';

/** Opens the "SEPA-Mandat" menu inside `scope` and picks an item. */
const pick = async (scope: Locator, item: string) => {
  await scope.locator('summary', { hasText: 'SEPA-Mandat' }).click();
  await scope.getByRole('button', { name: item }).click();
};

test('SEPA: ask members for a mandate and tell them its data, from the member sheet and the member list', async ({ page }) => {
  await signIn(page);
  const headers = () => ({ 'idempotency-key': randomUUID() });
  await page.request.patch('/api/v1/organization', { headers: { 'if-match': '*' }, data: { creditorId: 'DE98ZZZ09999999999' } });
  const mail = await (await page.request.post('/api/v1/members', { headers: headers(), data: { firstName: 'Mara', lastName: 'Neubank', email: 'mara.mandat@example.org', joinDate: '2024-01-01' } })).json();
  await page.request.post('/api/v1/members', { headers: headers(), data: { firstName: 'Bruno', lastName: 'Neubankbrief', joinDate: '2024-01-01' } });

  // One member: the form as PDF, then by e-mail.
  await page.goto(`/mitglieder/${mail.id}`);
  const sheet = page.getByRole('dialog', { name: 'Neubank, Mara' });
  let download = page.waitForEvent('download');
  await pick(sheet, 'Mandatsformular als PDF');
  expect((await download).suggestedFilename()).toMatch(/^SEPA-Mandat-.+\.pdf$/);
  await pick(sheet, 'Mandat per E-Mail anfordern …');
  await sheet.getByRole('button', { name: 'Per E-Mail senden' }).click();
  await expect(sheet.getByRole('status')).toContainText('Eine E-Mail mit dem Mandatsformular ist unterwegs');
  await sheet.getByRole('status').getByRole('button', { name: 'Schließen' }).click();

  // The signed form came back: record it, then tell the member its data.
  await sheet.getByRole('button', { name: 'Mandat erfassen' }).click();
  await sheet.getByLabel('IBAN').fill('DE02 1203 0000 0000 2020 51');
  await sheet.getByRole('button', { name: 'Speichern' }).click();
  await expect(sheet.getByText('Mandatsreferenz')).toBeVisible();
  download = page.waitForEvent('download');
  await pick(sheet, 'Mitteilung als PDF');
  expect((await download).suggestedFilename()).toMatch(/^SEPA-Mandat-Mitteilung-.+\.pdf$/);
  await pick(sheet, 'Mandat per E-Mail mitteilen …');
  await sheet.getByRole('button', { name: 'Per E-Mail senden' }).click();
  await expect(sheet.getByRole('status')).toContainText('Eine E-Mail mit den Mandatsdaten ist unterwegs');

  // Several members: the one without an address lands on the print list.
  await page.goto('/mitglieder?q=Neubank');
  await expect(page.getByRole('table', { name: 'Mitglieder' })).toContainText('Neubankbrief, Bruno');
  await page.getByRole('checkbox', { name: 'Alle sichtbaren auswählen' }).check();
  const bulk = page.getByRole('form', { name: 'Sammelaktion' });
  await pick(bulk, 'SEPA-Mandat anfordern …');
  const ask = page.getByRole('region', { name: 'SEPA-Mandat anfordern' });
  await expect(ask).toContainText('2 Mitgliedern das Mandatsformular schicken');
  await ask.getByRole('button', { name: 'Per E-Mail senden' }).click();
  // Mara's first request may still wait in the queue; Bruno has no address either way.
  await expect(ask.getByRole('status')).toContainText('Bruno Neubankbrief (keine E-Mail-Adresse)');
  download = page.waitForEvent('download');
  await ask.getByRole('button', { name: 'Brief als PDF' }).click();
  expect((await download).suggestedFilename()).toMatch(/^SEPA-Mandate-\d{4}-\d{2}-\d{2}\.pdf$/);
  await ask.getByRole('button', { name: 'Schließen' }).click();

  // Telling several members: Bruno has no mandate yet and is left out.
  await pick(bulk, 'SEPA-Mandat mitteilen …');
  const tell = page.getByRole('region', { name: 'SEPA-Mandat mitteilen' });
  await tell.getByRole('button', { name: 'Alle als PDF drucken' }).click();
  await expect(tell.getByRole('alert')).toHaveCount(0);
  await tell.getByRole('button', { name: 'Per E-Mail senden' }).click();
  await expect(tell.getByRole('status')).toContainText('Ohne Mandat, nichts verschickt: Bruno Neubankbrief');
});
