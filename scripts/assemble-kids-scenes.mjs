import fs from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { hash, copyFingerprint, validateRecipe, assembleReviewedPack } from '../lib/kids-scene-assembly.js';
import { packContentFingerprint } from '../lib/scheduled-content-guard.js';
import { assertBibleVisualStandard } from '../lib/bible-visual-standard.js';
import { persistState } from './persist-instagram-state.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');process.chdir(ROOT);
const CONFIG='automation/instagram-template/config/';
const STATE=CONFIG+'kids-scene-automation.json',PACKS=CONFIG+'content-packs.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const state=read(STATE), groups=read(PACKS),recipes=read(CONFIG+'kids-reviewed-scenes.json');
state.entries=state.entries.filter(entry=>recipes.some(recipe=>recipe.id===entry.id));
const packs=groups.find(g=>g.account==='sabedoria-kids').packs;
const account=read(CONFIG+'accounts.json').find(a=>a.account==='sabedoria-kids');
const history=read(CONFIG+'publication-history.json')['sabedoria-kids'] || [];
const paths=[];let failures=0;
for(const recipe of recipes) {
  const pack=packs.find(p=>p.id===recipe.id);if(!pack)continue;
  const previous=state.entries.find(e=>e.id===recipe.id),now=new Date().toISOString();
  let entry={id:recipe.id,title:pack.slides[0].title,recipeFingerprint:hash(recipe),checkedAt:now,workflowRun:process.env.GITHUB_RUN_ID || null};
  if(recipe.status==='review-rejected') {
    entry={...entry,status:'blocked',renderVerified:false,message:recipe.rejectionReason || 'Seleção em quarentena; não montar nem publicar.'};
    if(pack.illustrationSource)pack.illustrationSource.sceneAutomation={status:'blocked',reason:entry.message};
    const index=state.entries.findIndex(e=>e.id===entry.id);if(index<0)state.entries.push(entry);else state.entries[index]=entry;
    console.log(`${recipe.id}: quarentena preservada, sem downloads, render ou publicação.`);
    continue;
  }
  try {
    validateRecipe(recipe,pack);
    if(history.some(e=>e.feedFingerprint===packContentFingerprint(pack) || e.coverTitle===pack.slides[0].title)) {
      entry.status='already_published';entry.message='Conteúdo já publicado; não foi remontado nem republicado.';
    } else {
      const intact=recipe.selected.every(s=>fs.existsSync(s.path) && hash(fs.readFileSync(s.path))===s.sha256);
      const reusable=previous?.status==='ready' && previous.recipeFingerprint===hash(recipe) && previous.packFingerprint===hash(pack) && intact && Date.now()-Date.parse(previous.verifiedAt)<24*60*60*1000;
      if(reusable) {
        entry={...previous,checkedAt:now,workflowRun:process.env.GITHUB_RUN_ID || null};
        console.log(`${recipe.id}: montagem já validada, sem refazer.`);
      } else {
        const assembled=await assembleReviewedPack(recipe,pack,{readAsset:p=>fs.existsSync(p)?fs.readFileSync(p):null});
        for(const asset of assembled.assets){fs.mkdirSync(dirname(asset.path),{recursive:true});fs.writeFileSync(asset.path,asset.bytes);paths.push(asset.path);}
        assertBibleVisualStandard(assembled.pack,account,p=>fs.existsSync(p));
        execFileSync(process.execPath,['automation/instagram-template/scripts/publish-carousel.mjs','--account','sabedoria-kids','--render-only'],{
          stdio:'inherit',env:{...process.env,DRY_RUN:'true',INSTAGRAM_TEMPLATE_AUTOMATIC_RUN:'false',INSTAGRAM_TEMPLATE_PACK_JSON:JSON.stringify(assembled.pack)}
        });
        Object.assign(pack,assembled.pack);
        entry={...entry,status:'ready',verifiedAt:new Date().toISOString(),packFingerprint:hash(pack),copyFingerprint:copyFingerprint(pack),renderVerified:true,message:'Carrossel e Story montados e validados; disponíveis para a programação existente.'};
        console.log(`${recipe.id}: montagem automática pronta.`);
      }
    }
  } catch(error) {
    failures++;entry.status='blocked';entry.message=String(error.message).slice(0,800);
    if(pack.illustrationSource)pack.illustrationSource.sceneAutomation={status:'blocked',reason:entry.message};
    console.error(`${recipe.id}: bloqueado — ${entry.message}`);
  }
  const index=state.entries.findIndex(e=>e.id===entry.id);if(index<0)state.entries.push(entry);else state.entries[index]=entry;
}
state.account='sabedoria-kids';state.publicationTriggered=false;state.lastRun=process.env.GITHUB_RUN_ID || null;state.checkedAt=new Date().toISOString();state.health=failures?'needs_attention':'ok';
state.summary={reviewedRecipes:recipes.length,ready:state.entries.filter(e=>e.status==='ready').length,blocked:state.entries.filter(e=>e.status==='blocked').length,alreadyPublished:state.entries.filter(e=>e.status==='already_published').length};
fs.writeFileSync(STATE,JSON.stringify(state,null,2)+'\n');fs.writeFileSync(PACKS,JSON.stringify(groups,null,2)+'\n');
if(process.argv.includes('--persist'))persistState([STATE,PACKS],[...new Set(paths)]);
console.log(JSON.stringify({ok:!failures,...state.summary,publicationTriggered:false}));
if(failures)process.exitCode=1;
