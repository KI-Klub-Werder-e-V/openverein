# import Specification

## Purpose
Die Capability import umfasst den vollständigen Datenexport, den CSV-/XLSX-Import mit Spaltenzuordnung und Dublettenbehandlung sowie den easyVerein-Importer (B M37, M38, M39). Für easyVerein ist der Import aus den CSV-/XLSX-Exporten von easyVerein das erste Lieferergebnis; das Abrufen über die easyVerein-API (v3, Fallback v2) folgt später und nutzt dieselbe Zuordnung, Prüfung und denselben Abgleich. Punkte, die B mit „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: Vollständiger Datenexport
Das System MUSS (SHALL) alle Daten der Organisation als ZIP exportieren, mit je einer JSON-Lines- und einer CSV-Datei pro Entität, einem Verzeichnis `files/` mit den gespeicherten Dateien und einer `manifest.json` (Schemaversion, Anzahlen, SHA-256 jeder Datei, Exportzeitpunkt), nach einem dokumentierten, versionierten Exportschema, aus der Oberfläche und als `ovctl export-all`.

#### Scenario: Manifest-Hashes
- **WHEN** ein vollständiger Export erzeugt wird
- **THEN** hat jede Datei im ZIP einen passenden SHA-256 in `manifest.json`

### Requirement: Zugriffskontrolle für den vollständigen Export
Das System MUSS (SHALL) den vollständigen Export nur Benutzer:innen mit der Rolle Admin und frischem TOTP erlauben, jeden Lauf im Audit-Protokoll festhalten und die Datei 7 Tage aufbewahren.

#### Scenario: Kassenwart:in abgewiesen
- **WHEN** eine Kassenwartin ohne Admin-Rolle einen vollständigen Export startet
- **THEN** wird die Anfrage abgelehnt

### Requirement: Export-Rundlauf
Das System MUSS (SHALL) die Daten wiederherstellen, wenn ein Export in eine leere Instanz importiert wird, abgesichert durch einen Rundlauf-Test in der CI.

#### Scenario: Rundlauf
- **WHEN** die CI eine Fixture-Organisation exportiert und in eine leere Instanz importiert
- **THEN** stimmt ein zweiter Export bis auf den Exportzeitpunkt mit dem ersten überein

### Requirement: Tabellenimport mit Zuordnung
Das System MUSS (SHALL) Personen, Mitglieder, Gruppenmitgliedschaften mit Daten, Mandate, offene Rechnungen, Kontobewegungen und Werte benutzerdefinierter Felder aus CSV (mit Erkennung von Zeichenkodierung und Trennzeichen) oder XLSX (mit Blattauswahl) importieren, mit einer Oberfläche zur Spaltenzuordnung, die Ziele aus Spaltenüberschriften vorschlägt, gespeicherten Zuordnungsprofilen, Wertzuordnung für Auswahlfelder und Status (zum Beispiel "aktiv" → `active`) sowie Dateigrößen- und Zeilenlimits für nicht vertrauenswürdige Uploads.

#### Scenario: Wertzuordnung
- **WHEN** eine Spalte "aktiv" und "ausgetreten" enthält
- **THEN** ordnet der Admin sie vor dem Import `active` und `former` zu

### Requirement: Import-Probelauf
Das System MUSS (SHALL) jeden Import zuerst als Probelauf ausführen, der anzulegende, zu aktualisierende und zu überspringende Zeilen sowie Fehler je Zeile mit Grund auflistet und nichts schreibt, bis der Admin bestätigt; die Validierung MUSS dieselben Serviceregeln wie die Oberfläche verwenden.

#### Scenario: Nichts geschrieben
- **WHEN** ein Probelauf 3 Zeilen mit ungültigen IBANs meldet
- **THEN** wird kein Datensatz angelegt, bis der Admin bestätigt

### Requirement: Abgleichsschlüssel und Dubletten
Das System MUSS (SHALL) den Admin den Abgleichsschlüssel wählen lassen (Mitgliedsnummer, E-Mail oder Name plus Geburtsdatum) und nicht zugeordnete Zeilen durch die Dublettenbewertung schicken.

