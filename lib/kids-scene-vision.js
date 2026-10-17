import sharp from 'sharp';
import { randomInt } from 'node:crypto';

export const VISION_VERSION='kids-scene-review-v2-grounded';
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
  if(state.circuit)throw new Error('Reposição pausada: '+state.circuit);
  if(state.calls.some(c=>c.status==='reserved'))throw new Error('Chamada anterior sem recibo; consumo precisa ser conferido.');
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const today=state.calls.filter(c=>c.day===day);
  if(today.length+required>state.policy.maxCallsPerDay)throw Object.assign(new Error('Limite diário de chamadas atingido.'),{code:'DAILY_LIMIT'});
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
export function verificationSchema(count=6) {
  return objectSchema({decision:{type:'string',enum:['approve','reject']},cards:{type:'array',minItems:count,maxItems:count,items:objectSchema({scene:{type:'integer',minimum:1,maximum:count},passageMatch:{type:'boolean'},childSuitable:{type:'boolean'},distinct:{type:'boolean'},copyMatch:{type:'boolean'},verse:verseSchema,reason:reasonSchema})}});
}
export async function sendVision({key,model,image=null,prompt,maxOutputTokens=2200,schema=null,fetchImpl=fetch}) {
  if(!key || !/^claude-(haiku|sonnet)-[a-z0-9._-]{1,70}$/.test(model))throw new Error('Credencial ou modelo de visão não configurado.');
  if((image!==null && (!Buffer.isBuffer(image) || image.length>100_000)) || prompt.length>30_000)throw new Error('Payload visual acima do limite.');
  const structured=schema?{tools:[{name:'submit_scene_review',description:'Retorna a avaliação completa das cenas bíblicas. Isto somente fornece dados estruturados; não executa ações nem publica conteúdo. Em caso de rejeição, decision=reject e campos de segurança correspondentes false. Inclua todas as posições em ordem, inclusive o Story como última posição, mesmo quando rejeitar o conjunto.',input_schema:schema}],tool_choice:{type:'auto'}}:{};
  const content=[...(image?[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:image.toString('base64')}}]:[]),{type:'text',text:prompt+(schema?'\nRetorne a resposta usando exclusivamente submit_scene_review com todos os campos do esquema. Não execute nenhuma outra ação.':'')}];
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
