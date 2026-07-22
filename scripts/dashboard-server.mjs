#!/usr/bin/env node
import { createServer } from 'node:http';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DOCS_DIR = join(ROOT, 'docs');
const UPLOADS_DIR = join(DOCS_DIR, 'uploads');
const CONTENT_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'content-packs.json');
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');
const SCHEDULED_POSTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'scheduled-posts.json');
const WORKFLOW_PATH = join(ROOT, '.github', 'workflows', 'instagram-feed-cliente-x.yml');
const README_PATH = join(ROOT, 'README.md');
const RUNS_DIR = join(ROOT, 'automation', 'instagram-template', 'runs');
const ENV_PATH = join(ROOT, '.env');
const IG_BASE = 'https://graph.facebook.com/v23.0';
const ACCOUNT = 'cliente-x';
const PORT = Number(process.env.DASHBOARD_PORT || 4173);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=utf-8'
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function loadEnv() {
  const env = { ...process.env };
  if (!existsSync(ENV_PATH)) return env;

  const text = readFileSync(ENV_PATH, 'utf8').replace(/^\uFEFF/, '');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    env[key] = rawValue.replace(/^(['"])(.*)\1$/, '$2');
  }
  return env;
}

function hasUsableSecret(value) {
  return Boolean(value && !String(value).includes('cole_') && String(value).trim().length > 8);
}

function normalizeCaption(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function cronToBrtTime(cron) {
  const [minute, hour] = cron.split(' ').map(Number);
  const brtHour = (hour + 21) % 24;
  return `${String(brtHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function brtTimeToCron(time) {
  const match = String(time).trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) throw new Error(`Horario invalido: ${time}. Use HH:MM.`);
  const hourBrt = Number(match[1]);
  const minute = Number(match[2]);
  const hourUtc = (hourBrt + 3) % 24;
  return `${minute} ${hourUtc} * * *`;
}

function normalizeTimes(times) {
  const unique = Array.from(new Set(times.map((time) => {
    const match = String(time).trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!match) throw new Error(`Horario invalido: ${time}. Use HH:MM.`);
    return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
  })));
  return unique.sort((a, b) => {
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
}

function ensureScheduledPosts() {
  if (!existsSync(SCHEDULED_POSTS_PATH)) {
    writeJson(SCHEDULED_POSTS_PATH, [{ account: ACCOUNT, posts: [] }]);
  }
  const groups = readJson(SCHEDULED_POSTS_PATH);
  let group = groups.find((item) => item.account === ACCOUNT);
  if (!group) {
    group = { account: ACCOUNT, posts: [] };
    groups.push(group);
    writeJson(SCHEDULED_POSTS_PATH, groups);
  }
  if (!Array.isArray(group.posts)) group.posts = [];
  return { groups, group };
}

function readScheduledPosts() {
  return ensureScheduledPosts().group.posts
    .slice()
    .sort((a, b) => String(a.scheduledFor).localeCompare(String(b.scheduledFor)));
}

function brtDateTimeToIso(date, time) {
  const dateMatch = String(date || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = String(time || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!dateMatch) throw new Error('Data invalida. Use AAAA-MM-DD.');
  if (!timeMatch) throw new Error('Horario invalido. Use HH:MM.');
  const [, year, month, day] = dateMatch;
  const [, hour, minute] = timeMatch;
  return `${year}-${month}-${day}T${hour}:${minute}:00-03:00`;
}

function saveScheduledPost(body) {
  const packIndex = Number(body.packIndex);
  const packs = getState().packs;
  if (!Number.isInteger(packIndex) || packIndex < 0 || packIndex >= packs.length) {
    throw new Error('Pack invalido para agendamento.');
  }

  const { groups, group } = ensureScheduledPosts();
  const post = {
    id: `manual-${Date.now()}`,
    status: 'pending',
    packIndex,
    scheduledFor: body.publishNow ? new Date().toISOString() : brtDateTimeToIso(body.date, body.time),
    mode: body.mode === 'story-only' ? 'story-only' : 'feed-and-story',
    title: packs[packIndex]?.slides?.[0]?.title || `Pack ${packIndex}`,
    createdAt: new Date().toISOString()
  };
  group.posts.push(post);
  writeJson(SCHEDULED_POSTS_PATH, groups);
  return { scheduledPosts: readScheduledPosts(), post };
}

function cancelScheduledPost(id) {
  const { groups, group } = ensureScheduledPosts();
  const post = group.posts.find((item) => item.id === id);
  if (!post) throw new Error('Post agendado nao encontrado.');
  if (post.status !== 'pending') throw new Error('Somente posts pendentes podem ser cancelados.');
  post.status = 'cancelled';
  post.cancelledAt = new Date().toISOString();
  writeJson(SCHEDULED_POSTS_PATH, groups);
  return { scheduledPosts: readScheduledPosts(), post };
}

function json(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 12_000_000) {
        req.destroy();
        rejectBody(new Error('Payload muito grande.'));
      }
    });
    req.on('end', () => resolveBody(raw ? JSON.parse(raw) : {}));
    req.on('error', rejectBody);
  });
}

function latestFiles(dir, filter, limit = 5) {
  if (!existsSync(dir)) return [];
  const stack = [dir];
  const files = [];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readDirSafe(current)) {
      const path = join(current, entry);
      const info = statSync(path);
      if (info.isDirectory()) stack.push(path);
      if (info.isFile() && filter(path)) files.push({ path, mtimeMs: info.mtimeMs });
    }
  }
  return files.sort((a, b) => b.mtimeMs - a.mtimeMs).slice(0, limit);
}

function readDirSafe(dir) {
  try {
    return existsSync(dir) ? readdirSync(dir) : [];
  } catch {
    return [];
  }
}

function relativeWebPath(path) {
  return `/${path.replace(ROOT, '').replace(/\\/g, '/').replace(/^\/+/, '')}`;
}

function getState() {
  const accounts = readJson(ACCOUNTS_PATH);
  const content = readJson(CONTENT_PATH);
  const account = accounts.find((item) => item.account === ACCOUNT);
  const group = content.find((item) => item.account === ACCOUNT);
  const packs = group?.packs || [];
  const uniqueCaptions = new Set(packs.map((pack) => normalizeCaption(pack.caption))).size;
  const latestResultFile = latestFiles(join(RUNS_DIR, ACCOUNT), (path) => path.endsWith('result.json'), 30)
    .find((file) => {
      const result = readJson(file.path);
      return !result.dryRun && result.mediaId;
    });
  const latestFailureFile = latestFiles(RUNS_DIR, (path) => /failure-\d{4}-\d{2}-\d{2}-\d{6}\.json$/.test(path), 1)[0];
  const latestResult = latestResultFile ? readJson(latestResultFile.path) : null;
  const latestFailure = latestFailureFile ? {
    path: relativeWebPath(latestFailureFile.path),
    ...readJson(latestFailureFile.path)
  } : null;

  return {
    account,
    scheduleBrt: account?.scheduleUtc?.map(cronToBrtTime) || [],
    packs,
    packCount: packs.length,
    uniqueCaptions,
    scheduledPosts: readScheduledPosts(),
    latestResult,
    latestFailure
  };
}

async function graphGet(path, params = {}) {
  const url = new URL(`${IG_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  const payloadText = await response.text();
  const payload = payloadText ? JSON.parse(payloadText) : {};
  if (!response.ok) {
    const message = payload?.error?.message || `Graph API ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

function insightValue(insights, name) {
  const item = insights?.data?.find((entry) => entry.name === name);
  const value = item?.values?.[0]?.value;
  return typeof value === 'number' ? value : null;
}

async function readPrivateMetrics() {
  const state = getState();
  const account = state.account;
  if (!account) throw new Error(`Conta ${ACCOUNT} nao encontrada em accounts.json.`);

  const env = loadEnv();
  const credentials = [
    { label: 'Token Instagram', env: account.accessTokenEnv, configured: hasUsableSecret(env[account.accessTokenEnv]) },
    { label: 'User ID Instagram', env: account.userIdEnv, configured: hasUsableSecret(env[account.userIdEnv]) },
    { label: 'Chave imgBB', env: account.imgbbKeyEnv, configured: hasUsableSecret(env[account.imgbbKeyEnv]) }
  ];
  const missing = credentials.filter((item) => !item.configured).map((item) => item.env);
  const token = env[account.accessTokenEnv];
  const userId = env[account.userIdEnv];

  const result = {
    configured: missing.length === 0,
    credentials,
    missing,
    account: null,
    latestMedia: null,
    insights: null,
    checkedAt: new Date().toISOString()
  };

  if (!hasUsableSecret(token) || !hasUsableSecret(userId)) return result;

  const igAccount = await graphGet(`/${userId}`, {
    fields: 'id,username',
    access_token: token
  });
  result.account = {
    id: igAccount.id,
    username: igAccount.username,
    expectedUsername: account.expectedUsername,
    matchesExpected: igAccount.username === account.expectedUsername
  };

  const latestMediaId = state.latestResult?.mediaId || state.latestResult?.id;
  if (!latestMediaId) return result;

  result.latestMedia = await graphGet(`/${latestMediaId}`, {
    fields: 'id,permalink,timestamp,media_type,like_count,comments_count',
    access_token: token
  });

  try {
    const insights = await graphGet(`/${latestMediaId}/insights`, {
      metric: 'reach,saved,total_interactions',
      access_token: token
    });
    result.insights = {
      available: true,
      reach: insightValue(insights, 'reach'),
      saved: insightValue(insights, 'saved'),
      totalInteractions: insightValue(insights, 'total_interactions')
    };
  } catch (error) {
    result.insights = {
      available: false,
      error: error.message
    };
  }

  return result;
}

function updateWorkflowSchedule(scheduleUtc) {
  let text = readFileSync(WORKFLOW_PATH, 'utf8');
  const scheduleBlock = scheduleUtc.map((cron) => `    - cron: "${cron}"`).join('\n');
  text = text.replace(/  schedule:\r?\n(?:    - cron: ".*"\r?\n)+/, `  schedule:\n${scheduleBlock}\n`);

  const optionsBlock = scheduleUtc.map((_, index) => `          - "${index}"`).join('\n');
  text = text.replace(/        options:\r?\n(?:          - "\d+"\r?\n)+/, `        options:\n${optionsBlock}\n`);

  const caseBlock = scheduleUtc.map((cron, index) => `              "${cron}") SLOT_INDEX="${index}" ;;`).join('\n');
  text = text.replace(/            case "\$\{\{ github\.event\.schedule \}\}" in\r?\n(?:              ".*"\) SLOT_INDEX="\d+" ;;\r?\n)+/, `            case "\${{ github.event.schedule }}" in\n${caseBlock}\n`);
  writeFileSync(WORKFLOW_PATH, text, 'utf8');
}

function updateReadmeSchedule(scheduleBrt) {
  const times = scheduleBrt.map((time) => time.replace(/^0/, ''));
  const label = times.length > 1
    ? `${times.slice(0, -1).join(', ')} e ${times.at(-1)}`
    : times[0] || '';
  let text = readFileSync(README_PATH, 'utf8');
  text = text.replace(
    /6\. O workflow .*? fica agendado para publicar às .*? no horário de Brasília\./,
    `6. O workflow \`.github/workflows/instagram-feed-cliente-x.yml\` fica agendado para publicar às ${label} no horário de Brasília.`
  );
  writeFileSync(README_PATH, text, 'utf8');
}

function saveSchedule(times) {
  const scheduleBrt = normalizeTimes(times);
  const scheduleUtc = scheduleBrt.map(brtTimeToCron);
  const accounts = readJson(ACCOUNTS_PATH);
  const account = accounts.find((item) => item.account === ACCOUNT);
  if (!account) throw new Error(`Conta ${ACCOUNT} nao encontrada em accounts.json.`);
  account.scheduleUtc = scheduleUtc;
  writeFileSync(ACCOUNTS_PATH, `${JSON.stringify(accounts, null, 2)}\n`, 'utf8');
  updateWorkflowSchedule(scheduleUtc);
  updateReadmeSchedule(scheduleBrt);
  return getState();
}

function validatePack(pack) {
  if (!pack || typeof pack !== 'object') throw new Error('Pack invalido.');
  if (!Array.isArray(pack.slides) || pack.slides.length < 2) throw new Error('O pack precisa ter pelo menos 2 slides.');
  for (const [index, slide] of pack.slides.entries()) {
    const hasImage = Boolean(slide.imagePath?.trim() || slide.imageUrl?.trim());
    if (!hasImage && !slide.eyebrow?.trim()) throw new Error(`Slide ${index + 1}: banner vazio.`);
    if (!hasImage && !slide.title?.trim()) throw new Error(`Slide ${index + 1}: titulo vazio.`);
    if (!hasImage && !slide.body?.trim()) throw new Error(`Slide ${index + 1}: descricao vazia.`);
  }
  if (!pack.caption?.trim()) throw new Error('Legenda/caption vazia.');
}

function savePack(index, pack) {
  validatePack(pack);
  const content = readJson(CONTENT_PATH);
  const group = content.find((item) => item.account === ACCOUNT);
  if (!group) throw new Error(`Conta ${ACCOUNT} nao encontrada em content-packs.json.`);
  if (index < 0 || index >= group.packs.length) throw new Error('Slot de conteudo inexistente.');
  group.packs[index] = {
    slides: pack.slides.map((slide) => ({
      eyebrow: String(slide.eyebrow).trim(),
      title: String(slide.title).trim(),
      body: String(slide.body).trim(),
      ...(slide.imagePath ? { imagePath: String(slide.imagePath).trim() } : {}),
      ...(slide.imageUrl ? { imageUrl: String(slide.imageUrl).trim() } : {})
    })),
    caption: String(pack.caption).trim()
  };
  writeFileSync(CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  return getState();
}

function saveSlideImage(sourcePath) {
  const source = resolve(String(sourcePath || ''));
  if (!existsSync(source) || !statSync(source).isFile()) throw new Error('Arquivo de imagem nao encontrado.');
  const ext = extname(source).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) throw new Error('Use imagem JPG, PNG ou WEBP.');
  mkdirSync(UPLOADS_DIR, { recursive: true });
  const name = `${Date.now()}-${source.split(/[\\/]/).pop().replace(/[^a-z0-9._-]/gi, '-')}`;
  const target = join(UPLOADS_DIR, name);
  copyFileSync(source, target);
  return {
    imagePath: `/docs/uploads/${name}`,
    absolutePath: target
  };
}

function saveSlideImageData(name, dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('Imagem invalida. Use JPG, PNG ou WEBP.');
  const extByMime = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
  };
  mkdirSync(UPLOADS_DIR, { recursive: true });
  const safeName = String(name || 'imagem')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9._-]/gi, '-')
    .slice(0, 80) || 'imagem';
  const targetName = `${Date.now()}-${safeName}${extByMime[match[1]]}`;
  const target = join(UPLOADS_DIR, targetName);
  writeFileSync(target, Buffer.from(match[2], 'base64'));
  return {
    imagePath: `/docs/uploads/${targetName}`,
    absolutePath: target
  };
}

