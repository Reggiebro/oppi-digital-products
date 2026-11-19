# Launch Kit — Oppi Digital Products

**Prepared:** 2026-11-18  
**Storefront:** https://reggiebro.github.io/oppi-digital-products/  
**Repo:** https://github.com/Reggiebro/oppi-digital-products  
**Free samples:** https://reggiebro.github.io/oppi-digital-products/#previews  
**Showcase thread (live):** https://github.com/Reggiebro/oppi-digital-products/discussions/3

Use this as a working checklist. Post **one channel per day**, disclose that you are the maker, and answer every reply. Do not ask for upvotes, do not cross-post identical copy, and do not put the checkout link in someone else's support thread.

## Current offer (keep this consistent everywhere)

| Product | Flash price (first 5 buyers) | Standard price |
|---|---:|---:|
| Freelance Delivery Prompt Pack | $5 USDC | $12 |
| Notion Freelancer CRM & Pipeline Kit | $5 USDC | $12 |
| AI Content Repurpose Pack | $5 USDC | $9 |
| All-3 bundle | $12 USDC | $29 |

Payments: USDC on Solana `2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp` or USDC on Base `0xE4BECfd60D9917946292E0d535081Dd005117069`. Other rails are listed on the storefront. Delivery is manual after on-chain verification, usually within 24–48h.

## Ready-to-post files

These are final copy, not outlines. Open, read once, post from your own account.

| File | Channel | Notes |
|---|---|---|
| [`launch/devto-article.md`](launch/devto-article.md) | Dev.to / Hashnode | Full technical article, ~1,100 words. Publish here first, then cross-post with a canonical URL. |
| [`launch/show-hn.md`](launch/show-hn.md) | Show HN | Title, text, and the first comment to post immediately. |
| [`launch/reddit-sideproject.md`](launch/reddit-sideproject.md) | r/SideProject | Story format plus a reply bank for predictable objections. |

**Order that wastes the least effort:** Dev.to article → r/SideProject → Show HN. The article gives you something to link that isn't a sales page, which is what both communities actually want.

Every file already contains the maker disclosure, the live npm command (`npx -y oppi-digital-products-mcp`), and the current flash pricing. If pricing changes, update these files in the same commit as the storefront.

## Distribution status (2026-11-18)

| Surface | State | Notes |
|---|---|---|
| GitHub Discussions | **LIVE** | Enabled on the repo; showcase thread is discussion #3. |
| Glama | **LIVE** | https://glama.ai/mcp/servers/Reggiebro/oppi-digital-products |
| Official MCP Registry | **LIVE — 1.0.1** | `io.github.Reggiebro/oppi-digital-products`; bundle rebuilt with flash pricing. PulseMCP ingests it from here. |
| mcpHQ/awesome-mcp-servers | **MERGED** | PR #896 merged; listing is in the catalog. |
| npm | **LIVE** | https://www.npmjs.com/package/oppi-digital-products-mcp — `1.0.0`, `npx -y oppi-digital-products-mcp` verified against a real MCP handshake. |
| GitHub Release tarball | **LIVE + VERIFIED** | `mcp-v1.0.0` release; `npx --allow-remote=all <tarball URL>` answers `tools/list`. |
| Smithery | **BLOCKED** | `smithery auth login` fails from this machine (auth session API unreachable). Needs a browser login on your side, then `smithery mcp publish`. |

## Channels where project launches are explicitly allowed

