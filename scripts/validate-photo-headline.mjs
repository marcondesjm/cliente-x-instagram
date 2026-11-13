import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,mkdtempSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import sharp from 'sharp';
import {renderSlides,loadConfig} from '../automation/instagram-template/scripts/publish-carousel.mjs';
import {composePhotoHeadline} from '../lib/licensed-media-art.js';
const {account,styles}=loadConfig(resolve('automation/instagram-template/config'),'cliente-x');
const slide={eyebrow:'IA NA PRÁTICA',title:'Sua equipe confere cada pedido?',body:'Confira produto e prazo antes de cadastrar o pedido.',imagePath:'docs/uploads/sector-photos/ecommerce.jpg'};
const base=mkdtempSync(resolve(tmpdir(),'photo-headline-test-'));
for(const [name,who,card] of [['cover',account,slide],['legacy',{...account,brandPalette:{...account.brandPalette,template:null}},slide],['finished',account,{...slide,imageIsFinalArtwork:true}],['kids',{...account,account:'sabedoria-kids'},slide]]){
 const dir=resolve(base,name);mkdirSync(dir,{recursive:true});const paths=await renderSlides(dir,[card],who,styles[0]);
 if(name==='cover'||name==='legacy'){
  assert.equal(existsSync(resolve(dir,'cover-headline.json')),name==='legacy');
  if(name==='cover'){
   const html=readFileSync(resolve(dir,'slide-01.html'),'utf8');
   assert.match(html,/mjm-editorial/);
   assert.ok(html.includes(slide.title) && html.includes(slide.body));
  }
const m=await sharp(paths[0]).metadata();assert.equal(m.width,1080);assert.equal(m.height,1350);assert.notDeepEqual(readFileSync(paths[0]),readFileSync(slide.imagePath));}
 else {assert(!existsSync(resolve(dir,'cover-headline.json')));assert.deepEqual(readFileSync(paths[0]),readFileSync(slide.imagePath));}
}
await assert.rejects(()=>composePhotoHeadline(readFileSync(slide.imagePath),{title:''}));
console.log('PASS: foto avulsa recebe headline no render real; arte pronta e Kids preservados; capa sem título é rejeitada. Sem API ou publicação.');
