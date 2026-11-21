#!/usr/bin/env node
/**
 * lead-finder.js — find real buying-intent threads, score them, and draft a reply.
 *
 * WHAT IT DOES
 *   Searches recent GitHub issues/discussions, Hacker News stories/comments
 *   (Algolia), Stack Exchange, and Dev.to tags for freelancers and AI builders
 *   actively asking for Notion CRM setups, client-delivery workflows, content
 *   repurposing, or MCP prompt packs. Scores each hit, attaches the matching
 *   free sample, and writes a value-first reply draft for human review.
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
const GIST_SAMPLE = 'https://gist.github.com/Reggiebro/85122464c52cc24198ce7c1ef1828636';
const WALLET_SOL = '2LAnF7EeCeGSeHn1Pvu8onnX9CiHAjJwAHBE1pXdYKbp'; // USDC/SOL on Solana
const WALLET_EVM = '0xE4BECfd60D9917946292E0d535081Dd005117069'; // USDC/ETH on Base/EVM

// Zero-auth, free sources only. Broad "ask" signal; product match does the
// qualification, so a freelancer describing a messy workflow is not discarded
// just because they did not write one exact phrase.
const ASK_RE = /(looking for|searching for|in search of|need(?:ing)?\s+(?:a|an|some|help|advice|recommendations?|templates?|tools?|workflow|system)|want(?:ing)?\s+(?:a|an|to)|trying to\s+(?:find|build|set up|automate|figure out)|recommend(?:ations?|\s+me|\s+a|\s+any)?|suggest(?:ions?|\s+me)?|any(?:one)?\s+(?:know|using|have|tried|recommend)|what\s+(?:do|would)\s+you\s+(?:use|recommend)|how\s+(?:do|can|should)\s+(?:i|we|you)|best\s+(?:way|tool|template|app|setup|workflow)|where\s+(?:can|do)\s+i\s+(?:find|get)|is there\s+(?:a|an|any)|alternatives?\s+to|help\s+(?:me|with)|advice|struggl|drown|overwhelm|chaos|messy|manual(?:ly)?|waste\s+(?:so much\s+)?time|set\s?up\s+(?:a|my|our)|manag(?:e|ing)\s+(?:my|our|clients?)|track(?:ing)?\s+(?:my|our|clients?|leads?)|template\s+for|workflow\s+for|system\s+for|tool\s+for|automat(?:e|ing)|repurpos(?:e|ing)|prompt\s+pack|looking to\s+(?:buy|pay|hire|find))/i;

const SE_SITES = ['freelancing', 'softwarerecs', 'webapps', 'projectmanagement', 'stackoverflow', 'video'];
const DEV_DISCOVERY_TAGS = ['discuss', 'help', 'ask'];

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

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#39|#x27|nbsp);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------------- product mapping ---------------- */

