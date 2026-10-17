import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { hash, candidateDigest, canRequest, requestIllustration, checkApproval, sourceRevision } from '../lib/kids-illustration-generation.js';
import { bibleVisualIssues } from '../lib/bible-visual-standard.js';
import { packContentFingerprint } from '../lib/scheduled-content-guard.js';
const pack={biblicalReference:'Rute 1:6–18',slides:[{title:'Rute e Noemi',body:'Elas caminharam juntas.'}],caption:'Leitura em família',storySlide:{title:'Vamos ler juntos'}};
const bytes=[Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.from('test-card')]),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.from('test-story')])];
const candidate={id:'test',packId:'test',reference:pack.biblicalReference,sourceFingerprint:packContentFingerprint(pack),sourceRevision:sourceRevision(pack),planHash:'plan',status:'pending_review',images:bytes.map((b,i)=>({id:String(i),path:`docs/illustrations/sabedoria-kids/generated/test/${i}.png`,sha256:hash(b),promptHash:'prompt'}))};
const digest=candidateDigest(candidate);
const readAsset=p=>bytes[Number(path.basename(p,'.png'))];
checkApproval(candidate,digest,pack,packContentFingerprint,readAsset);
assert.throws(()=>checkApproval(candidate,'old-digest',pack,packContentFingerprint,readAsset),/diverge/);
assert.throws(()=>checkApproval(candidate,digest,{...pack,biblicalReference:'Outra passagem'},packContentFingerprint,readAsset),/referência/);
assert.throws(()=>checkApproval(candidate,digest,pack,packContentFingerprint,()=>bytes[0]),/alterada/);
assert.equal(canRequest([], '2026-10-17',0),false);
assert.equal(canRequest([{attempts:[{day:'2026-10-17',status:'reserved'}]}],'2026-10-17',1),false);
assert.equal(canRequest([{attempts:[{day:'2026-10-16'}]}],'2026-10-17',1),true);
assert.ok(bibleVisualIssues({...pack,illustrationSource:{generation:{status:'pending_review'}}}).some(x=>x.includes('aguardando revisão')));
let calls=0;
await requestIllustration('scene',{apiKey:'test-not-a-real-key',fetchImpl:async(url,options)=>{
  calls++; assert.equal(url,'https://api.openai.com/v1/images/generations'); const body=JSON.parse(options.body); assert.equal(body.model,'gpt-image-2'); assert.equal(body.n,1); assert.equal(body.output_format,'png'); assert.equal(body.response_format,undefined);
  return {ok:true,json:async()=>({data:[{b64_json:bytes[0].toString('base64')}]})};
}});
assert.equal(calls,1);
await assert.rejects(requestIllustration('scene',{apiKey:'test',fetchImpl:async()=>{calls++;return {ok:false,status:429};}}),/HTTP 429/);
assert.equal(calls,2,'Provider errors must not trigger a second paid request');
await assert.rejects(requestIllustration('scene',{apiKey:'test',fetchImpl:async()=>({ok:true,json:async()=>({data:[{b64_json:Buffer.from('not an image').toString('base64')}]})})}),/PNG/);

// Real Git integration using an isolated local bare repository: no external push.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kids-state-test-'));
const git=(cwd,args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
try {
  const bare=path.join(temp,'remote.git'),work=path.join(temp,'work'),other=path.join(temp,'other');
  fs.mkdirSync(work); git(temp,['init','--bare',bare]);git(work,['init','-b','main']);
  git(work,['config','user.name','Test']);git(work,['config','user.email','test@example.invalid']);
  fs.writeFileSync(path.join(work,'queue.json'),'[]\n');git(work,['add','.']);git(work,['commit','-m','base']);git(work,['remote','add','origin',bare]);git(work,['push','origin','main']);
  git(temp,['clone','--branch','main',bare,other]);git(other,['config','user.name','Test']);git(other,['config','user.email','test@example.invalid']);
  fs.writeFileSync(path.join(other,'queue.json'),JSON.stringify([{id:'other',status:'open'}]));git(other,['add','.']);git(other,['commit','-m','concurrent']);git(other,['push','origin','main']);
  fs.writeFileSync(path.join(work,'queue.json'),JSON.stringify([{id:'kids',status:'pending_review'}]));
  const asset='docs/illustrations/sabedoria-kids/generated/test/1.png';fs.mkdirSync(path.dirname(path.join(work,asset)),{recursive:true});fs.writeFileSync(path.join(work,asset),bytes[0]);
  execFileSync(process.execPath,[path.resolve('scripts/persist-instagram-state.mjs'),'queue.json',`--asset=${asset}`],{cwd:work,stdio:'pipe'});
  const stored=JSON.parse(git(bare,['show','main:queue.json']));assert.equal(stored.length,2);assert.ok(stored.some(x=>x.id==='other'));assert.ok(stored.some(x=>x.id==='kids'));
  assert.equal(git(bare,['ls-tree','-r','--name-only','main']).includes(asset),true);
} finally { fs.rmSync(temp,{recursive:true,force:true}); }
console.log('PASS: budget, interrupted reservations, provider contract, no paid retries, review digest, passage changes, image integrity, publication guard and concurrent Git asset persistence. API calls mocked; no paid generation performed.');
