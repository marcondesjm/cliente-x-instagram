import assert from 'node:assert/strict';
import sodium from 'libsodium-wrappers';
import handler, { scheduleFromTimes } from '../api/schedule.js';
import { createSessionCookie } from '../lib/auth.js';
import { saveInstagramGithubSecrets } from '../lib/github-secrets.js';
import { readFileSync } from 'node:fs';

assert.deepEqual(scheduleFromTimes(['22:00','07:00']), ['0 10 * * *','0 1 * * *']);
for (const invalid of [[], ['24:00'], ['09:60'], ['09:00','09:00']]) assert.throws(()=>scheduleFromTimes(invalid));
process.env.ADMIN_EMAIL='test@example.invalid';
process.env.ADMIN_PASSWORD='fixture-password-only';
process.env.ADMIN_SESSION_SECRET='fixture-session-only';
process.env.ADMIN_USERS_JSON=JSON.stringify([{email:'limited@example.invalid',password:'fixture-only',role:'user',accounts:['other']}]);
process.env.GITHUB_TOKEN='fixture-token';
const cookie=email=>createSessionCookie(email).split(';')[0];
const accounts=[{account:'kids',scheduleUtc:['0 10 * * *']},{account:'other',scheduleUtc:['0 11 * * *']}];
let written=null;
globalThis.fetch=async(url,options)=>options.method==='PUT'
 ? (written=JSON.parse(options.body),{ok:true})
 : {ok:true,json:async()=>({sha:'fixture-sha',content:Buffer.from(JSON.stringify(accounts)).toString('base64')})};
async function request(email, account, times) {
  const res={setHeader(){},status(code){this.code=code;return this;},json(value){this.value=value;return this;}};
  await handler({method:'POST',headers:{cookie:cookie(email)},body:{account,times}},res);
  return res;
}
assert.equal((await request('limited@example.invalid','kids',['08:00'])).code,403);
assert.equal(written,null);
assert.equal((await request('test@example.invalid','kids',['08:00'])).code,200);
const saved=JSON.parse(Buffer.from(written.content,'base64').toString());
assert.deepEqual(saved[0].scheduleUtc,['0 11 * * *']);
assert.deepEqual(saved[1],accounts[1]);
accounts[0].automaticScheduleStartsAt='2020-01-01T00:00:00Z';
assert.equal((await request('test@example.invalid','kids',['08:00'])).code,409);
await sodium.ready;
const pair=sodium.crypto_box_keypair();
let secretWrites=0;
await saveInstagramGithubSecrets({accessTokenEnv:'KIDS_INSTAGRAM_ACCESS_TOKEN',userIdEnv:'KIDS_INSTAGRAM_USER_ID'},'fixture-instagram-token','123','fixture-github-token',async(url,opts)=>{
  if(url.endsWith('/public-key')) return {ok:true,json:async()=>({key_id:'fixture-key',key:sodium.to_base64(pair.publicKey,sodium.base64_variants.ORIGINAL)})};
  const body=JSON.parse(opts.body);
  assert.ok(!opts.body.includes('fixture-instagram-token'));
  const plain=sodium.to_string(sodium.crypto_box_seal_open(sodium.from_base64(body.encrypted_value,sodium.base64_variants.ORIGINAL),pair.publicKey,pair.privateKey));
  assert.equal(plain,url.endsWith('ACCESS_TOKEN')?'fixture-instagram-token':'123');
  secretWrites++;
  return {ok:true};
});
assert.equal(secretWrites,2);
const realAccounts=JSON.parse(readFileSync('automation/instagram-template/config/accounts.json','utf8'));
const kids=realAccounts.find(a=>a.account==='sabedoria-kids');
assert.equal(kids.scheduleUtc.length,12);
assert.equal(kids.clientProfile.status,'onboarding');
assert.equal(kids.contentProfile.curatedOnly,true);
const groups=JSON.parse(readFileSync('automation/instagram-template/config/content-packs.json','utf8'));
const packs=groups.find(g=>g.account===kids.account).packs;
assert.equal(packs.length,36);
assert.equal(new Set(packs.map(p=>p.slides[0].title)).size,36);
assert.ok(packs.every(p=>p.biblicalReference&&!p.caption.includes('#inteligenciaartificial')));
console.log('PASS: agenda BRT, autorização por conta, isolamento, slots existentes, secrets criptografados e 36 pautas bíblicas.');