const PRODUCTS = [
  {
    id: 'notion-freelancer-crm-kit',
    name: 'Notion Freelancer CRM & Pipeline Kit',
    sample: 'previews/notion-crm-kit/sample-crm-database-blueprint.md',
    anchor: 'product-notion-crm',
    queries: [
      'notion crm freelancer',
      'notion template client',
      'notion client tracker',
      'notion freelance workflow',
      'notion client onboarding',
      'notion proposal tracker',
      'notion project management freelancer',
      'notion database clients',
      'notion template client management',
      'notion freelancer business',
    ],
    seQueries: [
      { site: 'freelancing', q: 'notion client management' },
      { site: 'webapps', q: 'notion crm' },
      { site: 'projectmanagement', q: 'notion freelancer' },
      { site: 'softwarerecs', q: 'notion crm template' },
    ],
    hnQueries: [
      'Notion CRM freelancer',
      'Notion client tracker',
      'Notion template freelance',
      'Notion client onboarding',
      'Notion freelance workflow',
    ],
    hnCommentQueries: ['"notion crm"', '"notion template" freelance', '"client tracker" notion', '"notion" freelancer'],
    devTags: ['notion', 'freelancing', 'productivity'],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to)/i,
    match: /notion[\s\S]{0,160}(crm|client|freelanc|pipeline|tracker|proposal|onboard|project|template|database)|(freelanc|crm|client\s+(management|tracker|pipeline|onboarding)|proposal|onboarding)[\s\S]{0,160}notion/i,
  },
  {
    id: 'freelance-delivery-prompt-pack',
    name: 'Freelance Delivery Prompt Pack',
    sample: 'previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md',
    anchor: 'product-prompt-pack',
    queries: [
      'freelancer prompt pack',
      'client onboarding prompts',
      'proposal prompts chatgpt',
      'client delivery workflow prompt',
      'prompt template client updates',
      'AI prompts freelance business',
      'mcp prompt pack',
      'mcp prompt library',
      'client delivery workflow freelancer',
      'client onboarding workflow freelancer',
      'freelance proposal template',
      'freelance scope of work template',
      'client handoff template freelancer',
      'how to charge freelance clients',
    ],
    seQueries: [
      { site: 'freelancing', q: 'client proposal template' },
      { site: 'freelancing', q: 'client onboarding' },
      { site: 'softwarerecs', q: 'ai prompt manager' },
      { site: 'pm', q: 'client delivery workflow' },
    ],
    hnQueries: [
      'freelance AI prompt workflow',
      'ChatGPT prompts for freelancers',
      'client proposal prompts AI',
      'freelance client delivery workflow',
      'client onboarding freelance',
      'how to charge freelance clients AI',
      'freelance pricing scope',
      'MCP prompt pack',
    ],
    hnCommentQueries: ['"prompt pack"', '"prompt library" freelance', '"client onboarding" freelance', '"client delivery" freelance', '"how to charge" clients freelance'],
    devTags: ['ai', 'freelancing', 'freelance', 'promptengineering', 'chatgpt', 'productivity'],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to|workflow for)/i,
    match: /prompts?[\s\S]{0,160}(pack|library|collection|workflow|system|template|freelanc|client|proposal|onboard|delivery|scope|mcp|agent)|(freelanc|client|proposal|onboard|delivery|scope)[\s\S]{0,160}prompts?|(?:freelanc|consultant|agency|client)[\s\S]{0,160}(delivery workflow|onboard(?:ing)? (?:workflow|process|template|checklist)|proposal (?:template|workflow)|scope (?:of work|creep)|client handoff|how (?:to|do) (?:i|you) charg|pric(?:e|ing) (?:clients|projects|work))/i,
  },
  {
    id: 'ai-content-repurpose-pack',
    name: 'AI Content Repurpose Pack',
    sample: 'previews/content-repurpose-pack/sample-core-extraction.md',
    anchor: 'product-repurpose-pack',
    queries: [
      'repurpose content workflow',
      'content repurposing automation',
      'turn podcast into posts',
      'repurpose blog into social',
      'content atomization workflow',
      'one video many posts',
      'repurpose webinar content',
      'content recycling AI',
    ],
    seQueries: [
      { site: 'webapps', q: 'repurpose content' },
      { site: 'softwarerecs', q: 'content repurposing' },
      { site: 'video', q: 'repurpose video' },
    ],
    hnQueries: ['content repurposing workflow AI', 'repurpose podcast into posts', 'content atomization', 'repurpose blog content'],
    hnCommentQueries: ['"content repurposing"', '"repurpose content"', '"repurpose" podcast'],
    devTags: ['content', 'automation', 'ai', 'marketing'],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to)/i,
    match: /repurpos(?:e|ing|ed)|content\s+(recycling|multiplication|atomization)|turn(?:ing)?\s+(one|a|my)\s+(piece|video|podcast|blog|article|webinar|stream)\s+into|(podcast|video|blog|article|webinar)[\s\S]{0,100}(social|posts?|threads?|newsletter|shorts|clips)/i,
  },
  {
    id: 'three-pack-bundle',
    name: 'MCP Prompt Pack + All-3 bundle',
    sample: 'previews/freelance-prompt-pack/sample-lead-qualification-scorecard.md',
    anchor: 'product-bundle',
    queries: [
      'mcp prompt pack',
      'mcp prompts',
      'model context protocol prompts',
      'mcp prompt library',
      'mcp prompt templates',
      'claude mcp prompts',
      'agent skill pack',
      'ai skill pack',
      'mcp server ecommerce',
      'mcp server digital products',
      'mcp server payments',
      'mcp tool payment',
    ],
    seQueries: [
      { site: 'softwarerecs', q: 'mcp server' },
      { site: 'stackoverflow', q: 'mcp prompt' },
    ],
    hnQueries: [
      'MCP prompt pack',
      'MCP prompt library',
      'MCP server ecommerce',
      'MCP tool selling digital products',
      'MCP commerce checkout',
    ],
    hnCommentQueries: ['"mcp" "prompts"', '"mcp server" commerce', '"model context protocol" prompts'],
    devTags: ['mcp', 'ai', 'agents', 'opensource'],
    need: /(looking for|recommend|any(one)? (know|using|have|tried)|suggestions?|how (do|can) (i|we|you)|best (way|tool|template|app)|need (a|an|help)|where can i find|is there (a|an)|alternative to|build(ing)?)/i,
    match: /mcp[\s\S]{0,160}(prompt|skill|workflow|template|commerce|payment|checkout|digital\s+products?|sell(?:ing)?)|(prompt|skill|workflow|template|commerce|payment|checkout)[\s\S]{0,160}mcp|agent\s+(commerce|checkout|payment)|sell(?:ing)?\s+digital\s+products?/i,
  },
];

