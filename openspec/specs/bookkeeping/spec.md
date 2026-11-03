# bookkeeping Specification

## Purpose
Die Capability bookkeeping umfasst die Einnahmen-Überschuss-Rechnung (EÜR) auf einem ausgeglichenen, nur fortschreibbaren Buchungsjournal mit SKR-Konten, steuerlichen Sphären, Kostenstellen und Steuersätzen, Bank- und Kassenkonten mit Kassenbuch, Belege, die GoBD-Periodensperre mit Korrekturen per Storno, EÜR- und Kontenberichte mit dem Export für die Betriebsprüfung, den DATEV-EXTF-Export, ausgehende E-Rechnungen sowie Spenden mit Zuwendungsbestätigungen nach BMF-Muster (B M20, M21, M22, M23, M24, M25, M26, M43). Alle Beträge sind ganzzahlige Cent. Punkte, die B mit „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: Kontenplan
Das System MUSS (SHALL) SKR 42 und SKR 49 als versionierte Vorlagen mitliefern, eigene Konten erlauben und bebuchte Konten nur stilllegen, nicht löschen lassen, damit alte Berichte reproduzierbar bleiben.

#### Scenario: Bebuchtes Konto
- **WHEN** ein Admin ein Konto mit gebuchten Positionen löscht
- **THEN** lehnt das System ab und bietet an, es stillzulegen

### Requirement: Konten in Auswahllisten ausblenden (sollte)
Das System MUSS (SHALL) erlauben, Konten in Auswahllisten auszublenden, ohne sie stillzulegen.

#### Scenario: Ausgeblendetes Konto
- **WHEN** ein Konto ausgeblendet wird
- **THEN** erscheint es nicht mehr in den Auswahllisten beim Buchen, bleibt aber in Berichten

### Requirement: Steuerliche Sphären
Das System MUSS (SHALL) jede Position auf eine der vier Sphären (ideeller Bereich, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb) oder auf den SKR-42-Sammelcode 9 buchen, warnen, wenn die Bruttoeinnahmen des wirtschaftlichen Geschäftsbetriebs in einem Jahr 80 % von 50.000 EUR erreichen, und Code 9 für das Jahr sperren, sobald sie 50.000 EUR überschreiten.

#### Scenario: Grenze überschritten
- **WHEN** die Bruttoeinnahmen des wirtschaftlichen Geschäftsbetriebs für 2027 5000001 Cent erreichen
- **THEN** werden neue Buchungen auf Code 9 für 2027 gesperrt

#### Scenario: Frühwarnung
- **WHEN** sie 4000000 Cent erreichen
- **THEN** wird eine Warnung angezeigt

### Requirement: Steuersätze als Datensätze
Das System MUSS (SHALL) Steuersätze als Datensätze führen (Satz, gültig von / bis, Umsatzsteuerkonto, Vorsteuerkonto), vorbelegt mit den deutschen Sätzen einschließlich der historischen 5 % und 16 %, vereinseigene Sätze erlauben und Positionen auf einen Satz verweisen lassen, aus dem DATEV und E-Rechnungen die Konten lesen.

#### Scenario: Historischer Steuersatz
- **WHEN** ein Beleg mit Datum in der zweiten Jahreshälfte 2020 mit 16 % erfasst wird
- **THEN** wird der vorbelegte, an diesem Datum gültige 16-%-Satz verwendet

### Requirement: Ausgeglichenes, nur ergänzbares Buchungsjournal
Das System MUSS (SHALL) nur ausgeglichene Buchungen buchen (Summe Soll gleich Summe Haben), jeweils mit Datum, Buchungsnummer, Text, Quelle (Kontobewegung, Rechnung, Beleg, manuell, Storno, Import), buchender Person und Belegdateien; gebuchte Buchungen und Positionen MÜSSEN auf Datenbankebene unveränderlich sein, und das Ausstellen einer Rechnung DARF NICHT ins Buchungsjournal buchen (Ist-Versteuerung), eine bestätigte Zahlungszuordnung hingegen schon.

#### Scenario: Unausgeglichene Buchung
- **WHEN** eine Buchung mit 10000 Cent Soll und 9000 Cent Haben festgeschrieben wird
- **THEN** schlägt die Transaktion fehl

#### Scenario: Änderung abgelehnt
- **WHEN** irgendeine Rolle versucht, eine gebuchte Position zu ändern oder zu löschen
- **THEN** löst die Datenbank einen Fehler aus

