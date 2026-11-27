## 1. Setting

- [x] 1.1 Shared helpers `fiscalYear` and `fiscalYearOf` (start, end, name "2025/26")
- [x] 1.2 `fiscalYearStartMonth` in `GET`/`PATCH /ledger/settings`; DATEV route keeps it optional
- [x] 1.3 Settings page: section "Wirtschaftsjahr" (start month, current fiscal year); field removed from the DATEV form
- [x] 1.4 Hint to set it once; confirmation when bookings or budget values exist (`fiscalYearInUse`); audit with old and new month

## 2. Reports

- [x] 2.1 Treasurer's report per fiscal year (title, period, balance columns, file name)
- [x] 2.2 Budget actuals per fiscal year; year selection with fiscal-year names
- [x] 2.3 Journal, EÜR, cash book: default period and year buttons by fiscal year
- [x] 2.4 Z3 buttons by fiscal year

## 3. Tests

- [x] 3.1 Unit: fiscal year names, turn of the year, leap year, December start
- [x] 3.2 API: setting, DATEV keeps the month, rights, audit, `fiscalYearInUse`, budget and treasurer report April–March
- [x] 3.4 API: Z3 package and DATEV batch (one fiscal year, header) April–March
- [x] 3.3 e2e: cancel and confirm the change, see "2025/26" in the EÜR, treasurer report and budget
