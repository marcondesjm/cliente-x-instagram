#!/usr/bin/env node
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DOCS_DIR = join(ROOT, 'docs');
const CONTENT_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'content-packs.json');
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');
const RUNS_DIR = join(ROOT, 'automation', 'instagram-template', 'runs');
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
  '.svg': 'image/svg+xml; charset=utf-8'
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function normalizeCaption(text = '') {
  return text.replace(/\s+/g, ' ').trim();
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
      if (raw.length > 1_000_000) {
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
  const latestResultFile = latestFiles(join(RUNS_DIR, ACCOUNT), (path) => path.endsWith('result.json'), 1)[0];
  const latestFailureFile = latestFiles(RUNS_DIR, (path) => /failure-\d{4}-\d{2}-\d{2}-\d{6}\.json$/.test(path), 1)[0];
  const latestResult = latestResultFile ? readJson(latestResultFile.path) : null;
  const latestFailure = latestFailureFile ? {
    path: relativeWebPath(latestFailureFile.path),
    ...readJson(latestFailureFile.path)
  } : null;

  return {
    account,
    packs,
    packCount: packs.length,
    uniqueCaptions,
    latestResult,
    latestFailure
  };
}

function validatePack(pack) {
  if (!pack || typeof pack !== 'object') throw new Error('Pack invalido.');
  if (!Array.isArray(pack.slides) || pack.slides.length < 2) throw new Error('O pack precisa ter pelo menos 2 slides.');
  for (const [index, slide] of pack.slides.entries()) {
    if (!slide.eyebrow?.trim()) throw new Error(`Slide ${index + 1}: banner vazio.`);
    if (!slide.title?.trim()) throw new Error(`Slide ${index + 1}: titulo vazio.`);
    if (!slide.body?.trim()) throw new Error(`Slide ${index + 1}: descricao vazia.`);
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
      body: String(slide.body).trim()
    })),
    caption: String(pack.caption).trim()
  };
  writeFileSync(CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  return getState();
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
    if (req.method === 'POST' && url.pathname.startsWith('/api/content/')) {
      const index = Number(url.pathname.split('/').pop());
      const body = await readBody(req);
      return json(res, 200, savePack(index, body.pack));
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
