import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {testClaude} from './test-kids-claude.mjs';
const image=Buffer.from([255,216,1]),expectedHash=createHash('sha256').update(image).digest('hex');
for(const provider of ['anthropic','claude-ss']) {
  const calls=[];
  const fetchImpl=async(url,options)=>{
    calls.push({url,options});
    return {ok:true,json:async()=>url.includes('/models')?{data:[{id:'claude-haiku-4-5-20251001'}]}:{content:[{type:'text',text:'Cena.'}],usage:{input_tokens:10,output_tokens:3}}};
  };
  const result=await testClaude({provider,key:'test-credential',image,expectedHash,vision:true,fetchImpl});
  assert.equal(result.status,'vision_response_received');assert.equal(calls.length,2);
  for(const call of calls){
    assert.equal(new URL(call.url).origin,provider==='anthropic'?'https://api.anthropic.com':'https://claude-ss.ia.br');
    assert.equal(call.options.redirect,'error');
    assert.equal(call.options.headers['x-api-key'],provider==='anthropic'?'test-credential':undefined);
    assert.equal(call.options.headers.authorization,provider==='claude-ss'?'Bearer test-credential':undefined);
  }
  assert.equal(JSON.parse(calls[1].options.body).max_tokens,160);
  assert.equal(JSON.stringify(result).includes('test-credential'),false);
}
let calls=0;
const result=await testClaude({provider:'claude-ss',key:'test',vision:true,fetchImpl:async()=>{calls++;return {ok:false,status:401}}});
assert.equal(calls,1);assert.equal(result.status,'invalid_credentials');assert.equal(result.vision,false);
const never=()=>{throw Error('Unexpected request')};
assert.equal((await testClaude({provider:'unknown',key:'test',fetchImpl:never})).status,'unsupported_provider');
assert.equal((await testClaude({fetchImpl:never})).status,'missing_secret');
assert.equal((await testClaude({provider:'claude-ss',key:'test',image,expectedHash:'bad',vision:true,fetchImpl:async()=>({ok:true,json:async()=>({data:[{id:'claude-haiku-4-5-20251001'}]})})})).status,'invalid_test_image');
console.log('PASS: provider allowlist, separate authentication headers, no redirects, one bounded visual call, fail-closed credentials/image, no secret in receipt. Mock requests only.');
