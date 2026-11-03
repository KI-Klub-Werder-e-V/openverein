# events Specification

## Purpose
Die Capability events umfasst Kalender, Termine und Rückmeldungen (RSVPs) mit ICS-Feeds, wiederkehrende Termine sowie kostenpflichtige Veranstaltungen und Kurse mit Preisgruppen, Kapazität und Warteliste (B P01, P02, P03). Sie ist das erste Post-MVP-Modul: Nichts davon gehört zum MVP-Meilenstein, es ist aber eingeplant, bevor ein Verein easyVerein kündigt. Punkte, die B als „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet.
## Requirements
### Requirement: Kalender mit Gruppensichtbarkeit
Das System MUSS (SHALL) mehrere Kalender unterstützen, die jeweils für ausgewählte Gruppen sichtbar sind, und MUSS einem Mitglied nur Termine aus Kalendern anzeigen, die für eine seiner aktuellen Gruppen sichtbar sind.

#### Scenario: Verborgener Kalender
- **WHEN** ein Mitglied, das nicht in "Vorstand" ist, den Kalender öffnet
- **THEN** werden Termine des Kalenders "Vorstand" nicht angezeigt

### Requirement: Termine
Das System MUSS (SHALL) Termine mit Titel, Beschreibung, Ort (Freitext oder Raum), Beginn und Ende in der Zeitzone der Organisation, minimaler und maximaler Teilnehmerzahl, Anmeldezeitraum und Teilnahmemodus (geschlossen, offen, mit Begleitung, öffentliche Anmeldung) führen.

#### Scenario: Anmeldezeitraum abgelaufen
- **WHEN** ein Mitglied versucht, sich nach Ende des Anmeldezeitraums anzumelden
- **THEN** wird die Anmeldung abgelehnt

### Requirement: RSVP-Status
Das System MUSS (SHALL) je Teilnehmer:in die Status `invited`, `yes`, `maybe`, `no`, `attended` und `not attended` erfassen.

#### Scenario: Anwesenheit nach dem Termin
- **WHEN** ein:e Trainer:in eine:n Teilnehmer:in mit RSVP `yes` nach dem Termin als anwesend markiert
- **THEN** wird der Status `attended`

### Requirement: Kalenderansichten
Das System MUSS (SHALL) Monats-, Wochen-, Tages- und Listenansichten mit einem Schalter für eine Geburtstagsebene anzeigen, die Feldeinschränkungen für das Geburtsdatum beachtet.

#### Scenario: Geburtstagsebene eingeschränkt
- **WHEN** ein:e Benutzer:in ohne Recht auf das Geburtsdatum die Geburtstagsebene einschaltet
- **THEN** werden keine Geburtstage angezeigt

### Requirement: ICS-Feeds und Import
Das System MUSS (SHALL) persönliche und kalenderbezogene ICS-Feeds veröffentlichen, die über rotierbare geheime Token adressiert werden, und externe Kalender aus ICS importieren.

#### Scenario: Token rotiert
- **WHEN** ein Mitglied sein Feed-Token rotiert
- **THEN** funktioniert die alte Feed-URL nicht mehr

### Requirement: Wiederkehrende Termine
Das System MUSS (SHALL) wiederkehrende Termine per RRULE mit Ausnahmen definieren, „diesen“, „diesen und folgende“ oder „alle“ Termine einer Serie bearbeiten und Rückmeldungen einzelnen Terminen der Serie zuordnen.

#### Scenario: Ausnahme an einem Feiertag
- **WHEN** ein wöchentliches Training eine Ausnahme am 24. Dezember hat
- **THEN** gibt es an diesem Datum keinen Termin und die übrigen Termine bleiben unverändert

#### Scenario: Folgende bearbeiten
- **WHEN** ein:e Trainer:in „diesen und folgende“ Termine ab dem 1. März von 18:00 auf 19:00 verschiebt
- **THEN** behalten frühere Termine 18:00

### Requirement: Preisgruppen mit Rechnungen
Das System MUSS (SHALL) Preisgruppen je Termin unterstützen (zum Beispiel Mitglied, Nichtmitglied, Kind) und über die Capability invoicing eine Rechnung erstellen, wenn eine Teilnahme bestätigt wird.

#### Scenario: Kostenpflichtiger Kurs
- **WHEN** die Teilnahme eines Nichtmitglieds an einem Kurs mit einem Nichtmitgliederpreis von 4500 Cent bestätigt wird
- **THEN** wird dieser Person eine Rechnung über 4500 Cent ausgestellt

### Requirement: Kapazität und Warteliste
Das System MUSS (SHALL) die maximale Kapazität mit einer geordneten Warteliste durchsetzen und die erste wartende Person automatisch mit einer E-Mail nachrücken lassen, wenn ein Platz frei wird.

