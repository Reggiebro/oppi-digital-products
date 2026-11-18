# oppi-digital-products-mcp

A zero-dependency MCP server for a sample-first digital-product store. It lets an
AI agent browse the catalog, pull a **real free sample**, get the correct payment
address for a network, verify a transfer **read-only** on-chain, and produce a
prefilled delivery-request link.

## Install

```bash
npx oppi-digital-products-mcp
```

Or straight from the repo (no npm publish needed):

```bash
npx github:Reggiebro/oppi-digital-products/mcp-server
```

## Client config

```json
{
  "mcpServers": {
    "oppi": {
      "command": "npx",
      "args": ["oppi-digital-products-mcp"]
    }
  }
}
```

## Tools

| Tool | What it does |
|---|---|
| `list_products` | Catalog with prices, bundle, free-sample ids |
| `get_free_sample` | Returns an actual sample prompt/template |
| `get_payment_instructions` | Verified wallet addresses + purchase flow |
| `verify_payment` | Read-only on-chain check against the published address |
| `request_delivery` | Prefilled GitHub issue URL with tx details |

## Guarantees

- No keys, no signing, no transaction broadcasting. Reads public RPCs and explorers only.
- No accounts and no email required.
- Payment verification is best-effort; a human confirms before delivery.

## Store

<https://reggiebro.github.io/oppi-digital-products/>

## License

MIT for the server code. Product catalog content is licensed separately; see
`LICENSE-CATALOG.md` in the repository.
