# member-portal Specification

## Purpose
Die Capability member-portal umfasst das Mitgliederportal als installierbare PWA, Änderungsanfragen zu Daten mit Freigabe durch Admins sowie den öffentlichen Online-Mitgliedsantrag mit Erfassung des SEPA-Mandats (B M29, M30, M31). Die Anmeldemechanik ist in der Capability auth spezifiziert. Punkte, die B mit „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet; alles andere ist MVP-Verhalten.
## Requirements
### Requirement: Portalseiten
Das System MUSS (SHALL) angemeldeten Mitgliedern bieten: mein Profil (als sichtbar markierte Felder; bearbeitbare über Änderungsanfragen), meine Mitgliedschaften und Gruppen (ohne reine Admin-Gruppen), mein SEPA-Mandat (maskierte IBAN, Referenz, Unterschriftsdatum), meine Rechnungen mit PDF-Download, offenem Betrag und EPC-QR-Code, meine Spendenbescheinigungen, meine Dokumente und eine Austrittsanfrage.

#### Scenario: Eigene Rechnungen
- **WHEN** ein Mitglied „meine Rechnungen“ öffnet
- **THEN** werden seine Rechnungen mit offenem Betrag und PDF-Download aufgelistet, und eine offene Rechnung zeigt ihren EPC-QR-Code

### Requirement: Zugriff nur auf eigene Daten
Das System MUSS (SHALL) über Portal-Endpunkte nur Daten der angemeldeten Person liefern und, für die zahlende Person eines Haushalts, die Rechnungen des Haushalts; durchgesetzt in der API und durch Row-Level-Security.

#### Scenario: Rechnung eines anderen Mitglieds
- **WHEN** ein Mitglied über die Portal-API die Rechnungs-ID eines anderen Mitglieds anfragt
- **THEN** lautet die Antwort 404

#### Scenario: Zahlende Person eines Haushalts
- **WHEN** die zahlende Person eines Haushalts „meine Rechnungen“ öffnet
- **THEN** werden alle Rechnungen des Haushalts aufgelistet

### Requirement: Austrittsanfrage
Das System MUSS (SHALL) einem Mitglied erlauben, einen Austritt mit einem nach der Kündigungsregel berechneten vorgeschlagenen Austrittsdatum einzureichen; das Einreichen MUSS eine Aufgabe für Admins anlegen und eine Bestätigungs-E-Mail senden, und die Bestätigung durch einen Admin MUSS Kündigungs- und Austrittsdatum beim Mitglied setzen.

#### Scenario: Austritt bestätigt
- **WHEN** ein Admin eine Austrittsanfrage aus dem Portal bestätigt
- **THEN** werden Kündigungs- und Austrittsdatum des Mitglieds gesetzt und sein Status wird `resigned`

### Requirement: Portal als PWA
Das System MUSS (SHALL) das Portal als installierbare PWA ausliefern, die auf einem 390 px breiten Smartphone funktioniert und einen klaren Offline-Zustand ohne Offline-Schreibvorgänge zeigt.

#### Scenario: Smartphone-Breite
- **WHEN** das Portal bei 390 px Breite geöffnet wird
- **THEN** ist jede Seite ohne horizontales Scrollen nutzbar

### Requirement: Einstellungen der Portalfunktionen (sollte)
Das System MUSS (SHALL) dem Verein erlauben, Portalfunktionen ein- oder auszuschalten (eigene Daten bearbeiten, Bankdatenänderungen beantragen, Rechnungen anzeigen, Mandat anzeigen, Austrittsanfrage, Admin-Kontakt anzeigen), jeweils pro Gruppe mit erlauben, verweigern oder Standard überschreibbar; ein Mitglied MUSS eine Funktion erhalten, wenn mindestens eine aktuelle Gruppe sie erlaubt und keine sie verweigert.

#### Scenario: Verweigern gewinnt
- **WHEN** eine Gruppe eines Mitglieds „Rechnungen anzeigen“ erlaubt und eine andere es verweigert
- **THEN** sieht das Mitglied keine Rechnungen