#### Scenario: Aktualisierung per Mitgliedsnummer
- **WHEN** eine importierte Zeile eine bestehende Mitgliedsnummer hat
- **THEN** wird das bestehende Mitglied aktualisiert statt dupliziert

### Requirement: Import-Rücknahme
Das System MUSS (SHALL) jede angelegte Zeile mit ihrem Importlauf kennzeichnen, Importe als Jobs ausführen und die Rücknahme eines ganzen Imports erlauben, solange keine abhängigen Datensätze existieren.

#### Scenario: Rücknahme blockiert
- **WHEN** an eine durch einen Import angelegte Person eine Rechnung ausgestellt wurde
- **THEN** wird die Rücknahme dieses Imports verweigert und der abhängige Datensatz benannt

### Requirement: easyVerein-Import aus CSV-Exporten
Das System MUSS (SHALL) als ersten easyVerein-Importweg einen Verein aus den CSV-/XLSX-Exportdateien von easyVerein importieren (Mitglieder, Kontakte, Gruppen, Beiträge, Mandate, Rechnungen, Buchungen, benutzerdefinierte Felder), mit Voreinstellungen für das Spaltenlayout von easyVerein.

#### Scenario: Import eines Exportordners
- **WHEN** ein Admin den Satz der easyVerein-Exportdateien hochlädt
- **THEN** ordnet die Voreinstellung bekannte Spalten zu und listet unbekannte Spalten zur manuellen Zuordnung auf

### Requirement: Abruf über die easyVerein-API
Das System MUSS (SHALL) nach dem CSV-Weg Daten über die easyVerein-API v3 mit Fallback auf v2 je Ressource abrufen, mit einem Organisations-Token (oder Benutzer-Login mit 2FA), das verschlüsselt gespeichert und nach der Umstellung gelöscht wird, 100 Anfragen pro Minute einhalten, bei 429 zurückweichen, das Token nach 15 Tagen erneuern, Roh-JSON je Datensatz mit Quell-ID und Abrufzeit speichern, Dateien herunterladen und hashen und nach dem Einfrieren einen Delta-Durchlauf per `updated_at` unterstützen.

#### Scenario: Ratenbegrenzung eingehalten
- **WHEN** easyVerein mit 429 antwortet
- **THEN** weicht der Importer zurück und setzt fort, ohne Datensätze zu verlieren

### Requirement: easyVerein-Zuordnung
Das System MUSS (SHALL) zuordnen: Kontakte zu Personen, Mitglieder zu Mitgliedern, `_relatedMember`-Ketten zu Haushalten, Gruppen und Zuweisungen zu Gruppen und Mitgliedschaften, Gruppenbeiträge zu Beitragsplänen mit einer Version aus aktuellen Werten für jedes easyVerein-Intervall (einmalig, 1–12, 24, 36, 60 Monate), den Startdatumsmodus der Gruppe und ersten Leistungszeitraum, aktive Mandate mit Referenz und Datum, Rechnungen nach Art, Buchungen des laufenden Jahres zu Kontobewegungen und Buchungen (abgeschlossene Jahre als Dateien archiviert), benutzerdefinierte Felder, offene Änderungsanträge und Aufnahmeanträge sowie gespeicherte Filter nach Möglichkeit zu gespeicherten Ansichten; Guthaben als ein Eröffnungsguthaben je Person; Nummernkreise setzen ab der höchsten importierten Nummer fort; Mitglieder erhalten Anmeldeeinladungen, da Passwörter nicht exportierbar sind.

#### Scenario: Nummernkreise werden fortgesetzt
- **WHEN** die höchste importierte Rechnungsnummer `2026-0412` ist
- **THEN** ist die nächste ausgestellte Rechnung `2026-0413`

#### Scenario: Mandatsreferenzen bleiben erhalten
- **WHEN** Mandate importiert werden
- **THEN** bleiben ihre Referenzen und die Gläubiger-ID unverändert

