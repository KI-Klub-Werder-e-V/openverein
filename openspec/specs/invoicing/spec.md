# invoicing Specification

## Purpose
TBD – entstanden durch Archivierung der Änderung invoice-texts. Purpose nach der Archivierung aktualisieren.
## Requirements
### Requirement: Rechnungstexte
Das System MUSS (SHALL) beim Ausstellen die eigenen Einleitungs- und Schlusstexte der Rechnung, andernfalls die Standardtexte des Vereins, einsetzen und sie danach unverändert lassen.

#### Scenario: Standard-Schlusstext
- **WHEN** der Schlusstext des Vereins "Bitte zahle {{betrag}} bis {{faellig}}." lautet und eine Rechnung über 50 €, fällig am 01.07.2026, ausgestellt wird
- **THEN** lautet der Schlusstext der Rechnung "Bitte zahle 50,00 € bis 01.07.2026." und eine spätere Änderung wird von der Datenbank abgelehnt

### Requirement: Nettopreise
Das System MUSS (SHALL) den Einzelpreis einer Position als Nettopreis annehmen und ihn brutto, auf den Cent gerundet, speichern.

#### Scenario: Nettopreis zu 19 %
- **WHEN** eine Position mit einem Netto-Einzelpreis von 42,02 € und 19 % Steuer gespeichert wird
- **THEN** beträgt ihr Einzelpreis 50,00 €

### Requirement: Angebote
Das System MUSS (SHALL) Angebote mit eigenem Nummernkreis und gespeichertem PDF ausstellen, ausgestellte Angebote unverändert lassen und ein Angebot höchstens einmal in einen Rechnungsentwurf mit denselben Positionen umwandeln, ohne dass das Angebot selbst eine Buchung auslöst.

#### Scenario: Angenommenes Angebot umwandeln
- **WHEN** ein ausgestelltes Angebot angenommen und umgewandelt wird
- **THEN** existiert ein Rechnungsentwurf mit den Positionen des Angebots und eine zweite Umwandlung wird abgelehnt

