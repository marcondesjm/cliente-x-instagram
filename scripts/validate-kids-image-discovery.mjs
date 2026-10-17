import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { englishReference, safeSourceUrl, searchResults, licensedScenes, fetchSource } from '../lib/kids-image-discovery.js';
assert.equal(englishReference('Êxodo 3:1–12'),'Exodus 3:1-12');
assert.equal(englishReference('1 Samuel 3:1–10'),'1 Samuel 3:1-10');
assert.throws(()=>englishReference('Livro desconhecido 2'),/tradução/);
for(const url of ['http://www.freebibleimages.org/search/','https://evil.example/search/','https://www.freebibleimages.org@evil.example/search/','https://www.freebibleimages.org/private/'])assert.throws(()=>safeSourceUrl(url));
assert.throws(()=>safeSourceUrl('https://media.freebibleimages.org/other/file.jpg',true));
const row=['Moses and the Burning Bush','FB_Moses_Burning_Bush','illustrations','moses-burning-bush','Exodus 3–4','God tells Moses to lead the Hebrew slaves.','Sweet Publishing','25',false,0,'3',7];
const encoded=Buffer.from(JSON.stringify([row,[...row.slice(0,6),'Different Creator'],[...row.slice(0,3),'../../private',...row.slice(4)]])).toString('base64');
assert.equal(searchResults(`<div data-stories="${encoded}"></div>`).length,1);
assert.throws(()=>searchResults('<html>Service temporarily unavailable</html>'),/alterado/);
assert.deepEqual(searchResults('<span class="result-count">(0)</span>'),[]);
const image='https://media.freebibleimages.org/stories/FB_Moses_Burning_Bush/source-jpeg/01_FB_Moses_Burning_Bush_1024.jpg';
const thumb='https://media.freebibleimages.org/stories/FB_Moses_Burning_Bush/overview-thumbnails/01_FB_Moses_Burning_Bush_Thumbnail.jpg';
const scene=`<a href="${image}" data-slideshow-caption="Moses approaches the burning bush and listens carefully. – Slide 1"><img src="${thumb}"></a>`;
const fixture=`<div id="info-contributor">Contributed by <a href="/contributors/sweet/">Sweet Publishing</a></div><img title="Commercial use permitted"><img title="Derivative works permitted"><div class="link-panel" id="licence-panel"><a href="https://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0 Unported license</a><p>Individual images can be used on web pages, blogs and social media with attribution to Sweet Publishing / FreeBibleimages.org.</p><div class="panel-buttons"></div></div>${scene}${scene}<a href="${image.replace('/01_','/25_')}" data-slideshow-caption="Slide 25"><img src="${thumb}"></a>`;
const url='https://www.freebibleimages.org/illustrations/moses-burning-bush/';
assert.equal(licensedScenes(fixture,url).scenes.length,1,'duplicate images and credit-only end cards excluded');
assert.equal(licensedScenes(fixture,url).license,'CC BY-SA 3.0');
for(const altered of [fixture.replace('/by-sa/','/by-nc/'),fixture.replace('Commercial use permitted','Commercial use prohibited'),fixture.replace('Sweet Publishing</a>','Other</a>'),fixture.replace('Individual images can','NonCommercial. Individual images can')])assert.throws(()=>licensedScenes(altered,url),/Licença/);
assert.throws(()=>licensedScenes(fixture.replaceAll('media.freebibleimages.org','evil.example'),url),/Nenhuma cena/);
await assert.rejects(fetchSource(url,{fetchImpl:async()=>new Response('blocked',{status:503})}),/HTTP 503/);
await assert.rejects(fetchSource(url,{fetchImpl:async()=>new Response('not html',{headers:{'content-type':'image/jpeg'}})}),/HTML/);
await assert.rejects(fetchSource(url,{maxBytes:2,fetchImpl:async()=>new Response('large page',{headers:{'content-type':'text/html'}})}),/tamanho/);
let redirect;
await fetchSource(url,{fetchImpl:async(_url,options)=>{redirect=options.redirect;return new Response('safe',{headers:{'content-type':'text/html'}});}});assert.equal(redirect,'error');
const state=JSON.parse(fs.readFileSync('automation/instagram-template/config/kids-image-discovery.json'));
assert.equal(state.publicationEnabled,false);
for(const entry of state.entries) {assert.equal(entry.publicationEnabled,false);assert.equal(entry.reviewStatus,'pending');for(const set of entry.candidates || []){assert.equal(set.reviewStatus,'pending');safeSourceUrl(set.sourceUrl);for(const scene of set.scenes){safeSourceUrl(scene.imageUrl,true);safeSourceUrl(scene.thumbnailUrl,true);}}}
// Exercise the real collector CLI against a failed source in an isolated workspace.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kids-discovery-test-'));
try {
  for(const dir of ['scripts','lib','automation/instagram-template/config'])fs.mkdirSync(path.join(temp,dir),{recursive:true});
  fs.writeFileSync(path.join(temp,'package.json'),'{"type":"module"}');
  for(const file of ['scripts/discover-kids-images.mjs','lib/bible-visual-standard.js','lib/scheduled-content-guard.js'])fs.copyFileSync(file,path.join(temp,file));
  fs.writeFileSync(path.join(temp,'lib/kids-image-discovery.js'),fs.readFileSync('lib/kids-image-discovery.js','utf8').replace("from 'entities'",`from '${import.meta.resolve('entities')}'`));
  const config='automation/instagram-template/config/';
  const pack=JSON.parse(fs.readFileSync(config+'content-packs.json')).find(g=>g.account==='sabedoria-kids').packs.find(p=>p.id==='kids-biblia-02');
  const old=state.entries.find(e=>e.id===pack.id);
  assert.ok(old?.candidates?.length,'A persisted real research fixture is required');
  fs.writeFileSync(path.join(temp,config+'content-packs.json'),JSON.stringify([{account:'sabedoria-kids',packs:[pack]}]));
  fs.writeFileSync(path.join(temp,config+'publication-history.json'),'{"sabedoria-kids":[]}');
  fs.writeFileSync(path.join(temp,config+'kids-image-discovery.json'),JSON.stringify({...state,entries:[old]}));
  fs.writeFileSync(path.join(temp,'network.mjs'),`globalThis.fetch=async url=>String(url).includes('/search/')?new Response(${JSON.stringify(`<div data-stories="${encoded}"></div>`)},{headers:{'content-type':'text/html'}}):new Response('temporarily unavailable',{status:503});`);
  let exitStatus=0;
  try {execFileSync(process.execPath,['--import',pathToFileURL(path.join(temp,'network.mjs')).href,'scripts/discover-kids-images.mjs','--limit=1'],{cwd:temp,stdio:'pipe'});}catch(error){exitStatus=error.status;assert.match(String(error.stderr),/HTTP 503/);}
  assert.equal(exitStatus,1);
  const after=JSON.parse(fs.readFileSync(path.join(temp,config+'kids-image-discovery.json')));
  assert.equal(after.health,'error');assert.equal(after.entries[0].status,'error');
  assert.deepEqual(after.entries[0].candidates,old.candidates,'A source outage must preserve prior findings');
  assert.equal(after.entries[0].checkedAt,old.checkedAt,'Failure must not refresh successful-check timestamp');
} finally {fs.rmSync(temp,{recursive:true,force:true});}
console.log('PASS: search parsing, reference translation, licence rejection, source allowlist, duplicate/credit-card filtering, bounded downloads, failure handling and review-only catalogue.');
