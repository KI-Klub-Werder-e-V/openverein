## ADDED Requirements

### Requirement: Facette E-Mail-Adresse
Das System MUSS (SHALL) die Mitgliederliste nach der E-Mail-Adresse filtern können: „vorhanden“ (Adresse, die nicht gesperrt ist), „fehlt“ (keine Adresse) und „unzustellbar“ (nach einem Bounce oder von Hand gesperrt; eine Abmeldung vom Rundschreiben zählt nicht). Die Facette gilt wie jede andere auch für die Auswahl aller Treffer, Exporte und gespeicherte Ansichten. Wer die E-Mail-Adresse nicht sehen darf, MUSS 403 erhalten; „unzustellbar“ verlangt zusätzlich Leserechte für Kommunikation.

#### Scenario: Aufteilung
- **WHEN** ein Mitglied eine Adresse hat, eines keine und eines eine nach einem Bounce gesperrte
- **THEN** zeigt jede der drei Optionen genau eines dieser Mitglieder

#### Scenario: Ausgeblendetes Feld
- **WHEN** eine Rolle die E-Mail-Adresse ausblendet und nach „fehlt“ filtert
- **THEN** lehnt das System die Anfrage mit 403 ab
