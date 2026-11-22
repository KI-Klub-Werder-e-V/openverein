import { randomUUID } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers.ts';

const filterBy = async (page: Page, option: string) => {
  await page.getByRole('button', { name: /^Filter/ }).click();
  const sheet = page.getByRole('dialog', { name: 'Filter' });
  await sheet.getByLabel('E-Mail-Adresse').selectOption({ label: option });
  await sheet.getByRole('button', { name: 'Anwenden' }).click();
};

test('member list: filter by e-mail address (present, missing, undeliverable)', async ({ page }) => {
  await signIn(page);
  const headers = () => ({ 'idempotency-key': randomUUID() });
  const add = async (lastName: string, email: string | null) => (await (await page.request.post('/api/v1/members', { headers: headers(), data: { firstName: 'Paula', lastName, email, joinDate: '2024-01-01' } })).json()).id as string;
  await add('Postfachmit', 'paula.mit@example.org');
  await add('Postfachohne', null);
  const bounced = await add('Postfachtot', 'paula.tot@example.org');
  // Mark the address as undeliverable the way the office does: on a delivery of a sent mail.
  const msg = await (await page.request.post('/api/v1/messages', { headers: headers(), data: { subject: 'Test', body: 'Hallo', filter: { mode: 'members', memberIds: [bounced] } } })).json();
  const detail = await (await page.request.get(`/api/v1/messages/${msg.id}`)).json();
  await page.request.post(`/api/v1/deliveries/${detail.deliveries[0].id}/bounce`, { headers: headers(), data: {} });

  const table = page.getByRole('table', { name: 'Mitglieder' });
  await page.goto('/mitglieder?q=Postfach');
  await expect(table).toContainText('Postfachtot, Paula');

  await filterBy(page, 'vorhanden');
  await expect(page).toHaveURL(/email=present/);
  await expect(page.getByRole('button', { name: 'Filter (1)' })).toBeVisible();
  await expect(table).toContainText('Postfachmit, Paula');
  await expect(table).not.toContainText('Postfachohne');
  await expect(table).not.toContainText('Postfachtot');

  await filterBy(page, 'fehlt');
  await expect(table).toContainText('Postfachohne, Paula');
  await expect(table).not.toContainText('Postfachmit');

  await filterBy(page, 'unzustellbar');
  await expect(table).toContainText('Postfachtot, Paula');
  await expect(table).not.toContainText('Postfachmit');
  await expect(table).not.toContainText('Postfachohne');
});
