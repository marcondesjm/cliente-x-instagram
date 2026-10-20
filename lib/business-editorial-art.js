export const BUSINESS_ART_VERSION='business-editorial-v1';
const layouts=['workspace','conversation','workflow','checklist','decision'];
const textSchema={type:'string',minLength:3,maxLength:32};
export function businessArtSchema(frameCount=11){return {type:'object',additionalProperties:false,required:['palette','frames'],properties:{palette:{type:'string',enum:['ocean','orchid','copper']},frames:{type:'array',minItems:frameCount,maxItems:frameCount,items:{type:'object',additionalProperties:false,required:['layout','labels'],properties:{layout:{type:'string',enum:layouts},labels:{type:'array',minItems:3,maxItems:3,items:textSchema}}}}}};}
export function validateBusinessArt(plan,frameCount){
 if(!['ocean','orchid','copper'].includes(plan?.palette)||!Array.isArray(plan.frames)||plan.frames.length<5||frameCount!==undefined&&plan.frames.length!==frameCount||new Set(plan.frames.slice(0,5).map(f=>f.layout)).size!==5||plan.frames[0].layout!=='workspace')throw Error('Direção de arte incompleta ou repetida.');
 for(const frame of plan.frames){if(!layouts.includes(frame.layout)||frame.labels?.length!==3||frame.labels.some(s=>typeof s!=='string'||s.length<3||s.length>32||/https?:|\d|%|garantid|comprovad/i.test(s)))throw Error('Texto da ilustração inválido.');}
 return plan;
}
export function applyBusinessArt(pack,plan){
 validateBusinessArt(plan,pack.slides.length+1);const dir=`docs/illustrations/cliente-x/${pack.id}`;
 pack.businessArt={version:BUSINESS_ART_VERSION,...plan};
 pack.slides=pack.slides.map((s,i)=>{const next={...s,imagePath:`${dir}/${i?'slide-'+(i+1):'cover'}.png`};delete next.typographicOnly;return next;});
 pack.storySlide.imagePath=`${dir}/story.png`;return pack;
}
export const businessArtPaths=pack=>pack.businessArt?[...pack.slides.map(s=>s.imagePath),pack.storySlide.imagePath]:[pack.slides[0].imagePath,pack.storySlide.imagePath];
const esc=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function businessArtSvg(plan,index){
 validateBusinessArt(plan);const f=plan.frames[index];if(!f)throw Error('Cartão visual inválido.');
 const palette={ocean:['#053f48','#2dd4bf','#e6fcf6'],orchid:['#39266b','#c4a0ff','#f2ebff'],copper:['#532f1f','#ffb078','#fff1e5']}[plan.palette];
 const [ink,accent,paper]=palette;
 const text=(x,y,s,size=34,color=ink)=>`<text x="${x}" y="${y}" font-family="Arial" font-size="${size}" font-weight="bold" fill="${color}">${esc(s)}</text>`;
 const card=(x,y,w,h,fill=paper)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="25" fill="${fill}"/>`;
 const line=(x,y,w)=>`<path d="M${x} ${y}h${w}" stroke="${ink}" stroke-width="12" stroke-linecap="round" opacity=".14"/>`;
 const check=(x,y)=>`<circle cx="${x}" cy="${y}" r="23" fill="${accent}"/><path d="M${x-10} ${y}l7 8 15-17" stroke="${ink}" stroke-width="5" fill="none"/>`;
 let scene='';
 if(f.layout==='workspace')scene=`${card(80,120,730,420,'#ffffff')}${card(105,145,680,55,ink)}<circle cx="135" cy="172" r="8" fill="${accent}"/>${text(160,183,'ROTINA DA EMPRESA',24,'#ffffff')}${card(140,238,590,94,paper)}${text(165,295,f.labels[0],30)}${card(140,358,280,110,accent)}${text(165,423,f.labels[1],24)}${card(448,358,280,110,paper)}${text(468,423,f.labels[2],24)}<path d="M80 545h730l65 55H25Z" fill="${accent}"/><rect x="35" y="600" width="1120" height="22" rx="10" fill="${paper}"/><circle cx="978" cy="292" r="58" fill="#d89b76"/><path d="M920 280q0-100 105-50l18 60-39-20-82 20Z" fill="${ink}"/><path d="M885 535v-92q0-92 95-92t95 92v92Z" fill="${accent}"/><path d="M920 405l-68 125H730" stroke="#d89b76" stroke-width="34" stroke-linecap="round" fill="none"/>`;
 if(f.layout==='conversation')scene=`${card(190,105,820,515,'#ffffff')}${card(190,105,820,80,ink)}${text(230,158,'ATENDIMENTO · EXEMPLO',27,'#ffffff')}${card(230,220,590,90,paper)}${text(258,276,f.labels[0])}${card(380,340,590,90,accent)}${text(408,396,f.labels[1])}${card(230,460,590,90,paper)}${text(258,516,f.labels[2])}<circle cx="145" cy="260" r="32" fill="${accent}"/><circle cx="1054" cy="382" r="32" fill="${paper}"/>`;
 if(f.layout==='workflow')scene=f.labels.map((label,i)=>`${card(80+i*380,225,300,270,i===1?accent:'#ffffff')}${text(110+i*380,310,['RECEBER','ORGANIZAR','CONFERIR'][i],25)}${line(110+i*380,350,220)}${text(110+i*380,418,label,25)}${i<2?`<path d="M${395+i*380} 360h48l-15-15m15 15-15 15" stroke="${accent}" stroke-width="7" fill="none"/>`:''}`).join('');
 if(f.layout==='checklist')scene=`${card(90,105,600,535,'#ffffff')}${text(135,175,'CONFERÊNCIA',31)}${f.labels.map((label,i)=>`${check(145,260+i*125)}${text(192,272+i*125,label,28)}${line(192,307+i*125,385)}`).join('')}<circle cx="930" cy="340" r="146" fill="${accent}"/><circle cx="930" cy="340" r="85" stroke="${ink}" stroke-width="24" fill="none"/><path d="M995 400l90 105" stroke="${ink}" stroke-width="32" stroke-linecap="round"/>`;
 if(f.layout==='decision')scene=`${card(65,160,510,390,'#ffffff')}${card(625,160,510,390,accent)}${text(110,235,'ANTES DE RESPONDER',25)}${text(670,235,'PRÓXIMO PASSO',25)}${line(110,275,400)}${text(110,340,f.labels[0],29)}${text(670,340,f.labels[1],29)}${card(110,395,420,90,paper)}${text(135,450,f.labels[2],26)}${check(1080,480)}`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760"><rect width="1200" height="760" rx="36" fill="${ink}"/><circle cx="1100" cy="60" r="180" fill="${accent}" opacity=".13"/>${text(70,68,'IA NA ROTINA · EXEMPLO FICTÍCIO',24,'#ffffff')}${scene}${text(70,707,'ILUSTRAÇÃO EDITORIAL · MARCONDES MACHADO',23,'#ffffff')}</svg>`;
}