### Requirement: EÜR-Buchungsmaske mit Positionen zu mehreren Steuersätzen
Das System MUSS (SHALL) Kassenwart:innen „Einnahme / Ausgabe auf Konto X, Sphäre Y, Kostenstelle Z“ buchen lassen und daraus die doppelten Buchungspositionen erzeugen, wobei Soll und Haben verborgen bleiben, solange die Details nicht geöffnet werden; ein Beleg oder eine Buchung DARF Positionen mit 0 %, 7 % und 19 % enthalten.

#### Scenario: Beleg mit mehreren Steuersätzen
- **WHEN** ein Beleg Positionen mit 7 % und 19 % hat
- **THEN** wird eine Buchung mit getrennten Steuerpositionen für jeden Satz gebucht

### Requirement: Bank- und Kassenkonten mit Kassenbuch
Das System MUSS (SHALL) Bank-, Kassen- und Zahlungsanbieterkonten mit IBAN, BIC, Inhaber:in, Anfangssaldo und -datum, verknüpftem Sachkonto und Standardsphäre führen, laufende und stichtagsbezogene Salden zeigen, je Kasse ein Kassenbuch mit chronologisch nummerierten Buchungen, Tagessaldo und Beleg je Buchung führen, Kassenbuchungen ablehnen, die den Bestand negativ machen, Umbuchungen zwischen eigenen Konten als Geldtransit-Paar statt als Einnahme buchen und das Kassenbuch als PDF exportieren.

#### Scenario: Negativer Kassenbestand abgelehnt
- **WHEN** eine Barausgabe von 5000 Cent erfasst wird, während die Kasse 3000 Cent enthält
- **THEN** wird die Buchung mit einer Erklärung abgelehnt

#### Scenario: Bareinzahlung
- **WHEN** 20000 Cent von der Kasse auf die Bank übertragen werden
- **THEN** wird ein Geldtransit-Paar gebucht und die EÜR zeigt keine Einnahme

### Requirement: Belege
Das System MUSS (SHALL) Lieferantenbelege mit Lieferant, Nummer, Datum, Fälligkeit, Positionen (Text, Betrag, Steuersatz, Konto, Sphäre, Kostenstelle) und per Drag-and-drop oder Handykamera hochgeladenen Dateien erfassen, mit den Zuständen `recorded` → `open` → `paid` → gebucht; ZUGFeRD- und XRechnung-Dateien MÜSSEN unverändert gespeichert werden, mit PDF-Anzeige und manuell erfassten Positionen; es MUSS bei gleichem Lieferanten und gleicher Nummer oder gleichem Dateihash warnen.

#### Scenario: Doppelter Beleg
- **WHEN** eine Belegdatei mit bekanntem SHA-256 hochgeladen wird
- **THEN** warnt das System, dass es sich um eine Dublette handeln könnte

### Requirement: Eigenbelege (sollte)
Das System MUSS (SHALL) für Ausgaben ohne Lieferantenbeleg einen Eigenbeleg mit Grund, Datum, Betrag und unterzeichnender Person erstellen, ihn als PDF rendern und wie jeden Beleg speichern.

#### Scenario: Eigenbeleg
- **WHEN** ein:e Kassenwart:in eine Parkgebühr von 1500 Cent ohne Ticket erfasst
- **THEN** wird ein Eigenbeleg als PDF mit der Buchung gespeichert

### Requirement: GoBD-Periodensperre und Abschluss
Das System MUSS (SHALL) jede Buchung, jedes Storno und jede Zuordnung mit Datum am oder vor dem Sperrdatum der Organisation ablehnen; das Zurücksetzen des Sperrdatums MUSS die Rolle Kassenwart:in mit TOTP und einen Grund erfordern und im Audit-Protokoll erfasst werden; der Abschluss einer Periode MUSS einen Bericht-Snapshot speichern (EÜR-Summen, Kontensalden, Hash); und das System MUSS aus der Konfiguration einen Entwurf der Verfahrensdokumentation erzeugen.

#### Scenario: Buchung in gesperrte Periode
- **WHEN** das Sperrdatum der 31. Dezember 2026 ist und eine Buchung mit Datum 15. Dezember 2026 gebucht wird
- **THEN** wird sie abgelehnt

#### Scenario: Entsperren wird protokolliert
- **WHEN** ein:e Kassenwart:in das Sperrdatum mit TOTP und Grund zurücksetzt
- **THEN** wird die Änderung übernommen und mit dem Grund im Audit-Protokoll erfasst

