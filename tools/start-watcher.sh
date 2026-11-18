#!/usr/bin/env bash
# Start the read-only oppi balance watcher as a background daemon.
# Idempotent: refuses to start a second copy. Logs to /root/.oppi-secrets/watcher.log
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${OPPI_STATE_DIR:-/root/.oppi-secrets}"
LOG="$STATE_DIR/watcher.log"
mkdir -p "$STATE_DIR"

if pgrep -f "node .*balance-watcher\.js --loop" >/dev/null 2>&1; then
  echo "watcher already running (pid $(pgrep -f 'node .*balance-watcher\.js --loop' | tr '\n' ' '))"
  exit 0
fi

setsid nohup node "$ROOT/tools/balance-watcher.js" --loop >>"$LOG" 2>&1 < /dev/null &
echo "started watcher pid $! -> $LOG"
