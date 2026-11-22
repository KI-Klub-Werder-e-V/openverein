## Why

Issue #139: Viele Vereine betreiben schon einen HTTPS-Reverse-Proxy (NGINX, Traefik) und wollen den mitgelieferten Caddy nicht zusätzlich laufen lassen. Bisher geht das nur mit einer dauerhaft gepflegten eigenen Compose-Datei, und `ovctl` kennt den Betrieb ohne Caddy nicht (`doctor` meldet „Dienst caddy läuft nicht“ und prüft das Zertifikat auf `localhost`).

Der Vorschlag stammt aus `external-proxy.patch` (Issue-Autor:in) und wurde geprüft und angepasst.

## What Changes

- Neue Einstellung `REVERSE_PROXY=caddy|external` (Standard `caddy`, bisheriges Verhalten unverändert). `ovctl install` schreibt sie nach `deploy/.env`; `backup`, `restore`, `update`, `doctor` und `logs` verwenden sie automatisch.
- Im Modus `external` startet Caddy nicht (`deploy/compose.external.yml`), die App ist per HTTP auf `APP_BIND_ADDRESS:APP_PORT` erreichbar (Standard `127.0.0.1:3300`).
- `TRUST_PROXY` gilt nur für die Adresse des Proxys. Bei einem Proxy auf einem anderen Rechner ist die Angabe Pflicht, sonst bricht `install` ab.
- `ovctl doctor` prüft ohne Caddy die übrigen Dienste und das Zertifikat über die Domain.
- Dokumentation mit NGINX-Beispiel und den Fallstricken (`$http_host`, Firewall, Header).

Gegenüber dem Patch geändert:
- `die` in einer Befehlsersetzung beendete nur die Subshell; ein ungültiger Modus lief still weiter. Jetzt wird vorab geprüft.
- Der Standardwert `TRUST_PROXY=172.30.57.0/24` stimmt nur für einen Proxy auf demselben Host (geprüft: über `127.0.0.1` kommt die Bridge-Adresse an, über ein anderes Netz die Adresse des Absenders). Das Beispiel mit `APP_BIND_ADDRESS=0.0.0.0` hätte alle Besucher zu einer Adresse gemacht.
- NGINX-Beispiel: `Host $http_host` statt `$host` (sonst 403 „fremde Seiten“ bei anderem Port), `X-Forwarded-For $remote_addr`, Sicherheitsheader von Caddy ergänzt.
- Validierung von Port und Adresse vor dem Schreiben von `deploy/.env`.

## Capabilities

### Modified Capabilities
- `platform`: Selbstbetrieb – Betrieb hinter einem vorhandenen Reverse Proxy.

## Impact

`ovctl`, `deploy/compose.external.yml` (neu), `docs/operations.md`, `scripts/ovctl-external-check.sh` (neu), `.github/workflows/ovctl.yml`. Keine Änderung an App-Code, API oder Datenbank. Bestehende Installationen bleiben unverändert (Standard `caddy`).
