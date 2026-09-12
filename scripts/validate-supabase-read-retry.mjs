import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync('automation/instagram-template/scripts/publish-carousel.mjs', 'utf8');
const loader = source.slice(source.indexOf('async function loadSupabasePacks('), source.indexOf('function mergePacks('));
const retry = source.slice(source.indexOf('async function fetchWithContext('), source.indexOf('function localChromiumExecutable('));
async function attempt(statuses, credentials = true) {
  let calls = 0;
  const context = {
    URL, RETRY_ATTEMPTS: 3, RETRY_BASE_DELAY_MS: 0,
    RETRYABLE_STATUS: new Set([408, 409, 425, 429, 500, 502, 503, 504]), RETRYABLE_CODES: new Set(['ECONNRESET']),
    console: { warn() {} }, setTimeout: resolve => resolve(),
    fetch: async (url, options) => {
      assert.equal(url.pathname, '/rest/v1/instagram_posts');
      assert.equal(url.searchParams.get('account'), 'eq.cliente-x');
      assert.equal(options.method, undefined, 'Retry only the existing GET');
      const status = statuses[calls++];
      assert.ok(status, 'Unexpected extra attempt');
      return new Response(status === 200 ? JSON.stringify([{ slot_index: 5, slides: [], caption: 'Teste' }]) : '{"message":"Gateway Timeout"}', { status });
    },
    env: credentials ? { SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'test-only' } : {}
  };
  try { return { result: await vm.runInNewContext(`${retry}\n${loader}\nloadSupabasePacks(env, 'cliente-x')`, context), calls }; }
  catch (error) { return { error, calls }; }
}
const recovered = await attempt([504, 200]);
assert.equal(recovered.calls, 2);
assert.equal(recovered.result[0].slotIndex, 5);
assert.equal((await attempt([200])).calls, 1);
const unavailable = await attempt([504, 504, 504]);
assert.equal(unavailable.calls, 3);
assert.equal(unavailable.error.stage, 'Supabase posts');
assert.equal(unavailable.error.attempts, 3);
assert.equal((await attempt([401])).calls, 1, 'Do not retry authentication failures');
assert.equal((await attempt([], false)).calls, 0);
console.log('PASS: transient 504 recovers with GET retry; bounded failures retain stage; 401 and missing configuration are not retried.');
