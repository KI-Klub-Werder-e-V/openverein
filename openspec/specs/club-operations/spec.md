# club-operations Specification

## Purpose
TBD – entstanden durch Archivierung der Änderung tasks. Purpose nach der Archivierung aktualisieren.
## Requirements
### Requirement: Aufgaben
Das System MUSS (SHALL) allen Benutzer:innen erlauben, Aufgaben mit zuständiger Person und Fälligkeitsdatum anzulegen, MUSS Änderungen an einer Aufgabe nur der erstellenden Person, der zuständigen Person oder einem Admin erlauben und MUSS ein verknüpftes Mitglied nur Benutzer:innen anzeigen, die dieses Mitglied lesen dürfen.

#### Scenario: Mitglied außerhalb des eigenen Bereichs
- **WHEN** ein:e Trainer:in der Tennisabteilung eine Aufgabe ansieht, die mit einem Mitglied der Fußballabteilung verknüpft ist
- **THEN** wird die Aufgabe ohne das Mitglied angezeigt

