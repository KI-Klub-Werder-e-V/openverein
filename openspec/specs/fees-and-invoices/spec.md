# fees-and-invoices Specification

## Purpose
Die Capability fees-and-invoices umfasst stichtagsbezogene Beitragsarten und Beitragszuordnungen, den Beitragslauf mit verpflichtender Vorschau und Schutz vor Doppelabrechnung, Rechnungen mit unveränderlichen ausgestellten Dokumenten, lückenloser Nummerierung, Stornorechnungen und EPC-QR-Codes sowie offene Posten mit Mahnwesen und Ausbuchung (B M10, M11, M12, M13). Alle Beträge sind ganzzahlige Cent. Punkte, die B als „sollte“ oder „könnte“ einstuft, sind im Namen der Anforderung entsprechend markiert; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: Stichtagsbezogene Beitragsarten
Das System MUSS (SHALL) Beitragsarten mit Name, Rechnungspositionstext, Konto, Sphäre, Kostenstelle und Steuersatz führen, dazu Versionen mit `valid_from`, Betrag in Cent, Intervall (einmalig oder 1 bis 60 volle Monate, optional vom Verein eingeschränkt), Fälligkeitsregel, Anteilsberechnung (`none`, `month`, `day`, mit Schalter „Austrittsmonat zählt“), Aufnahmegebühr, Zeitraumanker (`calendar` oder `entry`) und Regel für den ersten Zeitraum (Eintrittsdatum, 1. des Eintrittsmonats, 1. des Folgemonats, Quartals-, Halbjahresbeginn oder manuell); eine Betragsänderung MUSS eine neue Version anlegen und gebuchte Beitragsforderungen nie ändern, und eine Beitragsart mit Forderungen DARF NICHT gelöscht, nur stillgelegt werden.

#### Scenario: Betragsänderung erzeugt Version
- **WHEN** die Mitgliederversammlung den Erwachsenenbeitrag ab 1. Januar 2027 von 12000 auf 14400 Cent erhöht
- **THEN** wird eine neue, ab 2027-01-01 gültige Version angelegt, und die Forderungen für 2026 behalten 12000 Cent

#### Scenario: Jedes easyVerein-Intervall erlaubt
- **WHEN** eine Version einer Beitragsart mit einem Intervall von 24 Monaten angelegt wird
- **THEN** wird sie akzeptiert, während 61 Monate abgelehnt werden

#### Scenario: Beitragsart mit Forderungen
- **WHEN** ein Admin eine Beitragsart löscht, zu der es Forderungen gibt
- **THEN** lehnt das System ab und bietet an, sie stillzulegen

### Requirement: Beitragszuordnungen
Das System MUSS (SHALL) Mitgliedern Beitragsarten als datierte Beitragszuordnungen zuweisen: genau eine Hauptbeitragsart und beliebig viele Zusatzbeitragsarten zu beliebigen Daten, optional mit individuellem Betrag samt Pflichtbegründung, abweichender zahlender Person und Beginn des ersten Leistungszeitraums; jedes Mitglied MUSS eine Standard-Zahlungsart haben (keine, Lastschrift, Überweisung, bar, benutzerdefiniert), die Haushalt oder zahlende Person übersteuern; ein Guthaben MUSS mit neuen Forderungen verrechnet werden, sofern die Person nicht widersprochen hat.

#### Scenario: Zweite Hauptbeitragsart abgelehnt
- **WHEN** ein Mitglied mit Hauptbeitragsart "Erwachsene" ab 1. Januar die Hauptbeitragsart "Familie" ab 1. März erhält, ohne dass die erste beendet wird
- **THEN** wird die Zuordnung abgelehnt

#### Scenario: Verrechnung von Guthaben
- **WHEN** einem Mitglied mit 2000 Cent Guthaben 6000 Cent berechnet werden
- **THEN** zeigt die Rechnung 6000 Cent mit 2000 Cent verrechnetem Guthaben und 4000 Cent fälligem Betrag

### Requirement: Beitragsrechner
Das System MUSS (SHALL) im Mitgliedsprofil zeilenweise beantworten, was das Mitglied für einen gewählten Zeitraum zahlen wird und warum, ohne etwas zu buchen.

#### Scenario: Erklärung ohne Nebenwirkungen
- **WHEN** ein Admin den Beitragsrechner für Q3 öffnet
- **THEN** werden Positionen, Anteilsberechnung und Rabatte angezeigt, und es wird weder eine Forderung noch eine Rechnung erzeugt