### Requirement: Regeln für Änderungsanfragen
Das System MUSS (SHALL) jedes vom Mitglied bearbeitbare Feld als „sofort übernehmen“ oder „braucht Freigabe“ behandeln, wobei IBAN und Name immer Freigabe brauchen, jede Anfrage mit altem Wert, vorgeschlagenem Wert, anfragender Person und Zeitpunkt speichern, pro Feld nur eine offene Anfrage halten (eine neuere ersetzt die ältere) und bei Änderung von E-Mail oder IBAN die alte E-Mail-Adresse benachrichtigen.

#### Scenario: Sofort übernommenes Feld
- **WHEN** ein Mitglied seine Telefonnummer ändert und das Feld sofort übernommen wird
- **THEN** wird die neue Nummer ohne Freigabe gespeichert

#### Scenario: Ersetzte Anfrage
- **WHEN** ein Mitglied eine zweite Adressänderung einreicht, während die erste noch offen ist
- **THEN** wird die erste Anfrage als ersetzt markiert

### Requirement: Entscheidungen über Änderungsanfragen
Das System MUSS (SHALL) Admins einen Posteingang mit einem Diff pro Anfrage zeigen, sie annehmen oder mit Begründung ablehnen lassen, angenommene Änderungen mit derselben Validierung und demselben Audit wie eine Admin-Bearbeitung übernehmen und dem Mitglied die Entscheidung per E-Mail mitteilen.

#### Scenario: Abgelehnte Änderung
- **WHEN** ein Admin eine Namensänderung mit Begründung ablehnt
- **THEN** erhält das Mitglied eine E-Mail mit der Begründung und der Name bleibt unverändert

### Requirement: Bankänderung erzeugt Mandatsänderung
Das System MUSS (SHALL) eine angenommene IBAN-Änderung als Mandatsänderung erfassen und den Admin fragen, ob ein neu unterschriebenes Mandat nötig ist.

#### Scenario: IBAN-Änderung angenommen
- **WHEN** ein Admin eine neue IBAN annimmt
- **THEN** zeigt die Mandatshistorie eine Änderung mit Datum, und der Admin wird nach einem neu unterschriebenen Mandat gefragt

### Requirement: Antragsformulare
Das System MUSS (SHALL) Antragsformulare aus Bausteinen aufbauen (persönliche Daten, Adresse, Kontakt, angebotene Gruppen, Wahl des Beitragsmodells, benutzerdefinierte Felder, SEPA-Mandat mit Mandatstext, versionierte Einwilligungs-Checkboxen, Link zur Datenschutzerklärung, Abschnitt für Erziehungsberechtigte bei Minderjährigen) und sie unter einer öffentlichen URL, als iFrame-Snippet mit konfigurierbaren erlaubten Origins und als QR-Code veröffentlichen.

#### Scenario: Einbettung eingeschränkt
- **WHEN** eine Website, die nicht zu den erlaubten Origins des Formulars gehört, das Formular einbettet
- **THEN** verweigert der Browser die Darstellung

### Requirement: Spam-Schutz für Anträge
Das System MUSS (SHALL) öffentliche Formulare ohne Drittanbieterdienste durch ein Honeypot-Feld, eine Ratenbegrenzung pro IP und eine Mindestausfüllzeit schützen, mit optionalem E-Mail-Double-Opt-in, bevor der Antrag Admins angezeigt wird.

#### Scenario: Bot-Einsendung
- **WHEN** eine Einsendung das Honeypot-Feld ausfüllt oder 2 Sekunden nach dem Laden des Formulars eintrifft
- **THEN** wird sie im Admin-Posteingang nicht angezeigt

### Requirement: Unveränderlicher Antragsdatensatz
Das System MUSS (SHALL) jede Einsendung unveränderlich mit Daten, Versionen der Einwilligungstexte, Zeitstempel und gehashter IP speichern und sie per E-Mail mit einer PDF-Kopie bestätigen.

#### Scenario: Nutzdaten unverändert
- **WHEN** ein Admin beim Annehmen eines Antrags Daten bearbeitet
- **THEN** bleiben die gespeicherten Nutzdaten der Einsendung unverändert

