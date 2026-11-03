# Testschulden

Schutzprüfungen, die Review-Fixes ohne eigenen Test eingeführt haben, und die Tests, die sie jetzt abdecken. Jeder Test
wurde gegen den Code vor seinem Fix ausgeführt und schlug dort fehl (wie, steht in jeder Zeile). Schutzprüfungen in der
Datenbank werden gegen den alten Stand geprüft, indem die neueren Migrationsdateien weggelassen werden: `tests/global-setup.ts`
baut die Testdatenbank bei jedem Lauf aus den Migrationen neu auf; sie vor einem Lauf von Hand zu ändern, beweist also nichts.

Führe die Code-Tests mit `npx vitest run tests/testDebt.test.ts` aus, die Betriebs-Roundtrips mit
`scripts/ovctl-roundtrip.sh` (Docker; auch in der CI, Workflow "ovctl round trips").

Test-Namen in Anführungszeichen sind die Original-Titel aus den Testdateien und bleiben deshalb englisch.

| Gruppe / PR | Schutzprüfung | Test | Schlägt mit dem alten Code fehl |
|---|---|---|---|
| G8 / #103 | Job-Lease: Ein zurückgeholter Lauf speichert kein Ergebnis | `testDebt` "job lease" (ein Test-Trigger holt den Job bei seinem ersten Fortschritt zurück) | ja: `worker.ts` und `fullJob.ts` von vor #103 speichern den Export |
| G8 / #103, #113 | Export vs. Löschung | `testDebt` "export vs erasure" (eine Löschung mit alter Startzeit wird während des Exports festgeschrieben) | ja, sowohl ohne die Schutzprüfung (vor #103) als auch mit der Zeitstempelprüfung aus #103 |
| G8 / #103 | Periodensperre zählt stornierte, nie gebuchte Zahlungen | `testDebt` "period lock" (`unpostedPayments`) | ja: `ledger/service.ts` von vor #103 zählt 0 |
| G9 / #104 | Wiederholung eines Massenjobs liefert das gespeicherte Ergebnis | `testDebt` "bulk job" | ja: `bulkJob.ts` von vor #104 wendet die Änderung erneut an |
| G9 / #104 | Umfang der Massenaktion wird unter Sperre bestimmt | `testDebt` "bulk scope" (eine Mitgliedschaft wird in einer Transaktion beendet, die während der Massenaktion offen ist) | ja: `bulk.ts` von vor #104 nimmt das Mitglied auf |
| G10 / #105 | Auslagenerstattung mit Datum in der Zukunft wird nicht genehmigt | `testDebt` "expense claim" | ja: die Genehmigung geht ohne die Prüfung durch |
| G10 / #105 | Eine Einladung, wenn zwei gleichzeitig eintreffen | `testDebt` "assembly" (ein Test-Trigger hält die erste Einladung an) | ja: beide werden versendet |
| G10 / #105 | Abrechnung der Arbeitsstunden wartet auf Stunden, die gerade erfasst werden | `testDebt` "work hours" | ja: `workHours.ts` von vor #105 berechnet die fehlenden Stunden |
| G12 / #107 | Vollexport ohne die abstimmende Person einer Umfrage | `testDebt` "poll answers" | ja: `member_id` wird exportiert |
| G12 / #107 | Kassenbericht trägt das Demo-Wasserzeichen | `testDebt` "treasurer report" (Farbe des Wasserzeichens in den Content-Streams) | ja: `report-pdf.ts` von vor #107 hat keines |
| G17 / #113 | Trigger für archivierte Personen sperrt erst, dann liest er | `testDebt` "archived person" (eine Tabelle mit dem Trigger und ohne Fremdschlüssel) | ja: ohne Migration 0071 (der Trigger aus 0064) geht das Insert durch. (Eine erste Prüfung ergab etwas anderes: Sie änderte die Testdatenbank, die `tests/global-setup.ts` bei jedem Lauf aus allen Migrationen neu aufbaut. Alte Datenbankstände werden geprüft, indem die neueren Migrationsdateien weggelassen werden.) |
| G9 / #104, G17 / #113 | `ovctl restore` löscht nie sein eigenes Ziel (Backup-Ordner als `./backups/` geschrieben) | `scripts/ovctl-roundtrip.sh`, Teil restore | ja: `ovctl` von vor #113 löscht das Ziel und bricht an der gelöschten Datenbank ab |
| G11 / #106 | Fehlgeschlagenes `ovctl update` rollt Code und Daten zurück | `scripts/ovctl-roundtrip.sh`, Teil update (ein defektes Release wird auf den origin des Klons gepusht) | ja: `ovctl` von vor #106 gibt die Befehle nur aus (HEAD bleibt auf dem defekten Release) |
| G9 / #104 | Backup und Wiederherstellung halten Datenbank und Dateien zusammen | `scripts/ovctl-roundtrip.sh` (Vereinsname und eine Markierungsdatei werden wiederhergestellt) | der erste Live-Lauf; es gab keinen früheren Test, der hätte fehlschlagen können |