### Requirement: Vorlage für den Rechnungspositionstext (sollte)
Das System MUSS (SHALL) den Rechnungspositionstext aus einer Vorlage mit Platzhaltern für Name der Beitragsart, Zeitraumbeginn, Zeitraumende und Mitgliedsnummer erzeugen.

#### Scenario: Positionstext erzeugt
- **WHEN** die Vorlage `{plan} {period_start}–{period_end}` lautet
- **THEN** lautet eine Position "Erwachsene 01.01.2027–31.03.2027"

### Requirement: Vorschau des Beitragslaufs
Das System MUSS (SHALL) einen Beitragslauf für ein Fälligkeitsdatum und eine Mitgliederauswahl (alle, eine gespeicherte Ansicht, eine Abteilung) als Vorschau anlegen, die jedes Mitglied und jeden Haushalt mit jeder Position (Beitragsart, Zeitraum, Anteil, Rabatt, Aufnahmegebühr, Guthabenverrechnung, Nachholzeiträume) und Summe zeigt und vor fehlender Zahlungsart, fehlendem oder inaktivem Mandat, fehlender zahlender Person, Betrag 0 und Status `resigned` warnt; Nachholpositionen MÜSSEN gruppiert, gekennzeichnet und je Mitglied ausschließbar sein; Läufe über 100 Mitglieder MÜSSEN als Hintergrundjobs laufen.

#### Scenario: Nachholpositionen
- **WHEN** ein Mitglied mit einem vier Monate zurückliegenden Eintrittsdatum und monatlicher Beitragsart erfasst wird
- **THEN** zeigt die Vorschau vier gekennzeichnete Nachholpositionen, die die Kassenwart:in ausschließen kann

#### Scenario: Warnung bei fehlendem Mandat
- **WHEN** ein Mitglied per Lastschrift zahlt, aber kein aktives Mandat hat
- **THEN** führt die Vorschau das Mitglied unter der Warnung „Mandat fehlt oder ist nicht aktiv“

### Requirement: Schutz vor Doppelabrechnung
Das System DARF NIE (SHALL NOT) zwei lebende (nicht `cancelled`) Forderungen desselben Mitglieds halten, die denselben Tag im selben Abrechnungsplatz (`main` oder die Zusatzbeitragsart) abdecken, abgesichert durch einen Datenbank-Constraint; ein zweiter Lauf über denselben Zeitraum, ein Wechsel der Beitragsart, ein Intervallwechsel oder ein verschobener Anteilsbeginn MUSS für bereits abgerechnete Tage nichts erzeugen und dies in der Vorschau melden.

#### Scenario: Derselbe Zeitraum zweimal
- **WHEN** ein Beitragslauf für Januar ein zweites Mal gebucht wird
- **THEN** wird keine Forderung erzeugt, und die Vorschau meldet, dass Januar bereits abgerechnet ist

#### Scenario: Intervallwechsel
- **WHEN** ein vierteljährlich für Januar–März abgerechnetes Mitglied ab Februar auf monatlich wechselt
- **THEN** werden Februar und März nicht erneut abgerechnet

### Requirement: Vorschau-Snapshot und Buchung
Das System MUSS (SHALL) die Vorschau als Snapshot behandeln: Das Buchen MUSS mit „Daten haben sich seit der Vorschau geändert“ fehlschlagen, wenn sich eine Eingabe geändert hat, und eine neue Vorschau anbieten; das Buchen MUSS Forderungen und Rechnungen in fortsetzbaren Teilschritten erzeugen, sodass ein Absturz nie Duplikate erzeugt.

#### Scenario: Veraltete Vorschau
- **WHEN** sich nach der Vorschau eine Beitragszuordnung ändert und die Kassenwart:in auf „Rechnungen buchen“ klickt
- **THEN** schlägt das Buchen mit „Daten haben sich seit der Vorschau geändert“ fehl, und nichts wird erzeugt

### Requirement: Storno eines Beitragslaufs
Das System MUSS (SHALL) einen gebuchten Beitragslauf nur als Ganzes stornieren, indem es Stornorechnungen zu seinen Rechnungen ausstellt und seine Forderungen auf `cancelled` setzt, sodass die Zeiträume erneut berechnet werden können.

#### Scenario: Neuberechnung nach Storno
- **WHEN** ein gebuchter Lauf storniert wird
- **THEN** existieren Stornorechnungen zu seinen Rechnungen, und ein neuer Lauf kann dieselben Zeiträume abrechnen

