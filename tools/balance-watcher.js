#!/usr/bin/env node
/**
 * balance-watcher.js — read-only blockchain watcher for the Oppi wallet addresses.
 *
 * Polls public, free APIs (no keys, no spend, read-only) for the addresses in
 * mcp-server/wallets.json, records balances in a state file, and appends a line
 * to a JSONL sales log whenever a balance increases (incoming payment detected).
 *
 * Usage:
 *   node balance-watcher.js --once                 # single poll pass
 *   node balance-watcher.js --loop --interval 300  # poll every 300s (default)
 *   node balance-watcher.js --once --quiet         # only print detected changes
 *
 * Paths (override with env):
 *   OPPI_STATE_DIR (default: /root/.oppi-secrets) — state.json + sales_log.jsonl
 *
 * Read-only guarantee: only HTTP GETs / RPC reads; never signs, sends, or holds keys.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const WALLETS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mcp-server', 'wallets.json'), 'utf8'));
const STATE_DIR = process.env.OPPI_STATE_DIR || '/root/.oppi-secrets';
const STATE_FILE = path.join(STATE_DIR, 'watcher_state.json');
const LOG_FILE = path.join(STATE_DIR, 'sales_log.jsonl');

const args = process.argv.slice(2);
const ONCE = args.includes('--once') || !args.includes('--loop');
const QUIET = args.includes('--quiet');
const INTERVAL = (() => {
  const i = args.indexOf('--interval');
  const v = i !== -1 ? parseInt(args[i + 1], 10) : 300;
  return (Number.isFinite(v) && v >= 30 ? v : 300) * 1000;
})();

/* ---------------- tiny http helpers ---------------- */

