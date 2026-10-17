import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/private-metrics.js';
import {createSessionCookie} from '../lib/auth.js';
process.env.ADMIN_EMAIL='owner@example.invalid';
process.env.ADMIN_PASSWORD='fixture-password';
process.env.ADMIN_SESSION_SECRET='fixture-secret';
const accounts=JSON.parse(fs.readFileSync('automation/instagram-template/config/accounts.json','utf8'));
for(const key of ['cliente-x','sabedoria-kids']) {
  const account=accounts.find(a=>a.account===key);
  process.env[account.accessTokenEnv]='fixture-token-only';
  process.env[account.userIdEnv]='fixture-user-only';
  const hosts=[];
  globalThis.fetch=async url=>{
    const parsed=new URL(url);
    if(parsed.hostname==='raw.githubusercontent.com') return {ok:true,json:async()=>({accounts:{}})};
    hosts.push(parsed.hostname);
    const body=parsed.pathname.endsWith('/media')?{data:[{id:'media-fixture',caption:'fixture',media_type:'IMAGE'}]}:parsed.pathname.endsWith('/insights')?{data:[]}:{id:'fixture-user-only',username:account.expectedUsername};
    return {ok:true,text:async()=>JSON.stringify(body)};
  };
  const req={method:'GET',query:{account:key},url:'/api/private-metrics?account='+key,headers:{host:'example.invalid',cookie:createSessionCookie('owner@example.invalid').split(';')[0]}};
  const res={setHeader(){},status(code){this.code=code;return this},json(body){this.body=body;return this}};
  await handler(req,res);
  assert.equal(res.code,200);
  assert.equal(res.body.account.matchesExpected,true);
  assert.ok(hosts.length>=2);
  assert.ok(hosts.every(host=>host===(account.instagramLogin==='instagram'?'graph.instagram.com':'graph.facebook.com')));
  globalThis.fetch=async()=>{throw new Error('fixture failure')};
  await handler(req,res);
  assert.equal(res.code,502);
  assert.ok(res.body.error);
}
console.log('PASS: métricas usam o domínio próprio do login de cada conta; falha retorna JSON, sem dados da outra conta.');
