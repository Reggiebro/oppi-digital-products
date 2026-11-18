# Oppi Digital Products MCP server — stdio, zero runtime dependencies.
#
# Build:  docker build -t oppi-digital-products-mcp .
# Run:    docker run -i --rm oppi-digital-products-mcp
#
# The server speaks MCP JSON-RPC 2.0 over stdio. It only reads static JSON
# (catalog.json, wallets.json — public wallet addresses, no keys) and makes
# read-only HTTPS calls for on-chain payment verification. No secrets, no
# volume mounts, no network writes.
FROM node:22-alpine

# Run as the unprivileged user provided by the base image (safety check).
USER node
WORKDIR /app

# Copy only the files the server needs; nothing else is required at runtime.
COPY --chown=node:node mcp-server/index.js mcp-server/index.js
COPY --chown=node:node mcp-server/catalog.json mcp-server/catalog.json
COPY --chown=node:node mcp-server/wallets.json mcp-server/wallets.json
COPY --chown=node:node mcp-server/package.json mcp-server/package.json

ENV NODE_ENV=production

# No `npm install` needed: the server uses only the Node standard library.
ENTRYPOINT ["node", "mcp-server/index.js"]
