import { decodeHTML } from 'entities';
import { createHash } from 'node:crypto';
const SITE='https://www.freebibleimages.org';
const BOOKS={genesis:'Genesis',exodo:'Exodus',rute:'Ruth',samuel:'Samuel',reis:'Kings',daniel:'Daniel',jonas:'Jonah',ester:'Esther',lucas:'Luke',marcos:'Mark',mateus:'Matthew',joao:'John',atos:'Acts',corintios:'Corinthians',galatas:'Galatians'};
export const text=html=>decodeHTML(String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
const normalized=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const id=s=>createHash('sha256').update(s).digest('hex').slice(0,16);
export function englishReference(reference='') {
  const match=reference.match(/^(?:(\d)\s+)?([\p{L}]+)\s+(.+)$/u);
  const book=match && BOOKS[normalized(match[2])];
  if(!book) throw new Error('Livro bíblico sem tradução de pesquisa cadastrada.');
  return `${match[1]?match[1]+' ':''}${book} ${match[3].replace(/[–—]/g,'-')}`;
}
export function safeSourceUrl(value, media=false) {
  const url=new URL(value,SITE);
  if(url.protocol!=='https:' || url.username || url.password || url.port || url.hostname!==(media?'media.freebibleimages.org':'www.freebibleimages.org')) throw new Error('Endereço fora da fonte autorizada.');
  if(media && !/^\/stories\/[^/]+\/(source-jpeg|overview-thumbnails)\/[\w.-]+\.jpg$/.test(url.pathname)) throw new Error('Caminho de imagem não autorizado.');
  if(!media && !/^\/(search\/|illustrations\/[a-z0-9-]+\/)$/.test(url.pathname)) throw new Error('Página fora da pesquisa autorizada.');
  return url.href;
}
export async function fetchSource(url,{fetchImpl=fetch,maxBytes=2_000_000}={}) {
  safeSourceUrl(url);
  const response=await fetchImpl(url,{redirect:'error',signal:AbortSignal.timeout(25000),headers:{'User-Agent':'SabedoriaKids-ImageResearch/1.0 (licensed Bible illustration discovery)'}});
  if(!response.ok) throw new Error(`Fonte respondeu HTTP ${response.status}.`);
  if(!/text\/html/i.test(response.headers.get('content-type') || '')) throw new Error('Fonte não retornou HTML.');
  let body='',length=0;
  const decoder=new TextDecoder();
  for await (const chunk of response.body) {length+=chunk.byteLength;if(length>maxBytes)throw new Error('Página acima do tamanho permitido.');body+=decoder.decode(chunk,{stream:true});}
  return body+decoder.decode();
}
export function searchResults(html) {
  const rows=[];
  for(const match of html.matchAll(/\bdata-stories="([A-Za-z0-9+/=]+)"/g)) {
    let group;try {group=JSON.parse(Buffer.from(match[1],'base64').toString('utf8'));} catch {throw new Error('Formato de pesquisa mudou.');}
    if(!Array.isArray(group))throw new Error('Lista de pesquisa inválida.');
    for(const row of group) {
      if(!Array.isArray(row) || row[2]!=='illustrations' || row[6]!=='Sweet Publishing' || !/^[a-z0-9-]+$/.test(row[3]))continue;
      const sourceUrl=safeSourceUrl(`${SITE}/illustrations/${row[3]}/`);
      rows.push({id:id(sourceUrl),title:String(row[0]),reference:String(row[4]),creator:'Sweet Publishing / FreeBibleimages.org',sourceUrl});
    }
  }
  if(!/data-stories=|result-count[^>]*>\(0\)|No (?:stories|results)/i.test(html))throw new Error('Catálogo de pesquisa indisponível ou alterado.');
  return [...new Map(rows.map(row=>[row.id,row])).values()];
}
export function licensedScenes(html,sourceUrl) {
  safeSourceUrl(sourceUrl);
  const terms=html.match(/<div class="link-panel" id="licence-panel">([\s\S]*?)(?=<div class="panel-buttons">)/)?.[1] || '';
  const licence=terms.match(/https:\/\/creativecommons\.org\/licenses\/by-sa\/(3\.0|4\.0)\//)?.[0];
  const contributor=text(html.match(/id="info-contributor"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '');
  if(!licence || !/Contributed by Sweet Publishing$/.test(contributor) || !/title="Commercial use permitted"/.test(html) || !/title="Derivative works permitted"/.test(html) || !/Individual images can be used on web pages, blogs and social media/.test(text(terms)) || /NonCommercial|NoDerivatives|cannot.*commercial/i.test(text(terms))) throw Object.assign(new Error('Licença ou permissões não confirmadas para uso no perfil.'),{code:'license-unconfirmed'});
  const scenes=[];
  for(const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*data-slideshow-caption="([^"]*)"[^>]*>\s*<img\b[^>]*src="([^"]+)"/g)) {
    let imageUrl,thumbnailUrl;try {imageUrl=safeSourceUrl(decodeHTML(match[1]),true);thumbnailUrl=safeSourceUrl(decodeHTML(match[3]),true);}catch {continue;}
    const description=text(match[2]);
    // Credit/end cards have no scene description and cannot illustrate a lesson.
    if(description.length<25 || /^Slide \d+$/.test(description))continue;
    scenes.push({id:id(imageUrl.split('?')[0]),description,imageUrl,thumbnailUrl});
  }
  if(!scenes.length)throw new Error('Nenhuma cena individual identificada.');
  return {license:`CC BY-SA ${licence.includes('3.0')?'3.0':'4.0'}`,licenseUrl:licence,creator:'Sweet Publishing / FreeBibleimages.org',termsHash:createHash('sha256').update(text(terms)).digest('hex'),scenes:[...new Map(scenes.map(scene=>[scene.id,scene])).values()]};
}
