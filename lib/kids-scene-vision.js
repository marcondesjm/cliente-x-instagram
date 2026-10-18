import {dailyCallLimit} from './editorial-daily-budget.js';
import sharp from 'sharp';
import { randomInt,createHash } from 'node:crypto';

export const VISION_VERSION='kids-scene-review-v4-visual';
const pilotScopes=new WeakMap();
export function beginDiagnosticPilot(state,id,packId,now=new Date()) {
  if(state.enabled || !/^kids-biblia-\d{2}$/.test(packId) || !['vision_validation_failed','semantic_false_positive',null].includes(state.circuit))throw new Error('Piloto exige rotina desativada, uma pauta explícita e nenhum bloqueio de consumo ou transporte.');
  if(state.calls.some(c=>c.status==='reserved'))throw new Error('Piloto bloqueado por chamada anterior sem recibo.');
  state.pilotRun={id,packId,status:'running',startedAt:now.toISOString(),expiresAt:new Date(now.getTime()+25*60*1000).toISOString(),maxCalls:10,maxInputTokens:1200000};
  state.health='pilot_running';state.message=`Piloto diagnóstico da pauta ${packId} em execução; reposição recorrente permanece bloqueada.`;
  pilotScopes.set(state,{id,circuit:state.circuit});
}
export function reviewCircuitBlocked(state) {
  const scope=pilotScopes.get(state);
  return Boolean(state.circuit && !(scope && state.circuit===scope.circuit));
}
export function endDiagnosticPilot(state,now=new Date()) {
  if(!pilotScopes.has(state))return;
  state.pilotRun.status=state.entries?.some(e=>e.id===state.pilotRun.packId && e.status==='reviewed' && Date.parse(e.checkedAt)>=Date.parse(state.pilotRun.startedAt))?'reviewed':'rejected';
  state.pilotRun.completedAt=now.toISOString();
  if(state.pilotRun.status==='reviewed' && state.circuit===pilotScopes.get(state).circuit){state.health='pilot_reviewed';state.message='Piloto com seleção automaticamente revisada; montagem, render oficial e ativação continuam sendo etapas separadas.';}
  pilotScopes.delete(state);
}
// Leave room for selection, comparison and factual review even at maximum usage.
export const reviewPoolLimit=policy=>Math.max(0,Math.min(12,policy.maxCallsPerDay-3,Math.floor(policy.maxInputTokensPerDay/policy.maxInputTokensPerCall)-3));
export const BLIND_SCENE_PROMPT='Observe somente os pixels desta imagem individual. Você não recebe história, legenda, passagem ou proposta de publicação. Não tente adivinhar nomes ou acontecimentos bíblicos. Descreva em até duas frases a ação principal, os participantes e a composição visível (posição, enquadramento, ambiente e objetos grandes). Não adivinhe nomes próprios, falas, emoções ou acontecimentos. Se um objeto for incerto, descreva somente a forma/posição visível, sem decidir que é cama, livro ou barco por suposição. Se não conseguir ver com clareza, visible=false. childSuitable exige ausência de violência gráfica, nudez e medo intenso. Retorne SOMENTE JSON: {"visible":true,"style":"illustration ou photo ou unknown","childSuitable":true,"observedEvent":"ação principal e ambiente concretamente visíveis"}.';
export function blindSceneSchema() {return {type:'object',additionalProperties:false,required:['visible','style','childSuitable','observedEvent'],properties:{visible:{type:'boolean'},style:{type:'string',enum:['illustration','photo','unknown']},childSuitable:{type:'boolean'},observedEvent:{type:'string',minLength:12,maxLength:500}}};}
export function assertBlindScene(value) {
  if(value?.visible!==true || value.style!=='illustration' || value.childSuitable!==true || typeof value.observedEvent!=='string' || value.observedEvent.length<12 || value.observedEvent.length>500)throw new Error('Pixels individuais não confirmados ou cena inadequada.');
}
export function cachedBlindObservation(state,scene,promptHash,now=new Date()) {
  const cached=state.pixelCache?.[scene.sha256],o=cached?.observation;
  if(cached?.version!==VISION_VERSION || cached.model!==state.model || cached.promptHash!==promptHash || !(Date.parse(cached.checkedAt)+24*60*60*1000>now.getTime()) || o?.id!==scene.id || o.sha256!==scene.sha256 || !/^[a-f0-9]{64}$/.test(o.imageHash || '') || !Number.isInteger(o.imageBytes) || o.imageBytes<1 || o.imageBytes>100000)return null;
  try{assertBlindScene(o);}catch{return null;}
  return o;
}
export async function individualSceneImage(bytes) {
  for(const [width,height,quality] of [[768,576,65],[640,480,55],[576,432,45]]) {
    const image=await sharp(bytes,{limitInputPixels:20_000_000}).rotate().resize(width,height,{fit:'inside',withoutEnlargement:true}).jpeg({quality}).toBuffer();
    if(image.length<=100_000)return image;
  }
  throw new Error('Cena individual excede limite visual.');
}
export const reviewImageManifest=images=>images.map(({id,bytes})=>({id,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}));
export async function labelledReviewImages(scenes) {
  for(const width of [640,576,512,448,384,320]) {
    const images=await Promise.all(scenes.map(async s=>({id:s.id,bytes:await sharp(s.bytes,{limitInputPixels:20_000_000}).rotate().resize(width,Math.round(width*.75),{fit:'inside',withoutEnlargement:true}).jpeg({quality:45}).toBuffer()})));
    if(images.reduce((n,s)=>n+s.bytes.length,0)<=100000)return images;
  }
  throw new Error('Imagens individuais da revisão excedem limite visual.');
}
// Source slide numbers differ from the review sheet labels after ranking/deduplication.
export const promptSceneDescription=value=>String(value).replace(/\s*(?:[–—-]\s*)?Slide\s+\d+\s*$/i,'').trim();
export function recoverTransientCalls(state,now=new Date()) {
  if(state.billingMode!=='fixed_plan_user_confirmed')return false;
  if(state.circuit && state.circuit!=='provider_temporarily_unavailable')return false;
  let changed=false;
  for(const call of state.calls.filter(c=>c.status==='reserved' && Date.parse(c.startedAt)+30*60*1000<=now.getTime())) {
    // The review job has a 25 minute deadline; an older reservation is no longer an active request.
    call.status='interrupted';call.completedAt=now.toISOString();call.inputTokens=null;call.error='Workflow interrompido antes do recibo.';
    state.circuit='provider_temporarily_unavailable';state.retryAfter=new Date(Date.parse(call.startedAt)+60*60*1000).toISOString();changed=true;
  }
  if(state.circuit==='provider_temporarily_unavailable' && Date.parse(state.retryAfter)<=now.getTime()) {
    state.circuit=null;delete state.retryAfter;changed=true;
  }
  return changed;
}
export function parseObject(text) {
  const clean=String(text).trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  const value=JSON.parse(clean);
  if(!value || typeof value!=='object' || Array.isArray(value))throw new Error('Resposta visual fora do formato esperado.');
  return value;
}
export function callAllowance(state,now=new Date(),required=1) {
  if(reviewCircuitBlocked(state))throw new Error('Reposição pausada: '+state.circuit);
  if(state.calls.some(c=>c.status==='reserved'))throw new Error('Chamada anterior sem recibo; consumo precisa ser conferido.');
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const scope=pilotScopes.get(state);
  if(scope) {
    const p=state.pilotRun,calls=state.calls.filter(c=>c.pilotId===scope.id);
    const used=calls.reduce((n,c)=>n+(Number.isSafeInteger(c.inputTokens)?c.inputTokens:state.policy.maxInputTokensPerCall),0);
    if(state.enabled || p.id!==scope.id || p.status!=='running' || Date.parse(p.expiresAt)<=now.getTime() || calls.length+required>Math.min(10,p.maxCalls) || used+required*state.policy.maxInputTokensPerCall>Math.min(1200000,p.maxInputTokens))throw Object.assign(new Error('Janela ou limite do piloto diagnóstico atingido.'),{code:'DAILY_LIMIT'});
    return day;
  }
  const today=state.calls.filter(c=>c.day===day);
  if(today.length+required>dailyCallLimit(state,day))throw Object.assign(new Error('Limite diário de chamadas atingido.'),{code:'DAILY_LIMIT'});
  const used=today.reduce((n,c)=>n+(Number.isSafeInteger(c.inputTokens)?c.inputTokens:state.policy.maxInputTokensPerCall),0);
  if(used+required*state.policy.maxInputTokensPerCall>state.policy.maxInputTokensPerDay)throw Object.assign(new Error('Limite diário de tokens atingido.'),{code:'DAILY_LIMIT'});
  return day;
}
const objectSchema=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const verseSchema={type:'string',pattern:'^[0-9]+:[0-9]+(?:-[0-9]+)?$'};
const reasonSchema={type:'string',minLength:12,maxLength:800};
export function selectionSchema(poolSize,cardCount=5) {
  const scene={type:'integer',minimum:1,maximum:poolSize};
  return objectSchema({decision:{type:'string',enum:['approve','reject']},feed:{type:'array',minItems:cardCount,maxItems:cardCount,items:scene},story:scene,childSuitable:{type:'boolean'},distinct:{type:'boolean'},referenceAccurate:{type:'boolean'},evidence:{type:'array',minItems:cardCount+1,maxItems:cardCount+1,items:objectSchema({card:{type:'integer',minimum:1,maximum:cardCount+1,description:'Posição 1 até 5 = cartão. Posição 6 = Story. Forneça todas em ordem.'},scene,verse:verseSchema,reason:reasonSchema})}});
}
export function verificationSchema(count=6,verseIds=[]) {
  const schema=objectSchema({decision:{type:'string',enum:['approve','reject']},cards:{type:'array',minItems:count,maxItems:count,items:objectSchema({position:{type:'integer',minimum:1,maximum:count},observationId:{type:'string',pattern:'^[a-f0-9]{16}$',description:'Copie o observationId da posição avaliada. Nunca renumere ou troque a imagem.'},pixelMatch:{type:'boolean',description:'Julgue SOMENTE se a observação original corresponde aos pixels desta imagem, independentemente da passagem ou do texto. Incompatibilidade semântica não torna pixelMatch falso.'},passageMatch:{type:'boolean',description:'A ação visível e o contexto da ilustração licenciada são compatíveis com a passagem, sem exigir nomes escritos na imagem.'},childSuitable:{type:'boolean'},distinct:{type:'boolean',description:'False para o mesmo desenho, espelho, recorte ou composição quase idêntica. Mesmo personagem, lugar ou tema não é repetição; ações ou enquadramentos diferentes podem ser distintos.'},copyMatch:{type:'boolean',description:'Compatibilidade semântica com título e corpo do cartão, não cópia literal. Atividade familiar usa uma cena bíblica relacionada sem encenar a atividade.'},verse:{type:'string',pattern:'^(?:[0-9]+:[0-9]+(?:-[0-9]+)?)?$'},reason:reasonSchema})}});
  if(verseIds.length)schema.properties.cards.items.properties.verse={type:'string',enum:['',...verseIds]};
  return schema;
}
export function bindVerificationObservations(result,observations) {
  if(!Array.isArray(result?.cards) || result.cards.length!==observations.length)throw new Error('Avaliação sem todas as posições.');
  const rows=[...result.cards].sort((a,b)=>a.position-b.position);
  if(rows.some((c,i)=>c.position!==i+1 || c.observationId!==observations[i].id || (Object.hasOwn(c,'observedEvent') || Object.hasOwn(c,'depictedEvent'))))throw new Error('A avaliação alterou a identidade da imagem ou tentou reescrever a observação.');
  return {...result,cards:rows.map((c,i)=>({...c,scene:c.position,observedEvent:observations[i].observedEvent}))};
}
export async function sendVision({key,model,image=null,images=null,imageUrl=null,prompt,maxOutputTokens=2200,schema=null,forceTool=false,toolDescription=null,fetchImpl=fetch}) {
  if(!key || !/^claude-(haiku|sonnet)-[a-z0-9._-]{1,70}$/.test(model))throw new Error('Credencial ou modelo de visão não configurado.');
  if((image!==null && (!Buffer.isBuffer(image) || image.length>100_000)) || prompt.length>30_000)throw new Error('Payload visual acima do limite.');
  if(images!==null && (image || imageUrl || !Array.isArray(images) || images.length<1 || images.length>6 || images.some(s=>!Buffer.isBuffer(s.bytes) || !/^[a-f0-9]{16}$/.test(s.id)) || images.reduce((n,s)=>n+s.bytes.length,0)>100000))throw new Error('Conjunto visual inválido ou acima do limite.');
  if(imageUrl!==null) {
    const u=new URL(imageUrl);
    if(image || u.protocol!=='https:' || u.hostname!=='media.freebibleimages.org' || (u.port && u.port!=='443') || u.username || u.password || !/^\/stories\/[a-zA-Z0-9_-]+\/source-jpeg\/[a-zA-Z0-9_.-]+\.jpg$/.test(u.pathname))throw new Error('URL visual fora da fonte pública permitida.');
  }
  const structured=schema?{tools:[{name:'submit_scene_review',description:toolDescription || 'Retorna a avaliação completa das cenas bíblicas. Isto somente fornece dados estruturados; não executa ações nem publica conteúdo. Em caso de rejeição, decision=reject e campos de segurança correspondentes false. Inclua todas as posições em ordem, inclusive o Story como última posição, mesmo quando rejeitar o conjunto.',input_schema:schema}],tool_choice:forceTool?{type:'tool',name:'submit_scene_review'}:{type:'auto'}}:{};
  const content=[...(images?images.flatMap((s,i)=>[{type:'text',text:`Cena ${i+1} (${s.id}):`},{type:'image',source:{type:'base64',media_type:'image/jpeg',data:s.bytes.toString('base64')}}]):image?[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:image.toString('base64')}}]:imageUrl?[{type:'image',source:{type:'url',url:imageUrl}}]:[]),{type:'text',text:prompt+(schema?'\nRetorne a resposta usando exclusivamente submit_scene_review com todos os campos do esquema. Não execute nenhuma outra ação.':'')}];
  const response=await fetchImpl('https://claude-ss.ia.br/v1/messages',{method:'POST',redirect:'error',signal:AbortSignal.timeout(180000),headers:{authorization:`Bearer ${key}`,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model,max_tokens:maxOutputTokens,temperature:0,...structured,messages:[{role:'user',content}]})});
  if(!response.ok)throw Object.assign(new Error(`Provedor de visão respondeu HTTP ${response.status}; sem repetição automática.`),{httpStatus:response.status});
  let bytes=0,body='';
  const decoder=new TextDecoder();
  for await(const chunk of response.body){bytes+=chunk.byteLength;if(bytes>200_000)throw new Error('Resposta visual acima do limite.');body+=decoder.decode(chunk,{stream:true});}
  const data=JSON.parse(body+decoder.decode());
  const usage={inputTokens:data.usage?.input_tokens,outputTokens:data.usage?.output_tokens};
  // Only numeric usage and parsed structured output are retained, never raw provider errors or credentials.
  const text=(data.content || []).filter(c=>c.type==='text').map(c=>c.text).join('\n');
  if(schema) {
    const tools=(data.content || []).filter(c=>c.type==='tool_use');
    if(tools.length===1 && tools[0].name==='submit_scene_review' && tools[0].input && typeof tools[0].input==='object' && !Array.isArray(tools[0].input))return {usage,stopReason:data.stop_reason,structured:true,value:tools[0].input};
  }
  try {return {usage,stopReason:data.stop_reason,value:parseObject(text)};}
  catch {return {usage,stopReason:data.stop_reason,value:null,invalidResponseText:String(text).replaceAll(key,'[redacted]').slice(0,5000)};}
}
export async function calibrationImage() {
  const colors=['red','green','blue','yellow'].sort(()=>randomInt(3)-1),code=String(randomInt(100000,999999));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240">${colors.map((c,i)=>`<rect x="${i%2*160}" y="${Math.floor(i/2)*120}" width="160" height="120" fill="${c}"/>`).join('')}<rect x="45" y="90" width="230" height="60" fill="white"/><text x="160" y="133" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="bold" fill="black">${code}</text></svg>`;
  return {image:await sharp(Buffer.from(svg)).jpeg({quality:60}).toBuffer(),expected:{code,colors}};
}
export const CALIBRATION_PROMPT='Teste de leitura real de pixels. Leia o código de seis dígitos no centro e as cores dos quatro quadrantes da imagem, na ordem superior esquerdo, superior direito, inferior esquerdo, inferior direito. Responda SOMENTE JSON: {"code":"seis dígitos","colors":["cor","cor","cor","cor"]}. Use nomes de cores em inglês: red, green, blue, yellow. Se não conseguir ver, responda {"code":"unreadable","colors":[]}. Não adivinhe.';
export async function visualSignature(bytes,mirror=false) {
  let pipeline=sharp(bytes,{limitInputPixels:20_000_000}).rotate();
  if(mirror)pipeline=pipeline.flop();
  const pixels=await pipeline.resize(9,8,{fit:'fill'}).greyscale().raw().toBuffer();
  let bits='';for(let y=0;y<8;y++)for(let x=0;x<8;x++)bits+=pixels[y*9+x]>pixels[y*9+x+1]?'1':'0';
  return BigInt('0b'+bits).toString(16).padStart(16,'0');
}
export function signatureDistance(a,b) {
  if(!/^[a-f0-9]{16}$/.test(a || '') || !/^[a-f0-9]{16}$/.test(b || ''))throw new Error('Assinatura visual inválida.');
  return (BigInt('0x'+a)^BigInt('0x'+b)).toString(2).replace(/0/g,'').length;
}
export function similarScenes(a,b) {
  return a.sha256===b.sha256 || [a.visualHash,a.mirrorHash].some(x=>[b.visualHash,b.mirrorHash].some(y=>signatureDistance(x,y)<=6));
}
export async function contactSheet(scenes) {
  if(scenes.length<1 || scenes.length>18)throw new Error('Quantidade inválida de cenas.');
  const width=720,cellWidth=240,cellHeight=200,height=Math.ceil(scenes.length/3)*cellHeight;
  const layers=[];
  for(const [i,s] of scenes.entries()) {
    const image=await sharp(s.bytes,{limitInputPixels:20_000_000}).rotate().resize(cellWidth,170,{fit:'contain',background:'white'}).jpeg({quality:45}).toBuffer();
    const label=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="30"><rect width="240" height="30" fill="white"/><text x="8" y="23" font-family="sans-serif" font-size="21" fill="black">Cena ${i+1}</text></svg>`);
    layers.push({input:image,left:i%3*cellWidth,top:Math.floor(i/3)*cellHeight},{input:label,left:i%3*cellWidth,top:Math.floor(i/3)*cellHeight+170});
  }
  const pixels=await sharp({create:{width,height,channels:3,background:'white'}}).composite(layers).png().toBuffer();
  for(const quality of [42,32,24,18]) {
    const sheet=await sharp(pixels).jpeg({quality}).toBuffer();
    if(sheet.length<=100_000)return sheet;
  }
  throw new Error('Prancha de cenas excede limite de consumo.');
}

export function assertVisionReadiness(state,diagnostics,now=new Date()) {
  const fresh=stamp=>Number.isFinite(Date.parse(stamp)) && now.getTime()-Date.parse(stamp)>=0 && now.getTime()-Date.parse(stamp)<24*60*60*1000;
  const cases=diagnostics.entries?.filter(e=>e.mode==='sonnet-forced-holdout') || [];
  if(cases.length!==4 || new Set(cases.map(e=>e.fixture)).size!==4 || cases.some(e=>!e.passed || e.model!==state.model || !fresh(e.checkedAt)))throw new Error('Teste visual independente ausente, reprovado ou vencido.');
  const g=diagnostics.eventGrounding;
  if(g?.version!=='depicted-event-v4' || !g.passed || g.model!==state.reasoningModel || !fresh(g.checkedAt) || g.cases?.length!==6 || g.cases.some((c,i)=>!c.passed || c.supported!==c.expected || c.expected!==[false,true,true,false,true,false][i]))throw new Error('Regressão factual positiva/negativa ausente, reprovada ou vencida.');
  const diversity=diagnostics.visualDiversity;
  if(diversity?.version!=='visual-diversity-v1' || diversity.model!==state.reasoningModel || !fresh(diversity.checkedAt) || diversity.cases?.length!==2 || diversity.cases.some((c,i)=>!c.passed || c.distinct!==c.expected || c.expected!==[true,false][i]))throw new Error('Conferência de composições distintas/espelhadas ausente ou reprovada.');
  return {checkedAt:now.toISOString(),visualCases:4,factualCases:6,diversityCases:2,model:state.model,reasoningModel:state.reasoningModel};
}

export function bindVerifiedPassage(result,observations,passage) {
  const review=bindVerificationObservations(result,observations);
  return {...review,cards:review.cards.map(c=>{
    const verse=passage.verses.find(v=>v.id===c.verse);
    if(!verse && c.passageMatch)throw new Error('Vínculo bíblico não aponta a um versículo exato da passagem.');
    return {...c,depictedEvent:verse?.text || ''};
  })};
}