| Channel | What it is for | Rules / guardrails | Link |
|---|---|---|---|
| **Show HN** | Runnable projects you made | Must be something people can try; no signup wall; no landing-page-only posts; no vote requests. Lead with the MCP server + free samples, not the sale. | https://news.ycombinator.com/showhn.html |
| **r/SideProject** | Sharing projects you built | The community exists for project sharing, but rule text has changed over time. Read the current sidebar; use the `[Project name] - [short description]` title format, disclose affiliation, and reply to comments. | https://www.reddit.com/r/SideProject/ |
| **r/IMadeThis** | Newly made projects | Same disclosure rule; one post, participate in comments. | https://www.reddit.com/r/IMadeThis/ |
| **r/alphaandbetausers** | Early users and feedback | Built for makers looking for testers; say what feedback you need, not just "check out my product". | https://www.reddit.com/r/alphaandbetausers/ |
| **r/indiehackers** | Indie maker community | Allows a self-promotion post with the correct flair; do not repeat the same link. | https://www.reddit.com/r/indiehackers/ |
| **r/buildinpublic** | Public build logs | Post progress and decisions, not a bare link; disclose ownership. | https://www.reddit.com/r/buildinpublic/ |
| **r/microsaas** | Small SaaS/product builders | Share the backstory and lessons; low-effort launch links are removed. | https://www.reddit.com/r/microsaas/ |
| **r/AI_Agents weekly project thread** | AI agent projects | Main-feed promotion is restricted; use the weekly project display thread and the `I Made This` flair where offered. | https://www.reddit.com/r/AI_Agents/ |
| **Indie Hackers** | Product page + "Show IH" / community threads | Self-promotion is normal when you contribute context and numbers; avoid drive-by link drops. | https://www.indiehackers.com/ |
| **Dev.to** | Technical articles with `#showdev` | Publish a real build write-up, disclose the product, keep the link secondary. | https://dev.to/ |
| **Hashnode** | Own technical blog | Cross-post the Dev.to article with a canonical link back. | https://hashnode.com/ |
| **Product Hunt** | New product launch | Use the launch flow, not a discussion comment; prepare gallery images and a first comment. | https://www.producthunt.com/ |
| **BetaList** | Early-stage product listing | Submission may be queued or paid; do not pay for placement without approval. | https://betalist.com/submit |
| **Uneed / MicroLaunch / Peerlist Launchpad / Fazier** | Launch directories | Each has its own free/paid tiers and scheduling; check terms first. | https://www.uneed.best/ · https://microlaunch.net/ · https://peerlist.io/launchpad · https://fazier.com/ |
| **MCP directories** | Agent/tool discovery | Glama and the official MCP Registry are already live. Smithery has a free publish flow (`smithery.ai/new`). PulseMCP has paused new submissions and ingests the official registry, so it should pick the server up automatically. mcp.so has an optional paid tier — do not pay without owner approval. | https://glama.ai/mcp/servers · https://registry.modelcontextprotocol.io/ · https://smithery.ai/new · https://mcp.so/ · https://www.pulsemcp.com/ |
| **Own channels** | X / Bluesky / LinkedIn / Mastodon / YouTube | No platform permission needed; use a short demo and the storefront link. | — |

### Restricted channels — use only the designated thread

- **r/SaaS** — one mention or three links per 60 days, with affiliation disclosed; promotional-only posts are removed.
- **r/startups** — use the stickied **Share Your Startup** thread, not the main feed.
- **r/Entrepreneur** — use the weekly feedback/promotion threads.

**Do not use:** other people's GitHub issues/discussions as ad space, cold DM blasts, auto-generated awesome-list PRs, or SEO gists whose only purpose is a link. Those are the tactics that get accounts limited.

## Ready-to-post: Show HN

**Title**

```text
Show HN: A zero-dependency MCP server for sampling and buying digital products
```

**Body**

```text
I built a small MCP server for a sample-first digital-products store. The part I think is interesting is the checkout flow: the agent can list products, pull a real free sample, get the correct USDC address for the network, verify the transfer read-only on-chain, and generate a prefilled delivery request.

It is zero-dependency Node, stdio, and the payment verification uses public RPC/explorer reads. No keys, no signing, no accounts.

Try it:

npx -y oppi-digital-products-mcp

The store itself sells three freelancer packs (client-ops prompts, a Notion CRM blueprint, content repurposing). Full packs are paid; the samples are free and the repo has the source for the server and skill.

Storefront with the free samples: https://reggiebro.github.io/oppi-digital-products/
Repo: https://github.com/Reggiebro/oppi-digital-products

I would especially like feedback on the payment-verification flow and whether the tool descriptions are clear enough for an agent to use without a human.
```

**First comment (post immediately after submitting)**

```text
Maker here. A few implementation notes:

- The server is read-only for balances and verification; it never signs or holds keys.
- `verify_payment` checks the tx against the published wallet address and network, then `request_delivery` builds a GitHub issue URL with the tx hash and product.
- The free samples are the actual prompts/templates, not screenshots.
- Current flash pricing is $5 per pack / $12 bundle for the first five buyers; standard pricing after that.

Happy to answer questions about the MCP wiring or the on-chain check.
```

## Ready-to-post: r/SideProject

**Title**

```text
I built a sample-first store for freelancer prompt packs, with an MCP server so agents can browse it
```

**Body**

```text
I kept seeing prompt packs sold behind a "what's inside" list, so I built the opposite: the real sample is on the page, and you only pay if the sample is useful.

Three products:
- Freelance Delivery Prompt Pack — 30+ prompts for leads, proposals, scope, delivery updates, difficult clients, and growth.
- Notion Freelancer CRM & Pipeline Kit — leads/clients, projects, invoices, follow-up views, and dashboard setup.
- AI Content Repurpose Pack — one asset into posts, threads, emails, scripts, SEO outlines, and a 7-day calendar.

There is also an MCP server so an agent can list the catalog, pull a free sample, get the right USDC address, verify the payment on-chain, and file a delivery request. Zero-dependency Node, stdio.

Free samples: https://reggiebro.github.io/oppi-digital-products/#previews
Repo: https://github.com/Reggiebro/oppi-digital-products

Disclosure: I made this. Feedback on the samples and the checkout flow is welcome — especially if anything is confusing.
```