### Requirement: Korrektur durch Storno
Das System MUSS (SHALL) gebuchte Buchungen ausschließlich durch eine Stornobuchung (je nach Einstellung zum ursprünglichen Datum oder zu heute) plus eine vorausgefüllte neue Buchung korrigieren.

#### Scenario: Buchung korrigieren
- **WHEN** eine Benutzer:in bei einer gebuchten Buchung „korrigieren“ wählt
- **THEN** wird eine Stornobuchung gebucht und eine neue vorausgefüllte Buchung öffnet sich; das Original bleibt unverändert

### Requirement: EÜR- und Kontenberichte
Das System MUSS (SHALL) die EÜR für beliebige Zeiträume je Sphäre und gesamt mit Netto-, Brutto- und Steuerspalten und Drill-down, Kontenblätter je Konto, eine Summen- und Saldenliste und einen Kostenstellenbericht als PDF und XLSX erzeugen (große Berichte als Jobs), mit einem Warnbereich über jedem Bericht (ungebuchte Kontobewegungen, Kontobewegungen ohne Beleg, Code 9 über der Grenze, offene Zuordnungen, Abweichungen beim Banksaldo, Konten ohne DATEV-Zuordnung); ein Bericht für eine abgeschlossene Periode MUSS seinem Snapshot entsprechen oder die Abweichung zeigen.

#### Scenario: Warnungen werden angezeigt
- **WHEN** der EÜR-Zeitraum drei Kontobewegungen ohne Beleg enthält
- **THEN** zeigt der Warnbereich „3 Kontobewegungen ohne Beleg“ mit einem Link

#### Scenario: Abweichung vom Snapshot
- **WHEN** ein Bericht einer abgeschlossenen Periode von seinem gespeicherten Snapshot abweicht
- **THEN** zeigt der Bericht die Abweichung

### Requirement: Export für den Datenzugriff der Betriebsprüfung
Das System MUSS (SHALL) je Geschäftsjahr das GoBD-Z3-Datenüberlassungspaket im Beschreibungsstandard exportieren (`index.xml` plus eine CSV pro Tabelle: Buchungsjournal, Positionen, Konten, Belege, Rechnungen, Debitoren / Kreditoren) und jeden Zugriff im Audit-Protokoll erfassen.

#### Scenario: Z3-Paket
- **WHEN** eine Steuerberaterin oder ein Steuerberater 2026 exportiert
- **THEN** wird ein Paket mit `index.xml` und den Tabellen-CSVs erzeugt und der Zugriff protokolliert

### Requirement: Kontenübersicht (sollte)
Das System MUSS (SHALL) je Bank- und Kassenkonto für einen Zeitraum Anfangssaldo, Einnahmen, Ausgaben, Überschuss und Endsaldo anzeigen.

#### Scenario: Blatt für die Kassenprüfung
- **WHEN** ein:e Kassenprüfer:in die Übersicht für 2026 aufruft
- **THEN** zeigt jedes Konto Anfangssaldo, Einnahmen, Ausgaben, Überschuss und Endsaldo, die rechnerisch aufgehen

### Requirement: DATEV-EXTF-Export
Das System MUSS (SHALL) Buchungsstapel (EXTF-Formatversion 700, Kategorie 21) und Debitoren- / Kreditoren-Stammdaten (Kategorie 16) als ZIP mit per Dokument-GUID referenzierten Belegdateien und einer `document.xml` exportieren, als Delta (seit dem letzten Export) oder Vollexport für einen Zeitraum, mit Kopfdaten aus den Einstellungen (Beraternummer, Mandantennummer, Beginn des Geschäftsjahrs, Sachkontenlänge, SKR) und Sphäre und Kostenstelle auf KOST1 / KOST2 abgebildet; exportierte Buchungen MÜSSEN mit der Export-ID markiert werden, und der Export MUSS die Ausführung verweigern, solange Konten keine DATEV-Zuordnung haben, und diese auflisten.

#### Scenario: Fehlende Zuordnung
- **WHEN** ein im Zeitraum verwendetes Konto keine DATEV-Zuordnung hat
- **THEN** verweigert der Export die Ausführung und listet das Konto auf

#### Scenario: Delta-Export
- **WHEN** ein Delta-Export nach einem vorherigen Export läuft
- **THEN** enthält er nur noch nicht exportierte Buchungen

