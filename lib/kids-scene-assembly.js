import { createHash } from 'node:crypto';
import { safeSourceUrl, fetchSource, licensedScenes } from './kids-image-discovery.js';
import {assertAutomaticReview} from './kids-scene-review-proof.js';
export const hash = value=>createHash('sha256').update(Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
export const copyFingerprint=pack=>hash({reference:pack.biblicalReference,slides:pack.slides.map(({eyebrow,title,body})=>({eyebrow,title,body})),caption:(pack.caption || '').split('\n\nIlustrações:')[0]});
export function validateRecipe(recipe,pack) {
  if(!['editorially-reviewed','automatically-reviewed'].includes(recipe.status) || !recipe.reviewedAt || recipe.reference!==pack.biblicalReference || recipe.copyFingerprint!==copyFingerprint(pack)) throw new Error('Seleção ou texto precisa de revisão antes da montagem automática.');
  if(recipe.status==='automatically-reviewed')assertAutomaticReview(recipe);
  safeSourceUrl(recipe.url);
  if(recipe.selected.length!==pack.slides.length+1 || recipe.feed.length!==pack.slides.length || recipe.selected.some((s,i)=>s.sourceScene!==[...recipe.feed,recipe.story][i])) throw new Error('Mapa de cartões e Story incompleto.');
  if(new Set(recipe.selected.map(s=>s.sha256)).size!==recipe.selected.length || new Set(recipe.selected.map(s=>s.sourceScene)).size!==recipe.selected.length) throw new Error('Seleção contém cenas repetidas.');
  for(const scene of recipe.selected) {
    safeSourceUrl(scene.imageUrl,true);
    if(!/^[a-f0-9]{64}$/.test(scene.sha256) || !/^docs\/illustrations\/sabedoria-kids\/[a-z0-9-]+\/[a-zA-Z0-9_.-]+\.jpg$/.test(scene.path)) throw new Error('Arquivo de cena inválido.');
  }
}
export async function downloadScene(scene,fetchImpl=fetch) {
  safeSourceUrl(scene.imageUrl,true);
  const r=await fetchImpl(scene.imageUrl,{redirect:'error',signal:AbortSignal.timeout(45000)});
  if(!r.ok)throw new Error(`Imagem indisponível: HTTP ${r.status}.`);
  if(!/image\/jpeg/i.test(r.headers.get('content-type') || ''))throw new Error('A fonte não retornou JPEG.');
  const parts=[];let size=0;
  for await(const part of r.body){size+=part.byteLength;if(size>5_000_000)throw new Error('Imagem acima do limite de tamanho.');parts.push(Buffer.from(part));}
  const bytes=Buffer.concat(parts);
  if(bytes[0]!==255 || bytes[1]!==216 || hash(bytes)!==scene.sha256)throw new Error('Imagem mudou desde a revisão; não será usada automaticamente.');
  return bytes;
}
export async function assembleReviewedPack(recipe,pack,{readAsset,verifySource=async()=>licensedScenes(await fetchSource(recipe.url),recipe.url),fetchImpl=fetch}={}) {
  validateRecipe(recipe,pack);
  const source=await verifySource();
  if(source.termsHash!==recipe.termsHash || source.license!==recipe.license || source.licenseUrl!==recipe.licenseUrl)throw new Error('Licença ou termos mudaram desde a revisão.');
  const assets=[];
  for(const scene of recipe.selected) {
    if(!source.scenes.some(s=>s.imageUrl.split('?')[0]===scene.imageUrl.split('?')[0]))throw new Error('Cena não está mais disponível no conjunto revisado.');
    const existing=readAsset(scene.path);
    const bytes=existing || await downloadScene(scene,fetchImpl);
    if(hash(bytes)!==scene.sha256)throw new Error('Arquivo local diverge da cena revisada.');
    assets.push({path:scene.path,bytes});
  }
  const next=structuredClone(pack);
  next.slides.forEach((slide,i)=>Object.assign(slide,{imagePath:recipe.selected[i].path,imageLayout:'bible-illustration',imageAsIllustration:true,typographicOnly:false}));
  next.storySlide={...next.storySlide,eyebrow:'Bíblia Kids',title:next.slides[0].title,body:`Uma história para aprender em família. Leia ${next.biblicalReference} com um adulto.`,imagePath:recipe.selected.at(-1).path,imageLayout:'bible-illustration',imageAsIllustration:true,typographicOnly:false,preserveEngagementCopy:true};
  next.illustrationSource={sourceUrl:recipe.url,creator:'Sweet Publishing / FreeBibleimages.org',license:recipe.license,licenseUrl:recipe.licenseUrl,reviewedAt:recipe.reviewedAt,sceneAutomation:{status:'ready',recipeFingerprint:hash(recipe)}};
  next.caption=(next.caption || '').split('\n\nIlustrações:')[0]+`\n\nIlustrações: Sweet Publishing / FreeBibleimages.org. Fonte: ${recipe.url} Licença ${recipe.license} (${recipe.licenseUrl}). Adaptações: diagramação e textos em português, compartilhadas sob a mesma licença.`;
  next.illustrationSource.sceneAutomation.copyFingerprint=copyFingerprint(next);
  return {pack:next,assets};
}
