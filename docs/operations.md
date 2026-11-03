# Betrieb

## Auf einem Server installieren

Du brauchst einen Linux-Server mit Docker (Compose v2), eine Domain, deren DNS auf den Server zeigt, offene Ports 80 und 443 und ein SMTP-Konto für ausgehende E-Mails.

```sh
git clone https://github.com/KI-Klub-Werder-e-V/openverein.git && cd openverein
./ovctl install      # fragt nach Domain, Mailserver und Absender; legt deploy/.env (Modus 600) mit Datenbankpasswort und DATA_KEY an
```

Caddy holt das HTTPS-Zertifikat selbst. Öffne `https://<domain>` und lege den Verein und den ersten Admin an.

**DATA_KEY** in `deploy/.env` verschlüsselt die Bankdaten. Die Datenbank speichert einen Fingerabdruck davon. Ein Server, der mit einem anderen Schlüssel startet, hält mit „DATA_KEY passt nicht zu dieser Datenbank“ an, statt Bankdaten mit einem zweiten Schlüssel zu schreiben (zum Beispiel, wenn Du ein Backup auf einen neuen Server zurückspielst: Kopiere vorher den alten `DATA_KEY` in `deploy/.env`). Ohne den Schlüssel lassen sich die IBANs in einem Backup nicht lesen. Bewahre eine Kopie getrennt von den Backups auf (Passwortmanager, versiegelter Umschlag beim Vorstand), nicht auf derselben Festplatte.

## Sichern, zurückspielen, aktualisieren, prüfen

```sh
./ovctl backup               # Datenbank (pg_dump) und Dateien nach backups/openverein-<Zeit>/ mit SHA256SUMS; behält die letzten 14
                             # (die App hält dafür ein paar Sekunden an, damit beide Hälften zusammenpassen; jede gespeicherte Datei wird geprüft)
./ovctl restore backups/openverein-20261024-0300   # prüft die Prüfsummen, sichert zuerst den aktuellen Stand und spielt dann zurück
./ovctl update               # Backup, git pull, neu bauen, neu starten; startet die neue Version nicht, zeigt es die Befehle für den Weg zurück (Code und Daten zusammen)
./ovctl doctor               # Dienste, Health, DATA_KEY, freier Speicher, Alter des letzten Backups, Ablauf des Zertifikats
./ovctl logs
```

Tägliches Backup per Cron, danach vom Server wegkopiert (restic, rsync oder die Storage Box des Hosters):

```cron
15 3 * * * cd /opt/openverein && ./ovctl backup >> backups/backup.log 2>&1
```

Backups werden nach 14 Tagen rotiert. Das begrenzt auch, wie lange eine gelöschte Person in einem Backup weiterlebt. Mit `BACKUP_KEEP` und `BACKUP_DIR` änderst Du die Voreinstellungen.


## Der einzige Admin hat Handy und Wiederherstellungscodes verloren

Ein anderer Admin kann den zweiten Faktor unter Einstellungen → Zugänge zurücksetzen. Gibt es keinen, setzt Du ihn auf dem Server zurück. Das beendet die Sitzungen der Person; nach der Anmeldung mit ihrem Passwort richtet sie TOTP neu ein:

```sh
docker compose exec db psql -U openverein openverein -c "
  update app_user set totp_secret_encrypted = null, totp_pending_secret_encrypted = null, totp_enabled_at = null, totp_last_step = null where lower(email) = lower('admin@example.org');
  delete from totp_recovery_code where user_id = (select id from app_user where lower(email) = lower('admin@example.org'));
  delete from session where user_id = (select id from app_user where lower(email) = lower('admin@example.org'));"
```

Halte es in den Unterlagen des Vereins fest: Das Zurücksetzen geht am Änderungsprotokoll vorbei.

## Backup zurückspielen und Löschungen

Jede Anonymisierung steht in der Datenbank (`erasure_log`) und wird an `FILES_DIR/erasure-log.jsonl` angehängt. Beim Start überträgt der Server fehlende Einträge aus der Datenbank in die Datei. Danach anonymisiert er jede Person aus der Datei erneut, die eine zurückgespielte Datenbank wiedergebracht hat, bevor er Anfragen annimmt.

