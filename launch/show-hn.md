# Show HN — copy/paste

**Where:** https://news.ycombinator.com/submit
**When:** weekday, 8–10am US Eastern. Stay in the thread for at least 3 hours.
**URL field:** https://reggiebro.github.io/oppi-digital-products/
**Do not** ask for upvotes or post the same link again if it doesn't get traction.

---

## Title (80 chars max)

```text
Show HN: An MCP server that lets an agent sample and verify a crypto checkout
```

## Text (only if you submit as a text post; otherwise leave blank and let the URL carry it)

```text
I built a small digital-products store and then the MCP server that goes with it, because the interesting part wasn't the products — it was whether an agent could complete a purchase without a human.

The server is zero-dependency Node over stdio:

  npx -y oppi-digital-products-mcp

Tools: list_products, get_free_sample, get_payment_instructions, verify_payment, request_delivery.

The part I'd like feedback on is verify_payment. It's read-only: it takes a tx hash and a network, reads public explorers/RPCs, and returns a verdict only on an explicit address match. Pending, not-found, and RPC errors all return "manual review" instead of guessing. Delivery stays manual on purpose — I don't want an auto-delivery path sitting on top of best-effort explorer reads.

Two things I got wrong first:
- The balance watcher used one RPC per chain. When DNS flaked it polled zero chains and printed "no new payments" — a silent outage that looked healthy. It now reports zero reachable chains as DOWN.
- npx github:owner/repo fails on npm builds with remote/git specs disabled, so I shipped the package to the registry instead.

The store sells three freelancer packs (client-ops prompts, a Notion CRM blueprint, content repurposing). Every pack has a real free excerpt on the page — the actual prompt, not a screenshot. That's the part I'd most like critiqued: whether the samples are enough to judge the paid product honestly.

Storefront: https://reggiebro.github.io/oppi-digital-products/
Source: https://github.com/Reggiebro/oppi-digital-products

Happy to answer anything about the MCP wiring, the on-chain checks, or why the whole thing is crypto-only.
```

## First comment (post immediately after submitting)

```text
Maker here. A few implementation notes that didn't fit in the post.

Verification guarantees: the server never signs, never holds keys, and never asks for a seed phrase. It only reads public endpoints. The wallet addresses it checks against are published in the repo, so the check is auditable rather than a black box.

Why crypto-only: for a $5 product, card processing plus onboarding is a worse deal than a direct transfer, and "no account, no email" is a feature for a buyer who just wants a file. The trade-off is manual delivery, usually within 24–48h, which I'm upfront about on the page.

What's free: all three samples are full prompts/templates, no signup. If the sample is weak, I'd rather hear that than have someone pay $5 and find out.

Current flash pricing is $5 per pack / $12 for all three for the first five buyers, then $12/$12/$9 and $29. Orders are tracked in public GitHub issues, so the count is checkable.
```
