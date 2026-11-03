## Worum geht es?

<!-- Kurz: Was ändert dieser PR und warum? Verlinke zugehörige Issues, z. B. „Closes #123“. -->

## OpenSpec

<!-- Name des Changes in openspec/changes/, oder „nicht nötig“ bei reiner Doku/Tippfehlern. -->

## Checkliste

- [ ] `npm run typecheck` und `npm run lint` laufen ohne Fehler
- [ ] `npm test` ist grün; neue oder geänderte Logik hat Tests (bei UI-Abläufen auch `npm run test:e2e`)
- [ ] Verhaltensänderungen laufen über einen OpenSpec-Change (`openspec new change <name>`), der nach dem Merge archiviert wird
- [ ] Neue UI-Aktionen haben eine `/api/v1`-Route mit zod-Schema
- [ ] Datenbankänderungen sind eine neue nummerierte Datei in `migrations/`; keine ausgelieferte Migration wurde geändert
- [ ] Audit-Ereignisse werden in derselben Transaktion wie die Änderung geschrieben (`src/server/audit.ts`)
- [ ] Geld in ganzen Cent, rechtlich relevante Daten als `YYYY-MM-DD`
- [ ] Oberflächentexte sind deutsch und duzen; Styling nutzt nur Tokens aus `src/web/styles/tokens.css`
- [ ] Keine echten Mitgliederdaten in Code, Tests, Screenshots oder Logs

## Screenshots

<!-- Bei Änderungen an der Oberfläche: vorher/nachher. -->
