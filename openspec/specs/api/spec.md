# api Specification

## Purpose
Die Capability api umfasst die dokumentierte REST-API mit OpenAPI 3.1 und API-Tokens mit Geltungsbereich (B M34) sowie die übergreifende Regel, dass jede Aktion, die ein Mensch in der Oberfläche ausführen kann, auch über dieselbe öffentliche REST-API möglich ist, mit Fehlern nach RFC 9457, Cursor-Paginierung und Idempotenzschlüsseln bei Geldschreibvorgängen. Punkte, die B mit „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: API-Parität mit der Oberfläche
Das System MUSS (SHALL) jede Aktion, die einer menschlichen Nutzer:in zur Verfügung steht, als dokumentierten Endpunkt unter `/api/v1` bereitstellen, und Weboberfläche und Portal MÜSSEN ausschließlich diese öffentlichen Endpunkte verwenden, sodass die API konstruktionsbedingt vollständig ist.

#### Scenario: Keine privaten Endpunkte
- **WHEN** die Routenprüfung im CI die Netzwerkaufrufe der Oberfläche mit dem OpenAPI-Dokument vergleicht
- **THEN** schlägt sie bei jedem Aufruf eines nicht dokumentierten Endpunkts fehl

### Requirement: OpenAPI-Dokument und Dokumentation
Das System MUSS (SHALL) aus dem Code ein OpenAPI-3.1-Dokument unter `/api/v1/openapi.json` erzeugen und unter `/api/docs` eine gerenderte Referenzdokumentation ohne Anmeldung ausliefern.

#### Scenario: Öffentliche Dokumentation
- **WHEN** eine anonyme Besucher:in `/api/docs` öffnet
- **THEN** wird die gerenderte API-Referenz angezeigt

### Requirement: Darstellungskonventionen
Das System MUSS (SHALL) JSON mit Feldern in `snake_case`, Datumsangaben nach ISO 8601 und Beträge als ganzzahlige Cent mit `currency: "EUR"` verwenden.

#### Scenario: Geld in Cent
- **WHEN** eine Rechnung über 120,50 EUR gelesen wird
- **THEN** wird der Betrag als `12050` mit `currency: "EUR"` zurückgegeben

### Requirement: Cursor-Paginierung und Änderungsfilter
Das System MUSS (SHALL) jede Sammlung mit einem opaken Cursor paginieren (`?cursor=&limit=`, Limit höchstens 200) und bei jeder Sammlung einen Filter `updated_since` akzeptieren.

#### Scenario: Limit begrenzt
- **WHEN** ein Client `limit=500` anfordert
- **THEN** werden höchstens 200 Einträge mit einem Cursor auf die nächste Seite zurückgegeben

#### Scenario: Inkrementelle Synchronisierung
- **WHEN** ein Client Mitglieder mit `updated_since=2026-10-01T00:00:00Z` auflistet
- **THEN** werden nur Mitglieder zurückgegeben, die seitdem geändert wurden

### Requirement: Problem Details nach RFC 9457
Das System MUSS (SHALL) jeden Fehler als Problem-Dokument nach RFC 9457 zurückgeben, mit einer stabilen `type`-URI, einem deutschen oder englischen `title` je nach Anfragesprache und bei Validierungsfehlern den fehlerhaften Feldern.

#### Scenario: Validierungsfehler
- **WHEN** ein Mitglied mit ungültiger E-Mail-Adresse angelegt wird
- **THEN** lautet die Antwort 400 oder 422 mit `application/problem+json` und nennt das Feld

### Requirement: Idempotenzschlüssel bei Geldschreibvorgängen
Das System MUSS (SHALL) bei jedem POST, der Geldobjekte anlegt (Rechnungen, Buchen eines Beitragslaufs, Einzugsläufe, Zuordnungen, Spendenbescheinigungen), einen `Idempotency-Key`-Header verlangen, Schlüssel und Antwort 24 Stunden speichern und bei wiederholtem Schlüssel die gespeicherte Antwort zurückgeben, statt doppelt zu handeln.

