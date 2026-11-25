# Building a sample-first store where an AI agent can verify its own checkout

Most digital-product pages ask you to trust a screenshot. The buyer cannot inspect the goods, the agent cannot inspect the goods, and the checkout is a redirect into a payment processor that has never heard of the product.

I wanted to see what the opposite looks like: a store where the actual product excerpt is readable before payment, and where an AI agent can browse, sample, pay, and prove the payment without a human opening a browser.

This is a write-up of the design decisions, the parts that were harder than expected, and what I would change. The store is mine, so treat the product links as disclosure.

## The constraint that shaped everything

No accounts. No email collection. No subscription. That rules out Stripe-style checkout for a $9 product, where fees and onboarding eat the margin, and it rules out "create an account to download" flows entirely.

Crypto checkout fits, but it introduces the real problem: **how does a buyer prove payment without a support inbox?** The obvious answer — "paste your tx hash into a form" — still requires a human on the other side to check an explorer.

So the on-chain verification became the product's core, not an afterthought.

## Four tools instead of a checkout page

The MCP server exposes five tools, but the checkout loop is four:

```text
list_products            → catalog with prices and free-sample ids
get_free_sample          → an actual prompt/template, not a screenshot
get_payment_instructions → the verified address for the chosen network
verify_payment           → read-only check against the published address
request_delivery         → prefilled GitHub issue URL with tx details
```

The install is one line:

```bash
npx -y oppi-digital-products-mcp
```

It is zero-dependency Node over stdio. That was deliberate: every dependency is a reason an agent host will refuse to run it, and every native module is a reason it breaks on someone else's architecture.

## The verification layer

`verify_payment` never signs anything. It takes `{ tx_hash, network }` and reads public endpoints:

- EVM chains via Blockscout's transaction API, matching `to` against the published wallet for both native transfers and token transfers.
- Solana via `getTransaction` on a public RPC, checking the wallet appears in the transaction and that `meta.err` is null.
- Bitcoin, Litecoin, Dogecoin via their public explorer APIs, matching the address in outputs.
- Tron via Tronscan, matching the address in the transaction payload.

Two decisions matter more than the implementation:

**1. Ambiguity must fail closed.** The tool returns positive verdicts only for explicit matches (`VERIFIED on …`, `FOUND payment address in …`). Anything else — pending, not found, RPC error — returns a manual-review path. A checkout that auto-confirms on a network error is worse than a checkout with no automation, because the seller ships product for free.

**2. Confirmation is not delivery.** Verification returns a verdict; `request_delivery` only builds a prefilled GitHub issue URL. Final delivery stays manual. For a $9 USDC/$19 USDC product that sounds like leaving money on the table, and it is the part I would automate next, but shipping an auto-delivery path on top of best-effort explorer reads is how you send the same archive twice or send it to a wrong-network payment.

## What broke in practice

**RPC availability is the whole game.** The balance watcher that polls the wallet addresses initially used one endpoint per chain. When DNS flaked, it polled zero chains and printed "no new payments" — a silent outage disguised as a healthy result. The fix was fallback endpoints per chain, retries with backoff, and an explicit health state where **zero reachable chains is `down`, not `no payments`**.

That bug is worth generalizing: any monitoring that reports absence of events must be able to distinguish "nothing happened" from "I could not look."

**Explorer APIs disagree about response shapes.** Blockscout returns `status` sometimes as a string, sometimes as an object; token transfers live under `token_transfers` with different decimal handling per token. Matching only on `to` catches ERC-20 transfers that native-value checks miss, but you have to normalize decimals or a 9 USDC payment reads as 5,000,000.

**npx is not a stable assumption.** Some npm builds disable remote and git package specs (`allow-remote=none`, `allow-git=none`), so a README that says `npx github:owner/repo` fails on those machines. Publishing to the registry, or shipping a release tarball, is more portable than pointing at a git URL.

## The storefront decisions that mattered

Three things did more for conversion than any copy change:

1. **Real excerpts inline.** Not a "what's inside" list. The lead-qualification prompt is on the page, in full.
2. **Price anchoring with an end condition.** "Current pricing: $9 USDC per pack / $19 USDC bundle" is checkable because orders and fulfillment are public in GitHub issues.
3. **One CTA per product.** Every card links to the payment box rather than to a separate checkout page, so the buyer never loses the address they just read.

The structured data (`Product` + `Offer` + `FAQPage` in one `@graph`) and `llms.txt` are cheap to add and make the catalog legible to both search engines and agents. The `/.well-known/agent.json` file is the same idea for tool discovery.

## What I would change next

- **Idempotent order IDs.** Right now a duplicate delivery request is resolved by a human reading two issues. A signed receipt per order would fix it.
- **Confirmation depth, not just inclusion.** A transaction in the mempool is not a payment. The current check reports what the explorer reports; a minimum-confirmation policy belongs in the tool.
- **Automated delivery with a real queue.** The manual step is the largest latency in the funnel. It needs idempotency before it needs automation.
- **A payments watcher that alerts.** Detecting a payment is only useful if it reaches a human within minutes, not on the next poll interval.

## Try it

```bash
npx -y oppi-digital-products-mcp
```

Storefront with the free samples: https://reggiebro.github.io/oppi-digital-products/
Source: https://github.com/Reggiebro/oppi-digital-products

---

*Disclosure: I maintain this project and sell the packs it describes. The free samples are the actual prompts and templates, and the MCP server is MIT-licensed, so you can read the verification code before trusting it.*
