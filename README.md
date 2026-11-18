# Oppi Digital Products — AI Prompt Packs & Notion CRM Kit

[![Reggiebro/oppi-digital-products MCP server](https://glama.ai/mcp/servers/Reggiebro/oppi-digital-products/badges/score.svg)](https://glama.ai/mcp/servers/Reggiebro/oppi-digital-products/score)
![Glama listing](https://img.shields.io/badge/listed_on-Glama-blue) ![MCP Registry](https://img.shields.io/badge/MCP_Registry-listed-green) ![license](https://img.shields.io/badge/crypto_checkout-on--chain_verified-informational)

Practical, ready-to-use digital products for freelancers, creators, consultants — and the AI agents that assist them. **MCP server featured on [Glama](https://glama.ai/mcp/servers/Reggiebro/oppi-digital-products) and listed in the [official MCP Registry](https://github.com/modelcontextprotocol).**

**Every pack ships with free samples you can test right now — excerpts are below, no clicks needed.** You only pay when you've seen the quality — checkout is direct crypto, delivery is manual and verified on-chain. No accounts, no email required, no subscription.

## ⚡ FLASH DEAL — first 5 buyers only

**Every single pack: $5 USDC (was $12/$12/$9). All-3 bundle: $12 USDC (was $29).** First **5 paid buyers** only — verified on-chain, auditable in this repo's public fulfillment issues. Pay exactly **5 USDC** per pack (or **12 USDC** for the bundle) — **USDC on Solana or Base** recommended. When 5 verified orders land, launch pricing ($12/$12/$9, bundle $29) resumes.

**Live storefront:** https://reggiebro.github.io/oppi-digital-products/

---

## ⚡ Quick pay (recommended rails — one-click copy)

**During the flash deal, send exactly 5 USDC per pack or 12 USDC for the bundle. USDC on Solana or USDC on Base is cheapest (~$0.01 fee) and settles fast. Then open your [fulfillment request](https://github.com/Reggiebro/oppi-digital-products/issues/new?title=Purchase%2FDelivery%20request) with the tx hash.**

**USDC on Solana** (also accepts SOL):
```
2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp
```

**USDC on Base** (same address accepts ETH on Ethereum/Base, BEP20, Polygon):
```
0xE4BECfd60D9917946292E0d535081Dd005117069
```

Other networks: see the [full address table](#how-to-buy-3-steps-crypto-only) below.

---

## 👁 Try before you pay — free previews below, no clicks needed

Every pack ships real, working excerpts so you can judge quality before sending anything:

| Pack | What you can test free right now | Full free sample |
|---|---|---|
| **Freelance Delivery Prompt Pack** (flash $5) | The **lead qualification scorecard** prompt — raw inquiry → 1–5 scoring across Fit/Budget/Urgency/Scope/Decision-maker/Risk with a go/no-go call. 1 of **30+ prompts**. | [Read it](previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md) |
| **Notion Freelancer CRM Kit** (flash $5) | The **Leads & Clients database blueprint** — every property (Status, Estimated Value, Next Follow-up…) and the Pipeline / Follow-ups-Due views. | [Read it](previews/notion-crm-kit/sample-crm-database-blueprint.md) |
| **AI Content Repurpose Pack** (flash $5) | The **core extraction prompts** — one asset → hook, summaries, 5 points, 10 quotable lines. 1 of 7 sections. | [Read it](previews/content-repurpose-pack/sample-core-extraction.md) |

Full excerpts are inline in each product section below 👇

---

## Why freelancers buy

- **Stop rewriting the same messages.** A tested prompt for every client moment — discovery call to final invoice to late-payer email.
- **See your pipeline in one screen.** The CRM kit's dashboards put follow-ups due, active projects, and outstanding invoices side by side.
- **Ship content without a content team.** Turn one delivery into a week of posts, a newsletter, and a video script.
- **Try before you pay.** Real working samples below — not screenshots, not "what's inside" lists.

## Why AI agents work here

- **Machine-readable catalog:** `/.well-known/agent.json`, `llms.txt`, and an MCP server — an agent can browse, sample, and check out without a human.
- **One-command install:** `npx github:Reggiebro/oppi-digital-products/mcp-server` — zero dependencies, stdio, read-only on-chain payment verification included.
- **Wallet-bound checkout:** payment instructions and verification are tool calls (`get_payment_instructions`, `verify_payment`), not web scraping.
- **Skills-ready:** drop-in [`SKILL.md`](skills/oppi-digital-products/SKILL.md) for agents that support the skills format.

---

## The products

### 1. Freelance Delivery Prompt Pack — ~~$12~~ **$5 flash deal**
30+ tested prompts covering the full client lifecycle: lead qualification & discovery, proposals & scoping, onboarding, delivery updates, feedback & QA handling, difficult-client situations, and growth (testimonials, retainer upsells). ChatGPT/Claude-ready, one prompt per real freelance situation.

**Free preview — lead qualification scorecard (1 of 30+):**
> "Act as a freelance business consultant. Based on this inbound lead, create a qualification scorecard (Fit, Budget, Urgency, Scope clarity, Decision-maker access, Risk) from 1-5 each with brief reasons and a go/no-go recommendation.
> Lead details: [PASTE LEAD MESSAGE/NOTES]
> My services: [SERVICES]
> My minimum budget/timeline: [MIN BUDGET], [TIMELINE]"

- **Full free sample:** [Lead qualification scorecard](previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md)

### 2. Notion Freelancer CRM & Pipeline Kit — ~~$12~~ **$5 flash deal**
A complete Notion workspace blueprint: leads & clients CRM, project tracker, invoice & revenue database, dashboard views (follow-ups, active projects, outstanding invoices), with setup steps and the formulas you need.

**Free preview — Leads & Clients database blueprint (excerpt):**
> Properties: Type (Lead/Client/Past Client/Partner) · Status (New → Contacted → Discovery → Proposal Sent → Negotiation → Won/Lost/On Hold) · Source · Estimated Value (currency) · Probability · Expected Close · Next Follow-up · Last Contact · Related Projects (Relation) · Related Invoices (Relation)
>
> Views: **Pipeline Board** (by Status) · **Follow-ups Due** (Next Follow-up ≤ today+7d) · **Active Clients** · All Contacts

- **Full free sample:** [CRM database blueprint](previews/notion-crm-kit/sample-crm-database-blueprint.md)

### 3. AI Content Repurpose Pack — ~~$9~~ **$5 flash deal**
Turn one asset into many: LinkedIn/X/Instagram posts, threads, newsletters & email sequences, short-form video scripts, blog/SEO outlines, and a 7-day content calendar — all from a single source piece.

**Free preview — core extraction prompts (1 of 7 sections):**
> "Analyze this content and extract: key message, 5 main points, 10 quotable lines, target audience, pain points, and CTA ideas. Content: [PASTE CONTENT]"
>
> "Summarize this into: 1-sentence hook, 100-word summary, and 300-word summary. Content: [PASTE CONTENT]"

- **Full free sample:** [Core extraction workflow](previews/content-repurpose-pack/sample-core-extraction.md)

### Bundle — all 3 packs — ~~$29~~ **$12 flash deal**
The full freelancer + content toolkit in one delivery (first 5 buyers; then $29).

Full archive listings: [`PRODUCT_CATALOG.md`](PRODUCT_CATALOG.md)

---

## How to buy (3 steps, crypto only)

1. **Copy the address** for your asset from the [Quick pay](#-quick-pay-recommended-rails--one-click-copy) box above (or the table below) — *the right asset on the right network* (sending USDC on the wrong chain is the #1 mistake; if unsure, use **USDC on Solana** or **USDC on Base**, both are cheap and reliable).
2. **Open a fulfillment request** — [create an issue](https://github.com/Reggiebro/oppi-digital-products/issues/new?title=Purchase%2FDelivery%20request) with your **tx hash, network/asset, product(s), and a contact** (email or Telegram). No account or email verification needed beyond that.
3. **Get your delivery.** We verify your transaction on-chain against the registry addresses, then deliver the full archive. Paid archives are intentionally **not** publicly downloadable — only the free samples are.

| Pay with | Network | Address |
|---|---|---|
| **USDC / SOL** ⭐ recommended | Solana | `2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp` |
| **USDC / ETH** ⭐ recommended | Ethereum · **Base** · BEP20 · Polygon | `0xE4BECfd60D9917946292E0d535081Dd005117069` |
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

**Listed on [Glama](https://glama.ai/mcp/servers/Reggiebro/oppi-digital-products)** — full tool schema, integration support matrix (Solana/Ethereum/Base/Polygon/BTC/TRON/LTC/DOGE checkout), and deploy info live there.

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
