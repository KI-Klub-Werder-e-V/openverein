## Context

Invoices and donation receipts already go out by e-mail with a PDF, with a print list for letters (`/invoices/send-mail`, `/donation-receipts/send`, `mergeLetters`). The mandate form follows the same pattern.

## Decisions

- **Render on demand, store nothing.** Unlike an invoice, the form is not a legal document of the club. It is rendered when it is downloaded, printed or mailed (by the worker, right before sending), so it always shows the current address and club data.
- **No reference on the form.** The reference is assigned when the signed mandate is recorded, and the member learns it with the pre-notification (decided in #143).
- **No IBAN on the form**, not even the current one: a changed account is the reason for most requests, and an IBAN does not belong in an e-mail attachment.
- **Pre-filled account holder:** the holder of the member's current mandate (active or awaiting evidence) if there is one, otherwise the member. Both can be corrected by hand.
- **Message kind `mandate_forms`.** The worker attaches the form for deliveries of such messages. One delivery per member, one message per request.
- **A double click does not send twice:** members with a mandate request still queued or sending are skipped (advisory lock per club, as for invoices).
- **Notice in the mail text, not as an attachment.** The data is short and the member should see it at once; the letter PDF is for those who get post. The IBAN is masked as everywhere else for people without the IBAN permission, so the full IBAN never travels by e-mail. Members without a current mandate (active or awaiting the signed copy) are left out and named in the result.
- **One route shape for both actions** (`/mandate-forms/…`, `/mandate-notices/…`), registered from one table in `routes/sepa.ts`.
- **Audit `mandate.requested` and `mandate.notified`** per member with the channel (`email`, `letter`, `pdf`). It shows in the member's history. No new mandate status.

## Risks

- Members without a postal address get a form with an empty address block. They are still listed, and the print list names the reason when there is no e-mail address.
