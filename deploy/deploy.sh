#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_ROOT="${WEB_ROOT:-/var/www/study.leorxx.xyz}"
RELEASE_ID="$(date -u +%Y%m%d%H%M%S)"
RELEASE_DIR="$WEB_ROOT/releases/$RELEASE_ID"
CURRENT_LINK="$WEB_ROOT/current"

cd "$PROJECT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to build Study Hub." >&2
  exit 1
fi

npm ci
npm run build

if [[ ! -f "$PROJECT_DIR/dist/index.html" ]]; then
  echo "Build output is incomplete: dist/index.html was not found." >&2
  exit 1
fi

install -d -m 0755 "$WEB_ROOT/releases" "$RELEASE_DIR"
cp -a "$PROJECT_DIR/dist/." "$RELEASE_DIR/"
ln -sfn "$RELEASE_DIR" "$WEB_ROOT/current.next"
mv -Tf "$WEB_ROOT/current.next" "$CURRENT_LINK"

if [[ "${RELOAD_NGINX:-0}" == "1" ]]; then
  nginx -t
  systemctl reload nginx
fi

echo "Study Hub deployed to $RELEASE_DIR"
echo "Current release: $CURRENT_LINK"
