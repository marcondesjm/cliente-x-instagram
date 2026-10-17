import {createHash} from 'node:crypto';
import {assertGrounding,groundingFingerprint,sceneGroundingTask} from './editorial-grounding.js';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const reviewBinding=recipe=>digest({id:recipe.id,reference:recipe.reference,copyFingerprint:recipe.copyFingerprint,url:recipe.url,termsHash:recipe.termsHash,selected:recipe.selected.map(s=>({id:s.id,sourceScene:s.sourceScene,description:s.description,sha256:s.sha256,path:s.path,visualHash:s.visualHash,mirrorHash:s.mirrorHash})),feed:recipe.feed,story:recipe.story});
export function verseIsWithin(value,allowed) {
  const m=String(value || '').trim().replace(/[–—]/g,'-').match(/^(\d+):(\d+)(?:-(\d+))?$/);
  if(!m)return false;
  const chapter=Number(m[1]),start=Number(m[2]),end=Number(m[3] || m[2]);
  if(start<1 || end<start || end>176)return false;
  for(let verse=start;verse<=end;verse++)if(!allowed.includes(`${chapter}:${verse}`))return false;
  return true;
}
export function assertAutomaticReview(recipe) {
  const p=recipe.automaticReview;
  if(!p || p.version!=='kids-scene-review-v3-blind' || p.binding!==reviewBinding(recipe) || !p.calibrationPassed || !p.scriptureHash || !p.reviewedAt || p.selection?.decision!=='approve' || p.verification?.decision!=='approve')throw new Error('Prova da conferência automática ausente ou alterada.');
  const selected=recipe.selected;
  if(!Array.isArray(p.blindObservations) || p.blindObservations.length!==selected.length || p.blindObservations.some((o,i)=>o.id!==selected[i].id || o.sha256!==selected[i].sha256 || !/^[a-f0-9]{64}$/.test(o.imageHash || '') || !Number.isInteger(o.imageBytes) || o.imageBytes<1 || o.imageBytes>100000 || o.visible!==true || o.style!=='illustration' || o.childSuitable!==true || typeof o.observedEvent!=='string' || o.observedEvent.length<12 || o.observedEvent!==p.verification.cards[i]?.observedEvent))throw new Error('Leitura independente dos pixels ausente ou alterada.');
  if(p.selection.feed.length!==selected.length-1 || p.selection.story!==selected.at(-1).id || p.selection.feed.some((id,i)=>id!==selected[i].id))throw new Error('Seleção diverge da avaliação visual.');
  if(!Array.isArray(p.selection.evidence) || p.selection.evidence.length!==selected.length || p.selection.evidence.some((e,i)=>e.id!==selected[i].id || e.card!==i+1 || !verseIsWithin(e.verse,p.verseIds) || typeof e.reason!=='string' || e.reason.length<12))throw new Error('Justificativa de seleção por cartão ausente ou fora da passagem.');
  if(p.verification.cards.length!==selected.length || p.verification.cards.some((c,i)=>c.id!==selected[i].id || !['passageMatch','childSuitable','distinct','copyMatch'].every(k=>c[k]===true) || !verseIsWithin(c.verse,p.verseIds) || typeof c.reason!=='string' || c.reason.length<12 || typeof c.observedEvent!=='string' || c.observedEvent.length<12))throw new Error('A segunda avaliação não confirmou todos os cartões e o Story.');
  if(!['childSuitable','distinct','referenceAccurate'].every(k=>p.selection[k]===true))throw new Error('Conferência de segurança, repetição ou passagem reprovada.');
  const fact=p.factualReview;
  if(!fact?.task || !fact.result || fact.task.scopeReference!==recipe.reference || fact.fingerprint!==groundingFingerprint(fact.task))throw new Error('Conferência factual com fontes ausente ou alterada.');
  const passage={reference:recipe.reference,translation:'World English Bible',license:'Public Domain',urls:p.scriptureSources,verses:fact.task.sources};
  if(digest(passage)!==p.scriptureHash || JSON.stringify(fact.task.sources.map(s=>s.id))!==JSON.stringify(p.verseIds) || groundingFingerprint(sceneGroundingTask(recipe.selected,passage,p.verification.cards))!==fact.fingerprint)throw new Error('A fonte factual não corresponde à passagem integral e às cenas selecionadas.');
  assertGrounding(fact.task,fact.result);
}
