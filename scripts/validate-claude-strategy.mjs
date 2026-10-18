import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import {STRATEGY_VERSION,validateStrategy,strategyUsable,experimentResults,experimentBrief,strategySummary} from '../lib/claude-editorial-strategy.js';
const now=Date.parse('2026-10-18T20:00:00Z');
const context={freshness:'current',examples:['a','b'].map(mediaId=>({mediaId,format:'FEED',windowHours:24,metrics:{reach:10,saved:1}}))};
const plan={diagnosis:'Amostra recente ainda limitada para atribuir causas.',hypothesis:'Testar abertura com pergunta específica da rotina.',limitations:'Comparação exploratória sem garantia de entrega.',axis:'hook',variant:'specific-question',format:'FEED',metric:'saved',evidenceIds:['a','b']};
validateStrategy(plan,context);
assert.throws(()=>validateStrategy({...plan,evidenceIds:['a','forged']},context));
assert.throws(()=>validateStrategy({...plan,evidenceIds:['a','a']},context));
assert.throws(()=>validateStrategy({...plan,format:'REELS'},context));
assert.throws(()=>validateStrategy({...plan,variant:'copper'},context));
assert.throws(()=>validateStrategy({...plan,status:'active'},context));
assert.throws(()=>validateStrategy(plan,{...context,freshness:'stale'}));
assert.throws(()=>validateStrategy(plan,{...context,examples:context.examples.map(e=>({...e,metrics:{reach:10,saved:null}}))}));
const strategy={...plan,version:STRATEGY_VERSION,status:'active',expiresAt:new Date(now+1000).toISOString()};
assert(strategyUsable(strategy,context,now));assert(!strategyUsable(strategy,context,now+2000));
assert.equal(strategySummary({learningStrategy:{...strategy,secret:'PRIVATE'}},now).secret,undefined);
assert.equal(experimentBrief(strategy,'control'),'');assert.match(experimentBrief(strategy,'variant'),/pergunta/);
const s={mediaId:'one',claudeExperiment:{strategyId:'trial',group:'variant',metric:'saved'},learningContext:{format:'FEED'},observations:[{windowHours:24,ageHours:25,metrics:{reach:20,saved:2}}]};
let rows=experimentResults([s,s,{...s,mediaId:'null',observations:[{windowHours:24,ageHours:25,metrics:{reach:20,saved:null}}]},{...s,mediaId:'late',observations:[{windowHours:24,ageHours:50,metrics:{reach:20,saved:2}}]}]);
assert.equal(rows[0].variant.posts,1);assert.equal(rows[0].variant.perHundredReach,10);assert.equal(rows[0].control.perHundredReach,null);
rows=experimentResults([s,{...s,mediaId:'reel',learningContext:{format:'REELS'}}]);assert.equal(rows.length,2);
const html=fs.readFileSync('docs/dashboard.html','utf8');
const fn=html.slice(html.indexOf('    function renderPerformanceLearning('),html.indexOf('    function renderShowcaseSlide()'));
const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,{});return nodes.get(id);};
const sandbox={document:{getElementById:get},appState:{selectedAccount:'cliente-x'},escapeHtml:String,formatNumber:n=>String(n??0),formatDateTime:String};vm.createContext(sandbox);vm.runInContext(fn,sandbox);
sandbox.renderPerformanceLearning({available:true,confidenceLevel:'high',models:{},claudeStrategy:strategy,claudeExperiments:rows});
assert.match(get('claudeLearningDiagnosis').textContent,/Hipótese/);assert(!get('claudeLearningDiagnosis').hidden);
sandbox.appState.selectedAccount='sabedoria-kids';sandbox.renderPerformanceLearning({available:false});assert(get('claudeLearningDiagnosis').hidden);assert.equal(get('claudeLearningDiagnosis').textContent,'');
if(process.argv.includes('--publication')){
 const {recordPublicationHistory}=await import('../automation/instagram-template/scripts/publish-carousel.mjs');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'claude-publication-test-'));
 try{
  recordPublicationHistory(dir,'cliente-x',{caption:'Teste local',slides:[{title:'Exemplo fictício',body:'Uma conferência útil.'}],claudeExperiment:s.claudeExperiment},{mediaId:'local-test',learningContext:{format:'FEED'}});
  const stored=JSON.parse(fs.readFileSync(path.join(dir,'publication-history.json')));
  assert.deepEqual(stored['cliente-x'][0].claudeExperiment,s.claudeExperiment);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
console.log('PASS: validated evidence IDs/formats/metrics, stale expiry, no arbitrary settings, group isolation, missing/late metrics, deduplication and live dashboard rendering/account switch. No paid calls.');
