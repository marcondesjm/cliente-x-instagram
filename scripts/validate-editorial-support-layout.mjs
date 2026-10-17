import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { anatexSlideHtml } from '../automation/instagram-template/scripts/publish-carousel.mjs';
const accounts = JSON.parse(fs.readFileSync('automation/instagram-template/config/accounts.json'));
const account = accounts.find(a=>a.account==='cliente-x');
const style = JSON.parse(fs.readFileSync('automation/instagram-template/config/visual-styles.json')).find(s=>s.name==='impact-carousel');
const slide = {eyebrow:'EM POUCAS PALAVRAS',title:'Entenda a matéria · 5',body:'Segundo ele, desenvolvedores de inteligência artificial (IA) acreditavam que a tecnologia poderia acabar com a humanidade "antes do fim da década".',researchSource:'G1 Tecnologia',researchTitle:'Empresas de IA são incapazes de controlar seus modelos',preserveEngagementCopy:true};
const out=path.resolve('output/cliente-x-inner-cards');fs.mkdirSync(out,{recursive:true});
const executablePath=process.platform==='win32'?path.join(process.env.ProgramFiles,'Google/Chrome/Application/chrome.exe'):undefined;
const browser=await chromium.launch({executablePath});
try {
 for(const [name,height,mode,variant] of [['feed',1350,'feed-and-story',style],['feed-light',1350,'feed-and-story',{...style,bgTop:'#fff',bgBottom:'#f2f3f4',text:'#132238',muted:'#3b4654'}],['reel',1920,'reel-and-story',style]]) {
  const page=await browser.newPage({viewport:{width:1080,height}});
  const html=anatexSlideHtml(slide,6,9,account,variant,{publishMode:mode,dateString:'2026-10-17',slotIndex:5});
  assert.match(html,/with-editorial-support/);assert.match(html,/ILUSTRAÇÃO EDITORIAL/);
  const htmlPath=path.join(out,`${name}.html`);fs.writeFileSync(htmlPath,html);await page.goto(new URL('file:///'+htmlPath.replaceAll('\\','/')).href);await page.evaluate(()=>document.fonts.ready);
  const bounds=await page.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};return {title:box('.headline'),graphic:box('.editorial-support'),note:box('.note'),progress:box('.progress')};});
  assert.ok(bounds.title.bottom+24<=bounds.graphic.top,JSON.stringify(bounds));
  assert.ok(bounds.graphic.bottom+24<=bounds.note.top,JSON.stringify(bounds));
  assert.ok(bounds.note.bottom+24<=bounds.progress.top,JSON.stringify(bounds));
  assert.equal(await page.locator('.note .close').evaluate(el=>getComputedStyle(el).color),'rgb(19, 34, 56)', 'Dark text on the light support card');
  await page.screenshot({path:path.join(out,`${name}.png`)});await page.close();
 }
 for(const [other,index,modified] of [[{...account,account:'sabedoria-kids'},6,slide],[account,1,slide],[account,9,slide],[account,6,{...slide,imagePath:'docs/uploads/impact-ai-approval-v1.png'}]]) {
  const html=anatexSlideHtml(modified,index,9,other,style,{publishMode:'feed-and-story'});
  assert.ok(!html.includes(' with-editorial-support'), 'Keep scope limited to internal cliente-x cards without photos');
 }
}finally{await browser.close();}
console.log('PASS: internal Feed/light/Reel illustration and text fit without overlap; cover, ending, photos and Kids retain composition.');
