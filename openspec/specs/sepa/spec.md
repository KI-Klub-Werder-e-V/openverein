# sepa Specification

## Purpose
Die Capability sepa umfasst SEPA-Mandate, Lastschrift-Einzugsläufe (pain.008.001.08) mit Vorabankündigung (Pre-Notification) und Schutz vor Doppeleinzug, Überweisungsdateien (pain.001.001.09), den Import von Kontoauszügen aus CAMT.053 und CSV, die Zuordnung von Zahlungen mit dem Abgleich-Posteingang sowie die Bearbeitung von Rücklastschriften (B M14, M15, M16, M17, M18, M19). Alle Beträge sind ganzzahlige Cent. Punkte, die B mit „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: Mandatsdatensätze
Das System MUSS (SHALL) jedes SEPA-Mandat als eigenen Datensatz speichern mit Referenz (höchstens 35 Zeichen aus dem SEPA-Zeichensatz, eindeutig pro Gläubiger-ID, nach einem Muster wie `{member_no}-{seq}` erzeugt oder eingegeben, importierte Referenzen unverändert), Unterschriftsdatum, zahlungspflichtiger Person, Name des Kontoinhabers, per Mod-97 geprüfter IBAN, optionaler BIC (bei deutschen IBANs aus der BLZ-Datei der Bundesbank abgeleitet), Verfahren (CORE oder B2B), Typ (wiederkehrend oder einmalig) und Nachweisdatei, und MUSS ein vorausgefülltes Mandatsformular als PDF erzeugen.

#### Scenario: Ungültige IBAN
- **WHEN** eine IBAN mit falscher Prüfziffer eingegeben wird
- **THEN** wird das Mandat abgelehnt

#### Scenario: Ungültiges Zeichen in der Referenz
- **WHEN** eine Referenz `ä` oder `_` enthält
- **THEN** wird das Mandat unter Nennung des erlaubten Zeichensatzes abgelehnt

### Requirement: Lebenszyklus des Mandats
Das System MUSS (SHALL) die Zustände `pending_evidence`, `active`, `amended`, `revoked` und `expired` verwenden, nur `active` Mandate einziehen, Änderungen (IBAN, Name des Kontoinhabers, Referenz) mit Datum in einer Historie erfassen, damit der nächste Einzug die von pain.008 verlangten Änderungsangaben trägt, Widerrufe mit Datum und Quelle (Mitglied, Bank, Admin) erfassen sowie jedes 36 Monate ungenutzte Mandat 60 Tage vorher ankündigen und dann auf `expired` setzen.

#### Scenario: Ausstehendes Mandat wird nicht eingezogen
- **WHEN** ein Einzugslauf für ein Mitglied vorbereitet wird, dessen Mandat `pending_evidence` ist
- **THEN** zeigt die Bereitschaftsspalte „nicht aktiv“ und die Rechnung wird nicht aufgenommen

#### Scenario: Änderung wird übermittelt
- **WHEN** die IBAN eines Mandats nach dem letzten Einzug geändert wurde
- **THEN** trägt die nächste pain.008-Position die Änderungsangaben

#### Scenario: Ablauf
- **WHEN** ein Mandat 36 Monate lang nicht genutzt wurde
- **THEN** setzt der nächtliche Job es auf `expired`

### Requirement: Schutz der IBAN
Das System MUSS (SHALL) IBANs im Ruhezustand verschlüsseln, für die Zuordnung einen schlüsselbasierten Hash vorhalten und IBANs nur Benutzer:innen mit der Feldberechtigung für die IBAN vollständig zeigen; alle anderen MÜSSEN eine maskierte Form wie `DE•• •••• •••• •••• ••12 34` sehen.

#### Scenario: Maskierte IBAN
- **WHEN** eine Benutzer:in ohne IBAN-Berechtigung ein Mandat öffnet
- **THEN** wird nur die maskierte IBAN mit den letzten vier Ziffern angezeigt

