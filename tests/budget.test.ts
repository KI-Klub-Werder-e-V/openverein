import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { client, reset, setupClub, testApp, userWithRole } from './helpers.ts';

const ctx = await testApp();
afterAll(() => ctx.close());

let admin: ReturnType<typeof client>;
let cookie: string;
let acc: (n: string) => string;
beforeEach(async () => {
  await reset(ctx.db);
  cookie = (await setupClub(ctx.app)).cookie;
  admin = client(ctx.app, { cookie });
  const accounts = (await admin.get('/ledger/accounts')).body as { id: string; number: string }[];
  acc = (n) => accounts.find((a) => a.number === n)!.id;
});

describe('budget', () => {
  it('compares planned and booked net amounts per account', async () => {
    await admin.post('/ledger/bookings', { kind: 'income', date: '2026-02-01', text: 'Zuschuss', moneyAccountId: acc('1100'), lines: [{ grossCents: 50000, accountId: acc('4600') }] });
    await admin.post('/ledger/bookings', { kind: 'expense', date: '2026-02-02', text: 'Bälle', moneyAccountId: acc('1100'), lines: [{ grossCents: 12000, accountId: acc('6100') }] });
    const set = await admin.put('/ledger/budget', { year: 2026, lines: [{ accountId: acc('4600'), plannedCents: 40000 }, { accountId: acc('6100'), plannedCents: 15000 }] });
    expect(set.status, JSON.stringify(set.body)).toBe(200);
    const rows = Object.fromEntries((set.body as { number: string }[]).map((r) => [r.number, r]));
    expect(rows['4600']).toMatchObject({ kind: 'income', plannedCents: 40000, actualCents: 50000 });
    expect(rows['6100']).toMatchObject({ kind: 'expense', plannedCents: 15000, actualCents: 12000 });
    expect((await admin.put('/ledger/budget', { year: 2026, lines: [{ accountId: acc('1100'), plannedCents: 1 }] })).status).toBe(400);
    const cleared = (await admin.put('/ledger/budget', { year: 2026, lines: [{ accountId: acc('6100'), plannedCents: null }] })).body as { number: string; plannedCents: number | null }[];
    expect(cleared.find((r) => r.number === '6100')!.plannedCents).toBeNull();
    const auditor = client(ctx.app, { cookie: await userWithRole(ctx.app, cookie, 'Kassenprüfung', null) });
    expect((await auditor.get('/ledger/budget?year=2026')).status).toBe(200);
    expect((await auditor.put('/ledger/budget', { year: 2026, lines: [{ accountId: acc('4600'), plannedCents: 1 }] })).status).toBe(403);
  });
});

describe('treasurer report', () => {
  it('renders the year as PDF for readers of the books', async () => {
    await admin.post('/ledger/bookings', { kind: 'income', date: '2026-02-01', text: 'Zuschuss', moneyAccountId: acc('1100'), lines: [{ grossCents: 50000, accountId: acc('4600') }] });
    const pdf = await ctx.app.inject({ url: '/api/v1/ledger/reports/treasurer.pdf?year=2026', headers: { cookie } });
    expect(pdf.statusCode).toBe(200);
    expect(pdf.rawPayload.subarray(0, 5).toString()).toBe('%PDF-');
    const lead = await userWithRole(ctx.app, cookie, 'Abteilungsleitung', null);
    expect((await ctx.app.inject({ url: '/api/v1/ledger/reports/treasurer.pdf?year=2026', headers: { cookie: lead } })).statusCode).toBe(403);
  });
});

