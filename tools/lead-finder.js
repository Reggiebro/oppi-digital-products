#!/usr/bin/env node
/**
 * lead-finder.js — find real buying-intent threads, score them, and draft a reply.
 *
 * WHAT IT DOES
 *   Searches recent GitHub issues/discussions (OR-combined queries, rate-limited)
 *   and Hacker News (Algolia, zero-auth) for people actively asking for Notion
 *   CRM setups, freelance/AI prompt workflows, content repurposing, or MCP tools.
 *   Scores each hit, attaches the matching free sample, and writes a review queue
 *   with a ready-to-edit, helpful draft.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *   It does not post. Drafts are queued for a human to read the thread, judge
 *   relevance, tailor the reply, and post once where appropriate.
 *
 * USAGE
 *   node tools/lead-finder.js                     # search + write queue for today
 *   node tools/lead-finder.js --days 7 --min-score 4
 *   node tools/lead-finder.js --show             # print today's queue
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');

// Cron PATH is minimal; `gh` lives in /usr/local/bin here.
const GH = (() => {
  const candidates = [process.env.GH_BIN, '/usr/local/bin/gh', '/usr/bin/gh', '/opt/homebrew/bin/gh'];
  for (const c of candidates) {
    if (!c) continue;
    try { if (fs.existsSync(c)) return c; } catch (_) { /* ignore */ }
  }
  return 'gh';
})();

const ROOT = path.join(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'leads');
const DAY = new Date().toISOString().slice(0, 10);

const arg = (name, def) => {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  const v = parseInt(process.argv[i + 1], 10);
  return Number.isFinite(v) ? v : def;
};

const DAYS = arg('--days', 30);
const MIN_SCORE = arg('--min-score', 3);
const PER_QUERY = arg('--per-query', 20);
const MAX_CANDIDATES = arg('--max', 25);
const GH_DELAY_MS = 4000;

const STOREFRONT = 'https://reggiebro.github.io/oppi-digital-products/';
const WALLET_SOL = '2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp'; // USDC/SOL on Solana
const WALLET_EVM = '0xE4BECfd60D9917946292E0d535081Dd005117069'; // USDC/ETH on Base/EVM

/* ---------------- http helper (HN Algolia) ---------------- */

function httpJson(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    let urlObj;
    try { urlObj = new URL(url); } catch (e) { return reject(e); }
    const req = https.request(urlObj, {
      method: 'GET',
      headers: { 'user-agent': 'oppi-lead-finder/1.1', accept: 'application/json' },
      timeout: 20000,
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 3) {
        res.resume();
        return resolve(httpJson(new URL(res.headers.location, urlObj).toString(), redirects + 1));
      }
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end();
  });
}

/* ---------------- product mapping ---------------- */