### Requirement: Vorbereitung des Einzugslaufs
Das System MUSS (SHALL) einen Lastschriftlauf aus ausgewählten offenen Forderungen anlegen (alle mit aktivem Mandat, eine gespeicherte Ansicht oder handverlesen) mit Bereitschaftsspalte (Mandat OK, fehlt, nicht aktiv, Überweisungszahler) und Einstellungen für Gläubigerkonto, validierte Gläubiger-ID, gewünschtes Einzugsdatum, Sammelbuchung und eine Position pro Rechnung oder pro zahlungspflichtiger Person; das Einzugsdatum MUSS gegen TARGET2-Geschäftstage und die Mindestvorlaufzeit des Bankkontos geprüft werden (Standard 2 Geschäftstage, bei CORE nie unter D-1), und als Datum MUSS heute plus 5 Geschäftstage vorgeschlagen werden.

#### Scenario: Datum zu früh
- **WHEN** bei 2 Tagen Vorlaufzeit ein Einzugsdatum einen Geschäftstag voraus gewählt wird
- **THEN** kann der Lauf erst erzeugt werden, wenn ein gültiges Datum gewählt ist

#### Scenario: Feiertag übersprungen
- **WHEN** das vorgeschlagene Datum auf einen TARGET2-Feiertag fiele
- **THEN** wird der nächste TARGET2-Geschäftstag vorgeschlagen

### Requirement: Dateiaufteilung nach Auftragslimit
Das System MUSS (SHALL) Einzugsdateien so aufteilen, dass kein Payment-Information-Block mehr als 999 Transaktionen enthält und, sofern das Bankkonto ein Auftragslimit hat, die Kontrollsumme keiner Datei es überschreitet.

#### Scenario: Auftragslimit
- **WHEN** ein Lauf insgesamt 3000000 Cent umfasst und das Auftragslimit 2000000 Cent beträgt
- **THEN** werden mindestens zwei Dateien erzeugt, jede mit höchstens 2000000 Cent

### Requirement: Vorlage für den Verwendungszweck der Lastschrift (sollte)
Das System MUSS (SHALL) den Verwendungszweck jeder Lastschrift aus einer Vorlage mit Platzhaltern für Rechnungsnummer, Mitgliedsnummer und Zeitraum erzeugen, begrenzt auf 140 Zeichen des SEPA-Zeichensatzes.

#### Scenario: Verwendungszweck erzeugt
- **WHEN** die Vorlage `Beitrag {period} Mitgl. {member_no} Re {invoice_no}` lautet
- **THEN** trägt jede Lastschrift den erzeugten Text mit höchstens 140 Zeichen

### Requirement: Vorabankündigung
Das System MUSS (SHALL) jeder zahlungspflichtigen Person per E-Mail oder Brief eine Vorabankündigung mit Betrag, Einzugsdatum, Mandatsreferenz und Gläubiger-ID senden, mindestens die konfigurierte Anzahl Tage vor dem Einzugsdatum (Standard 14, mindestens 1, falls im Mandat vereinbart), und jede Benachrichtigung pro zahlungspflichtiger Person und Lauf protokollieren.

#### Scenario: Verspätete Vorabankündigung
- **WHEN** Vorabankündigungen 14 Tage vor dem Einzugsdatum noch nicht versendet sind
- **THEN** warnt der Lauf und schlägt ein späteres Einzugsdatum vor

### Requirement: Erzeugung von pain.008 und gespeicherte Bytes
Das System MUSS (SHALL) pain.008.001.08-Dateien mit Sequenztyp RCUR erzeugen (OOFF für einmalige Mandate, FRST optional per Einstellung), sie vor dem Anbieten gegen das offizielle XSD validieren und die exakten Bytes, SHA-256, Message-ID und Schemaversion am Lauf speichern, sodass jeder erneute Download dieselben Bytes liefert.

#### Scenario: XSD-Fehler
- **WHEN** eine erzeugte Datei die XSD-Validierung nicht besteht
- **THEN** wird sie nicht zum Download angeboten und der Fehler wird angezeigt

#### Scenario: Erneuter Download
- **WHEN** eine erzeugte Datei erneut heruntergeladen wird
- **THEN** entspricht ihr SHA-256 dem gespeicherten Hash

