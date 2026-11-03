# platform Specification

## Purpose
Die Capability platform umfasst die App-Shell, die deutschsprachige Oberfläche, die Nutzer:innen mit „Du“ anspricht, Barrierefreiheit nach WCAG 2.2 AA, das feste Dashboard (B M40), die Hintergrund-Job-Leiste (B M41), die sich selbst abhakende Checkliste für die Ersteinrichtung, den öffentlichen Demo-Modus und den Selbstbetrieb (B M42) sowie mobile Builds, die den Web-Build mit Capacitor verpacken. Punkte, die B mit „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet; alles andere ist MVP-Verhalten, einschließlich des Demo-Modus.
## Requirements
### Requirement: Eine App-Shell auf der öffentlichen API
Das System MUSS (SHALL) eine einzige Webanwendung mit einem Admin-Routenbaum und einem getrennten `/portal`-Routenbaum ausliefern, beide auf derselben öffentlichen REST-API aufgebaut, mit einer Kopfzeile, die globale Suche, Job-Leiste und Benutzermenü enthält.

#### Scenario: Portal und Admin teilen sich die API
- **WHEN** in der Oberfläche eine Admin-Aktion ausgeführt wird
- **THEN** wird sie über einen dokumentierten `/api/v1`-Endpunkt ausgeführt, und es gibt keinen privaten, nur für die Oberfläche bestimmten Endpunkt

### Requirement: Deutschsprachige Oberfläche mit „Du“-Ansprache
Das System MUSS (SHALL) Deutsch als Standardsprache ausliefern, Nutzer:innen in allen Oberflächentexten, E-Mails und Systemmeldungen mit dem informellen „Du“ ansprechen und jeden Oberflächentext hinter einem i18n-Schlüssel führen, sodass weitere Sprachen ohne Codeänderungen ergänzt werden können.

#### Scenario: Informelle Ansprache
- **WHEN** eine Nutzer:in einen beliebigen Bildschirm öffnet oder eine System-E-Mail erhält
- **THEN** spricht der Text sie mit „Du“ und niemals mit „Sie“ an

#### Scenario: Keine fest codierten Texte
- **WHEN** die Textprüfung im CI läuft
- **THEN** schlägt sie bei jedem sichtbaren Text fehl, der nicht hinter einem i18n-Schlüssel steht

### Requirement: Barrierefreiheit nach WCAG 2.2 AA
Das System MUSS (SHALL) in Admin-Oberfläche, Portal und öffentlichen Formularen WCAG 2.2 AA erfüllen: Jede Aktion ist per Tastatur bedienbar (auch Spaltenauswahl und Mehrfachauswahl), der Fokus ist sichtbar und unverdeckt, Textkontrast mindestens 4,5:1, Fließtext mindestens 14 px, Formularfehler werden Screenreadern angesagt, Zielflächen mindestens 24 × 24 px; das CI MUSS auf jeder Route automatisierte axe-core-Prüfungen ausführen und bei jedem schweren Verstoß fehlschlagen.

#### Scenario: Spaltenauswahl nur per Tastatur
- **WHEN** eine Nutzer:in Listenspalten nur mit der Tastatur hinzufügt, entfernt und umsortiert
- **THEN** funktioniert jeder Schritt ohne Drag-and-drop

#### Scenario: Barrierefreiheits-Gate im CI
- **WHEN** eine Route einen schweren axe-core-Verstoß aufweist
- **THEN** schlägt die CI-Pipeline fehl

### Requirement: Festes Dashboard
Das System MUSS (SHALL) eine Startseite mit festen Kacheln zeigen, jede nur bei Leserecht auf ihre Daten: Kontostände, Mitglieder (Anzahl aktiv, Ein- und Austritte im Jahr, 24-Monats-Trend), offene Anträge, ausstehende Änderungsanträge, Abgleich-Eingang, offene Forderungen und Anzahl überfällig, nächster Beitragslauf und Einzugstermin, ablaufende Mandate, fehlgeschlagene Zustellungen, Admin-Notizen; jede Kachel MUSS zur gefilterten Liste verlinken, die Seite bei 2.000 Mitgliedern in unter 1 Sekunde laden. Keine Anbieter-News, kein Feature-Wunsch-Widget.

