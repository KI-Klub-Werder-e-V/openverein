## 1. ovctl und Compose

- [x] 1.1 `proxy_mode`, `check_proxy_mode`, `dc()` mit zusätzlicher Compose-Datei
- [x] 1.2 `install`: Validierung, `TRUST_PROXY`-Regel, Werte nach `deploy/.env`
- [x] 1.3 `doctor`: Dienste ohne Caddy, Zertifikat über die Domain
- [x] 1.4 `deploy/compose.external.yml`

## 2. Tests und Doku

- [x] 2.1 `scripts/ovctl-external-check.sh` (Compose ohne Caddy, Fehlerfälle) im Workflow `ovctl.yml`
- [x] 2.2 Echter Durchlauf: install, doctor, backup, Anfrage über den veröffentlichten Port
- [x] 2.3 `docs/operations.md`: Abschnitt „Vorhandenen Reverse Proxy verwenden“
