## Why

The office wants to find members by their e-mail address: who can be reached by e-mail, who has no address (letters, or asking for one), and whose address no longer works. Today the list can only be searched for an address, not filtered by whether one exists.

## What Changes

- A new facet "E-Mail-Adresse" in the member filter: egal, vorhanden, fehlt, unzustellbar.
  - **vorhanden:** an address that is not blocked.
  - **fehlt:** no address (empty or blank).
  - **unzustellbar:** an address blocked after a bounce or by hand (`suppression` with reason `bounce` or `manual`). Unsubscribing from newsletters does not count.

  The three options split the members without overlap.
- API: `GET /api/v1/members?email=present|missing|undeliverable`. Like every facet, it also applies to "select all hits", the CSV/PDF/vCard exports and saved views (URL parameter `email`).
- Rights: the facet needs the e-mail field (roles that hide it get 403 and do not see the facet); "unzustellbar" also needs read access to communication.

## Capabilities

### Modified Capabilities

- `members`: adds the requirement "Facette E-Mail-Adresse".

## Impact

- `src/shared/members.ts` (query schema), `src/server/routes/members.ts` (list filter), `src/web/components/MemberFilters.tsx`.
- No migration.
