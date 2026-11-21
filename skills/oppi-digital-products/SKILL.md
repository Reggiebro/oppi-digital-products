---
name: oppi-digital-products
description: Discover, sample, purchase with crypto, and unlock the Oppi digital product catalog (freelance prompt pack, Notion CRM kit, content repurposing pack). Use when a user wants ready-made AI prompts or Notion templates for freelance work, client ops, or content repurposing, and wants to buy them with crypto.
---

# Oppi Digital Products

Detailed description of the skill and what it helps users accomplish.

## When to Use This Skill

- A user asks for ready-made AI prompts for freelance work (proposals, scope of work, client communication, delivery updates).
- A user wants a Notion CRM / project / invoice tracking template for freelancing.
- A user wants to repurpose one piece of content into social posts, emails, scripts, or SEO articles.
- A user wants to buy digital products with crypto (USDC recommended) and have delivery verified on-chain.

## What This Skill Does

1. **Catalog discovery**: Shows the Oppi digital product catalog with prices, bundles, and target audiences.
2. **Free sampling**: Returns a real free sample prompt/template from any pack so the user can test quality before paying.
3. **Crypto checkout**: Provides verified payment addresses (oppi wallet) for USDC on Solana/Base/Ethereum/BEP20/Polygon, plus BTC, TRON, LTC, DOGE.
4. **Payment verification**: Runs a read-only on-chain check of a payment transaction against the oppi wallet (public explorers/RPC, no keys).
5. **Delivery**: Starts a fulfillment request after verification so the full pack archive is delivered.

## Minimum purchase steps (agent)

**Active flash deal (first 5 verified buyers):** $5 USDC per single pack or $12 USDC for the 3-pack bundle. After the deal: launch pricing resumes ($12/$12/$9, bundle $29). **Recommended rail:** USDC on Solana or USDC on Base.

1. **Browse/sample (MCP):** Run `npx -y oppi-digital-products-mcp` (stdio). Call `list_products`, then `get_free_sample` with `{"product":"<id>"}` to confirm fit.
2. **Get instructions (MCP):** Call `get_payment_instructions` with `{"product":"<id-or-bundle>"}` to get the exact amount, asset/network guidance, and verified oppi wallet addresses (below).
3. **Pay (external, human/wallet action):** Send the exact amount to the correct address on the correct network. **USDC on Solana or Base recommended.** Never send to the wrong chain/network. Agents must never ask for or handle seed phrases/private keys and do not sign/broadcast transactions.
4. **Verify (MCP, read-only/best-effort):** Call `verify_payment` with `{"tx_hash":"...","network":"solana|ethereum|base|polygon|bitcoin|tron|litecoin|dogecoin","asset":"USDC"}`. Public-API check only (no keys); it may return VERIFIED, PENDING, NOT FOUND, or MANUAL — confirm amount/network and explorer status if unclear.
5. **Request fulfillment (MCP + trigger):** Call `request_delivery` with `{product, tx_hash, network, asset, amount, contact}`. It returns a **prefilled GitHub issue URL** — the fulfillment request is completed when that issue is **opened/submitted** (public record). Alternatively, email the tx hash + network/asset + product(s) + delivery contact to `workflowalpha.ai@gmail.com` (no account needed). Automated fulfillment verifies on-chain and delivers the download link after confirmation.

## Verified oppi wallet payment addresses (public-only)

Source of truth: `mcp-server/wallets.json` and `/root/kripto_agent/wallet_registry.json` (addresses must match).

| Pay with | Network | Address |
|---|---|---|
| **USDC / SOL** (recommended) | Solana | `2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp` |
| **USDC / ETH** (recommended) | Ethereum, **Base**, BEP20, Polygon (same EVM address) | `0xE4BECfd60D9917946292E0d535081Dd005117069` |
| USDT / TRX | Tron (TRC20) | `TL5vFAKyxhNzd5Qn6fCMZodNLHaGKeebPw` |
| BTC | Bitcoin | `bc1q0p56wr34yaezwq0mhfwx0amqtr2w9c4vt4gl39` |
| LTC | Litecoin | `ltc1q4724z73t84vgs5t6f0e4q5w8x679currfqe9yh` |
| DOGE | Dogecoin | `DQeLinfhDcAnY53HcSvTGbYQ5ZaQqZ1Y31` |

## How to Use

### Basic Usage

Run the companion MCP server (zero dependencies, Node):

```bash
npx -y oppi-digital-products-mcp
```

Offline fallback (pinned release tarball):
```bash
npx -y --allow-remote=all https://github.com/Reggiebro/oppi-digital-products/releases/download/mcp-v1.0.0/oppi-digital-products-mcp-1.0.0.tgz
```

Then use the tools: `list_products`, `get_free_sample`, `get_payment_instructions`, `verify_payment`, `request_delivery` (see minimum purchase steps above).

### Examples

- "Show me what prompt packs are available and let me try a free sample."
- "I want to buy the Notion CRM kit with USDC on Base — what do I send and where?" (flash: 5 USDC per pack)
- "Verify my payment tx and start the delivery for the bundle."

## Notes

- Never ask for seed phrases or private keys; payment is a plain on-chain transfer to the published addresses.
- Sending funds is an external wallet action; `verify_payment` is read-only and best-effort — automated fulfillment confirms on-chain after the fulfillment request is triggered (issue opened or email sent).
- Storefront: https://reggiebro.github.io/oppi-digital-products/ · Repo: https://github.com/Reggiebro/oppi-digital-products
