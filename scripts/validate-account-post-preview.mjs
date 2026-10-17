import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html = fs.readFileSync('docs/dashboard.html', 'utf8');
const elements = new Map();
const element = id => {
  if (!elements.has(id)) elements.set(id, {style:{},hidden:false,removeAttribute(name){delete this[name];}});
  return elements.get(id);
};
const pending = [];
const context = vm.createContext({
  document:{getElementById:element},
  appState:{serverMode:true,selectedAccount:'cliente-x',showcaseSlides:[]},
  api:url=>new Promise((resolve,reject)=>pending.push({url,resolve,reject})),
  withAccount:url=>url+'&account='+context.appState.selectedAccount,
  renderPerformanceLearning(){},renderChecks(){},formatTimeOnly:x=>x,formatDateTime:x=>x
});
const section = html.slice(html.indexOf('    function resetLatestPost('),html.indexOf('    function renderPerformanceLearning('));
const slides = html.slice(html.indexOf('    function renderShowcaseSlide('),html.indexOf('    function scheduleTimesFromInputs('));
vm.runInContext('let privateMetricsRequest=null; let accountViewVersion=0;'+section+slides, context);
const first = vm.runInContext('loadPrivateMetrics()',context);
vm.runInContext("appState.selectedAccount='sabedoria-kids'; accountViewVersion++; privateMetricsRequest=null; resetLatestPost('Carregando');",context);
assert.equal(element('latestPostImage').hidden,true);
assert.equal(element('latestPostLink').href,undefined);
const second = vm.runInContext('loadPrivateMetrics()',context);
assert.match(pending[0].url,/account=cliente-x/);
assert.match(pending[1].url,/account=sabedoria-kids/);
pending[1].resolve({account:{matchesExpected:true},latestMedia:{caption:'Jesus acolhe as crianças',permalink:'https://www.instagram.com/p/kids/',media_url:'kids.jpg'}});
await second;
pending[0].resolve({latestMedia:{caption:'Publicação antiga',media_url:'old.jpg'}});
await first;
assert.equal(element('latestPostCaption').textContent,'Jesus acolhe as crianças');
assert.equal(element('latestPostImage').src,'kids.jpg');
assert.equal(element('latestPostImage').hidden,false);
assert.equal(element('instagramShowcaseImage').src,'kids.jpg');
assert.equal(element('latestPostLink').href,'https://www.instagram.com/p/kids/');
vm.runInContext('renderLatestPost({latestMedia:null})',context);
assert.equal(element('latestPostImage').src,undefined);
assert.equal(element('instagramShowcaseLink').href,undefined);
vm.runInContext("renderLatestPost({account:{matchesExpected:false},latestMedia:{media_url:'wrong.jpg'}})",context);
assert.equal(element('latestPostImage').src,undefined);
vm.runInContext("accountViewVersion++; privateMetricsRequest=null;",context);
const failed = vm.runInContext('loadPrivateMetrics()',context);
pending[2].reject(new Error('offline'));
await failed;
assert.equal(element('latestPostImage').hidden,true);
assert.match(element('latestPostCaption').textContent,/Não foi possível/);
assert.doesNotMatch(html, /id="latestPostImage" src=/);
console.log('PASS: troca de conta, respostas fora de ordem, remoção de imagem/link antigos, retorno sem mídia, conta divergente, erro e recuperação visual. Sem publicação.');