### Requirement: Schutz vor Doppeleinzug
Das System MUSS (SHALL) zulassen, dass jede Rechnung jeweils höchstens in einer Einzugsposition aktiv ist, durchgesetzt durch einen Datenbank-Constraint, auch wenn eine Position pro zahlungspflichtiger Person mehrere Rechnungen trägt; eine Rechnung bleibt von der Aufnahme an aktiv, bis ihre Position zurückgegeben oder ihr Lauf freigegeben wird, und ihre Auswahl für einen anderen Lauf MUSS so lange gesperrt sein.

#### Scenario: Zweiter Lauf gesperrt
- **WHEN** eine Rechnung in einem `downloaded` Lauf für einen neuen Lauf ausgewählt wird
- **THEN** verweigert das System ihre Aufnahme

#### Scenario: Position pro zahlungspflichtiger Person
- **WHEN** eine Position pro zahlungspflichtiger Person die Rechnungen A und B trägt und ein zweiter Lauf B aufnehmen will
- **THEN** wird B abgelehnt

### Requirement: Zustände und Freigabe des Einzugslaufs
Das System MUSS (SHALL) Läufe durch `draft` → `generated` → `downloaded` (beim ersten Datei-Download gesetzt) → `submitted` (von der Kassenwart:in markiert) → `settled` oder `partly_returned` sowie `released` führen; ein `generated` Lauf, der nie heruntergeladen wurde, DARF abgebrochen werden und gibt seine Rechnungen frei; ein `downloaded` Lauf DARF nur freigegeben werden, wenn die Kassenwart:in mit TOTP bestätigt, dass die Datei nie hochgeladen wurde, oder wenn importierte Kontoauszüge nach dem Einzugsdatum zeigen, dass er nicht ausgeführt wurde.

#### Scenario: Freigabe eines heruntergeladenen Laufs
- **WHEN** eine Kassenwart:in einen `downloaded` Lauf freigibt
- **THEN** verlangt das System TOTP und die Erklärung, dass die Datei nie eingereicht wurde, bevor es die Rechnungen freigibt

#### Scenario: Automatischer Zustand „heruntergeladen“
- **WHEN** die Datei eines `generated` Laufs zum ersten Mal heruntergeladen wird
- **THEN** wechselt der Lauf zu `downloaded`

### Requirement: Überweisungsdateien
Das System MUSS (SHALL) pain.001.001.09-Dateien aus ausgewählten offenen Verbindlichkeiten (Belege, Gutschriften, Erstattungen von Überzahlungen) erzeugen, XSD-validiert und mit Bytes, Hash, Ausführungsdatum und Auftraggeberkonto gespeichert, in jedem Verwendungszweck die Beleg- oder Gutschriftsnummer angeben und Verbindlichkeiten in einem erzeugten Überweisungslauf für einen zweiten Lauf sperren.

#### Scenario: Verbindlichkeit doppelt bezahlt
- **WHEN** ein Beleg, der bereits in einem erzeugten Überweisungslauf ist, erneut ausgewählt wird
- **THEN** verweigert das System dies

### Requirement: Import von Kontoauszügen
Das System MUSS (SHALL) CAMT.053 (.001.02 und .001.08, Sammelbuchungen in Positionen aufgeteilt) und CSV über gespeicherte Bankprofile importieren (Spaltenzuordnung, Datumsformat, Dezimaltrennzeichen, Kodierung; Vorlagen für Sparkasse, Volksbank, Deutsche Bank, Commerzbank, GLS, ING, DKB); es MUSS die Rohdatei verschlüsselt mit SHA-256 speichern, dieselbe Datei kein zweites Mal annehmen, überlappende Zeiträume per Fingerabdruck der Kontobewegung deduplizieren (Fast-Dubletten zur Prüfung), den Abschluss sperren, wenn Anfangs- und Endsaldo nicht zum laufenden Saldo passen (Übersteuerung mit Begründung), XML mit DOCTYPE ablehnen und das Zurückrollen eines Imports erlauben, solange keine seiner Kontobewegungen gebucht ist.

