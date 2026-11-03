# gdpr Specification

## Purpose
Die Capability gdpr umfasst Einwilligungsnachweise, Aufbewahrungsklassen, eine Anonymisierung, die die Bücher intakt lässt, Löschsperren (Legal Hold), den maschinenlesbaren Auskunftsexport für Betroffene, die Abdeckung von Rohdatenspeichern, eine Löschung, die Backup-Wiederherstellungen übersteht, sowie die Prüfungen zu Datenschutzbeauftragten (DSB) und Datenschutz-Folgenabschätzung (DSFA) in der Checkliste für die Ersteinrichtung (B M36). Punkte, die B mit „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: Einwilligungsnachweise
Das System MUSS (SHALL) Einwilligungen pro Person und Zweck (zum Beispiel Rundschreiben, Fotos auf der Website) mit Zeitpunkten von Erteilung und Widerruf, Quelle (Aufnahmeantrag, Portal, Papier) und Textversion erfassen.

#### Scenario: Widerruf
- **WHEN** ein Mitglied seine Einwilligung zum Rundschreiben im Portal widerruft
- **THEN** werden Zeitpunkt und Quelle des Widerrufs erfasst und das Mitglied wird von Rundschreiben-E-Mails ausgeschlossen

### Requirement: Aufbewahrungsklassen
Das System MUSS (SHALL) jedem Datensatztyp eine Aufbewahrungsklasse zuweisen, mit Standardwerten nach § 147 AO (Bücher und Aufzeichnungen 10 Jahre, Belege 8 Jahre, sonstige aufgeführte Unterlagen 6 Jahre) und für SEPA-Mandate mindestens 14 Monate nach dem letzten Einzug, und in den Einstellungen die Rechtsgrundlage jedes Standardwerts anzeigen.

#### Scenario: Rechtsgrundlage wird angezeigt
- **WHEN** ein Admin die Einstellungen zur Aufbewahrung öffnet
- **THEN** zeigt jede Klasse ihre Frist und ihre Rechtsgrundlage

### Requirement: Prüfung der Aufbewahrung und Löschung
Das System MUSS (SHALL) Personen und Datensätze, deren Löschung fällig ist, zur Prüfung auflisten und sie nach Bestätigung löschen, oder automatisch, wenn die Organisation diese Einstellung aktiviert.

#### Scenario: Prüfliste
- **WHEN** der Aufbewahrungs-Job läuft
- **THEN** erscheinen Datensätze mit abgelaufener Aufbewahrungsfrist in einer Prüfliste und ohne Bestätigung wird nichts gelöscht, außer der automatische Modus ist aktiv

### Requirement: Anonymisierung
Das System MUSS (SHALL) eine Person anonymisieren, indem Profilfelder, Kontaktdaten, benutzerdefinierte Felder und Dateien gelöscht oder ersetzt werden, während Finanzdokumente ihren Identitäts-Snapshot bis zum Ende ihrer eigenen Aufbewahrungsfrist behalten und der Personendatensatz eine opake ID behält; solange offene Posten oder aktive Mandate bestehen, MUSS die Anonymisierung gesperrt sein.

#### Scenario: Durch offenen Posten blockiert
- **WHEN** ein Admin eine Person mit einer offenen Rechnung anonymisiert
- **THEN** lehnt das System ab und nennt den offenen Posten

#### Scenario: Rechnung behält Snapshot
- **WHEN** ein ehemaliges Mitglied ohne offene Posten anonymisiert wird
- **THEN** zeigt das Profil keine personenbezogenen Daten und die ausgestellten Rechnungen zeigen weiterhin den ursprünglichen Namen und die ursprüngliche Adresse

### Requirement: Löschsperre (Legal Hold)
Das System MUSS (SHALL) berechtigten Benutzer:innen erlauben, eine Löschsperre (Legal Hold) auf eine Person oder einen Datensatz zu setzen, die Löschung und Anonymisierung bis zur Aufhebung verhindert.

#### Scenario: Löschsperre verhindert Löschung
- **WHEN** die Löschung einer Person unter Löschsperre fällig ist
- **THEN** wird die Person übersprungen und mit dem Grund der Sperre aufgeführt

