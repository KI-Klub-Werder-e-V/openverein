# documents Specification

## Purpose
Die Capability documents umfasst den inhaltsadressierten Dateispeicher, den jedes Modul für Uploads und erzeugte Dokumente nutzt (MVP, aus den technischen Hinweisen von B M07, M12, M14, M17, M22 und M36), sowie die Dateiverwaltung mit Ordnerberechtigungen, Versionierung und Freigabe im Portal (B P24, Post-MVP). Punkte, die B als „sollte“ oder „könnte“ bewertet, sind im Namen der Anforderung entsprechend gekennzeichnet.
## Requirements
### Requirement: Inhaltsadressierter Dateispeicher
Das System MUSS (SHALL) jede Datei unter ihrem SHA-256 mit Größe, MIME-Typ, Originalname, Eigentümer:in, Aufbewahrungsklasse und Legal-Hold-Kennzeichen speichern, identische Bytes nur einmal ablegen und standardmäßig ein lokales Volume sowie optional ein S3-kompatibles Backend unterstützen.

#### Scenario: Deduplizierte Bytes
- **WHEN** dasselbe PDF zweimal als Beleg hochgeladen wird
- **THEN** werden die Bytes einmal gespeichert und beide Dateieinträge verweisen auf denselben Hash

### Requirement: Unveränderliche ausgestellte Dokumente
Das System MUSS (SHALL) ausgestellte Dokumente (Rechnungen, Stornodokumente, Spendenbescheinigungen, SEPA-Dateien, E-Rechnungen) einmalig mit ihrem SHA-256 speichern und DARF sie NIEMALS neu rendern oder überschreiben; jeder Download MUSS die gespeicherten Bytes liefern.

#### Scenario: Integritätsprüfung
- **WHEN** ein gespeichertes ausgestelltes Dokument zurückgelesen wird
- **THEN** entspricht sein SHA-256 dem bei der Ausstellung erfassten Hash, andernfalls schlägt das Lesen mit einem Integritätsfehler fehl

### Requirement: Aufbewahrungsklassen und Legal Hold für Dateien
Das System MUSS (SHALL) jeder Datei eine Aufbewahrungsklasse zuweisen (zum Beispiel `voucher` für 8 Jahre, `temporary` für Exporte, `raw_banking`), temporäre Exportdateien nach 7 Tagen löschen und DARF eine Datei unter Legal Hold oder innerhalb ihrer Aufbewahrungsfrist NIEMALS löschen.

#### Scenario: Temporärer Export läuft ab
- **WHEN** eine Exportdatei 8 Tage alt ist
- **THEN** ist sie gelöscht und ihr Download-Link antwortet mit „abgelaufen“

#### Scenario: Beleg bleibt erhalten
- **WHEN** die Löschung einer Belegdatei innerhalb ihrer 8-jährigen Aufbewahrungsfrist angefordert wird
- **THEN** lehnt das System ab

### Requirement: Verschlüsselte Bank-Rohdateien
Das System MUSS (SHALL) Dateien der Klasse `raw_banking` (gespeicherte pain.008-, pain.001- und CAMT-Dateien) sowie Importer-Payloads im Ruhezustand verschlüsseln.

#### Scenario: Im Ruhezustand verschlüsselt
- **WHEN** eine gespeicherte CAMT-Datei direkt vom Volume gelesen wird
- **THEN** ist ihr Inhalt Chiffretext

### Requirement: Löschen nach Commit
Das System MUSS (SHALL) Datei-Bytes erst dann aus dem Speicher entfernen, wenn die Datenbanktransaktion, die den letzten Verweis entfernt hat, committet ist.

#### Scenario: Zurückgerollte Löschung
- **WHEN** eine Anonymisierungstransaktion fehlschlägt und zurückgerollt wird
- **THEN** sind alle Dateien, auf die sie verwiesen hat, weiterhin lesbar

