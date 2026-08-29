import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { canAccessAccount, requireAdmin } from '../lib/auth.js';
import { accountFromQuery, requireConfiguredAccount } from '../lib/accounts.js';

const ROOT = process.cwd();
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');
const IG_BASE = 'https://graph.facebook.com/v23.0';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function hasUsableSecret(value) {
  return Boolean(value && !String(value).includes('cole_') && String(value).trim().length > 8);
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

function growthFocus({ recentMedia = [], latestInsights = null } = {}) {
  const likes = recentMedia.reduce((total, item) => total + (Number(item.like_count) || 0), 0);
  const comments = recentMedia.reduce((total, item) => total + (Number(item.comments_count) || 0), 0);
  const activePosts = recentMedia.filter((item) => (Number(item.like_count) || 0) + (Number(item.comments_count) || 0) > 0).length;
  const reach = Number(latestInsights?.reach) || 0;
  const saved = Number(latestInsights?.saved) || 0;
  if (comments === 0) return { signal: 'comentarios', action: 'usar uma pergunta especifica e simples, ligada ao problema real do post' };
  if (saved === 0) return { signal: 'salvamentos', action: 'entregar checklist, passo a passo ou criterio que mereca consulta posterior' };
  if (reach > 0 && likes + comments < Math.max(2, Math.ceil(reach * 0.03))) return { signal: 'relevancia inicial', action: 'abrir com dor concreta e beneficio claro para um publico bem definido' };
  if (activePosts < Math.ceil(recentMedia.length / 2)) return { signal: 'consistencia', action: 'replicar os temas que geraram interacao e variar o angulo, sem repetir a publicacao' };
  return { signal: 'compartilhamentos', action: 'produzir conteudo util para uma pessoa enviar a colega, socio ou gestor' };
}

export default async function handler(req, res) {
  const session = requireAdmin(req, res);
  if (!session) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  const accountKey = accountFromQuery(req);
  if (!canAccessAccount(session, accountKey)) {
    res.status(403).json({ error: 'Seu usuario nao tem acesso a esta conta.' });
    return;
  }
  const accounts = readJson(ACCOUNTS_PATH);
  const account = requireConfiguredAccount(accounts, accountKey);

  const credentials = [
    { label: 'Token Instagram', env: account.accessTokenEnv, configured: hasUsableSecret(process.env[account.accessTokenEnv]) },
    { label: 'User ID Instagram', env: account.userIdEnv, configured: hasUsableSecret(process.env[account.userIdEnv]) },
    { label: 'Chave imgBB', env: account.imgbbKeyEnv, configured: hasUsableSecret(process.env[account.imgbbKeyEnv]) }
  ];
  const missing = credentials.filter((item) => !item.configured).map((item) => item.env);
  const token = process.env[account.accessTokenEnv];
  const userId = process.env[account.userIdEnv];

  const result = {
    configured: missing.length === 0,
    credentials,
    missing,
    account: null,
    latestMedia: null,
    recentMediaSummary: null,
    growthFocus: null,
    insights: null,
    checkedAt: new Date().toISOString()
  };

  res.setHeader('cache-control', 'no-store');
  if (!hasUsableSecret(token) || !hasUsableSecret(userId)) {
    res.status(200).json(result);
    return;
  }

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

  const media = await graphGet(`/${userId}/media`, {
    fields: 'id,permalink,timestamp,media_type,like_count,comments_count,caption,media_url,thumbnail_url',
    limit: '10',
    access_token: token
  });
  result.latestMedia = media.data?.[0] || null;
  const recentMedia = Array.isArray(media.data) ? media.data : [];
  result.recentMediaSummary = {
    count: recentMedia.length,
    likes: recentMedia.reduce((total, item) => total + (Number(item.like_count) || 0), 0),
    comments: recentMedia.reduce((total, item) => total + (Number(item.comments_count) || 0), 0),
    postsWithInteractions: recentMedia.filter((item) => (Number(item.like_count) || 0) + (Number(item.comments_count) || 0) > 0).length
  };

  if (result.latestMedia?.id) {
    if (result.latestMedia.media_type === 'CAROUSEL_ALBUM') {
      try {
        const children = await graphGet(`/${result.latestMedia.id}/children`, {
          fields: 'id,media_type,media_url,thumbnail_url',
          limit: '20',
          access_token: token
        });
        result.latestMedia.children = children.data || [];
      } catch {
        result.latestMedia.children = [];
      }
    }
    try {
      const insights = await graphGet(`/${result.latestMedia.id}/insights`, {
        metric: 'reach,saved,total_interactions',
        access_token: token
      });
      result.insights = {
        available: true,
        reach: insightValue(insights, 'reach'),
        saved: insightValue(insights, 'saved'),
        totalInteractions: insightValue(insights, 'total_interactions')
      };
      const publicInteractions = (Number(result.latestMedia.like_count) || 0)
        + (Number(result.latestMedia.comments_count) || 0)
        + (Number(result.insights.saved) || 0);
      result.insights.knownInteractions = Math.max(Number(result.insights.totalInteractions) || 0, publicInteractions);
    } catch (error) {
      result.insights = {
        available: false,
        error: error.message
      };
    }
  }

  result.growthFocus = growthFocus({ recentMedia, latestInsights: result.insights });

  res.status(200).json(result);
}