#### Scenario: Kachel ohne Zugriff ausgeblendet
- **WHEN** eine Trainer:in ohne Finanzzugriff das Dashboard öffnet
- **THEN** werden die Kacheln für Kontostände und Forderungen nicht angezeigt

#### Scenario: Kachel verlinkt auf Liste
- **WHEN** eine Nutzer:in auf die Kachel „überfällige Forderungen“ klickt
- **THEN** öffnet sich die Offene-Posten-Liste, gefiltert auf überfällige Posten

### Requirement: Hintergrund-Job-Leiste
Das System MUSS (SHALL) die Hintergrund-Jobs der Nutzer:in in einer Leiste in der Kopfzeile mit Art, Startzeit, Fortschritt in Prozent, Zustand (`queued`, `running`, `done`, `failed`) und Ergebnislink auflisten; der Fortschritt MUSS live per Server-Sent Events aktualisiert werden, mit Polling als Rückfall; fehlgeschlagene Jobs MÜSSEN den Fehler in verständlichem Deutsch zeigen und „Erneut versuchen“ anbieten, wo der Job idempotent ist; Admins MÜSSEN alle Jobs der Organisation sehen.

#### Scenario: Live-Fortschritt
- **WHEN** ein Beitragslauf über 1.200 Mitglieder als Job läuft
- **THEN** zeigt die Leiste den steigenden Fortschritt ohne Neuladen der Seite

#### Scenario: Fehlgeschlagener Job
- **WHEN** ein Export-Job fehlschlägt
- **THEN** zeigt die Leiste den Zustand `failed`, eine deutsche Fehlermeldung und eine Schaltfläche zum erneuten Versuchen

### Requirement: Sich selbst abhakende Checkliste für die Ersteinrichtung
Das System MUSS (SHALL) eine Ersteinrichtungs-Checkliste zeigen, die sich aus echten Daten selbst abhakt: Stammdaten und Briefkopf, SMTP-Test, Kontenplan, Bankkonten und Gläubiger-ID, Gruppen und Beitragspläne, Mitglieder importiert/erfasst, Antragsformular online, erste Beitragslauf-Vorschau, erster Kontoauszug importiert, Backup-Ziel gesetzt. Eine Vereinsart-Vorlage (Sport, Kultur, Soziales, Förderverein) MUSS nur Gruppen, Beitragsplan-Vorlagen und Konten vorauswählen, ohne Marketingfragen.

#### Scenario: Punkt hakt sich selbst ab
- **WHEN** der erste Kontoauszug importiert wird
- **THEN** wird der Checklistenpunkt „erster Kontoauszug importiert“ ohne Zutun der Nutzer:in als erledigt angezeigt

### Requirement: Demo-Modus
Das System MUSS (SHALL) einen Demo-Verein bereitstellen (rund 150 Mitglieder, 3 Abteilungen, Haushalte, ein Jahr Buchungen, Mandate mit Test-IBANs), der per `ovctl seed demo` geladen wird, das Laden in eine Instanz mit echten Daten verweigern, auf jeder Seite und in jedem erzeugten Dokument ein dauerhaftes Banner zeigen, das alle Daten als Demodaten kennzeichnet, und eine öffentliche Demo-Instanz unterstützen, die planmäßig und auf Befehl auf den Ausgangszustand zurückgesetzt wird.

#### Scenario: Demo bei echten Daten verweigert
- **WHEN** eine Betreiber:in `ovctl seed demo` auf einer Instanz mit echten Mitgliedern ausführt
- **THEN** bricht der Befehl ab, ohne Daten zu ändern

#### Scenario: Demo klar gekennzeichnet
- **WHEN** eine Besucher:in auf einer Demo-Instanz eine beliebige Seite öffnet oder ein PDF herunterlädt
- **THEN** weist ein sichtbares Banner oder Wasserzeichen darauf hin, dass es sich um fiktive Demodaten handelt

#### Scenario: Zurücksetzen der öffentlichen Demo
- **WHEN** das geplante Zurücksetzen auf der öffentlichen Demo läuft
- **THEN** werden alle Änderungen der Besucher:innen verworfen und der Ausgangszustand wiederhergestellt

