# groups-and-roles Specification

## Purpose
Die Capability groups-and-roles umfasst Gruppen und Abteilungen mit datierter Zugehörigkeit, Rollen und Berechtigungen nach Modul, Abteilungsbereich und Feldebene einschließlich der eingebauten Rollen Steuerberater:in und Kassenprüfer:in sowie das nur fortschreibbare Audit-Protokoll (B M04, M32, M35). Punkte, die B als „sollte“ oder „könnte“ einstuft, sind im Namen der Anforderung entsprechend markiert; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: Gruppen und Abteilungen
Das System MUSS (SHALL) Gruppen der Art `division`, `segment`, `board` und `team` unterstützen, jeweils mit Name, eindeutigem Kürzel, einer Farbe, die in Listen als Badge erscheint, einer optionalen übergeordneten Gruppe (eine Ebene) und einem Schalter, ob die Gruppe im öffentlichen Aufnahmeantrag angeboten wird.

#### Scenario: Eindeutiges Kürzel
- **WHEN** ein Admin eine Gruppe mit einem Kürzel anlegt, das im Verein bereits existiert
- **THEN** lehnt das System sie ab

#### Scenario: Badge in der Liste
- **WHEN** die Mitgliederliste ein Mitglied der Gruppe "Jugend" zeigt
- **THEN** wird ein Badge in der Farbe der Gruppe angezeigt

### Requirement: Datierte Gruppenzugehörigkeit
Das System MUSS (SHALL) jede Gruppenzugehörigkeit mit `valid_from` und optionalem `valid_to` erfassen, überlappende Zugehörigkeiten desselben Mitglieds in derselben Gruppe ablehnen, den Verlauf der Gruppenwechsel im Mitgliedsprofil zeigen und Fragen zur Zugehörigkeit für jedes beliebige Datum beantworten.

#### Scenario: Überlappung abgelehnt
- **WHEN** ein Mitglied, das ab 1. Januar ohne Ende in "U17" ist, ab 1. März erneut hinzugefügt wird
- **THEN** wird die zweite Zugehörigkeit abgelehnt

#### Scenario: Zugehörigkeit an einem Datum
- **WHEN** ein Admin die Gruppe "U17" zum 1. März 2026 auflistet
- **THEN** werden genau die Mitglieder gezeigt, deren Zugehörigkeit dieses Datum umfasst

### Requirement: Gruppen nur für Admins
Das System MUSS (SHALL) erlauben, eine Gruppe als „nur Admins“ zu kennzeichnen; eine solche Gruppe DARF NIE im Mitgliederportal, in Dokumenten für Mitglieder oder in E-Mails an das Mitglied erscheinen.

#### Scenario: Im Portal verborgen
- **WHEN** ein Mitglied der Nur-Admin-Gruppe "Mahnliste" im Portal „Meine Gruppen“ öffnet
- **THEN** wird diese Gruppe nicht aufgeführt

### Requirement: Gruppen tragen keine Beiträge
Das System MUSS (SHALL) Beiträge von Gruppen getrennt halten; eine Gruppe DARF eine Standard-Beitragsart vorschlagen, die beim Eintritt eines Mitglieds in die Gruppe erst nach Bestätigung als eigene Beitragszuordnung angelegt wird.

#### Scenario: Vorgeschlagene Beitragsart
- **WHEN** ein Mitglied einer Gruppe mit Standard-Beitragsart hinzugefügt wird
- **THEN** wird der Admin gebeten, das Anlegen der Beitragszuordnung zu bestätigen, und ohne Bestätigung wird nichts zugeordnet

### Requirement: Modulberechtigungen und eingebaute Rollen
Das System MUSS (SHALL) je Modul `none`, `read` oder `write` vergeben (Mitglieder, Personen, Gruppen, Beiträge, Rechnungen, SEPA, Bank, Buchhaltung, Spenden, Kommunikation, Dokumente, Einstellungen, Audit, Importe / Exporte, API) und die eingebauten Rollen Admin, Kassenwart:in, Abteilungsleitung, Trainer:in, Mitglied (Portal), Steuerberater:in und Kassenprüfer:in mitliefern, die nicht bearbeitet, nur kopiert werden können; Admins und externe Benutzer:innen wie die Steuerberater:in müssen keine Mitglieder sein, und es gibt keine Platzbegrenzung.

#### Scenario: Eingebaute Rolle unveränderlich
- **WHEN** ein Admin die eingebaute Rolle Kassenwart:in bearbeitet
- **THEN** lehnt das System ab und bietet an, sie in eine eigene Rolle zu kopieren