const SKIP_REPOS = new Set(['Reggiebro/oppi-digital-products']);
const SKIP_AUTHORS = new Set(['reggiebro']);
// Only skip obvious directory noise. Do NOT suppress "recommend", "proposal",
// "feature request", "build", or "add": those are often real buyer wording.
const SKIP_TITLE = /(show and tell|show hn|zero-dependency agent-commerce|awesome|curated list|weekly|digest|newsletter|roundup|hiring|job\b|bounty|for sale|^spec\b|^rfc\b|^research:|^\[collaborators\]|changelog|^daily\b|use-case inventory|^submit|submission|tool list|handoff|^introduc|^announc|migration guide|^launch)/i;

// Long issues are penalized, not hard-rejected: detailed buyer questions can be
// long, while bot dumps get buried by the penalty.
const MAX_BODY = 12000;

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

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

function orCombine(queries) {
  // GitHub search returns zero when an OR group contains quoted phrases; unquote
  // each group so multi-word terms become an AND within that OR branch.
  return '(' + queries.map((q) => `(${q.replace(/"/g, '')})`).join(' OR ') + ')';
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
  if (item.isSE) return `${item.seSite}.stackexchange.com`;
  if (item.isDev) return 'dev.to';
  return (item.repository_url || '').replace('https://api.github.com/repos/', '');
}

/* ---------------- scoring ---------------- */

function scoreItem(item, product) {
  const text = `${item.title}\n${item.body || ''}`;
  const bodyLen = (item.body || '').length;
  let score = 0;
  const why = [];

  if (item.user && (item.user.type === 'Bot' || /\[bot\]$|-bot$/i.test(item.user.login || ''))) {
    return { score: -99, why: ['bot author'] };
  }
  if (item.user && SKIP_AUTHORS.has(String(item.user.login || '').toLowerCase())) {
    return { score: -99, why: ['own post'] };
  }
  // Hard promo only. "I built my own CRM and it is a mess" is a valid buyer
  // signal, so do not reject first-person builder language by itself.
  if (/(\[for hire\]|\[hiring\]|check out my|gumroad|buy my|selling my|promo code|affiliate link|my (product|template|pack|tool) is (now )?(live|available|for sale)|launch(ed|ing) my (product|template|pack|tool))/i.test(text)) {
    return { score: -99, why: ['seller/self-promo'] };
  }

  if (!ASK_RE.test(text)) return { score: -99, why: ['no ask/pain signal'] };
  if (!product.match.test(text)) return { score: -99, why: ['product phrase absent'] };
  score += 3; why.push('ask/pain + product phrase');

  if (item.isHN) score += 1, why.push(item.isHNComment ? 'HN comment' : 'HN story');
  if (item.isSE) { score += 1; why.push('Stack Exchange question'); }
  if (item.isDev) {
    score += 1; why.push('Dev.to article');
    const tags = (item.devTags || []).map((t) => String(t).toLowerCase());
    if (tags.some((t) => t === 'help' || t === 'ask')) { score += 1; why.push('Dev.to ask/help tag'); }
    if (tags.includes('showdev')) { score -= 3; why.push('Dev.to showdev promo'); }
  }

  if (/\?/.test(text)) { score += 1; why.push('question mark'); }
  if (/\b(i|we)\b[^.!?]{0,70}(struggl|drown|overwhelm|spend|waste|manual|hate|mess|chaos|stuck|pain)/i.test(text)) {
    score += 1; why.push('first-person pain');
  }

  const comments = item.comments || 0;
  if (comments >= 1 && comments <= 12) { score += 1; why.push('active/open conversation'); }
  if (comments > 30) { score -= 1; why.push('crowded thread'); }

  const ageDays = (Date.now() - new Date(item.created_at).getTime()) / 86400000;
  if (ageDays <= 3) { score += 2; why.push('fresh'); }
  else if (ageDays <= 10) { score += 1; why.push('recent'); }

  if (/(paid|budget|hire|buy|price|pricing|cost|looking to pay)/i.test(text)) { score += 2; why.push('money/buying signal'); }
  if (bodyLen < 30) { score -= 1; why.push('thin body'); }
  if (bodyLen > 12000) { score -= 6; why.push('very long body'); }
  else if (bodyLen > 4000) { score -= 3; why.push('long body'); }
  if (/\[x\]|closed|resolved/i.test(text)) { score -= 1; }
  if (item.pull_request) { score -= 3; why.push('is a PR'); }

  return { score, why };
}

