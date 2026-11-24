import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { editorialImageCandidates } from '../lib/editorial-image-fallbacks.js';
import { editorialSourcesForAccount, MCTI_ARTICLE_PREFIX, parseMctiNews } from '../lib/editorial-research.js';
import { mjmEditorialHtml } from '../lib/mjm-editorial-art.js';
import { searchWikimediaEditorialPhotos, wikimediaPhotoCaption, WIKIMEDIA_USER_AGENT } from '../lib/wikimedia-editorial-photos.js';

const accounts = JSON.parse(readFileSync('automation/instagram-template/config/accounts.json', 'utf8'));
const sources = editorialSourcesForAccount(accounts.find(account => account.account === 'cliente-x'));
const ministry = sources.find(source => source.format === 'mcti-news');
assert.ok(ministry);
assert.ok(sources.some(source => source.name === 'NASA' || source.name === 'The Guardian IA'));

const articleUrl = `${MCTI_ARTICLE_PREFIX}2026/11/centros-de-dados`;
const tiles = `
<article>
  <h2><a class="summary url" href="${articleUrl}">Brasil estuda centros de dados para IA</a></h2>
  <span class="description">Pesquisa &amp; inovação</span>
  <span><i class="icon-day"></i> 24/11/2026</span><span><i class="icon-hour"></i> 15h30</span>
</article>
<article>
  <h2><a class="summary url" href="https://example.org/noticia">Outra notícia</a></h2>
  <span><i class="icon-day"></i>24/11/2026</span>
</article>`;
const [item, extra] = parseMctiNews(tiles, ministry);
assert.equal(extra, undefined);
assert.equal(item.url, articleUrl);
assert.equal(item.publishedAt, '2026-11-24T15:30:00-03:00');
assert.equal(item.summary, 'Pesquisa & inovação');
const research = { sourceTitle: item.title, sourceUrl: item.url, sourceImageUrl: `${item.url}/photo.jpg` };
for await (const photo of editorialImageCandidates(research, () => assert.fail('A foto do MCTI não deve ser buscada'))) {
  assert.fail(`Foto com licença sem derivações: ${photo.imageUrl}`);
}

const image = {
  width: 2400, height: 1600, mime: 'image/jpeg',
  thumburl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Rack.jpg/1280px-Rack.jpg?utm_source=commons',
  descriptionurl: 'https://commons.wikimedia.org/wiki/File:Rack.jpg',
  extmetadata: {
    Artist: { value: '<a href="/wiki/User:Example">Maria &amp; Ana</a>' },
    LicenseShortName: { value: 'CC BY 4.0' },
    LicenseUrl: { value: 'https://creativecommons.org/licenses/by/4.0' },
    Restrictions: { value: '' }
  }
};
const page = (title, index, changes) => ({ title, index, imageinfo: [{ ...image, ...changes }] });
const photos = await searchWikimediaEditorialPhotos(research, { fetchImpl: async (request, options) => {
  assert.equal(request.origin, 'https://commons.wikimedia.org');
  assert.match(request.searchParams.get('gsrsearch'), /data center/);
  assert.equal(options.headers['user-agent'], WIKIMEDIA_USER_AGENT);
  return Response.json({ query: { pages: [
    page('File:Data center logo.jpg', 1),
    page('File:Data center rack.jpg', 2, { thumburl: 'https://example.org/rack.jpg' }),
    page('File:Data center rack.jpg', 3, { extmetadata: { ...image.extmetadata, LicenseShortName: { value: 'CC BY-ND' } } }),
    page('File:Data center rack.jpg', 4)
  ] } });
} });
assert.equal(photos.length, 1);
assert.equal(new URL(photos[0].imageUrl).search, '');
assert.match(wikimediaPhotoCaption(photos[0]), /Foto ilustrativa: Maria & Ana \/ Wikimedia Commons \(CC BY 4\.0\).*Licença:/);
assert.match(mjmEditorialHtml({ title: item.title, source: item.source, image: 'url(rack.jpg)', illustrativeCredit: photos[0].imageCredit, height: 1920, story: true, escape: String }), /Foto ilustrativa · Maria & Ana/);
assert.deepEqual(await searchWikimediaEditorialPhotos({ sourceTitle: 'IA para pequena empresa' }, { fetchImpl: () => assert.fail('Não deve buscar uma foto sem assunto visual específico') }), []);
console.log('Radar validado: fonte MCTI, fotos pertinentes do Commons e atribuição na legenda e no Story.');