#### Scenario: Wiederholung nach Zeitüberschreitung
- **WHEN** ein Client das Buchen eines Beitragslaufs mit demselben Idempotenzschlüssel wiederholt
- **THEN** wird die ursprüngliche Antwort zurückgegeben, und es entsteht kein zweiter Satz Rechnungen

#### Scenario: Fehlender Schlüssel
- **WHEN** eine Rechnung ohne `Idempotency-Key`-Header angelegt wird
- **THEN** wird die Anfrage mit einem Problem-Dokument abgelehnt

### Requirement: Optimistische Nebenläufigkeitskontrolle
Das System MUSS (SHALL) bei Ressourcen ein `ETag` zurückgeben und bei PATCH `If-Match` verlangen; veraltete Schreibvorgänge werden mit 412 abgelehnt.

#### Scenario: Gleichzeitige Bearbeitung
- **WHEN** zwei Admins dasselbe Mitglied bearbeiten und die zweite ein veraltetes `If-Match` sendet
- **THEN** wird der zweite Schreibvorgang mit 412 abgelehnt

### Requirement: Lange Vorgänge als Jobs
Das System MUSS (SHALL) lange Vorgänge (Beitragsläufe, Exporte, Importe, Massenaktionen, Berichte) mit `202 Accepted` und einer Job-Ressource beantworten, deren Fortschritt über `GET /jobs/{id}` und über Server-Sent Events lesbar ist.

#### Scenario: Export-Job
- **WHEN** ein Client einen Export von 5.000 Zeilen startet
- **THEN** erhält er 202 mit einer Job-ID und später einen Link zur Ergebnisdatei

### Requirement: API-Tokens mit Geltungsbereich
Das System MUSS (SHALL) berechtigten Nutzer:innen erlauben, API-Tokens mit Name, Rollenzuweisung (jede Rolle, auch mit Geltungsbereich), optionalem Ablauf von höchstens einem Jahr, optionaler IP-Allowlist und Angabe der letzten Nutzung anzulegen; das Token MUSS einmalig angezeigt und nur als Hash gespeichert werden und kann rotiert und widerrufen werden; ein Token DARF NICHT Finanz-Schreibrechte halten, sofern die ausstellende Admin nicht TOTP aktiviert hat.

#### Scenario: Einmalige Anzeige
- **WHEN** ein Token angelegt wird
- **THEN** wird sein Geheimnis einmal angezeigt, danach ist nur noch sein Präfix sichtbar

#### Scenario: Widerrufenes Token
- **WHEN** ein widerrufenes Token verwendet wird
- **THEN** wird die Anfrage mit 401 beantwortet

#### Scenario: Token mit Geltungsbereich
- **WHEN** ein Token, das an die Abteilungsleitung für „Tennis“ gebunden ist, Mitglieder auflistet
- **THEN** werden nur Mitglieder im Geltungsbereich Tennis zurückgegeben

### Requirement: Ratenbegrenzung
Das System MUSS (SHALL) die API-Nutzung standardmäßig auf 600 Anfragen pro Minute und Token begrenzen, mit strengeren Grenzen für Authentifizierungs- und öffentliche Antrags-Endpunkte, und überzählige Anfragen mit 429 und einem `Retry-After`-Header beantworten.

#### Scenario: Grenze überschritten
- **WHEN** ein Token seine 601. Anfrage innerhalb einer Minute sendet
- **THEN** lautet die Antwort 429 mit `Retry-After`

### Requirement: API-Schreibvorgänge im Audit-Protokoll
Das System MUSS (SHALL) jeden API-Schreibvorgang mit dem Token-Namen im Audit-Protokoll erfassen.

#### Scenario: Schreibvorgang per Token protokolliert
- **WHEN** das Token der Website-Integration eine Person anlegt
- **THEN** zeigt das Audit-Protokoll die Anlage mit dem Namen dieses Tokens