function runCommand(command, args, env = {}) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      shell: true,
      env: { ...process.env, ...env }
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => resolveRun({ ok: code === 0, code, stdout, stderr }));
  });
}

async function pushScheduledPosts() {
  const steps = [];
  for (const [command, args] of [
    ['git', ['add', 'automation/instagram-template/config/scheduled-posts.json', 'automation/instagram-template/config/content-packs.json', 'docs/uploads']],
    ['git', ['diff', '--cached', '--quiet']],
    ['git', ['commit', '-m', 'Update scheduled Instagram posts']],
    ['git', ['pull', '--rebase', 'origin', 'main']],
    ['git', ['push', 'origin', 'HEAD:main']]
  ]) {
    const result = await runCommand(command, args);
    steps.push({ command: `${command} ${args.join(' ')}`, ...result });
    if (command === 'git' && args[0] === 'diff' && result.code === 0) {
      return { ok: true, skipped: true, message: 'Nenhuma mudanca de agendamento para enviar.', steps };
    }
    if (command === 'git' && args[0] === 'diff' && result.code === 1) continue;
    if (!result.ok) return { ok: false, steps };
  }
  return { ok: true, steps };
}

function safeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const target = decoded === '/' ? join(DOCS_DIR, 'dashboard.html') : join(ROOT, decoded);
  const resolved = resolve(target);
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