### Requirement: Mobile Builds über Capacitor
Das System MUSS (SHALL) Android- und iOS-Builds erzeugen, indem es denselben Web-Build mit Capacitor verpackt, ohne getrennten nativen Codepfad für Funktionen; die verpackte App MUSS dieselben API-, Authentifizierungs- und Berechtigungsregeln wie die Web-App verwenden.

#### Scenario: Derselbe Build
- **WHEN** ein Release gebaut wird
- **THEN** enthalten die mobilen Pakete dieselbe Web-Bundle-Version wie das Web-Release

### Requirement: Installierbare PWA
Das System MUSS (SHALL) als PWA installierbar sein, die auf einem 390 px breiten Smartphone funktioniert und einen klaren Offline-Zustand zeigt; das MVP DARF Schreibvorgänge im Offline-Betrieb NICHT annehmen.

#### Scenario: Offline-Zustand
- **WHEN** das Gerät die Verbindung verliert
- **THEN** bleibt die App-Shell mit einem „Offline“-Hinweis sichtbar, und schreibende Aktionen sind deaktiviert

### Requirement: Geschäftszeitzone
Das System MUSS (SHALL) jede datumsabhängige Regel (Statuswechsel, Mandatsablauf, Prüfungen gegen das Sperrdatum, Fälligkeiten, Aufbewahrung) in der Geschäftszeitzone der Organisation auswerten, standardmäßig `Europe/Berlin`, niemals nach der UTC-Uhr des Servers.

#### Scenario: Mitternachtsübergang
- **WHEN** ein Job am 31. Dezember um 23:30 UTC läuft, was in Europe/Berlin bereits der 1. Januar ist
- **THEN** behandelt er den heutigen Tag als 1. Januar und setzt ein `future`-Mitglied mit Eintrittsdatum 1. Januar auf `active`

### Requirement: Selbstbetrieb
Das System MUSS (SHALL) `ovctl` ausliefern mit `install` (Domain, Admin-E-Mail, SMTP, Backup-Ziel), `backup` und `restore` (verschlüsselt, extern), `update` (prüft die Image-Signatur, sichert zuerst, migriert nur vorwärts, stoppt bei Fehler den Stack, bietet die Wiederherstellung des Stands vor dem Update an und startet nie das alte Image auf migriertem Schema), `doctor` (Speicher, Zertifikate, Backup-Alter, Restore-Probe, Master-Key, SMTP) und `export-all`.

#### Scenario: Fehlgeschlagenes Update
- **WHEN** während `ovctl update` eine Migration fehlschlägt
- **THEN** wird der Stack gestoppt, und der Betreiber:in wird `ovctl restore` des Backups vor dem Update angeboten

#### Scenario: Unsigniertes Image verweigert
- **WHEN** `ovctl update` ein Image findet, dessen Signatur sich nicht prüfen lässt
- **THEN** bricht das Update ab, bevor eine Migration läuft

### Requirement: Keine Funktionen im Interesse des Anbieters
Das System DARF Produktanalysen, Sitzungsaufzeichnung, Fehlerberichte an den Anbieter, Captchas von Drittanbietern, Anbieter-News, Abstimmungen über Feature-Wünsche, Lizenz- oder Platzbeschränkungen sowie extern geladene Schriften und Skripte NICHT (SHALL NOT) enthalten.

#### Scenario: Keine Anfragen an Dritte
- **WHEN** ein Browser eine beliebige OpenVerein-Seite mit Standardeinstellungen lädt
- **THEN** verlässt keine Anfrage den eigenen Origin des Vereins

### Requirement: Befehlspalette
Das System MUSS (SHALL) auf jeder Admin-Seite mit Strg+K (Cmd+K unter macOS) eine Befehlspalette öffnen, die jedes Navigationsziel und jede globale Aktion auflistet, beim Tippen filtert und den markierten Eintrag mit Enter ausführt; Module MÜSSEN ihr Suchergebnisse (zum Beispiel Mitglieder) hinzufügen können.

