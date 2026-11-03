# members Specification

## Purpose
Die Capability members umfasst Mitgliedsdatensätze und ihren Lebenszyklus, das gemeinsame Adressbuch für Mitglieder und Nichtmitglieder, benutzerdefinierte Felder, Haushalte mit zahlender Person und Familienrabatt, facettierte Mitgliederlisten mit gespeicherten Ansichten, CSV-/XLSX-Export, Massenaktionen und Dublettenerkennung (B M01, M02, M03, M05, M06, M07, M08, M09). Punkte, die B mit „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: Mitgliedsdatensätze und Mitgliedsnummern
Das System MUSS (SHALL) jedes Mitglied 1:1 mit einer Person verknüpfen, die Person beim Ende einer Mitgliedschaft nie löschen und pro Organisation eine eindeutige Mitgliedsnummer nach einem konfigurierbaren Muster (zum Beispiel `M-{YYYY}-{seq:4}`) erzeugen, die nur Benutzer:innen mit der Berechtigung `members.number.edit` ändern dürfen, und zwar nur vor dem ersten Speichern.

#### Scenario: Nummer aus Muster
- **WHEN** das erste Mitglied des Jahres 2027 mit dem Muster `M-{YYYY}-{seq:4}` gespeichert wird
- **THEN** erhält das Mitglied die Nummer `M-2027-0001`

#### Scenario: Person überdauert die Mitgliedschaft
- **WHEN** eine Mitgliedschaft entfernt wird
- **THEN** bleibt die verknüpfte Person im Adressbuch erhalten

### Requirement: Status im Mitgliedslebenszyklus
Das System MUSS (SHALL) die Status `applicant`, `future`, `active`, `resigned`, `former` und `rejected` verwenden, sie nur über ausdrückliche, datierte Aktionen ändern, die ein Audit-Ereignis schreiben, `future` zu `active` und `resigned` zu `former` per nächtlichem Job am jeweiligen Datum überführen und im Profil eine Status-Zeitleiste mit Datum und handelndem Admin anzeigen.

#### Scenario: Zukünftiges Mitglied wird aktiv
- **WHEN** das Eintrittsdatum eines Mitglieds mit Status `future` erreicht ist
- **THEN** setzt der nächtliche Job den Status auf `active` und die Zeitleiste zeigt die Änderung

#### Scenario: Keine freie Statusbearbeitung
- **WHEN** eine Benutzerin oder ein Benutzer versucht, das Statusfeld direkt per Update zu setzen
- **THEN** lehnt das System dies ab und verweist auf die Übergangsaktionen

### Requirement: Kündigungs- und Austrittsdatum
Das System MUSS (SHALL) ein Austrittsdatum verlangen, sobald ein Kündigungsdatum gesetzt ist, das Austrittsdatum aus der Kündigungsregel des Vereins vorschlagen (zum Beispiel Quartalsende mit 6 Wochen Frist), warnen, wenn das eingegebene Austrittsdatum gegen die Regel verstößt, ein Austrittsdatum vor dem Eintrittsdatum ablehnen und den Austrittsgrund aus einer konfigurierbaren Liste übernehmen.

#### Scenario: Vorgeschlagenes Austrittsdatum
- **WHEN** eine Kündigung am 10. Mai unter der Regel „Quartalsende, 6 Wochen Frist“ eingeht
- **THEN** ist das vorgeschlagene Austrittsdatum der 30. Juni

#### Scenario: Austritt vor Eintritt
- **WHEN** ein Austrittsdatum vor dem Eintrittsdatum eingegeben wird
- **THEN** lehnt das System es ab

### Requirement: Ehemalige Mitglieder standardmäßig ausgeblendet
Das System MUSS (SHALL) Mitglieder mit Status `former` standardmäßig in jeder Liste, jedem Filterergebnis, jedem Export und jeder E-Mail-Empfängerauswahl ausblenden und sie nur über einen sichtbaren Schalter „ehemalige Mitglieder einbeziehen“ anzeigen, dessen Zustand mit der Ansicht gespeichert wird.

#### Scenario: Standardliste
- **WHEN** ein Admin die Mitgliederliste öffnet, ohne Filter zu ändern
- **THEN** wird kein ehemaliges Mitglied aufgeführt

