# r/SideProject — copy/paste

**Before posting:** read the current sidebar rules. Subreddit rules change; if a rule now forbids this, don't post.
**Title format:** the subreddit uses `[Project name] - [short description]`.
**After posting:** answer every comment for 24h. Do not repost if removed — ask the mods instead.

---

## Title

```text
[Oppi Digital Products] - Freelancer prompt packs where the free sample is the actual prompt, not a screenshot
```

## Body

```text
I kept running into the same pattern with prompt packs: a landing page, a "what's inside" list, and no way to judge quality before paying. So I built the opposite and I'm testing whether it converts.

Every pack has a real excerpt on the page. Not a preview image — the actual prompt text, copy-pasteable, no signup:

- Lead qualification scorecard: raw inquiry → 1-5 scoring across fit, budget, urgency, scope, decision-maker, risk, with a go/no-go call.
- Notion CRM blueprint: the exact properties and the three views behind the "follow-ups due" dashboard.
- Content repurposing: the extraction prompts that turn one asset into hooks, a thread, a newsletter, and a 7-day calendar.

Three packs at $9 each, or $19 for all three. Crypto only (USDC), no account, no email. That last part is the experiment: for a $9 product, card fees and onboarding are worse than a direct transfer, but the trade-off is manual delivery, instantly after on-chain verification.

There's also an MCP server so an agent can list the catalog, pull a sample, get the right address, and verify the transfer read-only on-chain before filing a delivery request. Zero-dependency Node:

  npx -y oppi-digital-products-mcp

What I actually want to know:
1. Do the samples make the paid packs feel redundant, or does seeing one prompt make you trust the other 29 more?
2. Is 24-48h delivery a dealbreaker at this price point?
3. Does crypto-only kill it for you, or is it neutral for a $9 impulse buy?

Storefront: https://reggiebro.github.io/oppi-digital-products/
Repo: https://github.com/Reggiebro/oppi-digital-products

Disclosure: I built this. Not asking for upvotes — critical feedback is more useful to me than a nice comment.
```

---

## Comment reply bank (use only where it actually answers the question)

**"Why crypto?"**
> Card processing plus account onboarding on a $9 product costs more than the product's margin, and it forces an email. Direct USDC means no account and no fee worth mentioning. The cost is that delivery is manual, which I say upfront rather than hiding in a FAQ.

**"Why not Gumroad/Lemon Squeezy?"**
> I may add one later for people who won't touch crypto. For now the on-chain verification is the part I wanted to build, and it's the part that makes "no account" possible.

**"How do I know you'll deliver?"**
> Every order is a public GitHub issue, and verification is done against addresses published in the repo. If I don't deliver, it's visible to everyone, not buried in a support inbox.

**"$9 seems too cheap / is this a scam?"**
> It's $9 per pack, or $19 for all three. The point is to get real feedback on the samples before charging full price, not to run a permanent discount.