/* ---------------- drafting ---------------- */

function playbook(productId) {
  if (productId === 'notion-freelancer-crm-kit') {
    return {
      context: 'a freelance client pipeline in Notion',
      steps: [
        'Create one Clients database with Stage (Lead / Proposal / Active / Delivered), Next action, Next follow-up date, and a relation to Projects.',
        'Create one Projects database linked to Clients, with deliverable, due date, status, approval link, and a revision count.',
        'Build a Today view filtered to Next follow-up <= today OR Next action empty, so no lead or client goes stale.',
        'Put scope, exclusions, revision limit, and payment terms in a proposal template before work starts; it prevents most delivery disputes.',
      ],
      closing: 'If you share how many active clients you juggle and where it breaks (leads, onboarding, or delivery), I can suggest the exact fields and views to use.',
    };
  }
  if (productId === 'freelance-delivery-prompt-pack') {
    return {
      context: 'repeatable client-delivery prompts',
      steps: [
        'Map the lifecycle once: lead qualification -> proposal/scope -> onboarding -> delivery update -> feedback/upsell.',
        'For each stage, keep one prompt with variables for {client}, {outcome}, {constraints}, and {tone}; store the prompts in one versioned doc.',
        'Use a lead-qualification scorecard before writing proposals; it filters bad-fit clients and reduces scope creep.',
        'Save the generated proposal/update/closeout in the client project page, not in chat history, so handoff stays clean.',
      ],
      closing: 'If you tell me which stage eats the most time, I can sketch the exact prompt and variables for that one stage.',
    };
  }
  if (productId === 'ai-content-repurpose-pack') {
    return {
      context: 'a content-repurposing workflow',
      steps: [
        'Extract one canonical core from the source asset: audience, promise, 3 key points, proof/quote, and CTA.',
        'Branch from that core into channel-specific assets: LinkedIn post, X thread, newsletter section, short-video script.',
        'Keep a one-page checklist per asset: one idea, one CTA, one source link, and the channel-specific hook.',
        'Automate transcription and first-draft extraction, but review the core before generating channel copy; that is where most AI repurposing drift comes from.',
      ],
      closing: 'If you share the source format (podcast, webinar, blog) and the channels you want, I can suggest the exact extraction fields and a first-pass template.',
    };
  }
  return {
    context: 'an MCP prompt pack or agent workflow',
    steps: [
      'Treat each MCP prompt as a small tool contract: name, when to use it, inputs, expected output, and guardrails.',
      'Split seller workflows into separate steps: catalog lookup -> sample/preview -> checkout or payment instructions -> read-only verification. Do not let one prompt do all four.',
      'For client delivery, pair prompts for scope/update/closeout with MCP tools that read catalog or project status; keep write actions explicit.',
      'Version the prompt pack in git so you can diff behavior and roll back when a model or tool changes.',
    ],
    closing: 'If you share what the agent is supposed to do end-to-end, I can suggest the prompt/tool split and where to put verification.',
  };
}

function draft(item, product) {
  const p = playbook(product.id);
  const lines = [
    `Disclosure: I built the resource linked at the end, so flagging that up front.`,
    '',
    `For ${p.context}, here is the first pass I would use:`,
    '',
    ...p.steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    `Free sample / cheat sheet (no signup): ${GIST_SAMPLE}`,
    `Full kit / overview, only if useful: ${STOREFRONT}#${product.anchor}`,
    '',
    p.closing,
  ];
  return lines.join('\n');
}

/* ---------------- Hacker News (Algolia, zero-auth) ---------------- */

