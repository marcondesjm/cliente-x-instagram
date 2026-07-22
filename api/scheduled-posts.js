import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { requireAdmin } from '../lib/auth.js';
import { accountFromBody } from '../lib/accounts.js';

const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';
const FILE_PATH = 'automation/instagram-template/config/scheduled-posts.json';
const LOCAL_CONTENT_PATH = join(process.cwd(), 'automation', 'instagram-template', 'config', 'content-packs.json');

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

function brtDateTimeToIso(date, time) {
  if (!String(date || '').match(/^\d{4}-\d{2}-\d{2}$/)) throw new Error('Data invalida. Use AAAA-MM-DD.');
  if (!String(time || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/)) throw new Error('Horario invalido. Use HH:MM.');
  return `${date}T${time}:00-03:00`;
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

function localPacks(account) {
  const groups = JSON.parse(readFileSync(LOCAL_CONTENT_PATH, 'utf8').replace(/^\uFEFF/, ''));
  return groups.find((item) => item.account === account)?.packs || [];
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

async function readQueueFile() {
  const file = await githubJson(`contents/${FILE_PATH}?ref=main`);
  const content = Buffer.from(file.content, 'base64').toString('utf8');
  return { sha: file.sha, groups: JSON.parse(content.replace(/^\uFEFF/, '')) };
}

async function writeQueueFile(groups, sha) {
  await githubJson(`contents/${FILE_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'Update scheduled Instagram posts',
      branch: 'main',
      sha,
      content: Buffer.from(`${JSON.stringify(groups, null, 2)}\n`, 'utf8').toString('base64')
    })
  });
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const body = await readBody(req);
    const account = accountFromBody(body);
    const packIndex = Number(body.packIndex);
    const packs = localPacks(account);
    if (!Number.isInteger(packIndex) || packIndex < 0 || (!body.pack && packIndex >= packs.length)) {
      throw new Error('Pack invalido para agendamento.');
    }
    const pack = body.pack || packs[packIndex];
    validatePack(pack);

    const { sha, groups } = await readQueueFile();
    let group = groups.find((item) => item.account === account);
    if (!group) {
      group = { account, posts: [] };
      groups.push(group);
    }
    if (!Array.isArray(group.posts)) group.posts = [];

    const post = {
      id: `manual-${Date.now()}`,
      status: 'pending',
      packIndex,
      pack,
      scheduledFor: body.publishNow ? new Date().toISOString() : brtDateTimeToIso(body.date, body.time),
      mode: body.mode === 'story-only' ? 'story-only' : 'feed-and-story',
      title: pack?.slides?.[0]?.title || `Pack ${packIndex}`,
      createdAt: new Date().toISOString()
    };
    group.posts.push(post);
    await writeQueueFile(groups, sha);

    json(res, 200, { ok: true, scheduledPosts: group.posts, post, message: 'Agendamento salvo no GitHub.' });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}
