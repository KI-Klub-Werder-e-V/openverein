## Why

Many clubs have a fiscal year that differs from the calendar year, for example a carnival club from 1 April to 31 March. OpenVerein already stores the month the fiscal year starts in, but only the DATEV export and the GoBD Z3 package use it, and the setting sits in the DATEV form. The treasurer's report for the general assembly always covers 1 January to 31 December, and the budget and the year buttons of the reports also count calendar years. Such a club cannot produce its annual report from OpenVerein.

## What Changes

- The start of the fiscal year (month, always on the 1st) becomes a general ledger setting. The text says to set it up once and change it only with the club's statutes. Once bookings or budget values exist, the page names what moves (reports, budget and Z3 packages of past years) and asks for confirmation. Bookings, locked periods and DATEV exports already made stay as they are. The audit log keeps the old and the new month. The setting lives under "Buchhaltung → Einstellungen → Wirtschaftsjahr" and is no longer in the DATEV form. `PUT /ledger/datev-settings` still accepts it but no longer needs it.
- A fiscal year is named by the year it starts in: "2025" for a calendar year, "2025/26" otherwise. The API keeps `year` as the year the fiscal year starts in, as the Z3 export already does.
- Treasurer's report (`/ledger/reports/treasurer.pdf?year=`): covers the fiscal year, with title, period, balance columns and file name to match ("Kassenbericht 2025/26", "1. April 2025 bis 31. März 2026").
- Budget (`/ledger/budget?year=`): actuals per fiscal year; the year selection shows fiscal years.
- Journal, EÜR and cash book: the default period and the year buttons are fiscal years. Any dates can still be chosen.
- Z3 buttons: named and chosen by fiscal year.
- Unchanged: donation receipts (by law per calendar year), member statistics and fees.

## Capabilities

### Modified Capabilities

- `bookkeeping`: "Budget im Abgleich mit der Buchhaltung" and "Kassenbericht" follow the fiscal year; new requirement "Wirtschaftsjahr".

## Impact

- `src/shared/ledger.ts` (`fiscalYear`, `fiscalYearOf`, setting in `ledgerSettings`), `src/server/routes/ledger.ts`, `src/server/routes/budget.ts`, `src/server/routes/exports.ts`, `src/server/ledger/report-pdf.ts`.
- `src/web/pages/Ledger.tsx`, `Budget.tsx`, `Receipts.tsx` (cash book).
- No migration: `ledger_setting.fiscal_year_start_month` exists (0014). Budget values saved before keep their year number; for a club that already had a different start month they now count as the fiscal year starting in that year.
