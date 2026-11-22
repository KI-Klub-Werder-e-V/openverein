import { PDFDocument } from 'pdf-lib';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { processQueue } from '../src/server/mail/worker.ts';
import { setMailer } from '../src/server/mail/transport.ts';
import { mandateForms, mandateNotices } from '../src/server/sepa/mandateForm.ts';
import { client, reset, setupClub, testApp, userWithRole } from './helpers.ts';

const ctx = await testApp();
afterAll(() => ctx.close());
const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:18025';

let admin: ReturnType<typeof client>;
let adminCookie: string;
let orgId: string;
beforeEach(async () => {
  await reset(ctx.db);
  setMailer(null);
  await fetch(`${MAILPIT}/api/v1/messages`, { method: 'DELETE' });
  adminCookie = (await setupClub(ctx.app)).cookie;
  admin = client(ctx.app, { cookie: adminCookie });
  await admin.patch('/organization', { creditorId: 'DE98ZZZ09999999999', street: 'Sportplatzweg 1', postalCode: '12345', city: 'Musterstadt' });
  orgId = (await ctx.db.selectFrom('organization').select('id').executeTakeFirstOrThrow()).id;
});

const member = async (lastName: string, email: string | null, extra: Record<string, unknown> = {}) =>
  (await admin.post('/members', { firstName: 'Eva', lastName, email, joinDate: '2024-01-01', street: 'Lindenweg 7', postalCode: '36272', city: 'Niederaula', ...extra })).body.id as string;
