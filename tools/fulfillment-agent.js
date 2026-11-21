#!/usr/bin/env node
/**
 * fulfillment-agent.js — autonomous purchase-request triage for our OWN repo.
 *
 * Why only our repo: GitHub's Acceptable Use Policies forbid posting unsolicited
 * promotion on other people's issues. This agent stays inside
 * Reggiebro/oppi-digital-products, where every comment is a reply to a buyer who
 * opened a purchase request. That is the one place automation is both useful and allowed.
 *
 * What it does, on each pass:
 *   1. Lists open issues that look like purchase requests (tx hash present).
 *   2. Extracts tx hash + network + product from title/body.
 *   3. Calls the MCP server's read-only `verify_payment` tool for on-chain status.
 *   4. VERIFIED  -> comment delivery next steps once, label `payment-verified`.
 *      UNVERIFIED-> comment a short remediation checklist once, label `awaiting-payment`.
 *   5. Never delivers, never asks for keys, never touches wallets.
 *
 * Usage:
 *   node tools/fulfillment-agent.js                # dry run (default)
 *   node tools/fulfillment-agent.js --apply        # post comments + labels
 *   node tools/fulfillment-agent.js --apply --limit 5
 */
'use strict';

const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cron runs with a minimal PATH (usually /usr/bin:/bin), so `gh` installed in
// /usr/local/bin is invisible there. Resolve it explicitly instead of relying
// on PATH inheritance.
const GH = (() => {
  const candidates = [process.env.GH_BIN, '/usr/local/bin/gh', '/usr/bin/gh', '/opt/homebrew/bin/gh'];
  for (const c of candidates) {
    if (!c) continue;
    try { if (fs.existsSync(c)) return c; } catch (_) { /* ignore */ }
  }
  return 'gh';
})();

const REPO = process.env.OPPI_REPO || 'Reggiebro/oppi-digital-products';
const APPLY = process.argv.includes('--apply');
const LIMIT = (() => {
  const i = process.argv.indexOf('--limit');
  const v = i !== -1 ? parseInt(process.argv[i + 1], 10) : 20;
  return Number.isFinite(v) && v > 0 ? v : 20;
})();
const MCP = path.join(__dirname, '..', 'mcp-server', 'index.js');

/* ---------------- helpers ---------------- */

function gh(args, input) {
  return execFileSync(GH, args, {
    encoding: 'utf8',
    input,
    maxBuffer: 20 * 1024 * 1024,
  });
}

function ghJson(args) {
  return JSON.parse(gh(args));
}

function log(...a) { console.log(...a); }

// Team/agency deals have negotiated pricing and seat terms; the automatic
// $5 USDC/$12 USDC delivery reply would quote the wrong thing. Leave them for manual triage.
const B2B_RE = /\b(b2b|team license|agency license|per seat|seats?|procurement|purchase order|quotation)\b/i;

const PRODUCTS = [
  { id: 'three-pack-bundle', re: /bundle|all[\s-]?3|all three|everything/i, label: 'the all-3 bundle' },
  { id: 'freelance-delivery-prompt-pack', re: /prompt pack|freelance (delivery )?pack|client[- ]ops|delivery prompts/i, label: 'the Freelance Delivery Prompt Pack' },
  { id: 'notion-freelancer-crm-kit', re: /notion|crm|pipeline kit/i, label: 'the Notion Freelancer CRM & Pipeline Kit' },
  { id: 'ai-content-repurpose-pack', re: /repurpose|content pack|repurposing/i, label: 'the AI Content Repurpose Pack' },
];

const NETWORKS = [
  { id: 'solana', re: /\bsol(ana)?\b|spl/i },
  { id: 'base', re: /\bbase\b/i },
  { id: 'ethereum', re: /\beth(ereum)?\b|erc20/i },
  { id: 'polygon', re: /\bpolygon\b|\bmatic\b|\bpol\b/i },
  { id: 'bitcoin', re: /\bbtc\b|bitcoin/i },
  { id: 'tron', re: /\btron\b|trc20/i },
  { id: 'litecoin', re: /\bltc\b|litecoin/i },
  { id: 'dogecoin', re: /\bdoge\b|dogecoin/i },
];

