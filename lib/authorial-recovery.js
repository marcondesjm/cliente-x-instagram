import {readyAuthorialPacks,authorialRegressionFresh,RESERVE_RENDER_VERSION} from './authorial-reserve.js';
import {packContentFingerprint,normalizeContentFingerprint} from './scheduled-content-guard.js';
import {dailyCallLimit,dailyInputTokenLimit} from './editorial-daily-budget.js';
export function nextBrtDay(now){const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);return new Date(Date.parse(day+'T00:00:00-03:00')+86400000).toISOString();}
import {pendingAuthorialShortages} from './authorial-shortage.js';
export {isAuthorialShortage} from './authorial-shortage.js';
function similarRecentCover(pack,history){
 const normalized=normalizeContentFingerprint(pack.slides[0].title),words=new Set(normalized.split(' ').filter(w=>w.length>2));
 const ngrams=t=>{const w=t.split(' ').filter(Boolean);return w.length<5?[]:Array.from({length:w.length-4},(_,i)=>w.slice(i,i+5).join(' '));};
 const phrases=new Set(ngrams(normalized));
 return history.slice(-48).some(h=>{const text=normalizeContentFingerprint(h.coverTitle),other=new Set(text.split(' ').filter(w=>w.length>2)),union=new Set([...words,...other]),common=[...words].filter(w=>other.has(w)).length;return ngrams(text).some(p=>phrases.has(p))||Math.min(words.size,other.size)>=4&&common/union.size>=0.72;});
}
export function recoveryPlan({state,budget,history,errors,ledger=[],readAsset,event='schedule',now=new Date()}){
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const shortage=pendingAuthorialShortages({errors,history,ledger,now})[0];
 const packs=readyAuthorialPacks(state,'cliente-x',readAsset,budget.calls).filter(p=>!history.some(h=>h.feedFingerprint===packContentFingerprint(p)||normalizeContentFingerprint(h.coverTitle)===normalizeContentFingerprint(p.slides[0].title))&&!similarRecentCover(p,history));
 const base={pending:!!shortage,pendingSlot:shortage?{date:shortage.date,slotIndex:shortage.slotIndex}:null,available:packs.length,recoveryReady:!!shortage&&packs.length>0};
 if(!state.enabled)return {...base,run:false,phase:'disabled',nextAttemptAt:null};
 if(base.recoveryReady)return {...base,run:true,phase:'recover_ready',nextAttemptAt:now.toISOString()};

 if(packs.length>=state.targetReady)return {...base,run:false,phase:'stock_sufficient',nextAttemptAt:null};
 if(budget.circuit||budget.calls.some(c=>c.status==='reserved'))return {...base,run:false,phase:'provider_blocked',nextAttemptAt:null};
 const calls=budget.calls.filter(c=>c.day===day);
 const gateFresh=authorialRegressionFresh(state,budget.model,now);
 const repair=state.entries.find(e=>e.status==='render_revision_required'||e.status==='ready'&&e.render?.version!==RESERVE_RENDER_VERSION);
 const required=(repair?(repair.pack?.businessArt?1:2):3)+(gateFresh?0:1),used=calls.reduce((n,c)=>n+(Number.isSafeInteger(c.inputTokens)?c.inputTokens:budget.policy.maxInputTokensPerCall),0);
 if(calls.length+required>dailyCallLimit(budget,day)||used+required*budget.policy.maxInputTokensPerCall>dailyInputTokenLimit(budget,day))return {...base,run:false,phase:'waiting_daily_budget',budgetRenewsAt:nextBrtDay(now),nextAttemptAt:new Date(Date.parse(nextBrtDay(now))+35*60000).toISOString()};
 // A failing editorial batch may be revised, but repeated workflow completions
 // must not create an unbounded stream of paid calls on the same incident.
 const retry=Date.parse(state.automaticRecovery?.retryAfter||'');
 if(Number.isFinite(retry)&&retry>now.getTime())return {...base,run:false,phase:'waiting_review_backoff',nextAttemptAt:new Date(retry).toISOString()};
 return {...base,run:true,phase:shortage?'replenish_for_incident':'maintain_stock',nextAttemptAt:now.toISOString()};
}
