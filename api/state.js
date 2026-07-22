import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  clearSessionCookie,
  configuredAdminEmail,
  createSessionCookie,
  getSession,
  hasAdminConfig,
  validateLogin
} from '../lib/auth.js';

const ROOT = process.cwd();
const CONTENT_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'content-packs.json');
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');
const SCHEDULED_POSTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'scheduled-posts.json');
const ACCOUNT = 'cliente-x';
const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';
const SCHEDULED_FILE_PATH = 'automation/instagram-template/config/scheduled-posts.json';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_AVyS8LGjVuhUOxkpfZZwOF5vMmPj';
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_T4Th6hb1UxtrbtcWfLxlWNRQ';
const VERCEL_PROJECT_NAME = process.env.VERCEL_PROJECT_NAME || 'cliente-x-instagram';
const ACTIVE_VERSION = {
  name: 'cliente-x-funcionando',
  label: 'Última versão funcionando',
  status: 'funcionando',
  stableCommit: 'eb93f36',
  stableCommitUrl: 'https://github.com/marcondesjm/cliente-x-instagram/commit/eb93f36',
  description: 'Vercel, botões, publicação real e linha editorial narrativa confirmados.'
};
const MAINTENANCE = {
  githubToken: {
    label: 'GitHub token do Vercel',
    env: 'GITHUB_TOKEN',
    expiresAt: '2026-08-21',
    status: 'renovar antes do vencimento',
    action: 'Criar outro fine-grained token no GitHub com Actions e Contents read/write para marcondesjm/cliente-x-instagram, atualizar GITHUB_TOKEN no Vercel Production e redeployar.'
  },
  metaToken: {
    label: 'Token Meta/Instagram',
    env: 'CLIENTE_X_INSTAGRAM_ACCESS_TOKEN',
    status: 'reativar se a Meta negar publicação ou métricas',
    action: 'Gerar novo token na Meta, trocar CLIENTE_X_INSTAGRAM_ACCESS_TOKEN no Vercel e nos GitHub Secrets, depois testar /api/private-metrics e Publicar agora.'
  },
  note: 'Por segurança, o dashboard mostra o que renovar, mas não exibe nem edita valores de tokens.'
};
const ACCESS_CONFIG = [
  {
    platform: 'GitHub',
    account: 'marcondesjm',
    project: 'marcondesjm/cliente-x-instagram',
    purpose: 'Disparar GitHub Actions e gravar agenda/conteúdo pelo painel.',
    envKeys: ['GITHUB_TOKEN'],
    managementUrl: 'https://github.com/settings/personal-access-tokens',
    secondaryUrl: 'https://github.com/marcondesjm/cliente-x-instagram/actions/workflows/instagram-feed-cliente-x.yml',
    status: 'Token fine-grained com Actions read/write e Contents read/write.',
    action: 'Quando vencer, criar novo token para este repositório, trocar GITHUB_TOKEN no Vercel Production e redeployar.',
    expiresAt: '2026-08-21'
  },
  {
    platform: 'Vercel',
    account: 'marcondes-machados-projects',
    project: 'cliente-x-instagram',
    purpose: 'Hospedar o painel protegido e guardar variáveis de produção.',
    envKeys: [
      'VERCEL_TOKEN',
      'GITHUB_TOKEN',
      'IMGBB_API_KEY',
      'CLIENTE_X_INSTAGRAM_ACCESS_TOKEN',
      'CLIENTE_X_INSTAGRAM_USER_ID',
      'ADMIN_EMAIL',
      'ADMIN_PASSWORD',
      'ADMIN_SESSION_SECRET'
    ],
    managementUrl: 'https://vercel.com/marcondes-machados-projects/cliente-x-instagram/settings/environment-variables',
    secondaryUrl: 'https://cliente-x-instagram.vercel.app',
    status: 'Produção em cliente-x-instagram.vercel.app.',
    action: 'Alterar variáveis em Production e criar novo deploy para aplicar.'
  },
  {
    platform: 'Meta',
    account: 'marcondes.machado.oficial',
    project: 'Instagram Graph API',
    purpose: 'Autorizar publicação no feed/story e leitura de métricas.',
    envKeys: ['CLIENTE_X_INSTAGRAM_ACCESS_TOKEN', 'CLIENTE_X_INSTAGRAM_USER_ID'],
    managementUrl: 'https://developers.facebook.com/tools/explorer/',
    secondaryUrl: 'https://developers.facebook.com/apps/',
    status: 'Usado pelas rotas de publicação e métricas privadas.',
    action: 'Se a Meta bloquear ou expirar o token, gerar novo token, trocar no Vercel e nos GitHub Secrets, depois testar métricas.'
  },
  {
    platform: 'Instagram',
    account: 'marcondes.machado.oficial',
    project: 'Conta profissional conectada ao Meta',
    purpose: 'Destino final das publicações automatizadas.',
    envKeys: ['CLIENTE_X_INSTAGRAM_USER_ID'],
    managementUrl: 'https://www.instagram.com/marcondes.machado.oficial/',
    secondaryUrl: 'https://business.facebook.com/latest/settings/instagram_accounts',
    status: 'Conta esperada pelo projeto: marcondes.machado.oficial.',
    action: 'Se trocar a conta, atualizar CLIENTE_X_INSTAGRAM_USER_ID e validar o usuário antes de publicar.'
  }
];
const SECRET_KEYS = [
  'VERCEL_TOKEN',
  'GITHUB_TOKEN',
  'CLIENTE_X_INSTAGRAM_ACCESS_TOKEN',
  'CLIENTE_X_INSTAGRAM_USER_ID',
  'IMGBB_API_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];
const EDITABLE_SECRET_KEYS = new Set([
  'VERCEL_TOKEN',
  'GITHUB_TOKEN',
  'CLIENTE_X_INSTAGRAM_ACCESS_TOKEN',
  'CLIENTE_X_INSTAGRAM_USER_ID',
  'IMGBB_API_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ADMIN_SESSION_SECRET'
]);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function normalizeCaption(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function cronToBrtTime(cron) {
  const [minute, hour] = cron.split(' ').map(Number);
  const brtHour = (hour + 21) % 24;
  return `${String(brtHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function maskSecret(value = '') {
  const text = String(value || '');
  if (!text) return '';
  if (text.length <= 10) return `${text.slice(0, 2)}...${text.slice(-2)}`;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

function secretStatuses() {
  return SECRET_KEYS.map((key) => {
    const value = process.env[key] || '';
    return {
      key,
      configured: Boolean(value),
      masked: maskSecret(value),
      length: value.length
    };
  });
}

function vercelTokenFromEnv() {
  return process.env.VERCEL_TOKEN || process.env.VERCEL_ACCESS_TOKEN || '';
}

function vercelApiPath(path) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (VERCEL_TEAM_ID) url.searchParams.set('teamId', VERCEL_TEAM_ID);
  return url;
}

async function vercelFetch(path, options = {}, token = vercelTokenFromEnv()) {
  if (!token) throw new Error('Configure VERCEL_TOKEN para salvar variaveis pelo painel.');
  const response = await fetch(vercelApiPath(path), {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.message || `Vercel HTTP ${response.status}`);
  }
  return payload;
}

async function validateAccessValue(key, value, companion = {}) {
  const text = String(value || '').trim();
  if (!EDITABLE_SECRET_KEYS.has(key)) throw new Error('Variavel nao permitida.');
  if (!text) throw new Error('Cole um valor antes de validar.');

  if (key === 'ADMIN_EMAIL') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw new Error('Email invalido.');
    return { ok: true, message: 'Email admin valido.' };
  }

  if (key === 'ADMIN_PASSWORD') {
    if (text.length < 8) throw new Error('Senha precisa ter pelo menos 8 caracteres.');
    return { ok: true, message: 'Senha admin com tamanho valido.' };
  }

  if (key === 'ADMIN_SESSION_SECRET') {
    if (text.length < 32) throw new Error('ADMIN_SESSION_SECRET precisa ter pelo menos 32 caracteres.');
    return { ok: true, message: 'Chave de sessao com tamanho valido.' };
  }

  if (key === 'GITHUB_TOKEN') {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/instagram-feed-cliente-x.yml`, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${text}`,
        'x-github-api-version': '2022-11-28'
      }
    });
    if (!response.ok) throw new Error(`GitHub recusou o token: HTTP ${response.status}.`);
    const workflow = await response.json();
    return { ok: true, message: `GitHub validado: workflow ${workflow.name || 'instagram-feed-cliente-x.yml'} acessivel.` };
  }

  if (key === 'CLIENTE_X_INSTAGRAM_ACCESS_TOKEN' || key === 'CLIENTE_X_INSTAGRAM_USER_ID') {
    const token = key === 'CLIENTE_X_INSTAGRAM_ACCESS_TOKEN'
      ? text
      : String(companion.accessToken || process.env.CLIENTE_X_INSTAGRAM_ACCESS_TOKEN || '').trim();
    const userId = key === 'CLIENTE_X_INSTAGRAM_USER_ID'
      ? text
      : String(companion.userId || process.env.CLIENTE_X_INSTAGRAM_USER_ID || '').trim();
    if (!token || !userId) throw new Error('Informe token Meta e ID do Instagram para validar.');
    const response = await fetch(`https://graph.facebook.com/v22.0/${encodeURIComponent(userId)}?fields=username&access_token=${encodeURIComponent(token)}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message || `Meta recusou os dados: HTTP ${response.status}.`);
    }
    return { ok: true, message: `Meta/Instagram validado: ${payload.username || userId}.` };
  }

  if (key === 'IMGBB_API_KEY') {
    const body = new URLSearchParams({
      key: text,
      expiration: '60',
      image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='
    });
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message || `ImgBB recusou a chave: HTTP ${response.status}.`);
    }
    return { ok: true, message: 'ImgBB validado com upload temporario.' };
  }

  if (key === 'VERCEL_TOKEN') {
    await vercelFetch(`/v9/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}`, {}, text);
    return { ok: true, message: `Vercel validado no projeto ${VERCEL_PROJECT_NAME}.` };
  }

  return { ok: true, message: `${key} recebeu um valor preenchido.` };
}