describe('fiscal year', () => {
  it('is a ledger setting, kept by the DATEV settings unless they send one', async () => {
    expect((await admin.get('/ledger/settings')).body.fiscalYearStartMonth).toBe(1);
    const set = await admin.patch('/ledger/settings', { fiscalYearStartMonth: 4 });
    expect(set.status, JSON.stringify(set.body)).toBe(200);
    expect(set.body.fiscalYearStartMonth).toBe(4);
    expect((await admin.patch('/ledger/settings', { fiscalYearStartMonth: 13 })).status).toBe(400);
    // The DATEV form no longer carries the fiscal year; saving it must not reset it to January.
    const datev = await admin.put('/ledger/datev-settings', { consultant: 1001, client: 1, accountLength: 4 });
    expect(datev.status, JSON.stringify(datev.body)).toBe(200);
    expect(datev.body.fiscalYearStartMonth).toBe(4);
    expect((await admin.get('/ledger/settings')).body.fiscalYearStartMonth).toBe(4);
    const auditor = client(ctx.app, { cookie: await userWithRole(ctx.app, cookie, 'Kassenprüfung', null) });
    expect((await auditor.patch('/ledger/settings', { fiscalYearStartMonth: 1 })).status).toBe(403);
    // The change is logged with the old and the new month.
    const logged = await ctx.db.selectFrom('audit_event').select('diff').where('action', '=', 'ledger.settings_updated').orderBy('id').execute();
    expect(logged.map((l) => (l.diff as Record<string, unknown>).fiscal_year_start_month).filter(Boolean)).toEqual([[1, 4]]);
  });

  it('tells whether changing it would move past years (bookings or budget values exist)', async () => {
    expect((await admin.get('/ledger/settings')).body.fiscalYearInUse).toBe(false);
    await admin.put('/ledger/budget', { year: 2026, lines: [{ accountId: acc('4600'), plannedCents: 100 }] });
    expect((await admin.get('/ledger/settings')).body.fiscalYearInUse).toBe(true);
    await admin.put('/ledger/budget', { year: 2026, lines: [{ accountId: acc('4600'), plannedCents: null }] });
    expect((await admin.get('/ledger/settings')).body.fiscalYearInUse).toBe(false);
    await admin.post('/ledger/bookings', { kind: 'income', date: '2026-02-01', text: 'Zuschuss', moneyAccountId: acc('1100'), lines: [{ grossCents: 100, accountId: acc('4600') }] });
    expect((await admin.get('/ledger/settings')).body.fiscalYearInUse).toBe(true);
  });

  it('sets the period of the treasurer report and the budget (April to March)', async () => {
    await admin.patch('/ledger/settings', { fiscalYearStartMonth: 4 });
    await admin.post('/ledger/bookings', { kind: 'income', date: '2025-03-31', text: 'Vorjahr', moneyAccountId: acc('1100'), lines: [{ grossCents: 1000, accountId: acc('4600') }] });
    await admin.post('/ledger/bookings', { kind: 'income', date: '2025-04-01', text: 'Erster Tag', moneyAccountId: acc('1100'), lines: [{ grossCents: 20000, accountId: acc('4600') }] });
    await admin.post('/ledger/bookings', { kind: 'income', date: '2026-03-31', text: 'Letzter Tag', moneyAccountId: acc('1100'), lines: [{ grossCents: 30000, accountId: acc('4600') }] });
    await admin.post('/ledger/bookings', { kind: 'income', date: '2026-04-01', text: 'Nächstes Jahr', moneyAccountId: acc('1100'), lines: [{ grossCents: 4000, accountId: acc('4600') }] });
    // Budget 2025 is the fiscal year 2025/26.
    const actual = async (year: number) => ((await admin.get(`/ledger/budget?year=${year}`)).body as { number: string; actualCents: number }[]).find((r) => r.number === '4600')!.actualCents;
    expect(await actual(2024)).toBe(1000);
    expect(await actual(2025)).toBe(50000);
    expect(await actual(2026)).toBe(4000);
    const pdf = await ctx.app.inject({ url: '/api/v1/ledger/reports/treasurer.pdf?year=2025', headers: { cookie } });
    expect(pdf.statusCode).toBe(200);
    expect(pdf.headers['content-disposition']).toContain('Kassenbericht-2025-26.pdf');
    expect(pdf.rawPayload.toString('latin1')).toContain('Kassenbericht 2025/26');
    // A calendar-year club keeps its plain year.
    await admin.patch('/ledger/settings', { fiscalYearStartMonth: 1 });
    expect(await actual(2025)).toBe(21000);
    expect((await ctx.app.inject({ url: '/api/v1/ledger/reports/treasurer.pdf?year=2025', headers: { cookie } })).headers['content-disposition']).toContain('Kassenbericht-2025.pdf');
  });

  it('checks the § 64 AO limit per fiscal year, not per calendar year', async () => {
    await admin.patch('/ledger/settings', { fiscalYearStartMonth: 4 });
    // One fiscal year (April 2025 – March 2026), split across the calendar boundary: each calendar half is below
    // the 50.000 € limit, together above it. Grouped by calendar year (the old bug) the warning would stay silent.
    await admin.post('/ledger/bookings', { kind: 'income', date: '2025-06-01', text: 'Vereinsfest', moneyAccountId: acc('1100'), lines: [{ grossCents: 3_000_000, accountId: acc('4600'), sphere: 'wirtschaft' }] });
    await admin.post('/ledger/bookings', { kind: 'income', date: '2026-02-01', text: 'Winterfest', moneyAccountId: acc('1100'), lines: [{ grossCents: 2_500_000, accountId: acc('4600'), sphere: 'wirtschaft' }] });
    const euer = (await admin.get('/ledger/reports/euer?from=2025-04-01&to=2026-03-31')).body as { warnings: { kind: string; message: string }[] };
    const limit = euer.warnings.filter((w) => w.kind === 'limit' || w.kind === 'limit-near');
    expect(limit).toHaveLength(1);
    expect(limit[0]!.kind).toBe('limit');
    expect(limit[0]!.message).toContain('2025/26');
  });
});