### Requirement: Geplante Vorschauen von Beitragsläufen (sollte)
Das System MUSS (SHALL) optional je Verein nach Zeitplan Vorschauen von Beitragsläufen anlegen (zum Beispiel monatlich an einem festen Tag oder N Tage vor jedem Zeitraumbeginn) und die Kassenwart:in benachrichtigen; das Buchen MUSS weiterhin einen Klick erfordern.

#### Scenario: Geplante Vorschau nicht gebucht
- **WHEN** der Zeitplan auslöst
- **THEN** existiert eine Vorschau, die Kassenwart:in ist benachrichtigt, und es wird keine Rechnung ausgestellt

### Requirement: Lebenszyklus und Unveränderlichkeit von Rechnungen
Das System MUSS (SHALL) Rechnungen der Art Mitgliedsbeitrag, sonstige Forderung, Gutschrift und Stornorechnung ausstellen, mit Positionen (Text, Menge, Einzelpreis in Cent, Steuersatz, Konto, Sphäre, Kostenstelle, mehrere Steuersätze erlaubt) und den Status `draft` → `issued` → `open` / `partially_paid` / `paid` sowie `cancelled` und `written_off`; das Ausstellen MUSS in derselben Transaktion eine lückenlose Nummer aus dem konfigurierten Nummernkreis vergeben und den Inhalt unveränderlich machen; Korrekturen DÜRFEN NUR per Stornorechnung mit eigenem Nummernkreis und Bezug auf das Original erfolgen.

#### Scenario: Ausgestellte Rechnung unveränderlich
- **WHEN** eine Benutzer:in eine Position einer ausgestellten Rechnung bearbeitet
- **THEN** lehnt das System ab und bietet eine Stornorechnung an

#### Scenario: Lückenlose Nummern
- **WHEN** zwei Rechnungen gleichzeitig ausgestellt werden
- **THEN** erhalten sie aufeinanderfolgende Nummern ohne Lücke und ohne Duplikat

### Requirement: Vorlagen für wiederkehrende Rechnungen
Das System MUSS (SHALL) Vorlagen für wiederkehrende Rechnungen mit Intervall in Monaten, nächstem Datum und Enddatum führen, und ein täglicher Job MUSS je nach Einstellung der Vorlage einen Entwurf anlegen oder direkt ausstellen.

#### Scenario: Vorlage fällig
- **WHEN** das nächste Datum einer Vorlage heute ist und sie auf „Entwurf“ eingestellt ist
- **THEN** legt der Job einen Rechnungsentwurf an und rückt das nächste Datum um das Intervall vor

### Requirement: Rechnungs-PDF mit EPC-QR-Code
Das System MUSS (SHALL) ausgestellte Rechnungen auf dem Briefbogen mit einem EPC-QR-Code (GiroCode, Version 002, BCD) mit IBAN, Betrag und Rechnungsnummer als Verwendungszweck erzeugen, das PDF einmalig mit seinem SHA-256 speichern und nie neu erzeugen, sodass jeder erneute Download dieselben Bytes liefert.

#### Scenario: Dieselben Bytes beim erneuten Download
- **WHEN** ein ausgestelltes Rechnungs-PDF im Abstand von Monaten und nach einer Briefbogenänderung zweimal heruntergeladen wird
- **THEN** haben beide Downloads denselben SHA-256

### Requirement: Netto- oder Bruttopreise und Begleittexte (sollte)
Das System MUSS (SHALL) erlauben, den Einzelpreis jeder Position netto ("zzgl.") oder brutto ("inkl.") einzugeben, und einer Rechnung einen Einleitungs- und einen Schlusstext mit Platzhaltern mitzugeben.

#### Scenario: Bruttoeingabe
- **WHEN** eine Position mit 11900 Cent brutto bei 19 % erfasst wird
- **THEN** zeigt die Rechnung 10000 Cent netto und 1900 Cent Steuer

### Requirement: Offene Posten und Mahnwesen
Das System MUSS (SHALL) offene und teilbezahlte Forderungen und Verbindlichkeiten mit Empfänger:in, Datum, Nummer, Betrag, offenem Betrag (aus Zuordnungen berechnet, nie bearbeitet), Fälligkeit, Mahnstufe, letztem Mahndatum und Einzugsstatus auflisten; Mahnstufen (Verzugstage, Gebühr, Briefvorlage) MÜSSEN je Verein konfigurierbar sein; „Mahnvorschlag“ MUSS Rechnungen listen, die die nächste Stufe erreicht haben, und das Anwenden einer Stufe (Anlegen eines `dunning_event`) und das Versenden MÜSSEN getrennte, sichtbare Schritte sein; eine Mahngebühr MUSS eine neue Position oder Rechnung sein, nie eine Änderung der ausgestellten Rechnung.

