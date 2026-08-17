import { canAccessAccount, requireAdmin } from '../lib/auth.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { accountFromBody, requireConfiguredAccount } from '../lib/accounts.js';
import { EDITORIAL_SOURCES, normalizeEditorialSources, researchFreshEditorialPacks } from '../lib/editorial-research.js';

const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';
const WORKFLOW = 'instagram-feed-cliente-x.yml';
const ACCOUNTS_PATH = join(process.cwd(), 'automation', 'instagram-template', 'config', 'accounts.json');
const PUBLICATION_HISTORY_PATH = join(process.cwd(), 'automation', 'instagram-template', 'config', 'publication-history.json');

function publishedResearch(accountKey) {
  try {
    const history = JSON.parse(readFileSync(PUBLICATION_HISTORY_PATH, 'utf8').replace(/^\uFEFF/, ''));
    const entries = Array.isArray(history?.[accountKey]) ? history[accountKey] : [];
    return {
      urls: new Set(entries.map((entry) => String(entry?.research?.sourceUrl || '').trim().replace(/\/$/, '')).filter(Boolean)),
      titles: new Set(entries.map((entry) => String(entry?.research?.sourceTitle || entry?.coverTitle || '').trim().toLocaleLowerCase('pt-BR')).filter(Boolean)),
      lastSource: String([...entries].reverse().find((entry) => entry?.research?.source)?.research?.source || '').trim()
    };
  } catch {
    return { urls: new Set(), titles: new Set(), lastSource: '' };
  }
}

function activeRadar(account) {
  const saved = account.contentProfile?.radar || {};
  const sources = normalizeEditorialSources(saved.sources);
  return {
    enabled: typeof saved.enabled === 'boolean' ? saved.enabled : account.account === 'cliente-x',
    // A busca começa na semana e pode avançar até 30 dias, sempre mantendo
    // fonte oficial e sem cair em pack manual ou conteúdo genérico.
    maxAgeDays: 7,
    keywords: Array.isArray(saved.keywords) ? saved.keywords : [],
    excludeKeywords: Array.isArray(saved.excludeKeywords) ? saved.excludeKeywords : [],
    sources: sources.length ? sources : (account.account === 'cliente-x' ? EDITORIAL_SOURCES : [])
  };
}

async function currentRadarPack(account) {
  const radar = activeRadar(account);
  if (!radar.enabled) return null;
  if (!radar.sources.length) throw new Error('O Radar está ativo, mas não há fontes oficiais configuradas para esta conta.');

  const published = publishedResearch(account.account);
  for (const maxAgeDays of [7, 15, 30]) {
    const result = await researchFreshEditorialPacks({
      maxAgeDays,
      limit: maxAgeDays === 30 ? 40 : 26,
      timeoutMs: 7000,
      sources: radar.sources,
      keywords: radar.keywords,
      excludeKeywords: radar.excludeKeywords,
      niche: account.contentProfile?.niche || '',
      offer: account.contentProfile?.offer || ''
    });
    const eligible = result.packs.filter((item) => {
      const url = String(item?.research?.sourceUrl || '').trim().replace(/\/$/, '');
      const title = String(item?.research?.sourceTitle || item?.slides?.[0]?.title || '').trim().toLocaleLowerCase('pt-BR');
      return url && item?.slides?.length >= 2 && item?.caption?.trim() && !published.urls.has(url) && !published.titles.has(title);
    });
    const pack = eligible.find((item) => item?.research?.source !== published.lastSource) || eligible[0];
    if (pack) return pack;
  }
  throw new Error('Não encontrei nos últimos 30 dias uma notícia oficial de IA adequada para esta conta. Nenhum post foi enviado. Atualize as fontes do Radar ou tente mais tarde.');
}

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

async function dispatchWorkflow(inputs) {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${githubToken()}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28'
    },
    body: JSON.stringify({ ref: 'main', inputs })
  });
  if (response.status !== 204) {
    const text = await response.text();
    throw new Error(`GitHub Actions HTTP ${response.status}: ${text}`);
  }
}

export default async function handler(req, res) {
  const session = requireAdmin(req, res);
  if (!session) return;

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const body = await readBody(req);
    const account = accountFromBody(body);
    if (!canAccessAccount(session, account)) {
      json(res, 403, { error: 'Seu usuario nao tem acesso a esta conta.' });
      return;
    }
    const accounts = JSON.parse(readFileSync(ACCOUNTS_PATH, 'utf8').replace(/^\uFEFF/, ''));
    const configuredAccount = requireConfiguredAccount(accounts, account);
    const radarPack = await currentRadarPack(configuredAccount);
    // Com Radar ativo, a fonte oficial do dia sempre substitui o pack manual do editor.
    const pack = radarPack || body.pack;
    const packJson = pack ? JSON.stringify(pack) : '';
    if (packJson.length > 60000) throw new Error('Pack muito grande para disparar pelo GitHub Actions.');

    await dispatchWorkflow({
      account,
      dry_run: 'false',
      slot_index: String(Number.isInteger(body.packIndex) ? body.packIndex : 0),
      publish_mode: ['story-only', 'feed-only'].includes(body.mode) ? body.mode : 'feed-and-story',
      scheduled_only: 'false',
      pack_json: packJson
    });

    json(res, 200, {
      ok: true,
      message: 'Publicacao enviada para o GitHub Actions. A postagem deve aparecer em alguns minutos.'
    });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}
