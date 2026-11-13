import assert from 'node:assert/strict';
import { extractArticleFacts, paginateArticleFacts, buildResearchPack, researchFreshEditorialPacks, filterValidEditorialPacks, factualSummary } from '../lib/editorial-research.js';
import { validatePack, preparePackForPublication, assertCarouselPublishingLimit, splitCreativeDescription, approvedRevisionImageReuse } from '../automation/instagram-template/scripts/publish-carousel.mjs';

const paragraphs = Array.from({ length: 14 }, (_, i) => `O ponto ${i + 1} apresenta uma informação distinta sobre a supervisão de agentes e a responsabilidade das empresas.`);
const facts = extractArticleFacts(`<nav><p>Conteúdo de navegação que não pertence à reportagem original.</p></nav><article>${paragraphs.map(p => `<p>${p}</p>`).join('')}<aside><p>Outra notícia que não pertence ao conteúdo da reportagem original.</p></aside></article><footer><p>Rodapé que não pertence à matéria e precisa ser descartado.</p></footer>`);
assert.deepEqual(facts, paragraphs);
const long = 'Uma explicação importante sobre a responsabilidade humana e os controles internos. '.repeat(15).trim();
assert.equal(paginateArticleFacts([long]).map(card => card.body).join(' '), long);
assert(paginateArticleFacts([long]).every(card => card.body.length <= 340));
assert.equal(paginateArticleFacts(['A pesquisa contou 3,2 mil líderes e mediu 4.5 pontos. O resultado preserva todos os números.']).map(card => card.body).join(' '), 'A pesquisa contou 3,2 mil líderes e mediu 4.5 pontos. O resultado preserva todos os números.');
const twoSentences = 'O contexto foi confirmado pela equipe. A decisão será comunicada em uma reunião amanhã.';
assert.deepEqual(paginateArticleFacts([twoSentences], 80, { completeSentences: true }).map(card => card.body),
  ['O contexto foi confirmado pela equipe.', 'A decisão será comunicada em uma reunião amanhã.']);
