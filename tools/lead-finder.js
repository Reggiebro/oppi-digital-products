#!/usr/bin/env node
/**
 * lead-finder.js — find real buying-intent threads, score them, and draft a reply.
 *
 * WHAT IT DOES
 *   Searches recent GitHub issues/discussions for people actively asking for
 *   Notion CRM setups, freelance client-ops prompts, content repurposing
 *   workflows, or MCP integrations. Scores each hit, attaches the matching free
 *   sample, and writes a review queue with a ready-to-edit draft.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *   It does not post. GitHub's Acceptable Use Policies prohibit unsolicited
 *   promotion on other people's issues, and comment-blasting is the single
 *   fastest way to get the whole account limited. Drafts are queued for a human
 *   to read the thread, judge relevance, and post one tailored reply.
 *
 * USAGE
 *   node tools/lead-finder.js                     # search + write queue for today
 *   node tools/lead-finder.js --days 7 --min-score 4
 *   node tools/lead-finder.js --show             # print today's queue
 *   node tools/lead-finder.js --export-commands  # emit gh commands to review/copy
 *
 * OUTPUT
 *   leads/YYYY-MM-DD/queue.json     structured candidates + drafts
 *   leads/YYYY-MM-DD/review.md      human-readable review sheet
 *   leads/YYYY-MM-DD/commands.sh    one `gh issue comment` line per approved draft
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'leads');
const DAY = new Date().toISOString().slice(0, 10);

const arg = (name, def) => {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  const v = parseInt(process.argv[i + 1], 10);
  return Number.isFinite(v) ? v : def;
};

const DAYS = arg('--days', 14);
const MIN_SCORE = arg('--min-score', 3);
const PER_QUERY = arg('--per-query', 12);
const MAX_CANDIDATES = arg('--max', 25);

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
    ],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to)/i,
    match: /notion\s+(template|crm|database|workspace|setup|dashboard)|crm\s+(template|for freelancers)|client\s+(management|pipeline|tracking)\s+(in\s+)?notion/i,
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
    ],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to)/i,
    match: /(prompt|prompts)\s+(pack|library|collection|for\s+(freelanc|client|proposal|onboarding))|(freelance|client)\s+(proposal|onboarding|scope|delivery)\s+prompt/i,
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
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to)/i,
    match: /repurpos(e|ing)|turn\s+(one|a)\s+(piece|video|podcast|blog|article)\s+into/i,
  },
  {
    id: 'three-pack-bundle',
    name: 'All-3 bundle',
    sample: 'previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md',
    anchor: 'product-bundle',
    queries: [
      '"mcp server" ecommerce',
      '"mcp server" "digital products"',
      '"model context protocol" payment agent',
    ],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to)/i,
    match: /mcp\s+server\s+(for|that)|model\s+context\s+protocol\s+(server|integration|tool)/i,
  },
];

const SKIP_REPOS = new Set(['Reggiebro/oppi-digital-products']);
const SKIP_TITLE = /(awesome|curated list|weekly|digest|newsletter|roundup|hiring|job|bounty|for sale|^spec\b|^rfc\b|^research:|^\[collaborators\]|roadmap|changelog|candidates?\b|^daily\b|^ideas\b|use-case inventory|^recommend:|^show (hn|ih)|^launch|tool list|handoff|^submit|submission|^implement|^build\b|^proposal|^intake|migration)/i;

// A real ask is short and near the top. Digest/dump issues bury a keyword in 10k chars.
const MAX_BODY = 4000;

/* ---------------- github ---------------- */

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * GitHub's search endpoint has a separate, aggressive secondary limit.
 * Space calls out and back off once on a 403 instead of hammering.
 */
function search(q, attempt = 1) {
  // Best-match ranking beats newest-first: newest is dominated by generated dumps.
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
    console.error(`  ! search failed: ${q} — ${msg}`);
    return [];
  }
}

/**
 * GitHub Discussions search (GraphQL). Second source: founders ask questions here
 * far more often than in issue trackers, which are mostly maintainer tickets.
 */
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
  return (item.repository_url || '').replace('https://api.github.com/repos/', '');
}

/* ---------------- scoring ---------------- */

