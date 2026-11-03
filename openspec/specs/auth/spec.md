# auth Specification

## Purpose
Die Capability auth umfasst die Anmeldung für Admins, Finanz-Benutzer:innen und Mitglieder: Passwort-Anmeldung, Sitzungen, TOTP als Pflicht für Finanzrollen, per E-Mail versandte Einmalcodes für Mitglieder sowie Einladungen (B M33, mit den Portal-Anmelderegeln aus M29). Punkte, die B als „sollte“ oder „könnte“ einstuft, sind im Namen der Anforderung entsprechend markiert; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: Passwort-Anmeldung
Das System MUSS (SHALL) Passwörter mit 12 bis 128 Zeichen akzeptieren, sie als Argon2id-Hashes speichern und jedes Passwort ablehnen, das in der mitgelieferten Liste kompromittierter Passwörter steht; eine Online-Prüfung per k-Anonymität MUSS optional und standardmäßig ausgeschaltet sein.

#### Scenario: Kurzes Passwort abgelehnt
- **WHEN** eine Benutzer:in ein Passwort mit 11 Zeichen setzt
- **THEN** lehnt das System es mit einer Meldung ab, die das Minimum von 12 Zeichen nennt

#### Scenario: Kompromittiertes Passwort abgelehnt
- **WHEN** eine Benutzer:in ein Passwort setzt, das in der mitgelieferten Liste kompromittierter Passwörter steht
- **THEN** lehnt das System es ab und bittet um ein anderes

### Requirement: Anmeldung ohne Mandantencode
Das System MUSS (SHALL) Benutzer:innen nur mit E-Mail und Zugangsdaten anmelden und DARF NICHT nach einem Vereinscode fragen.

#### Scenario: Schlichtes Anmeldeformular
- **WHEN** eine Benutzer:in die Anmeldeseite öffnet
- **THEN** fragt das Formular nur nach E-Mail und Passwort (oder einem Einmalcode), nicht nach einem Vereinscode

### Requirement: TOTP als Pflicht für Finanzrollen
Das System MUSS (SHALL) die TOTP-Einrichtung für alle Benutzer:innen mit Schreibzugriff auf Beiträge, Rechnungen, SEPA, Bank, Buchhaltung oder Spenden sowie für die Rollen Steuerberater:in und Kassenprüfer:in verlangen; die Pflicht MUSS bei jeder Anmeldung und jeder Anfrage durchgesetzt werden, nicht nur bei der Einrichtung, und die Einrichtung MUSS zehn gehashte Einmal-Wiederherstellungscodes ausgeben.

#### Scenario: Finanzrolle ohne TOTP
- **WHEN** eine Benutzer:in die Rolle Kassenwart:in erhält und TOTP nicht eingerichtet hat
- **THEN** werden schreibende Finanzaktionen abgelehnt, bis TOTP eingerichtet ist

#### Scenario: TOTP bei der Anmeldung geprüft
- **WHEN** eine Benutzer:in mit Finanzrolle ein korrektes Passwort eingibt
- **THEN** wird die Sitzung erst nach einem gültigen TOTP-Code oder Wiederherstellungscode angelegt

#### Scenario: Wiederherstellungscode nur einmal nutzbar
- **WHEN** ein Wiederherstellungscode einmal benutzt wurde
- **THEN** schlägt eine erneute Nutzung fehl

### Requirement: Erneute TOTP-Bestätigung (Step-up) für kritische Aktionen
Das System MUSS (SHALL) eine TOTP-Bestätigung aus den letzten 10 Minuten verlangen, bevor ein Einzugslauf erzeugt, ein heruntergeladener Einzugslauf freigegeben, die Periodensperre verschoben, Spendenbescheinigungen ausgestellt, API-Token angelegt, Rollen geändert oder der vollständige Datenexport ausgeführt wird.

#### Scenario: Veralteter zweiter Faktor
- **WHEN** eine Kassenwart:in, deren letzte TOTP-Prüfung 25 Minuten zurückliegt, die Periodensperre zurückverlegt
- **THEN** fragt das System vor dem Anwenden der Änderung nach einem frischen TOTP-Code

### Requirement: Per E-Mail versandte Einmalcodes für Mitglieder
Das System MUSS (SHALL) Mitgliedern die Anmeldung mit einem 6-stelligen, per E-Mail versandten Code erlauben, der nach 10 Minuten abläuft und 5 Versuche zulässt; der Link in der E-Mail MUSS den Code nur eintragen und für die Anmeldung einen Klick (POST) verlangen, damit Mail-Scanner, die Links vorab abrufen, ihn nicht verbrauchen. Mitglieder DÜRFEN zusätzlich ein Passwort oder einen Passkey festlegen.

#### Scenario: Code läuft ab
- **WHEN** ein Mitglied einen korrekten Code 11 Minuten nach dem Versand eingibt
- **THEN** schlägt die Anmeldung fehl, und ein neuer Code kann angefordert werden

#### Scenario: Scanner-sicherer Link
- **WHEN** ein Mail-Sicherheitsscanner den Link in der Code-E-Mail abruft
- **THEN** wird der Code nicht verbraucht, und das Mitglied kann sich weiterhin anmelden

#### Scenario: Versuche begrenzt
- **WHEN** 5-mal ein falscher Code eingegeben wird
- **THEN** wird der Code ungültig

