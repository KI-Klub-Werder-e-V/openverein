# banking Specification

## Purpose
TBD – entstanden durch Archivierung der Änderung bank-bulk-booking. Purpose nach der Archivierung aktualisieren.
## Requirements
### Requirement: Kontobewegungen ohne Rechnung buchen
Das System MUSS (SHALL) mehrere ausgewählte offene Kontobewegungen derselben Richtung in einem Schritt auf ein Konto des Hauptbuchs buchen, mit je einer Buchung pro Bewegung, und MUSS eine solche Buchung ausschließlich per Storno rückgängig machen.

#### Scenario: Zwei Kontoführungsgebühren
- **WHEN** zwei offene Abbuchungen auf ein Aufwandskonto mit der Sphäre „Vermögensverwaltung“ gebucht werden
- **THEN** existieren zwei Buchungen und beide Bewegungen zeigen "Gebucht" mit ihrer Buchungsnummer

#### Scenario: Gemischte Richtungen
- **WHEN** eine Einnahme- und eine Ausgabebewegung gemeinsam ausgewählt werden
- **THEN** wird die Buchung abgelehnt

