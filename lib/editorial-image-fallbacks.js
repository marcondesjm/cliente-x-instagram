import { extractEditorialImageUrl } from './editorial-research.js';
import { photoIdentity } from './photo-uniqueness.js';

// Curated exact-article mappings. A related keyword alone is not evidence that
// a photograph depicts the same product, generation or event.
const verifiedAlternatives = new Map([
  ['https://tecnoblog.net/noticias/apple-anuncia-airpods-5-com-cancelamento-de-ruido-melhorado-e-ia/', {
    pageUrl: 'https://www.apple.com/newsroom/2026/09/apple-introduces-airpods-5-with-best-in-class-open-ear-active-noise-cancellation/',
    credit: 'Apple',
    preferredImageUrl: 'https://www.apple.com/newsroom/images/2026/09/apple-introduces-airpods-5-with-best-in-class-open-ear-active-noise-cancellation/article/Apple-AirPods-5-hero-260909_big.jpg.large_2x.jpg',
    evidence: 'Official AirPods 5 announcement, matching the product and September 9, 2026 event in the selected article.'
  }]
]);

const stopWords = new Set('para como sobre mais uma com dos das que por sua seu trazem anuncia novo nova novos novas lancamento apresenta empresa empresas tecnologia inteligencia artificial'.split(' '));
function subjectWords(value = '') {
  return [...new Set(String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z0-9]+/g) || [])].filter(word => (word.length >= 3 || /^\d+$/.test(word)) && !stopWords.has(word));
}

export function sameEditorialEvent(left = {}, right = {}) {
  const a = subjectWords(left.sourceTitle), b = subjectWords(right.sourceTitle);
  const common = a.filter(word => b.includes(word));
  const numbers = text => (String(text).match(/\d+(?:\.\d+)?/g) || []).sort().join('|');
  const elapsed = Math.abs(Date.parse(left.publishedAt) - Date.parse(right.publishedAt));
  return Number.isFinite(elapsed) && elapsed <= 3 * 86400000
    && numbers(left.sourceTitle) === numbers(right.sourceTitle)
    && common.length >= 4 && common.length / Math.min(a.length, b.length) >= 0.7;
}

export function articlePhotoUrls(html, pageUrl, title) {
  const body = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]
    || html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const subject = subjectWords(title);
  const urls = [];
  for (const tag of body.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    const words = subjectWords(tag[0]);
    if (subject.filter(word => words.includes(word)).length < 2) continue;
    for (const attribute of tag[0].matchAll(/(?:src|srcset|data-src|data-srcset)=["']([^"']+)["']/gi)) {
      for (const raw of attribute[1].split(',').reverse()) {
        try {
          const url = new URL(raw.trim().split(/\s+/)[0].replace(/&amp;/g, '&'), pageUrl);
          if (url.protocol === 'https:' && !/logo|avatar|icon|tracking/i.test(url.pathname)) urls.push(url.href);
        } catch {}
      }
    }
  }
  return [...new Map(urls.map(url => [photoIdentity(url), url])).values()].slice(0, 16);
}

export async function* editorialImageCandidates(research = {}, fetchImpl = fetch, editorialPacks = []) {
  if (research.sourceImageUrl) yield {
    imageUrl: research.sourceImageUrl,
    imageSourcePageUrl: research.sourceUrl,
    imageCredit: research.source,
    imageEvidence: 'Image supplied by the selected article feed.'
  };
  const alternative = verifiedAlternatives.get(research.sourceUrl);
  const pages = [
    { pageUrl: research.sourceUrl, credit: research.source, evidence: 'Main image metadata of the selected article.' },
    ...(alternative ? [alternative] : []),
    ...editorialPacks.map(pack => pack.research).filter(other => other && other.sourceUrl !== research.sourceUrl && sameEditorialEvent(research, other)).slice(0, 8)
      .map(other => ({ pageUrl: other.sourceUrl, credit: other.source, evidence: `Related coverage: ${other.sourceTitle}; matching headline terms, numbers and publication date.` }))
  ];
  for (const page of pages) {
    if (!/^https:\/\//i.test(page.pageUrl || '')) continue;
    try {
      const response = await fetchImpl(page.pageUrl, {
        signal: AbortSignal.timeout(8000),
        headers: { accept: 'text/html', 'user-agent': 'Mozilla/5.0 Cliente-X-Radar/1.0' }
      });
      if (!response.ok) continue;
      const html = await response.text();
      if (page.preferredImageUrl && html.includes(new URL(page.preferredImageUrl).pathname)) {
        yield { imageUrl: page.preferredImageUrl, imageSourcePageUrl: page.pageUrl, imageCredit: page.credit, imageEvidence: page.evidence };
      }
      const imageUrl = extractEditorialImageUrl(html, page.pageUrl);
      if (imageUrl) yield { imageUrl, imageSourcePageUrl: page.pageUrl, imageCredit: page.credit, imageEvidence: page.evidence };
      for (const imageUrl of articlePhotoUrls(html, page.pageUrl, research.sourceTitle)) {
        yield { imageUrl, imageSourcePageUrl: page.pageUrl, imageCredit: page.credit, imageEvidence: `${page.evidence} Article photograph with matching subject terms.` };
      }
    } catch (error) {
      console.warn(`Imagem alternativa indisponível (${page.pageUrl}): ${error.message}`);
    }
  }
}
