# fees Specification

## Purpose
TBD – entstanden durch Archivierung der Änderung fee-schedule. Purpose nach der Archivierung aktualisieren.
## Requirements
### Requirement: Geplante Vorschau des Beitragslaufs
Das System MUSS (SHALL) am geplanten Tag höchstens eine Vorschau eines Beitragslaufs pro Monat erstellen, mit den Rechten der Person, die den Zeitplan eingerichtet hat, und DARF sie NICHT ohne Bestätigung buchen.

#### Scenario: Monatliche Vorschau
- **WHEN** der Zeitplan auf Tag 1 steht und der Scheduler zweimal im selben Monat läuft
- **THEN** existiert genau ein Vorschaulauf und es wurde keine Rechnung gebucht

### Requirement: Altersstufen
Das System MUSS (SHALL) den Betrag der ersten Altersstufe abrechnen, zu der das Alter des Mitglieds zu Beginn eines Zeitraums passt, andernfalls den Betrag der Beitragsversion; ein individueller Betrag MUSS Vorrang haben.

#### Scenario: 18. Geburtstag im März, monatlicher Beitrag
- **WHEN** ein am 15.03.2008 geborenes Mitglied ab Januar 2026 monatlich abgerechnet wird und eine Altersstufe bis 17 Jahre besteht
- **THEN** gilt für Januar bis März der Betrag der Altersstufe und für April der Erwachsenenbetrag

