# OpenVerein für Claude Code

Dieses Plugin verbindet Claude Code über MCP mit Deinem Verein in OpenVerein. Du meldest Dich einmal im Browser an (OAuth). Danach sieht und tut der Agent genau das, was Du in der Vereinsverwaltung oder im Mitgliederportal sehen und tun darfst, nie mehr.

- Installieren: `/plugin install openverein --marketplace KI-Klub-Werder-e-V/openverein` (Claude Code 2.1.275 oder neuer). Gib dann die Adresse Deines Vereins ein, wenn Claude Code danach fragt, und melde Dich unter `/mcp` → openverein an. Mehr dazu: [Mit Claude Code verbinden](../../README.md#mit-claude-code-verbinden).
- Die Adresse des Vereins ist eine Pflichtangabe des Plugins (`club_url`) ohne Voreinstellung. So verbindet sich das Plugin nie mit einem Verein, den Du nicht selbst gewählt hast. Ändern kannst Du sie mit `/plugin configure openverein@openverein`.

<a id="privacy"></a>

## Datenschutz

Das Plugin enthält keinen Code, der auf Deinem Rechner läuft, und speichert weder Daten noch Token in einer Datei. Es nennt Claude Code genau eine Adresse, nämlich die, die Du eingegeben hast: `<club_url>/mcp`. Die OAuth-Anmeldung bewahrt Claude Code in seinem eigenen Speicher für Zugangsdaten auf. Alles, was der Agent liest oder ändert, geht nur an diese Instanz Deines Vereins. Der Verein betreibt sie und ist für die Daten verantwortlich (es gilt seine Datenschutzerklärung). Auf der Instanz wird jeder Lese- und Schreibzugriff des Agenten für die Person protokolliert, der der Zugang gehört. Sie kann den Zugriff jederzeit unter Einstellungen → Agenten widerrufen.

<a id="terms"></a>

## Nutzungsbedingungen

Das Plugin ist freie Software unter der [AGPL-3.0](../../LICENSE) und kostenlos. Es wird ohne Gewährleistung bereitgestellt, soweit das Gesetz das zulässt (siehe Lizenz). Das Plugin selbst betreibt keinen Dienst: Es verbindet Claude Code nur mit der Instanz, deren Adresse Du eingibst. Für die Nutzung dieser Instanz gelten die Regeln des Vereins, der sie betreibt. Die öffentliche Demo unter https://openverein.ki-klub-werder.de ist zum Ausprobieren gedacht; trag dort keine echten personenbezogenen Daten ein.

<a id="support"></a>

## Hilfe

Fehler meldest Du und Funktionen schlägst Du vor in den [Issues auf GitHub](https://github.com/KI-Klub-Werder-e-V/openverein/issues). Sicherheitslücken meldest Du bitte vertraulich über die [Sicherheitsrichtlinie](https://github.com/KI-Klub-Werder-e-V/openverein/security/policy). Fragen zu den Daten Deines Vereins beantwortet der Verein, der die Instanz betreibt.
