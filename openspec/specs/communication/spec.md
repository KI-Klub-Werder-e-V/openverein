# communication Specification

## Purpose
Die Capability communication umfasst Massen-E-Mails über das SMTP-Relay des Vereins mit Vorlagen, Platzhaltern, Anhängen, Zustellprotokoll und Sperrliste sowie den Briefkopf mit druckbaren PDF-Briefstapeln, aufgeteilt nach bevorzugtem Kanal (B M27, M28). Punkte, die B als „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet; alles andere ist MVP-Verhalten. Freie Serienbriefe und ein Layout-Editor sind Post-MVP (B P27) und hier nicht spezifiziert.
## Requirements
### Requirement: Empfängerauswahl mit Ausschlüssen
Das System MUSS (SHALL) Empfänger:innen aus einer gespeicherten Ansicht, aus Gruppen oder aus einer handverlesenen Liste übernehmen und vorab die Anzahl sowie die ausgeschlossenen Personen mit Grund anzeigen (keine E-Mail, abgemeldet, gesperrt, ehemaliges Mitglied).

#### Scenario: Ausschlüsse aufgelistet
- **WHEN** eine E-Mail an die Gruppe "Senioren" eine Person ohne E-Mail und eine Person auf der Sperrliste umfasst
- **THEN** listet die Vorschau beide als ausgeschlossen mit ihren Gründen auf

### Requirement: Editor mit berechtigungsbewussten Platzhaltern
Das System MUSS (SHALL) einen Rich-Text-Editor mit Platzhaltern (zum Beispiel `{{person.first_name}}`, `{{member.number}}`, `{{invoice.open_amount}}`, benutzerdefinierte Felder) und eine Live-Vorschau für beliebig gewählte Empfänger:innen anbieten; Platzhalter MÜSSEN über dieselben Feldberechtigungen aufgelöst werden wie in der UI, und Vorlagen MÜSSEN in einer Sandbox gerendert werden, die keinen Code ausführen kann.

#### Scenario: Eingeschränkter Platzhalter
- **WHEN** ein:e Trainer:in ohne IBAN-Recht einen IBAN-Platzhalter verwendet
- **THEN** wird der Platzhalter nicht zur IBAN aufgelöst

#### Scenario: Vorschau je Empfänger:in
- **WHEN** die absendende Person in der Vorschau eine:n Empfänger:in auswählt
- **THEN** wird die E-Mail mit den Werten dieser Person angezeigt

### Requirement: Vorlagen und Systemvorlagen
Das System MUSS (SHALL) versionierte Vorlagen mit Kategorien führen und Systemvorlagen mitliefern für: Antrag eingegangen, angenommen und abgelehnt; Änderungsantrag entschieden; Austritt bestätigt; Vorabankündigung; Mahnung; Portaleinladung; Anmeldecode.

#### Scenario: Systemvorlage verwendet
- **WHEN** ein Antrag angenommen wird
- **THEN** wird die Vorlage „Antrag angenommen“ an die antragstellende Person gesendet

### Requirement: Anhänge
Das System MUSS (SHALL) Anhänge bis insgesamt 10 MB pro E-Mail sowie je Empfänger:in erzeugte PDFs erlauben (zum Beispiel die eigene Rechnung der Empfänger:in).

#### Scenario: Rechnung je Empfänger:in
- **WHEN** eine E-Mail mit „eigene Rechnung anhängen“ gesendet wird
- **THEN** erhält jede:r Empfänger:in nur das PDF der eigenen Rechnung

#### Scenario: Größenlimit
- **WHEN** die Anhänge insgesamt 10 MB überschreiten
- **THEN** kann die E-Mail erst gesendet werden, wenn die Anhänge verkleinert wurden

### Requirement: SMTP-Versand
Das System MUSS (SHALL) über das SMTP-Relay des Vereins senden, optional mit Absenderadressen je Zweck (Finanzen, Vorstand, Allgemein), und eine Aktion „SMTP testen“ mit Hinweisen zu SPF, DKIM und DMARC anbieten.

#### Scenario: Test-E-Mail
- **WHEN** ein:e Admin „SMTP testen“ ausführt
- **THEN** wird eine Test-E-Mail gesendet und das Ergebnis mit Hinweisen zu SPF / DKIM / DMARC angezeigt

### Requirement: Gedrosselte Warteschlange und Zustellprotokoll
Das System MUSS (SHALL) E-Mails mit einer konfigurierbaren Rate (Nachrichten pro Minute) in eine Warteschlange stellen und je Empfänger:in eine Zustellzeile mit Status `queued`, `accepted`, `bounced`, `failed` oder `printed` und Fehlertext führen; jede gesendete E-Mail MUSS in der Profil-Zeitleiste der Empfänger:in erscheinen.

#### Scenario: Drosselung
- **WHEN** 600 E-Mails bei einem Limit von 100 pro Minute in die Warteschlange gestellt werden
- **THEN** dauert der Versand mindestens 6 Minuten und der Zustellstatus jeder Empfänger:in wird erfasst

### Requirement: Bounces und Sperrliste
Das System MUSS (SHALL) synchrone SMTP-Ablehnungen je Empfänger:in protokollieren, asynchrone Bounces über einen Relay-Webhook-Adapter annehmen, Admins eine Adresse von Hand als gebounct markieren lassen und Adressen mit Hard Bounce auf die Sperrliste setzen.

#### Scenario: Hard Bounce
- **WHEN** der Relay-Webhook einen Hard Bounce meldet
- **THEN** wird die Zustellung `bounced` und die Adresse für spätere E-Mails gesperrt

