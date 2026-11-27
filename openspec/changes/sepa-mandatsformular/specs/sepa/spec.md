## ADDED Requirements

### Requirement: Mandatsformular
Das System MUSS (SHALL) für ein Mitglied ein Mandatsformular als PDF-Brief erzeugen: Verein mit Gläubiger-ID, Mitglied, Mandatstext, Kontoinhaber:in und Anschrift vorausgefüllt (aus dem aktuellen Mandat oder dem Mitglied), leere Felder für Bankdaten, Ort, Datum und Unterschrift. Es DARF weder IBAN noch Mandatsreferenz enthalten; die Referenz kommt mit der Vorabankündigung. Ohne Gläubiger-ID MUSS es das Formular verweigern.

#### Scenario: Formular ohne Bankdaten
- **WHEN** für ein Mitglied mit aktivem Mandat ein Mandatsformular erzeugt wird
- **THEN** enthält das PDF den Namen der Kontoinhaber:in, aber weder IBAN noch Mandatsreferenz

#### Scenario: Gläubiger-ID fehlt
- **WHEN** der Verein keine Gläubiger-ID eingetragen hat
- **THEN** wird kein Formular erzeugt und auf die Vereinseinstellungen verwiesen

### Requirement: Mandat anfordern
Das System MUSS (SHALL) das Mandatsformular für ein oder mehrere Mitglieder per E-Mail als Anhang verschicken können. Mitglieder, die Briefe bevorzugen oder keine zustellbare Adresse haben, MÜSSEN auf einer Druckliste erscheinen, die als ein PDF gedruckt werden kann (nach Postleitzahl sortiert, für Duplexdruck). Jede Anforderung MUSS mit dem Weg (E-Mail, Brief, PDF) im Verlauf des Mitglieds protokolliert werden.

#### Scenario: Versand nach Kanal
- **WHEN** drei Mitglieder angefordert werden und eines davon Briefe bevorzugt
- **THEN** gehen zwei E-Mails mit Formular in die Warteschlange und das dritte Mitglied steht auf der Druckliste

#### Scenario: Doppelklick
- **WHEN** dieselbe Anforderung zweimal hintereinander abgeschickt wird, bevor die erste E-Mail versendet ist
- **THEN** geht an jedes Mitglied nur eine E-Mail

### Requirement: Mandat mitteilen
Das System MUSS (SHALL) Mitgliedern die Daten ihres aktuellen Mandats per E-Mail oder PDF-Brief mitteilen (Druckliste wie beim Anfordern): Gläubiger-ID, Mandatsreferenz, Kontoinhaber:in, IBAN bis auf die letzten vier Ziffern verdeckt, Unterschriftsdatum. Mitglieder ohne aktives oder auf die Unterschrift wartendes Mandat MÜSSEN ausgelassen und benannt werden; jede Mitteilung MUSS im Verlauf des Mitglieds stehen.

#### Scenario: Mitteilung per E-Mail
- **WHEN** einem Mitglied mit Mandat dessen Daten per E-Mail mitgeteilt werden
- **THEN** enthält die E-Mail Mandatsreferenz und Gläubiger-ID, die IBAN aber nur verdeckt

#### Scenario: Mitglied ohne Mandat
- **WHEN** zwei Mitglieder ausgewählt sind und eines kein Mandat hat
- **THEN** geht nur an das andere eine Mitteilung, und das Mitglied ohne Mandat wird als ausgelassen genannt

### Requirement: Neue Bankverbindung zum bestehenden Mandat
Wechselt bei **gleicher Kontoinhaber:in** nur die Bankverbindung, MUSS (SHALL) das System die neue IBAN in das bestehende Mandat übernehmen können, ohne ein neues anzulegen: Die Mandatsreferenz bleibt, eine neue Unterschrift ist nicht nötig. Es MUSS denselben Weg (SMNDA nach EPC132-17 §2.5) nutzen wie die Bankänderung aus dem Portal. Beim Anlegen eines neuen Mandats SOLLTE (SHOULD) die Oberfläche auf diese Aktion hinweisen, wenn schon ein aktives Mandat besteht.

#### Scenario: Bankfusion bei bekanntem Mandat
- **WHEN** für ein aktives, bereits eingezogenes Mandat eine neue IBAN übernommen wird
- **THEN** bleibt die Mandatsreferenz erhalten, und der nächste Einzug trägt die Änderung (SMNDA) mit dem bisherigen Konto

#### Scenario: Konto gewechselt, bevor je eingezogen wurde
- **WHEN** für ein Mandat, das die Bank noch nie gesehen hat, eine neue IBAN übernommen wird
- **THEN** wird nur das Konto ausgetauscht, ohne eine Änderung anzukündigen

#### Scenario: Widerrufenes Mandat
- **WHEN** für ein widerrufenes Mandat eine neue Bankverbindung übernommen werden soll
- **THEN** wird die Aktion abgelehnt und auf ein neues Mandat verwiesen