#### Scenario: Schalter gespeichert
- **WHEN** eine Ansicht mit eingeschaltetem „ehemalige Mitglieder einbeziehen“ gespeichert wird
- **THEN** zeigt das erneute Öffnen der Ansicht ehemalige Mitglieder

### Requirement: Warnungen zur Datenqualität im Profil (sollte)
Das System MUSS (SHALL) im Kopfbereich des Mitgliedsprofils Warnungen anzeigen für: keine Zahlungsart, kein Mandat bei Zahlungsart Lastschrift, keine Kontaktdaten sowie Admin-Zugang des Mitglieds.

#### Scenario: Warnung bei fehlendem Mandat
- **WHEN** ein Mitglied per Lastschrift zahlt und kein aktives Mandat hat
- **THEN** zeigt der Profilkopf die Warnung „kein Mandat“

### Requirement: Gemeinsames Adressbuch
Das System MUSS (SHALL) einen Personendatensatz für natürliche Personen und Organisationen (Firmenname, Ansprechperson) führen, mit mehreren Adressen (privat, geschäftlich, Rechnung), E-Mails mit einer bevorzugten, Telefonnummern und bevorzugtem Kanal (`email`, `letter`, `none`); Nichtmitglieder MÜSSEN ohne erneute Dateneingabe in Antragstellende oder Mitglieder umwandelbar sein; Adressgruppen MÜSSEN Mitglieder und Nichtmitglieder enthalten können; DATEV-Debitoren- und Kreditorennummern MÜSSEN bei erster Verwendung aus konfigurierbaren Bereichen vergeben werden (Standard Debitoren 10000–69999, Kreditoren 70000–99999); Archivieren MUSS eine Person aus Auswahllisten entfernen, Anonymisieren DARF nur über die DSGVO-Werkzeuge möglich sein.

#### Scenario: Förderer in Mitglied umwandeln
- **WHEN** ein Admin ein förderndes Nichtmitglied in eine:n Antragsteller:in umwandelt
- **THEN** werden die vorhandenen Personendaten wiederverwendet und ein Mitgliedsdatensatz wird ergänzt

#### Scenario: Debitorennummer bei erster Rechnung
- **WHEN** die erste Rechnung an eine Person ohne Debitorennummer ausgestellt wird
- **THEN** wird die nächste freie Nummer im Debitorenbereich vergeben

### Requirement: Länderprüfung von Adressen (sollte)
Das System MUSS (SHALL) je Adresse einen Ländercode (DE, AT, CH, sonstige), Bundesland und Adresszusatz speichern und die Postleitzahl je Land prüfen: 5 Ziffern für DE, 4 Ziffern für AT und CH, sonst Freitext.

#### Scenario: Österreichische Postleitzahl
- **WHEN** eine Adresse mit Land AT und Postleitzahl `1010` gespeichert wird
- **THEN** wird sie akzeptiert, während `10115` für AT abgelehnt wird

### Requirement: Benutzerdefinierte Felder
Das System MUSS (SHALL) Admins benutzerdefinierte Felder an Personen oder Mitgliedern definieren lassen, vom Typ Text, mehrzeiliger Text, Zahl, Datum, Checkbox, Auswahl, Mehrfachauswahl oder Datei, mit Bezeichnung, i18n-Schlüssel, Reiter, Position, Pflichtkennzeichen, Optionen und den Flags `visible_to_member`, `editable_by_member`, `needs_approval`, `sensitive` und `gdpr_relevant`; sie MÜSSEN als Listenfilter, Spalten, Exportspalten, Importziele und E-Mail-Platzhalter nutzbar sein; der Typ ist fest, sobald Werte existieren; Archivieren blendet ein Feld aus und behält die Werte; Löschen eines Felds mit Werten verlangt die Eingabe seines Namens und schreibt ein Audit-Ereignis.

#### Scenario: Typ gesperrt
- **WHEN** ein Admin den Typ eines Felds ändert, das Werte hat
- **THEN** verweigert das System dies und schlägt vor, das Feld zu archivieren und ein neues anzulegen

#### Scenario: Platzhalter
- **WHEN** eine E-Mail `{{custom.shirt_size}}` verwendet
- **THEN** wird der Wert der jeweiligen Empfänger:in eingesetzt, sofern die absendende Person dieses Feld sehen darf