#### Scenario: Nachrücken
- **WHEN** ein:e bestätigte:r Teilnehmer:in in einem vollen Kurs absagt
- **THEN** rückt die erste Person auf der Warteliste nach und wird benachrichtigt

### Requirement: Wöchentliche Teilnahmegrenze (könnte)
Das System MUSS (SHALL) optional die Teilnahmen je Mitglied und Woche je Gruppe begrenzen und dabei den höchsten, niedrigsten oder summierten Wert verwenden, wenn ein Mitglied in mehreren Gruppen ist.

#### Scenario: Grenze erreicht
- **WHEN** ein Mitglied mit einer Grenze von 2 pro Woche sich für eine dritte Einheit in dieser Woche anmeldet
- **THEN** wird die Anmeldung abgelehnt

### Requirement: Terminzeiten als Ortszeit
Das System MUSS (SHALL) Beginn und Ende eines Termins als Ortszeit (Wall-Clock) in der Zeitzone der Organisation speichern, für jeden Termin einer Serie über Zeitumstellungen hinweg dieselbe lokale Uhrzeit beibehalten und ICS-Feeds mit der TZID der Organisation veröffentlichen.

#### Scenario: Training über die Zeitumstellung
- **WHEN** ein wöchentliches Training um 18:00 Termine vor und nach dem Ende der Sommerzeit hat
- **THEN** beginnt jeder Termin um 18:00 Ortszeit

### Requirement: Teilmenge der Wiederholungsregeln
Das System MUSS (SHALL) wiederkehrende Termine täglich, wöchentlich an gewählten Wochentagen (optional alle n Wochen) oder monatlich am Starttag anlegen, endend nach Datum oder Anzahl; eine monatliche Serie am 31. MUSS Monate ohne diesen Tag überspringen.

#### Scenario: Monatlich am 31.
- **WHEN** ein monatlicher Termin am 31. Januar mit vier Terminen beginnt
- **THEN** fallen sie auf den 31. Januar, 31. März, 31. Mai und 31. Juli

### Requirement: Öffentliches Kalender-Widget
Das System MUSS (SHALL) die anstehenden Termine eines Kalenders ohne Beschreibungen oder Teilnehmende nur dann veröffentlichen, wenn der Kalender öffentlich und nicht auf Gruppen beschränkt ist, und das Einbetten (Framing) nur durch die vom Verein aufgeführten Websites erlauben.

#### Scenario: Interne Notiz bleibt intern
- **WHEN** ein Termin eines öffentlichen Kalenders eine interne Beschreibung hat
- **THEN** zeigt die öffentliche Liste Titel, Zeit und Ort, aber nicht die Beschreibung

### Requirement: ICS-Import
Das System MUSS (SHALL) Termine aus einer ICS-Datei in einen Kalender importieren, in den die Benutzer:in schreiben darf, in der Zeitzone des Vereins, und DARF einen Termin mit derselben UID NICHT zweimal in denselben Kalender importieren.

#### Scenario: Dieselbe Datei zweimal
- **WHEN** dieselbe ICS-Datei mit zwei Terminen zweimal importiert wird
- **THEN** fügt der zweite Import nichts hinzu und meldet zwei Dubletten

### Requirement: Anwesenheitsliste
Das System MUSS (SHALL) die erfasste Anwesenheit eines Kalenders für einen Zeitraum von höchstens einem Jahr als Tabelle Mitglied mal Einheit exportieren, beschränkt auf die Mitglieder, die die Benutzer:in lesen darf.

#### Scenario: Zwei Einheiten besucht
- **WHEN** ein Mitglied im September zwei von drei Einheiten besucht hat
- **THEN** zeigt seine Zeile zwei Markierungen und die Summe 2

### Requirement: Ermäßigter Beitrag für Kinder
Das System MUSS (SHALL) einer bestätigten teilnehmenden Person den ermäßigten Beitrag des Termins in Rechnung stellen, wenn ihr Alter am Tag des Termins höchstens der Altersgrenze des Termins entspricht, und MUSS keine Rechnung ausstellen, wenn dieser Beitrag null ist.

#### Scenario: Kind und erwachsene Person
- **WHEN** ein 12-jähriges Kind und eine erwachsene Person einen Termin zu 30 € mit 10 € für Kinder bis 13 bestätigen
- **THEN** werden dem Kind 10 € und der erwachsenen Person 30 € in Rechnung gestellt

### Requirement: Anwesenheit ohne Verbindung
Das System MUSS (SHALL) ohne Verbindung erfasste Anwesenheitsmarkierungen auf dem Gerät behalten und senden, sobald die Verbindung zurückkehrt, ohne eine Markierung stillschweigend zu verlieren.

#### Scenario: Halle ohne Empfang
- **WHEN** ein:e Trainer:in ein Mitglied offline als anwesend markiert
- **THEN** erscheint die Markierung sofort mit einem Warte-Hinweis und wird nach Rückkehr der Verbindung auf dem Server gespeichert

