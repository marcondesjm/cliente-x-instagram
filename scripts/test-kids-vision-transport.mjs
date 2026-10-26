import fs from 'node:fs';
import sharp from 'sharp';
import {randomUUID,createHash} from 'node:crypto';
import {sendVision,callAllowance,labelledReviewImages,reviewImageManifest} from '../lib/kids-scene-vision.js';
import {normalizeProviderUsage} from '../lib/platform-editorial-validation.js';
import {loadPassage} from '../lib/kids-bible-passage.js';
import {groundingPrompt,groundingSchema,inspectGrounding,groundingFingerprint} from '../lib/editorial-grounding.js';
import {persistState} from './persist-instagram-state.mjs';
const C='automation/instagram-template/config/',PATH=C+'kids-vision-transport-test.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const state=read(PATH),key=process.env.KIDS_VISION_ANTHROPIC_API_KEY;
if(!process.argv.includes('--persist') || !key)throw new Error('Teste exige segredo existente e reserva persistida.');
const save=()=>{state.checkedAt=new Date().toISOString();state.workflowRun=process.env.GITHUB_RUN_ID;fs.writeFileSync(PATH,JSON.stringify(state,null,2)+'\n');persistState([PATH]);};
const schema={type:'object',additionalProperties:false,required:['personInTree','openBooks','style','description'],properties:{personInTree:{type:'boolean'},openBooks:{type:'boolean'},style:{type:'string',enum:['illustration','photo','unknown']},description:{type:'string',minLength:15,maxLength:700}}};
const prompt='Observe SOMENTE a imagem fornecida, sem presumir uma história, referência bíblica ou aprovação. Há pessoa em uma árvore? Há livros abertos? A imagem é ilustração, fotografia ou desconhecido? Descreva pessoas, ação e ambiente que realmente vê. Se não enxergar, style=unknown e não invente detalhes. Responda SOMENTE JSON: {"personInTree":true ou false,"openBooks":true ou false,"style":"illustration ou photo ou unknown","description":"descrição concreta em português"}.';
const source=read(C+'kids-image-discovery.json').entries.find(e=>e.id==='kids-biblia-29').candidates[0];
const fixtures=[{id:'scene-a',scene:source.scenes[0],expected:{personInTree:false,openBooks:false,style:'illustration'}},{id:'scene-b',scene:source.scenes[3],expected:{personInTree:true,openBooks:false,style:'illustration'}}];
const holdoutFixtures=[7,6,5,4].map((index,i)=>({id:'holdout-'+(i+1),scene:source.scenes[index],expected:{personInTree:index===4,openBooks:false,style:'illustration'}}));
const modes=[{id:'sonnet-forced-holdout',model:'claude-sonnet-4.6',transport:'base64',tool:true,holdout:true},{id:'base64-json',model:'claude-sonnet-4.6',transport:'base64',tool:false},{id:'url-json',model:'claude-sonnet-4.6',transport:'url',tool:false},{id:'base64-tool',model:'claude-sonnet-4.6',transport:'base64',tool:true},{id:'haiku-base64-json',model:'claude-haiku-4.5',transport:'base64',tool:false},{id:'haiku-holdout',model:'claude-haiku-4.5',transport:'base64',tool:false,holdout:true}];
try {
  for(const mode of modes.filter(m=>m.id==='sonnet-forced-holdout'))for(const fixture of (mode.holdout?holdoutFixtures:fixtures)) {
    const id=mode.id+':'+fixture.id;if(state.entries.some(e=>e.id===id && Date.now()-Date.parse(e.checkedAt)<24*60*60*1000))continue;
    const day=callAllowance(state);
    const response=await fetch(fixture.scene.imageUrl,{redirect:'error',signal:AbortSignal.timeout(25000)});
    if(!response.ok || !/image\/jpeg/.test(response.headers.get('content-type') || ''))throw new Error('Fonte de teste indisponível.');
    const original=Buffer.from(await response.arrayBuffer());if(original.length>5000000)throw new Error('Imagem acima do limite.');
    let image=await sharp(original).resize(768,576,{fit:'inside',withoutEnlargement:true}).jpeg({quality:65}).toBuffer();
    if(image.length>100000)image=await sharp(original).resize(640,480,{fit:'inside'}).jpeg({quality:55}).toBuffer();
    if(image.length>100000)throw new Error('Imagem de teste acima do limite.');
    const call={id:randomUUID(),day,status:'reserved',stage:id,startedAt:new Date().toISOString(),imageHash:createHash('sha256').update(image).digest('hex'),imageBytes:image.length};
    state.calls.push(call);save();
    let r;
    try {r=await sendVision({key,model:mode.model,...(mode.transport==='url'?{imageUrl:fixture.scene.imageUrl}:{image}),prompt,maxOutputTokens:600,schema:mode.tool?schema:null,forceTool:Boolean(mode.tool)});}
    catch(e){call.status='failed';call.completedAt=new Date().toISOString();call.httpStatus=e.httpStatus || null;state.circuit='request_failed';save();throw new Error('Teste interrompido por erro de transporte; sem repetição automática.');}
    const {blocked,...usage}=normalizeProviderUsage(r.usage,state.policy,state.billingMode);Object.assign(call,{status:'completed',completedAt:new Date().toISOString(),...usage,stopReason:r.stopReason});
    const value=JSON.parse(JSON.stringify(r.value).replaceAll(key,'[redacted]'));
    const passed=!blocked && value?.personInTree===fixture.expected.personInTree && value?.openBooks===fixture.expected.openBooks && value?.style===fixture.expected.style && typeof value?.description==='string' && value.description.length>=15 && (r.stopReason==='end_turn' || r.structured && r.stopReason==='tool_use');
    state.entries=state.entries.filter(e=>e.id!==id);state.entries.push({id,mode:mode.id,fixture:fixture.id,model:mode.model,passed,value,...(r.value===null?{responseExcerpt:r.invalidResponseText}:{}),expected:fixture.expected,checkedAt:new Date().toISOString(),sourceUrl:fixture.scene.imageUrl,imageHash:call.imageHash});
    if(blocked)state.circuit='invalid_usage_receipt';save();if(blocked)throw new Error('Recibo inválido no diagnóstico.');
  }
  if(state.visualDiversity?.version!=='visual-diversity-v2' || Date.now()-Date.parse(state.visualDiversity?.checkedAt || 0)>=24*60*60*1000) {
    const originals=await Promise.all([source.scenes[3],source.scenes[4]].map(async s=>{const r=await fetch(s.imageUrl,{redirect:'error',signal:AbortSignal.timeout(25000)});if(!r.ok)throw new Error('Fonte do teste de composição indisponível.');return Buffer.from(await r.arrayBuffer());}));
    const cases=[];
    for(const expected of [true,false]) {
      const raw=expected?originals:[originals[0],await sharp(originals[0]).flop().jpeg().toBuffer()];
      const images=await labelledReviewImages(raw.map(bytes=>({bytes,id:randomUUID().replaceAll('-','').slice(0,16)})));
      const day=callAllowance(state),call={id:randomUUID(),day,status:'reserved',stage:expected?'diversity-distinct':'diversity-mirror',startedAt:new Date().toISOString(),images:reviewImageManifest(images)};state.calls.push(call);save();
      let result;
      try {result=await sendVision({key,model:'claude-sonnet-4.6',images,prompt:'Compare as DUAS imagens para decidir se a segunda é uma composição realmente nova. distinct=false se a segunda for a mesma ilustração que a primeira transformada apenas por espelhamento horizontal, recorte, redimensionamento ou compressão. Num espelhamento horizontal, objetos e pessoas trocam de lado, mas continuam sendo a mesma cena; isso NÃO é diversidade. distinct=true SOMENTE se houver mudança visual substancial além dessas transformações, como outra ação, participantes, ângulo ou composição. Se a segunda for a versão espelhada da primeira, responda obrigatoriamente distinct=false. Descreva a diferença visual concreta sem presumir história ou referência bíblica. Se não puder ver ambas, distinct=false e explique.',schema:{type:'object',additionalProperties:false,required:['distinct','reason'],properties:{distinct:{type:'boolean'},reason:{type:'string',minLength:12,maxLength:500}}},forceTool:true,maxOutputTokens:700});}
      catch(error){call.status='failed';call.completedAt=new Date().toISOString();state.circuit='request_failed';save();throw new Error('Teste de composição interrompido; sem repetição automática.');}
      const {blocked,...usage}=normalizeProviderUsage(result.usage,state.policy,state.billingMode);Object.assign(call,{status:'completed',completedAt:new Date().toISOString(),...usage});
      cases.push({expected,distinct:result.value?.distinct,reason:result.value?.reason,passed:!blocked && result.value?.distinct===expected && typeof result.value?.reason==='string' && result.value.reason.length>=12});
      state.visualDiversity={version:'visual-diversity-v2',model:'claude-sonnet-4.6',checkedAt:new Date().toISOString(),cases};save();
      if(blocked)throw new Error('Recibo do teste de composição inválido.');
    }
  }
  const regressionVersion='depicted-event-v4';
  if(state.eventGrounding?.version!==regressionVersion || Date.now()-Date.parse(state.eventGrounding?.checkedAt || 0)>=24*60*60*1000) {
    const passages=await Promise.all(['Lucas 24:1–12','Lucas 19:1–10','Marcos 4:35–41'].map(reference=>loadPassage(reference)));
    const task={scopeReference:'Trechos WEB fornecidos, sem ampliar o relato.',sources:passages.flatMap((p,i)=>p.verses.map(v=>({id:`p${i}:${v.id}`,text:v.text}))),claims:[
      {id:'absent-appearance',text:'Jesus apareceu pessoalmente às mulheres diante do túmulo.'},
      {id:'zacchaeus-house',text:'Zaqueu recebeu Jesus em sua casa.',visualObservation:'Um homem está de pé ao lado de outro sentado junto de uma mesa em um ambiente interno.',sourceContext:'Zacchaeus welcomed Jesus into his house.'},
      {id:'tree-action',text:'Zaqueu subiu em uma árvore para ver Jesus.',visualObservation:'Um homem está nos galhos de uma árvore, acima de pessoas no chão.',sourceContext:'Zacchaeus climbed a sycamore tree to see Jesus.'},
      {id:'wrong-table',text:'Zaqueu estava sentado à mesa com Jesus.',visualObservation:'Um homem está nos galhos de uma árvore, acima de pessoas no chão.',sourceContext:'Zacchaeus climbed a sycamore tree to see Jesus.'},
      {id:'sleep-illustration',text:'Jesus dormia na parte de trás do barco.',visualObservation:'Um homem com túnica vermelha está deitado na popa de um barco, enquanto outros homens estão próximos.',sourceContext:'Jesus was asleep in the stern.'},
      {id:'wrong-tree-action',text:'Zaqueu subiu em uma árvore para ver Jesus.',visualObservation:'Quatro homens caminham em uma estrada; ninguém está em árvore.',sourceContext:'People walking towards Jericho.'}
    ]};
    const day=callAllowance(state),call={id:randomUUID(),day,status:'reserved',stage:'event-grounding-v2',startedAt:new Date().toISOString()};state.calls.push(call);save();
    let result;
    try {result=await sendVision({key,model:'claude-sonnet-4.6',prompt:groundingPrompt(task),schema:groundingSchema(task.claims.length),forceTool:true,maxOutputTokens:3000});}
    catch(error){call.status='failed';call.completedAt=new Date().toISOString();state.circuit='request_failed';save();throw new Error('Regressão factual interrompida; sem repetição automática.');}
    const {blocked,...usage}=normalizeProviderUsage(result.usage,state.policy,state.billingMode);Object.assign(call,{status:'completed',completedAt:new Date().toISOString(),...usage});
    let valid=true;try{inspectGrounding(task,result.value);}catch{valid=false;}
    const expected=[false,true,true,false,true,false];
    const passed=!blocked && valid && result.value.claims.every((c,i)=>c.supported===expected[i]);
    state.eventGrounding={version:regressionVersion,model:'claude-sonnet-4.6',passed,checkedAt:new Date().toISOString(),taskFingerprint:groundingFingerprint(task),task,cases:result.value?.claims?.map((c,i)=>({...c,expected:expected[i],passed:c.supported===expected[i]})) || []};save();
    if(!passed)throw new Error('Regressão de vínculo visual/bíblico reprovada.');
  }
  const activeCases=state.entries.filter(e=>e.mode==='sonnet-forced-holdout');
  if(activeCases.length!==4 || activeCases.some(e=>!e.passed) || !state.eventGrounding?.passed || state.visualDiversity?.cases?.length!==2 || state.visualDiversity.cases.some(c=>!c.passed))throw new Error('Conferência visual, factual ou de composição reprovada; ativação bloqueada.');
  state.health='completed';state.summary=modes.map(m=>({mode:m.id,passed:state.entries.filter(e=>e.mode===m.id && e.passed).length,total:m.holdout?holdoutFixtures.length:fixtures.length}));save();
}catch(e){state.health='blocked';state.message=String(e.message).slice(0,350);save();process.exitCode=1;}
console.log(JSON.stringify({health:state.health,summary:state.summary,publicationTriggered:false}));