### Requirement: Vom Admin ausgestellter Anmeldecode
Das System MUSS (SHALL) einem Admin erlauben, im Datensatz eines Mitglieds einen Einmalcode auszustellen, damit sich das Mitglied anmelden kann, wenn der E-Mail-Versand des Vereins fehlschlägt, und MUSS jeden ausgestellten Code im Audit-Protokoll erfassen.

#### Scenario: Code ohne E-Mail
- **WHEN** ein Admin einen Code für ein Mitglied ausstellt, dessen E-Mail unzustellbar war
- **THEN** sieht der Admin den Code einmal, und das Ereignis wird ins Audit-Protokoll geschrieben

### Requirement: Ratenbegrenzung und Sperre
Das System MUSS (SHALL) Authentifizierungs-Endpunkte je Konto und je IP ratenbegrenzen und nach 5 Fehlversuchen eine progressive Sperre anwenden, ohne Captcha von Drittanbietern.

#### Scenario: Progressive Verzögerung
- **WHEN** ein Konto 5 fehlgeschlagene Anmeldungen in Folge hat
- **THEN** werden weitere Versuche mit zunehmenden Wartezeiten verzögert

### Requirement: Sitzungen
Das System MUSS (SHALL) Sitzungen in der Datenbank halten, die aktiven Sitzungen einer Benutzer:in mit einer Aktion „Andere Sitzungen abmelden“ auflisten und Sitzungen nach Inaktivität beenden (Admin 8 Stunden, Portal 30 Tage); Sitzungscookies MÜSSEN `HttpOnly`, `Secure` und `SameSite=Lax` sein, mit CSRF-Schutz für zustandsändernde Anfragen.

#### Scenario: Leerlauf-Timeout für Admins
- **WHEN** eine Admin-Sitzung länger als 8 Stunden inaktiv war
- **THEN** verlangt die nächste Anfrage eine neue Anmeldung

#### Scenario: Andernorts abmelden
- **WHEN** eine Benutzer:in „Andere Sitzungen abmelden“ wählt
- **THEN** wird jede andere Sitzung dieser Benutzer:in sofort ungültig

### Requirement: Einladungen
Das System MUSS (SHALL) Admins und Mitglieder per E-Mail mit einer Einmal-Einladung einladen, mit der die eingeladene Person ihren Zugang einrichtet; Einladungen MÜSSEN ablaufen und können erneut versendet werden.

#### Scenario: Einladung eines Mitglieds
- **WHEN** ein Admin einem Mitglied eine Portal-Einladung sendet
- **THEN** erhält das Mitglied eine E-Mail und kann sich daraus mit einem Einmalcode anmelden

#### Scenario: Benutzte Einladung
- **WHEN** ein bereits benutzter Einladungslink erneut geöffnet wird
- **THEN** lehnt das System ihn ab und bietet die normale Anmeldung an

### Requirement: Authentifizierungsereignisse werden auditiert
Das System MUSS (SHALL) Anmeldungen, Abmeldungen, fehlgeschlagene Anmeldungen, Sperren, TOTP-Einrichtung und die Nutzung von Wiederherstellungscodes ins Audit-Protokoll schreiben.

#### Scenario: Fehlgeschlagene Anmeldung protokolliert
- **WHEN** eine Anmeldung fehlschlägt
- **THEN** erfasst ein Audit-Ereignis das Konto, die gehashte IP und die Zeit, ohne das versuchte Passwort

### Requirement: Ersteinrichtung
Das System MUSS (SHALL) der ersten Besucher:in einer leeren Installation erlauben, in einem Schritt den Verein (Name der Organisation) und das erste Admin-Konto (Name, E-Mail, Passwort mit mindestens 12 Zeichen) anzulegen, sie anzumelden und jede weitere Einrichtung abzulehnen, sobald eine Organisation existiert.

#### Scenario: Einrichtung legt Verein und Admin an
- **WHEN** eine Besucher:in das Einrichtungsformular auf einer leeren Installation absendet
- **THEN** existieren die Organisation und ein aktives Admin-Konto, die Besucher:in ist angemeldet, und ein Audit-Ereignis `organization.setup` wird geschrieben

#### Scenario: Einrichtung nur einmal
- **WHEN** jemand den Einrichtungs-Endpunkt aufruft, nachdem eine Organisation existiert
- **THEN** antwortet die API mit 409 und einem Problem-Dokument, und nichts wird angelegt

### Requirement: Schutz vor TOTP-Wiederverwendung
Das System MUSS (SHALL) jeden TOTP-Zeitschritt höchstens einmal je Benutzer:in akzeptieren, damit ein beobachteter Code nicht wiederverwendet werden kann.

#### Scenario: Derselbe Code zweimal
- **WHEN** ein Code zur Anmeldung benutzt wurde und derselbe Code innerhalb seiner 30 Sekunden erneut eingegeben wird
- **THEN** wird der zweite Versuch abgelehnt

### Requirement: Zurücksetzen eines zweiten Faktors durch einen Admin
Das System MUSS (SHALL) einem Admin (mit erneuter Bestätigung (Step-up)) erlauben, den zweiten Faktor einer anderen Benutzer:in zurückzusetzen, deren Sitzungen zu beenden und ein Audit-Ereignis zu schreiben; Benutzer:innen setzen ihren eigenen Faktor über die Einrichtung zurück.

#### Scenario: Verlorenes Handy
- **WHEN** ein Admin den zweiten Faktor einer Kassenwart:in zurücksetzt, die ihr Handy verloren hat
- **THEN** enden die Sitzungen der Kassenwart:in, und die nächste Anmeldung fordert sie auf, TOTP erneut einzurichten