function scoreItem(item, product) {
  const text = `${item.title}\n${item.body || ''}`;
  let score = 0;
  const why = [];

  // Hard gate 1: humans only.
  if (item.user && (item.user.type === 'Bot' || /\[bot\]$|-bot$/i.test(item.user.login || ''))) {
    return { score: -99, why: ['bot author'] };
  }
  // Hard gate 2: not a dump. Long bodies are almost always generated lists.
  if ((item.body || '').length > MAX_BODY) return { score: -99, why: ['body too long (list/dump)'] };

  // Hard gate 3: must look like a question AND mention the actual thing we sell.
  // Keyword-only collisions are what turn a lead finder into a spam cannon.
  if (!product.need.test(text)) return { score: -99, why: ['no explicit ask'] };
  if (!product.match.test(text)) return { score: -99, why: ['product phrase absent'] };
  score += 3; why.push('explicit ask + product phrase');

  const comments = item.comments || 0;
  if (comments >= 1 && comments <= 8) { score += 1; why.push('conversation, still open question'); }
  if (comments > 20) { score -= 2; why.push('crowded thread'); }

  const ageDays = (Date.now() - new Date(item.created_at).getTime()) / 86400000;
  if (ageDays <= 3) { score += 2; why.push('fresh'); }
  else if (ageDays <= 10) { score += 1; why.push('recent'); }

  if (/(paid|budget|hire|buy|price|pricing|cost)/i.test(text)) { score += 1; why.push('money signal'); }
  if (!item.body || item.body.length < 40) { score -= 2; why.push('thin body'); }
  if (/\[x\]|closed|resolved/i.test(text)) { score -= 1; }
  if (item.pull_request) { score -= 3; why.push('is a PR'); }

  return { score, why };
}

/* ---------------- drafting ---------------- */

function draft(item, product) {
  const title = item.title.replace(/\s+/g, ' ').trim().slice(0, 90);
  const sampleUrl = `https://github.com/Reggiebro/oppi-digital-products/blob/master/${product.sample}`;
  const storeUrl = `https://reggiebro.github.io/oppi-digital-products/#${product.anchor}`;

  return [
    `> Re: "${title}"`,
    '',
    `Disclosure: I built the pack linked below, so treat this as a biased suggestion.`,
    '',
    `The part of your question that usually decides this is not the template itself but whether the follow-up state is explicit — which record owns "next action", and what makes it surface without you remembering.`,
    '',
    `I published the actual database blueprint I use for that, free and with no signup: ${sampleUrl}`,
    '',
    `It is the Leads & Clients property list plus the Pipeline and Follow-ups-Due views — you can copy the structure into your own workspace and ignore the paid part entirely.`,
    '',
    `If it helps and you want the rest (projects, invoices, dashboard formulas), that is here: ${storeUrl}`,
    '',
    `Either way: post your current schema and I will point at the specific view that is probably missing.`,
  ].join('\n');
}

/* ---------------- main ---------------- */

