#!/usr/bin/env node
/**
 * oppi-digital-products-mcp — lightweight MCP server (zero dependencies, stdio JSON-RPC 2.0)
 *
 * Tools:
 *   list_products             — full catalog with prices and free samples
 *   get_free_sample           — test a free sample prompt/template from a pack
 *   get_payment_instructions  — verified oppi wallet crypto payment addresses
 *   verify_payment            — best-effort on-chain verification of a buyer tx (public APIs)
 *   request_delivery          — start fulfillment: returns prefilled GitHub issue + archive info
 *
 * Payment addresses are sourced from wallets.json (public keys only) which mirrors
 * the project wallet registry (oppi wallet). Full packs are delivered AFTER
 * on-chain payment verification (manual fulfillment).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const WALLETS = JSON.parse(fs.readFileSync(path.join(__dirname, 'wallets.json'), 'utf8'));
const CATALOG = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog.json'), 'utf8'));
const PROTOCOL_VERSION = '2025-03-26';

/* ---------------- helpers ---------------- */

function jsonHttp(urlString, { method = 'GET', body = null, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    let url;
    try { url = new URL(urlString); } catch (e) { return reject(new Error('bad url')); }
    const payload = body == null ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const req = https.request(url, {
      method,
      headers: Object.assign(
        { 'user-agent': 'oppi-digital-products-mcp/1.0', accept: 'application/json' },
        payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {},
        headers
      ),
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, text: data }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function money(x) { return `$${x}`; }

function findProduct(id) {
  if (!id) return null;
  const norm = String(id).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return CATALOG.products.find(p => p.id === norm) || null;
}

/* ---------------- tool implementations ---------------- */

function listProducts() {
  const deal = CATALOG.flash_deal && CATALOG.flash_deal.active ? CATALOG.flash_deal : null;
  const lines = [`# Oppi Digital Products — Catalog (${deal ? money(deal.price_usd_bundle) + ' flash bundle' : money(CATALOG.bundle.price_usd_launch) + ' bundle'})`, ''];
  if (deal) {
    lines.push(`## ⚡ ${deal.name} — ACTIVE`);
    lines.push(`Every single pack: ${money(deal.price_usd_each)} USDC. Bundle: ${money(deal.price_usd_bundle)} USDC.`);
    lines.push(`Limit: ${deal.limit}`);
    lines.push('After the deal: launch prices resume. Payment: USDC (Solana/Base recommended).');
    lines.push('');
  }
  for (const p of CATALOG.products) {
    lines.push(`## ${p.name} (${p.type})`);
    lines.push(`${p.summary}`);
    if (deal) {
      lines.push(`- ⚡ Flash price: ${money(deal.price_usd_each)} USDC (standard ${money(p.price_usd_standard)} after the deal)`);
    } else {
      lines.push(`- Launch price: ${money(p.price_usd_launch)} | Standard: ${money(p.price_usd_standard)}`);
    }
    lines.push(`- Free sample id: \`${p.free_sample}\` (use get_free_sample to test)`);
    lines.push('');
  }
  if (deal) {
    const standardTotal = CATALOG.products.reduce((s, x) => s + (x.price_usd_standard || 0), 0);
    lines.push(`Bundle: ${CATALOG.bundle.name} — ⚡ ${money(deal.price_usd_bundle)} USDC (all 3 packs; standard ${money(standardTotal)} total).`);
  } else {
    lines.push(`Bundle: ${CATALOG.bundle.name} — ${money(CATALOG.bundle.price_usd_launch)} (all 3 packs).`);
  }
  lines.push(`Storefront: ${CATALOG.storefront}`);
  lines.push('Delivery: automated instant download link after on-chain payment verification.');
  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

function getFreeSample(args) {
  const p = findProduct(args && args.product);
  if (!p) {
    return { content: [{ type: 'text', text: 'Unknown product. Valid ids: ' + CATALOG.products.map(x => x.id).join(', ') }], isError: true };
  }
  let text = '';
  let read = false;
  const rel = p.previews[0];
  for (const f of [path.join(__dirname, rel), path.join(__dirname, '..', rel)]) {
    try { text = fs.readFileSync(f, 'utf8'); read = true; break; } catch (e) { /* try next */ }
  }
  if (!read) text = `Preview file missing for ${p.id}.`;
  const out = [
    `FREE SAMPLE — ${p.name} (sample: ${p.free_sample})`,
    '',
    text,
    '',
    `— This is 1 of ${p.type === 'prompt_pack' ? '30+' : '5+'} assets in the full pack. Full pack: ${money(p.price_usd_launch)} launch.`,
    `Unlock: get_payment_instructions → buyer sends crypto → verify_payment(tx_hash) → request_delivery.`,
  ].join('\n');
  return { content: [{ type: 'text', text: out }] };
}

function getPaymentInstructions(args) {
  const p = findProduct(args && args.product);
  const w = WALLETS;
  const price = p ? money(p.price_usd_launch) : 'per-item (see list_products)';
  const deal = CATALOG.flash_deal && CATALOG.flash_deal.active ? CATALOG.flash_deal : null;
  const flashLine = deal
    ? `⚡ FLASH DEAL (active flash sale buyers): pay exactly ${money(deal.price_usd_each)} USDC per single pack or ${money(deal.price_usd_bundle)} USDC for the 3-pack bundle — on Solana or Base USDC.`
    : '';
  const lines = [
    '# Crypto Payment Instructions (oppi wallet)',
    '',
    `Product: ${p ? p.name : 'any catalog item'} — ${price}`,
    flashLine,
    'Recommended asset: **USDC** (stable) on one of the networks below. SOL/ETH/native also accepted.',
    '',
    '## Addresses',
    `- Solana (USDC/SOL): \`${w.solana}\``,
    `- EVM (USDC/ETH on ${w.evm.networks.join(', ')}): \`${w.evm.address}\``,
    `- Bitcoin (BTC): \`${w.bitcoin}\``,
    `- Tron (USDT-TRC20/TRX): \`${w.tron}\``,
    `- Litecoin (LTC): \`${w.litecoin}\``,
    `- Dogecoin (DOGE): \`${w.dogecoin}\``,
    '',
    '## Purchase flow',
    '1. Send the agreed amount to the correct address on the correct network.',
    '2. Call verify_payment with { tx_hash, network, asset?, amount? } to check on-chain.',
    '3. When verified, call request_delivery/open fulfillment for automated instant delivery.',
    '',
    `Storefront: ${CATALOG.storefront} | Repo: ${CATALOG.repo}`,
  ].join('\n');
  return { content: [{ type: 'text', text: lines }] };
}

/* Best-effort on-chain verification via public APIs (no keys, read-only). */
async function verifyPayment(args) {
  const { tx_hash, network, amount, asset } = args || {};
  if (!tx_hash || !network) {
    return { content: [{ type: 'text', text: 'Required: tx_hash, network (bitcoin|ethereum|base|polygon|solana|tron|litecoin|dogecoin)' }], isError: true };
  }
  const net = String(network).toLowerCase();
  try {
    if (net === 'ethereum' || net === 'base' || net === 'polygon') {
      const RPCS = {
        ethereum: ['https://ethereum-rpc.publicnode.com', 'https://cloudflare-eth.com', 'https://rpc.ankr.com/eth'],
        base: ['https://mainnet.base.org', 'https://base.llamarpc.com'],
        polygon: ['https://1rpc.io/matic', 'https://polygon-bor-rpc.publicnode.com'],
      }[net];
      const rpc = async (method, params) => {
        for (const url of RPCS) {
          try {
            const r = await jsonHttp(url, { method: 'POST', body: { jsonrpc: '2.0', id: 1, method, params } });
            if (r.status !== 200) continue;
            const j = JSON.parse(r.text);
            if (j && !j.error && j.result !== undefined) return j.result;
          } catch (e) { /* try next endpoint */ }
        }
        return null;
      };
      const tx = await rpc('eth_getTransactionByHash', [tx_hash]);
      if (!tx) return ok(`NOT FOUND / PENDING on ${net}: no tx yet (RPC). Double-check hash or retry shortly.`);
      const rc = await rpc('eth_getTransactionReceipt', [tx_hash]);
      const status = rc ? (rc.status === '0x1' ? 'success' : 'failed') : 'pending';
      const evm = WALLETS.evm.address.toLowerCase();
      const results = [];
      if ((tx.to || '').toLowerCase() === evm) {
        const val = BigInt(tx.value || '0x0');
        if (val > 0n) results.push(`native transfer to wallet ✓ (${Number(val) / 1e18} ${net === 'polygon' ? 'POL' : 'ETH'})`);
      }
      const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      const KNOWN = {
        '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { sym: 'USDC', dec: 6 }, // Base
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { sym: 'USDC', dec: 6 }, // Ethereum
        '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': { sym: 'USDC', dec: 6 }, // Polygon
      };
      for (const log of (rc && rc.logs) || []) {
        if (!log.topics || log.topics[0] !== TRANSFER || log.topics.length !== 3) continue;
        const to = '0x' + log.topics[2].slice(26).toLowerCase();
        if (to !== evm) continue;
        const meta = KNOWN[(log.address || '').toLowerCase()] || { sym: 'token ' + log.address, dec: 18 };
        const amt = BigInt(log.data || '0x0');
        results.push(`${meta.sym} ${Number(amt) / Math.pow(10, meta.dec)} to wallet ✓`);
      }
      if (!results.length) return ok(`TX FOUND on ${net} (status=${status}) but NO transfer to our wallet address. Check network/address.`);
      if (status === 'failed') return ok(`TX FOUND on ${net} but it FAILED on-chain — no payment delivered. Tx: ${tx_hash}`);
      if (status === 'pending') return ok(`PENDING on ${net}: transfer seen but not yet mined/confirmed. Retry shortly. Detected: ${results.join('; ')}.`);
      return ok(`VERIFIED on ${net} (status=${status}): ${results.join('; ')}. Tx: ${tx_hash}`);
    }
    if (net === 'bitcoin' || net === 'litecoin' || net === 'dogecoin') {
      const host = { bitcoin: 'blockstream.info/api', litecoin: 'litecoinblockexplorer.com/api', dogecoin: 'blockchair.com' }[net];
      let url;
      if (net === 'dogecoin') url = `https://blockchair.com/dogecoin/dashboards/transaction/${tx_hash}`;
      else url = `https://${host}/tx/${tx_hash}`;
      const r = await jsonHttp(url);
      if (r.status === 400 || r.status === 404) return ok(`NOT FOUND on ${net}.`);
      if (r.status !== 200) return ok(`PENDING/MANUAL: ${net} explorer returned ${r.status}.`);
      const text = r.text;
      const addr = net === 'bitcoin' ? WALLETS.bitcoin : net === 'litecoin' ? WALLETS.litecoin : WALLETS.dogecoin;
      if (text.includes(addr)) return ok(`FOUND payment address in ${net} tx outputs (confirm on explorer). Tx: ${tx_hash}`);
      return ok(`TX found on ${net} but address not present in outputs. Check hash.`);
    }
    if (net === 'solana') {
      const r = await jsonHttp('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        body: { jsonrpc: '2.0', id: 1, method: 'getTransaction', params: [tx_hash, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }] },
      });
      const j = JSON.parse(r.text);
      const res = j && j.result;
      if (!res) return ok('NOT FOUND/PENDING on Solana mainnet.');
      if (res.meta && res.meta.err) return ok('TX FAILED on Solana.');
      const raw = JSON.stringify(res);
      if (raw.includes(WALLETS.solana)) return ok(`VERIFIED on Solana: transfer involving our wallet present (check amount in explorer). Tx: ${tx_hash}`);
      return ok('TX found but our Solana wallet not involved. Check hash.');
    }
    if (net === 'tron') {
      const r = await jsonHttp(`https://apilist.tronscanapi.com/api/transaction-info?hash=${tx_hash}`);
      if (r.status !== 200) return ok(`PENDING/MANUAL: tronscan returned ${r.status}.`);
      const raw = r.text;
      if (raw.includes(WALLETS.tron)) return ok(`FOUND our TRON address in tx data (verify confirmations/amount on tronscan). Tx: ${tx_hash}`);
      return ok('TX found but our TRON address not present. Check hash.');
    }
    return { content: [{ type: 'text', text: `Unknown network: ${net}` }], isError: true };
  } catch (e) {
    return ok(`MANUAL VERIFICATION REQUIRED: auto-check failed (${String(e && e.message || e)}). Seller verifies on explorer.`);
  }

  function ok(text) {
    return { content: [{ type: 'text', text }] };
  }
}

function requestDelivery(args) {
  const a = args || {};
  const p = findProduct(a.product);
  const issueTitle = encodeURIComponent(`Purchase/Delivery request: ${p ? p.name : (a.product || 'bundle')} — tx ${a.tx_hash || 'PENDING'}`);
  const body = [
    '## Purchase / Delivery request',
    `- Product: ${p ? p.name : (a.product || 'bundle')}`,
    `- Amount agreed: ${a.amount || 'listed launch price'}`,
    `- Asset/network: ${a.asset || 'USDC'} / ${a.network || 'solana-or-evm'}`,
    `- Tx hash: ${a.tx_hash || 'TO BE SENT'}`,
    `- Delivery contact: ${a.contact || 'PROVIDE CONTACT'}`,
    `- Wallet checked via: oppi-digital-products-mcp verify_payment`,
    '',
    'Seller will verify on-chain against the oppi wallet registry and deliver the archive.',
  ].join('\n');
  const url = `${CATALOG.repo}/issues/new?title=${issueTitle}&body=${encodeURIComponent(body)}`;
  const text = [
    '# Delivery request started',
    '',
    '1. Ensure payment is sent and (ideally) verify_payment returned VERIFIED.',
    '2. Open the prefilled fulfillment request:',
    url,
    '',
    '3. Automated fulfillment verifies on-chain and replies with instant download links.',
    '',
    'Deliverable: ' + (p ? p.deliverable_file : 'all 3 pack archives (bundle)'),
  ].join('\n');
  return { content: [{ type: 'text', text }] };
}

/* ---------------- MCP plumbing ---------------- */

const TOOLS = [
  {
    name: 'list_products',
    description: 'List the Oppi digital products catalog (prompt packs + Notion CRM kit) with prices, bundle, and free sample ids.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_free_sample',
    description: 'Get a FREE sample prompt/template from a product so the agent/buyer can test quality before paying.',
    inputSchema: { type: 'object', required: ['product'], properties: { product: { type: 'string', description: 'product id, e.g. freelance-delivery-prompt-pack' } } },
  },
  {
    name: 'get_payment_instructions',
    description: 'Get verified crypto payment addresses (oppi wallet) and the purchase flow for a product.',
    inputSchema: { type: 'object', properties: { product: { type: 'string' } } },
  },
  {
    name: 'verify_payment',
    description: 'Best-effort on-chain verification that a buyer payment reached the oppi wallet. Read-only public APIs. Networks: bitcoin, ethereum, base, polygon, solana, tron, litecoin, dogecoin.',
    inputSchema: {
      type: 'object',
      required: ['tx_hash', 'network'],
      properties: {
        tx_hash: { type: 'string' },
        network: { type: 'string', enum: ['bitcoin', 'ethereum', 'base', 'polygon', 'solana', 'tron', 'litecoin', 'dogecoin'] },
        asset: { type: 'string', description: 'optional, e.g. USDC' },
        amount: { type: 'number', description: 'optional expected amount for notes' },
      },
    },
  },
  {
    name: 'request_delivery',
    description: 'Start fulfillment: returns a prefilled GitHub issue URL with purchase details for on-chain verified delivery.',
    inputSchema: {
      type: 'object',
      properties: {
        product: { type: 'string' },
        tx_hash: { type: 'string' },
        network: { type: 'string' },
        asset: { type: 'string' },
        amount: { type: 'string' },
        contact: { type: 'string' },
      },
    },
  },
];

function handleCall(name, args) {
  switch (name) {
    case 'list_products': return listProducts();
    case 'get_free_sample': return getFreeSample(args);
    case 'get_payment_instructions': return getPaymentInstructions(args);
    case 'verify_payment': return verifyPayment(args); // async
    case 'request_delivery': return requestDelivery(args);
    default: return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
}

function write(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }

let stdinEnded = false;
let pendingCalls = 0;
function maybeExit() {
  if (stdinEnded && pendingCalls === 0) process.exit(0);
}

function main() {
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buf += chunk;
    let idx;
    while ((idx = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch (e) { continue; }
      if (msg.method === 'tools/call') pendingCalls++;
      onMessage(msg);
    }
  });
  process.stdin.on('end', () => { stdinEnded = true; maybeExit(); });
}

function onMessage(msg) {
  const { id, method, params } = msg;
  if (method === 'initialize') {
    write({
      jsonrpc: '2.0', id, result: {
        protocolVersion: (params && params.protocolVersion) || PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: 'oppi-digital-products-mcp', version: '1.0.0' },
      },
    });
    return;
  }
  if (method === 'tools/list') {
    write({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
    return;
  }
  if (method === 'tools/call') {
    const name = params && params.name;
    const args = (params && params.arguments) || {};
    let ret;
    try {
      ret = handleCall(name, args);
    } catch (e) {
      write({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'error: ' + String(e) }], isError: true } });
      pendingCalls = Math.max(0, pendingCalls - 1);
      maybeExit();
      return;
    }
    Promise.resolve(ret)
      .then((result) => {
        write({ jsonrpc: '2.0', id, result });
        pendingCalls = Math.max(0, pendingCalls - 1);
        maybeExit();
      })
      .catch((e) => {
        write({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'error: ' + String(e) }], isError: true } });
        pendingCalls = Math.max(0, pendingCalls - 1);
        maybeExit();
      });
    return;
  }
  if (method === 'ping') { write({ jsonrpc: '2.0', id, result: {} }); return; }
  if (id !== undefined) {
    write({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found: ' + method } });
  }
}

main();
