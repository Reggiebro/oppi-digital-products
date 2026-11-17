# oppi-digital-products-mcp

Lightweight **MCP server** (zero dependencies, stdio) exposing the Oppi digital
product catalog to AI agents. Agents can discover products, test a **free sample
prompt**, fetch **crypto payment instructions** (verified oppi wallet addresses),
run a **read-only on-chain payment check**, and start a **delivery request**.

## Install

```bash
# Run directly from GitHub with npx (no clone needed):
npx github:Reggiebro/oppi-digital-products/mcp-server

# Or clone:
git clone https://github.com/Reggiebro/oppi-digital-products
node oppi-digital-products/mcp-server/index.js
```

## Client config (manual MCP entry)

```json
{
  "mcpServers": {
    "oppi-digital-products": {
      "command": "npx",
      "args": ["github:Reggiebro/oppi-digital-products/mcp-server"]
    }
  }
}
```

## Tools

| Tool | What it does |
|---|---|
| `list_products` | Full catalog with prices + bundle |
| `get_free_sample` | Real free sample prompt/template per product (test before buying) |
| `get_payment_instructions` | Verified oppi wallet addresses (SOL/EVM/BTC/TRON/LTC/DOGE) + purchase flow |
| `verify_payment` | Best-effort read-only on-chain check of a buyer tx (blockstream/blockscout/Solana RPC/tronscan) |
| `request_delivery` | Returns a prefilled GitHub fulfillment request URL after payment |

Full packs unlock **after on-chain payment verification** (manual fulfillment).
Addresses in `wallets.json` are public-only and mirror the project's wallet
registry (oppi wallet).