const PRODUCTS = [
  {
    id: 'notion-freelancer-crm-kit',
    name: 'Notion Freelancer CRM & Pipeline Kit',
    sample: 'previews/notion-crm-kit/sample-crm-database-blueprint.md',
    anchor: 'product-notion-crm',
    queries: [
      '"notion template" freelancer',
      '"notion crm" template',
      '"client management" notion template',
      '"freelance CRM" notion',
      '"client tracker" notion template',
      '"notion template for clients"',
    ],
    hnQueries: [
      'freelance CRM Notion',
      'Notion client management template',
      'freelancer CRM template',
      'Notion template for freelance clients',
      'best Notion CRM for freelancers',
    ],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to|template for)/i,
    match: /notion\s+(template|crm|database|workspace|setup|dashboard)|crm\s+(template|for freelancers)|client\s+(management|pipeline|tracking|tracker)\s*(in\s+)?(notion)?|freelance(r)?\s+(crm|client tracker)/i,
  },
  {
    id: 'freelance-delivery-prompt-pack',
    name: 'Freelance Delivery Prompt Pack',
    sample: 'previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md',
    anchor: 'product-prompt-pack',
    queries: [
      '"prompt pack" freelancer',
      '"prompts for" freelance clients',
      'chatgpt prompts client proposals',
      '"freelance prompt" system',
      '"AI prompts for freelancers"',
      'prompts for client onboarding',
    ],
    hnQueries: [
      'freelance AI prompt workflow',
      'ChatGPT prompts for freelancers',
      'client proposal prompts AI',
      'freelance prompt system',
      'AI prompts for client work',
    ],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to|workflow for)/i,
    match: /(prompt|prompts)\s+(pack|library|collection|workflow|system|for\s+(freelanc|client|proposal|onboarding))|(freelance|client)\s+(proposal|onboarding|scope|delivery)\s+prompt|ai\s+prompt\s+(workflow|system)/i,
  },
  {
    id: 'ai-content-repurpose-pack',
    name: 'AI Content Repurpose Pack',
    sample: 'previews/content-repurpose-pack/sample-core-extraction.md',
    anchor: 'product-repurpose-pack',
    queries: [
      '"repurpose content" workflow',
      '"content repurposing" tool',
      'turn podcast into social posts workflow',
    ],
    hnQueries: ['content repurposing workflow AI', 'repurpose podcast to posts', 'AI content repurpose tool'],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to)/i,
    match: /repurpos(e|ing)|turn\s+(one|a)\s+(piece|video|podcast|blog|article)\s+into/i,
  },
  {
    id: 'three-pack-bundle',
    name: 'All-3 bundle (MCP + digital products)',
    sample: 'previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md',
    anchor: 'product-bundle',
    queries: [
      '"mcp server" ecommerce',
      '"mcp server" "digital products"',
      '"model context protocol" payment agent',
      '"mcp server" commerce',
      '"mcp tool" payment',
      '"mcp server" for selling',
    ],
    hnQueries: [
      'MCP server ecommerce',
      'MCP tool for selling digital products',
      'model context protocol payment tool',
      'MCP commerce tool',
      'MCP server payments or checkout',
    ],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to|build(ing)?)/i,
    match: /mcp\s+(server|tool)\s*(for|that|to)?|model\s+context\s+protocol\s+(server|integration|tool|commerce)|agent\s+(commerce|checkout|payment)|sell(ing)?\s+digital\s+products?\s+(with|via)\s+mcp/i,
  },
];

const SKIP_REPOS = new Set(['Reggiebro/oppi-digital-products']);
const SKIP_TITLE = /(awesome|curated list|weekly|digest|newsletter|roundup|hiring|job|bounty|for sale|^spec\b|^rfc\b|^research:|^\[collaborators\]|roadmap|changelog|candidates?\b|^daily\b|^ideas\b|use-case inventory|^recommend:|^show (hn|ih)|^launch|tool list|handoff|^submit|submission|^implement|^build\b|^proposal|^intake|migration)/i;

// A real ask is short and near the top. Digest/dump issues bury a keyword in 10k chars.
const MAX_BODY = 4000;

/* ---------------- github ---------------- */

let lastGhAt = 0;
function ghThrottle() {
  const wait = GH_DELAY_MS - (Date.now() - lastGhAt);
  if (wait > 0) sleep(wait);
  lastGhAt = Date.now();
}

