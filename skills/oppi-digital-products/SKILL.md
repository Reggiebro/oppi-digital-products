---
name: oppi-digital-products
description: Discover, sample, purchase with crypto, and unlock the Oppi digital product catalog (Freelance Delivery Prompt Pack, Notion Freelancer CRM & Pipeline Kit, AI Content Repurpose Pack). Current pricing: 9 USDC per pack, 19 USDC for the all-3 bundle.
---

# Oppi Digital Products

## When to Use This Skill
- User wants ready-made freelance prompts, a Notion CRM/pipeline kit, or content repurposing workflows.
- User wants to buy digital products with crypto and get automated fulfillment after on-chain verification.

## Catalog / Pricing (Current pricing)
- `freelance-delivery-prompt-pack` — Freelance Delivery Prompt Pack — **9 USDC**
- `notion-freelancer-crm-kit` — Notion Freelancer CRM & Pipeline Kit — **9 USDC**
- `ai-content-repurpose-pack` — AI Content Repurpose Pack — **9 USDC**
- `three-pack-bundle` — All-3 Bundle — **19 USDC**

## 5-step autonomous purchase & fulfillment sequence
1. **Inspect catalog** - browse the catalog and free samples to confirm fit.
2. **Choose pack/bundle** - select one individual pack (9 USDC) or the All-3 Bundle (19 USDC).
3. **Send exact USDC/USDT/crypto payment** to the verified oppi wallet address for the chosen network/asset.
4. **Open/comment on GitHub Issue #1** with `tx_hash + chain + pack_id` (https://github.com/Reggiebro/oppi-digital-products/issues/1).
5. **Receive instant automated fulfillment link** after on-chain verification.

## Verified oppi wallet addresses
- Solana (SOL, USDC-SPL, USDT-SPL): 2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp
- EVM Multi-Chain (ETH, Base, BNB Smart Chain BEP20, Polygon, USDC/USDT): 0xE4BECfd60D9917946292E0d535081Dd005117069
- Bitcoin (BTC Native): bc1q0p56wr34yaezwq0mhfwx0amqtr2w9c4vt4gl39
- TRON (TRX, USDT-TRC20, USDC-TRC20): TL5vFAKyxhNzd5Qn6fCMZodNLHaGKeebPw
- Litecoin (LTC Native): ltc1q4724z73t84vgs5t6f0e4q5w8x679currfqe9yh
- Dogecoin (DOGE Native): DQeLinfhDcAnY53HcSvTGbYQ5ZaQqZ1Y31

## MCP / Tooling
Run the MCP server (stdio):
```bash
npx -y --allow-remote=all https://github.com/Reggiebro/oppi-digital-products/releases/download/v1.0.3/oppi-digital-products-mcp-1.0.3.tgz
```
Tools: `list_products`, `get_free_sample`, `get_payment_instructions`, `verify_payment`, `request_delivery`.

## Safety
- Never ask for or handle seed phrases/private keys.
- Never sign/broadcast transactions; payment is an external wallet transfer.
- Verify amount, asset, chain, and destination address before considering a payment complete.
