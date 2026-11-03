# Format des Gesamtexports (Schemaversion 2)

Admins erstellen den Export unter Einstellungen → Gesamtexport (`POST /api/v1/exports/full`, frischer zweiter Faktor nötig). Er läuft als Hintergrundauftrag: Der Aufruf antwortet mit 202 und dem Auftrag, `GET /api/v1/jobs/:id` meldet den Fortschritt und, wenn er fertig ist, `resultFileId`. Der Export wird 7 Tage lang verschlüsselt gespeichert (und gelöscht, wenn eine Person anonymisiert wird). Auch zum Herunterladen brauchst Du einen frischen zweiten Faktor (`POST /api/v1/exports/full/:id/link` liefert einen Link, der 60 Sekunden gilt). Jede Erstellung und jeder Download steht im Änderungsprotokoll. Der ganze Export wird aus einem einzigen, in sich stimmigen Datenbankstand gelesen.

## Aufbau

```
manifest.json
data/<table>.jsonl   ein JSON-Objekt pro Zeile, eine Zeile pro Datensatz
data/<table>.csv     dieselben Datensätze für Tabellenkalkulationen (UTF-8 mit BOM, durch ";" getrennt, formelsicher)
files/<sha256>       jede gespeicherte Datei einmal, benannt nach ihrem SHA-256 (Namen und Besitzer stehen in data/file.jsonl)
```

## manifest.json

| Schlüssel | Bedeutung |
|---|---|
| `schemaVersion` | `"2"`; wird erhöht, wenn sich dieses Dokument inkompatibel ändert (2: `invoice_einvoice.xml` ist das lesbare XML statt verschlüsselter Bytes) |
| `exportedAt` | ISO-Zeitstempel |
| `organizationId` | ID des exportierten Vereins |
| `databaseVersion` | Name der zuletzt angewendeten Migration (`migrations/NNNN_*.sql`) |
| `counts` | Datensätze je Tabelle |
| `missingFiles` | SHA-256 gespeicherter Dateien, die nicht lesbar waren (sollte leer sein) |
| `corruptFiles` | SHA-256 gespeicherter Dateien, deren Inhalt nicht mehr zu ihrem Hash passt (sollte leer sein) |
| `undecryptable` | Anzahl je `table.column` verschlüsselter Werte, die sich nicht entschlüsseln ließen (sollte leer sein; prüfe `DATA_KEY`) |
| `files` | SHA-256 jedes anderen Eintrags im ZIP, nach Pfad |

## Datensätze

- Tabellen und Spalten entsprechen der Datenbank beim Stand `databaseVersion` (siehe `migrations/`). Jede Tabelle mit `organization_id` wird mit den Datensätzen des Vereins exportiert; `receipt_line`, `donation_receipt_item`, `datev_export_entry`, `household_rule`, `assembly_item`, `assembly_attendance` und `poll_vote` über ihren übergeordneten Datensatz.
- Datumsangaben und Zeitstempel sind ISO-Strings. Binäre Spalten (gespeicherte PDFs, DATEV-ZIPs) stehen im JSONL als `{ "base64": "…" }` und fehlen im CSV.
- Verschlüsselte Spalten werden entschlüsselt unter dem Namen ohne `_encrypted` exportiert (zum Beispiel `sepa_mandate.iban`). IBAN-Änderungswünsche aus dem Portal stehen entschlüsselt in `change_request.old_value` / `new_value`. Die ausgestellte XRechnung ist `invoice_einvoice.xml` als Text (ihr `sha256` ist der Hash dieses Texts).
- Die CSV-Kopfzeilen kommen aus dem Schema, darum haben auch leere Tabellen ihre Kopfzeile.
- Antworten auf Umfragen (`poll_vote`) kommen ohne `member_id`: Der Vorstand sieht nur Zahlen, der Export auch.
- Nie exportiert werden: Sitzungen, Portal-Sitzungen, Anmeldecodes, Wiederherstellungscodes, Idempotenzschlüssel, Passwort-Hashes, Hashes von Einladungen und API-Token, TOTP-Geheimnisse, Hashes für verschlüsselte Suche (`*_hash`-Blind-Indizes).

## Zurückspielen

Einen Gesamtexport in eine leere Instanz zu importieren (Round Trip) ist noch nicht umgesetzt. Das Format behält Primärschlüssel und Verweise, damit das möglich wird.
