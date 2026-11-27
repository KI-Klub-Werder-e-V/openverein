## 1. Server

- [x] 1.1 Migration: message kind `mandate_forms`, mail template key `mandate_request`
- [x] 1.2 PDF: mandate form on a DIN 5008 letter (`src/server/sepa/mandateForm.ts`)
- [x] 1.3 API: one form, letters PDF, send by e-mail with print list; audit `mandate.requested`
- [x] 1.4 Mail worker attaches the form; system template "SEPA-Mandat anfordern"
- [x] 1.5 Mandate notice: PDF letter, API, mail text with placeholders, system template "SEPA-Mandat mitteilen"; audit `mandate.notified`
- [x] 1.6 Shared helper `amendMandateIban` (reference stays, SMNDA when the bank knows the mandate); portal bank-change (`changes.ts`) reuses it; `POST /mandates/:id/account` for the admin action, rejects revoked/expired mandates

## 2. Web

- [x] 2.1 Member sheet: "SEPA-Mandat" menu (request by e-mail, form as PDF, notice by e-mail, notice as PDF)
- [x] 2.2 Member list bulk bar: "SEPA-Mandat" menu (request, notice), each by e-mail or as one PDF, with print list
- [x] 2.3 Member sheet: "Neue Bankverbindung" action (keeps the reference) and a hint on "Neues Mandat" when an active mandate exists

## 3. Tests

- [x] 3.1 API tests: PDF content, missing creditor ID, channel split, double click, scope, mail attachment, notice text and members without a mandate
- [x] 3.2 e2e: request and notice from the member sheet and from the bulk bar
- [x] 3.3 API tests: new bank account keeps the reference and flags SMNDA when known; only swaps when unknown; rejects a revoked mandate; validates the IBAN
