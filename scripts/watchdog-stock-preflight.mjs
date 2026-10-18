import fs from 'node:fs';
import {watchdogQuotaWait} from '../lib/watchdog-quota-wait.js';
const C='automation/instagram-template/config/',read=n=>JSON.parse(fs.readFileSync(C+n+'.json','utf8'));
let waiting=null;
try{
 const date=process.env.AUTO_SLOT_DATE,index=Number(process.env.AUTO_SLOT_INDEX);
 const ledger=read('published-slots');
 if(!ledger.some(p=>p.account==='cliente-x'&&p.date===date&&Number(p.slotIndex)===index&&p.status==='published')){
  const incident=read('watchdog-errors').filter(e=>e.account==='cliente-x'&&e.date===date&&Number(e.slotIndex)===index&&e.status==='open').at(-1);
  if(incident)waiting=watchdogQuotaWait(incident,read('authorial-reserve'),read('editorial-api-validation'));
 }
}catch{console.log('Diagnóstico de estoque indisponível; publicação seguirá as verificações normais.');}
if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`waiting=${Boolean(waiting)}\n`);
console.log(JSON.stringify(waiting||{waiting:false}));
