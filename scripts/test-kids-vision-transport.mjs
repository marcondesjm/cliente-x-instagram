import fs from 'node:fs';
import sharp from 'sharp';
import {randomUUID,createHash} from 'node:crypto';
import {sendVision,callAllowance} from '../lib/kids-scene-vision.js';
import {normalizeProviderUsage} from '../lib/platform-editorial-validation.js';
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
const modes=[{id:'base64-json',model:'claude-sonnet-4.6',transport:'base64',tool:false},{id:'url-json',model:'claude-sonnet-4.6',transport:'url',tool:false},{id:'base64-tool',model:'claude-sonnet-4.6',transport:'base64',tool:true},{id:'haiku-base64-json',model:'claude-haiku-4.5',transport:'base64',tool:false}];
try {
  for(const mode of modes)for(const fixture of fixtures) {
    const id=mode.id+':'+fixture.id;if(state.entries.some(e=>e.id===id))continue;
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
    try {r=await sendVision({key,model:mode.model,...(mode.transport==='url'?{imageUrl:fixture.scene.imageUrl}:{image}),prompt,maxOutputTokens:600,schema:mode.tool?schema:null});}
    catch(e){call.status='failed';call.completedAt=new Date().toISOString();call.httpStatus=e.httpStatus || null;state.circuit='request_failed';save();throw new Error('Teste interrompido por erro de transporte; sem repetição automática.');}
    const {blocked,...usage}=normalizeProviderUsage(r.usage,state.policy,state.billingMode);Object.assign(call,{status:'completed',completedAt:new Date().toISOString(),...usage,stopReason:r.stopReason});
    const value=JSON.parse(JSON.stringify(r.value).replaceAll(key,'[redacted]'));
    const passed=!blocked && value?.personInTree===fixture.expected.personInTree && value?.openBooks===fixture.expected.openBooks && value?.style===fixture.expected.style && typeof value?.description==='string' && value.description.length>=15 && (r.stopReason==='end_turn' || r.structured && r.stopReason==='tool_use');
    state.entries.push({id,mode:mode.id,fixture:fixture.id,model:mode.model,passed,value,expected:fixture.expected,checkedAt:new Date().toISOString(),sourceUrl:fixture.scene.imageUrl,imageHash:call.imageHash});
    if(blocked)state.circuit='invalid_usage_receipt';save();if(blocked)throw new Error('Recibo inválido no diagnóstico.');
  }
  state.health='completed';state.summary=modes.map(m=>({mode:m.id,passed:state.entries.filter(e=>e.mode===m.id && e.passed).length,total:fixtures.length}));save();
}catch(e){state.health='blocked';state.message=String(e.message).slice(0,350);save();process.exitCode=1;}
console.log(JSON.stringify({health:state.health,summary:state.summary,publicationTriggered:false}));