function httpText(url, { method = 'GET', body = null, headers = {} } = {}, redirects = 0) {
  return new Promise((resolve, reject) => {
    let urlObj;
    try { urlObj = new URL(url); } catch (e) { return reject(new Error('bad url')); }
    const payload = body == null ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const req = https.request(urlObj, {
      method,
      headers: Object.assign(
        { 'user-agent': 'oppi-balance-watcher/1.0', accept: 'application/json' },
        payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {},
        headers
      ),
      timeout: 20000,
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 3) {
        res.resume();
        const next = new URL(res.headers.location, urlObj).toString();
        httpText(next, { method: res.statusCode === 307 || res.statusCode === 308 ? method : 'GET', body, headers }, redirects + 1).then(resolve, reject);
        return;
      }
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

async function rpc(url, method, params) {
  const r = await httpText(url, { method: 'POST', body: { jsonrpc: '2.0', id: 1, method, params } });
  if (r.status !== 200) throw new Error(`${url} → ${r.status}`);
  const j = JSON.parse(r.text);
  if (j.error) throw new Error(`${method}: ${j.error.message || 'rpc error'}`);
  return j.result;
}

// Try each endpoint (in order) with a short retry/backoff before moving on.
// A DNS blip or one dead public RPC should never blind the whole watcher.
async function rpcAny(urls, method, params, attempts = 2) {
  const errs = [];
  for (const url of urls) {
    for (let i = 0; i < attempts; i++) {
      try { return await rpc(url, method, params); }
      catch (e) {
        errs.push(`${url}: ${errText(e)}`);
        if (i < attempts - 1) await delay(600 * (i + 1));
      }
    }
  }
  throw new Error(errs.slice(-3).join(' | '));
}

// Same idea for REST APIs, with per-source parsers (shapes differ).
async function sourceAny(label, sources, attempts = 2) {
  const errs = [];
  for (const src of sources) {
    for (let i = 0; i < attempts; i++) {
      try {
        const r = await httpText(src.url);
        if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
        return src.parse(JSON.parse(r.text));
      } catch (e) {
        errs.push(`${new URL(src.url).host}: ${errText(e)}`);
        if (i < attempts - 1) await delay(600 * (i + 1));
      }
    }
  }
  throw new Error(`${label}: ${errs.slice(-4).join(' | ')}`);
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const toNum = (x) => (x == null ? null : Number(x));
// Some token contracts (e.g. Base USDT proxies) answer balanceOf with an empty
// hex string ("0x"); BigInt("0x") throws, so treat empty/invalid as 0.
const toWei = (hex) => {
  try { return BigInt(hex); } catch (e) { return BigInt(0); }
};
const errText = (e) => {
  // AggregateError (all connection attempts failed) has an empty message; unwrap
  // the underlying causes so the log shows e.g. "AggregateError(EAI_AGAIN)".
  if (e && e.name === 'AggregateError' && Array.isArray(e.errors) && e.errors.length) {
    return 'AggregateError(' + e.errors.map((x) => (x && x.code) || (x && x.message) || 'err').join(', ') + ')';
  }
  return String((e && e.message) || e || 'unknown error');
};

/* ---------------- chain probes (all read-only) ---------------- */

// Ordered fallbacks: public RPCs rate-limit and occasionally lose DNS.
const EVM_RPCS = {
  ethereum: [
    'https://ethereum-rpc.publicnode.com',
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
  ],
  base: [
    'https://mainnet.base.org',
    'https://base.llamarpc.com',
    'https://base-rpc.publicnode.com',
  ],
  polygon: [
    'https://polygon-bor-rpc.publicnode.com',
    'https://polygon.llamarpc.com',
    'https://polygon-rpc.com',
  ],
};
const SOLANA_RPCS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-rpc.publicnode.com',
  'https://rpc.ankr.com/solana',
];
const EVM_TOKENS = {
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bbE',
  },
  polygon: {
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
};

async function evmBalance(net) {
  const addr = WALLETS.evm.address;
  const urls = EVM_RPCS[net];
  const out = [];
  const native = await rpcAny(urls, 'eth_getBalance', [addr, 'latest']);
  const sym = net === 'polygon' ? 'POL' : 'ETH';
  out.push({ asset: sym, amount: Number(toWei(native)) / 1e18 });
  const selector = '0x70a08231'; // balanceOf(address)
  const data = selector + addr.toLowerCase().replace('0x', '').padStart(64, '0');
  for (const [tok, contract] of Object.entries(EVM_TOKENS[net])) {
    try {
      const res = await rpcAny(urls, 'eth_call', [{ to: contract, data }, 'latest']);
      out.push({ asset: tok, amount: Number(toWei(res)) / 1e6 });
    } catch (e) { /* optional token; tolerate contract-level quirks */ }
    await delay(400);
  }
  return { chain: net, addr, balances: out };
}

async function solanaBalance() {
  const addr = WALLETS.solana;
  const out = [];
  const native = await rpcAny(SOLANA_RPCS, 'getBalance', [addr, { commitment: 'confirmed' }]);
  out.push({ asset: 'SOL', amount: Number(native.value) / 1e9 });
  try {
    const toks = await rpcAny(SOLANA_RPCS, 'getTokenAccountsByOwner', [addr, { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, { encoding: 'jsonParsed', commitment: 'confirmed' }]);
    for (const a of (toks.value || [])) {
      const info = a.account.data.parsed.info;
      const mint = info.mint;
      const sym = mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' ? 'USDC' : mint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' ? 'USDT' : null;
      if (sym) out.push({ asset: sym, amount: Number(info.tokenAmount.uiAmount || 0) });
    }
  } catch (e) { /* token scan optional */ }
  return { chain: 'solana', addr, balances: out };
}

// Blockstream / mempool.space / litecoinspace all expose the same address stats.
function btcStats(j) {
  const conf = Number(j.chain_stats.funded_txo_sum) - Number(j.chain_stats.spent_txo_sum);
  const mem = Number(j.mempool_stats.funded_txo_sum) - Number(j.mempool_stats.spent_txo_sum);
  return { conf, mem }; // satoshis
}
function blockchairSats(j, addr) {
  const n = j && j.data && j.data[addr] && j.data[addr].address && j.data[addr].address.balance;
  if (n == null) throw new Error('no balance in response');
  return Number(n); // satoshis
}

async function btcLike(net) {
  const addr = WALLETS[net];
  const { conf, mem } = await sourceAny(net, [
    { url: `https://blockstream.info/api/address/${addr}`, parse: btcStats },
    { url: `https://mempool.space/api/address/${addr}`, parse: btcStats },
  ]);
  return { chain: net, addr, balances: [{ asset: net === 'bitcoin' ? 'BTC' : 'LTC', amount: conf / 1e8 }, { asset: net.toUpperCase() + '_MEMPOOL', amount: mem / 1e8 }] };
}

async function ltcBalance() {
  const addr = WALLETS.litecoin;
  const sats = await sourceAny('litecoin', [
    { url: `https://api.blockcypher.com/v1/ltc/main/addrs/${addr}/balance`, parse: (j) => Number(j.balance) },
    { url: `https://litecoinspace.org/api/address/${addr}`, parse: (j) => btcStats(j).conf },
    { url: `https://api.blockchair.com/litecoin/dashboards/address/${addr}`, parse: (j) => blockchairSats(j, addr) },
  ]);
  return { chain: 'litecoin', addr, balances: [{ asset: 'LTC', amount: sats / 1e8 }] };
}

async function dogeBalance() {
  const addr = WALLETS.dogecoin;
  const sats = await sourceAny('dogecoin', [
    { url: `https://api.blockcypher.com/v1/doge/main/addrs/${addr}/balance`, parse: (j) => Number(j.balance) },
    { url: `https://dogechain.info/api/v1/address/balance/${addr}`, parse: (j) => { if (!j.success) throw new Error('not found'); return Math.round(Number(j.balance) * 1e8); } },
    { url: `https://api.blockchair.com/dogecoin/dashboards/address/${addr}`, parse: (j) => blockchairSats(j, addr) },
  ]);
  return { chain: 'dogecoin', addr, balances: [{ asset: 'DOGE', amount: sats / 1e8 }] };
}

const TRC20 = {
  TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t: 'USDT-TRC20',
  TEkxiTehnzSmSe2XqrPj4CXhTarVsMnw2t: 'USDC-TRC20',
};
function tronBalancesFromTrongrid(j) {
  const out = [];
  const acc = (j.data || [])[0];
  if (acc) {
    if (acc.balance != null) out.push({ asset: 'TRX', amount: Number(acc.balance) / 1e6 });
    for (const t of (acc.trc20 || [])) {
      for (const [contract, raw] of Object.entries(t)) {
        const sym = TRC20[contract];
        if (sym) out.push({ asset: sym, amount: Number(raw) / 1e6 });
      }
    }
  }
  return out;
}
function tronBalancesFromTronscan(j) {
  const out = [];
  if (j.balance != null) out.push({ asset: 'TRX', amount: Number(j.balance) / 1e6 });
  for (const t of (j.trc20token_balances || [])) {
    const sym = TRC20[t.tokenId];
    if (sym) out.push({ asset: sym, amount: Number(t.balance) / 1e6 });
  }
  return out;
}

async function tronBalance() {
  const addr = WALLETS.tron;
  const balances = await sourceAny('tron', [
    { url: `https://api.trongrid.io/v1/accounts/${addr}`, parse: tronBalancesFromTrongrid },
    { url: `https://apilist.tronscanapi.com/api/account?address=${addr}`, parse: tronBalancesFromTronscan },
  ]);
  return { chain: 'tron', addr, balances };
}

/* ---------------- state + detection ---------------- */

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { return { balances: {}, txcounts: {} }; }
}
function saveState(s) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}
function logEvent(evt) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, JSON.stringify(evt) + '\n');
}

function keyFor(chain, asset, addr) { return `${chain}|${asset}|${addr.slice(0, 8)}…`; }

async function pollOnce() {
  const state = loadState();
  const probes = [];
  const errors = [];
  for (const net of ['ethereum', 'base', 'polygon']) {
    try { probes.push(await evmBalance(net)); } catch (e) { errors.push(`${net}: ${errText(e)}`); }
    await delay(700);
  }
  for (const [name, fn] of [
    ['solana', solanaBalance],
    ['bitcoin', () => btcLike('bitcoin')],
    ['litecoin', ltcBalance],
    ['dogecoin', dogeBalance],
    ['tron', tronBalance],
  ]) {
    try { probes.push(await fn()); } catch (e) { errors.push(`${name}: ${errText(e)}`); }
    await delay(700);
  }

  const detected = [];
  const now = new Date().toISOString();
  for (const p of probes) {
    for (const b of p.balances) {
      if (b.amount == null) continue;
      const k = keyFor(p.chain, b.asset, p.addr);
      const prev = state.balances[k];
      if (prev != null && b.amount > prev + 1e-9) {
        const evt = {
          ts: now,
          event: 'INCOMING_PAYMENT_DETECTED',
          chain: p.chain,
          asset: b.asset,
          address: p.addr,
          previous: prev,
          current: b.amount,
          delta: b.amount - prev,
          price_hint: 'compare tx on explorer; fulfill after manual on-chain verification',
        };
        detected.push(evt);
        logEvent(evt);
      }
      state.balances[k] = b.amount;
    }
  }
  // Health is explicit: 0 probes is an outage, not a "no payments" result.
  const health = probes.length === 0 ? 'down' : (errors.length ? 'degraded' : 'ok');
  state.last_poll = now;
  state.health = { status: health, chains_ok: probes.length, chains_failed: errors.length };
  if (probes.length > 0) state.last_successful_poll = now;
  state.errors = errors;
  saveState(state);

  if (detected.length) {
    for (const d of detected) {
      console.log(`💰 [${d.ts}] ${d.chain} ${d.asset}: ${d.previous} → ${d.current} (+${d.delta.toPrecision(8)}) addr ${d.address}`);
    }
  } else if (!QUIET || probes.length === 0) {
    const summary = probes.flatMap(p => p.balances).filter(b => b.amount != null)
      .map(b => `${b.asset}:${b.amount.toPrecision ? b.amount.toPrecision(6) : b.amount}`).join(' ');
    const healthNote = probes.length === 0
      ? '⚠️  MONITORING DOWN — 0/8 chains reachable'
      : `${probes.length}/8 chains up`;
    console.log(`[${now}] ${healthNote} — no new payments. ${summary ? 'Balances: ' + summary : ''}`);
    if (errors.length) console.log(`   probe errors: ${errors.join('; ')}`);
  }
  return detected;
}

async function main() {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  if (ONCE) {
    await pollOnce();
    return;
  }
  console.log(`oppi balance watcher: polling every ${INTERVAL / 1000}s → ${LOG_FILE}`);
  for (;;) {
    try { await pollOnce(); } catch (e) { console.error('poll error:', e.message); }
    await delay(INTERVAL);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