#### Scenario: Externe Steuerberater:in
- **WHEN** ein Admin eine Benutzer:in für die Steuerberater:in ohne Mitgliedsdatensatz anlegt
- **THEN** kann sich die Benutzer:in mit der Rolle Steuerberater:in anmelden

### Requirement: Abteilungsbereich
Das System MUSS (SHALL) Rollenvergaben auf den ganzen Verein oder eine Menge von Gruppen mit optionalen Gültigkeitsdaten beschränken und den Bereich in der Anwendung und per Row-Level-Security durchsetzen: Mitglieder mehrerer Abteilungen sieht jede Leitung jeder ihrer Abteilungen; Haushaltsrechnungen zeigen einer Leitung nur Positionen von Mitgliedern im Bereich plus Name und Adresse der zahlenden Person; Nichtmitglieder erscheinen nur als zahlende Person; Adressbuch-Personen nur über freigegebene Adressgruppen; ehemalige Mitglieder bereichsgebundener Gruppen bleiben 12 Monate lesbar.

#### Scenario: Mitglied außerhalb des Bereichs
- **WHEN** die Leitung von "Tennis" ein Mitglied abruft, das nur in "Fußball" ist
- **THEN** antwortet die API so, als gäbe es den Datensatz in ihrem Bereich nicht

#### Scenario: Haushaltsrechnung teilweise im Bereich
- **WHEN** eine Abteilungsleitung eine Haushaltsrechnung mit Positionen für ein Mitglied innerhalb und eines außerhalb des Bereichs öffnet
- **THEN** werden nur die Position im Bereich sowie Name und Adresse der zahlenden Person gezeigt, nicht die Summe

### Requirement: Einschränkungen auf Feldebene
Das System MUSS (SHALL) Felder (IBAN, Geburtsdatum, sensible benutzerdefinierte Felder, interne Notizen) je Rolle einschränken, und eingeschränkte Felder MÜSSEN in UI, API-Antworten, Exporten, E-Mail-Platzhaltern, PDFs, Suchergebnissen und Audit-Diffs fehlen; die Rolle Steuerberater:in MUSS Personen nur mit Name, Adresse und Debitoren- / Kreditorennummer sehen.

#### Scenario: Trainer:in sieht keine IBAN
- **WHEN** eine Trainer:in ein Mitgliedsprofil öffnet oder die Mitgliederliste exportiert
- **THEN** erscheint die IBAN in keinem von beiden

#### Scenario: Sicht der Steuerberater:in
- **WHEN** eine Steuerberater:in eine Person öffnet
- **THEN** werden nur Name, Adresse und Debitoren- / Kreditorennummer zurückgegeben

### Requirement: Ansicht zum Prüfen von Berechtigungen
Das System MUSS (SHALL) eine Ansicht „Rechte prüfen“ anbieten, die für eine gewählte Benutzer:in die effektiven Rechte je Modul, den Bereich und die eingeschränkten Felder zeigt, berechnet von denselben Policy-Funktionen, die den Zugriff durchsetzen.

#### Scenario: Effektive Rechte
- **WHEN** ein Admin eine Benutzer:in prüft, die Trainer:in für "U17" ist
- **THEN** listet die Ansicht Lesezugriff auf Mitglieder im Bereich "U17" und die eingeschränkten Felder IBAN und Geburtsdatum wie konfiguriert

### Requirement: Maschinenlesbare Autorisierungsablehnungen
Das System MUSS (SHALL) jede Autorisierungsablehnung an der API mit einem Problem-Dokument nach RFC 9457 beantworten, das die fehlende Berechtigung nennt.

#### Scenario: Abgelehnter Schreibzugriff
- **WHEN** eine Benutzer:in mit reinem Lesezugriff eine schreibende Anfrage sendet
- **THEN** lautet die Antwort 403 mit einem Problem-Dokument, das die fehlende Berechtigung nennt

### Requirement: Jobs handeln mit aktuellen Rechten
Das System MUSS (SHALL) von Benutzer:innen gestartete Jobs als deren Akteur ausführen, die Rechte dieses Akteurs zu Beginn jedes Teilschritts neu laden und den Job stoppen, wenn die Benutzer:in deaktiviert oder die Rechtevergabe entzogen wird; Systemjobs MÜSSEN als Akteur `system` mit einem festen, im Audit-Protokoll ausgewiesenen Berechtigungssatz laufen.

#### Scenario: Rechtevergabe während des Jobs entzogen
- **WHEN** einer Benutzer:in die Rollenvergabe entzogen wird, während ihr Massenjob läuft
- **THEN** stoppt der Job beim nächsten Teilschritt und meldet den Grund