async function searchHN(hnQuery, sinceTs, tags = '(story,ask_hn,show_hn)') {
  const isComment = tags === 'comment';
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(hnQuery)}&tags=${encodeURIComponent(tags)}&numericFilters=created_at_i>${sinceTs}&hitsPerPage=20`;
  try {
    const j = await httpJson(url);
    return (j.hits || []).map((h) => ({
      isHN: true,
      isHNComment: isComment,
      title: h.title || h.story_title || (isComment ? 'HN comment' : '(no title)'),
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

/* ---------------- Stack Exchange (free, zero-auth) ---------------- */

async function searchSE(query, site, sinceTs) {
  const url = 'https://api.stackexchange.com/2.3/search/advanced?'
    + `order=desc&sort=creation&q=${encodeURIComponent(query)}`
    + `&site=${encodeURIComponent(site)}&filter=withbody&pagesize=10&fromdate=${sinceTs}`;
  try {
    const j = await httpJson(url);
    return (j.items || []).map((it) => ({
      isSE: true,
      seSite: site,
      title: it.title || '(no title)',
      body: stripHtml(it.body),
      html_url: it.link,
      created_at: new Date((it.creation_date || 0) * 1000).toISOString(),
      comments: it.answer_count || 0,
      user: { login: (it.owner && it.owner.display_name) || 'unknown', type: 'User' },
      repository_url: `https://${site}.stackexchange.com`,
      number: it.question_id,
    }));
  } catch (e) {
    console.error(`  ! SE search failed: ${site}/${query} — ${String(e.message).split('\n')[0]}`);
    return [];
  }
}

/* ---------------- Dev.to (free, zero-auth) ---------------- */

