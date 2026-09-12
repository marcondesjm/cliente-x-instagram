import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { normalizeGrowthPlan, updateGrowthRecord } from '../lib/growth-plan.js';
import handler from '../api/state.js';
import { createSessionCookie } from '../lib/auth.js';

assert.equal(normalizeGrowthPlan().periods.before.reach, null);
assert.equal(normalizeGrowthPlan({periods:{before:{reach:0}}}).periods.before.reach, 0);
for (const value of [-1, 1.5, true, 'invalid', Infinity]) assert.throws(() => normalizeGrowthPlan({periods:{before:{reach:value}}}));
assert.throws(() => normalizeGrowthPlan({startDate:'2026-02-30'}));
assert.throws(() => normalizeGrowthPlan({bio:'a'.repeat(151)}));
const first = updateGrowthRecord([], 'cliente-x', {bio:'Teste'}, 0);
assert.equal(first.record.revision, 1);
assert.throws(() => updateGrowthRecord(first.records, 'cliente-x', {}, 0), /outra sessão/);
assert.equal(updateGrowthRecord(first.records, 'cliente-y', {}, 0).records.length, 2);

process.env.ADMIN_EMAIL = 'owner@example.test';
process.env.ADMIN_PASSWORD = 'test-only-password';
process.env.ADMIN_SESSION_SECRET = 'test-only-session-secret';
process.env.ADMIN_USERS_JSON = JSON.stringify([{email:'limited@example.test',password:'test',accounts:['cliente-y']}]);
process.env.GITHUB_TOKEN = 'test-only-token';
let records = [], writes = 0;
global.fetch = async (url, options = {}) => {
  if (String(url).includes('accounts.json')) return new Response(JSON.stringify({content:Buffer.from(JSON.stringify([{account:'cliente-x'},{account:'cliente-y'}])).toString('base64')}));
  assert.ok(String(url).includes('growth-plans.json'), 'Only growth config may be accessed');
  if (options.method === 'PUT') { records = JSON.parse(Buffer.from(JSON.parse(options.body).content, 'base64')); writes++; return new Response('{}'); }
  return new Response(JSON.stringify({sha:'test-sha',content:Buffer.from(JSON.stringify(records)).toString('base64')}));
};
async function call(body, email='owner@example.test') {
  const req = Readable.from([JSON.stringify(body)]);
  req.method='POST'; req.query={}; req.headers={cookie:email ? createSessionCookie(email).split(';')[0] : ''};
  const result={}; const res={setHeader(){},status(code){result.status=code;return this;},json(body){result.body=body;}};
  await handler(req,res); return result;
}
assert.equal((await call({action:'load-growth-plan',account:'cliente-x'},null)).status,401);
assert.equal((await call({action:'load-growth-plan',account:'cliente-x'},'limited@example.test')).status,403);
assert.equal((await call({action:'load-growth-plan',account:'cliente-x'})).body.record,null);
assert.equal((await call({action:'save-growth-plan',account:'cliente-x',revision:0,plan:{bio:'Minha bio',periods:{after:{sales:0}}}})).status,200);
assert.equal((await call({action:'load-growth-plan',account:'cliente-x'})).body.record.plan.periods.after.sales,0);
assert.equal((await call({action:'load-growth-plan',account:'cliente-y'},'limited@example.test')).body.record,null);
assert.equal((await call({action:'save-growth-plan',account:'cliente-x',revision:0,plan:{}})).status,409);
assert.equal((await call({action:'save-growth-plan',account:'cliente-x',revision:1,plan:{bio:'x'.repeat(151)}})).status,400);
assert.equal(writes,1);
const html=readFileSync('docs/dashboard.html','utf8');
for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
new vm.Script(readFileSync('docs/growth-panel.js','utf8'));
assert.ok(html.includes("growth: ['growthPanel']"));
assert.ok(html.includes('data-dashboard-view="growth"'));
console.log('PASS: missing vs zero, input validation, account isolation, authorization, persisted roundtrip, revision conflict, dashboard script syntax.');
