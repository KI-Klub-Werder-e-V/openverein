# portal Specification

## Purpose
TBD – entstanden durch Archivierung der Änderung portal-settings. Purpose nach der Archivierung aktualisieren.
## Requirements
### Requirement: Portaleinstellungen
Das System MUSS (SHALL) einem Mitglied eine Portalfunktion nur gewähren, wenn eine seiner aktuellen Gruppen sie erlaubt und keine sie verbietet, andernfalls gilt die Vereinseinstellung, und MUSS Anfragen für abgeschaltete Funktionen ablehnen.

#### Scenario: Kündigung abgeschaltet, durch eine Gruppe erlaubt
- **WHEN** der Verein die Kündigung abschaltet und das Mitglied in einer Gruppe ist, die sie erlaubt
- **THEN** kann das Mitglied im Portal kündigen

#### Scenario: Bankänderung durch eine Gruppe verboten
- **WHEN** die Gruppe eines Mitglieds Bankänderungen verbietet
- **THEN** wird ein IBAN-Änderungsantrag aus dem Portal mit 403 abgelehnt

### Requirement: Eigene Spendenbescheinigungen im Portal
Das System MUSS (SHALL) Mitgliedern die an ihre eigene Person ausgestellten Spendenbescheinigungen anzeigen und das gespeicherte PDF nur für gültige Bescheinigungen bereitstellen.

#### Scenario: Stornierte Bescheinigung
- **WHEN** eine Bescheinigung storniert wird
- **THEN** listet das Portal sie als storniert und verweigert ihr PDF

