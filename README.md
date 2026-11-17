# Oppi Digital Products — Storefront & Agent Catalog

Ready-to-use digital products for freelancers, creators, consultants, and AI-assisted workflows. **Free samples** are public; **full packs unlock after on-chain crypto payment verification** (manual fulfillment to the oppi wallet).

**Live storefront (GitHub Pages):** https://reggiebro.github.io/oppi-digital-products/

## Products

| Product | Best for | Launch price | Free sample |
|---|---|---:|---|
| **Freelance Delivery Prompt Pack** | Freelancers/agencies, client ops | $12 | [sample prompt](previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md) |
| **Notion Freelancer CRM & Pipeline Kit** | Lead→project→invoice tracking in Notion | $12 | [CRM blueprint](previews/notion-crm-kit/sample-crm-database-blueprint.md) |
| **AI Content Repurpose Pack** | Creators/marketers repurposing content | $9 | [core extraction](previews/content-repurpose-pack/sample-core-extraction.md) |
| **Bundle (all 3)** | Full freelancer/content toolkit | $29 | — |

Full archive listings: [`PRODUCT_CATALOG.md`](PRODUCT_CATALOG.md). Per-product listing copy and PAYMENT docs in each product folder.

## Buy with Crypto (Oppi Wallet — verified registry addresses)

| Asset / Network | Address |
|---|---|
| USDC/SOL (Solana) | `2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp` |
| USDC/ETH (Ethereum, Base, BEP20, Polygon) | `0xE4BECfd60D9917946292E0d535081Dd005117069` |
| BTC | `bc1q0p56wr34yaezwq0mhfwx0amqtr2w9c4vt4gl39` |
| USDT-TRC20 / TRX | `TL5vFAKyxhNzd5Qn6fCMZodNLHaGKeebPw` |
| LTC | `ltc1q4724z73t84vgs5t6f0e4q5w8x679currfqe9yh` |
| DOGE | `DQeLinfhDcAnY53HcSvTGbYQ5ZaQqZ1Y31` |

**Purchase flow:** send agreed amount → open a [fulfillment request issue](https://github.com/Reggiebro/oppi-digital-products/issues/new?title=Purchase%2FDelivery%20request) with **tx hash, network, product(s), contact** → payment verified on-chain → full archive delivered. Paid `.tar.gz` archives are intentionally **not** in this public repo.

## For AI agents

**MCP server** (zero-dependency Node, stdio):

```bash
npx github:Reggiebro/oppi-digital-products/mcp-server
```

Tools: `list_products`, `get_free_sample`, `get_payment_instructions`, `verify_payment` (read-only public explorer/RPC check), `request_delivery`.

**Agent skill:** [`skills/oppi-digital-products/SKILL.md`](skills/oppi-digital-products/SKILL.md) — copy into your agent's skills directory.

**Machine-readable discovery:**
- `/.well-known/agent.json` → https://reggiebro.github.io/oppi-digital-products/.well-known/agent.json
- [`llms.txt`](llms.txt) → https://reggiebro.github.io/oppi-digital-products/llms.txt

## B2B / AI agents
Teams and agent builders: open an issue with your use case for bundle/team licensing quotes. Sales intake: https://github.com/Reggiebro/oppi-digital-products/issues/1

---
*All payment addresses mirror the project's oppi wallet registry (public addresses only — no keys are stored in this repo). Verify network/token before sending funds.*
