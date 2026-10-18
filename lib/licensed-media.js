import {createHash} from 'node:crypto';
export const MEDIA_CONFIG='automation/instagram-template/config/licensed-media.json';
export const MEDIA_PREFIX='docs/uploads/licensed-designs/';
export const sha256=x=>createHash('sha256').update(x).digest('hex');
function text(x,min,max,label){if(typeof x!=='string'||x.trim().length<min||x.trim().length>max)throw Error(label+' inválido.');return x.trim();}
function url(x,label){const s=text(x,10,1000,label);let u;try{u=new URL(s);}catch{throw Error(label+' inválido.');}if(u.protocol!=='https:'||u.username||u.password)throw Error(label+' precisa usar HTTPS.');return u.href;}
export function validateMediaImport(body){
 if(!['pinterest','vecteezy'].includes(body.provider))throw Error('Escolha Pinterest ou Vecteezy.');
 if(!Number.isInteger(body.packIndex)||body.packIndex<0)throw Error('Selecione o conteúdo de destino.');
 if(body.commercialAllowed!==true||body.humanReviewed!==true||body.editorialOnly!==false)throw Error('Confirme a autorização comercial e a revisão da licença.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(body.downloadedOn||''))||!Number.isFinite(Date.parse(body.downloadedOn))||new Date(body.downloadedOn).toISOString().slice(0,10)!==body.downloadedOn)throw Error('Informe a data do download ou autorização.');
 const sourceUrl=url(body.sourceUrl,'Fonte original'),discoveryUrl=url(body.discoveryUrl,'Página onde encontrou a imagem');
 const host=new URL(discoveryUrl).hostname;
 if(body.provider==='vecteezy'&&!/(^|\.)vecteezy\.com$/.test(host))throw Error('Informe a página do arquivo no Vecteezy.');
 if(body.provider==='pinterest'&&!/(^|\.)(pinterest\.(com|com\.br|pt)|pin\.it)$/.test(host))throw Error('Informe o link do Pin.');
 if(body.provider==='pinterest'&&/(^|\.)(pinterest\.|pin\.it$|pinimg\.)/.test(new URL(sourceUrl).hostname))throw Error('Informe a fonte original do autor, além do Pin.');
 return {downloadedOn:body.downloadedOn,provider:body.provider,sourceUrl,discoveryUrl,licenseUrl:url(body.licenseUrl,'Licença ou autorização'),author:text(body.author,2,160,'Autor'),credit:text(body.credit,3,320,'Crédito'),license:text(body.license,3,160,'Licença'),project:'cliente-x-pack-'+body.packIndex,packIndex:body.packIndex,commercialAllowed:true,humanReviewed:true,editorialOnly:false,aiProcessingAllowed:false,title:text(body.title,8,90,'Título da peça'),body:text(body.copy,15,240,'Texto da peça')};
}
export function mediaCredits(pack,manifest,packIndex){
 const paths=[...(pack.slides||[]),...(pack.storySlide?[pack.storySlide]:[])].map(s=>String(s.imagePath||'').replace(/^\//,''));
 const entries=[];
 for(const path of paths.filter(p=>p.startsWith(MEDIA_PREFIX))){const e=manifest.items?.find(x=>x.imagePath===path);if(!e||e.project!==(pack.licensedMediaProject||'cliente-x-pack-'+packIndex)||!e.humanReviewed||!e.commercialAllowed||e.editorialOnly||e.status!=='ready')throw Error('Imagem licenciada sem registro válido para este projeto.');entries.push(e);}
 return [...new Set(entries.map(e=>e.credit))];
}
export function withMediaCredits(caption,credits){let out=String(caption||'');for(const credit of credits)if(!out.includes(credit))out+='\n\n'+credit;return out;}
