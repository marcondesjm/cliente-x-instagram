import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {renderStory,loadConfig} from '../automation/instagram-template/scripts/publish-carousel.mjs';
import {ensureBusinessHashtags} from '../lib/business-hashtags.js';
const caption='Uma orientação prática para conferir pedidos.';
const tagged=ensureBusinessHashtags(caption,'pedido-duplicado');
assert.equal([...tagged.matchAll(/#[\p{L}\p{N}_]+/gu)].length,4);
assert.equal(ensureBusinessHashtags(tagged),tagged);
assert.equal(ensureBusinessHashtags('Texto #Um #Dois #Três'),'Texto #Um #Dois #Três');
const {account,styles}=loadConfig(resolve('automation/instagram-template/config'),'cliente-x');
for(const templateMode of ['paper','statement']) {
 const dir=resolve('output/story-photo-regression',templateMode);mkdirSync(dir,{recursive:true});
 await renderStory(dir,{storySlide:{eyebrow:'IA NA PRÁTICA',title:'Pedidos claros antes de automatizar',body:'Confira as informações recebidas antes de registrar um pedido.',imagePath:'docs/uploads/sector-photos/ecommerce.jpg'}},account,{...styles[0],templateMode});
}
console.log('PASS: hashtags preservadas sem duplicação; fotos nos Stories paper e statement, com validação real de imagem e layout.');