### Requirement: Ordner mit Berechtigungen
Das System MUSS (SHALL) Ordner für gemeinsame Dokumente (zum Beispiel Satzung, Protokolle, Formulare) anbieten, mit Lese- oder Schreibzugriff je Rolle oder Gruppe, der an Unterordner vererbt wird, sofern nicht überschrieben, und über dieselben Policy-Prüfungen durchgesetzt wird wie im Rest der Anwendung; dies ist Post-MVP (B P24).

#### Scenario: Ordnerzugriff verweigert
- **WHEN** ein Mitglied ohne Zugriff auf den Ordner "Vorstand" Dateien auflistet
- **THEN** werden dieser Ordner und seine Dateien nicht angezeigt

#### Scenario: Vererbter Zugriff
- **WHEN** die Gruppe "Trainer" Lesezugriff auf "Formulare" hat
- **THEN** können ihre Mitglieder Dateien in "Formulare/Anträge" lesen, sofern dieser Unterordner das nicht überschreibt

### Requirement: Dateiversionierung
Das System MUSS (SHALL) frühere Versionen aufbewahren, wenn eine Datei in einem Ordner ersetzt wird, und berechtigte Benutzer:innen diese auflisten und herunterladen lassen; dies ist Post-MVP (B P24).

#### Scenario: Vorherige Version
- **WHEN** das Satzungs-PDF durch eine neue Version ersetzt wird
- **THEN** bleibt die vorherige Version über die Versionsliste herunterladbar

### Requirement: Freigabe im Portal
Das System MUSS (SHALL) Ordner oder Dateien im Portal gruppenweise für Mitglieder freigeben, und freigegebene Dateien MÜSSEN unter „Meine Dokumente“ erscheinen; dies ist Post-MVP (B P24).

#### Scenario: Für Mitglieder freigegeben
- **WHEN** der Vorstand den Protokollordner für alle aktiven Mitglieder freigibt
- **THEN** sieht jedes aktive Mitglied die Dateien im Portal unter „Meine Dokumente“

### Requirement: Dateien an einem Mitgliedsdatensatz
Das System MUSS (SHALL) einem Mitglied zugeordnete Dateien (zum Beispiel einen unterschriebenen Antrag) unter den Berechtigungen des Mitglieds führen, sodass nur Benutzer:innen, die dieses Mitglied lesen dürfen, sie auflisten oder herunterladen können.

#### Scenario: Trainer:in außerhalb der Gruppe
- **WHEN** ein:e auf "Tennis" beschränkte:r Trainer:in Dateien eines Mitglieds auflistet, das nicht in "Tennis" ist
- **THEN** schlägt die Anfrage als nicht gefunden fehl

### Requirement: Upload als Roh-Bytes
Das System MUSS (SHALL) Uploads als `application/octet-stream` von höchstens 20 MB nur auf den Datei-Routen annehmen, mit Ablageort und Aufbewahrungsklasse als Query-Parameter und dem Dateinamen im Header `X-File-Name` (prozentkodiertes UTF-8), sodass Namen nie in Anfrage-URLs erscheinen.

#### Scenario: Upload an anderer Stelle abgelehnt
- **WHEN** ein Client `application/octet-stream` an die Mitglieder-Route sendet
- **THEN** wird die Anfrage mit 415 abgelehnt

#### Scenario: Name im Header
- **WHEN** eine Datei "Attest Müller.pdf" mit ihrem Namen in `X-File-Name` hochgeladen wird
- **THEN** wird sie unter diesem Namen gespeichert und die URL enthält keinen Namen

### Requirement: Inventar und Verleih
Das System MUSS (SHALL) die Gegenstände des Vereins und deren Ausleihe an Mitglieder erfassen, dabei nie mehr verleihen als verfügbar und Ausleihen nach ihrem Fälligkeitsdatum kennzeichnen.

#### Scenario: Letzter Ball
- **WHEN** 2 von 3 Bällen verliehen sind und jemand 2 weitere anfragt
- **THEN** wird die Ausleihe mit "Nur noch 1 Stück verfügbar" abgelehnt

