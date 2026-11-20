#!/usr/bin/env node
/**
 * auto-fulfill-watcher.js — polls oppi-digital-products issues, verifies tx hashes
 * against oppi wallet addresses (read-only), and replies with instant download links.
 *
 * Usage:
 *   node tools/auto-fulfill-watcher.js --once
 *   node tools/auto-fulfill-watcher.js --loop --interval 120
 *   node tools/auto-fulfill-watcher.js --loop --interval 120 --apply   (default mode posts)
 *
 * Safe/read-only verification: uses local MCP server verify_payment (public APIs only).
 */
'use strict';

const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const GH = (() => {
  const candidates = [process.env.GH_BIN, '/usr/local/bin/gh', '/usr/bin/gh', '/opt/homebrew/bin/gh'];
  for (const c of candidates) { if (!c) continue; try { if (fs.existsSync(c)) return c; } catch (_) {} }
  return 'gh';
})();
const REPO = process.env.OPPI_REPO || 'Reggiebro/oppi-digital-products';
const STATE_DIR = process.env.OPPI_STATE_DIR || '/root/.oppi-secrets';
const STATE_FILE = path.join(STATE_DIR, 'fulfill_watcher_state.json');
const LOG_FILE = path.join(STATE_DIR, 'auto_fulfill.log');
const MCP = path.join(__dirname, '..', 'mcp-server', 'index.js');
const WALLETS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mcp-server', 'wallets.json'), 'utf8'));
const args = process.argv.slice(2);
const LOOP = args.includes('--loop');
const DRY = args.includes('--dry-run');
const INTERVAL = (() => { const i = args.indexOf('--interval'); const v = i !== -1 ? parseInt(args[i+1],10) : 120; return (Number.isFinite(v)&&v>=30?v:120)*1000; })();

// Paid archives kept local (not in git/public releases). Delivered as secret gists only after verified payment.
const ARCHIVES_DIR = path.join(__dirname, '..', 'paid_archives_backup');
const DOWNLOAD_FILES = {
  'freelance-delivery-prompt-pack': 'freelance-delivery-prompt-pack.zip',
  'notion-freelancer-crm-kit': 'notion-freelancer-crm-kit.zip',
  'ai-content-repurpose-pack': 'ai-content-repurpose-pack.zip',
  'three-pack-bundle': 'oppi-bundle-all-3.zip',
};
const B2B_RE = /\b(b2b|team license|agency license|white-label|whitelabel|per seat|seats?|procurement|purchase order|quotation)\b/i;
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

function nowIso(){ return new Date().toISOString(); }
function log(msg){ const line = `[${nowIso()}] ${msg}`; console.log(line); try{ fs.mkdirSync(STATE_DIR,{recursive:true}); fs.appendFileSync(LOG_FILE,line+'\n'); }catch(_){} }
function gh(args, input){ return execFileSync(GH,args,{encoding:'utf8',input,maxBuffer:20*1024*1024}); }
function ghJson(args){ return JSON.parse(gh(args)); }
function loadState(){ try{ return JSON.parse(fs.readFileSync(STATE_FILE,'utf8')); }catch(_){ return { delivered:{} }; } }
function saveState(s){ fs.mkdirSync(STATE_DIR,{recursive:true}); fs.writeFileSync(STATE_FILE, JSON.stringify(s,null,2)+'\n'); }

function extractNetwork(text){ for(const n of NETWORKS) if(n.re.test(text)) return n.id; return null; }
function extractProduct(text){ for(const p of PRODUCTS) if(p.re.test(text)) return p; return null; }
function extractTx(text){
  let m = text.match(/0x[a-fA-F0-9]{64}/); if(m) return m[0];
  m = text.match(/\b[1-9A-HJ-NP-Za-km-z]{80,90}\b/); if(m) return m[0];
  m = text.match(/\b[a-fA-F0-9]{64}\b/); if(m) return m[0];
  return null;
}