function extractNetwork(text) {
  for (const n of NETWORKS) if (n.re.test(text)) return n.id;
  return null;
}

function extractProduct(text) {
  for (const p of PRODUCTS) if (p.re.test(text)) return p;
  return null;
}

function extractTx(text) {
  // EVM / BTC / TRON style 0x-prefixed or bare 64-hex
  let m = text.match(/0x[a-fA-F0-9]{64}/);
  if (m) return m[0];
  // Solana signature: base58, 80-90 chars
  m = text.match(/\b[1-9A-HJ-NP-Za-km-z]{80,90}\b/);
  if (m) return m[0];
  // bare 64 hex
  m = text.match(/\b[a-fA-F0-9]{64}\b/);
  if (m) return m[0];
  return null;
}

/* ---------------- MCP call ---------------- */

function callTool(name, args, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [MCP], { stdio: ['pipe', 'pipe', 'pipe'] });
    let buf = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) { settled = true; child.kill('SIGKILL'); reject(new Error('mcp timeout')); }
    }, timeoutMs);

    const send = (obj) => child.stdin.write(JSON.stringify(obj) + '\n');

    child.stdout.on('data', (d) => {
      buf += d.toString();
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        let msg;
        try { msg = JSON.parse(line); } catch { continue; }
        if (msg.id === 2) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          child.kill('SIGTERM');
          resolve(msg.result || msg.error);
        }
      }
    });
    child.stderr.on('data', () => {});
    child.on('error', (e) => { if (!settled) { settled = true; clearTimeout(timer); reject(e); } });

    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'oppi-fulfillment-agent', version: '1.0.0' } } });
    send({ jsonrpc: '2.0', method: 'notifications/initialized' });
    send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name, arguments: args } });
  });
}

function textOf(result) {
  if (!result || !result.content) return JSON.stringify(result);
  return result.content.map((c) => c.text || '').join('\n');
}

/**
 * The MCP tool returns several "positive" phrasings. Treat only those as verified;
 * anything ambiguous falls through to manual review (never auto-confirm a sale).
 */
function isVerified(verdict) {
  const v = String(verdict);
  if (/NOT FOUND|NO transfer to our wallet|TX found but|check hash|check network|MANUAL VERIFICATION|Unknown network|Required: tx_hash/i.test(v)) return false;
  return /^VERIFIED on |^FOUND payment address in |^FOUND our TRON address in /m.test(v.trim());
}

/* ---------------- labels ---------------- */

const LABELS = [
  { name: 'purchase-request', color: '0E8A16', description: 'Buyer opened a purchase/delivery request' },
  { name: 'awaiting-payment', color: 'FBCA04', description: 'Purchase request received; payment not yet verified on-chain' },
  { name: 'payment-verified', color: '1D76DB', description: 'Payment verified on-chain; delivery pending' },
];

function ensureLabels() {
  for (const l of LABELS) {
    try {
      gh(['label', 'create', l.name, '-R', REPO, '--color', l.color, '--description', l.description, '--force']);
    } catch (e) {
      log(`  ! could not create label ${l.name}: ${e.message.split('\n')[0]}`);
    }
  }
}

/* ---------------- main ---------------- */

