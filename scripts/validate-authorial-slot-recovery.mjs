import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=mkdtempSync(join(tmpdir(),'authorial-slot-test-'));
const cfg=join(root,'automation/instagram-template/config');
mkdirSync(cfg,{recursive:true});mkdirSync(join(root,'scripts'));mkdirSync(join(root,'lib'));
writeFileSync(join(root,'package.json'),JSON.stringify({type:'module'}));
for(const p of ['scripts/select-due-auto-slot.mjs','lib/authorial-shortage.js','lib/education-strategy.js','lib/education-learning.js','lib/follower-series.js'])copyFileSync(p,join(root,p));
const save=(name,data)=>writeFileSync(join(cfg,name+'.json'),JSON.stringify(data));
const incident={account:'cliente-x',date:'2026-10-18',slotIndex:2,status:'open',stage:'content-selection',error:'Radar visual sem foto inédita e reserva autoral esgotada.'};
save('accounts',[{account:'cliente-x',scheduleUtc:['0 10 * * *','0 11 * * *','0 12 * * *'],clientProfile:{status:'active'}}]);
save('published-slots',[]);save('publication-history',{});
function due(at){
 const code=`const RealDate=Date;globalThis.Date=class extends RealDate {constructor(...args){super(...(args.length?args:[${JSON.stringify(at)}]));}static now(){return new RealDate(${JSON.stringify(at)}).getTime();}};await import('./scripts/select-due-auto-slot.mjs');`;
 const env={...process.env,ACCOUNT:'cliente-x'};delete env.GITHUB_ENV;delete env.GITHUB_OUTPUT;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:root,encoding:'utf8',env});assert.equal(r.status,0,r.stderr);
 return Object.fromEntries(r.stdout.trim().split('\n').map(s=>s.trim().split('=')));
}
try{
 save('watchdog-errors',[incident]);
 let selected=due('2026-10-19T03:35:00Z');assert.equal(selected.slot_index,'2');assert.equal(selected.slot_date,'2026-10-18');assert.equal(selected.scheduled_at,'2026-10-18T12:00:00.000Z');
 save('publication-history',{'cliente-x':[{slotDate:'2026-10-18',slotIndex:2,mediaId:'published'}]});assert.equal(due('2026-10-19T03:35:00Z').has_due,'false');save('publication-history',{});
 save('published-slots',[{account:'cliente-x',date:'2026-10-18',slotIndex:2,status:'published'}]);assert.equal(due('2026-10-19T03:35:00Z').has_due,'false');save('published-slots',[]);
 save('watchdog-errors',[{...incident,status:'resolved'}]);assert.equal(due('2026-10-19T03:35:00Z').has_due,'false');
 save('watchdog-errors',[{...incident,stage:'token'}]);assert.equal(due('2026-10-19T03:35:00Z').has_due,'false');
 save('watchdog-errors',[]);assert.equal(due('2026-10-19T12:03:00Z').slot_date,'2026-10-19');
 save('watchdog-errors',[incident]);assert.equal(due('2026-10-20T03:35:00Z').has_due,'false');
 console.log('PASS: actual selector recovers only recorded previous-day shortage with original metadata, never completed or unrelated slots.');
}finally{
 const target=resolve(root),parent=resolve(tmpdir());assert.ok(target.startsWith(parent+'\\')||target.startsWith(parent+'/'));assert.ok(target.includes('authorial-slot-test-'));rmSync(target,{recursive:true,force:true});
}