## Ready-to-post: Indie Hackers

**Title**

```text
Show IH: Sample-first digital products with crypto checkout and an MCP server
```

**Body**

```text
I am testing a simple thesis: show the actual work before asking for payment, and let agents do the browsing/checkout steps.

What exists now:
- Three freelancer products with real free samples (prompt pack, Notion CRM kit, content repurposing pack).
- A static storefront on GitHub Pages.
- A zero-dependency MCP server that exposes catalog, sample, payment-instruction, on-chain verification, and delivery-request tools.
- Direct USDC checkout on Solana/Base; manual delivery after verification.

What I am trying to learn:
- Whether free samples reduce the "is this worth it?" friction or just attract freebie hunters.
- Whether agent-readable checkout is useful yet, or still too early.
- Which channel produces actual buyers rather than drive-by traffic.

Storefront: https://reggiebro.github.io/oppi-digital-products/
Repo: https://github.com/Reggiebro/oppi-digital-products

Disclosure: I built it. I will share numbers in the comments as they come in.
```

## Ready-to-post: Dev.to / Hashnode article

**Working title:** "Building a zero-dependency MCP server for sample-first, on-chain checkout"

**Outline**

1. The problem: product pages hide the goods; agents cannot inspect them.
2. The design: catalog JSON, free-sample tool, payment-instruction tool, read-only verification, delivery-request URL.
3. The on-chain check: public RPC reads, address/network matching, confirmation handling, no keys.
4. Failure modes: wrong network, underpayment, RPC outages, duplicate delivery requests.
5. What I would change next: idempotent order IDs, signed receipts, a real queue.
6. Footer: disclose the product and link the storefront + repo once.

**Canonical:** publish on your own domain or Dev.to first, then cross-post to Hashnode with a canonical URL.

## Ready-to-post: Product Hunt

**Tagline (60 chars max)**

```text
Free samples first. Freelancer prompt packs, paid in USDC.
```

**Short description**

```text
Three practical freelancer packs — 30+ client-ops prompts, a Notion CRM blueprint, and a content repurposing system. Try the real samples free, then pay with USDC on Solana or Base. Includes an MCP server so agents can browse, sample, and verify checkout on-chain.
```

**First comment**

```text
Maker here. The thing I am most proud of is the sample-first flow: every product has a real excerpt you can read before paying, and the MCP server exposes the same catalog to agents.

The checkout is direct USDC (Solana or Base) with read-only on-chain verification, so there is no account or subscription. Delivery is manual, usually within 24–48h.

Happy to answer anything about the MCP server, the on-chain verification, or the product contents.
```

## Ready-to-post: short social posts

**X / Bluesky**

```text
Most prompt packs hide the goods. I put the real samples on the page.

3 freelancer packs: client-ops prompts, a Notion CRM blueprint, content repurposing.
Free samples → pay with USDC if useful.
MCP server included so agents can browse + verify checkout.

https://reggiebro.github.io/oppi-digital-products/
```

**LinkedIn**

```text
I shipped a small experiment in sample-first digital products.

Instead of a "what's inside" list, each pack has a real working excerpt you can read before paying. The catalog is also exposed through a zero-dependency MCP server, so an agent can list products, pull a sample, get the right USDC address, and verify the payment on-chain before filing a delivery request.

Three packs: freelance client-ops prompts, a Notion CRM blueprint, and a content repurposing system.

Free samples: https://reggiebro.github.io/oppi-digital-products/
Disclosure: I built this.
```

## 7-day posting schedule

| Day | Action |
|---|---|
| 1 | Publish the Dev.to article; cross-post to Hashnode with canonical. |
| 2 | Post r/SideProject; answer every comment for 24h. |
| 3 | Post Indie Hackers "Show IH"; share one concrete lesson, not just a link. |
| 4 | Submit Show HN around 8–10am ET; stay in the thread. |
| 5 | Post r/IMadeThis with a different angle (the MCP build, not the products). |
| 6 | Product Hunt launch (only if gallery assets and first comment are ready). |
| 7 | Review traffic sources and double down on the one that produced replies or sales. |

## Guardrails

- Disclose affiliation in the first paragraph of every post.
- One post per community; do not repost the same link after removal.
- Never ask for upvotes, likes, or comments.
- Do not post the checkout link in someone else's support thread; answer the question first, link only if asked.
- Do not pay for placement or reviews without owner approval.
- Keep pricing claims consistent with the storefront and README.
- If a community removes a post, do not argue; ask the moderators what would be allowed.
