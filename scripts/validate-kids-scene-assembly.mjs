import os from 'node:os';import path from 'node:path';import {execFileSync} from 'node:child_process';
import fs from 'node:fs';import assert from 'node:assert/strict';import {hash,copyFingerprint,validateRecipe,assembleReviewedPack,downloadScene} from '../lib/kids-scene-assembly.js';import {assertBibleVisualStandard} from '../lib/bible-visual-standard.js';import {mergeState} from './persist-instagram-state.mjs';
const recipes=JSON.parse(fs.readFileSync('automation/instagram-template/config/kids-reviewed-scenes.json'));
const packs=JSON.parse(fs.readFileSync('automation/instagram-template/config/content-packs.json')).find(g=>g.account==='sabedoria-kids').packs;
const recipe=recipes[0],pack=packs.find(p=>p.id===recipe.id);validateRecipe(recipe,pack);
assert.throws(()=>validateRecipe({...recipe,status:'found'},pack),/revisão/);
const changed=structuredClone(pack);changed.slides[1].body+=' Mudança.';assert.throws(()=>validateRecipe(recipe,changed),/revisão/);
const repeated=structuredClone(recipe);repeated.selected[1].sha256=repeated.selected[0].sha256;assert.throws(()=>validateRecipe(repeated,pack),/repetidas/);
assert.throws(()=>validateRecipe({...recipe,selected:recipe.selected.slice(1)},pack),/incompleto/);
const source={termsHash:recipe.termsHash,license:recipe.license,licenseUrl:recipe.licenseUrl,scenes:recipe.selected};
assert.throws(()=>validateRecipe({...recipe,status:'review-rejected'},pack),/revisão/);
const options={readAsset:p=>fs.readFileSync(p),verifySource:async()=>source};
const first=await assembleReviewedPack(recipe,pack,options);const again=await assembleReviewedPack(recipe,first.pack,options);
assert.deepEqual(first.pack,again.pack);assert.equal(copyFingerprint(first.pack),recipe.copyFingerprint);assert.equal(first.pack.caption.split('Ilustrações:').length,2);assert.notEqual(first.pack.storySlide.imagePath,first.pack.slides[0].imagePath);
assertBibleVisualStandard(first.pack,{contentProfile:{visualStandard:'illustrated-bible'}},()=>true);
await assert.rejects(assembleReviewedPack(recipe,pack,{...options,verifySource:async()=>({...source,termsHash:'changed'})}),/termos mudaram/);
await assert.rejects(assembleReviewedPack(recipe,pack,{...options,verifySource:async()=>({...source,scenes:[]})}),/disponível/);
await assert.rejects(assembleReviewedPack(recipe,pack,{...options,readAsset:()=>Buffer.from('corrupt')}),/diverge/);
let calls=0;const downloaded=await assembleReviewedPack(recipe,pack,{...options,readAsset:()=>null,fetchImpl:async url=>{calls++;const item=recipe.selected.find(s=>s.imageUrl===url);return new Response(fs.readFileSync(item.path),{headers:{'content-type':'image/jpeg'}});}});assert.equal(calls,6);assert.equal(downloaded.assets.length,6);
await assert.rejects(downloadScene(recipe.selected[0],async()=>new Response('changed',{headers:{'content-type':'image/jpeg'}})),/mudou/);
const edited=structuredClone(first.pack);edited.slides[0].title+=' Changed';assert.throws(()=>assertBibleVisualStandard(edited,{contentProfile:{visualStandard:'illustrated-bible'}}),/texto alterado/);
const blocked=structuredClone(first.pack);blocked.illustrationSource.sceneAutomation.status='blocked';assert.throws(()=>assertBibleVisualStandard(blocked,{contentProfile:{visualStandard:'illustrated-bible'}}),/bloqueada/);
assert.deepEqual(mergeState([{account:'kids',packs:[]}],[{account:'kids',packs:[{id:'new'}]}],[{account:'kids',packs:[]},{account:'other',packs:[{id:'keep'}]}]),[{account:'kids',packs:[{id:'new'}]},{account:'other',packs:[{id:'keep'}]}]);

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kids-assembly-git-'));
const git=(cwd,args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
try {
 const remote=path.join(temp,'remote.git'),work=path.join(temp,'work'),other=path.join(temp,'other');fs.mkdirSync(work);
 git(temp,['init','--bare',remote]);git(work,['init','-b','main']);git(work,['config','user.name','Test']);git(work,['config','user.email','test@example.invalid']);
 fs.writeFileSync(path.join(work,'packs.json'),JSON.stringify([{account:'kids',packs:[]} ]));git(work,['add','.']);git(work,['commit','-m','base']);git(work,['remote','add','origin',remote]);git(work,['push','origin','main']);
 git(temp,['clone','--branch','main',remote,other]);git(other,['config','user.name','Test']);git(other,['config','user.email','test@example.invalid']);
 fs.writeFileSync(path.join(other,'packs.json'),JSON.stringify([{account:'kids',packs:[]},{account:'other',packs:[{id:'keep'}]}]));git(other,['add','.']);git(other,['commit','-m','concurrent account']);git(other,['push','origin','main']);
 fs.writeFileSync(path.join(work,'packs.json'),JSON.stringify([{account:'kids',packs:[{id:'new'}]}]));const asset='docs/illustrations/sabedoria-kids/test/01.jpg';fs.mkdirSync(path.dirname(path.join(work,asset)),{recursive:true});fs.writeFileSync(path.join(work,asset),Buffer.from([255,216,255,217]));
 execFileSync(process.execPath,[path.resolve('scripts/persist-instagram-state.mjs'),'packs.json','--asset='+asset],{cwd:work,stdio:'pipe'});
 const stored=JSON.parse(git(remote,['show','main:packs.json']));assert.equal(stored.length,2);assert.equal(stored.find(x=>x.account==='other').packs[0].id,'keep');assert.equal(stored.find(x=>x.account==='kids').packs[0].id,'new');assert.ok(git(remote,['ls-tree','-r','--name-only','main']).includes(asset));
} finally {fs.rmSync(temp,{recursive:true,force:true});}

console.log('PASS: approved recipe binding, text-change blocking, source/terms verification, download integrity, idempotent assembly, distinct Story, blocked-publication guard and concurrent account preservation. No Meta calls.');