function callTool(name, toolArgs, timeoutMs=45000){
  return new Promise((resolve,reject)=>{
    const child = spawn(process.execPath,[MCP],{stdio:['pipe','pipe','pipe']});
    let buf=''; let settled=false;
    const timer=setTimeout(()=>{ if(!settled){settled=true; child.kill('SIGKILL'); reject(new Error('mcp timeout'));}},timeoutMs);
    const send=(o)=>child.stdin.write(JSON.stringify(o)+'\n');
    child.stdout.on('data',(d)=>{ buf+=d.toString(); const lines=buf.split('\n'); buf=lines.pop(); for(const line of lines){ if(!line.trim()) continue; let msg; try{msg=JSON.parse(line);}catch{continue;} if(msg.id===2){ if(settled) return; settled=true; clearTimeout(timer); child.kill('SIGTERM'); resolve(msg.result||msg.error); } } });
    child.stderr.on('data',()=>{});
    child.on('error',(e)=>{ if(!settled){settled=true; clearTimeout(timer); reject(e);} });
    send({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'oppi-auto-fulfill',version:'1.0.0'}}});
    send({jsonrpc:'2.0',method:'notifications/initialized'});
    send({jsonrpc:'2.0',id:2,method:'tools/call',params:{name,arguments:toolArgs}});
  });
}
function textOf(result){ if(!result||!result.content) return JSON.stringify(result); return result.content.map(c=>c.text||'').join('\n'); }
function isVerified(verdict){
  const v=String(verdict);
  if(/NOT FOUND|NO transfer to our wallet|TX found but|check hash|check network|MANUAL VERIFICATION|Unknown network|Required: tx_hash/i.test(v)) return false;
  return /^VERIFIED on |^FOUND payment address in |^FOUND our TRON address in /m.test(v.trim());
}

async function pass(){
  const state=loadState(); state.delivered=state.delivered||{};
  let issues=[];
  try {
    issues = ghJson(['issue','list','-R',REPO,'--state','open','--limit','50','--json','number,title,body,labels,author,url,comments']);
  } catch(e){ log('issue list failed: '+String(e.message).split('\n')[0]); return; }
  let acted=0;
  for(const issue of issues){
    const labels=(issue.labels||[]).map(l=>l.name);
    if(labels.includes('delivered')) continue;
    const text=`${issue.title}\n${issue.body||''}`;
    if(B2B_RE.test(text)) continue;
    const tx=extractTx(text); if(!tx) continue;
    const key=`${issue.number}:${tx}`;
    if(state.delivered[key]) continue;
    const network=extractNetwork(text); if(!network) continue;
    const product=extractProduct(text);
    let verdict;
    try { verdict=textOf(await callTool('verify_payment',{tx_hash:tx,network})); }
    catch(e){ log(`#${issue.number} verify error: ${e.message}`); continue; }
    const verified=isVerified(verdict);
    log(`#${issue.number} tx=${tx.slice(0,12)}… net=${network} product=${product?product.id:'unknown'} verified=${verified}`);
    if(!verified) continue;
    const wanted = product ? [product.id] : Object.keys(DOWNLOAD_FILES);
    const links = [];
    for (const pid of wanted) {
      const fname = DOWNLOAD_FILES[pid];
      const fpath = path.join(ARCHIVES_DIR, fname);
      if (!fs.existsSync(fpath)) { log(`missing archive: ${fpath}`); continue; }
      try {
        const desc = `oppi verified delivery #${issue.number} ${pid} ${tx.slice(0,10)}`;
        const out = gh(['gist','create',fpath,'--desc',desc], undefined).trim();
        links.push(`- **${pid}**: ${out}`);
      } catch(e) {
        log(`gist create failed for ${pid} #${issue.number}: ${String(e.message).split('\n')[0]}`);
      }
    }
    if (!links.length) { log(`no delivery links generated for #${issue.number}`); continue; }
    const body = [
      `✅ **Payment verified on-chain — instant delivery**`,
      '',
      `- Transaction: \`${tx}\``,
      `- Network: ${network}`,
      `- Product: ${product ? product.label : 'as requested'}`,
      '',
      '**Secure download link(s)** (generated after verification):',
      ...links,
      '',
      '_Automated on-chain verification (read-only, against published oppi wallet addresses). Links are created only after verified payment. If you need a different format or have any issue with the files, reply here._',
    ].join('\n');
    if(DRY){ log(`DRY would deliver #${issue.number}`); }
    else {
      try {
        gh(['issue','comment',String(issue.number),'-R',REPO,'--body',body]);
        try { gh(['issue','edit',String(issue.number),'-R',REPO,'--add-label','payment-verified,delivered']); } catch(_){}
        state.delivered[key]={issue:issue.number,tx,network,product:product?product.id:null,at:nowIso()};
        saveState(state);
        log(`delivered #${issue.number}`);
        acted++;
      } catch(e){ log(`comment failed #${issue.number}: ${String(e.message).split('\n')[0]}`); }
    }
  }
  state.last_run=nowIso(); saveState(state);
  if(acted||DRY) log(`pass complete, delivered=${acted}`);
}

(async()=>{
  log(`auto-fulfill-watcher start repo=${REPO} loop=${LOOP} interval=${INTERVAL}ms dry=${DRY}`);
  await pass();
  if(LOOP){ setInterval(()=>{ pass().catch(e=>log('pass error: '+e.message)); }, INTERVAL); }
})().catch(e=>{ console.error(e); process.exit(1); });
