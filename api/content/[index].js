import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { requireAdmin } from '../_auth.js';

const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';
const ACCOUNT = 'cliente-x';
const FILE_PATH = 'automation/instagram-template/config/content-packs.json';
const LOCAL_CONTENT_PATH = join(process.cwd(), FILE_PATH);

function json(res, status, body) {
  res.setHeader('cache-control', 'no-store');
  res.status(status).json(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function githubToken() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  if (!token) throw new Error('GITHUB_TOKEN ausente na Vercel.');
  return token;
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

async function githubJson(path, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${githubToken()}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`GitHub HTTP ${response.status}: ${payload.message || text}`);
  return payload;
}

async function readContentFile() {
  const file = await githubJson(`contents/${FILE_PATH}?ref=main`);
  return {
    sha: file.sha,
    groups: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8').replace(/^\uFEFF/, ''))
  };
}

async function writeContentFile(groups, sha) {
  await githubJson(`contents/${FILE_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'Update Instagram content pack',
      branch: 'main',
      sha,
      content: Buffer.from(`${JSON.stringify(groups, null, 2)}\n`, 'utf8').toString('base64')
    })
  });
}

function stateFromGroups(groups) {
  const group = groups.find((item) => item.account === ACCOUNT);
  const packs = group?.packs || [];
  return {
    packs,
    packCount: packs.length,
    uniqueCaptions: new Set(packs.map((pack) => String(pack.caption || '').replace(/\s+/g, ' ').trim())).size
  };
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const index = Number(req.query.index);
    const body = await readBody(req);
    validatePack(body.pack);

    let sha;
    let groups;
    try {
      ({ sha, groups } = await readContentFile());
    } catch {
      groups = JSON.parse(readFileSync(LOCAL_CONTENT_PATH, 'utf8').replace(/^\uFEFF/, ''));
    }

    const group = groups.find((item) => item.account === ACCOUNT);
    if (!group) throw new Error(`Conta ${ACCOUNT} nao encontrada em content-packs.json.`);
    if (!Number.isInteger(index) || index < 0 || index >= group.packs.length) throw new Error('Slot de conteudo inexistente.');

    group.packs[index] = {
      slides: body.pack.slides.map((slide) => ({
        eyebrow: String(slide.eyebrow || '').trim(),
        title: String(slide.title || '').trim(),
        body: String(slide.body || '').trim(),
        ...(slide.imagePath ? { imagePath: String(slide.imagePath).trim() } : {}),
        ...(slide.imageUrl ? { imageUrl: String(slide.imageUrl).trim() } : {})
      })),
      caption: String(body.pack.caption || '').trim()
    };

    if (!sha) throw new Error('Nao consegui obter o arquivo atual do GitHub.');
    await writeContentFile(groups, sha);
    json(res, 200, { ok: true, ...stateFromGroups(groups), message: 'Conteudo salvo no GitHub.' });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}
