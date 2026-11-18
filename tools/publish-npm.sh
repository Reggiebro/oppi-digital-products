#!/usr/bin/env bash
# Publish the MCP server to npm. Requires an authenticated npm account that owns
# the `oppi-digital-products-mcp` name (currently unclaimed as of 2026-11-18).
#
#   npm login          # once, on this machine
#   ./tools/publish-npm.sh
#
# The guardrails in wallet_registry.json say never pay to register or list.
# npm publishing is free; if npm ever asks for payment, stop.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG="$ROOT/mcp-server"

cd "$PKG"

echo "== 1. auth =="
if ! npm whoami >/dev/null 2>&1; then
  cat <<'EOF'
Not logged in to npm.

Run:  npm login
Then: ./tools/publish-npm.sh

Do not paste a token into chat or commit it. `npm login` stores it in ~/.npmrc.
EOF
  exit 1
fi
echo "publishing as: $(npm whoami)"

echo "== 2. syntax =="
node --check index.js

echo "== 3. MCP handshake =="
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"publish-check","version":"1"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | timeout 20 node index.js | grep -q '"name":"list_products"'
echo "tools/list ok"

echo "== 4. pack =="
npm pack --dry-run >/dev/null
echo "tarball contents ok"

echo "== 5. publish =="
if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY_RUN=1 — stopping before publish"
  npm publish --dry-run --access public
  exit 0
fi

npm publish --access public
echo
echo "published. Verify with:"
echo "  npx -y oppi-digital-products-mcp"
