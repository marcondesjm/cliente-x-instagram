import {assertVisionReadiness,VISION_VERSION} from './kids-scene-vision.js';
import {validateRecipe,hash} from './kids-scene-assembly.js';
import {groundingPrompt} from './editorial-grounding.js';

export function assertSceneActivation({state,recipes,packs,assembled,diagnostics,readAsset,now=new Date()}) {
  if(![null,undefined,'vision_validation_failed','semantic_false_positive'].includes(state.circuit))throw new Error('Bloqueio de consumo ou transporte não pode ser liberado pela ativação.');
  const accuracyGate=assertVisionReadiness(state,diagnostics,now);
  if(!state.calibration?.passed || state.calibration.version!==VISION_VERSION || state.calibration.model!==state.model || state.billingMode!=='fixed_plan_user_confirmed')throw new Error('Calibração ou plano não confirmado.');
  const pilot=state.pilotRun;
  if(pilot?.status!=='reviewed')throw new Error('Piloto com seleção aprovada ausente.');
  const recipe=recipes.find(r=>r.id===pilot.packId && r.status==='automatically-reviewed');
  const pack=packs.find(p=>p.id===pilot.packId),receipt=assembled.entries.find(e=>e.id===pilot.packId);
  if(!recipe || !pack)throw new Error('Seleção aprovada do piloto ausente.');
  validateRecipe(recipe,pack);
  if(Date.parse(recipe.reviewedAt)<Date.parse(pilot.startedAt) || now.getTime()-Date.parse(recipe.reviewedAt)>24*60*60*1000)throw new Error('Revisão não pertence ao piloto atual ou venceu.');
  if(!['ready','already_published'].includes(receipt?.status) || receipt.renderVerified!==true || receipt.recipeFingerprint!==hash(recipe) || receipt.packFingerprint!==hash(pack) || Date.parse(receipt.verifiedAt)<Date.parse(recipe.reviewedAt) || now.getTime()-Date.parse(receipt.verifiedAt)>24*60*60*1000)throw new Error('Montagem e render atuais não confirmados.');
  if(recipe.selected.some(s=>{const bytes=readAsset(s.path);return !bytes || hash(bytes)!==s.sha256;}))throw new Error('Arquivos divergem da revisão.');
  const calls=state.calls.filter(c=>c.pilotId===pilot.id && c.status==='completed');
  if(!calls.some(c=>c.stage==='verify:'+recipe.id && c.imageFingerprint===recipe.automaticReview.visualReview.imageHash) || !calls.some(c=>c.stage==='facts:'+recipe.id && c.promptFingerprint===hash(groundingPrompt(recipe.automaticReview.factualReview.task))))throw new Error('Recibos visuais/factuais do piloto ausentes.');
  return {checkedAt:now.toISOString(),pilotId:pilot.id,recipeId:recipe.id,previousCircuit:state.circuit,renderVerifiedAt:receipt.verifiedAt,accuracyGate};
}
