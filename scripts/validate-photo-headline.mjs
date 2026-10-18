import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,existsSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import sharp from 'sharp';
import {renderSlides,loadConfig} from '../automation/instagram-template/scripts/publish-carousel.mjs';
import {composePhotoHeadline} from '../lib/licensed-media-art.js';
const {account,styles}=loadConfig(resolve('automation/instagram-template/config'),'cliente-x');
const slide={eyebrow:'IA NA PRÁTICA',title:'Sua equipe confere cada pedido?',body:'Confira produto e prazo antes de cadastrar o pedido.',imagePath:'docs/uploads/sector-photos/ecommerce.jpg'};
const base=resolve('output/photo-headline-test');mkdirSync(base,{recursive:true});
for(const [name,who,card] of [['cover',account,slide],['finished',account,{...slide,imageIsFinalArtwork:true}],['kids',{...account,account:'sabedoria-kids'},slide]]){
 const dir=resolve(base,name);mkdirSync(dir,{recursive:true});const paths=await renderSlides(dir,[card],who,styles[0]);
 if(name==='cover'){assert(existsSync(resolve(dir,'cover-headline.json')));const m=await sharp(paths[0]).metadata();assert.equal(m.width,1080);assert.equal(m.height,1350);assert.notDeepEqual(readFileSync(paths[0]),readFileSync(slide.imagePath));}
 else {assert(!existsSync(resolve(dir,'cover-headline.json')));assert.deepEqual(readFileSync(paths[0]),readFileSync(slide.imagePath));}
}
await assert.rejects(()=>composePhotoHeadline(readFileSync(slide.imagePath),{title:''}));
console.log('PASS: foto avulsa recebe headline no render real; arte pronta e Kids preservados; capa sem título é rejeitada. Sem API ou publicação.');
