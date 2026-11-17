# Oppi Digital Products — AI Prompt Packs & Notion CRM Kit

Practical, ready-to-use digital products for freelancers, creators, consultants — and the AI agents that assist them.

**Every pack ships with free samples you can test right now.** You only pay when you've seen the quality — checkout is direct crypto, delivery is manual and verified on-chain. No accounts, no email required, no subscription.

**Live storefront:** https://reggiebro.github.io/oppi-digital-products/

---

## The products

### 1. Freelance Delivery Prompt Pack — $12
30+ tested prompts covering the full client lifecycle: lead qualification & discovery, proposals & scoping, onboarding, delivery updates, feedback & QA handling, difficult-client situations, and growth (testimonials, retainer upsells). ChatGPT/Claude-ready, one prompt per real freelance situation.
- **Free sample:** [Lead qualification scorecard](previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md)

### 2. Notion Freelancer CRM & Pipeline Kit — $12
A complete Notion workspace blueprint: leads & clients CRM, project tracker, invoice & revenue database, dashboard views (follow-ups, active projects, outstanding invoices), with setup steps and the formulas you need.
- **Free sample:** [CRM database blueprint](previews/notion-crm-kit/sample-crm-database-blueprint.md)

### 3. AI Content Repurpose Pack — $9
Turn one asset into many: LinkedIn/X/Instagram posts, threads, newsletters & email sequences, short-form video scripts, blog/SEO outlines, and a 7-day content calendar — all from a single source piece.
- **Free sample:** [Core extraction workflow](previews/content-repurpose-pack/sample-core-extraction.md)

### Bundle — all 3 packs — $29
The full freelancer + content toolkit in one delivery (save ~$4 vs buying separately).

Full archive listings: [`PRODUCT_CATALOG.md`](PRODUCT_CATALOG.md)

---

## How to buy (3 steps, crypto only)

1. **Send the payment** for your product to the matching address below — *the right asset on the right network* (sending USDC on the wrong chain is the #1 mistake; if unsure, use **USDC on Solana** or **USDC on Base**, both are cheap and reliable).
2. **Open a fulfillment request** — [create an issue](https://github.com/Reggiebro/oppi-digital-products/issues/new?title=Purchase%2FDelivery%20request) with your **tx hash, network/asset, product(s), and a contact** (email or Telegram). No account or email verification needed beyond that.
3. **Get your delivery.** We verify your transaction on-chain against the registry addresses, then deliver the full archive. Paid archives are intentionally **not** publicly downloadable — only the free samples are.

| Pay with | Network | Address |
|---|---|---|
| **USDC / SOL** (recommended) | Solana | `2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp` |
| **USDC / ETH** (recommended) | Ethereum · Base · BEP20 · Polygon | `0xE4BECfd60D9917946292E0d535081Dd005117069` |
| USDT / TRX | Tron (TRC20) | `TL5vFAKyxhNzd5Qn6fCMZodNLHaGKeebPw` |
| BTC | Bitcoin | `bc1q0p56wr34yaezwq0mhfwx0amqtr2w9c4vt4gl39` |
| LTC | Litecoin | `ltc1q4724z73t84vgs5t6f0e4q5w8x679currfqe9yh` |
| DOGE | Dogecoin | `DQeLinfhDcAnY53HcSvTGbYQ5ZaQqZ1Y31` |

> Prices are in USD equivalents; send the current value of the listed price in the asset you choose.

---

## FAQ

**Why crypto-only, no card checkout?**
Direct crypto means no platform fees, no accounts, and instant on-chain proof of purchase. The trade-off is manual fulfillment — see below.

**How fast is delivery?**
Fulfillment is manual. Most requests are processed within 24–48 hours of a valid tx hash — usually much faster.

**How do I know I'll actually get the product?**
The repo, previews, and all sales flow are public and auditable. Your payment is verified on-chain before delivery, and every fulfillment request is tracked in a public GitHub issue. Free samples demonstrate exactly what the full packs look like.

**What if my transaction doesn't arrive or I sent the wrong network?**
Open the fulfillment issue anyway with your tx hash — we'll trace it and sort it out. Never send an asset to an address of a different network.

**Can I get a refund?**
If we cannot verify your payment or cannot deliver what was described, your funds are returned to the sending address. After successful delivery of the full archive, sales are final.

---

## For AI agents

**MCP server** (zero-dependency Node, stdio) — let your agent browse the catalog, pull free samples, and handle checkout end-to-end:

```bash
npx github:Reggiebro/oppi-digital-products/mcp-server
```

Tools: `list_products`, `get_free_sample`, `get_payment_instructions`, `verify_payment` (read-only public explorer/RPC check), `request_delivery`.

**Agent skill:** [`skills/oppi-digital-products/SKILL.md`](skills/oppi-digital-products/SKILL.md) — copy into your agent's skills directory.

**Machine-readable discovery:**
- `/.well-known/agent.json` → https://reggiebro.github.io/oppi-digital-products/.well-known/agent.json
- [`llms.txt`](llms.txt) → https://reggiebro.github.io/oppi-digital-products/llms.txt

---

## B2B / team licensing

Agencies, freelancer communities, and agent builders: open an issue with your use case for bundle/team licensing quotes. Sales intake: https://github.com/Reggiebro/oppi-digital-products/issues/1

---

*All payment addresses mirror the project's oppi wallet registry — public addresses only, no keys are stored in this repo (see [`LICENSE-CATALOG.md`](LICENSE-CATALOG.md) for software/product licensing). Verify network/token before sending funds.*