Nicht durch einen Test abgedeckt:

- Die Prüfung auf ein Datum in der Zukunft beim Einreichen von Auslagen im Portal (`POST /portal/expenses`): Die
  Genehmigungsprüfung oben deckt den Geldfluss ab; die Prüfung beim Einreichen ist derselbe Vergleich.
- Streamende Exporte über 4 GB (verschoben, siehe decisions.md).

## Zweiter Review-Durchgang (Codex) für Gruppen, die claude-counsel geprüft hat

| Gruppe | Befund | Test | Schlägt mit dem alten Code fehl |
|---|---|---|---|
| G6 | Idempotente Wiederholung braucht das heute gültige Recht | `g6Second` "replays … only while the caller still has the right" | ja |
| G6 | Eine anonymisierte Person bleibt endgültig | `g6Second` "keeps an anonymised person final" | ja (ohne 0072) |
| G6 | Eine fehlgeschlagene Wiederholung von Löschungen stoppt den Start | `g6Second` "does not start …" | ja |
| G6 | Legal Hold vs. Anonymisierung | `g6Second` "refuses a legal hold …" | ja |
| G6 | Spendensphäre aus ihrem Ertragskonto; keine Bestätigung für wirtschaftliche Einnahmen | `g6Second` "books a donation in the sphere …" | ja |
| G6 | Spenden werden nie gelöscht | `g6Second` "never deletes a donation" | ja (ohne 0072) |
| G6 | Stornobuchungen brauchen einen Idempotenzschlüssel; DATEV-Exporte nur anhängbar | `g6Second` "needs an idempotency key …" | ja |
| G6 | Art. 15 umfasst jede personenbezogene Tabelle und die gespeicherten Dateien | `g6Second` "puts every person-linked table …" | ja |
| G13 | Nettopreis mit einer Menge, die die Positionssumme verändert, wird abgelehnt | `g13Second` "refuses a net price …" | ja |
| G13 | Gutschriften bekommen keinen Standardtext „bitte zahlen“ | `g13Second` "gives a credit note …" | ja |
| G13 | Stornierte Mahngebühr wird in keinem Brief gefordert | `fees` "proposes and applies dunning …" (`feeCents`) | ja |
| G13 | Langer SEPA-Verwendungszweck behält die Rechnungsnummer | `g13Second` "keeps the invoice number …" | ja |
| G13 | Schlusstext in der XRechnung | `g13Second` "puts the closing text …" | ja |
| G13 | Zahler ohne Mitgliedschaft sieht die Haushaltsrechnung (Verbot gewinnt) | `portalVerify` "Codex review G13 …" | ja |
| G13 | Mail zur Auslagenentscheidung wird in der Transaktion der Entscheidung eingereiht | `g13Second` "queues the expense decision mail …" | ja |
| G14 | Aufgaben für API-Schlüssel gesperrt | `g14Second` "keeps tasks away from API keys" | ja |
| G14 | Bearbeitung einer Aufgabe wird gegen die gesperrte Zeile geprüft | `g14Second` "checks a task edit …" | ja |
| G14 | Keine Bankbuchung in der Zukunft; keine Stornobuchung vor ihrem Original | `g14Second` "does not book a bank movement …" | ja |
| G14 | Recht zum Aufheben einer Zuordnung folgt dem Zustand des Umsatzes | `g14Second` "lets a treasurer without invoice rights …" | ja |
| G14 | Angebotsentwürfe werden gelöscht, exportiert, keine Umwandlung nach Anonymisierung | `g14Second` "erases offer drafts …" | ja |
| G14 | Keine Steuer auf ein stillgelegtes Steuerkonto | `g14Second` "posts no tax to a retired tax account" | ja |
| G14 | Glückwünsche nur bei bevorzugtem Kanal E-Mail | `g14Second` "sends no greeting mail …" | ja |
| G14 | Geplante Vorschau wird nach einem vorübergehenden Fehler wiederholt | `g14Second` "gives the month back …" | ja |
| G14 | Enddatum des Steuersatzes unter der Journalsperre | keiner | Nicht getestet: Eine Buchung müsste zwischen ihrer Satzprüfung und ihrem Insert anhalten, und der Code hat dafür keinen Haken. Der Fix ist derselbe `lockJournal`, den jede Buchung zuerst nimmt. |
| G15 | Bereinigung temporärer Dateien prüft die gesperrte Zeile erneut | `g15Second` "does not expire a temporary file …" | ja |
| G15 | Zusage prüft und berechnet anhand des gesperrten Termins | `g15Second` "charges the price the event has …" | ja |
| G15 | Kinderpreis braucht einen regulären Preis und liegt nicht darüber (0073) | `g15Second` "refuses a child price …" | ja (Migration herausgenommen) |
| G15 | Freigegebener Lauf aktiviert keine Mandatsänderung erneut, die ein später eingereichter Lauf trägt | `g15Second` "does not re-arm an amendment …" | ja |
| G15 | Import sperrt zugeordnete Zeilen vor der Planprüfung | `g15Second` "does not overwrite a member edit …" | ja |
| G15 | Portal-Codes, Fehlversuche und Sperre pro Verein | `g15Second` "accepts a portal code only at the club …" | ja |
| G15 | ICS-Eintrag mit unlesbarem DTEND/DURATION wird übersprungen | `g15Second` "skips a calendar entry …" | ja |
| G15 | Demo-Reset für jede Instanz sichtbar (Advisory Lock als Lease) | `g15Second` "tells every instance …" | ja |
| G17 | IPv6-Formen, die eine IPv4-Adresse tragen (kompatibel, 6to4, Teredo), für Webhooks blockiert | `g17Second` "blocks IPv6 forms …" | ja. Die gemappte Form (`::ffff:7f00:1`) war bereits blockiert: Die BlockList von Node 24 prüft gemappte Adressen gegen die IPv4-Regeln; der Test hält das fest. |
| G17 | Alte Überweisungsrechnung wird nach einem Wechsel zur Lastschrift nicht eingezogen | `g17Second` "does not debit an invoice …" | nein: schon vor dem Review abgesichert (die Rechnung muss dieses Mandat angekündigt haben, `no_prenotification`); der Test hält das fest. |
| G17 | Idempotente Wiederholung nur bei unveränderten Rechten (0080) | `g17Second` "replays a stored money answer …" | ja (Migration herausgenommen) |
| G17 | Art. 15: IBANs im Klartext, Auslagenbelege, alle Dateiversionen; keine Stimmabgaben | `g17Second` "gives the person their stored data …" | ja |
| G17 | Abrechnung der Arbeitsstunden unter Sperren neu berechnet | `g17Second` "settles work hours …" | ja |
| G17 | Wiederherstellung behält Löschungen und Bereinigungen, die nur in der Datenbank erfasst sind | `scripts/ovctl-roundtrip.sh` (Person "Wiederkehr") | nein: Mit dem alten ovctl besteht das Szenario ebenfalls, weil das Sicherheitsbackup vor jeder Wiederherstellung die App neu startet und deren Wiederholung beim Start die fehlende Zeile in die Datei schreibt. Das Zusammenführen in der Datenbank deckt einen Start ab, der die Datei nicht reparieren kann (schreibgeschütztes oder volles Volume); das lässt sich im Roundtrip nicht herstellen, ohne die App kaputtzumachen. |
| G18 | Betreiber-Export unter Vereins- und Löschsperre geprüft und erfasst | `g18Second` "records an operator export before an erasure …" | ja |
| G18 | Alte Anwesenheitsmarkierungen ohne Eigentümer bleiben unbeansprucht, bis jemand sie übernimmt (zusammengeführt, Konflikte bleiben erhalten) | `offlineQueue` "leaves old ownerless marks unclaimed …" | ja |
| G18 | Das Senden ist an den Benutzer gebunden, der es gestartet hat, und stoppt, wenn sich jemand anderes anmeldet | `offlineQueue` "stops sending when another person signs in …" | ja |
| G16 | OIDC-Anfragen (Discovery, Token, Keys) nur an öffentliche Adressen, gepinnt | `oidc` "fetches no issuer in a private network" | ja. Die Token- und Keys-Endpunkte verwenden denselben abgesicherten Fetch (an der Konfiguration gesetzt). Ein öffentlicher Issuer, der einen privaten Token-Endpunkt nennt, lässt sich im Test nicht aufsetzen (dafür braucht es eine öffentliche Adresse). |
| G16 | OIDC-Anmeldung über (Issuer, Subject); E-Mail nur für die erste Verknüpfung (0074) | `oidc` "follows the provider identity …" | ja |
| G16 | Löschabsicht für den Verein wird vor dem Löschen geschrieben (fsync); bei Rollback zurückgezogen | `g16Second` "writes the deletion intent …", "withdraws the intent …" | ja |
| G16 | Antragsbestätigung pro Verein gezählt | `applications` "Codex review G16 …" | ja |
| G16 | Offline-Anwesenheitsmarkierung nach einer neueren Korrektur abgelehnt (409) | `g16Second` "refuses an offline attendance mark …" | ja |
| G16 | Anordnung der Übersicht: immer nur ein Speichervorgang | keiner | Nicht getestet: Die Race Condition sind zwei Klicks innerhalb eines Speicher-Roundtrips im Browser; die Bedienelemente sind gesperrt, solange gespeichert wird, was ein Unit-Test nur wiederholen würde. |
| G16 | Betreiber-Audit mit echten Vorher-Werten | `g16Second` "records the real before-values …" | ja |
| Agentenzugang (#122-#124) | Portal-Anmeldungen und Mitglieder-Tokens enden mit der Adresse (0092) | `agentSecond` "P1: ends portal sign-ins …" | ja |
| Agentenzugang | Auf Module beschränkte Tokens außerhalb ihrer Module gesperrt; API-Schlüssel brauchen eine Person | `agentSecond` "keeps a module-limited token …" | ja |
| Agentenzugang | Keine gespeicherte Antwort bei gruppenbeschränkten Berechtigungen | `agentSecond` "does not replay …" | ja |
| Agentenzugang | MCP-Werkzeugliste aus Routen-Metadaten; DELETE ohne Body | `agentSecond` "lists tools by what the route needs …" | ja |
| Agentenzugang | /mcp-Anfragen werden jeweils einmal gezählt | `agentMcp` "takes one message per request …" | ja |
| Agentenzugang | Jedes gültige Token wird aufgelistet | `agentSecond` "always lists every live token …" | ja |
| Agentenzugang | CLI-Dateien 0600, kein Überschreiben | `agentSecond` "saves CLI downloads …" | ja |
| Agentenzugang | Jobs prüfen Token und Rechte in der Transaktion der Änderung erneut | keiner | Nicht getestet: Der Widerruf oder die Rollenänderung müsste zwischen dem Start des Jobs und seinem Schreibvorgang eintreffen, und der Worker hat keinen Haltepunkt für einen Test. Die Prüfung läuft in `owned()`, unter den Zeilensperren von Job und Token. |
| Agentenzugang | Kein Token in den Einrichtungsbefehlen | keiner | Nur UI-Text (AgentTokens.tsx); es wird kein Geheimnis mehr eingesetzt, wie ein Blick in die Datei zeigt. |
