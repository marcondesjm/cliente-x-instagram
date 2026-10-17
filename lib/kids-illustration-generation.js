import { createHash } from 'node:crypto';
export const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export function scenePrompt(pack, scene, index) {
  return `Ilustração editorial para Bíblia infantil, aquarela digital acolhedora, cores naturais luminosas, anatomia cuidadosa, cena completa e composição equilibrada. Sem texto, letras, moldura, livro, logotipo ou marca d'água. Não copiar artistas nem personagens de franquias. Pessoas e roupas coerentes com o contexto do antigo Oriente Próximo. Sem violência gráfica, sangue, terror ou representação física de Deus. Manter os personagens coerentes nesta história.\nPassagem: ${pack.biblicalReference}. Tema: ${pack.slides[0].title}.\nCena ${index + 1}: ${scene}.\nMostrar somente esta cena, sem inventar acontecimentos. É ilustração interpretativa, não fotografia histórica. Formato horizontal com a cena ocupando a área; sem grandes espaços decorativos vazios.`;
}
export function candidateDigest(candidate) {
  return hash({ id:candidate.id, sourceFingerprint:candidate.sourceFingerprint, sourceRevision:candidate.sourceRevision, planHash:candidate.planHash, images:candidate.images.map(({id,path,sha256,promptHash})=>({id,path,sha256,promptHash})) });
}
export const sourceRevision = pack => hash({slides:pack.slides,caption:pack.caption,reference:pack.biblicalReference,storySlide:pack.storySlide});
export function canRequest(queue, day, limit) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 12) return false;
  return queue.flatMap(x=>x.attempts || []).filter(x=>x.day===day).length < limit;
}
export function checkApproval(candidate, digest, pack, fingerprint, readAsset) {
  if(candidate.status!=='pending_review' || digest!==candidateDigest(candidate)) throw new Error('Lote não está pronto ou código de revisão diverge.');
  if(fingerprint(pack)!==candidate.sourceFingerprint) throw new Error('A pauta mudou desde a geração; revisar novamente.');
  if(sourceRevision(pack)!==candidate.sourceRevision || pack.biblicalReference!==candidate.reference) throw new Error('A referência ou os textos mudaram desde a geração.');
  if(candidate.images.length!==pack.slides.length+1) throw new Error('Faltam ilustrações de cartões ou Story.');
  const hashes=new Set();
  for(const image of candidate.images) {
    if(!/^docs\/illustrations\/sabedoria-kids\/generated\/[a-zA-Z0-9/_-]+\.png$/.test(image.path) || hash(readAsset(image.path))!==image.sha256) throw new Error('Imagem ausente ou alterada desde a revisão.');
    hashes.add(image.sha256);
  }
  if(hashes.size!==candidate.images.length) throw new Error('Imagens repetidas no lote.');
}
export async function requestIllustration(prompt, {apiKey, fetchImpl=fetch}={}) {
  if(!apiKey) throw new Error('Cadastre KIDS_OPENAI_API_KEY nos secrets do GitHub.');
  const response=await fetchImpl('https://api.openai.com/v1/images/generations',{
    method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({model:'gpt-image-2',prompt,n:1,size:'1536x1024',quality:'medium',output_format:'png'}),signal:AbortSignal.timeout(240000)
  });
  // Never log raw provider responses or retry an ambiguous billable request.
  if(!response.ok) throw new Error(`Serviço de imagens respondeu HTTP ${response.status}; tentativa registrada, sem repetição automática.`);
  const result=await response.json();
  const b64=result.data?.[0]?.b64_json;
  if(typeof b64!=='string' || b64.length>35_000_000 || !/^[A-Za-z0-9+/=\r\n]+$/.test(b64)) throw new Error('Imagem inválida recebida.');
  const bytes=Buffer.from(b64,'base64');
  if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Resposta não contém PNG válido.');
  return {bytes,usage:result.usage || null};
}