### Requirement: Tokens können keine Tokens erzeugen
Das System MUSS (SHALL) nur angemeldeten Nutzer:innen (nicht API-Tokens) das Anlegen von API-Tokens erlauben, sodass ein geleakter Schlüssel keine weiteren Schlüssel erzeugen kann.

#### Scenario: Token versucht, ein Token anzulegen
- **WHEN** eine mit einem API-Token authentifizierte Anfrage `POST /api/v1/api-tokens` aufruft
- **THEN** antwortet die API mit 403 und nennt die fehlende Berechtigung

### Requirement: Fehlgeschlagene Versuche geben den Idempotenzschlüssel frei
Das System MUSS (SHALL) unter einem Idempotenzschlüssel nur erfolgreiche Antworten speichern und MUSS erlauben, eine fehlgeschlagene Anfrage mit demselben Schlüssel zu wiederholen.

#### Scenario: Wiederholung nach Validierungsfehler
- **WHEN** eine Rechnungsanfrage mit Schlüssel K an der Validierung scheitert und korrigiert mit Schlüssel K erneut gesendet wird
- **THEN** wird die Rechnung angelegt

### Requirement: Veraltete Mitgliedsänderungen werden verweigert
Das System MUSS (SHALL) eine Mitgliedsänderung mit 412 verweigern, wenn die Anfrage eine If-Match-Version trägt, die nicht mehr zum gespeicherten Datensatz passt.

#### Scenario: Zwei Bearbeitende
- **WHEN** eine Admin ein Mitglied speichert und eine zweite Admin danach eine Änderung auf Basis der zuvor gelesenen Version speichert
- **THEN** wird die zweite Änderung mit 412 verweigert, und der Datensatz behält die erste Änderung

### Requirement: Signierte Webhooks aus einer Outbox
Das System MUSS (SHALL) für jede im Audit-Protokoll erfasste Änderung eines abonnierten Themas in derselben Transaktion eine Webhook-Zustellung einreihen, sie mit HMAC-Signatur senden und fehlgeschlagene Zustellungen mit Backoff wiederholen.

#### Scenario: Empfänger nicht erreichbar
- **WHEN** der Empfänger auf eine member.created-Zustellung mit 500 antwortet
- **THEN** bleibt die Zustellung mit gezähltem Versuch in der Warteschlange, und der nächste Versuch nach dem Backoff ist signiert und wird bei 2xx als zugestellt markiert

### Requirement: Persönliche Zugriffstokens für Admin-Zugänge
Das System MUSS (SHALL) einem angemeldeten Admin-Zugang erlauben, nach einer erneuten Bestätigung (Step-up) persönliche Tokens anzulegen. Ein Token handelt als dieser Zugang mit dessen aktuellen Rollenzuweisungen, eingeschränkt auf die Stufe des Tokens (Lesen oder Lesen und Schreiben) und eine optionale Modulliste. Es MUSS seine Wirkung verlieren, wenn der Zugang gesperrt wird, und DARF eine Step-up-Prüfung niemals bestehen.

#### Scenario: Token folgt der Rolle
- **WHEN** das persönliche Token einer Kassenwart:in verwendet wird, nachdem sie das Recht auf das Hauptbuch verloren hat
- **THEN** antworten die Hauptbuch-Routen für dieses Token mit 403

#### Scenario: Nur-Lese-Token
- **WHEN** ein persönliches Nur-Lese-Token eine POST-Route aufruft, die der Zugang selbst aufrufen darf
- **THEN** wird der Aufruf mit 403 verweigert

### Requirement: Persönliche Zugriffstokens für Mitglieder
Das System MUSS (SHALL) einem im Portal angemeldeten Mitglied erlauben, Tokens anzulegen, die als diese Portal-Anmeldung handeln (gleicher Verein, gleiche Adresse, gleiche Portal-Schalter). Ein Nur-Lese-Token MUSS auf GET beschränkt sein.

