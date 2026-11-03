# ADR 0001: Stack für das erste Release

Datum: 2026-10-24. Status: angenommen.

## Kontext

Deliverable A (`saaskiller/easyverein/deliverables/A-architecture-plan.md`, liegt außerhalb dieses Repositorys) schlägt Node 24, NestJS auf Fastify, React 19 + Vite mit TanStack Router/Query/Table, PostgreSQL 18 mit Kysely, RLS, pg-boss, Better Auth, Typst, Caddy und eine `ovctl`-CLI vor. Der Eigentümer hat sich überall dort die einfachste Lösung gewünscht, wo A für ein erstes Release zu viel baut.

## Entscheidung

| Bereich | A sagt | Wir machen | Warum |
|---|---|---|---|
| Backend-Framework | NestJS auf Fastify | Schlichtes Fastify 5 mit `fastify-type-provider-zod` | Zod-Schemas prüfen Eingaben, erzeugen OpenAPI und werden mit der Web-App geteilt. Kein DI-Container nötig. |
| Build | kompiliertes TypeScript | Node 24 führt `.ts` direkt aus (Type Stripping, `erasableSyntaxOnly`) | Kein Build-Schritt für den Server; Vite baut nur die Web-App. |
| Auth | Better Auth | Eigene Session-Authentifizierung (argon2id, gehashte Session-Tokens, HttpOnly-Cookie) | ~150 Zeilen, vollständig getestet. Better Auth neu prüfen, sobald TOTP, Passkeys oder OIDC gebaut werden. |
| Mandantenfähigkeit | `organization_id` + RLS | `organization_id` in jeder Zeile, im Code gefiltert, ein Verein pro Installation | RLS kommt mit dem verwalteten Multi-Tenant-Hosting (A, Phase 2). |
| Router | TanStack Router | React Router (deklarativer Modus) | Weniger bewegliche Teile, keine Codegenerierung. |
| Styling | nicht festgelegt | Schlichtes CSS mit Design-Tokens | Eine Token-Datei, ein Stylesheet; kein Utility-Framework. |
| Jobs | pg-boss + Outbox | Kommt mit dem ersten Slice, der Hintergrundarbeit braucht | In Slice 0 läuft nichts im Hintergrund. |
| Proxy, Betrieb | Caddy + `ovctl` | Docker-Image + Compose; TLS über den Proxy des Betreibers | `ovctl` ist Betriebsarbeit nach dem MVP. |
| Mobil | nur PWA (A schließt native Apps aus) | Capacitor-Hülle um denselben Web-Build, gebaut von Codemagic | Vorgabe des Eigentümers; kein nativer Code über das hinaus, was Capacitor braucht. |

Von A übernommen: PostgreSQL 18 (`uuidv7()`), Kysely mit reinen Vorwärts-SQL-Migrationen, REST + OpenAPI 3.1, Fehler nach RFC 9457, ganzzahlige Cents, ein per Trigger erzwungenes, nur anhängbares Audit-Log, deutschsprachige Oberfläche zuerst.

## Konsequenzen

Spätere Slices fügen Abhängigkeiten nur hinzu, wenn ein Feature sie braucht, und halten jede Abweichung hier oder in einem neuen ADR fest.
