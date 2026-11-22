## Entscheidungen

- **Eigene Compose-Datei statt Profil im Hauptfile.** `deploy/compose.external.yml` wird nur im Modus `external` zusätzlich geladen; `caddy` bekommt dort das Profil `internal-caddy` und startet dadurch nie. Die Hauptdatei und damit der Standard bleiben unberührt.
- **Modus in `deploy/.env`.** `install` schreibt `REVERSE_PROXY`; `dc()` liest ihn bei jedem Aufruf (auch cron). Vor der Installation zählt die Umgebungsvariable.
- **Prüfung außerhalb von Befehlsersetzungen.** `check_proxy_mode` läuft direkt in `need_env` und `cmd_install`, weil `die` in `$(...)` nur die Subshell beendet.
- **`TRUST_PROXY` explizit.** Verifiziert mit Docker: Ein Zugriff über `127.0.0.1` erreicht die App mit der Bridge-Adresse (`172.30.57.1`), ein Zugriff von anderswo mit der Adresse des Absenders. Darum ist der Standard `172.30.57.0/24` nur bei Bind auf `127.0.0.1` sinnvoll; sonst verlangt `install` die Angabe.
- **Cookies und Protokoll.** Das Secure-Flag kommt aus `COOKIE_SECURE=true`, nicht aus `X-Forwarded-Proto`; das Protokoll des Proxys ist für die App unerheblich. Die CSRF-Prüfung vergleicht Origin mit dem `Host`-Header; deshalb muss der Proxy den Host samt Port durchreichen.
- **Nicht umgesetzt:** IPv6-Bind (Compose braucht eckige Klammern), Umstellen bestehender Installationen per Befehl (in der Doku als manuelle Schritte beschrieben).
