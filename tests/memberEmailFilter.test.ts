import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { emailHash } from '../src/server/mail/worker.ts';
import { client, reset, setupClub, testApp, userWithRole } from './helpers.ts';

const ctx = await testApp();
afterAll(() => ctx.close());

let admin: ReturnType<typeof client>;
let cookie: string;
beforeEach(async () => {
  await reset(ctx.db);
  cookie = (await setupClub(ctx.app)).cookie;
  admin = client(ctx.app, { cookie });
});

const names = (r: { status: number; body: { items: { lastName: string }[] } }) => {
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  return r.body.items.map((i) => i.lastName).sort();
};
const member = async (lastName: string, email: string | null) => (await admin.post('/members', { firstName: 'Eva', lastName, email, joinDate: '2024-01-01' })).body.id as string;
const block = async (email: string, reason: 'bounce' | 'manual' | 'unsubscribe') => {
  const org = await ctx.db.selectFrom('organization').select('id').executeTakeFirstOrThrow();
  await ctx.db.insertInto('suppression').values({ organization_id: org.id, email_hash: emailHash(email), reason }).execute();
};

describe('member filter by e-mail address', () => {
  it('splits members into present, missing and undeliverable', async () => {
    await member('Mail', 'mail@example.org');
    await member('Ohne', null);
    await member('Bounce', 'Bounce@Example.org');
    await member('Gesperrt', 'gesperrt@example.org');
    await member('Abgemeldet', 'abgemeldet@example.org');
    await block('bounce@example.org', 'bounce');
    await block('gesperrt@example.org', 'manual');
    // Unsubscribing from newsletters does not make an address undeliverable.
    await block('abgemeldet@example.org', 'unsubscribe');

    expect(names(await admin.get('/members'))).toEqual(['Abgemeldet', 'Bounce', 'Gesperrt', 'Mail', 'Ohne']);
    expect(names(await admin.get('/members?email=present'))).toEqual(['Abgemeldet', 'Mail']);
    expect(names(await admin.get('/members?email=missing'))).toEqual(['Ohne']);
    expect(names(await admin.get('/members?email=undeliverable'))).toEqual(['Bounce', 'Gesperrt']);
    expect((await admin.get('/members?email=irgendwas')).status).toBe(400);
    // The facet combines with the others and works for selecting all hits and the exports.
    expect(names(await admin.get('/members?email=missing&q=Mail'))).toEqual([]);
    expect((await admin.get('/members/ids?email=undeliverable')).body.total).toBe(2);
    const csv = (await admin.get('/members/export.csv?email=missing')).body as string;
    expect(csv).toContain('Ohne');
    expect(csv).not.toContain('mail@example.org');
  });

  it('works without any blocked address', async () => {
    await member('Mail', 'mail@example.org');
    expect(names(await admin.get('/members?email=present'))).toEqual(['Mail']);
    expect(names(await admin.get('/members?email=undeliverable'))).toEqual([]);
  });

  it('needs the e-mail field, and communication rights for undeliverable', async () => {
    const roles = (await admin.get('/roles')).body as { name: string; permissions: Record<string, string> }[];
    const trainer = roles.find((r) => r.name === 'Trainer:in')!;
    expect((await admin.post('/roles', { name: 'Ohne Adressen', permissions: trainer.permissions, restrictedFields: ['email'] })).status).toBe(201);
    expect((await admin.post('/roles', { name: 'Ohne Versand', permissions: { ...trainer.permissions, communication: 'none' }, restrictedFields: [] })).status).toBe(201);
    const hidden = client(ctx.app, { cookie: await userWithRole(ctx.app, cookie, 'Ohne Adressen', null, 'hidden@example.org') });
    expect((await hidden.get('/members?email=missing')).status).toBe(403);
    expect((await hidden.get('/members/export.csv?email=present')).status).toBe(403);
    const quiet = client(ctx.app, { cookie: await userWithRole(ctx.app, cookie, 'Ohne Versand', null, 'quiet@example.org') });
    expect((await quiet.get('/members?email=missing')).status).toBe(200);
    expect((await quiet.get('/members?email=undeliverable')).status).toBe(403);
  });
});