function gh(args) {
  ghThrottle();
  return execFileSync(GH, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function orCombine(queries) {
  return '(' + queries.map((q) => `(${q})`).join(' OR ') + ')';
}

function search(q, attempt = 1) {
  const url = `search/issues?q=${encodeURIComponent(q)}&per_page=${PER_QUERY}`;
  try {
    const out = gh(['api', '-X', 'GET', url]);
    return JSON.parse(out).items || [];
  } catch (e) {
    const msg = String(e.message).split('\n')[0];
    if (attempt < 3 && /secondary rate limit|HTTP 403/i.test(msg)) {
      const wait = 20000 * attempt;
      console.error(`  … rate limited, backing off ${wait / 1000}s`);
      sleep(wait);
      return search(q, attempt + 1);
    }
    console.error(`  ! search failed: ${q.slice(0, 120)} — ${msg}`);
    return [];
  }
}

function searchDiscussions(q) {
  const query = `query($q: String!) { search(query: $q, type: DISCUSSION, first: 20) { nodes { ... on Discussion { title url body createdAt comments { totalCount } author { login } repository { nameWithOwner } } } } }`;
  try {
    const out = gh(['api', 'graphql', '-f', `query=${query}`, '-f', `q=${q}`]);
    const nodes = (JSON.parse(out).data.search.nodes || []).filter(Boolean);
    return nodes.map((n) => ({
      title: n.title,
      body: n.body || '',
      html_url: n.url,
      created_at: n.createdAt,
      comments: (n.comments && n.comments.totalCount) || 0,
      user: { login: n.author && n.author.login, type: 'User' },
      repository_url: `https://api.github.com/repos/${n.repository && n.repository.nameWithOwner}`,
      isDiscussion: true,
    }));
  } catch (e) {
    console.error(`  ! discussion search failed: ${String(e.message).split('\n')[0]}`);
    return [];
  }
}

function repoOf(item) {
  if (item.isHN) return 'news.ycombinator.com';
  return (item.repository_url || '').replace('https://api.github.com/repos/', '');
}

/* ---------------- scoring ---------------- */

function scoreItem(item, product) {
  const text = `${item.title}\n${item.body || ''}`;
  let score = 0;
  const why = [];

  if (item.user && (item.user.type === 'Bot' || /\[bot\]$|-bot$/i.test(item.user.login || ''))) {
    return { score: -99, why: ['bot author'] };
  }
  if ((item.body || '').length > MAX_BODY) return { score: -99, why: ['body too long (list/dump)'] };

  if (!product.need.test(text)) return { score: -99, why: ['no explicit ask'] };
  if (!product.match.test(text)) return { score: -99, why: ['product phrase absent'] };
  score += 3; why.push('explicit ask + product phrase');

  if (item.isHN) score += 1, why.push('HN Ask/Show signal');

  const comments = item.comments || 0;
  if (comments >= 1 && comments <= 12) { score += 1; why.push('active/open conversation'); }
  if (comments > 30) { score -= 1; why.push('crowded thread'); }

  const ageDays = (Date.now() - new Date(item.created_at).getTime()) / 86400000;
  if (ageDays <= 3) { score += 2; why.push('fresh'); }
  else if (ageDays <= 10) { score += 1; why.push('recent'); }

  if (/(paid|budget|hire|buy|price|pricing|cost|looking to pay)/i.test(text)) { score += 2; why.push('money/buying signal'); }
  if (!item.body || item.body.length < 30) { score -= 1; why.push('thin body'); }
  if (/\[x\]|closed|resolved/i.test(text)) { score -= 1; }
  if (item.pull_request) { score -= 3; why.push('is a PR'); }

  return { score, why };
}

/* ---------------- drafting ---------------- */

function productTip(productId) {
  if (productId === 'notion-freelancer-crm-kit') {
    return 'a practical angle: make one explicit "next action + next follow-up date" field on each lead/client and a view filtered to follow-ups due soon — that alone usually removes most CRM chaos for freelancers.';
  }
  if (productId === 'freelance-delivery-prompt-pack') {
    return 'a practical angle: standardize the client lifecycle into repeatable prompts (lead qual → proposal/scope → onboarding → delivery update → feedback) so you are not rewriting the same messages from scratch.';
  }
  if (productId === 'ai-content-repurpose-pack') {
    return 'a practical angle: extract one canonical "core" (hook, key points, quotes, CTA) from the source asset first, then branch into channel-specific posts/emails/scripts from that same core.';
  }
  return 'a practical angle: for agent/MCP commerce flows, keep catalog, sample, payment instructions, and read-only on-chain verification as separate tool steps so the agent can be explicit and auditable.';
}

function draft(item, product) {
  const title = item.title.replace(/\s+/g, ' ').trim().slice(0, 90);
  const sampleUrl = `https://github.com/Reggiebro/oppi-digital-products/blob/master/${product.sample}`;
  const storeUrl = `${STOREFRONT}#${product.anchor}`;
  const isHN = item.isHN;

  const lines = [
    isHN ? `Re: "${title}"` : `> Re: "${title}"`,
    '',
    `Disclosure: I built the resource below, so treat this as a biased suggestion.`,
    '',
    `If it helps, ${productTip(product.id)}`,
    '',
    `I put a real free sample/excerpt here (no signup): ${sampleUrl}`,
    `Full storefront / overview: ${storeUrl}`,
    '',
    `If the full pack is useful: flash pricing is shown on the storefront (direct crypto, manual delivery after on-chain verification, instantly after on-chain verification). Verified oppi wallet addresses:`,
    `- USDC (Solana): \`${WALLET_SOL}\``,
    `- USDC (Base/EVM): \`${WALLET_EVM}\``,
    '',
    `Feel free to ignore the paid part — if you share a bit more about your current setup, I can suggest the specific structure/prompt that fits.`,
  ];
  return lines.join('\n');
}

/* ---------------- Hacker News (Algolia, zero-auth) ---------------- */

async function searchHN(hnQuery, sinceTs) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(hnQuery)}&tags=(story,ask_hn,show_hn)&numericFilters=created_at_i>${sinceTs}&hitsPerPage=20`;
  try {
    const j = await httpJson(url);
    return (j.hits || []).map((h) => ({
      isHN: true,
      title: h.title || h.story_title || '(no title)',
      body: (h.story_text || h.comment_text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      html_url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      hn_url: `https://news.ycombinator.com/item?id=${h.objectID}`,
      number: h.objectID,
      created_at: h.created_at || new Date((h.created_at_i || 0) * 1000).toISOString(),
      comments: h.num_comments || 0,
      user: { login: h.author || 'unknown', type: 'User' },
      repository_url: 'https://news.ycombinator.com',
    }));
  } catch (e) {
    console.error(`  ! HN search failed: ${hnQuery} — ${String(e.message).split('\n')[0]}`);
    return [];
  }
}

