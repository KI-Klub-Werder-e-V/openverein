#!/usr/bin/env bash
# Schnelltest für REVERSE_PROXY=external (ohne Image-Build): Compose startet kein Caddy, veröffentlicht den App-Port,
# und ovctl install lehnt ungültige Werte ab, bevor es deploy/.env schreibt. Braucht Docker Compose v2.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
cp -r "$REPO/ovctl" "$REPO/deploy" "$WORK/"
cd "$WORK"
fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }
env_file() { printf 'DOMAIN=v.example.org\nSMTP_URL=smtp://x\nMAIL_FROM=a@b.c\nPOSTGRES_PASSWORD=p\nDATA_KEY=k\n%s' "$1" > deploy/.env; }
services() { docker compose --project-directory deploy "$@" --env-file deploy/.env config --services | sort | tr '\n' ' '; }

env_file ''
[ "$(services -f deploy/compose.yml)" = "app caddy db " ] || fail "Standard muss Caddy enthalten"
env_file $'APP_PORT=13300\nAPP_BIND_ADDRESS=127.0.0.1\n'
[ "$(services -f deploy/compose.yml -f deploy/compose.external.yml)" = "app db " ] || fail "external darf Caddy nicht starten"
docker compose --project-directory deploy -f deploy/compose.yml -f deploy/compose.external.yml --env-file deploy/.env config | grep -q 'published: "13300"' || fail "App-Port nicht veröffentlicht"

rm -f deploy/.env
install_fails() { # install_fails <Meldung> VAR=Wert ...
  local msg="$1"; shift
  local out
  out="$(env "$@" DOMAIN=v.example.org SMTP_URL=smtp://x MAIL_FROM=a@b.c ./ovctl install 2>&1 || true)"
  grep -q "$msg" <<<"$out" || fail "install ohne Fehler '$msg' bei $*: $out"
  [ ! -f deploy/.env ] || fail "deploy/.env darf bei ungültigen Werten nicht entstehen ($*)"
}
install_fails 'REVERSE_PROXY muss' REVERSE_PROXY=nginx
install_fails 'APP_PORT' REVERSE_PROXY=external APP_PORT=abc
install_fails 'APP_BIND_ADDRESS' REVERSE_PROXY=external APP_BIND_ADDRESS=nope
install_fails 'TRUST_PROXY fehlt' REVERSE_PROXY=external APP_BIND_ADDRESS=0.0.0.0
echo "ok: ovctl external"
