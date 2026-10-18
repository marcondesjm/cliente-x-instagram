import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync,mkdtempSync,mkdirSync,copyFileSync,writeFileSync,rmSync } from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
const account=JSON.parse(readFileSync('automation/instagram-template/config/accounts.json')).find(a=>a.account==='cliente-x');
const workflow=readFileSync('.github/workflows/instagram-feed-cliente-x.yml','utf8');
for (const cron of account.scheduleUtc) {
  const [m,h]=cron.split(' ').map(Number);
  assert.ok(workflow.includes(`- cron: "${m+7} ${h} * * *"`));
}
const fixture=mkdtempSync(join(tmpdir(),'restored-schedule-test-'));
const cfg=join(fixture,'automation/instagram-template/config');
mkdirSync(cfg,{recursive:true});mkdirSync(join(fixture,'scripts'));mkdirSync(join(fixture,'lib'));
writeFileSync(join(fixture,'package.json'),JSON.stringify({type:'module'}));
for(const p of ['scripts/select-due-auto-slot.mjs','lib/authorial-shortage.js','lib/education-strategy.js','lib/education-learning.js','lib/follower-series.js'])copyFileSync(p,join(fixture,p));
writeFileSync(join(cfg,'accounts.json'),JSON.stringify([{...account,automaticScheduleStartsAt:'2026-09-12T16:00:00Z',clientProfile:{status:'active'}}]));
for(const [name,data] of [['published-slots',[]],['watchdog-errors',[]],['publication-history',{}]])writeFileSync(join(cfg,name+'.json'),JSON.stringify(data));
function due(at) {
  const script=`const RealDate=Date; globalThis.Date=class extends RealDate { constructor(...args) { super(...(args.length?args:[${JSON.stringify(at)}])); } static now(){return new RealDate(${JSON.stringify(at)}).getTime();} }; await import('./scripts/select-due-auto-slot.mjs');`;
  const env={...process.env,ACCOUNT:'cliente-x',AUTO_POST_GRACE_MINUTES:'2'};
  delete env.GITHUB_ENV; delete env.GITHUB_OUTPUT;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:fixture,encoding:'utf8',env});
  assert.equal(result.status,0,result.stderr);
  return Object.fromEntries(result.stdout.trim().split('\n').map(x=>x.trim().split('=')));
}
try {
assert.equal(due('2026-09-12T15:50:00Z').has_due,'false','No catch-up of slots before restoration');
assert.equal(due('2026-09-12T16:01:00Z').has_due,'false','Respect grace period');
assert.equal(due('2026-09-12T16:03:00Z').slot_index,'5','Next slot 13h even with two posts already published today');
assert.equal(due('2026-09-13T09:33:00Z').slot_index,'0','13-slot agenda begins at 06:30 BRT');
assert.equal(due('2026-09-13T03:05:00Z').has_due,'false','Never recover a previous BRT day');
console.log('PASS: restored crons, no past-slot backlog, daily posts do not block Radar, grace and BRT boundaries.');

} finally {const target=resolve(fixture),parent=resolve(tmpdir());assert.ok(target.startsWith(parent+'\\')||target.startsWith(parent+'/'));assert.ok(target.includes('restored-schedule-test-'));rmSync(target,{recursive:true,force:true});}
