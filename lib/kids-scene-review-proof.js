import {createHash} from 'node:crypto';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const reviewBinding=recipe=>digest({id:recipe.id,reference:recipe.reference,copyFingerprint:recipe.copyFingerprint,url:recipe.url,termsHash:recipe.termsHash,selected:recipe.selected.map(s=>({id:s.id,sourceScene:s.sourceScene,sha256:s.sha256,path:s.path,visualHash:s.visualHash,mirrorHash:s.mirrorHash})),feed:recipe.feed,story:recipe.story});
export function assertAutomaticReview(recipe) {
  const p=recipe.automaticReview;
  if(!p || p.version!=='kids-scene-review-v1' || p.binding!==reviewBinding(recipe) || !p.calibrationPassed || !p.scriptureHash || !p.reviewedAt || p.selection?.decision!=='approve' || p.verification?.decision!=='approve')throw new Error('Prova da conferência automática ausente ou alterada.');
  const selected=recipe.selected;
  if(p.selection.feed.length!==selected.length-1 || p.selection.story!==selected.at(-1).id || p.selection.feed.some((id,i)=>id!==selected[i].id))throw new Error('Seleção diverge da avaliação visual.');
  if(p.verification.cards.length!==selected.length || p.verification.cards.some((c,i)=>c.id!==selected[i].id || !['passageMatch','childSuitable','distinct','copyMatch'].every(k=>c[k]===true) || !p.verseIds.includes(c.verse) || typeof c.reason!=='string' || c.reason.length<12))throw new Error('A segunda avaliação não confirmou todos os cartões e o Story.');
  if(!['childSuitable','distinct','referenceAccurate'].every(k=>p.selection[k]===true))throw new Error('Conferência de segurança, repetição ou passagem reprovada.');
}
