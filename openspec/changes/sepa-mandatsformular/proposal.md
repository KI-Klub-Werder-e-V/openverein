## Why

Issue #143: the treasurer cannot ask a member for a SEPA mandate. Typical cases:

- The bank merged and the member, who has no portal access, has to give the new bank details.
- A child member moves to the adult fee and now pays for themselves, which needs a first mandate.

The sepa spec already requires a pre-filled mandate form as PDF ("MUSS ein vorausgefülltes Mandatsformular als PDF erzeugen"), but there is none yet.

Once the signed mandate is recorded, the member should also learn its data (reference, creditor ID, which account), for a single member or many at once.

## What Changes

- A one-page PDF "SEPA-Lastschriftmandat" per member on a DIN 5008 letter (window envelope). It contains:
  - the club as payee, with address and creditor ID
  - the member with membership number
  - the mandate text and the payment type "wiederkehrend"
  - the account holder and address, pre-filled from the member (or from the holder of the current mandate)
  - empty fields for bank, BIC and IBAN
  - place, date and signature
  - the address to send it back to

  No mandate reference is printed: the member learns it with the pre-notification of the first debit. The IBAN is never printed, so no account data travels by e-mail.
- Without a creditor ID the form cannot be made (409 with a hint to the club settings).
- API:
  - `GET /api/v1/members/:id/mandate-form.pdf` returns one form.
  - `POST /api/v1/mandate-forms/letters.pdf` returns the forms for the chosen members as one print PDF, sorted by postal code and padded for duplex.
  - `POST /api/v1/mandate-forms/send` sends the form by e-mail as a PDF attachment, through the mail queue, with the new system template "SEPA-Mandat anfordern". Members who prefer letters, have no address or a blocked one are returned as a print list.
- **Telling a member the mandate's data** ("SEPA-Mandat mitteilen"): payee, creditor ID, mandate reference, account holder, IBAN masked except for its last four digits, signing date. It goes by e-mail in the text of the new system template "SEPA-Mandat mitteilen" (new placeholders `mandatsreferenz`, `glaeubiger_id`, `kontoinhaber`, `iban`, `unterschrieben`), or as a letter. Members without a current mandate are left out and named.
  - `GET /api/v1/members/:id/mandate-notice.pdf`, `POST /api/v1/mandate-notices/letters.pdf`, `POST /api/v1/mandate-notices/send`
- Every form made or sent is recorded in the member's audit history ("SEPA-Mandat angefordert", "SEPA-Mandat mitgeteilt"). There is no new mandate status, because a mandate record needs an IBAN.
- UI: a "SEPA-Mandat" menu
  - in the mandate section of the member sheet: "Mandat per E-Mail anfordern …", "Mandatsformular als PDF", and with a mandate "Mandat per E-Mail mitteilen …", "Mitteilung als PDF";
  - in the member list's bulk bar: "SEPA-Mandat anfordern …" and "SEPA-Mandat mitteilen …", each by e-mail or as one PDF to print, with the print list.

## Capabilities

### Modified Capabilities

- `sepa`: adds the requirements "Mandatsformular", "Mandat anfordern" and "Mandat mitteilen".

## Impact

- New migration: message kinds `mandate_forms` and `mandate_notices`, mail template keys `mandate_request` and `mandate_notice`.
- The mail worker renders the form (attachment) or fills in the mandate data (text) when it sends such a delivery.
- Permissions: `sepa:write` within the actor's scope; sending also needs `communication:write`.
