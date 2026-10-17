import sharp from 'sharp';
import { randomInt } from 'node:crypto';

export const VISION_VERSION='kids-scene-review-v1';
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
export async function sendVision({key,model,image,prompt,maxOutputTokens=2200,fetchImpl=fetch}) {
  if(!key || !/^claude-(haiku|sonnet)-[a-z0-9._-]{1,70}$/.test(model))throw new Error('Credencial ou modelo de visão não configurado.');
  if(!Buffer.isBuffer(image) || image.length>100_000 || prompt.length>30_000)throw new Error('Payload visual acima do limite.');
  const response=await fetchImpl('https://claude-ss.ia.br/v1/messages',{method:'POST',redirect:'error',signal:AbortSignal.timeout(180000),headers:{authorization:`Bearer ${key}`,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model,max_tokens:maxOutputTokens,temperature:0,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:image.toString('base64')}},{type:'text',text:prompt}]}]})});
  if(!response.ok)throw Object.assign(new Error(`Provedor de visão respondeu HTTP ${response.status}; sem repetição automática.`),{httpStatus:response.status});
  let bytes=0,body='';
  const decoder=new TextDecoder();
  for await(const chunk of response.body){bytes+=chunk.byteLength;if(bytes>200_000)throw new Error('Resposta visual acima do limite.');body+=decoder.decode(chunk,{stream:true});}
  const data=JSON.parse(body+decoder.decode());
  const usage={inputTokens:data.usage?.input_tokens,outputTokens:data.usage?.output_tokens};
  // Only numeric usage and parsed structured output are retained, never raw provider errors or credentials.
  const text=(data.content || []).filter(c=>c.type==='text').map(c=>c.text).join('\n');
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