function main() {
  const since = new Date(Date.now() - DAYS * 86400000).toISOString().slice(0, 10);
  const seen = new Map();
  const errors = [];

  console.log(`oppi lead finder · last ${DAYS}d · min score ${MIN_SCORE}`);

  for (const product of PRODUCTS) {
    for (const base of product.queries) {
      const q = `${base} state:open is:issue created:>${since} -repo:Reggiebro/oppi-digital-products`;
      const items = search(q);
      console.log(`  issues "${base}" -> ${items.length}`);
      sleep(6000);

      // Discussions: one query per product (first query only) to keep API use low.
      if (base === product.queries[0]) {
        const dq = `${base} created:>${since}`;
        const disc = searchDiscussions(dq);
        console.log(`  discussions "${base}" -> ${disc.length}`);
        for (const item of disc) items.push(item);
        sleep(4000);
      }
      for (const item of items) {
        const repo = repoOf(item);
        if (!repo || SKIP_REPOS.has(repo)) continue;
        if (SKIP_TITLE.test(item.title)) continue;
        const key = `${repo}#${item.number}`;
        const { score, why } = scoreItem(item, product);
        const prev = seen.get(key);
        if (prev && prev.score >= score) continue;
        seen.set(key, {
          key, repo, number: item.number, title: item.title,
          url: item.html_url, author: item.user && item.user.login,
          comments: item.comments, created_at: item.created_at,
          product: product.id, productName: product.name,
          score, why,
          draft: draft(item, product),
        });
      }
    }
  }

  const candidates = [...seen.values()]
    .filter((c) => c.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATES);

  const dir = path.join(OUT_ROOT, DAY);
  fs.mkdirSync(path.join(dir, 'drafts'), { recursive: true });
  const slug = (k) => k.replace(/[^a-zA-Z0-9._-]/g, '-');
  for (const c of candidates) {
    c.draftFile = `drafts/${slug(c.key)}.md`;
    fs.writeFileSync(path.join(dir, c.draftFile), c.draft);
  }

  fs.writeFileSync(path.join(dir, 'queue.json'), JSON.stringify({
    generated_at: new Date().toISOString(),
    days: DAYS,
    min_score: MIN_SCORE,
    note: 'Drafts only. Read each thread before posting; GitHub forbids unsolicited promotion.',
    candidates,
  }, null, 2) + '\n');

  const md = [
    `# Lead queue — ${DAY}`,
    '',
    `Generated ${new Date().toISOString()} · last ${DAYS} days · score >= ${MIN_SCORE}`,
    '',
    `**Read the thread before posting.** These are other people's issues. Answer the question first; the link is secondary and sometimes should be omitted entirely. Never post the same text twice.`,
    '',
    `| # | Repo | Issue | Product fit | Score | Comments |`,
    `|---:|---|---|---|---:|---:|`,
    ...(candidates.length === 0 ? [
      '**Zero qualified leads this run.** That is a valid result, not a failure:',
      'the gate requires (a) a human author, (b) an explicit ask phrase, and',
      '(c) a product-specific phrase, in a body under 4,000 characters.',
      'GitHub issue trackers mostly hold maintainer tickets and bot digests, not buyers.',
      'Do not lower the gate to manufacture volume — that is how the account gets limited.',
      '',
    ] : []),
    ...candidates.map((c, i) =>
      `| ${i + 1} | ${c.repo} | [#${c.number}](${c.url}) ${c.title.replace(/\|/g, '/').slice(0, 70)} | ${c.productName} | ${c.score} | ${c.comments} |`),
    '',
    ...candidates.flatMap((c, i) => [
      `---`,
      '',
      `## ${i + 1}. ${c.repo}#${c.number} — ${c.title}`,
      '',
      `- URL: ${c.url}`,
      `- Opened by: @${c.author} · ${c.created_at.slice(0, 10)} · ${c.comments} comments`,
      `- Why it scored: ${c.why.join(', ') || 'keyword match'}`,
      `- Product fit: ${c.productName}`,
      '',
      '**Draft (edit before use):**',
      '',
      '```markdown',
      c.draft,
      '```',
      '',
    ]),
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'review.md'), md);

  const cmds = [
    '#!/usr/bin/env bash',
    `# ${DAY} lead reply commands — generated, NOT executed.`,
    '# Read the thread first, edit the draft file, then run one line at a time.',
    '# Requires: gh auth with repo scope. Never paste the same comment twice.',
    '',
    ...candidates.map((c) => [
      `# ${c.repo}#${c.number} — ${c.title.replace(/\n/g, ' ').slice(0, 80)}`,
      `# gh issue comment ${c.number} -R ${c.repo} --body-file ${c.draftFile}`,
      '',
    ].join('\n')),
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'commands.sh'), cmds, { mode: 0o755 });

  console.log(`\ncandidates >= ${MIN_SCORE}: ${candidates.length}`);
  console.log(`queue:  ${path.join(dir, 'queue.json')}`);
  console.log(`review: ${path.join(dir, 'review.md')}`);
  if (errors.length) console.log(`errors: ${errors.length}`);
  console.log('\nDrafts only. Posting is manual by design — see review.md banner.');
}

if (process.argv.includes('--show')) {
  const f = path.join(OUT_ROOT, DAY, 'review.md');
  if (!fs.existsSync(f)) { console.error('no queue for today; run without --show first'); process.exit(1); }
  process.stdout.write(fs.readFileSync(f, 'utf8'));
} else {
  main();
}