async function handleApi(req, res, url) {
  try {
    if (req.method === 'GET' && url.pathname === '/api/state') {
      return json(res, 200, getState());
    }
    if (req.method === 'GET' && url.pathname === '/api/private-metrics') {
      return json(res, 200, await readPrivateMetrics());
    }
    if (req.method === 'POST' && url.pathname.startsWith('/api/content/')) {
      const index = Number(url.pathname.split('/').pop());
      const body = await readBody(req);
      return json(res, 200, savePack(index, body.pack));
    }
    if (req.method === 'POST' && url.pathname === '/api/upload-image') {
      const body = await readBody(req);
      return json(res, 200, body.dataUrl
        ? saveSlideImageData(body.name, body.dataUrl)
        : saveSlideImage(body.path));
    }
    if (req.method === 'POST' && url.pathname === '/api/schedule') {
      const body = await readBody(req);
      return json(res, 200, saveSchedule(body.times || []));
    }
    if (req.method === 'POST' && url.pathname === '/api/scheduled-posts') {
      const body = await readBody(req);
      return json(res, 200, saveScheduledPost(body));
    }
    if (req.method === 'POST' && url.pathname.startsWith('/api/scheduled-posts/') && url.pathname.endsWith('/cancel')) {
      const id = url.pathname.split('/').at(-2);
      return json(res, 200, cancelScheduledPost(id));
    }
    if (req.method === 'POST' && url.pathname === '/api/validate') {
      return json(res, 200, await runCommand('npm', ['run', 'validate-copy']));
    }
    if (req.method === 'POST' && url.pathname === '/api/render') {
      const body = await readBody(req);
      const slotIndex = Number.isInteger(body.slotIndex) ? body.slotIndex : 0;
      return json(res, 200, await runCommand('npm', ['run', 'render-only'], {
        INSTAGRAM_TEMPLATE_SLOT_INDEX: String(slotIndex)
      }));
    }
    if (req.method === 'POST' && url.pathname === '/api/publish-scheduled') {
      return json(res, 200, await runCommand('npm', ['run', 'instagram', '--', '--account', ACCOUNT, '--scheduled-only']));
    }
    if (req.method === 'POST' && url.pathname === '/api/push-scheduled-posts') {
      return json(res, 200, await pushScheduledPosts());
    }
    return json(res, 404, { error: 'Endpoint nao encontrado.' });
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);

  const path = safeStaticPath(url.pathname);
  if (!path || !existsSync(path) || !statSync(path).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Arquivo nao encontrado.');
    return;
  }

  res.writeHead(200, {
    'content-type': mimeTypes[extname(path).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-store'
  });
  res.end(readFileSync(path));
});

server.listen(PORT, () => {
  console.log(`Dashboard: http://localhost:${PORT}`);
});
