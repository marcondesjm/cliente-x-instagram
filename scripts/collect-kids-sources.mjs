import fs from 'node:fs/promises';
import { decodeHTML } from 'entities';
const sourceUrl='https://bibleforchildren.org/languages/portuguese/stories.php';
const response=await fetch(sourceUrl,{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error(`Fonte bíblica indisponível: HTTP ${response.status}`);
if(new URL(response.url).hostname!=='bibleforchildren.org')throw new Error('Redirecionamento para fonte não autorizada');
const html=await response.text();
const text=decodeHTML(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,'\n'));
const lessons=new Map();
for(const raw of text.split('\n')){
 const line=raw.trim().replace(/\s+/g,' ');const match=line.match(/^(\d{1,2})\s+(.{5,120})$/u);
 if(!match)continue;const number=Number(match[1]);if(number<1||number>60)continue;
 const title=match[2];if(title!==title.toLocaleUpperCase('pt-BR'))continue;
 lessons.set(number,{sourceLesson:number,title,source:'Bíblia para Crianças',sourceUrl,status:'research',note:'Tema para pesquisa. Conferir a passagem e criar texto original adequado à infância antes de publicar.'});
}
if(lessons.size<30)throw new Error('Catálogo mudou ou retornou incompleto; arquivo anterior preservado.');
const path='automation/instagram-template/config/sabedoria-kids-sources.json';
const entries=[...lessons.values()].sort((a,b)=>a.sourceLesson-b.sourceLesson);
const payload={account:'sabedoria-kids',sourceUrl,checkedAt:new Date().toISOString(),publicationEnabled:false,entries};
await fs.writeFile(path,JSON.stringify(payload,null,2)+'\n');
console.log(`Fonte verificada: ${entries.length} temas bíblicos para pesquisa. Nenhuma publicação disparada.`);
