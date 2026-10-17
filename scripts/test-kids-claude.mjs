import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// Manual diagnostic only: no publisher, schedules, approval or state persistence.
export async function testClaude({key, image, expectedHash, vision=false, provider='anthropic', fetchImpl=fetch}) {
  const endpoints={anthropic:'https://api.anthropic.com', 'claude-ss':'https://claude-ss.ia.br'};
  const base=endpoints[provider];
  const result={provider,endpoint:base || null,authentication:false,vision:false,publicationTriggered:false,automaticApprovalEnabled:false};
  if(!base)return {...result,status:'unsupported_provider'};
  if(!key?.trim())return {...result,status:'missing_secret'};
  const headers={'anthropic-version':'2023-06-01','content-type':'application/json',...(provider==='anthropic'?{'x-api-key':key}:{authorization:`Bearer ${key}`})};
  async function request(path,body) {
    const response=await fetchImpl(base+'/v1/'+path,{method:body?'POST':'GET',headers,redirect:'error',signal:AbortSignal.timeout(60000),...(body?{body:JSON.stringify(body)}:{})});
    // Never log server error text, headers or credentials.
    if(!response.ok)throw Object.assign(new Error('API request failed'),{httpStatus:response.status});
    return response.json();
  }
  try {
    result.stage='models';
    const models=await request('models?limit=100');
    if(!Array.isArray(models.data))return {...result,status:'invalid_models_response'};
    result.authentication=true;
    if(!vision)return {...result,status:'authenticated'};
    const model=['claude-haiku-4-5-20251001','claude-haiku-4-5','claude-haiku-5-5'].find(id=>models.data.some(m=>m.id===id));
    if(!model)return {...result,status:'test_model_unavailable'};
    if(!Buffer.isBuffer(image) || image.length>1_000_000 || image[0]!==255 || image[1]!==216 || createHash('sha256').update(image).digest('hex')!==expectedHash)return {...result,status:'invalid_test_image'};
    result.model=model;
    result.stage='vision';
    const response=await request('messages',{model,max_tokens:160,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:image.toString('base64')}},{type:'text',text:'Teste de leitura visual. Descreva em português, em uma frase curta, somente o que aparece na imagem. Não aprove publicação e não invente uma referência bíblica.'}]}]});
    result.vision=Array.isArray(response.content) && response.content.some(c=>c.type==='text' && c.text?.trim());
    // Response text is deliberately omitted: this diagnostic does not evaluate editorial quality.
    result.usage={inputTokens:response.usage?.input_tokens ?? null,outputTokens:response.usage?.output_tokens ?? null};
    return {...result,status:result.vision?'vision_response_received':'invalid_vision_response'};
  } catch(error) {
    return {...result,status:error.httpStatus===401?'invalid_credentials':error.httpStatus===402?'billing_required':error.httpStatus===429?'rate_limited':'request_failed',httpStatus:error.httpStatus || null};
  }
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const recipe=JSON.parse(fs.readFileSync('automation/instagram-template/config/kids-reviewed-scenes.json','utf8'))[0];
  const scene=recipe.selected[0];
  const result=await testClaude({key:process.env.KIDS_VISION_ANTHROPIC_API_KEY,image:fs.readFileSync(scene.path),expectedHash:scene.sha256,vision:process.env.KIDS_VISION_TEST==='true',provider:process.env.KIDS_VISION_PROVIDER || 'anthropic'});
  const receipt={...result,checkedAt:new Date().toISOString(),workflowRun:process.env.GITHUB_RUN_ID || null};
  fs.mkdirSync('output/claude-test',{recursive:true});
  fs.writeFileSync('output/claude-test/result.json',JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify(receipt,null,2));
  if(!['authenticated','vision_response_received'].includes(result.status))process.exitCode=1;
}