### Requirement: Audit-Ereignisse
Das System MUSS (SHALL) im Audit-Protokoll jedes Anlegen, Ändern und löschungsgleiche Ereignis mit Vorher- / Nachher-Werten auf Feldebene (maskiert für Benutzer:innen ohne Feldrecht), Statusübergänge, Anmeldungen und fehlgeschlagene Anmeldungen, Exporte, Massenaktionen, Berechtigungsänderungen, versendete E-Mails und Änderungen der Periodensperre erfassen, jeweils mit Akteur (Benutzer:in, API-Token oder System), Zeit und Entität.

#### Scenario: Maskierter Diff
- **WHEN** eine Benutzer:in ohne IBAN-Recht den Audit-Eintrag einer IBAN-Änderung liest
- **THEN** sind Vorher- und Nachher-Wert maskiert

#### Scenario: Token-Schreibzugriffe zugeordnet
- **WHEN** ein API-Token ein Mitglied ändert
- **THEN** nennt das Audit-Ereignis den Token

### Requirement: Nur fortschreibbares Audit-Protokoll mit Aufbewahrungsfrist
Das System MUSS (SHALL) Audit-Zeilen für jede Rolle einschließlich Admins nur fortschreibbar halten und sie per Job nach Aufbewahrungsfrist je Ereignisklasse löschen (Standard: Anmeldeereignisse 12 Monate, Datenänderungen 6 Jahre, finanzbezogene Ereignisse 10 Jahre).

#### Scenario: Admin kann Audit-Zeilen nicht bearbeiten
- **WHEN** eine beliebige Benutzer:in oder die Anwendungsrolle versucht, eine Audit-Zeile zu ändern oder zu löschen
- **THEN** lehnt die Datenbank ab

#### Scenario: Löschung nach Aufbewahrungsfrist
- **WHEN** der Löschjob läuft
- **THEN** werden Anmeldeereignisse älter als 12 Monate entfernt, und finanzbezogene Ereignisse jünger als 10 Jahre bleiben erhalten

### Requirement: Suche und Export im Audit-Protokoll
Das System MUSS (SHALL) berechtigten Benutzer:innen erlauben, das Audit-Protokoll nach Modul, Benutzer:in, Entität und Datum zu filtern, Entitätsbezeichnungen im Volltext zu durchsuchen, Einträge je Datensatz als Zeitleiste anzusehen und Ergebnisse als CSV, XLSX oder PDF zu exportieren.

#### Scenario: Nach Entität filtern
- **WHEN** ein Admin das Audit-Protokoll nach einem Mitglied und einem Datumsbereich filtert
- **THEN** werden nur Ereignisse zu diesem Mitglied in diesem Bereich gezeigt und können exportiert werden

### Requirement: Einladungen per Einmal-Link
Das System MUSS (SHALL) neue Benutzer:innen ohne Passwort anlegen und ein 7 Tage gültiges Einmal-Einladungstoken zurückgeben, das nur als Hash gespeichert wird; das Annehmen setzt das Passwort und meldet die Benutzer:in an; ein benutztes oder abgelaufenes Token MUSS abgelehnt werden; ein Admin kann einen neuen Link ausstellen, der den alten ungültig macht.

#### Scenario: Link zweimal benutzt
- **WHEN** ein Einladungslink ein zweites Mal benutzt wird
- **THEN** lehnt das System ihn ab, und das Passwort bleibt unverändert

### Requirement: Mindestens ein Admin bleibt
Das System MUSS (SHALL) jede Änderung ablehnen, die den Verein ohne aktive Benutzer:in mit der unbeschränkten eingebauten Rolle Admin zurücklassen würde, und MUSS ablehnen, dass Benutzer:innen ihr eigenes Konto deaktivieren.

#### Scenario: Letzter Admin herabgestuft
- **WHEN** der einzige Admin die eigene Rolle auf Kassenwart:in ändert
- **THEN** wird die Anfrage mit einem Problem-Dokument abgelehnt, und nichts ändert sich

### Requirement: Altersabhängiger Gruppenwechsel
Das System MUSS (SHALL) Mitglieder einer Gruppe mit Altersregel bei Erreichen des Alters (am Geburtstag oder am 1. Januar) in die Zielgruppe verschieben und anstehende Wechsel vorab anzeigen.

#### Scenario: 18. Geburtstag
- **WHEN** ein Mitglied von "Jugend" (Regel: 18, Geburtstag, nach "Erwachsene") gestern 18 geworden ist
- **THEN** beendet der nächste Lauf die Zugehörigkeit zu Jugend zum gestrigen Tag, beginnt Erwachsene heute und protokolliert den Wechsel

