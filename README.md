# Oppi Digital Products — AI Prompt Packs & Notion CRM Kit

[![Reggiebro/oppi-digital-products MCP server](https://glama.ai/mcp/servers/Reggiebro/oppi-digital-products/badges/score.svg)](https://glama.ai/mcp/servers/Reggiebro/oppi-digital-products/score)
[![Oppi Digital Products MCP on mcprush](https://mcprush.com/badge/oppi-digital-products-mcp/score.svg)](https://mcprush.com/to/oppi-digital-products-mcp?ref=badge)
[![npm version](https://img.shields.io/npm/v/oppi-digital-products-mcp?logo=npm)](https://www.npmjs.com/package/oppi-digital-products-mcp) ![Glama listing](https://img.shields.io/badge/listed_on-Glama-blue) ![MCP Registry](https://img.shields.io/badge/MCP_Registry-listed-green) ![license](https://img.shields.io/badge/crypto_checkout-on--chain_verified-informational)

Practical, ready-to-use digital products for freelancers, creators, consultants — and the AI agents that assist them. **MCP server featured on [Glama](https://glama.ai/mcp/servers/Reggiebro/oppi-digital-products) and listed in the [official MCP Registry](https://github.com/modelcontextprotocol).**

**Every pack ships with free samples you can test right now — excerpts are below, no clicks needed.** You only pay when you've seen the quality — checkout is direct crypto, delivery is automated and verified on-chain. No accounts, no email required, no subscription.

## ⚡ ACTIVE FLASH SALE

**Active flash sale: 5 USDC per individual pack (Freelance Delivery Prompt Pack, Notion Freelancer CRM & Pipeline Kit, AI Content Repurpose Pack) and 12 USDC for the All-3 Bundle.** Pay exact amount in USDC/USDT/crypto to the verified oppi wallet, then open/comment on GitHub Issue #1 with tx hash + chain + pack_id for instant automated fulfillment.

**Live storefront:** https://reggiebro.github.io/oppi-digital-products/

**Announcements & questions:** https://github.com/Reggiebro/oppi-digital-products/discussions/3 — the showcase thread (pricing, samples, MCP install, payment rails).

**📄 Free-samples cheat sheet (shareable):** https://gist.github.com/Reggiebro/85122464c52cc24198ce7c1ef1828636

---

## ⚡ Quick pay (verified oppi wallet addresses)

**Send exactly 5 USDC per individual pack or 12 USDC for the All-3 Bundle to a verified oppi wallet address. Then open/comment on GitHub Issue #1 with `tx_hash + chain + pack_id`.**

**USDC on Solana** (also accepts SOL):
```
2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp
```

**USDC on Base** (same address accepts ETH on Ethereum/Base, BEP20, Polygon):
```
0xE4BECfd60D9917946292E0d535081Dd005117069
```

Other networks: see the verified address table below.

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
- **One-command install:** `npx -y oppi-digital-products-mcp` — zero dependencies, stdio, read-only on-chain payment verification included. Published on npm: [oppi-digital-products-mcp](https://www.npmjs.com/package/oppi-digital-products-mcp).
- **Offline fallback:** `npx -y --allow-remote=all https://github.com/Reggiebro/oppi-digital-products/releases/download/mcp-v1.0.0/oppi-digital-products-mcp-1.0.0.tgz` (add `--allow-remote=all` only if your npm blocks remote tarballs).
- **Wallet-bound checkout:** payment instructions and verification are tool calls (`get_payment_instructions`, `verify_payment`), not web scraping.
- **Skills-ready:** drop-in [`SKILL.md`](skills/oppi-digital-products/SKILL.md) for agents that support the skills format.

---

## The products

### 1. Freelance Delivery Prompt Pack — **5 USDC (flash sale)**
30+ tested prompts covering the full client lifecycle: lead qualification & discovery, proposals & scoping, onboarding, delivery updates, feedback & QA handling, difficult-client situations, and growth (testimonials, retainer upsells). ChatGPT/Claude-ready, one prompt per real freelance situation.

**Free preview — lead qualification scorecard (1 of 30+):**
> "Act as a freelance business consultant. Based on this inbound lead, create a qualification scorecard (Fit, Budget, Urgency, Scope clarity, Decision-maker access, Risk) from 1-5 each with brief reasons and a go/no-go recommendation.
> Lead details: [PASTE LEAD MESSAGE/NOTES]
> My services: [SERVICES]
> My minimum budget/timeline: [MIN BUDGET], [TIMELINE]"

- **Full free sample:** [Lead qualification scorecard](previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md)

### 2. Notion Freelancer CRM & Pipeline Kit — **5 USDC (flash sale)**
A complete Notion workspace blueprint: leads & clients CRM, project tracker, invoice & revenue database, dashboard views (follow-ups, active projects, outstanding invoices), with setup steps and the formulas you need.

**Free preview — Leads & Clients database blueprint (excerpt):**
> Properties: Type (Lead/Client/Past Client/Partner) · Status (New → Contacted → Discovery → Proposal Sent → Negotiation → Won/Lost/On Hold) · Source · Estimated Value (currency) · Probability · Expected Close · Next Follow-up · Last Contact · Related Projects (Relation) · Related Invoices (Relation)
>
> Views: **Pipeline Board** (by Status) · **Follow-ups Due** (Next Follow-up ≤ today+7d) · **Active Clients** · All Contacts

- **Full free sample:** [CRM database blueprint](previews/notion-crm-kit/sample-crm-database-blueprint.md)

### 3. AI Content Repurpose Pack — **5 USDC (flash sale)**
Turn one asset into many: LinkedIn/X/Instagram posts, threads, newsletters & email sequences, short-form video scripts, blog/SEO outlines, and a 7-day content calendar — all from a single source piece.

**Free preview — core extraction prompts (1 of 7 sections):**
> "Analyze this content and extract: key message, 5 main points, 10 quotable lines, target audience, pain points, and CTA ideas. Content: [PASTE CONTENT]"
>
> "Summarize this into: 1-sentence hook, 100-word summary, and 300-word summary. Content: [PASTE CONTENT]"

- **Full free sample:** [Core extraction workflow](previews/content-repurpose-pack/sample-core-extraction.md)

### Bundle — all 3 packs — **12 USDC (flash sale)**
The full freelancer + content toolkit in one delivery for 12 USDC.

Full archive listings: [`PRODUCT_CATALOG.md`](PRODUCT_CATALOG.md)

---

## How to buy (5-step autonomous purchase & fulfillment)

1. **Inspect catalog and choose pack/bundle.** Individual packs are 5 USDC; All-3 Bundle is 12 USDC.
2. **Send exact USDC/USDT/crypto payment** to the verified oppi wallet address for your chosen network/asset.
3. **Open/comment on GitHub Issue #1** with `tx_hash + chain + pack_id`: https://github.com/Reggiebro/oppi-digital-products/issues/1
4. **Receive instant automated fulfillment link** after on-chain verification.
5. **Keep proof.** Issue #1 is the public fulfillment record.

| Pay with | Network | Address |
|---|---|---|
| SOL / USDC-SPL / USDT-SPL | Solana | `2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp` |
| ETH / USDC / USDT | Ethereum · Base · BNB Smart Chain (BEP20) · Polygon | `0xE4BECfd60D9917946292E0d535081Dd005117069` |
| BTC | Bitcoin (Native) | `bc1q0p56wr34yaezwq0mhfwx0amqtr2w9c4vt4gl39` |
| TRX / USDT-TRC20 / USDC-TRC20 | TRON | `TL5vFAKyxhNzd5Qn6fCMZodNLHaGKeebPw` |
| LTC | Litecoin (Native) | `ltc1q4724z73t84vgs5t6f0e4q5w8x679currfqe9yh` |
| DOGE | Dogecoin (Native) | `DQeLinfhDcAnY53HcSvTGbYQ5ZaQqZ1Y31` |

> Prices are in USD equivalents; send the current value of the listed price in the asset you choose.

---

## FAQ

**Why crypto-only, no card checkout?**
Direct crypto means no platform fees, no accounts, and instant on-chain proof of purchase. The trade-off is manual fulfillment — see below.

**How fast is delivery?**
Fulfillment is automated. After on-chain verification, the download link is delivered instantly.

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
npx -y oppi-digital-products-mcp
```

Tools: `list_products`, `get_free_sample`, `get_payment_instructions`, `verify_payment` (read-only public explorer/RPC check), `request_delivery`.

**Minimum purchase steps (agent, 5 steps):**
1. **Inspect catalog:** `list_products` → `get_free_sample` (`{"product":"<id>"}`) to confirm fit.
2. **Choose pack/bundle:** select an individual pack (5 USDC) or the All-3 Bundle (12 USDC).
3. **Send exact USDC/USDT/crypto payment** to the verified oppi wallet address for the chosen network/asset. No seed phrases/private keys; no signing/broadcast by the agent.
4. **Open/comment on GitHub Issue #1** with `tx_hash + chain + pack_id`: https://github.com/Reggiebro/oppi-digital-products/issues/1
5. **Receive instant automated fulfillment link** after on-chain verification.

**Verified oppi wallet addresses (exact):**
- Solana (SOL, USDC-SPL, USDT-SPL): 2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp
- EVM Multi-Chain (ETH, Base, BNB Smart Chain BEP20, Polygon, USDC/USDT): 0xE4BECfd60D9917946292E0d535081Dd005117069
- Bitcoin (BTC Native): bc1q0p56wr34yaezwq0mhfwx0amqtr2w9c4vt4gl39
- TRON (TRX, USDT-TRC20, USDC-TRC20): TL5vFAKyxhNzd5Qn6fCMZodNLHaGKeebPw
- Litecoin (LTC Native): ltc1q4724z73t84vgs5t6f0e4q5w8x679currfqe9yh
- Dogecoin (DOGE Native): DQeLinfhDcAnY53HcSvTGbYQ5ZaQqZ1Y31

**Agent skill:** [`skills/oppi-digital-products/SKILL.md`](skills/oppi-digital-products/SKILL.md) (canonical; root [`SKILL.md`](SKILL.md) pointer) — copy into your agent's skills directory.

**Machine-readable discovery:**
- `/.well-known/agent.json` → https://reggiebro.github.io/oppi-digital-products/.well-known/agent.json
- [`llms.txt`](llms.txt) → https://reggiebro.github.io/oppi-digital-products/llms.txt
- [`sitemap.xml`](sitemap.xml) → https://reggiebro.github.io/oppi-digital-products/sitemap.xml
- [`robots.txt`](robots.txt) → https://reggiebro.github.io/oppi-digital-products/robots.txt

---

## Free tools

- **[Freelance lead scorecard](https://reggiebro.github.io/oppi-digital-products/scorecard.html)** — score a lead across six criteria in the browser, copy the generated prompt. No signup, nothing sent anywhere.
- **[How to qualify a freelance lead](https://reggiebro.github.io/oppi-digital-products/guides/qualify-freelance-leads.html)** — the method behind it, with composite examples and red flags.

## B2B / team licensing

Fixed prices, no quote loop. Full offer and terms: [`B2B.md`](B2B.md).

| License | Price | Seats | Client deliverables |
|---|---|---|---|
| **Team** | $79 | up to 10 | no |
| **Agency** | $149 | up to 25 | yes |
| **Custom workflow** | $150 | — | built for you |

Every B2B order gets a receipt with company name, license ID, and transaction hash. Seats are contractual, not DRM — there is no account system and no telemetry.

Request a license: [B2B intake form](https://github.com/Reggiebro/oppi-digital-products/issues/new?template=b2b-license.yml) · Consumer purchases: email `workflowalpha.ai@gmail.com` with tx hash (no account) or [purchase request](https://github.com/Reggiebro/oppi-digital-products/issues/new?template=purchase-request.yml)

---

*All payment addresses mirror the project's oppi wallet registry — public addresses only, no keys are stored in this repo (see [`LICENSE-CATALOG.md`](LICENSE-CATALOG.md) for software/product licensing). Verify network/token before sending funds.*