#### Scenario: Mahnvorschlag
- **WHEN** eine Rechnung 14 Tage überfällig ist und Stufe 1 14 Verzugstage hat
- **THEN** erscheint sie in „Mahnvorschlag“ für Stufe 1

#### Scenario: Gebühr als eigenes Dokument
- **WHEN** eine Stufe mit 500 Cent Gebühr angewendet wird
- **THEN** wird die Gebühr als neue Rechnung oder Position hinzugefügt, und die ursprüngliche ausgestellte Rechnung bleibt unverändert

### Requirement: Mahnpause (sollte)
Das System MUSS (SHALL) erlauben, das Mahnwesen für eine Rechnung bis zu einem Datum mit Begründung zu pausieren, und pausierte Rechnungen MÜSSEN bis dahin in „Mahnvorschlag“ fehlen.

#### Scenario: Pausierte Rechnung
- **WHEN** eine Rechnung bis 30. Juni pausiert ist
- **THEN** erscheint sie vor dem 30. Juni nicht in „Mahnvorschlag“

### Requirement: Ausbuchung
Das System MUSS (SHALL) den offenen Betrag einer Rechnung mit Begründung ausbuchen, indem es ihn auf ein konfigurierbares Konto bucht und die Rechnung auf `written_off` setzt; dies ist nur per Storno (Gegenbuchung) umkehrbar.

#### Scenario: Uneinbringlicher Betrag
- **WHEN** eine Kassenwart:in einen offenen Betrag von 4500 Cent mit der Begründung "Mitglied verzogen, unbekannt" ausbucht
- **THEN** werden 4500 Cent auf das Ausbuchungskonto gebucht, und die Rechnung ist `written_off`

### Requirement: Nullbetragspositionen werden ohne Rechnung erfasst
Das System MUSS (SHALL) für Vorschaupositionen mit 0 Cent (zum Beispiel Ehrenmitglieder) Forderungen erfassen, damit der Zeitraum als abgerechnet gilt, DARF aber KEINE Rechnung mit Gesamtbetrag 0 Cent ausstellen; die Vorschau MUSS vor solchen Mitgliedern warnen.

#### Scenario: Ehrenmitglied
- **WHEN** ein Beitragslauf ein Mitglied bucht, dessen einzige Position 0 Cent beträgt
- **THEN** existiert eine Forderung für den Zeitraum, und es wird keine Rechnung ausgestellt

### Requirement: PDF beim Ausstellen eingefroren
Das System MUSS (SHALL) Empfängeradresse und Briefbogen beim Ausstellen in die Rechnung einfrieren, das PDF aus diesem Snapshot erzeugen (beim Ausstellen oder beim ersten Download), es einmalig mit seinem SHA-256 speichern und jede spätere Änderung der gespeicherten Bytes ablehnen.

#### Scenario: Briefbogen nach dem Ausstellen geändert
- **WHEN** sich der Vereinsname ändert, nachdem eine Rechnung ausgestellt wurde, und ihr PDF erneut heruntergeladen wird
- **THEN** sind die Bytes identisch mit dem ersten Download und zeigen den alten Namen

### Requirement: Zahlungen dürfen den offenen Betrag nicht übersteigen
Das System MUSS (SHALL) eine manuelle Zahlung ablehnen, die den offenen Betrag der Rechnung übersteigt, MUSS bezahlten Betrag und Status (`open`, `partially_paid`, `paid`, `written_off`) nach jeder Zahlung, Ausbuchung oder Gegenbuchung aus bestätigten Zuordnungen neu berechnen und MUSS das Stornieren einer Rechnung ablehnen, solange ihr bestätigte Zahlungen zugeordnet sind.

#### Scenario: Überzahlung
- **WHEN** eine Kassenwart:in 6000 Cent auf eine Rechnung mit 5000 Cent offenem Betrag erfasst
- **THEN** wird die Anfrage mit einem Feldfehler abgelehnt, und nichts wird gebucht

### Requirement: Artikelkatalog
Das System MUSS (SHALL) einen Katalog von Artikeln mit Bruttopreis und Umsatzsteuersatz führen, die in Rechnungspositionen übernommen werden können, wobei ihre Werte kopiert werden, sodass spätere Änderungen bestehende Rechnungen nie verändern.

#### Scenario: Preisänderung
- **WHEN** sich der Preis eines Artikels ändert, nachdem er auf einer ausgestellten Rechnung verwendet wurde
- **THEN** behält die ausgestellte Rechnung den alten Preis

