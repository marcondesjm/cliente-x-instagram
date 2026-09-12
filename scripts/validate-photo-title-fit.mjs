import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
// Execute the renderer's actual repair callback against changing text bounds.
const source = readFileSync('automation/instagram-template/scripts/publish-carousel.mjs', 'utf8').replace(/\r\n/g, '\n');
const start = source.indexOf('const overlapCheck = await page.evaluate(') + 'const overlapCheck = await page.evaluate('.length;
const end = source.indexOf('\n    });\n    if (overlapCheck.collisions.length)', start);
assert.ok(start > 40 && end > start);
const callback = source.slice(start, end) + '\n    }';
const rect = (left, top, width, height) => ({ left, top, right: left + width, bottom: top + height, width, height });
function repair(initialBottom, noteTop = 900) {
  const headline = { style: {}, getBoundingClientRect() { return rect(58, 234, 930, (initialBottom - 234) * (parseFloat(this.style.fontSize || '58') / 58)); } };
  const note = { style: {}, getBoundingClientRect() { return rect(82, parseFloat(this.style.top || String(noteTop)), 916, 210); } };
  const photo = { className: 'context-photo', classList: { contains: c => c === 'context-photo' }, style: {}, getBoundingClientRect() { return rect(58, parseFloat(this.style.top || '470'), 964, parseFloat(this.style.height || '500')); } };
  const main = { classList: { contains: c => c === 'has-research-image' } };
  const document = { body: { clientHeight: 1350 }, querySelector: s => ({ '.headline': headline, '.note': note, main })[s], querySelectorAll: () => [photo] };
  const result = vm.runInNewContext(`(${callback})()`, { document, getComputedStyle: el => ({ display: el.style.display || 'block', visibility: 'visible', opacity: '1', fontSize: el.style.fontSize || '58px', lineHeight: '1' }) });
  return { result, headline, note, photo };
}
const long = repair(710);
assert.equal(long.result.collisions.length, 0);
assert.ok(parseFloat(long.headline.style.fontSize) >= 38);
assert.ok(long.photo.getBoundingClientRect().height >= 280);
assert.ok(long.photo.getBoundingClientRect().top >= long.headline.getBoundingClientRect().bottom + 34);
assert.ok(long.photo.getBoundingClientRect().bottom <= long.note.getBoundingClientRect().top - 28);
assert.notEqual(long.photo.style.display, 'none');
const fitted = repair(420, 1000);
assert.equal(fitted.result.corrected, 0, 'Preserve already approved composition');
assert.equal(fitted.result.collisions.length, 0);
const impossible = repair(2500);
assert.ok(impossible.result.collisions.length > 0, 'Still reject a layout that cannot fit');
assert.ok(parseFloat(impossible.headline.style.fontSize) >= 38);
console.log('PASS: long factual headline keeps photo and note separated; stable layout unchanged; impossible fit remains blocked.');
