import {englishReference} from './kids-image-discovery.js';
const BOOK_IDS={'Genesis':'GEN','Exodus':'EXO','Ruth':'RUT','1 Samuel':'1SA','1 Kings':'1KI','Daniel':'DAN','Jonah':'JON','Esther':'EST','Luke':'LUK','Mark':'MRK','Matthew':'MAT','John':'JHN','Acts':'ACT','1 Corinthians':'1CO','Galatians':'GAL'};
export function passageRanges(reference) {
  const english=englishReference(reference);
  const match=english.match(/^((?:[1-3] )?[A-Za-z]+) (.+)$/);
  const book=BOOK_IDS[match?.[1]];
  if(!book)throw new Error('Livro da passagem sem suporte.');
  const ranges=match[2].split(';').map(part=>{
    const m=part.trim().match(/^(\d+):(\d+)(?:-(\d+))?$/);
    if(!m)throw new Error('Referência bíblica não interpretada integralmente.');
    const [chapter,start,end]=[Number(m[1]),Number(m[2]),Number(m[3] || m[2])];
    if(chapter<1 || chapter>150 || start<1 || end<start || end>176)throw new Error('Intervalo de versículos inválido.');
    return {book,chapter,start,end};
  });
  if(ranges.reduce((n,r)=>n+r.end-r.start+1,0)>80)throw new Error('Passagem acima do limite para uma revisão.');
  return ranges;
}
export async function loadPassage(reference,fetchImpl=fetch) {
  const verses=[],urls=[];
  const cache=new Map();
  for(const r of passageRanges(reference)) {
    const url=`https://bible-api.com/data/web/${r.book}/${r.chapter}`;
    if(!cache.has(url)) {
      const response=await fetchImpl(url,{redirect:'error',signal:AbortSignal.timeout(25000)});
      if(!response.ok)throw new Error(`Passagem bíblica indisponível: HTTP ${response.status}.`);
      let size=0,body='';const decoder=new TextDecoder();
      for await(const chunk of response.body){size+=chunk.byteLength;if(size>200_000)throw new Error('Passagem acima do limite.');body+=decoder.decode(chunk,{stream:true});}
      const data=JSON.parse(body+decoder.decode());
      if(data.translation?.identifier!=='web' || data.translation?.license!=='Public Domain' || !Array.isArray(data.verses))throw new Error('Tradução da passagem não confirmada.');
      cache.set(url,data);urls.push(url);
    }
    const chapter=cache.get(url).verses;
    for(let verse=r.start;verse<=r.end;verse++) {
      const matches=chapter.filter(v=>v.book_id===r.book && v.chapter===r.chapter && v.verse===verse && typeof v.text==='string' && v.text.trim());
      if(matches.length!==1)throw new Error('Passagem incompleta; revisão bloqueada.');
      verses.push({id:`${r.chapter}:${verse}`,text:matches[0].text.trim()});
    }
  }
  return {reference,translation:'World English Bible',license:'Public Domain',urls,verses};
}