### Requirement: DATEV-Exportoptionen (sollte)
Das System MUSS (SHALL) je eine Sammel-Debitoren- und Sammel-Kreditorennummer statt personenbezogener Nummern anbieten und nach einem Export anbieten, das Sperrdatum unter derselben TOTP-Regel auf das Ende des exportierten Zeitraums zu setzen.

#### Scenario: Sperrdatum wird angeboten
- **WHEN** ein DATEV-Export für Q1 abgeschlossen ist
- **THEN** wird der Kassenwart:in angeboten, das Sperrdatum auf den 31. März zu setzen

### Requirement: Ausgehende E-Rechnungen
Das System MUSS (SHALL) Rechnungen im wirtschaftlichen Geschäftsbetrieb (und im steuerpflichtigen Zweckbetrieb) an gewerbliche Empfänger:innen als ZUGFeRD (EN 16931, PDF/A-3 mit eingebettetem CII-XML) oder XRechnung (CII oder UBL) ausstellen, je Empfänger:in wählbar; das Ausstellen MUSS mit klarer Meldung gesperrt sein, solange EN-16931-Pflichtfelder (USt-IdNr. oder Steuernummer des Verkäufers, Käuferreferenz / Leitweg-ID bei öffentlichen Auftraggebern, Steuerkategorie je Position) fehlen; Dateien MÜSSEN in der CI den KoSIT-Validator bestehen und einmalig mit SHA-256 gespeichert werden; eine Kleinunternehmer-Einstellung (§19 UStG) MUSS die Pflicht abschalten und Rechnungen entsprechend kennzeichnen.

#### Scenario: Fehlende Leitweg-ID
- **WHEN** eine XRechnung an einen öffentlichen Auftraggeber keine Leitweg-ID hat
- **THEN** wird das Ausstellen unter Nennung des fehlenden Felds gesperrt

### Requirement: Spenden
Das System MUSS (SHALL) Geldspenden aus zugeordneten Kontobewegungen, Kassenbuchungen oder manueller Erfassung mit spendender Person, Datum, Betrag in Cent, Zweck, Sphäre und Kennzeichen Mitgliedsbeitrag erfassen und vor dem Ausstellen einer Zuwendungsbestätigung die Berechtigung prüfen: Das Datum des Bescheids ist nicht älter als 5 Jahre (Freistellungsbescheid) bzw. 3 Jahre (Feststellungsbescheid), der Zweck ist abgedeckt und die Adresse der spendenden Person liegt vor.

#### Scenario: Abgelaufener Freistellungsbescheid
- **WHEN** der Freistellungsbescheid der Organisation sechs Jahre alt ist
- **THEN** ist das Ausstellen einer Spendenbescheinigung gesperrt

### Requirement: Spendenbescheinigungen
Das System MUSS (SHALL) Einzel- und Sammelbestätigungen mit Anlage aus versionierten, nicht bearbeitbaren BMF-Musterpaketen ausstellen (Paketversion an der Bestätigung gespeichert), lückenlos nummerieren, einmalig mit gespeicherten Bytes und Hash rendern, über den bevorzugten Kanal versenden und nie bearbeiten; eine fehlerhafte Bestätigung MUSS mit Grund und Datum storniert und mit neuer Nummer neu ausgestellt werden; eine Spende DARF auf höchstens einer nicht stornierten Bestätigung stehen, importierte eingeschlossen; Sammelbestätigungen eines Jahres MÜSSEN zuerst als Vorschau erscheinen; Bestätigungen bis 300 EUR MÜSSEN den Hinweis zum vereinfachten Nachweis tragen; ein optionales Unterschriftsbild mit dem Hinweis auf maschinelle Erstellung MUSS unterstützt werden.

#### Scenario: Spende doppelt bescheinigt
- **WHEN** eine Sammelbestätigung eine Spende enthalten würde, die bereits auf einer nicht stornierten Bestätigung steht
- **THEN** wird diese Spende ausgeschlossen und als bereits bestätigt aufgeführt

#### Scenario: Stornieren und neu ausstellen
- **WHEN** eine Bestätigung mit falscher Adresse storniert wird
- **THEN** behält sie ihre Nummer und ihr PDF mit dem Status storniert, und die Neuausstellung erhält eine neue Nummer

### Requirement: Neutraler Standard-Kontenplan mit DATEV-Zuordnung
Das System MUSS (SHALL) jeden Verein mit einem kleinen neutralen Kontenplan vorbelegen (Geld-, Transit-, Steuer-, Einnahme- und Ausgabekonten mit Standardsphäre) und jedes Konto die Kontonummer aus dem DATEV-Kontenplan der Steuerberatung tragen lassen; der Warnbereich MUSS bebuchte Konten ohne DATEV-Nummer auflisten.