### Requirement: Abmeldung bei nicht verpflichtenden E-Mails
Das System MUSS (SHALL) nicht verpflichtenden Kategorien (zum Beispiel Rundschreiben) einen Abmeldelink hinzufügen; verpflichtende Vereinsmitteilungen (Einladung zur Mitgliederversammlung, Rechnungen, Vorabankündigungen) DÜRFEN NICHT durch Abmeldung unterdrückt werden, nur durch Hard Bounce.

#### Scenario: Abgemeldetes Mitglied erhält trotzdem Rechnung
- **WHEN** an ein Mitglied, das sich vom Rundschreiben abgemeldet hat, eine Rechnung gesendet wird
- **THEN** wird die Rechnungs-E-Mail zugestellt

### Requirement: Briefkopf
Das System MUSS (SHALL) eine Briefkopf-Konfiguration führen (Logo, Absenderzeile, Adressblock für DIN-5008-Fensterumschläge Form A oder B, Fußzeile mit Vorstandsmitgliedern, Registergericht und -nummer, Steuernummer und Bankverbindung), die jedes erzeugte Dokument verwendet: Rechnung, Storno, Mahnschreiben, Spendenbescheinigung, Mandatsformular, Vorabankündigung, Mitgliedsbestätigung und DSGVO-Datenblatt.

#### Scenario: Fensterumschlag
- **WHEN** eine Rechnung mit DIN 5008 Form B gedruckt wird
- **THEN** steht die Empfängeradresse an der Fensterposition von Form B

### Requirement: Dokumente über den bevorzugten Kanal senden
Das System MUSS (SHALL) die Empfänger:innen von Dokumenten nach bevorzugtem Kanal aufteilen, die Aufteilung vor dem Versand anzeigen (N per E-Mail, M als Brief, K ohne gültigen Kanal) und für jedes Dokument festhalten, wie und wann es versendet wurde.

#### Scenario: Kanalaufteilung
- **WHEN** 120 Rechnungen versendet werden und 20 Empfänger:innen Briefe bevorzugen und 3 keinen Kanal haben
- **THEN** zeigt der Dialog 97 per E-Mail, 20 als Brief und 3 ohne gültigen Kanal

### Requirement: Druckbare Briefstapel
Das System MUSS (SHALL) Briefe in Postleitzahl-Reihenfolge zu einem PDF zusammenführen, wo nötig Leerseiten für den Duplexdruck einfügen und den Stapel mit seinen Dokumenten speichern und auflisten.

#### Scenario: Duplex-Auffüllung
- **WHEN** ein Stapel einen dreiseitigen Brief gefolgt von einem weiteren Brief enthält
- **THEN** wird eine Leerseite eingefügt, damit der nächste Brief auf einem neuen Blatt beginnt

### Requirement: Feste Platzhalterliste
Das System MUSS (SHALL) Platzhalter nur aus einer festen Liste anbieten (Vorname, Nachname, vollständiger Name, Mitgliedsnummer, Vereinsname sowie bei Rechnungs-E-Mails Rechnungsnummer, Betrag, offener Betrag, Fälligkeitsdatum, Mahnbezeichnung) und unbekannte Platzhalter in der Vorschau sichtbar lassen.

#### Scenario: Unbekannter Platzhalter
- **WHEN** der Text `{{iban}}` enthält
- **THEN** zeigen Vorschau und E-Mail `{{iban}}` unverändert

### Requirement: Rechnungs-E-Mail über den bevorzugten Kanal
Das System MUSS (SHALL) ausgestellte Rechnungen einer Liste oder eines Beitragslaufs per E-Mail mit dem eigenen PDF jeder Empfänger:in senden und die Rechnungen, deren Empfänger:innen Briefe bevorzugen oder keine zustellbare Adresse haben, zum Drucken zurückgeben.

#### Scenario: Brief bevorzugt
- **WHEN** Rechnungen versendet werden und eine Empfänger:in Briefe bevorzugt
- **THEN** wird diese Rechnung zum Drucken aufgelistet und nicht per E-Mail gesendet

### Requirement: Briefe als ein duplexfähiges PDF
Das System MUSS (SHALL) die ausgestellten PDFs der per Brief versendeten Rechnungen zu einem nach Postleitzahl sortierten PDF zusammenführen, in dem jeder Brief auf einer Vorderseite beginnt.

#### Scenario: Zwei Briefe mit je einer Seite
- **WHEN** zwei einseitige Rechnungen als Briefe gedruckt werden
- **THEN** hat das PDF vier Seiten, die zweite und vierte sind leer, und die niedrigere Postleitzahl kommt zuerst

### Requirement: Mitgliederversammlung mit Einladungsfrist und Protokoll
Das System MUSS (SHALL) alle aktuellen Mitglieder nur dann mit Tagesordnung zu einer Mitgliederversammlung einladen, solange die satzungsmäßige Einladungsfrist eingehalten werden kann, Anwesenheit und Ergebnisse je Tagesordnungspunkt erfassen und das Protokoll beim Schließen der Versammlung festschreiben.

#### Scenario: Zu spät für die Einladung
- **WHEN** eine Versammlung mit 14 Tagen Einladungsfrist in 7 Tagen stattfindet
- **THEN** wird die Einladung abgelehnt und der letztmögliche Tag genannt

### Requirement: Vorstandssitzungen
Das System MUSS (SHALL) Vorstandssitzungen wie Mitgliederversammlungen durchführen, aber nur die Mitglieder der gewählten Gruppe einladen und zählen.

#### Scenario: Einladung
- **WHEN** zu einer Vorstandssitzung für die Gruppe "Vorstand" eingeladen wird
- **THEN** erhalten nur Mitglieder dieser Gruppe die Einladung

