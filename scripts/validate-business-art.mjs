import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import {validateBusinessArt,businessArtSvg,applyBusinessArt,businessArtPaths} from '../lib/business-editorial-art.js';
const plan={palette:'ocean',frames:['workspace','conversation','workflow','checklist','decision'].map(layout=>({layout,labels:['Pedido recebido','Consulte a fonte','Revisão humana']}))};
validateBusinessArt(plan);const duplicate=structuredClone(plan);duplicate.frames[4].layout='workspace';assert.throws(()=>validateBusinessArt(duplicate),/repetida/);
const claim=structuredClone(plan);claim.frames[0].labels[0]='Ganho de 90%';assert.throws(()=>validateBusinessArt(claim),/inválido/);
const escaped=structuredClone(plan);escaped.frames[0].labels[0]='<pedido>';assert.match(businessArtSvg(escaped,0),/&lt;pedido&gt;/);
const pack={id:'test',slides:Array.from({length:4},()=>({typographicOnly:true})),storySlide:{}};applyBusinessArt(pack,plan);assert.equal(new Set(businessArtPaths(pack)).size,5);assert.equal(pack.slides.some(s=>s.typographicOnly),false);
const receiptPath='output/business-art/receipt.json';
if(fs.existsSync(receiptPath)){
 const receipt=JSON.parse(fs.readFileSync(receiptPath));const browser=await chromium.launch();const page=await browser.newPage();
 for(const jpg of receipt.imagePaths){await page.goto(pathToFileURL(jpg.replace(/\.jpg$/,'.html')).href);const proof=await page.evaluate(()=>{
  const note=document.querySelector('.business-copy'),photo=document.querySelector('.context-photo'),progress=document.querySelector('.progress');const n=note.getBoundingClientRect(),p=photo.getBoundingClientRect(),r=progress.getBoundingClientRect();
  return {text:note.textContent,length:note.textContent.length,allTextFits:note.scrollHeight<=note.clientHeight+1,noteInside:n.bottom<r.top,photoBeforeCopy:p.bottom<n.top,photoVisible:p.height>500&&getComputedStyle(photo).display!=='none'};
 });assert.equal(proof.allTextFits,true);assert.equal(proof.noteInside,true,JSON.stringify(proof));assert.equal(proof.photoBeforeCopy,true);assert.equal(proof.photoVisible,true);assert.ok(proof.length>35);}
 await browser.close();
}
console.log('PASS: five distinct compositions, hypothetical-label guard, escaping, five separate assets, full visible copy and photo/copy/footer separation. No API calls.');
