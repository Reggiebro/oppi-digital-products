# oppi-digital-products-mcp

A zero-dependency MCP server for a sample-first digital-product store. It lets an
AI agent browse the catalog, pull a **real free sample**, get the correct payment
address for a network, verify a transfer **read-only** on-chain, and produce a
prefilled delivery-request link.

## Install

```bash
npx -y --allow-remote=all https://github.com/Reggiebro/oppi-digital-products/releases/download/v1.0.3/oppi-digital-products-mcp-1.0.3.tgz
```

The npm name `oppi-digital-products-mcp` is reserved at 1.0.0 (pre-fix build); use the pinned release tarball above or the `.mcpb` bundle until a republish lands.

## Client config

```json
{
  "mcpServers": {
    "oppi": {
      "command": "npx",
      "args": ["-y", "--allow-remote=all", "https://github.com/Reggiebro/oppi-digital-products/releases/download/v1.0.3/oppi-digital-products-mcp-1.0.3.tgz"]
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