### Requirement: Auskunftsexport für Betroffene
Das System MUSS (SHALL) für eine Person ein ZIP mit maschinenlesbarem JSON und einem menschenlesbaren PDF aller Daten über sie erzeugen, einschließlich Einwilligungen, Mitgliedschaften, Rechnungen, Spenden, versendeter E-Mails und Audit-Einträgen über sie, ausgeführt als Job, der die Monatsfrist überwacht; dasselbe Datenblatt MUSS als Massenaktion verfügbar sein.

#### Scenario: Vollständiger Export
- **WHEN** ein Admin einen Auskunftsexport für ein Mitglied startet
- **THEN** enthält das ZIP JSON und PDF mit Profil, Einwilligungen, Mitgliedschaften, Rechnungen, Spenden, Zustellungen und Audit-Einträgen

### Requirement: Rohdatenspeicher sind erfasst
Das System MUSS (SHALL) Rohdatenspeicher in das Löschregister aufnehmen: Bank-`raw`-JSON sowie gespeicherte SEPA- und CAMT-Dateien werden verschlüsselt und mit der Aufbewahrungsfrist für Belege aufbewahrt, und Importer-Nutzdaten werden 90 Tage nach der Freigabe des Imports gelöscht.

#### Scenario: Bereinigung der Importdaten
- **WHEN** seit der Freigabe des Abgleichs 90 Tage vergangen sind
- **THEN** werden die rohen Importer-Nutzdaten gelöscht, während Quell- und Ziel-IDs erhalten bleiben

### Requirement: Löschung übersteht Wiederherstellung
Das System MUSS (SHALL) für jede Löschung einen Eintrag im Löschprotokoll schreiben, der nur opake IDs enthält, und `ovctl restore` MUSS das Löschprotokoll vor dem Start der Anwendung erneut anwenden, damit die Wiederherstellung eines älteren Backups gelöschte Personen nicht zurückbringt.

#### Scenario: Älteres Backup wiederherstellen
- **WHEN** ein Backup wiederhergestellt wird, das vor der Anonymisierung einer Person erstellt wurde
- **THEN** wird die Person erneut anonymisiert, bevor die Anwendung Anfragen annimmt

### Requirement: Prüfungen zu DSB und DSFA
Das System MUSS (SHALL) in der Checkliste für die Ersteinrichtung warnen, wenn 15 oder mehr Benutzer:innen Leserechte für Mitglieder haben (Pflicht zur Benennung eines DSB nach § 38 BDSG), und MUSS eine DSFA mit vorausgefüllter Vorlage anfordern, wenn benutzerdefinierte Felder als Gesundheitsdaten markiert sind oder Mitglieder unter 16 Jahren existieren.

#### Scenario: DSB-Warnung
- **WHEN** die 15. Person mit Leserechten für Mitglieder als Benutzer:in angelegt wird
- **THEN** zeigt die Checkliste die DSB-Warnung

### Requirement: Nur notwendige Cookies
Das System MUSS (SHALL) ausschließlich technisch notwendige Cookies (Sitzung, CSRF, Sprache) setzen und keine Ressourcen von Dritten laden, damit kein Einwilligungsbanner nötig ist.

#### Scenario: Cookie-Verzeichnis
- **WHEN** eine Besucherin oder ein Besucher das öffentliche Aufnahmeformular öffnet
- **THEN** wird außer den notwendigen Cookies kein Cookie gesetzt

### Requirement: Erneutes Anwenden von Löschungen beim Start
Das System MUSS (SHALL) jede Löschung (Organisations-ID, Personen-ID, Zeitpunkt) an eine Datei neben den gespeicherten Dateien anhängen und beim Start, bevor Anfragen angenommen werden, jede aufgeführte Person erneut anonymisieren, die vorhanden und nicht anonymisiert ist.

#### Scenario: Wiederhergestelltes Backup
- **WHEN** die Datenbank aus einem Backup wiederhergestellt wird, das erstellt wurde, bevor eine Person anonymisiert wurde, und der Server startet
- **THEN** wird die Person erneut anonymisiert, bevor die erste Anfrage beantwortet wird

