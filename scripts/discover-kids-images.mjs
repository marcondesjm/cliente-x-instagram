import fs from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { englishReference, fetchSource, searchResults, licensedScenes } from '../lib/kids-image-discovery.js';
import { bibleVisualIssues } from '../lib/bible-visual-standard.js';
import { packContentFingerprint } from '../lib/scheduled-content-guard.js';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');process.chdir(ROOT);
const CONFIG='automation/instagram-template/config/';
const path=CONFIG+'kids-image-discovery.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const state=read(path), packs=read(CONFIG+'content-packs.json').find(g=>g.account==='sabedoria-kids').packs;
const history=read(CONFIG+'publication-history.json')['sabedoria-kids'] || [];
const limit=Math.min(28,Math.max(1,Number(process.argv.find(x=>x.startsWith('--limit='))?.split('=')[1] || 8)));
if(!Number.isInteger(limit))throw new Error('Limite de pesquisa inválido.');
const pending=packs.filter(pack=>bibleVisualIssues(pack,p=>fs.existsSync(p)).length && !history.some(entry=>entry.feedFingerprint===packContentFingerprint(pack) || entry.coverTitle===pack.slides[0]?.title));
pending.sort((a,b)=>String(state.entries.find(e=>e.id===a.id)?.attemptedAt || '').localeCompare(String(state.entries.find(e=>e.id===b.id)?.attemptedAt || '')));
let successful=0,failed=0;
const cache=new Map();
for(const pack of pending.slice(0,limit)) {
  const now=new Date().toISOString();
  const old=state.entries.find(e=>e.id===pack.id);
  let entry={...old,id:pack.id,title:pack.slides[0].title,reference:pack.biblicalReference,sourceFingerprint:packContentFingerprint(pack),attemptedAt:now,reviewStatus:'pending',publicationEnabled:false};
  if(old && (old.sourceFingerprint!==entry.sourceFingerprint || old.reference!==entry.reference)) {entry.candidates=[];entry.checkedAt=null;}
  try {
    const query=englishReference(pack.biblicalReference);
    const searchUrl=`https://www.freebibleimages.org/search/?s=${encodeURIComponent(query)}`;
    const results=searchResults(await fetchSource(searchUrl));
    const candidates=[], rejected=[];
    for(const result of results.slice(0,3)) {
      try {
        if(!cache.has(result.sourceUrl))cache.set(result.sourceUrl,await fetchSource(result.sourceUrl));
        const details=licensedScenes(cache.get(result.sourceUrl),result.sourceUrl);
        candidates.push({...result,...details,checkedAt:now,reviewStatus:'pending'});
        if(candidates.length>=2)break;
      } catch(error) {rejected.push({id:result.id,sourceUrl:result.sourceUrl,reason:error.message});}
    }
    entry={...entry,searchUrl,checkedAt:now,status:candidates.length?'found':'no_eligible_source',candidates,rejected,error:null};successful++;
    console.log(`${pack.id}: ${candidates.length} conjuntos licenciados; ${candidates.reduce((sum,x)=>sum+x.scenes.length,0)} cenas localizadas, aguardando revisão.`);
  } catch(error) {entry.status='error';entry.error=error.message;failed++;console.error(`${pack.id}: ${error.message} Dados anteriores preservados.`);}
  const index=state.entries.findIndex(e=>e.id===entry.id);if(index<0)state.entries.push(entry);else state.entries[index]=entry;
  fs.writeFileSync(path,JSON.stringify({...state,account:'sabedoria-kids',publicationEnabled:false,lastAttemptAt:now,lastRun:process.env.GITHUB_RUN_ID || null},null,2)+'\n');
}
const eligibleIds=new Set(pending.map(p=>p.id));
state.entries=state.entries.filter(entry=>eligibleIds.has(entry.id));
state.lastRun=process.env.GITHUB_RUN_ID || null;
state.lastAttemptAt=new Date().toISOString();
state.health=failed?(successful?'partial':'error'):'ok';
state.summary={pendingPacks:pending.length,checkedThisRun:successful+failed,failedThisRun:failed,foundPacks:state.entries.filter(e=>e.status==='found').length,sets:state.entries.reduce((sum,e)=>sum+(e.candidates?.length || 0),0)};
fs.writeFileSync(path,JSON.stringify(state,null,2)+'\n');
console.log(JSON.stringify(state.summary));
if(failed && !successful)process.exitCode=1;