### Requirement: Haushalte mit zahlender Person und Familienrabatt
Das System MUSS (SHALL) Haushalte abbilden mit Name, einer zahlenden Person, die kein Mitglied sein muss, optional abweichender Rechnungsadresse und einer zeitlich gültigen Rabattregel (keine, Prozentnachlass ab dem 2. oder 3. Mitglied, fester Familienhöchstbetrag je Zeitraum, Kinder frei ab dem n-ten Kind); Haushaltsmitglieder MÜSSEN auf einer Rechnung an die zahlende Person abgerechnet werden, mit einer Position je Mitglied und Beitrag, eingezogen mit deren Mandat; die Vorschau des Beitragslaufs MUSS den Rabatt als eigene Position mit Regelnamen zeigen; vor dem Entfernen der zahlenden Person MUSS eine neue gewählt werden.

#### Scenario: Eine Rechnung pro Haushalt
- **WHEN** ein Beitragslauf einen Haushalt mit drei Mitgliedern abrechnet
- **THEN** wird eine Rechnung an die zahlende Person mit einer Position je Mitglied und einer Rabattposition erstellt

#### Scenario: Entfernen der zahlenden Person
- **WHEN** ein Admin die zahlende Person entfernt, ohne eine neue zu benennen
- **THEN** verweigert das System dies

### Requirement: Mitgliederlisten mit facettierter Suche und gespeicherten Ansichten
Das System MUSS (SHALL) eine tippfehlertolerante globale Suche über Name, Mitgliedsnummer, E-Mail und Ort bieten, Facetten (Status, Gruppe zu einem Datum, Altersbereich, Ein- und Austrittszeitraum, Zahlungsart, Mandatsstatus, Haushalt, offener Saldo über 0, benutzerdefinierte Felder), die über Facetten mit UND und innerhalb einer Facette mit ODER verknüpft werden, eine per Tastatur bedienbare Spaltenauswahl mit Breite und Sortierung je Benutzer:in sowie private oder mit einer Rolle geteilte gespeicherte Ansichten; eine geteilte Ansicht MUSS Spalten weglassen, die die betrachtende Person nicht sehen darf; IBANs DÜRFEN NICHT per Fragment durchsuchbar sein, nur per exakter vollständiger IBAN für Benutzer:innen mit IBAN-Recht; die erste Seite von 2.000 Mitgliedern mit 10 Spalten MUSS in unter 500 ms Serverzeit rendern.

#### Scenario: Geteilte Ansicht beachtet Berechtigungen
- **WHEN** ein:e Trainer:in eine geteilte Ansicht mit einer IBAN-Spalte öffnet
- **THEN** wird die Spalte für sie weggelassen

#### Scenario: Suche nach IBAN-Fragment
- **WHEN** eine Benutzerin nach `DE89 3704` sucht
- **THEN** wird über die IBAN kein Mitglied gefunden

### Requirement: CSV- und XLSX-Export gefilterter Listen
Das System MUSS (SHALL) genau den aktuellen Filter, die Spalten und die Sortierung als CSV (UTF-8 mit BOM, Trennzeichen `;`, optional deutsches Dezimalkomma) oder XLSX (typisierte Daten und Zahlen) exportieren, eingeschränkte Felder nicht als Spalten anbieten, CSV-Zellen, die mit `=`, `+`, `-` oder `@` beginnen, maskieren, Exporte über 1.000 Zeilen als Hintergrundjobs ausführen und die Datei 7 Tage aufbewahren sowie jeden Export mit Filter, Spalten und Zeilenzahl, aber ohne die Daten, im Audit-Protokoll festhalten.

#### Scenario: Formel-Injektion
- **WHEN** ein Namensfeld `=HYPERLINK(...)` enthält
- **THEN** wird die exportierte CSV-Zelle so maskiert, dass Tabellenkalkulationen sie als Text anzeigen

#### Scenario: Großer Export
- **WHEN** ein Export 1.500 Zeilen umfasst
- **THEN** läuft er als Hintergrundjob und die Datei wird nach 7 Tagen gelöscht

### Requirement: Massenaktionen auf gefilterten Listen
Das System MUSS (SHALL) Aktionen (E-Mail oder Brief senden, manuelle Rechnung erstellen, Gruppenmitgliedschaft hinzufügen oder beenden, Statusübergang, Export, Anträge annehmen oder ablehnen, Dublettenprüfung, DSGVO-Datenblatt, Portaleinladungen) auf alle Filterergebnisse seitenübergreifend, die aktuelle Seite oder ausgewählte Zeilen anwenden; es MUSS eine Bestätigung mit Anzahl und 5 Beispieldatensätzen zeigen, die Auswahl bei Bestätigung als ID-Snapshot einfrieren, Berechtigungen je Datensatz prüfen und übersprungene melden, Aktionen über 100 Datensätze als Hintergrundjobs mit Ergebnis je Datensatz (erfolgreich, übersprungen mit Grund, fehlgeschlagen) ausführen und jede Massenaktion mit ID-Snapshot protokollieren.