### Requirement: Entscheidungen über Anträge
Das System MUSS (SHALL) Admins erlauben, Anträge einzeln oder per Massenaktion anzunehmen (nach einer Dublettenprüfung werden Person, Mitglied in `active` oder `future`, Gruppenmitgliedschaften, Beitragszuordnung und Mandat in einer Transaktion angelegt), mit E-Mail abzulehnen oder als Spam zu markieren.

#### Scenario: Annahme legt Datensätze an
- **WHEN** ein Admin einen Antrag mit einer Abteilung und Lastschrift annimmt
- **THEN** werden Person, Mitglied, Gruppenmitgliedschaft, Beitragszuordnung und Mandat gemeinsam angelegt, oder bei einem Fehler keines davon

### Requirement: Online-Erfassung des Mandats
Das System MUSS (SHALL) ein Formular-Mandat (Unterschriftsdatum = Einsendedatum, Nachweis = Einsendedatensatz) nur aktivieren, wenn die Zustimmung der Vereinsbank zu E-Mandaten erfasst ist; sonst MUSS es das Mandat als `pending_evidence` anlegen, ein vorausgefülltes Mandats-PDF zur Unterschrift senden und dem Admin zeigen, dass eine Lastschrift ohne gültiges Mandat 13 Monate rückforderbar ist; bei Antragstellenden unter 18 MUSS der eigens erfasste Kontoinhaber zahlen, nie die Person selbst.

#### Scenario: Keine Bankzustimmung
- **WHEN** ein Antrag mit Mandat angenommen wird und keine Bankzustimmung erfasst ist
- **THEN** ist das Mandat `pending_evidence` und ein Mandats-PDF wird zur Unterschrift gesendet

#### Scenario: Minderjährige antragstellende Person
- **WHEN** ein 12-jähriges Kind mit dem Konto eines Elternteils einen Antrag stellt
- **THEN** wird der Elternteil als eigene Person angelegt und ist die zahlungspflichtige Person des Mandats

### Requirement: Regel für das Eintrittsdatum bei Annahme (sollte)
Das System MUSS (SHALL) das Eintrittsdatum bei Annahme nach einer Vereinsregel setzen (Antragsdatum, Annahmedatum, 1. des Antragsmonats oder 1. des Folgemonats, pro Antrag überschreibbar) und die Mitgliedsnummer nach dem Muster vergeben.

#### Scenario: Erster des Folgemonats
- **WHEN** ein Antrag vom 14. März unter der Regel „1. des Folgemonats“ angenommen wird
- **THEN** ist das Eintrittsdatum der 1. April und das Mitglied ist bis dahin `future`

### Requirement: Kontaktformulare (könnte)
Das System MUSS (SHALL) erlauben, dass ein Formular ein Kontaktformular ist, das eine Person als Nichtmitglied in einer gewählten Adressgruppe anlegt, mit demselben Spam-Schutz und denselben Einwilligungsnachweisen.

#### Scenario: Sponsorenkontakt
- **WHEN** ein Kontaktformular für die Adressgruppe "Sponsoren" eingesendet wird
- **THEN** wird eine Person als Nichtmitglied in dieser Gruppe mit dem Einwilligungsnachweis angelegt

### Requirement: Portalidentität über die E-Mail-Adresse
Das System MUSS (SHALL) Mitglieder pro E-Mail-Adresse anmelden und jede aktuelle Mitgliedschaft zeigen, deren Person diese Adresse hat, sodass ein Elternteil die Mitgliedschaften der unter derselben Adresse registrierten Kinder sieht.

#### Scenario: Familie unter einer Adresse
- **WHEN** ein Elternteil und ein Kind eine E-Mail-Adresse teilen und der Elternteil sich anmeldet
- **THEN** zeigt das Portal beide Mitgliedschaften und die an einen von beiden adressierten Rechnungen

### Requirement: Feste Feldregeln für Änderungsanfragen
Das System MUSS (SHALL) Änderungen der Telefonnummer sofort übernehmen und Änderungen von Name, E-Mail-Adresse, Postanschrift und IBAN bis zur Freigabe zurückhalten.

