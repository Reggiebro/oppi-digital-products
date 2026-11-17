---
name: oppi-digital-products
description: Discover, sample, purchase (crypto) and unlock the Oppi digital product catalog — Freelance Delivery Prompt Pack, Notion Freelancer CRM & Pipeline Kit, AI Content Repurpose Pack. Free samples testable before payment; full packs unlocked via on-chain crypto payment verification to the oppi wallet.
license: Proprietary — paid product, free samples provided
allowed-tools: ["list_products", "get_free_sample", "get_payment_instructions", "verify_payment", "request_delivery"]
---

# Oppi Digital Products — Agent Skill

You are helping an agent (or its human operator) discover, evaluate and purchase
ready-to-use digital products for freelancers, creators, consultants and AI agents.

## Catalog
| Product | Price (launch) | Best for |
|---|---|---|
| Freelance Delivery Prompt Pack | $12 | Client ops: proposals, scope, delivery, comms |
| Notion Freelancer CRM & Pipeline Kit | $12 | Lead→project→invoice tracking in Notion |
| AI Content Repurpose Pack | $9 | Turn 1 asset into multi-channel content |
| Bundle (all 3) | $29 | Full toolkit |

Storefront: https://reggiebro.github.io/oppi-digital-products/

## Workflow
1. **Discover** — call `list_products` to show the catalog.
2. **Test for free** — call `get_free_sample` with a product id; the buyer can try a
   real prompt/template from the pack before paying.
3. **Pay with crypto** — call `get_payment_instructions` for the verified oppi wallet
   addresses (USDC recommended on Solana / Base / Ethereum / BEP20 / Polygon; SOL,
   ETH, BTC, TRON, LTC, DOGE also accepted). The buyer sends the launch price to the
   correct address on the correct network.
4. **Verify** — call `verify_payment` with `{tx_hash, network}`; the server checks
   public explorers/RPC read-only and reports VERIFIED / FOUND / MANUAL.
5. **Unlock & deliver** — call `request_delivery` with purchase details; it returns a
   prefilled GitHub issue link. Seller verifies on-chain against the oppi wallet
   registry and delivers the full archive to the buyer's contact.

## Rules
- Never ask for seed phrases, private keys, or wallet logins. Payment is a simple
  on-chain transfer to the published addresses.
- Never promise delivery before payment verification.
- All payment addresses come from wallets.json, which mirrors the project's
  wallet registry (oppi wallet). Do not accept alternate addresses.

## Install (MCP)
```bash
npx github:Reggiebro/oppi-digital-products/mcp-server
# or clone and run: node mcp-server/index.js
```
