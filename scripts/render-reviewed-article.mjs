import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildResearchPack, extractArticleFacts, extractEditorialImageUrl } from '../lib/editorial-research.js';
import { loadConfig, preparePackForPublication, renderSlides, validatePack } from '../automation/instagram-template/scripts/publish-carousel.mjs';

// Explicit preview command only; this script never calls Meta or schedules posts.
const url = 'https://olhardigital.com.br/2026/10/17/colunistas/quem-responde-quando-um-agente-de-ia-toma-a-decisao-errada/';
const response = process.argv[2] ? null : await fetch(url);
if (response && !response.ok) throw new Error(`Fonte indisponível: ${response.status}`);
const html = process.argv[2] ? readFileSync(process.argv[2], 'utf8') : await response.text();
const item = { url, source: 'Olhar Digital', title: 'Quem responde quando um agente de IA toma a decisão errada?', publishedAt: '2026-10-17T12:00:00Z', articleFacts: extractArticleFacts(html) };
item.summary = item.articleFacts[0];
const apiVersion = process.argv.includes('--api');
const pack = buildResearchPack(item, new Date(), { niche: 'IA aplicada às empresas', keywords: ['agentes'], maxCarouselSlides: apiVersion ? 10 : 20 });
validatePack(pack);
const { account, styles } = loadConfig(resolve('automation/instagram-template/config'), 'cliente-x');
const prepared = preparePackForPublication(pack, '2026-10-17', 0, account, 'feed-only').pack;
const runDir = resolve(`automation/instagram-template/runs/2026-10-17-materia-agentes-${pack.slides.length}-slides`);
mkdirSync(runDir, { recursive: true });
const photo = await fetch(extractEditorialImageUrl(html, url));
if (!photo.ok || !photo.headers.get('content-type')?.startsWith('image/')) throw new Error('Foto da matéria indisponível.');
const cover = resolve(runDir, 'source-cover.jpg');
writeFileSync(cover, Buffer.from(await photo.arrayBuffer()));
writeFileSync(resolve(runDir, 'pack.json'), JSON.stringify(prepared, null, 2));
writeFileSync(resolve(runDir, 'legenda.txt'), prepared.caption);
const imagePaths = await renderSlides(runDir, prepared.slides, account, styles.find(style => style.name === 'impact-carousel'), { dateString: '2026-10-17', slotIndex: 0, publishMode: 'feed-only', variationSeed: url, researchSourceImagePath: cover, researchSlideImagePaths: [cover] });
writeFileSync(resolve(runDir, 'review.json'), JSON.stringify({ sourceUrl: url, slides: imagePaths.length, coverage: prepared.research.coverage, published: false }, null, 2));
console.log(JSON.stringify({ runDir, slides: imagePaths.length, coverage: prepared.research.coverage, published: false }));
