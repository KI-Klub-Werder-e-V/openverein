## ADDED Requirements

### Requirement: Betrieb hinter einem vorhandenen Reverse Proxy
Das System MUSS (SHALL) mit `REVERSE_PROXY=external` den mitgelieferten Caddy nicht starten und die App stattdessen per HTTP auf `APP_BIND_ADDRESS:APP_PORT` (Standard `127.0.0.1:3300`) bereitstellen, während `ovctl` (`install`, `backup`, `restore`, `update`, `doctor`) unverändert funktioniert. Ohne die Einstellung MUSS es sich wie bisher mit Caddy verhalten. `X-Forwarded-For` MUSS nur von der in `TRUST_PROXY` genannten Adresse akzeptiert werden.

#### Scenario: Installation ohne Caddy
- **WHEN** eine Betreiber:in `REVERSE_PROXY=external ./ovctl install` ausführt
- **THEN** startet der Stack nur App und Datenbank, die App ist auf `127.0.0.1:3300` erreichbar, und die Einstellung steht in `deploy/.env`

#### Scenario: Spätere Befehle erkennen den Modus
- **WHEN** die Betreiber:in danach `ovctl doctor` oder `ovctl backup` ausführt
- **THEN** verwenden sie den Modus aus `deploy/.env`, `doctor` meldet keinen fehlenden Caddy und prüft das Zertifikat über die Domain

#### Scenario: Proxy auf anderem Rechner ohne vertrauenswürdige Adresse
- **WHEN** `ovctl install` mit `REVERSE_PROXY=external` und einer `APP_BIND_ADDRESS` außer `127.0.0.1` läuft, aber ohne `TRUST_PROXY`
- **THEN** bricht es mit einer Fehlermeldung ab, bevor `deploy/.env` entsteht

#### Scenario: Ungültiger Modus
- **WHEN** `REVERSE_PROXY` weder `caddy` noch `external` ist
- **THEN** bricht `ovctl` mit einer Fehlermeldung ab und startet nichts
