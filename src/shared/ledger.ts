import { z } from 'zod';

export const SPHERES = ['ideell', 'vermoegen', 'zweck', 'wirtschaft'] as const;
export const SPHERE_LABEL = { ideell: 'Ideeller Bereich', vermoegen: 'Vermögensverwaltung', zweck: 'Zweckbetrieb', wirtschaft: 'Wirtschaftlicher Geschäftsbetrieb' } as const;
export const ACCOUNT_KIND_LABEL = { money: 'Geldkonto', income: 'Einnahmen', expense: 'Ausgaben', tax: 'Steuer', transit: 'Geldtransit', other: 'Sonstiges' } as const;
/** § 64 Abs. 3 AO: economic-sphere gross income above this per year ends the tax exemption for that sphere. */
/** § 64 Abs. 3 AO: 45,000 € until 2024, 50,000 € from 2025 (JStG 2024). */
export const wirtschaftLimitCents = (year: number) => (year >= 2025 ? 5_000_000 : 4_500_000);

const cents = z.number().int('Ganze Cent.').positive('Betrag muss größer als 0 sein.').max(100_000_000_00);
export const sphere = z.enum(SPHERES);

export const account = z.object({ id: z.uuid(), number: z.string(), name: z.string(), kind: z.enum(['money', 'income', 'expense', 'tax', 'transit', 'other']), defaultSphere: sphere, datevNumber: z.string().nullable(), hidden: z.boolean(), retired: z.boolean(), used: z.boolean() });
export const accountInput = z.object({
  number: z.string().trim().regex(/^[0-9]{3,8}$/, '3 bis 8 Ziffern.'),
  name: z.string().trim().min(1, 'Pflichtfeld.').max(120),
  kind: z.enum(['money', 'income', 'expense', 'other']),
  defaultSphere: sphere.default('ideell'),
  datevNumber: z.string().trim().regex(/^[0-9]{4,9}$/, '4 bis 9 Ziffern.').nullish().or(z.literal('').transform(() => null)),
});
export const accountPatch = accountInput.pick({ name: true, defaultSphere: true, datevNumber: true }).partial().extend({ hidden: z.boolean().optional(), retired: z.boolean().optional() });

export const taxRate = z.object({ id: z.uuid(), label: z.string(), rateBp: z.number(), validFrom: z.string(), validTo: z.string().nullable(), outputAccountId: z.uuid().nullable(), inputAccountId: z.uuid().nullable() });
export const taxRateInput = z.object({
  label: z.string().trim().min(1, 'Pflichtfeld.').max(60),
  rateBp: z.number().int().min(0).max(10_000),
  validFrom: z.iso.date(),
  validTo: z.iso.date().nullish(),
  outputAccountId: z.uuid().nullish(),
  inputAccountId: z.uuid().nullish(),
}).refine((t) => !t.validTo || t.validTo >= t.validFrom, { message: 'Das Ende liegt vor dem Beginn.', path: ['validTo'] });
export const costCenter = z.object({ id: z.uuid(), code: z.string(), name: z.string() });

export const bookingLine = z.object({
  text: z.string().trim().max(200).optional(),
  grossCents: cents,
  accountId: z.uuid(),
  taxRateId: z.uuid().nullish(),
  sphere: sphere.optional(),
  costCenterId: z.uuid().nullish(),
});
export const bookingInput = z.discriminatedUnion('kind', [
  z.object({ kind: z.enum(['income', 'expense']), date: z.iso.date(), text: z.string().trim().min(1, 'Bitte einen Buchungstext angeben.').max(300), moneyAccountId: z.uuid(), lines: z.array(bookingLine).min(1).max(50) }),
  // Between own accounts (cash to bank and back): booked through the transit account, never income.
  z.object({ kind: z.literal('transfer'), date: z.iso.date(), text: z.string().trim().min(1).max(300), fromAccountId: z.uuid(), toAccountId: z.uuid(), amountCents: cents }),
]);

export const journalLine = z.object({ accountId: z.uuid(), accountNumber: z.string(), accountName: z.string(), debitCents: z.number(), creditCents: z.number(), sphere, costCenter: z.string().nullable(), taxRate: z.string().nullable(), text: z.string().nullable() });
export const journalEntry = z.object({ id: z.uuid(), number: z.number(), date: z.string(), text: z.string(), source: z.string(), reversesNumber: z.number().nullable(), reversedBy: z.number().nullable(), createdBy: z.string().nullable(), createdAt: z.string(), lines: z.array(journalLine) });

export const ledgerSettings = z.object({
  bankAccountId: z.uuid().nullable(),
  cashAccountId: z.uuid().nullable(),
  feeAccountId: z.uuid().nullable(),
  otherIncomeAccountId: z.uuid().nullable(),
  dunningAccountId: z.uuid().nullable(),
  lockDate: z.string().nullable(),
  /** month (1–12) the fiscal year starts in, on its first day */
  fiscalYearStartMonth: z.number().int().min(1).max(12),
  /** whether bookings or budget values exist, so that changing the fiscal year moves past years */
  fiscalYearInUse: z.boolean(),
  bankAccounts: z.array(z.object({ id: z.uuid(), name: z.string(), ibanLast4: z.string(), ledgerAccountId: z.uuid().nullable() })),
});

export const euerRow = z.object({ accountId: z.uuid(), number: z.string(), name: z.string(), kind: z.enum(['income', 'expense']), sphere, netCents: z.number() });
export const euerReport = z.object({
  from: z.string(),
  to: z.string(),
  rows: z.array(euerRow),
  spheres: z.array(z.object({ sphere, incomeCents: z.number(), expenseCents: z.number(), resultCents: z.number() })),
  vat: z.object({ outputCents: z.number(), inputCents: z.number() }),
  totals: z.object({ incomeCents: z.number(), expenseCents: z.number(), resultCents: z.number() }),
  warnings: z.array(z.object({ kind: z.string(), message: z.string(), href: z.string().nullable() })),
});

/** The fiscal year that contains `date` (YYYY-MM-DD), for a year starting on the first of `startMonth`. */
export function fiscalYear(date: string, startMonth: number) {
  const y = Number(date.slice(0, 4)) - (Number(date.slice(5, 7)) < startMonth ? 1 : 0);
  return fiscalYearOf(y, startMonth);
}

/** The fiscal year starting in `startYear`: its first and last day and its name ("2025", or "2025/26" if it spans two years). */
export function fiscalYearOf(startYear: number, startMonth: number) {
  const start = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;
  const end = new Date(Date.UTC(startYear + 1, startMonth - 1, 0)).toISOString().slice(0, 10);
  const label = startMonth === 1 ? String(startYear) : `${startYear}/${String((startYear + 1) % 100).padStart(2, '0')}`;
  return { year: startYear, start, end, label };
}