async function saveVercelEnv(key, value) {
  if (!EDITABLE_SECRET_KEYS.has(key)) throw new Error('Variavel nao permitida.');
  const text = String(value || '').trim();
  if (!text) throw new Error('Cole um valor antes de salvar.');
  const token = key === 'VERCEL_TOKEN' ? text : vercelTokenFromEnv();
  const projectPath = `/v9/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}`;
  const existingPayload = await vercelFetch(`${projectPath}/env`, {}, token);
  const existing = (existingPayload.envs || []).filter((env) => {
    const target = Array.isArray(env.target) ? env.target : [env.target].filter(Boolean);
    return env.key === key && target.includes('production');
  });

  for (const env of existing) {
    await vercelFetch(`${projectPath}/env/${encodeURIComponent(env.id)}`, { method: 'DELETE' }, token);
  }

  await vercelFetch(`/v10/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}/env`, {
    method: 'POST',
    body: JSON.stringify({
      key,
      value: text,
      target: ['production'],
      type: 'encrypted'
    })
  }, token);

  return {
    ok: true,
    message: `${key} salvo no Vercel Production. Faça um novo deploy para a aplicação usar o valor atualizado.`
  };
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

async function readScheduledGroups() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  if (!token) return readJson(SCHEDULED_POSTS_PATH);

  try {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${SCHEDULED_FILE_PATH}?ref=main`, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'x-github-api-version': '2022-11-28'
      }
    });
    if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
    const file = await response.json();
    return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8').replace(/^\uFEFF/, ''));
  } catch {
    return readJson(SCHEDULED_POSTS_PATH);
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const body = await readBody(req);
      if (body.action === 'login') {
        const email = String(body.email || '').trim();
        const password = String(body.password || '');
        if (!validateLogin(email, password)) {
          res.status(401).json({ error: 'Email ou senha invalidos.' });
          return;
        }
        res.setHeader('Set-Cookie', createSessionCookie(email));
        res.setHeader('cache-control', 'no-store');
        res.status(200).json({ ok: true, authenticated: true, email });
        return;
      }
      if (body.action === 'logout') {
        res.setHeader('Set-Cookie', clearSessionCookie());
        res.setHeader('cache-control', 'no-store');
        res.status(200).json({ ok: true, authenticated: false });
        return;
      }
      const session = getSession(req);
      if (!session) {
        res.status(401).json({ error: 'Login admin obrigatorio.' });
        return;
      }
      if (body.action === 'validate-access') {
        const result = await validateAccessValue(
          String(body.key || '').trim(),
          String(body.value || ''),
          body.companion || {}
        );
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'save-access') {
        const key = String(body.key || '').trim();
        const value = String(body.value || '');
        const validation = await validateAccessValue(key, value, body.companion || {});
        const saved = await saveVercelEnv(key, value);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json({
          ok: true,
          validation,
          ...saved,
          secrets: secretStatuses()
        });
        return;
      }
      res.status(400).json({ error: 'Acao invalida.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  const session = getSession(req);
  const accounts = readJson(ACCOUNTS_PATH);
  const content = readJson(CONTENT_PATH);
  const account = accounts.find((item) => item.account === ACCOUNT);
  const group = content.find((item) => item.account === ACCOUNT);
  const scheduledGroups = await readScheduledGroups();
  const scheduledGroup = scheduledGroups.find((item) => item.account === ACCOUNT);
  const packs = group?.packs || [];

  res.setHeader('cache-control', 'no-store');
  res.status(200).json({
    account,
    activeVersion: {
      ...ACTIVE_VERSION,
      currentCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || ACTIVE_VERSION.stableCommit,
      currentCommitFull: process.env.VERCEL_GIT_COMMIT_SHA || ACTIVE_VERSION.stableCommit,
      currentCommitUrl: process.env.VERCEL_GIT_COMMIT_SHA
        ? `https://github.com/${OWNER}/${REPO}/commit/${process.env.VERCEL_GIT_COMMIT_SHA}`
        : ACTIVE_VERSION.stableCommitUrl
    },
    session: {
      authenticated: Boolean(session),
      email: session?.email || null,
      adminConfigured: hasAdminConfig(),
      adminEmail: configuredAdminEmail() || null
    },
    maintenance: MAINTENANCE,
    accessConfig: ACCESS_CONFIG,
    secrets: session ? secretStatuses() : [],
    scheduleBrt: account?.scheduleUtc?.map(cronToBrtTime) || [],
    packs,
    packCount: packs.length,
    uniqueCaptions: new Set(packs.map((pack) => normalizeCaption(pack.caption))).size,
    scheduledPosts: scheduledGroup?.posts || [],
    latestResult: null,
    latestFailure: null
  });
}
