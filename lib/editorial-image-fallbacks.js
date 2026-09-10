import { extractEditorialImageUrl } from './editorial-research.js';

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

export async function* editorialImageCandidates(research = {}, fetchImpl = fetch) {
  if (research.sourceImageUrl) yield {
    imageUrl: research.sourceImageUrl,
    imageSourcePageUrl: research.sourceUrl,
    imageCredit: research.source,
    imageEvidence: 'Image supplied by the selected article feed.'
  };
  const alternative = verifiedAlternatives.get(research.sourceUrl);
  const pages = [
    { pageUrl: research.sourceUrl, credit: research.source, evidence: 'Main image metadata of the selected article.' },
    ...(alternative ? [alternative] : [])
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
    } catch (error) {
      console.warn(`Imagem alternativa indisponível (${page.pageUrl}): ${error.message}`);
    }
  }
}