#### Scenario: Dieselbe Datei zweimal
- **WHEN** eine CAMT-Datei mit bekanntem SHA-256 erneut für dasselbe Konto importiert wird
- **THEN** wird der Import abgelehnt

#### Scenario: Überlappende Kontoauszüge
- **WHEN** zwei Kontoauszüge den 1.–15. und den 10.–31. März abdecken
- **THEN** werden die Kontobewegungen vom 10.–15. März nur einmal importiert

#### Scenario: Saldoabweichung
- **WHEN** der Anfangssaldo des Kontoauszugs vom laufenden Saldo des Kontos abweicht
- **THEN** ist der Abschluss gesperrt, sofern er nicht mit Begründung übersteuert wird

### Requirement: Zahlungszuordnung und Abgleich-Posteingang
Das System MUSS (SHALL) Kontobewegungen nach Regeln in fester Reihenfolge zuordnen (End-to-End-ID einer Einzugsposition; Rechnungsnummer im Verwendungszweck; Mandatsreferenz; Mitgliedsnummer; Betrag plus IBAN der Gegenpartei gegen offene Posten; gelernte Gegenpartei-Regeln), jeden Vorschlag mit Score 0–100, Regel und hervorgehobenem Treffertext zeigen, nur Regeln 1–2 oberhalb eines konfigurierbaren Schwellenwerts (Standard 95) automatisch bestätigen und alles andere in einem Posteingang mit Zählern (nicht zugeordnet, vorgeschlagen, Beleg fehlt) und Tastatur-Ablauf halten; Zuordnungen MÜSSEN n:m sein, der Rest wird Guthaben oder bleibt offen; Buchungen ohne Rechnung MÜSSEN direkt Konto, Sphäre und Kostenstelle zugeordnet werden; das Bestätigen einer Zuordnung MUSS die Buchung erzeugen und das Rückgängigmachen ein Storno buchen.

#### Scenario: Automatische Bestätigung per End-to-End-ID
- **WHEN** eine Gutschrift die End-to-End-ID einer Einzugsposition trägt und mit 98 bewertet wird
- **THEN** wird die Zuordnung automatisch bestätigt und gebucht

#### Scenario: Betragstreffer wartet
- **WHEN** eine Überweisung einem offenen Posten nur über Betrag und IBAN entspricht
- **THEN** wartet sie im Posteingang als Vorschlag

#### Scenario: Sammelüberweisung
- **WHEN** eine Überweisung über 9000 Cent drei Rechnungen über je 3000 Cent bezahlt
- **THEN** wird sie allen drei zugeordnet und jede ist `paid`

### Requirement: Massenzuordnung (sollte)
Das System MUSS (SHALL) mehrere ausgewählte ungebuchte Kontobewegungen in einem Schritt einem Sachkonto, einer Sphäre und einer Kostenstelle zuordnen; gebuchte Buchungen DÜRFEN nur durch Stornos geändert werden.

#### Scenario: Bankgebühren als Massenaktion
- **WHEN** eine Kassenwart:in zwölf ungebuchte Bankgebühren-Kontobewegungen auswählt und einem Konto zuordnet
- **THEN** werden zwölf Buchungen auf dieses Konto gebucht

### Requirement: Rücklastschriften
Das System MUSS (SHALL) Rücklastschriften anhand von CAMT-Rückgabecodes (zum Beispiel AC04, AM04, MD06, MS02) und der ursprünglichen End-to-End-ID erkennen, bei CSV anhand von Schlüsselwörtern ("Rücklastschrift", "Retoure", "Rückgabe") plus Betrag und IBAN; die Bearbeitung MUSS in einer Transaktion die Rücklastschrift mit der Einzugsposition verknüpfen, die Zuordnung stornieren und die Rechnung wieder öffnen, die Bankgebühr als Aufwand buchen, eine optionale Rücklastschriftgebühr als neue Position oder Rechnung hinzufügen, den Rückgabecode im Klartext auf Deutsch speichern, bei MD06 / MD01 Widerruf oder Prüfung des Mandats vorschlagen und optional eine Mahnstufe und Benachrichtigung des Mitglieds auslösen; mehrere Rücklastschriften eines Kontoauszugs MÜSSEN gesammelt bearbeitbar sein, mit optionalem Automatikmodus für Rücklastschriften mit hoher Sicherheit.