### Requirement: Prüfwarteschlange für Abweichungen
Das System MUSS (SHALL) den easyVerein-Import als Probelauf in ein verwerfbares Schema ausführen, Abweichungen (nicht zugeordnete Felder, Beitragsformeln, mehrdeutige Familien, Mandate ohne Datum oder Referenz, Rechnungen ohne Positionen) in eine Prüfwarteschlange melden und nichts übernehmen, bis jeder markierte Punkt gelöst oder ausdrücklich übersprungen ist, und dann in Abhängigkeitsreihenfolge übernehmen.

#### Scenario: Mehrdeutige Familie
- **WHEN** eine `_relatedMember`-Kette zwei mögliche zahlende Personen hat
- **THEN** wird sie markiert und der Import kann erst übernommen werden, wenn sie gelöst oder übersprungen ist

### Requirement: Keine doppelte Abrechnung oder doppelte Bescheinigung nach der Migration
Das System MUSS (SHALL) den zuletzt veranlagten Zeitraum je Beitragszuweisung aus den importierten Rechnungen berechnen, damit der erste Beitragslauf diese Zeiträume nicht erneut abrechnet, und MUSS Spendenbescheinigungen aus easyVerein als archivierte Bescheinigungen importieren, verknüpft mit den abgedeckten Spenden; Spenden eines bescheinigten Zeitraums mit unbekannter Abdeckung sind bis zur Prüfung für neue Bescheinigungen gesperrt.

#### Scenario: Erster Beitragslauf nach dem Import
- **WHEN** easyVerein Q1 bereits abgerechnet hat und der erste OpenVerein-Beitragslauf Q1 umfasst
- **THEN** erstellt die Vorschau nichts für Q1

#### Scenario: Bescheinigte Spende
- **WHEN** eine Spende durch eine importierte Sammelbestätigung für 2026 abgedeckt ist
- **THEN** kann sie nicht auf eine neue Bescheinigung gesetzt werden

### Requirement: Abgleichsbericht
Das System MUSS (SHALL) einen Abgleichsbericht erstellen, der Scheduler und Beitragsläufe bis zur Freigabe blockiert und umfasst: Mitglieder- und Mandatsanzahlen, unveränderte Gläubiger-ID und Mandatsreferenzen, Summe offener Posten je Mitglied, Guthaben je Person, Abdeckung durch Spendenbescheinigungen, Rechnungssummen nach Typ, Bankstand bei Umstellung, EÜR-Summen des laufenden Jahres nach Konto und Sphäre, höchste Belegnummern, Dateianzahl und Hash-Manifest sowie eine Checkliste von 20 Mitgliedshistorien zur Prüfung von Hand.

#### Scenario: Beitragslauf vor Freigabe blockiert
- **WHEN** eine Kassenwartin vor Freigabe des Abgleichsberichts einen Beitragslauf startet
- **THEN** verweigert das System dies und verlinkt den Bericht

### Requirement: Status aus Ein- und Austrittsdatum
Das System MUSS (SHALL) den Status importierter Mitglieder aus Ein- und Austrittsdatum setzen: Eintrittsdatum in der Zukunft → `future`, Austrittsdatum in der Vergangenheit → `former`, Austrittsdatum in der Zukunft → `resigned`, sonst `active`.

#### Scenario: Ehemaliges Mitglied
- **WHEN** eine Zeile das Austrittsdatum 31.12.2023 hat
- **THEN** wird das Mitglied als `former` mit diesem Austrittsdatum und beendeten Gruppenmitgliedschaften importiert

### Requirement: Geheimnisse gelangen nie in einen vollständigen Export
Das System MUSS (SHALL) Sitzungen, Anmeldecodes, Wiederherstellungscodes, Passwort- und Token-Hashes, TOTP-Geheimnisse und schlüsselbasierte Lookup-Hashes (keyed) aus jedem vollständigen Export weglassen.

#### Scenario: App-Benutzer:innen exportiert
- **WHEN** ein vollständiger Export erstellt wird
- **THEN** enthält `data/app_user.jsonl` Namen und E-Mail-Adressen, aber keinen Passwort-Hash und kein TOTP-Geheimnis

