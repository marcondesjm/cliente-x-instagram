import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { requireAdmin } from '../lib/auth.js';
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

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  const accountKey = accountFromQuery(req);
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
    limit: '1',
    access_token: token
  });
  result.latestMedia = media.data?.[0] || null;

  if (result.latestMedia?.id) {
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
    } catch (error) {
      result.insights = {
        available: false,
        error: error.message
      };
    }
  }

  res.status(200).json(result);
}