#### Scenario: Datensätze außerhalb des Zuständigkeitsbereichs übersprungen
- **WHEN** eine Abteilungsleitung einen Massen-Gruppenwechsel auf eine Auswahl anwendet, die Mitglieder außerhalb ihres Zuständigkeitsbereichs enthält
- **THEN** werden diese Mitglieder übersprungen und mit Grund aufgeführt

#### Scenario: Auswahl eingefroren
- **WHEN** ein zum Filter passendes Mitglied hinzukommt, nachdem die Massenaktion bestätigt wurde
- **THEN** wird dieses Mitglied nicht verarbeitet

### Requirement: Dublettenerkennung
Das System MUSS (SHALL) beim Import und auf Anforderung wahrscheinliche Personen-Dubletten finden, mit einer Bewertung aus Namensähnlichkeit, Geburtsdatum, E-Mail, IBAN und Adresse, einem zwischen 60 und 100 % einstellbaren Schwellenwert und einer Ergebnisliste von Paaren mit hervorgehobenen übereinstimmenden Feldern; der Admin MUSS ein Paar lösen, indem die Dublette ohne Finanzdaten archiviert wird, und Entscheidungen „keine Dublette“ MÜSSEN gespeichert werden.

#### Scenario: Paar verworfen
- **WHEN** ein Admin ein Paar als „keine Dublette“ markiert
- **THEN** wird das Paar nicht erneut vorgeschlagen

#### Scenario: Schwellenwert
- **WHEN** der Schwellenwert auf 90 % gesetzt ist
- **THEN** werden nur Paare mit einer Bewertung von 90 % oder mehr aufgeführt

### Requirement: Mitgliedersuche toleriert Tippfehler und Umlaute
Das System MUSS (SHALL) Mitglieder über jeden Teil von Vor- oder Nachname, Firma, Mitgliedsnummer, Ort oder (wenn für die Benutzer:in sichtbar) E-Mail finden, dabei Groß-/Kleinschreibung und Akzente ignorieren (`muller` findet `Müller`, `yilmaz` findet `Yılmaz`), kleine Tippfehler in Namen tolerieren (`schmitt` findet `Schmidt`) und `%` und `_` in der Suchanfrage als literale Zeichen behandeln.

#### Scenario: Suche ohne Umlaut
- **WHEN** ein Admin nach `muller` sucht
- **THEN** wird das Mitglied `Müller, Jörg` aufgeführt

#### Scenario: Platzhalterzeichen sind literal
- **WHEN** ein Admin nach `%` sucht
- **THEN** wird kein Mitglied aufgeführt, es sei denn, ein Name enthält ein Prozentzeichen

### Requirement: Tastaturorientierte Mitgliederliste
Das System MUSS (SHALL) die Mitgliederliste ohne Maus bedienbar machen: `/` fokussiert die Suche, `n` öffnet das Anlageformular, Pfeiltasten (oder `j`/`k`) wechseln zwischen Zeilen, Enter öffnet den Datensatz in einem Seitenpanel, die Leertaste wählt eine Zeile für Massenaktionen aus, und die Befehlspalette findet Mitglieder nach Namen.

#### Scenario: Mitglied per Tastatur öffnen
- **WHEN** eine Benutzerin `/` drückt, einen Namen tippt, per Tab in die Liste wechselt und auf einer Zeile Enter drückt
- **THEN** öffnet sich das Mitglied in einem Seitenpanel über der Liste

### Requirement: Sensible benutzerdefinierte Felder nur für vereinsweit Lesende
Das System MUSS (SHALL) sensible benutzerdefinierte Felder und ihre Werte vor Benutzer:innen verbergen, deren Mitgliederzugriff auf Gruppen beschränkt ist, DARF sie NICHT als E-Mail-Platzhalter anbieten und MUSS Änderungen daran ohne die Werte im Audit-Protokoll festhalten.