#### Scenario: Adresse wartet
- **WHEN** ein Mitglied im Portal seinen Wohnort ändert
- **THEN** behält der Mitgliedsdatensatz den alten Wohnort, bis ein Admin die Anfrage annimmt

### Requirement: Feste Antragsbausteine
Das System MUSS (SHALL) Antragsformulare aus festen, pro Formular konfigurierten Bausteinen aufbauen (persönliche Daten, Adresse, Kontakt, angebotene Gruppen, angebotene Beitragsmodelle, optionales SEPA-Mandat, Abschnitt für Erziehungsberechtigte bei Antragstellenden unter 18, Einwilligung mit Datenschutz-Link).

#### Scenario: Erziehungsberechtigte bei Minderjährigen
- **WHEN** eine antragstellende Person ein Geburtsdatum eingibt, das weniger als 18 Jahre zurückliegt
- **THEN** fragt das Formular nach einer erziehungsberechtigten Person, verweigert das Absenden ohne sie und verweigert ein Mandat, dessen Kontoinhaber die antragstellende Person ist

### Requirement: Für Mitglieder sichtbare benutzerdefinierte Felder im Portal
Das System MUSS (SHALL) einem Mitglied im Portal die Werte der benutzerdefinierten Felder zeigen, die der Verein als für Mitglieder sichtbar markiert hat, und keine anderen benutzerdefinierten Felder.

#### Scenario: Internes Feld bleibt verborgen
- **WHEN** ein Mitglied mit einer Shirtgröße (für Mitglieder sichtbar) und einer internen Notiz das Portal öffnet
- **THEN** wird die Shirtgröße angezeigt und die interne Notiz nicht

### Requirement: Auslagenerstattungen aus dem Portal
Das System MUSS (SHALL) Mitgliedern erlauben, im Portal Auslagenerstattungen mit einer Belegdatei einzureichen, und der Kassenwart:in erlauben, eine Erstattung in einen offenen Beleg (mit dieser Datei) zu übernehmen oder sie mit einer für das Mitglied sichtbaren Begründung abzulehnen.

#### Scenario: Angenommene Erstattung
- **WHEN** die Kassenwart:in eine Erstattung über 12,80 € annimmt und ein Aufwandskonto wählt
- **THEN** existiert ein offener Beleg über 12,80 € mit der Belegdatei des Mitglieds, und das Mitglied sieht die Erstattung als angenommen

### Requirement: Haushaltsvertretung
Das System MUSS (SHALL) der zahlenden Person eines Haushalts erlauben, die Mitgliedschaften des Haushalts im Portal zu verwalten, während Mitglieder mit eigener E-Mail-Adresse nur selbst austreten können.

#### Scenario: Kind ohne E-Mail
- **WHEN** die zahlende Person sich im Portal anmeldet
- **THEN** wird die Mitgliedschaft des Kindes als von der zahlenden Person verwaltet angezeigt und kann geändert oder gekündigt werden

### Requirement: Mitgliederumfragen
Das System MUSS (SHALL) dem Vorstand erlauben, Umfragen durchzuführen, die berechtigte Mitglieder im Portal einmal pro Mitgliedschaft beantworten, Mitgliedern Ergebnisse erst nach dem Ende zeigen und dem Vorstand nur Zählungen zeigen.

#### Scenario: Gruppenumfrage
- **WHEN** eine Umfrage auf die Vorstandsgruppe beschränkt ist
- **THEN** sehen Mitglieder außerhalb der Gruppe sie nicht und können sie nicht beantworten

### Requirement: E-Mail zur Entscheidung über Auslagen
Das System MUSS (SHALL) dem Mitglied eine E-Mail senden, wenn seine Auslagenerstattung genehmigt oder abgelehnt wird, bei einer Ablehnung mit Begründung.

#### Scenario: Abgelehnte Erstattung
- **WHEN** die Kassenwart:in eine Erstattung mit der Begründung "Beleg unleserlich" ablehnt
- **THEN** erhält das Mitglied eine E-Mail, dass die Erstattung mit dieser Begründung abgelehnt ist