#### Scenario: Agent eines Mitglieds liest eigene Rechnungen
- **WHEN** ein Mitglieds-Token `GET /api/v1/portal/invoices` aufruft
- **THEN** erhält es genau die Rechnungen, die das Portal diesem Mitglied zeigt

#### Scenario: Mitglieds-Token an einer Admin-Route
- **WHEN** ein Mitglieds-Token `GET /api/v1/members` aufruft
- **THEN** wird der Aufruf mit 401 verweigert

### Requirement: Agent-Aufrufprotokoll für die Inhaber:in
Das System MUSS (SHALL) jeden Aufruf mit einem persönlichen Token protokollieren (Operation als Methode und Routenmuster, Kanal, Status, Zeit; kein Body, keine Query, keine Kennungen, keine IP), der Inhaber:in die letzten Aufrufe je Token zeigen und Einträge nach 90 Tagen löschen.

#### Scenario: Inhaber:in sieht die Aufrufe
- **WHEN** der Agent eines Mitglieds dessen Rechnungen zweimal gelesen hat
- **THEN** listet die Agent-Seite des Mitglieds zwei Aufrufe von `GET /portal/invoices` mit Status 200

### Requirement: Ratenbegrenzung pro Token
Das System MUSS (SHALL) jedes persönliche Token auf 120 Aufrufe pro Minute und 2000 pro Stunde begrenzen und darüber mit 429 und `Retry-After` antworten.

#### Scenario: Lastspitze
- **WHEN** ein Token seinen 121. Aufruf innerhalb einer Minute macht
- **THEN** erhält der Aufruf 429 mit `Retry-After`

### Requirement: Stabile Operation-IDs
Das System MUSS (SHALL) jeder dokumentierten Operation eine eindeutige, stabile `operationId` geben.

#### Scenario: Eindeutige IDs
- **WHEN** das OpenAPI-Dokument erzeugt wird
- **THEN** teilen sich keine zwei Operationen eine `operationId`

### Requirement: Entfernter MCP-Server
Das System MUSS (SHALL) unter `/mcp` einen zustandslosen MCP-Server (Streamable HTTP, nur POST) ausliefern, dessen Tools die API-Operationen sind, die das Token der aufrufenden Stelle aufrufen darf. Ein Tool-Aufruf MUSS als Aufruf derselben API-Route mit demselben Token ausgeführt werden.

#### Scenario: Tool entspricht REST
- **WHEN** ein Agent das MCP-Tool für `GET /members` aufruft
- **THEN** enthält das Tool-Ergebnis dieselben Daten, die der REST-Aufruf für dieses Token liefert

#### Scenario: Tool-Liste folgt den Rechten
- **WHEN** ein Mitglieds-Token die Tools auflistet
- **THEN** werden nur Portal-Operationen aufgelistet

### Requirement: Kommandozeilen-Client
Das System MUSS (SHALL) unter `/ov.mjs` eine CLI ohne Abhängigkeiten ausliefern, die jede Operation über ihre `operationId` mit einem Token aus `OV_TOKEN` aufruft.

#### Scenario: CLI-Aufruf
- **WHEN** `OV_TOKEN=… node ov.mjs getPortalInvoices` gegen die Instanz läuft
- **THEN** gibt sie die JSON-Antwort dieser Operation aus

### Requirement: OAuth 2.1 für MCP-Clients
Das System MUSS (SHALL) MCP-Clients die Verbindung über OAuth 2.1 erlauben, mit dynamischer Client-Registrierung, PKCE S256, einer Zustimmungsseite für die angemeldete Person und einmalig verwendbaren Autorisierungscodes. Das ausgestellte Token MUSS nur unter `/mcp` gültig sein.

#### Scenario: Code zweimal verwendet
- **WHEN** ein Client denselben Autorisierungscode ein zweites Mal einlöst
- **THEN** antwortet der Token-Endpunkt mit `invalid_grant`

#### Scenario: OAuth-Token an REST
- **WHEN** ein per OAuth ausgestelltes Token `/api/v1/members` direkt aufruft
- **THEN** wird der Aufruf mit 401 verweigert

