# Finished Digital Products Catalog (Workspace)

> **Legacy reference.** Pricing here is the post-flash standard. Canonical, current prices live in [`README.md`](README.md) and on the [storefront](https://reggiebro.github.io/oppi-digital-products/).

**Workspace:** `/root/kripto_agent/deliverables/digital_product/`  
**Isolation:** Only products in this workspace. No bounty-hunting or previous earning projects referenced.  
**Payout verification:** All payment endpoints in product materials point strictly to addresses present in `/root/kripto_agent/wallet_registry.json` (oppi wallet). No foreign addresses found.

## Oppi Wallet Payout Addresses (from wallet_registry.json)
- **BTC (bitcoin):** `bc1q0p56wr34yaezwq0mhfwx0amqtr2w9c4vt4gl39`
- **EVM (ethereum/base/bep20/polygon) — ETH, BNB, USDC, USDT, DOGE-BEP20, POL:** `0xE4BECfd60D9917946292E0d535081Dd005117069`
- **Solana (SOL/USDC-SPL/USDT-SPL):** `2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp`
- **TRON (TRX/USDT-TRC20/USDC-TRC20):** `TL5vFAKyxhNzd5Qn6fCMZodNLHaGKeebPw`
- **LTC (litecoin):** `ltc1q4724z73t84vgs5t6f0e4q5w8x679currfqe9yh`
- **DOGE (dogecoin):** `DQeLinfhDcAnY53HcSvTGbYQ5ZaQqZ1Y31`

> Product-facing payment docs currently highlight SOL and EVM addresses (primary recommended: USDC/USDT/SOL/ETH on those networks). All are valid oppi wallet addresses from the registry.

## Products

### 1) Freelance Delivery Prompt Pack
- **Type:** Prompt pack (digital download)
- **Location:** `ai-freelancer-prompt-pack/` (source) + `ai-freelancer-prompt-pack.tar.gz`
- **Contents:** README, quickstart, prompts, launch checklist, listing copy, PAYMENT
- **Value prop:** 30+ AI prompts for leads/discovery, proposals/scope, onboarding, delivery/updates, feedback/QA, difficult situations, growth (ChatGPT/Claude-ready, bracketed customization).
- **Target buyers:** Freelancers, consultants, solopreneurs, small agencies, AI agents assisting client ops.
- **Pricing (suggested):** Flash $5 (first 5 buyers), Launch $9–$15, Standard $19–$29
- **Fulfillment:** Direct crypto (manual) — buyer sends agreed amount, shares tx hash + contact + product; seller verifies on-chain and delivers archive.

### 2) Notion Freelancer CRM & Pipeline Kit
- **Type:** Notion template/blueprint (digital download)
- **Location:** `notion-freelancer-crm-kit/` (source) + `notion-freelancer-crm-kit.tar.gz`
- **Contents:** README, template spec, listing copy, PAYMENT
- **Value prop:** Complete workspace blueprint for lead→proposal→project→payment: CRM, projects, invoices/revenue, dashboard, setup/rollups.
- **Target buyers:** Freelancers/consultants/agencies, ops-focused AI agents.
- **Pricing (suggested):** Flash $5 (first 5 buyers), Launch $12, Standard $19–$29
- **Fulfillment:** Direct crypto (manual) as above.

### 3) AI Content Repurpose Pack
- **Type:** Prompt pack (digital download)
- **Location:** `ai-content-repurpose-pack/` (source) + `ai-content-repurpose-pack.tar.gz`
- **Contents:** README, prompts, listing copy, PAYMENT
- **Value prop:** Repurpose one content asset into social posts, threads, newsletters/sequences, short-form scripts/hooks, blog/SEO assets, adapted calendars.
- **Target buyers:** Creators, coaches, founders, marketers, content AI agents.
- **Pricing (suggested):** Flash $5 (first 5 buyers), Launch $9, Standard $15–$19
- **Fulfillment:** Direct crypto (manual) as above.

### 4) Digital Product Landing/Catalog Page
- **Type:** Static HTML catalog/offer page
- **Location:** `landing-page/index.html`
- **Purpose:** Single-page catalog with pricing, file references, crypto payment instructions (oppi wallet addresses).

## Bundles (suggested)
- 3-pack bundle: $12 flash (first 5 buyers), then $29

## Payout Endpoint Verification (products)
- Scanned all files under `deliverables/` for wallet-like addresses.
- **Result:** Only oppi wallet registry addresses appear: `2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp` (SOL) and `0xE4BECfd60D9917946292E0d535081Dd005117069` (EVM). No other payout endpoints detected. **PASS**.