async function searchDevTo(tag, sinceTs, perPage = 30) {
  const url = `https://dev.to/api/articles/latest?tag=${encodeURIComponent(tag)}&per_page=${perPage}`;
  try {
    const j = await httpJson(url);
    const items = Array.isArray(j) ? j : [];
    return items
      .filter((a) => new Date(a.published_at || 0).getTime() >= sinceTs * 1000)
      .map((a) => ({
        isDev: true,
        title: a.title || '(no title)',
        body: `${a.description || ''}\n${(a.tag_list || []).join(' ')}`.trim(),
        html_url: a.url || a.canonical_url,
        created_at: a.published_at,
        comments: a.comments_count || 0,
        user: { login: (a.user && a.user.username) || 'unknown', type: 'User' },
        repository_url: 'https://dev.to',
        number: a.id,
        devTags: a.tag_list || [],
      }));
  } catch (e) {
    console.error(`  ! Dev.to search failed: ${tag} — ${String(e.message).split('\n')[0]}`);
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

  const ingest = (item, product, source, keyPrefix) => {
    const repo = repoOf(item);
    if (!repo || SKIP_REPOS.has(repo)) return;
    if (SKIP_TITLE.test(item.title || '')) return;
    const key = keyPrefix || item.isDiscussion
      ? `disc:${repo}:${item.html_url}`
      : `${source}:${repo}:${item.number || item.html_url}`;
    const { score, why } = scoreItem(item, product);
    const prev = seen.get(key);
    if (prev && prev.score >= score) return;
    seen.set(key, {
      key, repo, number: item.number || '', title: item.title || '',
      url: item.html_url || item.hn_url, author: item.user && item.user.login,
      comments: item.comments || 0, created_at: item.created_at,
      source,
      product: product.id, productName: product.name,
      score, why, draft: '',
      isHN: !!item.isHN, isHNComment: !!item.isHNComment, isSE: !!item.isSE, isDev: !!item.isDev,
      devTags: item.devTags || [],
    });
  };

  // 1) GitHub: OR-combined issue + discussion queries, chunked to stay under
  // GitHub's 256-character search limit without losing any query variants.
  for (const product of PRODUCTS) {
    const issues = [];
    const disc = [];
    for (const group of chunk(product.queries, 4)) {
      const combined = orCombine(group);
      const iq = `${combined} state:open is:issue created:>${since} -repo:Reggiebro/oppi-digital-products`;
      issues.push(...search(iq));
      ghCalls++;
      const dq = `${combined} created:>${since}`;
      disc.push(...searchDiscussions(dq));
      ghCalls++;
    }
    console.log(`  GH issues [${product.id}] -> ${issues.length}`);
    console.log(`  GH discussions [${product.id}] -> ${disc.length}`);
    for (const item of issues) ingest(item, product, 'github-issue');
    for (const item of disc) ingest(item, product, 'github-discussion', `disc:${repoOf(item)}:${item.html_url}`);
  }
  console.log(`  GitHub API calls: ${ghCalls} (4s throttle between calls)`);

  // 2) Hacker News via Algolia (zero-auth): stories + comments
  for (const product of PRODUCTS) {
    for (const hq of (product.hnQueries || [])) {
      const hits = await searchHN(hq, sinceTs, '(story,ask_hn,show_hn)');
      console.log(`  HN story "${hq}" -> ${hits.length}`);
      for (const item of hits) ingest(item, product, 'hackernews-story', `hn:${item.number}`);
    }
    for (const hq of (product.hnCommentQueries || (product.hnQueries || []).slice(0, 2))) {
      const hits = await searchHN(hq, sinceTs, 'comment');
      console.log(`  HN comment "${hq}" -> ${hits.length}`);
      for (const item of hits) ingest(item, product, 'hackernews-comment', `hnc:${item.number}`);
    }
  }

  // 3) Stack Exchange (free, quota-limited, zero-auth)
  for (const product of PRODUCTS) {
    for (const sq of (product.seQueries || [])) {
      const hits = await searchSE(sq.q, sq.site, sinceTs);
      console.log(`  SE ${sq.site} "${sq.q}" -> ${hits.length}`);
      for (const item of hits) ingest(item, product, `stackexchange:${sq.site}`, `se:${sq.site}:${item.number}`);
    }
  }

  // 4) Dev.to tags (free, zero-auth)
  const devTags = new Set(DEV_DISCOVERY_TAGS);
  for (const product of PRODUCTS) for (const t of (product.devTags || [])) devTags.add(t);
  for (const tag of devTags) {
    const hits = await searchDevTo(tag, sinceTs, 30);
    console.log(`  Dev.to tag "${tag}" -> ${hits.length}`);
    for (const item of hits) {
      for (const product of PRODUCTS) ingest(item, product, `dev.to:${tag}`, `dev:${item.number}`);
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

  const audit = {
    raw_total: seen.size,
    qualified: candidates.length,
    reasons: {},
    by_source: {},
  };
  for (const c of seen.values()) {
    if (c.score >= MIN_SCORE) continue;
    const r = (c.why && c.why[0]) || 'low score';
    audit.reasons[r] = (audit.reasons[r] || 0) + 1;
    const s = c.source || 'unknown';
    audit.by_source[s] = (audit.by_source[s] || 0) + 1;
  }
  audit.top_reasons = Object.entries(audit.reasons).sort((a,b)=>b[1]-a[1]).slice(0,12);

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
    sample_gist: GIST_SAMPLE,
    wallets: { solana_usdc: WALLET_SOL, base_evm_usdc: WALLET_EVM },
    audit,
    note: 'Drafts only. Read each thread before posting; tailor replies and avoid unsolicited spam.',
    candidates,
  }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'audit.json'), JSON.stringify(audit, null, 2) + '\n');

  const auditMd = [
    `## Filter audit`,
    '',
    `- Raw items scored: ${audit.raw_total}`,
    `- Qualified (score >= ${MIN_SCORE}): ${audit.qualified}`,
    `- Rejected: ${audit.raw_total - audit.qualified}`,
    `- Previous zero run (2026-11-20, pre-relax): 142 raw, 58 body too long, 43 no explicit ask, 17 seller/self-promo, 13 product phrase absent, 11 bot authors. Filters were tightened and Dev.to/HN comments were not searched.`,
    '',
    ...audit.top_reasons.map(([r,n]) => `- ${n} ${r}`),
    '',
  ];

  const md = [
    `# Lead queue — ${DAY}`,
    '',
    `Generated ${new Date().toISOString()} · last ${DAYS} days · score >= ${MIN_SCORE}`,
    '',
    `**Read the thread before posting.** Answer the question first with something genuinely useful; include the free sample gist/storefront only where relevant. Never post the same text twice or spam.`,
    '',
    ...auditMd,
    `| # | Source | Thread | Product fit | Score | Comments |`,
    `|---:|---|---|---|---:|---:|`,
    ...(candidates.length === 0 ? [
      `**Zero qualified leads this run.** Searched GitHub issues/discussions, HN stories/comments, Stack Exchange, and Dev.to. See filter audit above.`,
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
      `- Free sample: ${GIST_SAMPLE}`,
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
      (c.isHN || c.isSE) ? `# reply manually at ${c.url} using ${c.draftFile}` : `# gh issue comment ${c.number} -R ${c.repo} --body-file ${c.draftFile}`,
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
