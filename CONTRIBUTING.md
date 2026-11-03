# Mitmachen bei OpenVerein

Schön, dass Du mithelfen willst! Diese Seite erklärt, wie Du OpenVerein lokal startest, wie wir arbeiten und worauf wir bei Pull Requests achten.

Sicherheitslücken bitte **nicht** als Issue melden, sondern wie in [SECURITY.md](SECURITY.md) beschrieben. Für alle Beiträge gilt unser [Verhaltenskodex](CODE_OF_CONDUCT.md).

## Einrichtung

Voraussetzungen: Node 24, Docker.

```sh
cp .env.example .env
npm install
npm run dev
```

`npm run dev` startet Postgres und Mailpit in Docker, spielt die Migrationen ein und startet die API auf http://localhost:3300 und die Web-App auf http://localhost:5173. Mails landen in Mailpit unter http://localhost:18025. Mit `npm run seed:demo` lädst Du den Demoverein in eine leere Instanz (Anmeldung: `demo@openverein.example` / `verein-demo-2026`).

## Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsumgebung starten |
| `npm run typecheck` | TypeScript prüfen |
| `npm run lint` | ESLint |
| `npm test` | Unit- und Integrationstests (braucht den Postgres-Container) |
| `npm run test:e2e` | End-to-End-Tests mit Playwright |
| `npm run validate:xrechnung` | Beispiel-E-Rechnungen durch den KoSIT-Validator (Java 17+ oder Docker) |

## Arbeitsweise mit OpenSpec

Das Verhalten von OpenVerein ist in `openspec/specs/` festgelegt, eine Spezifikation pro Fähigkeit. Jede Änderung am Verhalten läuft über einen OpenSpec-Change:

1. Change anlegen: `openspec new change <name>`
2. Vorschlag, Delta-Spezifikation und Aufgaben in `openspec/changes/<name>/` ausarbeiten.
3. Umsetzen, Tests schreiben, Pull Request öffnen.
4. Nach dem Merge den Change archivieren, damit `openspec/specs/` aktuell bleibt.

Reine Doku- oder Tippfehler-Korrekturen brauchen keinen Change.

## Regeln im Code

- **Nur über die API.** Die Oberfläche ruft ausschließlich die öffentliche `/api/v1` auf. Jede neue Aktion in der Oberfläche braucht eine API-Route mit zod-Schema; sie erscheint dann automatisch in OpenAPI.
- **Geld in Cent.** Beträge sind immer ganze Cent (Integer), nie Gleitkommazahlen.
- **Rechtlich relevante Daten als `date`.** Sie liegen in `date`-Spalten und werden als `YYYY-MM-DD`-Strings behandelt.
- **Migrationen nie nachträglich ändern.** Eine ausgelieferte Migration bleibt, wie sie ist; für Änderungen legst Du eine neue, fortlaufend nummerierte Datei in `migrations/` an.
- **Audit in derselben Transaktion.** Audit-Ereignisse werden in derselben Transaktion geschrieben wie die Änderung selbst (`src/server/audit.ts`).
- **Deutsche Oberfläche mit „Du“.** Alle Texte in der Oberfläche sind deutsch und duzen.
- **Nur Design-Tokens.** Styling verwendet ausschließlich die Tokens aus `src/web/styles/tokens.css`.

Mehr Hintergrund findest Du in `docs/adr/` (Architekturentscheidungen), `docs/decisions.md`, `PRODUCT.md` und `DESIGN.md`.

## Issues

- **Fehlerbericht:** Bitte mit Schritten zum Nachstellen, erwartetem und tatsächlichem Verhalten und Version oder Commit.
- **Funktionswunsch:** Beschreib das Problem aus Sicht des Vereins, nicht nur die Lösung.

Bitte keine echten Mitgliederdaten in Issues, Screenshots oder Logs posten.

## Pull Requests

Halte PRs klein und auf ein Thema beschränkt. Vor dem Öffnen:

- [ ] `npm run typecheck` und `npm run lint` laufen ohne Fehler
- [ ] `npm test` ist grün, neue oder geänderte Logik hat Tests (bei UI-Abläufen auch `npm run test:e2e`)
- [ ] Verhaltensänderungen haben einen OpenSpec-Change (`openspec new change <name>`)
- [ ] Neue UI-Aktionen haben eine `/api/v1`-Route mit zod-Schema
- [ ] Datenbankänderungen sind eine neue Migration; keine ausgelieferte Migration wurde geändert
- [ ] Audit-Ereignisse werden in derselben Transaktion geschrieben
- [ ] Geld in ganzen Cent, Daten als `YYYY-MM-DD`
- [ ] Oberflächentexte sind deutsch und duzen, Styling nutzt nur `tokens.css`

## Lizenz

OpenVerein steht unter der [AGPL-3.0](LICENSE). Mit Deinem Beitrag stimmst Du zu, dass er unter dieser Lizenz veröffentlicht wird.
