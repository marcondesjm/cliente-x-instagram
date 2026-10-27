import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {remainingSceneBudget} from '../lib/kids-reserve-policy.js';
import {usesProviderQuota} from '../lib/editorial-daily-budget.js';
import {packContentFingerprint} from '../lib/scheduled-content-guard.js';
import {recoverTransientCalls} from '../lib/kids-call-recovery.js';
import {persistState} from './persist-instagram-state.mjs';
import {recoverableUsageReceipt} from '../lib/kids-pilot-recovery.js';
const C='automation/instagram-template/config/',read=n=>JSON.parse(fs.readFileSync(C+n,'utf8'));
let state=read('kids-scene-replenishment.json');
const recipes=read('kids-reviewed-scenes.json'),assembly=read('kids-scene-automation.json');
const statePath=C+'kids-scene-replenishment.json';
const recoveredInterruptedCall=recoverTransientCalls(state);
if(recoveredInterruptedCall){fs.writeFileSync(statePath,JSON.stringify(state,null,2)+'\n');persistState([statePath]);state=read('kids-scene-replenishment.json');}
const packs=read('content-packs.json').find(g=>g.account==='sabedoria-kids').packs,history=read('publication-history.json')['sabedoria-kids']||[];
const hash=x=>createHash('sha256').update(Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
const assemble=recipes.some(r=>{
 const p=packs.find(p=>p.id===r.id);if(!p||!['automatically-reviewed','editorially-reviewed'].includes(r.status)||history.some(h=>h.coverTitle===p.slides[0].title||h.feedFingerprint===packContentFingerprint(p)))return false;
 const e=assembly.entries.find(e=>e.id===r.id);
 return e?.status!=='ready'||e.renderVerified!==true||e.recipeFingerprint!==hash(r)||e.packFingerprint!==hash(p)||!(Date.parse(e.verifiedAt)+86400000>Date.now())||(r.selected||[]).some(s=>!fs.existsSync(s.path)||hash(fs.readFileSync(s.path))!==s.sha256);
});
const remaining=remainingSceneBudget(state),mode=process.env.REVIEW_MODE||'replenish',manual=['calibrate','pilot','activate'].includes(mode);
const recovery=mode==='replenish'?recoverableUsageReceipt(state):null;
const review=manual||Boolean(recovery)||state.enabled&&!state.circuit&&!state.calls.some(c=>c.status==='reserved')&&remaining.maxCallsPerDay>=3&&remaining.maxInputTokensPerDay>=3*remaining.maxInputTokensPerCall&&remaining.maxOutputTokensPerDay>=3*remaining.maxOutputTokensPerCall;
if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`review=${review}\nassemble=${assemble}\nrecovery_pilot=${recovery?.packId||''}\n`);
console.log(JSON.stringify({review,assemble,recoveryPilot:recovery?.packId||null,recoveredInterruptedCall,quotaMode:usesProviderQuota(state)?'provider':'internal',remainingCalls:Number.isFinite(remaining.maxCallsPerDay)?remaining.maxCallsPerDay:null,remainingOutputTokens:remaining.maxOutputTokensPerDay,target:state.policy.readyStockTarget,paidCalls:0}));