const inbox = async (to: string) => (await (await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`)).json()).messages as { ID: string; Subject: string; Attachments: number }[];
const raw = (url: string, payload?: unknown) => ctx.app.inject({ method: payload ? 'POST' : 'GET', url: `/api/v1${url}`, headers: { cookie: adminCookie, ...(payload ? { 'idempotency-key': crypto.randomUUID() } : {}) }, ...(payload ? { payload: payload as object } : {}) });
const requested = async (action = 'mandate.requested') => (await ctx.db.selectFrom('audit_event').select(['entity_id', 'diff']).where('action', '=', action).orderBy('id').execute()).map((e) => [e.entity_id, (e.diff as { channel: [null, string] }).channel[1]]);

describe('mandate forms', () => {
  it('makes a one-page form per member and records the request', async () => {
    const id = await member('Muster', 'eva@example.org');
    const res = await raw(`/members/${id}/mandate-form.pdf`);
    expect(res.statusCode, res.body).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toMatch(/^attachment; filename="SEPA-Mandat-[\w.-]+\.pdf"$/);
    const doc = await PDFDocument.load(res.rawPayload);
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getTitle()).toBe('SEPA-Lastschriftmandat Eva Muster');
    expect(await requested()).toEqual([[id, 'pdf']]);
  });

  it('pre-fills the holder of the current mandate, never its IBAN or reference', async () => {
    const id = await member('Kind', 'kind@example.org');
    const m = await admin.post(`/members/${id}/mandates`, { signedOn: '2024-01-15', accountHolder: 'Hans Kind', iban: 'DE89370400440532013000' });
    expect(m.status, JSON.stringify(m.body)).toBe(201);
    const [form] = await mandateForms(ctx.db, orgId, [id]);
    expect(form!.holder).toEqual({ name: 'Hans Kind', street: 'Lindenweg 7', place: '36272 Niederaula' });
    expect(JSON.stringify(form)).not.toContain('0532013000');
    expect(JSON.stringify(form)).not.toContain(m.body.reference);
    // Without a mandate the member is the holder.
    const other = await member('Neu', null);
    expect((await mandateForms(ctx.db, orgId, [other]))[0]!.holder.name).toBe('Eva Neu');
  });

  it('refuses without a creditor ID', async () => {
    const id = await member('Muster', 'eva@example.org');
    await admin.patch('/organization', { creditorId: null });
    const res = await admin.get(`/members/${id}/mandate-form.pdf`);
    expect(res.status).toBe(409);
    expect(res.body.title).toBe('Für Mandatsformular und Mitteilung fehlt die Gläubiger-ID des Vereins.');
    expect((await admin.post('/mandate-forms/send', { memberIds: [id] })).status).toBe(409);
    expect((await admin.post('/mandate-forms/letters.pdf', { memberIds: [id] })).status).toBe(409);
    expect(await ctx.db.selectFrom('delivery').select('id').execute()).toEqual([]);
  });

  it('sends by e-mail with the form attached; letters and missing addresses go to the print list', async () => {
    const a = await member('Alpha', 'alpha@example.org');
    const b = await member('Beta', 'beta@example.org');
    const c = await member('Brief', 'brief@example.org', { preferredChannel: 'letter' });
    const d = await member('Ohne', null);
    const sent = await admin.post('/mandate-forms/send', { memberIds: [a, b, c, d] });
    expect(sent.status, JSON.stringify(sent.body)).toBe(201);
    expect(sent.body).toMatchObject({ sent: 2, alreadyQueued: 0 });
    expect(sent.body.toPrint).toEqual([{ memberId: c, name: 'Eva Brief', reason: 'bevorzugt Brief' }, { memberId: d, name: 'Eva Ohne', reason: 'keine E-Mail-Adresse' }]);

    // A second click before the queue ran sends nothing new.
    const again = await admin.post('/mandate-forms/send', { memberIds: [a, b] });
    expect(again.body).toMatchObject({ sent: 0, alreadyQueued: 2, messageId: null });

    expect(await processQueue(ctx.db)).toBe(2);
    const mails = await inbox('alpha@example.org');
    expect(mails).toHaveLength(1);
    expect(mails[0]).toMatchObject({ Subject: 'Bitte um ein SEPA-Lastschriftmandat', Attachments: 1 });
    const msg = await (await fetch(`${MAILPIT}/api/v1/message/${mails[0]!.ID}`)).json();
    expect(msg.Attachments[0]).toMatchObject({ FileName: 'SEPA-Lastschriftmandat.pdf', ContentType: 'application/pdf' });
    expect(msg.Text).toContain('Hallo Eva');
    const message = (await admin.get(`/messages/${sent.body.messageId}`)).body;
    expect(message).toMatchObject({ kind: 'mandate_forms', counts: { total: 2, sent: 2 } });

    // Once sent, a new request goes out again.
    expect((await admin.post('/mandate-forms/send', { memberIds: [a] })).body).toMatchObject({ sent: 1, alreadyQueued: 0 });
    expect((await requested()).filter(([, ch]) => ch === 'email').map(([m]) => m)).toEqual([a, b, a]);
  });

  it('prints the forms as one PDF, padded for duplex', async () => {
    const a = await member('Alpha', 'alpha@example.org');
    const b = await member('Beta', null, { postalCode: '10115' });
    const res = await raw('/mandate-forms/letters.pdf', { memberIds: [a, b] });
    expect(res.statusCode, res.body).toBe(200);
    const doc = await PDFDocument.load(res.rawPayload);
    expect(doc.getPageCount()).toBe(4);
    expect((await requested()).map(([, ch]) => ch)).toEqual(['letter', 'letter']);
  });

  it('needs the SEPA write permission and stays within the scope', async () => {
    const id = await member('Muster', 'eva@example.org');
    const trainer = client(ctx.app, { cookie: await userWithRole(ctx.app, adminCookie, 'Trainer:in') });
    expect((await trainer.get(`/members/${id}/mandate-form.pdf`)).status).toBe(403);
    expect((await trainer.post('/mandate-forms/send', { memberIds: [id] })).status).toBe(403);
    // A treasurer for one division gets forms only for its members.
    const tennis = (await admin.post('/groups', { name: 'Tennis', shortCode: 'TEN', kind: 'division' })).body.id as string;
    const inside = await member('Tennis', 'tennis@example.org', { groupIds: [tennis] });
    const lead = client(ctx.app, { cookie: await userWithRole(ctx.app, adminCookie, 'Kassenwart', [tennis]) });
    expect((await lead.get(`/members/${id}/mandate-form.pdf`)).status).toBe(404);
    expect((await lead.get(`/members/${inside}/mandate-form.pdf`)).status).toBe(200);
    expect((await lead.post('/mandate-forms/letters.pdf', { memberIds: [id] })).status).toBe(404);
    expect((await lead.post('/mandate-forms/letters.pdf', { memberIds: [id, inside] })).status).toBe(200);
    expect((await requested()).map(([m]) => m)).toEqual([inside, inside]);
    // Unknown or foreign members are not found rather than silently skipped when none is left.
    expect((await admin.post('/mandate-forms/letters.pdf', { memberIds: [crypto.randomUUID()] })).status).toBe(404);
  });
});

describe('mandate notices', () => {
  const withMandate = async (lastName: string, email: string | null, extra: Record<string, unknown> = {}) => {
    const id = await member(lastName, email, extra);
    const m = await admin.post(`/members/${id}/mandates`, { signedOn: '2024-01-15', accountHolder: `Eva ${lastName}`, iban: 'DE89370400440532013000' });
    expect(m.status, JSON.stringify(m.body)).toBe(201);
    return { id, reference: m.body.reference as string };
  };

  it('tells the reference, creditor ID and the masked IBAN by e-mail; members without a mandate are left out', async () => {
    const a = await withMandate('Alpha', 'alpha@example.org');
    const b = await withMandate('Brief', 'brief@example.org', { preferredChannel: 'letter' });
    const none = await member('Ohne', 'ohne@example.org');
    const sent = await admin.post('/mandate-notices/send', { memberIds: [a.id, b.id, none] });
    expect(sent.status, JSON.stringify(sent.body)).toBe(201);
    expect(sent.body).toMatchObject({ sent: 1, alreadyQueued: 0, toPrint: [{ memberId: b.id, reason: 'bevorzugt Brief' }], withoutMandate: [{ memberId: none, name: 'Eva Ohne' }] });
    expect((await admin.post('/mandate-notices/send', { memberIds: [a.id] })).body).toMatchObject({ sent: 0, alreadyQueued: 1 });

    expect(await processQueue(ctx.db)).toBe(1);
    const [mail] = await inbox('alpha@example.org');
    expect(mail).toMatchObject({ Subject: expect.stringContaining('Dein SEPA-Lastschriftmandat'), Attachments: 0 });
    const msg = await (await fetch(`${MAILPIT}/api/v1/message/${mail!.ID}`)).json();
    expect(msg.Text).toContain(`Mandatsreferenz: ${a.reference}`);
    expect(msg.Text).toContain('Gläubiger-ID: DE98ZZZ09999999999');
    expect(msg.Text).toContain('IBAN: DE•• •••• •••• •••• ••30 00');
    expect(msg.Text).toContain('Unterschrieben am: 15.01.2024');
    expect(msg.Text).not.toContain('0532013000');
    expect(msg.Text).not.toMatch(/\{\{/);
    expect((await requested('mandate.notified')).map(([m, ch]) => `${m === a.id ? 'a' : 'b'}:${ch}`)).toEqual(['a:email']);
  });

  it('prints the notices as PDF and refuses when there is no mandate', async () => {
    const a = await withMandate('Alpha', null);
    const none = await member('Ohne', null);
    const one = await raw(`/members/${a.id}/mandate-notice.pdf`);
    expect(one.statusCode, one.body).toBe(200);
    expect(one.headers['content-disposition']).toMatch(/filename="SEPA-Mandat-Mitteilung-[\w.-]+\.pdf"/);
    expect((await PDFDocument.load(one.rawPayload)).getTitle()).toBe('Dein SEPA-Lastschriftmandat Eva Alpha');
    const [notice] = await mandateNotices(ctx.db, orgId, [a.id, none]);
    expect(notice!.mandate.ibanMasked).toBe('DE•• •••• •••• •••• ••30 00');
    expect((await mandateNotices(ctx.db, orgId, [none]))).toEqual([]);

    const res = await admin.get(`/members/${none}/mandate-notice.pdf`);
    expect(res.status).toBe(409);
    expect((await admin.post('/mandate-notices/letters.pdf', { memberIds: [none] })).status).toBe(409);
    const letters = await raw('/mandate-notices/letters.pdf', { memberIds: [a.id, none] });
    expect(letters.statusCode).toBe(200);
    expect((await PDFDocument.load(letters.rawPayload)).getPageCount()).toBe(2);
    expect((await requested('mandate.notified')).map(([, ch]) => ch)).toEqual(['pdf', 'letter']);
  });
});
