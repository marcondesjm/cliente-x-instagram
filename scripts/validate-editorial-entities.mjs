import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeEditorialEntities, filterValidEditorialPacks } from '../lib/editorial-research.js';

assert.equal(decodeEditorialEntities('Volker T&uuml;rk'), 'Volker Türk');
assert.equal(decodeEditorialEntities('&amp;uuml; &Uuml; &ouml; &euro; &trade;'), 'ü Ü ö € ™');
assert.equal(decodeEditorialEntities('H&aacute; g&aacute;s, n&atilde;o &ccedil; &#252; &#xFC;'), 'Há gás, não ç ü ü');
assert.equal(decodeEditorialEntities('aí AI &invalidentity;'), 'aí AI &invalidentity;');
const cache = JSON.parse(readFileSync(new URL('../automation/instagram-template/config/radar-cache.json', import.meta.url), 'utf8'));
assert.ok(!decodeEditorialEntities(JSON.stringify(cache)).includes('&uuml;'));

const valid = { caption: 'Texto válido' };
const invalid = { caption: '&invalidentity;' };
const rejected = [];
const validate = (pack) => {
  if (pack.caption.includes('&invalidentity;')) throw new Error('Entidade não decodificada');
};
assert.deepEqual(filterValidEditorialPacks([invalid, valid], validate, (pack, error) => rejected.push({ pack, error })), [valid]);
assert.equal(rejected.length, 1);
assert.equal(rejected[0].pack, invalid);
assert.deepEqual(filterValidEditorialPacks([invalid], validate), []);
assert.deepEqual(filterValidEditorialPacks([], validate), []);
assert.equal(invalid.caption, '&invalidentity;');
console.log('Editorial entities and candidate isolation: OK');