#### Scenario: Trainer öffnet ein Profil
- **WHEN** ein auf die Tennisgruppe beschränkter Trainer ein Mitglied öffnet, bei dem in einem sensiblen Feld eine Allergie vermerkt ist
- **THEN** wird weder das Feld noch sein Wert angezeigt oder von der API zurückgegeben

### Requirement: Haushaltsrabatt aus einbezogenen Positionen neu berechnet
Das System MUSS (SHALL) den Rabatt eines Haushalts beim Buchen aus den tatsächlich abgerechneten Positionen berechnen, sodass das Ausschließen einer Vorschauposition den Rabatt entsprechend ändert.

#### Scenario: Ausgeschlossener Kinderbeitrag
- **WHEN** die Vorschau eines Haushalts mit „50 % ab dem 2. Mitglied“ gebucht wird, wobei der Beitrag eines Kindes ausgeschlossen ist
- **THEN** umfasst die Rabattposition nur die verbleibenden rabattierten Beiträge

### Requirement: Deutsche Schreibweisen gelten in der Dublettenerkennung als gleich
Das System MUSS (SHALL) ü/ue, ö/oe, ä/ae und ß/ss beim Namensvergleich für Dubletten als gleich behandeln.

#### Scenario: Müller und Mueller
- **WHEN** „Jürgen Müller“ und „Juergen Mueller“ Geburtsdatum, E-Mail und Adresse teilen
- **THEN** erreicht das Paar mindestens 90 %

### Requirement: Ansichten speichern nur Listenparameter
Das System MUSS (SHALL) eine gespeicherte Ansicht als Parameter der Liste speichern und jede Listenanfrage unter den eigenen Berechtigungen der betrachtenden Person auswerten, sodass eine geteilte Ansicht jeder Person nur zeigt, was sie sehen darf.

#### Scenario: Trainer öffnet eine geteilte Ansicht
- **WHEN** ein auf die Tennisgruppe beschränkter Trainer eine mit der Trainerrolle geteilte Ansicht öffnet, die nach Mitgliedern im Alter von 10 bis 14 filtert
- **THEN** enthält die Liste nur Tennismitglieder im Alter von 10 bis 14

#### Scenario: Geteilte Ansicht mit einer Facette, die die betrachtende Person nicht nutzen darf
- **WHEN** ein Trainer ohne Rechnungsrechte eine geteilte Ansicht öffnet, die nach offenen Salden filtert
- **THEN** wird die Anfrage mit einer Erklärung abgelehnt, weil schon der Filter offenlegen würde, wer Geld schuldet

### Requirement: Massenaktionen über alle Filterergebnisse
Das System MUSS (SHALL) Benutzer:innen alle zum aktuellen Filter passenden Mitglieder auswählen lassen, eine Massenaktion nach Anzeige der Anzahl und fünf Beispielnamen bestätigen lassen und Aktionen über mehr als 100 Mitglieder als Hintergrundjob mit Ergebnis je Datensatz ausführen.

#### Scenario: Große Auswahl
- **WHEN** ein Admin 101 gefilterte Mitglieder einer Gruppe hinzufügt
- **THEN** antwortet die API mit 202 und einem Job, und der abgeschlossene Job meldet 101 erfolgreich und keine übersprungen

### Requirement: Jährliche Bestandserhebung für den Sportbund
Das System MUSS (SHALL) die Mitglieder zum 1. Januar eines gewählten Jahres nach Altersstufe und Geschlecht melden, für den ganzen Verein und je Abteilung, anhand von Ein- und Austrittsdatum statt des heutigen Status.

#### Scenario: Im Vorjahr ausgetretenes Mitglied
- **WHEN** ein Mitglied am 30. Juni des Vorjahres ausgetreten ist
- **THEN** wird es in der Bestandserhebung zum 1. Januar dieses Jahres nicht gezählt

### Requirement: Ehrungslisten
Das System MUSS (SHALL) für ein gewähltes Jahr die Mitgliedschaftsjubiläen der aktuellen Mitglieder (ab 10 Jahren, alle 5 Jahre) und runde Geburtstage auflisten und eine E-Mail an alle aufgeführten Mitglieder anbieten.

#### Scenario: 25 Jahre
- **WHEN** ein Mitglied am 1. Mai 2002 eingetreten ist
- **THEN** zeigt die Liste 2027 es am 01.05. mit 25 Jahren Mitgliedschaft

