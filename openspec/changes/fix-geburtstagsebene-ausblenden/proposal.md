## Why

Issue #142: In der Terminübersicht lässt sich die Geburtstagsebene einschalten, aber nicht wieder ausschalten. Die Checkbox wechselt, die Anzeige bleibt. Ursache: Die abgeschaltete Abfrage behält ihre geladenen Daten im Cache, und die Ansicht zeigt diese weiter an.

## What Changes

- Die Terminübersicht zeigt Geburtstage nur, solange der Schalter aktiv ist.
- Neues Szenario und E2E-Test für das Ausschalten.

## Capabilities

### Modified Capabilities
- `events`: Kalenderansichten – Geburtstagsebene ist ein echter Schalter.

## Impact

`src/web/pages/Events.tsx`, `e2e/04-events.spec.ts`. Keine API-, Migrations- oder Datenänderung.