#### Scenario: Konto erloschen
- **WHEN** eine Rücklastschrift mit Code AC04 und 300 Cent Bankgebühr bearbeitet wird
- **THEN** wird die Rechnung wieder geöffnet, 300 Cent werden als Aufwand gebucht und als Grund wird "Konto erloschen" angezeigt

#### Scenario: Erstattung verlangt
- **WHEN** eine Rücklastschrift MD06 trägt
- **THEN** schlägt das System vor, das Mandat zu prüfen oder zu widerrufen

### Requirement: Vorabankündigung auf der Rechnung
Das System MUSS (SHALL) die SEPA-Vorabankündigung auf jede Rechnung eines per Lastschrift mit aktivem Mandat zahlenden Mitglieds drucken (Betrag, frühestes Einzugsdatum gleich dem Fälligkeitsdatum, Mandatsreferenz, Gläubiger-ID), diese Werte beim Ausstellen festschreiben und MUSS verweigern, eine Rechnung in einen Einzugslauf aufzunehmen, dessen Einzugsdatum vor ihrem Fälligkeitsdatum liegt.

#### Scenario: Einzug vor Fälligkeit
- **WHEN** eine Kassenwart:in am 2. November einen Lauf für eine am 15. November fällige Rechnung anlegt
- **THEN** wird der Lauf mit einem Hinweis auf die Vorabankündigung abgelehnt

### Requirement: Reihenfolge der automatischen Zuordnung
Das System MUSS (SHALL) importierte Kontobewegungen nur in diesen Fällen und in dieser Reihenfolge automatisch zuordnen: End-to-End-ID einer offenen Einzugsposition mit gleichem Betrag (ausgleichen), End-to-End-ID einer eingezogenen Position bei einer Belastung (Rücklastschrift), eine Gutschrift in Höhe der Kontrollsumme einer heruntergeladenen oder eingereichten Datei innerhalb von zehn Tagen nach deren Einzugsdatum, solange alle ihre Positionen offen sind (Datei ausgleichen), und genau eine Rechnungsnummer im Verwendungszweck mit exakt dem offenen Betrag (zuordnen); alles andere MUSS nur vorgeschlagen werden.

#### Scenario: Teilzahlung wird nur vorgeschlagen
- **WHEN** eine Überweisung über 2000 Cent eine Rechnung mit 5000 Cent offenem Betrag nennt
- **THEN** bleibt die Kontobewegung mit dieser Rechnung als Vorschlag im Posteingang und nichts wird gebucht

### Requirement: Mandatsänderung nach einer IBAN-Änderung
Das System MUSS (SHALL) das Mandat behalten, wenn eine angenommene IBAN-Änderung das Konto der zahlungspflichtigen Person ersetzt, und die nächste Lastschrift mit dem Änderungskennzeichen markieren: mit dem ursprünglichen Konto, wenn die Bank gleich bleibt, sonst mit dem ursprünglichen Zahlungsdienstleister `SMNDA`.

#### Scenario: Neue Bank
- **WHEN** die angenommene IBAN-Änderung eines Mitglieds das Konto zu einer anderen Bank verlegt und der nächste Lastschriftlauf erzeugt wird
- **THEN** trägt die Transaktion dieses Mitglieds `AmdmntInd` true und `OrgnlDbtrAgt` `SMNDA`, spätere Läufe nicht

### Requirement: Vorlage für den Verwendungszweck
Das System MUSS (SHALL) den Verwendungszweck jeder Lastschrift aus der Vorlage des Vereins erzeugen und Vorlagen mit unbekannten Platzhaltern ablehnen.

#### Scenario: Mitgliedsnummer im Verwendungszweck
- **WHEN** die Vorlage "Beitrag {{mitgliedsnummer}} {{rechnungsnummer}}" lautet und ein Lastschriftlauf erzeugt wird
- **THEN** lautet der Ustrd jeder Lastschrift "Beitrag <Mitgliedsnummer> <Rechnungsnummer>"

