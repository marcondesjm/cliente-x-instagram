import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const account=JSON.parse(readFileSync('automation/instagram-template/config/accounts.json')).find(a=>a.account==='cliente-x');
const workflow=readFileSync('.github/workflows/instagram-feed-cliente-x.yml','utf8');
for (const cron of account.scheduleUtc) {
  const [m,h]=cron.split(' ').map(Number);
  assert.ok(workflow.includes(`- cron: "${m+7} ${h} * * *"`));
}
function due(at) {
  const script=`const RealDate=Date; globalThis.Date=class extends RealDate { constructor(...args) { super(...(args.length?args:[${JSON.stringify(at)}])); } static now(){return new RealDate(${JSON.stringify(at)}).getTime();} }; await import('./scripts/select-due-auto-slot.mjs');`;
  const env={...process.env,ACCOUNT:'cliente-x',AUTO_POST_GRACE_MINUTES:'2'};
  delete env.GITHUB_ENV; delete env.GITHUB_OUTPUT;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8',env});
  assert.equal(result.status,0,result.stderr);
  return Object.fromEntries(result.stdout.trim().split('\n').map(x=>x.trim().split('=')));
}
assert.equal(due('2026-09-12T15:50:00Z').has_due,'false','No catch-up of slots before restoration');
assert.equal(due('2026-09-12T16:01:00Z').has_due,'false','Respect grace period');
assert.equal(due('2026-09-12T16:03:00Z').slot_index,'5','Next slot 13h even with two posts already published today');
assert.equal(due('2026-09-13T09:33:00Z').slot_index,'0','13-slot agenda begins at 06:30 BRT');
assert.equal(due('2026-09-13T03:05:00Z').has_due,'false','Never recover a previous BRT day');
console.log('PASS: restored crons, no past-slot backlog, daily posts do not block Radar, grace and BRT boundaries.');