Das klappt nur, wenn die Löschdatei das Zurückspielen übersteht. `ovctl restore` kümmert sich darum: Es behält die aktuelle `erasure-log.jsonl` und führt sie mit den zurückgespielten Dateien zusammen. Spielst Du von Hand zurück, behalte die aktuelle `erasure-log.jsonl` (setze das Datei-Volume nicht auf denselben Stand zurück) oder kopiere sie vor dem Start des Servers zurück.

## Hosting für andere: mehrere Vereine auf einer Installation

Für Vereine ohne Technik-Ehrenamtliche kann ein Betreiber mehrere Vereine auf einer OpenVerein-Installation betreuen. Jede Tabelle trägt bereits den Verein (`organization_id`). Jeder Verein ist unter seinem eigenen Hostnamen erreichbar, zum Beispiel `tsv-musterstadt.example-hosting.de`.

1. Setze `MULTI_TENANT=true` und ein `OPERATOR_TOKEN` aus mindestens 32 zufälligen Zeichen (aus Deinem Secret-Speicher). `DEMO_MODE` lässt sich damit nicht kombinieren. Die offene Einrichtungsseite ist dann geschlossen.
2. Lass den Hostnamen jedes Vereins auf den Server zeigen. Nutze mit Caddy ein Wildcard-Zertifikat oder On-Demand-TLS, beschränkt auf die Hostnamen, die Du angelegt hast (Caddys `ask`-Endpunkt). So kann niemand den Server dazu bringen, Zertifikate für beliebige Namen anzufordern.
3. Lege einen Verein mit seinem ersten Admin an:

   ```sh
   curl -X POST https://<any-host>/api/v1/operator/tenants \
     -H "X-Operator-Token: $OPERATOR_TOKEN" -H 'content-type: application/json' \
     -d '{"clubName":"TSV Musterstadt 1890 e.V.","hostname":"tsv-musterstadt.example-hosting.de","adminName":"Erika Mustermann","adminEmail":"vorstand@tsv-musterstadt.de"}'
   ```

   Der Admin bekommt eine Einladung per E-Mail mit einem Link auf den Hostnamen des Vereins (die Antwort enthält den Link ebenfalls, er gilt sieben Tage). `GET /api/v1/operator/tenants` listet die Vereine; `PATCH /api/v1/operator/tenants/<id>` ändert einen Hostnamen oder Namen.

Beim Hosting für andere gehen E-Mails von der Adresse des Betreibers (`MAIL_FROM`) mit dem Namen des Vereins hinaus. Die eigene Adresse des Vereins wird zum Reply-To. So kann kein Verein über den gemeinsamen Server im Namen der Domain eines anderen Vereins senden. `MAIL_PER_MINUTE_MAX` (Voreinstellung 60) begrenzt die Senderate je Verein. Aufnahmeformulare und öffentliche Kalender antworten nur auf dem Hostnamen ihres eigenen Vereins. Stellst Du eine bestehende Installation mit einem Verein auf `MULTI_TENANT=true` um, setze zuerst den Hostnamen des Vereins (`PATCH /api/v1/operator/tenants/<id>`), sonst kann sich niemand anmelden.

Was ein Verein sieht und tut, bleibt in seinem Verein: Mitglieder, E-Mails, Dateien, das Portal (es meldet Mitglieder für den Verein an, dessen Hostnamen sie verwenden) und der Gesamtexport unter Einstellungen → Gesamtexport. Eine E-Mail-Adresse kann nur in einem Verein ein Admin-Zugang sein. E-Mails gehen je Verein hinaus, jeweils mit eigener Rate und eigenem Pausenschalter.

Als Betreiber verarbeitest Du die Daten der Vereine in deren Auftrag: Schließe mit jedem Verein einen Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO). `docs/avv-vorlage.md` ist eine deutsche Vorlage mit den technischen und organisatorischen Maßnahmen, die OpenVerein mitbringt, und einem Teil für Deinen eigenen Betrieb.

### Wenn ein Verein geht

1. Gib seine Daten heraus. Die Admins des Vereins können sie selbst herunterladen (Einstellungen → Gesamtexport), oder Du holst sie:

   ```sh
   curl -o tsv-musterstadt.zip https://<any-host>/api/v1/operator/tenants/<id>/export.zip -H "X-Operator-Token: $OPERATOR_TOKEN"
   ```

   Das Archiv ist der vollständige Export aus `export-schema.md`, mit allen Dateien (nie zwischengespeichert: `Cache-Control: private, no-store`). Es entsteht im Arbeitsspeicher: Bei Vereinen mit vielen Hundert Megabyte an Dateien sorge für genug Speicher auf dem Server, oder lass den Verein seinen Export selbst herunterladen. Es enthält die Bankdaten der Mitglieder: Bewahre es auf und verschicke es wie alle anderen personenbezogenen Daten.
