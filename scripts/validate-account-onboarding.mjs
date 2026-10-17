import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { Readable } from 'node:stream';
import { instagramUsername, onboardingIdentity, starterPacks } from '../lib/account-onboarding.js';
import { commitConfigBatch } from '../lib/github-config-batch.js';
import handler from '../api/state.js';
import { createSessionCookie } from '../lib/auth.js';

assert.equal(instagramUsername('https://www.instagram.com/Minha.Marca/?igsh=test'), 'minha.marca');
assert.equal(instagramUsername('@Minha_Marca'), 'minha_marca');
for (const value of ['https://instagram.com.evil.test/x/', 'https://example.com/x/', 'https://www.instagram.com/p/abc/', 'https://user:pass@instagram.com/example/', '@a..b', 'reels']) assert.throws(() => instagramUsername(value));
assert.throws(() => onboardingIdentity({}));
assert.throws(() => onboardingIdentity({ account: 'brand_b' }, [{ account: 'brand-b' }]));
assert.throws(() => onboardingIdentity({ account: 'other', expectedUsername: '@same' }, [{ account: 'old', expectedUsername: 'same' }]));
for (const times of [['24:00'], ['07:00', '07:00'], '07:00']) assert.throws(() => onboardingIdentity({ account: 'new-account', times }));
assert.deepEqual(onboardingIdentity({ account: 'fresh' }, [{ account: 'source', scheduleUtc: ['0 10 * * *'] }]).scheduleUtc, []);
assert.deepEqual(onboardingIdentity({ expectedUsername: '@nova.marca', times: ['22:00', '07:00'] }).scheduleUtc, ['0 10 * * *', '0 1 * * *']);

const accounts = [];
for (let i = 0; i < 50; i++) {
  const identity = onboardingIdentity({ expectedUsername: `@fixture_${i}`, times: ['09:00'] }, accounts);
  accounts.push({ account: identity.accountKey, expectedUsername: identity.expectedUsername, accessTokenEnv: `${identity.envPrefix}_INSTAGRAM_ACCESS_TOKEN` });
}
assert.equal(new Set(accounts.map(a => a.accessTokenEnv)).size, 50);
const packs = starterPacks({ niche: 'educação bíblica infantil', audience: 'famílias cristãs', offer: 'histórias bíblicas e atividades' }, 'Exemplo');
assert.doesNotMatch(JSON.stringify(packs), /inteligenciaartificial|automação|onde a IA/);
assert.match(packs[0].caption, /histórias bíblicas/);

let calls = [];
const git = async (path, options) => {
  calls.push({ path, body: options?.body && JSON.parse(options.body) });
  if (path === 'git/commits/parent') return { tree: { sha: 'old-tree' } };
  if (path === 'git/trees') return { sha: 'new-tree' };
  if (path === 'git/commits') return { sha: 'new-commit' };
  return {};
};
await commitConfigBatch(git, 'parent', [{ path: 'a.json', data: [] }, { path: 'b.json', data: [] }], 'fixture');
assert.equal(calls[1].body.tree.length, 2);
assert.deepEqual(calls.at(-1).body, { sha: 'new-commit', force: false });
await assert.rejects(commitConfigBatch(async (path, options) => {
  if (path === 'git/refs/heads/main') throw Object.assign(new Error('conflict'), { statusCode: 422 });
  return git(path, options);
}, 'parent', [], 'fixture'), error => error.statusCode === 409);

// Exercise the real authenticated handler; every HTTP response is a fixture.
process.env.ADMIN_EMAIL = 'owner@example.invalid';
process.env.ADMIN_PASSWORD = 'fixture-password';
process.env.ADMIN_SESSION_SECRET = 'fixture-session';
process.env.GITHUB_TOKEN = 'fixture-github';
const fixtures = {
  'accounts.json': [{ account: 'source', expectedUsername: 'source', scheduleUtc: ['0 10 * * *'], accessTokenEnv: 'SOURCE_INSTAGRAM_ACCESS_TOKEN' }],
  'content-packs.json': [{ account: 'source', packs: [{ caption: 'preserve' }] }],
  'scheduled-posts.json': [{ account: 'source', posts: [{ id: 'preserve' }] }]
};
let tree;
globalThis.fetch = async (url, options) => {
  const path = new URL(url).pathname;
  let result;
  if (path.endsWith('/git/ref/heads/main')) result = { object: { sha: 'parent' } };
  else if (path.includes('/contents/')) {
    assert.equal(new URL(url).searchParams.get('ref'), 'parent');
    const data = fixtures[path.split('/').at(-1)];
    result = { sha: 'blob', content: Buffer.from(JSON.stringify(data)).toString('base64') };
  } else if (path.endsWith('/git/commits/parent')) result = { tree: { sha: 'old-tree' } };
  else if (path.endsWith('/git/trees')) { tree = JSON.parse(options.body).tree; result = { sha: 'tree' }; }
  else if (path.endsWith('/git/commits')) result = { sha: 'commit' };
  else if (path.endsWith('/git/refs/heads/main')) { assert.equal(JSON.parse(options.body).force, false); result = {}; }
  else throw new Error(`Unexpected fixture request: ${path}`);
  return { ok: true, text: async () => JSON.stringify(result) };
};
const req = Readable.from([JSON.stringify({ action: 'create-account', editorialBriefing: 'Preferências do cliente e fontes revisáveis', expectedUsername: 'https://www.instagram.com/nova.marca/', niche: 'educação', audience: 'famílias', offer: 'atividades educativas', sourceAccount: 'source', times: ['08:30'] })]);
req.method = 'POST';
req.headers = { host: 'example.invalid', cookie: createSessionCookie('owner@example.invalid').split(';')[0] };
const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(value) { this.value = value; return this; } };
await handler(req, res);
assert.equal(res.code, 200, JSON.stringify(res.value));
const registered = JSON.parse(tree.find(f => f.path.endsWith('/accounts.json')).content);
assert.deepEqual(registered[0], fixtures['accounts.json'][0]);
assert.equal(registered[1].account, 'nova-marca');
assert.equal(registered[1].expectedUsername, 'nova.marca');
assert.deepEqual(registered[1].scheduleUtc, ['30 11 * * *']);
assert.equal(registered[1].clientProfile.status, 'onboarding');
assert.equal(registered[1].clientProfile.approvalMode, 'approval');
assert.equal(registered[1].onboarding.status, 'awaiting_connection');
assert.equal(registered[1].instagramLogin, 'instagram');
assert.equal(registered[1].contentProfile.curatedOnly, true);
assert.equal(registered[1].contentProfile.editorialBriefing, 'Preferências do cliente e fontes revisáveis');
assert.equal(registered[1].footerText, 'nova.marca');
assert.equal(tree.length, 3);
assert.equal(res.value.inviteUrl.startsWith('https://'), true);
const html = readFileSync('docs/dashboard.html', 'utf8');
for (const [, code] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(code);
console.log('PASS: URLs, duplicatas, isolamento de 50 identidades simuladas, agenda própria, cadastro atômico, conflito, handler autenticado e sintaxe do painel. Nenhuma conta real criada.');
