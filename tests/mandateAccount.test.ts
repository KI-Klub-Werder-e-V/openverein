import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { decrypt } from '../src/server/crypto.ts';
import { client, reset, setupClub, testApp } from './helpers.ts';

const ctx = await testApp();
afterAll(() => ctx.close());

const OLD_IBAN = 'DE89370400440532013000';
const NEW_IBAN = 'DE02120300000000202051';

let admin: ReturnType<typeof client>;
beforeEach(async () => {
  await reset(ctx.db);
  admin = client(ctx.app, { cookie: (await setupClub(ctx.app)).cookie });
  await admin.patch('/organization', { creditorId: 'DE98ZZZ09999999999' });
});

const member = async () => (await admin.post('/members', { firstName: 'Eva', lastName: 'Muster', email: 'eva@example.org', joinDate: '2024-01-01', street: 'Lindenweg 7', postalCode: '36272', city: 'Niederaula' })).body.id as string;
const mandate = async (memberId: string) => (await admin.post(`/members/${memberId}/mandates`, { signedOn: '2024-01-15', accountHolder: 'Eva Muster', iban: OLD_IBAN })).body;
const row = (id: string) => ctx.db.selectFrom('sepa_mandate').selectAll().where('id', '=', id).executeTakeFirstOrThrow();
const collected = (id: string) => ctx.db.updateTable('sepa_mandate').set({ first_collected: true }).where('id', '=', id).execute();

describe('neue Bankverbindung zum bestehenden Mandat', () => {
  it('behält Referenz und schreibt SMNDA, wenn die Bank das Mandat schon kennt', async () => {
    const m = await mandate(await member());
    await collected(m.id); // der nächste Einzug muss der Bank das alte Konto mitteilen
    const res = await admin.post(`/mandates/${m.id}/account`, { iban: NEW_IBAN });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body.reference).toBe(m.reference); // keine neue Referenz
    expect(res.body.signedOn).toBe('2024-01-15'); // keine neue Unterschrift

    const after = await row(m.id);
    expect(after.reference).toBe(m.reference);
    expect(after.status).toBe('active');
    expect(decrypt(after.iban_encrypted)).toBe(NEW_IBAN);
    expect(after.iban_last4).toBe(NEW_IBAN.slice(-4));
    expect(after.amendment_pending).toBe(true);
    expect(after.amended_from_iban_encrypted).not.toBeNull();
    expect(decrypt(after.amended_from_iban_encrypted!)).toBe(OLD_IBAN); // das Konto, das die Bank kennt
  });

  it('tauscht nur das Konto (kein SMNDA), wenn die Bank das Mandat noch nie gesehen hat', async () => {
    const m = await mandate(await member()); // first_collected bleibt false
    const res = await admin.post(`/mandates/${m.id}/account`, { iban: NEW_IBAN });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const after = await row(m.id);
    expect(decrypt(after.iban_encrypted)).toBe(NEW_IBAN);
    expect(after.amendment_pending).toBe(false);
    expect(after.amended_from_iban_encrypted).toBeNull();
  });

  it('weist ein widerrufenes Mandat ab (dafür braucht es ein neues Mandat)', async () => {
    const m = await mandate(await member());
    await admin.post(`/mandates/${m.id}/revoke`, { reason: 'Test' });
    const res = await admin.post(`/mandates/${m.id}/account`, { iban: NEW_IBAN });
    expect(res.status).toBe(409);
    expect(res.body.type).toContain('not-active');
  });

  it('prüft die IBAN', async () => {
    const m = await mandate(await member());
    const res = await admin.post(`/mandates/${m.id}/account`, { iban: 'DE00000000000000000000' });
    expect(res.status).toBe(400);
  });
});
