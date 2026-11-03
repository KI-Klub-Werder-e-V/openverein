# Arbeiten an OpenVerein

- Das Verhalten ist in `openspec/specs/` spezifiziert. Beginne jeden Slice mit `openspec new change <name>`; archiviere ihn nach dem Merge.
- Die UI ruft nur die öffentliche API unter `/api/v1` auf. Jede neue UI-Aktion braucht eine API-Route mit zod-Schema (sie erscheint automatisch in OpenAPI).
- Geld ist in ganzzahligen Cents. Rechtlich relevante Daten sind `date`-Spalten und werden als `YYYY-MM-DD`-Strings geführt.
- Bearbeite nie eine ausgelieferte Migration; lege eine neue nummerierte Datei in `migrations/` an.
- Schreibe Audit-Events in derselben Transaktion wie die Änderung (`src/server/audit.ts`).
- UI-Texte sind deutsch und verwenden „Du“. Styling verwendet ausschließlich Tokens aus `src/web/styles/tokens.css`.
- Befehle: `npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`.
