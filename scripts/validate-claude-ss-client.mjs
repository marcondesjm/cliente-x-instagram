import assert from 'node:assert/strict';
import { callClaudeSS } from '../lib/claude-ss-client.js';

const prior = process.env.CLAUDE_SS_API_KEY;
delete process.env.CLAUDE_SS_API_KEY;
await assert.rejects(() => callClaudeSS({ messages: [{ role: 'user', content: 'test' }] }), /CLAUDE_SS_API_KEY ausente/);
process.env.CLAUDE_SS_API_KEY = 'test-only-secret';
let calls = 0, delays = [];
const result = await callClaudeSS({
  model: 'claude-sonnet-4.6',
  messages: [{ role: 'user', content: 'Responda apenas OK.' }],
  maxRetries: 2,
  sleep: async ms => delays.push(ms),
  fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, 'https://claude-ss.ia.br/v1/messages');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers['x-api-key'], 'test-only-secret');
    assert.equal(options.headers['anthropic-version'], '2023-06-01');
    if (calls === 1) return new Response('overloaded', { status: 529 });
    return new Response(JSON.stringify({ content: [{ type: 'text', text: 'OK' }], model: 'claude-sonnet-4.6', usage: { input_tokens: 10, output_tokens: 2 } }), { status: 200 });
  }
});
assert.equal(result.content[0].text, 'OK');
assert.equal(calls, 2);
assert.deepEqual(delays, [1000]);
let authCalls = 0;
await assert.rejects(() => callClaudeSS({
  messages: [{ role: 'user', content: 'test' }], maxRetries: 0,
  fetchImpl: async () => { authCalls++; return new Response('unauthorized', { status: 401 }); }
}), /HTTP 401/);
assert.equal(authCalls, 1, 'Authentication errors must not be retried.');
if (prior === undefined) delete process.env.CLAUDE_SS_API_KEY; else process.env.CLAUDE_SS_API_KEY = prior;
console.log('Claude Gateway client: env-only secret, Anthropic endpoint, transient 529 retry and no auth retry passed.');