### Requirement: Mitgliederprofil im Portal
Das System MUSS (SHALL) einem Mitglied erlauben, im Portal für jede Mitgliedschaft unter seiner Adresse ein Profil zu pflegen: Anzeigename, Bio, Ort, Organisation, optionales Foto, geordnete Liste von Links, Profiltyp aus der Liste des Vereins (Standard `none`) und Sichtbarkeit des Kontakts (standardmäßig Vorstand, Mitglieder oder öffentlich). Das Mitglied MUSS das Profil jederzeit verbergen können.

#### Scenario: Sofort verbergen
- **WHEN** ein Mitglied mit öffentlichem Profil dieses verbirgt
- **THEN** listet die nächste Anfrage an den öffentlichen Feed es nicht mehr

#### Scenario: Änderung braucht erneut Freigabe
- **WHEN** ein Mitglied die Bio eines freigegebenen Profils ändert
- **THEN** ist das Profil nicht mehr öffentlich, bis der Vorstand es erneut freigibt

### Requirement: Profilfoto braucht Einwilligung
Das System MUSS (SHALL) ein Profilfoto nur öffentlich ausliefern, solange das Mitglied eine aktive Einwilligung für den Zweck `photos` hat.

#### Scenario: Einwilligung widerrufen
- **WHEN** ein Mitglied die Einwilligung `photos` widerruft
- **THEN** zeigt der öffentliche Feed kein Foto für das Mitglied und die Foto-URL antwortet mit 404

### Requirement: Freigabe durch den Vorstand und öffentlicher Feed
Das System MUSS (SHALL) ein Profil nur öffentlich listen, wenn sein Typ nicht `none` ist, der Vorstand die aktuelle Version freigegeben hat, es nicht verborgen ist und die Mitgliedschaft aktuell ist. Es MUSS pro Verein einen schreibgeschützten Feed mit CORS für jede Origin, kurzen Cache-Headern und einer Ratenbegrenzung anbieten und MUSS die Kontakt-E-Mail nur enthalten, wenn deren Sichtbarkeit öffentlich ist.

#### Scenario: Nicht freigegeben
- **WHEN** ein Mitglied seinen Typ auf Profi setzt
- **THEN** listet der Feed das Mitglied nicht, bis ein Admin das Profil freigibt

### Requirement: Import von KI-Klub-Profilen
Das System MUSS (SHALL) einen Import von KI-Klub-Profilen, Links und Fotos anbieten, der zuerst als Probelauf läuft, Mitglieder per E-Mail zuordnet und vor dem Schreiben meldet, was er anlegen, aktualisieren oder überspringen würde.

#### Scenario: Probelauf
- **WHEN** der Import ohne das Bestätigungs-Flag läuft
- **THEN** meldet er die geplanten Änderungen und schreibt nichts

### Requirement: Profilfotos ohne Kamera-Metadaten
Das System MUSS (SHALL) Profilfotos ohne Kamera-Metadaten speichern und veröffentlichen. EXIF (außer der Ausrichtung), GPS, XMP, Kommentare, Farbprofile, Text- und private Chunks DÜRFEN NICHT gespeichert oder veröffentlicht werden. Ein Foto, dessen Struktur nicht gelesen werden kann, oder ein animiertes Bild MUSS abgelehnt werden.

#### Scenario: Ein Handyfoto mit Standort
- **WHEN** ein Mitglied ein JPEG, PNG oder WebP mit GPS-Standort hochlädt
- **THEN** enthält weder die gespeicherte Kopie noch das öffentliche Foto den Standort
- **AND** ein JPEG behält seine Ausrichtung und wird daher aufrecht angezeigt

#### Scenario: Ein vor der Änderung gespeichertes Foto
- **WHEN** der öffentliche Feed ein mit Metadaten gespeichertes Foto ausliefert
- **THEN** sind die ausgelieferten Bytes bereinigt, unter einem ETag, der sich vom gespeicherten Hash unterscheidet

