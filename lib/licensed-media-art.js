import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const xml=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const regular=fileURLToPath(new URL('./assets/lato/Lato-Regular.ttf',import.meta.url));
const bold=fileURLToPath(new URL('./assets/lato/Lato-Bold.ttf',import.meta.url));
async function block(text,size,weight,color,maxHeight){
 const {data,info}=await sharp({text:{text:`<span foreground="${color}">${xml(text)}</span>`,font:`Lato ${weight} ${size}`,fontfile:weight==='Bold'?bold:regular,width:984,wrap:'word',rgba:true,dpi:72}}).png().toBuffer({resolveWithObject:true});
 if(info.height>maxHeight)throw Error('Encurte o título, texto ou crédito para caber com legibilidade.');return {data,height:info.height};
}
export async function composeLicensedDesign(bytes,meta){
 const image=sharp(bytes,{limitInputPixels:40000000,animated:false});const info=await image.metadata();
 if(!['jpeg','png','webp'].includes(info.format)||info.width<600||info.height<600)throw Error('Use JPG, PNG ou WEBP com pelo menos 600 × 600 pixels.');
 const brand=await block('@marcondes.machado.oficial · IA aplicada a empresas',23,'Regular','#216452',40);
 const title=await block(meta.title,53,'Bold','#14251f',180);
 const copy=await block(meta.body,29,'Regular','#243a32',164);
 const credit=await block(meta.credit,18,'Regular','#35483e',92);
 const creditTop=1350-48-credit.height;
 const copyTop=creditTop-40-copy.height;
 const photoTop=92+title.height+40;
 const photoHeight=copyTop-36-photoTop;
 if(photoHeight<450)throw Error('Encurte os textos para reservar espaço para a foto.');
 const photo=await image.rotate().resize(984,photoHeight,{fit:'cover'}).jpeg({quality:92}).toBuffer();
 return sharp({create:{width:1080,height:1350,channels:3,background:'#f7f4ee'}}).composite([{input:photo,left:48,top:photoTop},{input:brand.data,left:48,top:38},{input:title.data,left:48,top:92},{input:copy.data,left:48,top:copyTop},{input:credit.data,left:48,top:creditTop}]).jpeg({quality:94}).toBuffer();
}
