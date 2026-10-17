import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {assertGrounding,inspectGrounding,groundingPrompt,groundingFingerprint} from '../lib/editorial-grounding.js';
import {accountEditorialSnapshot,validateRecommendation} from '../lib/platform-editorial-validation.js';
import {sendVision} from '../lib/kids-scene-vision.js';
const task={sources:[{id:'24:6',text:'He is not here, but is risen.'}],claims:[{id:'scene-1',text:'An angel reports that Jesus is risen.'}]};
const result={claims:[{id:'scene-1',supported:true,reason:'A fonte informa a ressurreição.',evidence:[{sourceId:'24:6',quote:'He is not here, but is risen.'}]}]};
assert.equal(assertGrounding(task,result).approved,true);
for(const change of [c=>c.evidence[0].quote='Jesus appeared to the women.',c=>c.evidence[0].sourceId='24:99',c=>c.id='another-scene',c=>c.evidence=[]]) {
 const bad=structuredClone(result);change(bad.claims[0]);assert.throws(()=>assertGrounding(task,bad));
}
const negative=structuredClone(result);negative.claims[0].supported=false;negative.claims[0].evidence=[];
assert.equal(inspectGrounding(task,negative).approved,false);assert.throws(()=>assertGrounding(task,negative),/não sustenta/);
assert.throws(()=>inspectGrounding(task,{claims:[]}));
assert.notEqual(groundingFingerprint(task),groundingFingerprint({...task,claims:[{id:'scene-1',text:'Different factual event'}]}));
assert.match(groundingPrompt(task),/não harmonize/);
const a={account:'account-a',contentProfile:{niche:'turismo',editorialBriefing:'PRIVATE',logoAttachment:{dataUrl:'PRIVATE'}},clientProfile:{email:'PRIVATE',whatsapp:'PRIVATE'},accessToken:'PRIVATE',scheduleUtc:['13:00']};
const snapshot=accountEditorialSnapshot(a,[{slides:[{title:'Teste',body:'Exemplo',imagePath:'x'}],storySlide:{imagePath:'y'},secret:'PRIVATE'}],{assetExists:()=>true});
assert.equal(JSON.stringify(snapshot).includes('PRIVATE'),false);assert.equal(snapshot.illustratedPacks,1);assert.equal(snapshot.connection,'not_verified_by_this_audit');
const report={account:'account-a',summary:'Diagnóstico desta amostra editorial.',findings:[],nextSteps:[]};
assert.equal(validateRecommendation('account-a',report),report);assert.throws(()=>validateRecommendation('account-b',report),/outra conta/);
let calls=0;
const response=await sendVision({key:'fixture-key',model:'claude-sonnet-4.6',prompt:'text only',fetchImpl:async(url,options)=>{
 calls++;assert.equal(url,'https://claude-ss.ia.br/v1/messages');assert.equal(options.redirect,'error');
 const body=JSON.parse(options.body);assert.equal(body.messages[0].content.length,1);assert.equal(body.messages[0].content[0].type,'text');
 return new Response(JSON.stringify({content:[{type:'text',text:JSON.stringify(report)}],usage:{input_tokens:400,output_tokens:60},stop_reason:'end_turn'}));
}});
assert.equal(calls,1);assert.equal(response.value.account,'account-a');
const html=fs.readFileSync('docs/dashboard.html','utf8');
for(const s of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(s[1].trim())new vm.Script(s[1]);
assert.match(html,/review\?\.report\?\.account === appState\.selectedAccount/);
assert.match(html,/escapeHtml\(f\.suggestion\)/);
console.log('PASS: source quotes, invented references, rejection and abstention, no image in text-only requests, private fields excluded, account isolation and dashboard syntax. Simulated API only.');
