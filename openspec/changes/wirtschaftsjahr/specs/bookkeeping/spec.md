## ADDED Requirements

### Requirement: Wirtschaftsjahr
Das System MUSS (SHALL) in den Buchhaltungs-Einstellungen den Monat führen, an dessen Erstem das Wirtschaftsjahr beginnt (Standard Januar). Ein Wirtschaftsjahr MUSS nach dem Jahr seines Beginns benannt werden, als „2025/26“, wenn es zwei Kalenderjahre berührt. Standardzeitraum und Jahresauswahl von Journal, EÜR und Kassenbuch sowie DATEV- und Z3-Export MÜSSEN ihm folgen. Spendenbescheinigungen bleiben beim Kalenderjahr.

#### Scenario: Wirtschaftsjahr April bis März
- **WHEN** das Wirtschaftsjahr im April beginnt und die Kasse am 23. November 2026 die EÜR öffnet
- **THEN** zeigt sie den Zeitraum 1. April 2026 bis 31. März 2027 und die Auswahl „2025/26“, „2026/27“, „2027/28“

#### Scenario: DATEV-Kopfdaten speichern
- **WHEN** das Wirtschaftsjahr im April beginnt und die DATEV-Kopfdaten ohne Wirtschaftsjahr gespeichert werden
- **THEN** beginnt das Wirtschaftsjahr weiter im April

### Requirement: Wirtschaftsjahr ändern
Gibt es schon Buchungen oder Planwerte, MUSS (SHALL) die Oberfläche vor einer Änderung des Wirtschaftsjahres nennen, was sich verschiebt (Kassenberichte, Haushaltsplan und Prüfungspakete früherer Jahre), und bestätigen lassen. Jede Änderung MUSS mit altem und neuem Monat protokolliert werden.

#### Scenario: Umstellen mit Buchungen
- **WHEN** es Buchungen gibt und die Kasse den Beginn von Januar auf April ändert
- **THEN** fragt die Oberfläche nach, und erst nach „Umstellen“ gilt April; das Audit-Protokoll enthält Januar und April

## MODIFIED Requirements

### Requirement: Budget im Abgleich mit der Buchhaltung
Das System MUSS (SHALL) geplante Nettobeträge je Einnahme- und Ausgabekonto und Wirtschaftsjahr führen und sie neben den gebuchten Nettobeträgen des Wirtschaftsjahres mit der Abweichung anzeigen.

#### Scenario: Überzogenes Konto
- **WHEN** für Material 150 € geplant und 180 € gebucht sind
- **THEN** zeigt die Abweichung +30 €, markiert als über Plan

#### Scenario: Ist nach Wirtschaftsjahr
- **WHEN** das Wirtschaftsjahr im April beginnt und am 31. März 2026 sowie am 1. April 2026 gebucht wurde
- **THEN** zählt die erste Buchung zum Haushaltsplan 2025/26 und die zweite zu 2026/27

### Requirement: Kassenbericht
Das System MUSS (SHALL) einen Kassenbericht je Wirtschaftsjahr als PDF erzeugen, mit Anfangs- und Endsalden je Geldkonto sowie Einnahmen, Ausgaben und Ergebnis nach Sphäre und Konto, einschließlich der Hinweise zur Datenqualität aus der EÜR. Der Hinweis zur Besteuerungsgrenze (§ 64 AO) MUSS die Bruttoeinnahmen des wirtschaftlichen Geschäftsbetriebs je **Wirtschaftsjahr** zusammenfassen, nicht je Kalenderjahr.

#### Scenario: Offene Kontobewegungen
- **WHEN** Kontobewegungen des Jahres noch nicht zugeordnet sind
- **THEN** enthält der Bericht den Hinweis, dass die EÜR unvollständig ist

#### Scenario: Besteuerungsgrenze über das Wirtschaftsjahr
- **WHEN** das Wirtschaftsjahr im April beginnt und die wirtschaftlichen Bruttoeinnahmen über die beiden Kalenderhälften des Wirtschaftsjahres zusammen die Grenze überschreiten, je Kalenderjahr aber nicht
- **THEN** erscheint eine Warnung für das Wirtschaftsjahr (z. B. „2025/26“), nicht zwei stumme Teiljahre

#### Scenario: Abweichendes Wirtschaftsjahr
- **WHEN** das Wirtschaftsjahr im April beginnt und der Kassenbericht für 2025 erzeugt wird
- **THEN** heißt er „Kassenbericht 2025/26“ und umfasst den 1. April 2025 bis 31. März 2026
