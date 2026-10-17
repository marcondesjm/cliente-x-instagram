import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {persistState} from './persist-instagram-state.mjs';
import {loadPassage} from '../lib/kids-bible-passage.js';
import {hash} from '../lib/kids-scene-assembly.js';
import {callAllowance,sendVision,verificationSchema,verificationPrompt} from '../lib/kids-scene-vision.js';
import {normalizeProviderUsage} from '../lib/platform-editorial-validation.js';
const path='automation/instagram-template/config/kids-copy-regression.json';
const state=JSON.parse(fs.readFileSync(path,'utf8'));
const key=process.env.KIDS_VISION_ANTHROPIC_API_KEY;
if(!process.argv.includes('--persist') || !key)throw Error('Teste exige segredo existente e recibos persistidos.');
const save=()=>{state.checkedAt=new Date().toISOString();state.run=process.env.GITHUB_RUN_ID;fs.writeFileSync(path,JSON.stringify(state,null,2)+'\n');persistState([path]);};
const observations=[{scene:1,observedEvent:'Uma pessoa sobe em uma árvore enquanto outras pessoas observam do chão.'},{scene:2,observedEvent:'Um homem recebe outro homem com alegria na entrada da sua casa.'}];
const cases=[{id:'compatible-tree-v4',title:'Zaqueu subiu na árvore para ver Jesus',body:'Ele correu à frente e subiu na árvore para conseguir ver Jesus.',expected:true},{id:'incompatible-house-v4',title:'Zaqueu recebeu Jesus em sua casa',body:'Zaqueu desceu depressa e recebeu Jesus com alegria em sua casa.',expected:false}];
try {
 const passage=await loadPassage('Lucas 19:1–10');
 for(const fixture of cases) {
  if(state.entries.some(e=>e.id===fixture.id))continue;
  const day=callAllowance(state);
  const ctx=JSON.stringify({reference:passage.reference,passage:passage.verses,cards:[{index:1,title:fixture.title,body:fixture.body}],story:'Zaqueu recebeu Jesus com alegria em sua casa (Lucas 19:6). Cena distinta da árvore.'});
  const prompt=verificationPrompt(ctx,observations);
  const call={id:randomUUID(),day,status:'reserved',stage:fixture.id,startedAt:new Date().toISOString(),promptHash:hash(prompt)};state.calls.push(call);save();
  let result;
  try {result=await sendVision({key,model:state.model,prompt,schema:verificationSchema(2),maxOutputTokens:1800});}
  catch(error){call.status='failed';call.completedAt=new Date().toISOString();call.error='Falha na requisição; sem repetição automática.';state.circuit='provider_request_failed';save();throw Error(call.error);}
  const {blocked,...usage}=normalizeProviderUsage(result.usage,state.policy,state.billingMode);Object.assign(call,{status:'completed',completedAt:new Date().toISOString(),...usage,stopReason:result.stopReason});
  const value=JSON.parse(JSON.stringify(result.value).replaceAll(key,'[redacted]'));
  const cards=value?.cards;
  const complete=Array.isArray(cards)&&cards.length===2&&cards.every((c,i)=>c.scene===i+1&&c.observedEvent===observations[i].observedEvent&&c.childSuitable===true&&(fixture.expected||i===1?c.passageMatch===true:typeof c.passageMatch==='boolean')&&c.distinct===true);
  const passed=!blocked&&complete&&cards[0].copyMatch===fixture.expected&&cards[1].copyMatch===true&&value.decision===(fixture.expected?'approve':'reject')&&(result.stopReason==='end_turn'||result.structured&&result.stopReason==='tool_use');
  state.entries.push({id:fixture.id,expectedCopyMatch:fixture.expected,passed,syntheticTextFixture:true,imageInspection:false,value,promptHash:call.promptHash});
  if(blocked)state.circuit='invalid_usage_receipt';save();if(blocked)throw Error('Recibo inválido.');
 }
 const current=state.entries.filter(e=>cases.some(c=>c.id===e.id));state.passed=current.length===cases.length&&current.every(e=>e.passed);state.health=state.passed?'passed':'rejected';save();if(!state.passed)process.exitCode=1;
}catch(error){state.health='blocked';state.message=String(error.message).replaceAll(key,'[redacted]').slice(0,300);save();process.exitCode=1;}
console.log(JSON.stringify({passed:state.passed,health:state.health,entries:state.entries.map(e=>({id:e.id,passed:e.passed,expectedCopyMatch:e.expectedCopyMatch,actualCopyMatch:e.value?.cards?.[0]?.copyMatch})),publicationTriggered:false,automaticApprovalEnabled:false,imageInspection:false}));