async function main() {
  log(`oppi fulfillment agent · repo=${REPO} · mode=${APPLY ? 'APPLY' : 'DRY RUN'}`);

  const issues = ghJson([
    'issue', 'list', '-R', REPO, '--state', 'open', '--limit', String(LIMIT),
    '--json', 'number,title,body,labels,author,url,comments',
  ]).filter((i) => !(i.labels || []).some((l) => ['payment-verified', 'delivered'].includes(l.name)));

  log(`open issues scanned: ${issues.length}`);

  let acted = 0;
  for (const issue of issues) {
    const text = `${issue.title}\n${issue.body || ''}`;
    if (B2B_RE.test(text)) {
      log(`  - #${issue.number} looks like a team/agency deal — left for manual triage`);
      continue;
    }
    const tx = extractTx(text);
    if (!tx) continue; // not a purchase request; leave it alone

    const product = extractProduct(text);
    const network = extractNetwork(text);
    const existing = (issue.labels || []).map((l) => l.name);

    log(`\n#${issue.number} ${issue.title}`);
    log(`  tx=${tx.slice(0, 12)}… network=${network || 'unknown'} product=${product ? product.id : 'unknown'}`);

    if (!network) {
      const body = [
        'Thanks for the purchase request — I can see a transaction hash but not the network.',
        '',
        'Reply with the network you paid on (solana, base, ethereum, polygon, bitcoin, tron, litecoin, or dogecoin) and I will verify it right away.',
        '',
        `If you have not sent payment yet, the storefront has the live addresses: ${'https://reggiebro.github.io/oppi-digital-products/#pay'}`,
        '',
        '_Automated triage for a purchase request you opened. No keys are ever requested._',
      ].join('\n');
      if (APPLY && !existing.includes('awaiting-payment')) {
        gh(['issue', 'comment', String(issue.number), '-R', REPO, '--body', body]);
        gh(['issue', 'edit', String(issue.number), '-R', REPO, '--add-label', 'purchase-request,awaiting-payment']);
        log('  -> commented: missing network');
      } else {
        log('  -> would comment: missing network');
      }
      acted++;
      continue;
    }

    let verdict;
    try {
      verdict = textOf(await callTool('verify_payment', { tx_hash: tx, network }));
    } catch (e) {
      log(`  ! verification error: ${e.message}`);
      continue;
    }
    const verified = isVerified(verdict);
    log(`  verification: ${verdict.split('\n').filter(Boolean).slice(0, 3).join(' | ')}`);

    if (verified) {
      const body = [
        `Payment verified on-chain. Thank you — starting delivery for ${product ? product.label : 'your order'}.`,
        '',
        '**Next step:** I deliver manually after verification, instantly after on-chain verification. You will get the download link in this issue.',
        '',
        `- Transaction: \`${tx}\``,
        `- Network: ${network}`,
        `- Product: ${product ? product.label : 'as described in your request'}`,
        '',
        'If you need it somewhere other than this issue thread, say so here. No email required.',
        '',
        '_Automated on-chain verification and instant delivery._',
      ].join('\n');
      if (APPLY) {
        gh(['issue', 'comment', String(issue.number), '-R', REPO, '--body', body]);
        gh(['issue', 'edit', String(issue.number), '-R', REPO, '--add-label', 'payment-verified']);
        log('  -> commented: VERIFIED');
      } else {
        log('  -> would comment: VERIFIED');
      }
    } else {
      const body = [
        'I could not verify that transaction against the published oppi wallet address yet. Common causes:',
        '',
        '- The transfer is still pending or has fewer confirmations than the explorer needs.',
        '- The asset or network does not match the address (for example USDC sent on the wrong chain).',
        '- The hash is from a different wallet or a testnet transaction.',
        '',
        `Please double-check against the address table: ${'https://github.com/Reggiebro/oppi-digital-products/blob/master/PAYMENT.md'}`,
        '',
        'Reply with the explorer link if you believe it is correct and I will look manually.',
        '',
        '_Automated read-only check. This agent never asks for a seed phrase or private key._',
      ].join('\n');
      if (APPLY && !existing.includes('awaiting-payment')) {
        gh(['issue', 'comment', String(issue.number), '-R', REPO, '--body', body]);
        gh(['issue', 'edit', String(issue.number), '-R', REPO, '--add-label', 'awaiting-payment']);
        log('  -> commented: not verified');
      } else {
        log('  -> would comment: not verified');
      }
    }
    acted++;
  }

  if (APPLY) ensureLabels();
  log(`\ndone. purchase requests acted on: ${acted}`);
  if (!APPLY) log('dry run only — rerun with --apply to post.');
}

main().catch((e) => { console.error(e); process.exit(1); });
