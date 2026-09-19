import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../automation/instagram-template/scripts/publish-carousel.mjs', import.meta.url), 'utf8');
const selection = source.slice(source.indexOf('  const storyOnly = publishMode'), source.indexOf('  if (!args.renderOnly', source.indexOf('  const storyOnly = publishMode')));
for (const publishMode of ['feed-and-story', 'reel-and-story', 'story-only', 'feed-only', 'reel-only']) {
  for (const kind of ['news', 'book', 'education']) {
    const pack = { slides: [{ title: kind, body: 'Conteúdo da pauta.' }], research: kind === 'news' ? { sourceUrl: 'https://example.com/news' } : undefined };
    const style = { name: 'approved-feed-style' };
    const context = { pack, style, publishMode, publicationHistory: Array.from({length: 6}, (_, i) => ({ storyMediaId: String(i), research: { sourceUrl: 'https://example.com/news' } })) };
    const actual = vm.runInNewContext(`${selection}\n({ storyPack, storyStyle })`, context);
    assert.equal(actual.storyPack, pack, `${publishMode}/${kind}: Story must use the selected pack`);
    assert.equal(actual.storyStyle, style, `${publishMode}/${kind}: Story must use the feed style`);
  }
}
assert.match(source, /renderStory\(runDir, storyPack, account, storyStyle, renderContext\)/);
assert.doesNotMatch(source, /pickBookStoryAfterNews|rotatedBookStoryPack/);
console.log('Story consistency: 15 mode/content cases passed, including history with six news Stories.');
