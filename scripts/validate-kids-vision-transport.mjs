import assert from 'node:assert/strict';
import {sendVision} from '../lib/kids-scene-vision.js';
const good='https://media.freebibleimages.org/stories/FB_Zacchaeus/source-jpeg/01_FB_Zacchaeus_1024.jpg?1724237549';
let calls=0;
const base={key:'fake-secret',model:'claude-sonnet-4.6',prompt:'Describe visible facts only.',maxOutputTokens:600};
const result=await sendVision({...base,imageUrl:good,fetchImpl:async(url,options)=>{
 calls++;assert.equal(url,'https://claude-ss.ia.br/v1/messages');assert.equal(options.redirect,'error');assert.equal(options.headers.authorization,'Bearer fake-secret');
 const b=JSON.parse(options.body);assert.equal(b.tools,undefined);assert.deepEqual(b.messages[0].content[0],{type:'image',source:{type:'url',url:good}});assert.equal(b.messages[0].content.length,2);
 return new Response(JSON.stringify({content:[{type:'text',text:'{"personInTree":false}'}],usage:{input_tokens:1000,output_tokens:20},stop_reason:'end_turn'}));
}});
assert.equal(calls,1);assert.equal(result.value.personInTree,false);
for(const url of ['http://media.freebibleimages.org/a.jpg','https://other.example/a.jpg','https://media.freebibleimages.org:444/stories/FB_Zacchaeus/source-jpeg/01.jpg','https://secret@media.freebibleimages.org/stories/FB_Zacchaeus/source-jpeg/01.jpg','https://media.freebibleimages.org/private/a.jpg'])await assert.rejects(sendVision({...base,imageUrl:url}),/fora da fonte/);
await assert.rejects(sendVision({...base,image:Buffer.from([255,216]),imageUrl:good}),/fora da fonte/);
console.log('PASS: URL transport, public-source allowlist, fixed recipient, no redirect, no tools in plain response, no mixed image inputs. Simulated API only.');