#### Scenario: Sprung per Tastatur
- **WHEN** eine angemeldete Nutzer:in Strg+K drückt, „einst“ tippt und Enter drückt
- **THEN** öffnet sich die Einstellungsseite, ohne die Maus zu benutzen

### Requirement: Seitenpanels und Inline-Bearbeitung statt gestapelter Dialoge
Das System MUSS (SHALL) Einzelwerte direkt an Ort und Stelle bearbeiten (Klick oder Enter zum Bearbeiten, Enter zum Speichern, Escape zum Abbrechen) und Datensatzdetails in einem Seitenpanel über der aktuellen Liste öffnen; es DARF NICHT einen Dialog aus einem anderen Dialog heraus öffnen.

#### Scenario: Inline umbenennen
- **WHEN** eine Admin in den Einstellungen auf den Vereinsnamen klickt, einen neuen Namen tippt und Enter drückt
- **THEN** wird der Name über die API gespeichert, die Seitenleiste zeigt den neuen Namen, und die Änderung wird im Audit-Protokoll erfasst

### Requirement: Sicherheit der öffentlichen Demo
Das System MUSS (SHALL) im Demo-Modus Änderungen an Benutzerkonten, Rollen, API-Schlüsseln, Datei-Uploads und Mailserver-Einstellungen verweigern und DARF keine E-Mail außerhalb des Servers zustellen.

#### Scenario: Besucher:in versucht, andere auszusperren
- **WHEN** eine Besucher:in auf der öffentlichen Demo versucht, eine Benutzer:in oder einen API-Schlüssel anzulegen
- **THEN** wird die Anfrage mit dem Hinweis verweigert, dass dies in der Demo gesperrt ist

### Requirement: Lange Vorgänge laufen als Jobs
Das System MUSS (SHALL) lange Vorgänge (beginnend mit dem Vollexport) als Hintergrund-Jobs ausführen, die sofort zurückkehren, ihren Fortschritt melden, ein geschlossenes Tab überstehen und mit den aktuellen Berechtigungen der startenden Nutzer:in laufen.

#### Scenario: Export als Job
- **WHEN** eine Admin einen Vollexport startet
- **THEN** antwortet die API mit 202 und einem Job in der Warteschlange, der Worker erstellt den Export, und der Job endet als erledigt mit der Exportdatei

#### Scenario: Berechtigung vor dem Joblauf entzogen
- **WHEN** der startenden Nutzer:in die Admin-Rolle entzogen wird, bevor der Worker den Job übernimmt
- **THEN** schlägt der Job mit der Meldung fehl, dass die Berechtigung fehlt, und es wird kein Export erstellt

#### Scenario: Einer nach dem anderen
- **WHEN** ein Vollexport-Job wartet oder läuft und ein weiterer gestartet wird
- **THEN** wird die zweite Anfrage mit 409 verweigert

### Requirement: Barrierefreiheit wird im CI geprüft
Das System MUSS (SHALL) das CI fehlschlagen lassen, wenn axe-core auf einer Admin-Route, den Anmeldeseiten oder einem geöffneten Seitenpanel einen schweren oder kritischen Befund nach WCAG 2.2 A/AA meldet.

#### Scenario: Regression erkannt
- **WHEN** eine Änderung auf einer Admin-Route Text mit einem Kontrast unter 4,5:1 einführt
- **THEN** schlägt die Barrierefreiheits-E2E-Spec fehl und nennt Route und Element

### Requirement: Berechtigungs-Angriffssuite im CI
Das System MUSS (SHALL) im CI einen Test ausführen, der jede API-Route mit eingeschränkten Rollen und IDs außerhalb ihres Geltungsbereichs aufruft und fehlschlägt, wenn eine Antwort personenbezogene Daten außerhalb des Geltungsbereichs oder eine geschützte IBAN enthält oder ein Schreibvorgang gelingt.

#### Scenario: Neue Route ohne Geltungsbereichsprüfung
- **WHEN** eine neue GET-Route ein Mitglied per ID ohne die Prüfung des Abteilungs-Geltungsbereichs zurückgibt
- **THEN** schlägt die Angriffssuite fehl und nennt die Route

