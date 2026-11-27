## Context

`ledger_setting.fiscal_year_start_month` (1–12, default 1) has existed since the DATEV export. Only `exports.ts` used it, through a local `fiscalYear()` helper.

## Decisions

- **One helper in `src/shared/ledger.ts`.** `fiscalYear(date, month)` finds the fiscal year that contains a date. `fiscalYearOf(startYear, month)` returns its start, end and name. The server and the web use the same helper, so the buttons and the reports always agree.
- **The year number is the year the fiscal year starts in.** Z3 already works this way. The budget table (`budget_line.year`) and the report URLs need no new key, and a calendar-year club sees no change.
- **The month only, starting on the 1st.** This covers the usual cases (April, July, October) and matches the DATEV header. A start in the middle of a month (for example 11 November) is out of scope.
- **The setting lives in the ledger settings** (`PATCH /ledger/settings`, audited like the other settings). The DATEV route keeps the field optional for API clients that still send it. The new form does not send it, so saving the DATEV header cannot reset the year to January.
- **Web:** `useLedgerRange()` reads the period from the URL (`von`, `bis`) or else the current fiscal year. Queries wait for the setting, so a page never loads a calendar year first and then the fiscal year.
- **Changing it later is allowed but confirmed.** Locking the setting would trap a club that chose wrong at setup. `GET /ledger/settings` returns `fiscalYearInUse` (journal entries or budget values exist); only then does the page ask. The API itself does not require a confirmation, like the other settings. The audit diff of `PATCH /ledger/settings` now holds the old value instead of `null`.
- **Calendar year stays** for donations (receipts are issued per calendar year), member statistics and honours.

## Risks

- A club that changes the start month later reinterprets its saved budget years. This is rare and visible in the budget. The settings text names the reports that follow the fiscal year.