2. Lösche den Verein mit allem, was ihm gehört. Zur Bestätigung gibst Du den Hostnamen des Vereins an:

   ```sh
   curl -X DELETE https://<any-host>/api/v1/operator/tenants/<id> -H "X-Operator-Token: $OPERATOR_TOKEN" \
     -H 'content-type: application/json' -d '{"confirmHostname":"tsv-musterstadt.example-hosting.de"}'
   ```

   Die Antwort zählt die gelöschten Zeilen je Tabelle. Ausgestellte Rechnungen, das Journal und Belege schützen Datenbank-Trigger. Die Löschung läuft deshalb mit abgeschalteten Triggern; dafür braucht sie eine Datenbankverbindung als Superuser, wie im mitgelieferten Docker-Setup. Vor dem Commit prüft sie jeden Fremdschlüssel: Zeigt noch eine Zeile eines anderen Vereins in den gelöschten hinein, wird nichts gelöscht. Die Dateien des Vereins verschwinden beim nächsten Aufräumen der Dateien (innerhalb eines Tages). Seine Zeilen bleiben in Deinen Backups, bis diese ablaufen (AVV Abschnitt 6.2). Das eigene Änderungsprotokoll des Vereins wird mitgelöscht. Die Löschung und jeder Export stehen in der Tabelle `operator_event`, in die nur angehängt wird und die den Verein überdauert. Die Löschung steht außerdem im Löschprotokoll: Spielst Du ein älteres Backup zurück, das den Verein noch enthält, löscht OpenVerein ihn beim Start erneut.

Backups je Verein gibt es noch nicht: `ovctl backup` sichert die ganze Installation.

## KI Klub Werder: Profile übernehmen

Die Profile des KI Klub (`klub_profil`, `klub_profil_link`, Fotos als `bytea`) übernimmt ein Skript, einmalig. Es ordnet sie den Mitgliedern über die E-Mail-Adresse zu. Der Probelauf schreibt nichts, zeigt jedes Profil und endet mit einem Code; nur `--confirm <Code>` schreibt, und nur wenn sich seither nichts geändert hat.

```bash
# erst ein Probelauf gegen eine Kopie der KI-Klub-Datenbank (nie gegen die laufende)
KIKLUB_DATABASE_URL=postgres://…/kiklub_kopie npm run import:kiklub-profiles -- [--schema public] [--club <Hostname oder ID>]
# dann schreiben, mit dem Code aus dem Probelauf
KIKLUB_DATABASE_URL=postgres://…/kiklub_kopie npm run import:kiklub-profiles -- --confirm <Code>
```

Die Instanz muss migriert sein, das Skript wendet keine Migrationen an. Die Adresse kommt aus der Umgebung, nicht aus der Kommandozeile (sie enthält ein Passwort).

- **Profilarten:** KI-Enthusiast und KI-Profi kommen dazu, falls es sie noch nicht gibt.
- **Freigaben:** bleiben nur, wenn das Profil im KI Klub auch öffentlich war (Modus, Freigabe und Status „aktiv“). Ruhende Mitglieder kommen ohne Freigabe.
- **Kontakt:** Vorstand bleibt Vorstand, Mitglieder bleibt Mitglieder. „öffentlich“ wird zu Mitglieder, weil der KI Klub die Adresse nie öffentlich gezeigt hat.
- **LinkedIn:** das Feld wird zum ersten Link.
- **Übersprungen** werden:
  - im KI Klub ausgetretene Mitglieder
  - Profile ohne passendes Mitglied
  - Adressen, die im Verein mehr als einer Person gehören (auch ehemaligen)
  - Mitglieder, die in OpenVerein schon ein Profil haben (nichts wird überschrieben; ein zweiter Lauf importiert nichts mehr)
  - ungültige Links und Fotos, die kein JPG, PNG oder WebP bis 2 MB sind
- **Fotos:** öffentlich erst, wenn die Person in OpenVerein in „Fotos auf Website und in sozialen Medien“ eingewilligt hat. Das Skript nennt die Zahl der Fotos ohne Einwilligung.
- **Protokoll:** jedes Profil und die Änderung der Profilarten stehen im Änderungsprotokoll.