### Requirement: Ein Befehl für Sicherung und Wiederherstellung
Das System MUSS (SHALL) `ovctl backup` und `ovctl restore` bereitstellen, wobei die Wiederherstellung die Prüfsummen des Backups prüft, zuerst den aktuellen Stand sichert und Löschungen nach dem Backup beibehält.

#### Scenario: Älteres Backup wiederherstellen
- **WHEN** eine Betreiber:in ein Backup wiederherstellt, das vor dem Anlegen eines Mitglieds erstellt wurde
- **THEN** ist das Mitglied verschwunden, das Löschprotokoll enthält weiterhin die neueren Einträge, und der Server beantwortet seinen Health-Check

### Requirement: Falscher Datenschlüssel stoppt den Server
Das System MUSS (SHALL) den Start verweigern, wenn DATA_KEY von dem Schlüssel abweicht, mit dem die Datenbank zum ersten Mal gestartet wurde.

#### Scenario: Wiederherstellung auf neuem Server mit frischem Schlüssel
- **WHEN** ein Backup auf einem Server wiederhergestellt wird, dessen deploy/.env einen neu erzeugten DATA_KEY enthält
- **THEN** startet die App nicht und meldet, dass DATA_KEY nicht zu dieser Datenbank passt

### Requirement: Managed Hosting
Bei eingeschaltetem Managed Hosting MUSS (SHALL) das System Vereine nur über die Betreiber-API anlegen, jeden Verein unter seinem eigenen Hostnamen erreichbar machen und die Daten, Anmeldungen und Portalcodes jedes Vereins innerhalb dieses Vereins halten.

#### Scenario: Portal nach Hostname
- **WHEN** ein Mitglied von Verein B unter dem Hostnamen von Verein A einen Portalcode anfordert
- **THEN** wird in Verein A kein Code ausgestellt

#### Scenario: Zugang unter der Adresse eines anderen Vereins
- **WHEN** die Admin von Verein A sich unter dem Hostnamen von Verein B anmeldet
- **THEN** schlägt die Anmeldung fehl

### Requirement: Eigenes Übersichtslayout
Das System MUSS (SHALL) jedem Zugang erlauben, die Abschnitte der Übersicht zu ordnen und auszublenden, und dieses Layout für den Zugang speichern.

#### Scenario: Erste Schritte ausblenden
- **WHEN** eine Kassenwart:in „Erste Schritte“ ausblendet
- **THEN** zeigt ihre Übersicht diesen Abschnitt nicht mehr, und andere Zugänge sind nicht betroffen

### Requirement: Anmeldung über den Identitätsanbieter des Vereins
Das System MUSS (SHALL) über den OIDC-Anbieter des Vereins nur Zugänge anmelden, die existieren und aktiv sind, zugeordnet über eine bestätigte E-Mail-Adresse, und MUSS bei Zugängen mit zweitem Faktor diesen weiterhin verlangen.

#### Scenario: Unbekannte Adresse
- **WHEN** der Anbieter eine Adresse bestätigt, die im Verein keinen Zugang hat
- **THEN** wird keine Sitzung erstellt, und die Anmeldeseite erklärt den Grund

#### Scenario: Zugang mit zweitem Faktor
- **WHEN** ein Zugang mit TOTP sich über den Anbieter anmeldet
- **THEN** wird die Anmeldung mit dem Code-Schritt fortgesetzt

### Requirement: Löschen eines Vereins auf einer Managed-Installation
Das System MUSS (SHALL) der Betreiber:in erlauben, einen Verein mit allen Daten erst nach Bestätigung seines Hostnamens zu löschen, und MUSS die Daten aller anderen Vereine unverändert lassen.

#### Scenario: Verein verlässt die Installation
- **WHEN** die Betreiber:in einen Verein mit bestätigtem Hostnamen löscht
- **THEN** bleibt keine Zeile dieses Vereins übrig, Rechnungen, Buchungsjournal und Protokoll der anderen Vereine sind unverändert, und unter dem Hostnamen wird niemand mehr angemeldet

#### Scenario: Falsche Bestätigung
- **WHEN** die Bestätigung nicht dem Hostnamen des Vereins entspricht
- **THEN** wird nichts gelöscht