/* ---------------- main ---------------- */

async function main() {
  const since = new Date(Date.now() - DAYS * 86400000).toISOString().slice(0, 10);
  const sinceTs = Math.floor((Date.now() - DAYS * 86400000) / 1000);
  const seen = new Map();
  let ghCalls = 0;

  console.log(`oppi lead finder · last ${DAYS}d · min score ${MIN_SCORE}`);

  // 1) GitHub: OR-combined issue query per product (1 call) + OR-combined discussion query (1 call)
  for (const product of PRODUCTS) {
    const combined = orCombine(product.queries);
    const iq = `${combined} state:open is:issue created:>${since} -repo:Reggiebro/oppi-digital-products`;
    const issues = search(iq);
    ghCalls++;
    console.log(`  GH issues [${product.id}] -> ${issues.length}`);
    const dq = `${combined} created:>${since}`;
    const disc = searchDiscussions(dq);
    ghCalls++;
    console.log(`  GH discussions [${product.id}] -> ${disc.length}`);

    for (const item of [...issues, ...disc]) {
      const repo = repoOf(item);
      if (!repo || SKIP_REPOS.has(repo)) continue;
      if (SKIP_TITLE.test(item.title)) continue;
      const key = item.isDiscussion ? `disc:${repo}:${item.html_url}` : `${repo}#${item.number}`;
      const { score, why } = scoreItem(item, product);
      const prev = seen.get(key);
      if (prev && prev.score >= score) continue;
      seen.set(key, {
        key, repo, number: item.number || '', title: item.title,
        url: item.html_url, author: item.user && item.user.login,
        comments: item.comments, created_at: item.created_at,
        source: item.isDiscussion ? 'github-discussion' : 'github-issue',
        product: product.id, productName: product.name,
        score, why, draft: '', isHN: false,
      });
    }
  }
  console.log(`  GitHub API calls: ${ghCalls} (4s throttle between calls)`);

  // 2) Hacker News via Algolia (zero-auth)
  for (const product of PRODUCTS) {
    for (const hq of (product.hnQueries || [])) {
      const hits = await searchHN(hq, sinceTs);
      console.log(`  HN "${hq}" -> ${hits.length}`);
      for (const item of hits) {
        if (SKIP_TITLE.test(item.title || '')) continue;
        const key = `hn:${item.number}`;
        const { score, why } = scoreItem(item, product);
        const prev = seen.get(key);
        if (prev && prev.score >= score) continue;
        seen.set(key, {
          key, repo: 'news.ycombinator.com', number: item.number, title: item.title,
          url: item.hn_url || item.html_url, author: item.user && item.user.login,
          comments: item.comments, created_at: item.created_at,
          source: 'hackernews',
          product: product.id, productName: product.name,
          score, why, draft: '', isHN: true,
        });
      }
    }
  }

  // generate drafts now (needs final item context)
  for (const c of seen.values()) {
    const product = PRODUCTS.find((p) => p.id === c.product);
    if (product) c.draft = draft(c, product);
  }

  const candidates = [...seen.values()]
    .filter((c) => c.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || new Date(b.created_at) - new Date(a.created_at))
    .slice(0, MAX_CANDIDATES);

  const dir = path.join(OUT_ROOT, DAY);
  fs.mkdirSync(path.join(dir, 'drafts'), { recursive: true });
  const slug = (k) => String(k).replace(/[^a-zA-Z0-9._-]/g, '-');
  for (const c of candidates) {
    c.draftFile = `drafts/${slug(c.key)}.md`;
    fs.writeFileSync(path.join(dir, c.draftFile), c.draft);
  }

  fs.writeFileSync(path.join(dir, 'queue.json'), JSON.stringify({
    generated_at: new Date().toISOString(),
    days: DAYS,
    min_score: MIN_SCORE,
    storefront: STOREFRONT,
    wallets: { solana_usdc: WALLET_SOL, base_evm_usdc: WALLET_EVM },
    note: 'Drafts only. Read each thread before posting; tailor replies and avoid unsolicited spam.',
    candidates,
  }, null, 2) + '\n');

  const md = [
    `# Lead queue — ${DAY}`,
    '',
    `Generated ${new Date().toISOString()} · last ${DAYS} days · score >= ${MIN_SCORE}`,
    '',
    `**Read the thread before posting.** Answer the question first with something genuinely useful; include the free sample/storefront/wallet info only where relevant. Never post the same text twice or spam.`,
    '',
    `| # | Source | Thread | Product fit | Score | Comments |`,
    `|---:|---|---|---|---:|---:|`,
    ...(candidates.length === 0 ? [
      '**Zero qualified leads this run.** Signals were searched (GitHub OR-combined + HN Algolia) but none passed the relevance/ask gates.',
      '',
    ] : []),
    ...candidates.map((c, i) =>
      `| ${i + 1} | ${c.source || c.repo} | [${c.repo}#${c.number}](${c.url}) ${c.title.replace(/\|/g, '/').slice(0, 70)} | ${c.productName} | ${c.score} | ${c.comments} |`),
    '',
    ...candidates.flatMap((c, i) => [
      `---`,
      '',
      `## ${i + 1}. ${c.repo}#${c.number} — ${c.title}`,
      '',
      `- URL: ${c.url}`,
      `- Source: ${c.source || c.repo} · Opened by: @${c.author} · ${c.created_at ? c.created_at.slice(0, 10) : ''} · ${c.comments} comments`,
      `- Why it scored: ${(c.why || []).join(', ') || 'match'}`,
      `- Product fit: ${c.productName}`,
      `- Storefront: ${STOREFRONT}#${PRODUCTS.find(p=>p.id===c.product)?.anchor || ''}`,
      `- Draft file: ${c.draftFile}`,
      '',
      '**Ready-to-send draft (review/tailor before use):**',
      '',
      '```text',
      c.draft,
      '```',
      '',
    ]),
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'review.md'), md);

  const cmds = [
    '#!/usr/bin/env bash',
    `# ${DAY} lead reply commands — generated, NOT executed.`,
    '# Read the thread first, edit/tailor the draft, then post manually (one-by-one).',
    '# For HN, reply in-browser; for GitHub issues you may use: gh issue comment <num> -R <repo> --body-file <draft>',
    '',
    ...candidates.map((c) => [
      `# ${c.source || c.repo} ${c.repo}#${c.number} — ${c.title.replace(/\n/g, ' ').slice(0, 80)}`,
      c.isHN ? `# reply manually at ${c.url} using ${c.draftFile}` : `# gh issue comment ${c.number} -R ${c.repo} --body-file ${c.draftFile}`,
      '',
    ].join('\n')),
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'commands.sh'), cmds, { mode: 0o755 });

  console.log(`\ncandidates >= ${MIN_SCORE}: ${candidates.length}`);
  console.log(`queue:  ${path.join(dir, 'queue.json')}`);
  console.log(`review: ${path.join(dir, 'review.md')}`);
  console.log('\nDrafts only. Posting is manual by design — review/tailor before sending.');
}

if (process.argv.includes('--show')) {
  const f = path.join(OUT_ROOT, DAY, 'review.md');
  if (!fs.existsSync(f)) { console.error('no queue for today; run without --show first'); process.exit(1); }
  process.stdout.write(fs.readFileSync(f, 'utf8'));
} else {
  main().catch((e) => { console.error(e); process.exit(1); });
}