#### Scenario: Fehlende DATEV-Nummer
- **WHEN** ein Konto mit Buchungen im Berichtszeitraum keine DATEV-Nummer hat
- **THEN** zeigt der EÜR-Warnbereich, wie vielen Konten sie fehlt, und verlinkt auf den Kontenplan

### Requirement: Zahlungen werden über einen idempotenten Abgleich gebucht
Das System MUSS (SHALL) jede bestätigte Zahlungszuordnung genau einmal buchen und die Buchung jeder rückgängig gemachten Zuordnung genau einmal als Storno buchen, und zwar vor jedem Lesen des Buchungsjournals, jedem Bericht und jeder Änderung der Sperre.

#### Scenario: Zahlung storniert
- **WHEN** eine Barzahlung über 60 € storniert wird
- **THEN** zeigt das Buchungsjournal die ursprüngliche Buchung und eine Stornobuchung, und das Original bleibt unverändert

### Requirement: DATEV-Zeilen mit ausdrücklichen Steuerzeilen
Das System MUSS (SHALL) jede Buchung als DATEV-Zeilen mit je einem Konto gegen ein Gegenkonto exportieren, deren Beträge sich zur Buchung summieren, ohne BU-Schlüssel und mit Steuerpositionen als separaten Buchungen auf die zugeordneten Steuerkonten.

#### Scenario: Ausgabe zu 19 %
- **WHEN** eine Ausgabe von 119 € mit 19 % USt exportiert wird
- **THEN** enthält der Stapel eine Zeile über 100 € auf das Aufwandskonto und eine Zeile über 19 € auf das Vorsteuerkonto, beide gegen das Bankkonto

### Requirement: Stornierte Spendenbescheinigungen geben ihre Spenden frei
Das System MUSS (SHALL) eine stornierte Spendenbescheinigung mit ihrem Grund und gespeichertem PDF behalten und MUSS erlauben, ihre Spenden auf eine neue Bestätigung mit neuer Nummer zu setzen.

#### Scenario: Neuausstellung nach Storno
- **WHEN** eine Bestätigung mit dem Grund "Name falsch geschrieben" storniert wird
- **THEN** wird die Bestätigung als storniert angezeigt und eine neue Bestätigung für dieselbe Spende kann ausgestellt werden

### Requirement: Belege werden bei Zahlung gebucht
Das System MUSS (SHALL) einen erfassten Beleg aus dem Buchungsjournal heraushalten, bis er bezahlt ist, und MUSS dann seine Positionen zum Zahlungsdatum gegen das gewählte Geldkonto buchen; das Annullieren eines bezahlten Belegs MUSS ein Storno buchen.

#### Scenario: Beleg später bezahlt
- **WHEN** ein Beleg vom 1. April am 3. April per Bank bezahlt wird
- **THEN** zeigt das Buchungsjournal die Ausgabe am 3. April und der Beleg ist festgeschrieben

### Requirement: Zahlbetrag der E-Rechnung entspricht der gedruckten Summe
Das System MUSS (SHALL) XRechnung-Dateien erzeugen, deren Zahlbetrag der Bruttosumme der ausgestellten Rechnung entspricht, wobei Rundungsdifferenzen zwischen Brutto und Netto plus Steuer in den Rundungsbetrag fließen.

#### Scenario: Rundungsfall
- **WHEN** eine 19-%-Position über 10,01 € brutto als XRechnung ausgestellt wird
- **THEN** beträgt der Zahlbetrag der Datei 10,01 € und der KoSIT-Validator akzeptiert sie

### Requirement: E-Rechnungen werden mit ihrer XML verschickt
Das System MUSS (SHALL) das gespeicherte XRechnung-XML an die Rechnungs-E-Mail anhängen und sie an die E-Rechnungsadresse der Empfänger:in senden, wenn diese eine E-Mail-Adresse ist.

#### Scenario: Stadt mit E-Rechnungs-Postfach
- **WHEN** eine ausgestellte XRechnung an eine Stadt mit der E-Rechnungsadresse rechnung@stadt.example per E-Mail versendet wird
- **THEN** geht eine E-Mail an rechnung@stadt.example mit PDF und XML im Anhang

### Requirement: Bescheinigungen über Sachspenden
Das System MUSS (SHALL) Sachspenden mit Wert, Beschreibung und Herkunft erfassen und jede auf dem BMF-Muster für Sachzuwendungen bestätigen, nie auf einer Sammelbestätigung.