### Requirement: Druckbare Listen und vCards
Das System MUSS (SHALL) die aktuell gefilterte Mitgliederliste als druckbares PDF und als vCard 4.0 exportieren und dabei Felder weglassen, die die Rollen der Benutzer:in einschränken.

#### Scenario: Steuerberater exportiert vCards
- **WHEN** eine Benutzerin, deren Rolle E-Mail, Telefon und Geburtsdatum verbirgt, vCards exportiert
- **THEN** enthalten die Karten Namen und Adressen, aber keine E-Mail, kein Telefon und keinen Geburtstag

### Requirement: Arbeitsstunden und Ersatzbeitrag
Das System MUSS (SHALL) geleistete Arbeitsstunden je Mitglied und Jahr gegen eine Vereinsregel erfassen und für fehlende Stunden einen Rechnungsentwurf über den Ersatzbeitrag je Mitglied und Jahr erstellen.

#### Scenario: Fehlende Stunden
- **WHEN** die Regel 10 Stunden zu 15 € verlangt und ein Mitglied 7,5 Stunden geleistet hat
- **THEN** zeigt die Übersicht 2,5 offene Stunden und 37,50 €, und das Abrechnen erstellt einen Rechnungsentwurf über 37,50 €; erneutes Abrechnen erstellt keinen

### Requirement: Mitgliedsbescheinigung
Das System MUSS (SHALL) für ein Mitglied eine Mitgliedsbescheinigung als PDF erzeugen, verfügbar für Mitarbeitende für Mitglieder in ihrem Zuständigkeitsbereich und für das Mitglied im Portal.

#### Scenario: Mitglied lädt die eigene herunter
- **WHEN** ein Mitglied seine Portalkarte öffnet und die Bescheinigung herunterlädt
- **THEN** nennt das PDF die Mitgliedschaft seit dem Eintrittsdatum; die Bescheinigung eines anderen Mitglieds ist für es nicht verfügbar

### Requirement: Warnungen zu Zahlung und Zugang
Das System MUSS (SHALL) im Mitgliedsdatensatz warnen bei fehlender Zahlungsart, Lastschrift ohne aktives Mandat und einem Verwaltungskonto mit der E-Mail-Adresse des Mitglieds.

#### Scenario: Lastschrift ohne Mandat
- **WHEN** ein Mitglied per Lastschrift zahlt und weder es selbst noch die zahlende Person seines Haushalts ein aktives Mandat hat
- **THEN** zeigt der Mitgliedsdatensatz "Zahlt per Lastschrift, aber es gibt kein gültiges Mandat."

### Requirement: Kontaktprotokoll
Das System MUSS (SHALL) je Person ein Kontaktprotokoll führen, private Einträge nur ihrer Autorin oder ihrem Autor zeigen, es wie die Mitgliedsnotiz schützen und es löschen, wenn die Person anonymisiert wird.

#### Scenario: Privater Eintrag
- **WHEN** ein Vorstandsmitglied einen privaten Eintrag erfasst
- **THEN** sehen andere Benutzer:innen mit Zugriff auf das Mitglied ihn nicht

#### Scenario: Eingeschränkte Rolle
- **WHEN** eine Rolle ohne Zugriff auf Mitgliedsnotizen das Kontaktprotokoll öffnet
- **THEN** wird die Anfrage abgelehnt

### Requirement: Glückwunsch-E-Mails
Das System MUSS (SHALL) eine Glückwunsch-E-Mail zum Geburtstag oder geehrten Mitgliedschaftsjubiläum eines Mitglieds nur senden, wenn der Verein dies eingeschaltet hat, und höchstens einmal je Person, Art und Jahr.

#### Scenario: Zweimaliger Lauf am selben Tag
- **WHEN** der Glückwunschlauf am 30. Geburtstag eines Mitglieds bei eingeschalteten Glückwünschen zu runden Geburtstagen zweimal läuft
- **THEN** wird genau eine Geburtstags-E-Mail gesendet

### Requirement: Ehrungsregister
Das System MUSS (SHALL) verliehene Ehrungen mit Titel, Datum und Beschluss erfassen und sie je Jahr auflisten.

#### Scenario: Silberne Nadel
- **WHEN** ein Mitglied am 14.03. die "Silberne Ehrennadel" erhält
- **THEN** zeigt die Ehrungsliste des Jahres sie beim Mitglied