assert.throws(() => paginateArticleFacts([long.replaceAll('.', '')], 340, { completeSentences: true }), /precisa de adaptação/);
const item = { title: 'Empresas definem responsáveis pela supervisão de agentes de IA', summary: paragraphs[0], source: 'Fonte de teste', url: 'https://example.com/agentes', publishedAt: '2026-10-17T12:00:00Z', articleFacts: facts };
const pack = buildResearchPack(item, new Date('2026-10-17T15:00:00Z'), { niche: 'IA', keywords: ['agentes'] });
assert.equal(pack.slides.length, 16);
assert.equal(pack.research.coverage.coveredFactCount, 14);
assert.equal(pack.slides.at(-2).body, paragraphs.at(-1));
const multiSentence = 'A primeira frase apresenta o contexto. A segunda traz um dado relevante. A terceira apresenta a conclusão.';
assert.equal(Object.values(splitCreativeDescription(multiSentence, true)).filter(Boolean).join(' '), multiSentence);
validatePack(pack);
const account = { contentProfile: { storyMethod: { ihcHanahEnabled: true } } };
assert.deepEqual(preparePackForPublication(pack, '2026-10-17', 0, account).pack.slides, pack.slides);
const broken = structuredClone(pack);
broken.slides.splice(5, 1);
assert.throws(() => validatePack(broken), /incompleto/);
assert.throws(() => assertCarouselPublishingLimit(pack, 'feed-only'), /API da Meta/);
assert.doesNotThrow(() => assertCarouselPublishingLimit(pack, 'feed-only', { renderOnly: true }));
assert.doesNotThrow(() => assertCarouselPublishingLimit({ slides: pack.slides.slice(0, 10) }, 'feed-only'));
assert.throws(() => buildResearchPack({ ...item, articleFacts: Array.from({length: 21}, (_, index) => `Ponto ${index}. ${'A equipe faz uma conferência independente antes de autorizar a próxima etapa. '.repeat(3)}`.trim()) }, undefined, { niche: 'IA', keywords: ['agentes'] }), /sem cortar o final/);
const revision = { ...pack, publicationRevision: { allowSourceImageReuse: true, previousMediaId: 'old-post' } };
const history = [{ mediaId: 'old-post', research: { sourceUrl: item.url } }];
assert.equal(approvedRevisionImageReuse(revision, history, true), true);
assert.equal(approvedRevisionImageReuse(revision, history, false), false);
assert.equal(approvedRevisionImageReuse(revision, [{ mediaId: 'old-post', research: { sourceUrl: 'https://example.com/other' } }], true), false);
assert.equal(approvedRevisionImageReuse(revision, [], true), false);
// The Tinder post originally reached publication with only this RSS excerpt.
const title = 'Tinder proíbe que agentes de IA conversem pelos usuários';
const summary = 'Match Group quer impedir que assistentes escolham perfis e enviem mensagens no lugar das pessoas.';
const tinder = { ...item, title, summary: summary + ' ' + title, articleFacts: [] };
const radarOptions = { niche: 'IA', keywords: ['ai'], now: new Date('2026-10-17T15:00:00Z') };
assert.equal(factualSummary(tinder), summary);
const cachedSummary = buildResearchPack(tinder, radarOptions.now, radarOptions);
assert.deepEqual(filterValidEditorialPacks([cachedSummary, pack], validatePack), [pack]);
const feed = 'https://example.com/feed';
const feedXml = content => `<rss><channel><item><title>${title}</title><link>${tinder.url}</link><pubDate>${tinder.publishedAt}</pubDate><description>${tinder.summary}</description>${content}</item></channel></rss>`;
const collect = content => researchFreshEditorialPacks({
  ...radarOptions,
  sources: [{ name: 'Fonte de teste', url: feed }],
  fetchImpl: async url => url === feed ? new Response(feedXml(content)) : new Response('', { status: 403 })
});
assert.equal((await collect('')).packs.length, 0);
const recovered = await collect(`<content:encoded><![CDATA[${paragraphs.slice(0, 3).map(p => `<p>${p}</p>`).join('')}]]></content:encoded>`);
assert.equal(recovered.packs.length, 1);
const full = recovered.packs[0];
validatePack(full);
assert.equal(full.research.coverage.scope, 'article');
assert.equal(full.slides.at(-2).body, paragraphs[2]);
assert(full.caption.includes(paragraphs[2]));
assert.equal(full.slides.at(-1).eyebrow, 'FONTE DA NOTÍCIA');
assert.equal(extractArticleFacts('<article><p>Este artigo é exclusivo para membros de um plano.</p><p>Conteúdos e newsletters exclusivas</p></article>').length, 0);
const ibmTitle = 'IBM Digital Sovereignty Index: In the AI Era, Control Is No Longer Enough. Enterprises Must Prove It.';
const englishBody = 'Control you can’t prove is becoming a business liability.';
const englishCached = structuredClone(pack);
englishCached.slides[0].title = ibmTitle;
assert.equal(filterValidEditorialPacks([englishCached], validatePack).length, 0);
const mixedCached = structuredClone(pack);
mixedCached.storySlide = { title: 'Entenda o contexto', body: englishBody };
assert.equal(filterValidEditorialPacks([mixedCached], validatePack).length, 0);
assert.throws(() => buildResearchPack({ ...item, title: ibmTitle, articleFacts: [...facts, englishBody] },
  radarOptions.now, { ...radarOptions, requireArticleCoverage: true }), /português/);
const portugueseWithBrand = structuredClone(pack);
portugueseWithBrand.slides[0].title = 'IBM divulga pesquisa sobre soberania digital na era da IA';
assert.deepEqual(filterValidEditorialPacks([portugueseWithBrand], validatePack), [portugueseWithBrand]);
console.log('OK: 14 parágrafos preservados; conclusão, paginação, IHC, omissões e limites de publicação verificados.');