#### Scenario: Jahreslauf mit Sachspenden
- **WHEN** eine spendende Person in einem Jahr Geld und Sachen gespendet hat und die Jahresbestätigungen ausgestellt werden
- **THEN** erhält sie eine Bestätigung über Geldzuwendungen und eine separate Bestätigung über Sachzuwendungen

### Requirement: Grenzen für Übungsleiter- und Ehrenamtspauschale
Das System MUSS (SHALL) Zahlungen aus Übungsleiter- und Ehrenamtspauschale je Person und Jahr zusammen mit der anderweitig angegebenen Nutzung erfassen und warnen, wenn eine Zahlung den steuerfreien Höchstbetrag des Jahres überschreitet.

#### Scenario: Über der Grenze
- **WHEN** ein:e Trainer:in mit 1.000 € anderweitig angegebener Nutzung 2026 2.500 € erhält
- **THEN** zeigt der Rest 200 € über der Grenze von 3.300 € und die Antwort zur Zahlung warnt davor

### Requirement: Eingehende E-Rechnungen füllen die Belegmaske
Das System MUSS (SHALL) hochgeladene XRechnung-, UBL-, CII- und ZUGFeRD-Dateien auslesen und für den Beleg Lieferant, Nummer, Daten und Bruttobeträge je Umsatzsteuersatz vorschlagen, während die Datei unverändert gespeichert wird.

#### Scenario: ZUGFeRD-PDF
- **WHEN** ein ZUGFeRD-PDF mit einer Rechnung über 238,00 € zu 19 % hochgeladen wird
- **THEN** zeigt das Belegformular den Lieferanten, die Rechnungsnummer und eine Position über 238,00 € mit 19 %

### Requirement: Budget im Abgleich mit der Buchhaltung
Das System MUSS (SHALL) geplante Nettobeträge je Einnahme- und Ausgabekonto und Jahr führen und sie neben den gebuchten Nettobeträgen mit der Abweichung anzeigen.

#### Scenario: Überzogenes Konto
- **WHEN** für Material 150 € geplant und 180 € gebucht sind
- **THEN** zeigt die Abweichung +30 €, markiert als über Plan

### Requirement: Kassenbericht
Das System MUSS (SHALL) einen jährlichen Kassenbericht als PDF erzeugen, mit Anfangs- und Endsalden je Geldkonto sowie Einnahmen, Ausgaben und Ergebnis nach Sphäre und Konto, einschließlich der Hinweise zur Datenqualität aus der EÜR.

#### Scenario: Offene Kontobewegungen
- **WHEN** Kontobewegungen des Jahres noch nicht zugeordnet sind
- **THEN** enthält der Bericht den Hinweis, dass die EÜR unvollständig ist

### Requirement: Spendenbescheinigungen versenden
Das System MUSS (SHALL) ausgestellte Spendenbescheinigungen mit ihrem gespeicherten PDF per E-Mail versenden, einmal pro Bestätigung, und Bestätigungen für spendende Personen ohne E-Mail oder mit Briefpräferenz in einem druckbaren PDF sammeln.

#### Scenario: Spender:in ohne E-Mail
- **WHEN** die Bestätigungen des Jahres versendet werden und eine spendende Person keine E-Mail-Adresse hat
- **THEN** wird diese Bestätigung zum Drucken aufgeführt und erscheint im Brief-PDF

### Requirement: Gedruckte Mahnschreiben
Das System MUSS (SHALL) für jede ausgewählte offene Rechnung einen Mahnbrief rendern und ablehnen, wenn keine mehr offen ist.

#### Scenario: Rechnung inzwischen bezahlt
- **WHEN** Mahnbriefe nur für eine Rechnung angefordert werden, die vollständig bezahlt wurde
- **THEN** wird die Anfrage mit 409 abgelehnt und kein PDF erzeugt

### Requirement: Eigene Steuersätze
Das System MUSS (SHALL) dem Verein erlauben, Steuersätze mit Gültigkeit und Steuerkonten anzulegen, DARF den Prozentsatz eines Satzes NIE ändern und MUSS ablehnen, einen Satz vor einer mit ihm erfassten Buchung enden zu lassen.

#### Scenario: Verwendeten Steuersatz zu früh beenden
- **WHEN** ein Satz am 01.03.2026 verwendet wurde und sein Ende auf den 28.02.2026 gesetzt wird
- **THEN** wird die Änderung abgelehnt

