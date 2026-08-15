import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  clearSessionCookie,
  configuredAdminEmail,
  createSessionCookie,
  canAccessAccount,
  getSession,
  hasAdminConfig,
  isOwner,
  publicUsers,
  validateLogin
} from '../lib/auth.js';
import { accountFromQuery, normalizeAccountKey, requireConfiguredAccount } from '../lib/accounts.js';
import { analyzeBrandDocument } from '../lib/brand-analysis.js';
import Stripe from 'stripe';

const ROOT = process.cwd();
const CONTENT_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'content-packs.json');
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');
const SCHEDULED_POSTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'scheduled-posts.json');
const WEEKLY_PROGRAMS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'weekly-programs.json');
const WATCHDOG_ERRORS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'watchdog-errors.json');
const DIRECT_AUTOMATIONS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'direct-automations.json');
const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';
const ACCOUNTS_FILE_PATH = 'automation/instagram-template/config/accounts.json';
const CONTENT_FILE_PATH = 'automation/instagram-template/config/content-packs.json';
const SCHEDULED_FILE_PATH = 'automation/instagram-template/config/scheduled-posts.json';
const WEEKLY_PROGRAMS_FILE_PATH = 'automation/instagram-template/config/weekly-programs.json';
const WATCHDOG_ERRORS_FILE_PATH = 'automation/instagram-template/config/watchdog-errors.json';
const DIRECT_AUTOMATIONS_FILE_PATH = 'automation/instagram-template/config/direct-automations.json';
const FORCE_WATCHDOG_FILE_PATH = '.github/force-instagram-watchdog.txt';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_AVyS8LGjVuhUOxkpfZZwOF5vMmPj';
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_T4Th6hb1UxtrbtcWfLxlWNRQ';
const VERCEL_PROJECT_NAME = process.env.VERCEL_PROJECT_NAME || 'cliente-x-instagram';
const ACTIVE_VERSION = {
  name: 'cliente-x-funcionando',
  label: 'Última versão funcionando',
  appVersion: 'v4.29',
  status: 'funcionando',
  stableCommit: '3314cfb',
  stableCommitUrl: 'https://github.com/marcondesjm/cliente-x-instagram/commit/3314cfb',
  description: 'Vercel, multi-conta, perfil editorial, usuários e automação validados.'
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
function accessConfigForAccount(account) {
  const accessTokenEnv = account?.accessTokenEnv || 'CLIENTE_X_INSTAGRAM_ACCESS_TOKEN';
  const userIdEnv = account?.userIdEnv || 'CLIENTE_X_INSTAGRAM_USER_ID';
  const imgbbKeyEnv = account?.imgbbKeyEnv || 'IMGBB_API_KEY';
  const username = account?.expectedUsername || 'marcondes.machado.oficial';
  const accountKey = account?.account || 'cliente-x';
  const threadsPrefix = accessTokenEnv.replace(/_INSTAGRAM_ACCESS_TOKEN$/, '');
  const threadsTokenEnv = `${threadsPrefix}_THREADS_ACCESS_TOKEN`;
  const threadsUserIdEnv = `${threadsPrefix}_THREADS_USER_ID`;

  return [
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
      imgbbKeyEnv,
      accessTokenEnv,
      userIdEnv,
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
    platform: 'Stripe',
    account: 'Plataforma SaaS',
    project: 'Assinaturas recorrentes',
    purpose: 'Criar checkout, receber webhooks e ativar ou pausar clientes conforme o pagamento.',
    envKeys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PRICE_STARTER', 'STRIPE_PRICE_PROFESSIONAL', 'STRIPE_PRICE_AGENCY'],
    managementUrl: 'https://dashboard.stripe.com/apikeys',
    secondaryUrl: 'https://dashboard.stripe.com/webhooks',
    status: 'Configure primeiro em modo de teste e valide o webhook antes de usar cobrancas reais.',
    action: 'Cadastre os tres precos recorrentes e aponte o webhook para /api/state?billing=webhook.'
  },
  {
    platform: 'Meta',
    account: username,
    project: 'Instagram Graph API',
    purpose: 'Autorizar publicação, métricas e automação de comentários para o Direct.',
    envKeys: [accessTokenEnv, userIdEnv, 'INSTAGRAM_WEBHOOK_VERIFY_TOKEN', 'INSTAGRAM_APP_SECRET'],
    managementUrl: 'https://developers.facebook.com/tools/explorer/',
    secondaryUrl: 'https://developers.facebook.com/apps/',
    status: 'Usado pelas rotas de publicação e métricas privadas.',
    action: 'Se a Meta bloquear ou expirar o token, gerar novo token, trocar no Vercel e nos GitHub Secrets, depois testar métricas.'
  },
  {
    platform: 'Instagram',
    account: username,
    project: 'Conta profissional conectada ao Meta',
    purpose: 'Destino final das publicações automatizadas.',
    envKeys: [userIdEnv],
    managementUrl: `https://www.instagram.com/${username}/`,
    secondaryUrl: 'https://business.facebook.com/latest/settings/instagram_accounts',
    status: `Conta esperada pelo projeto: ${username}.`,
    action: `Se trocar a conta, atualizar ${userIdEnv} e validar o usuário antes de publicar.`
  },
  {
    platform: 'Threads',
    account: username,
    project: 'Threads API',
    purpose: 'Publicar textos, imagens e carrosseis com texto adaptado para ate 500 caracteres.',
    envKeys: ['THREADS_APP_ID', 'THREADS_APP_SECRET', threadsTokenEnv, threadsUserIdEnv],
    managementUrl: 'https://developers.facebook.com/apps/',
    secondaryUrl: `/api/state?threads=connect&account=${encodeURIComponent(accountKey)}`,
    secondaryLabel: 'Conectar Threads',
    testAction: 'publish-threads-test',
    status: process.env[threadsTokenEnv] && process.env[threadsUserIdEnv] ? 'Conta Threads conectada.' : 'Aguardando autorização OAuth.',
    action: 'Cadastre o App ID e App Secret, salve, faça o redeploy e clique em Conectar Threads.'
  }
];
}
const SECRET_KEYS = [
  'VERCEL_TOKEN',
  'GITHUB_TOKEN',
  'IMGBB_API_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ADMIN_USERS_JSON',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_STARTER',
  'STRIPE_PRICE_PROFESSIONAL',
  'STRIPE_PRICE_AGENCY'
  ,'THREADS_APP_ID'
  ,'THREADS_APP_SECRET'
  ,'INSTAGRAM_WEBHOOK_VERIFY_TOKEN'
  ,'INSTAGRAM_APP_SECRET'
];
const EDITABLE_SECRET_KEYS = new Set([
  'VERCEL_TOKEN',
  'GITHUB_TOKEN',
  'CLIENTE_X_INSTAGRAM_ACCESS_TOKEN',
  'CLIENTE_X_INSTAGRAM_USER_ID',
  'IMGBB_API_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ADMIN_USERS_JSON',
  'ADMIN_SESSION_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_STARTER',
  'STRIPE_PRICE_PROFESSIONAL',
  'STRIPE_PRICE_AGENCY'
  ,'THREADS_APP_ID'
  ,'THREADS_APP_SECRET'
  ,'INSTAGRAM_WEBHOOK_VERIFY_TOKEN'
  ,'INSTAGRAM_APP_SECRET'
]);

function accountSecretKeys(accounts = readJson(ACCOUNTS_PATH)) {
  return accounts.flatMap((account) => [
    account.accessTokenEnv,
    account.userIdEnv,
    account.imgbbKeyEnv,
    `${account.accessTokenEnv.replace(/_INSTAGRAM_ACCESS_TOKEN$/, '')}_THREADS_ACCESS_TOKEN`,
    `${account.accessTokenEnv.replace(/_INSTAGRAM_ACCESS_TOKEN$/, '')}_THREADS_USER_ID`
  ]).filter(Boolean);
}

function isEditableSecretKey(key) {
  return EDITABLE_SECRET_KEYS.has(key) ||
    accountSecretKeys().includes(key) ||
    /^[A-Z0-9_]+_(INSTAGRAM_ACCESS_TOKEN|INSTAGRAM_USER_ID|THREADS_ACCESS_TOKEN|THREADS_USER_ID|IMGBB_API_KEY)$/.test(key);
}

function accountEnvRole(key) {
  const accounts = readJson(ACCOUNTS_PATH);
  const account = accounts.find((item) => (
    item.accessTokenEnv === key ||
    item.userIdEnv === key ||
    item.imgbbKeyEnv === key
  ));
  if (!account) {
    if (key.endsWith('_INSTAGRAM_ACCESS_TOKEN')) return { role: 'instagram-token', account: null };
    if (key.endsWith('_INSTAGRAM_USER_ID')) return { role: 'instagram-user-id', account: null };
    if (key.endsWith('_IMGBB_API_KEY')) return { role: 'imgbb-key', account: null };
    return { role: null, account: null };
  }
  if (account.accessTokenEnv === key) return { role: 'instagram-token', account };
  if (account.userIdEnv === key) return { role: 'instagram-user-id', account };
  if (account.imgbbKeyEnv === key) return { role: 'imgbb-key', account };
  return { role: null, account };
}

function accountForSecretKey(accounts, key) {
  return accounts.find((account) => (
    account.accessTokenEnv === key ||
    account.userIdEnv === key ||
    account.imgbbKeyEnv === key ||
    `${account.accessTokenEnv.replace(/_INSTAGRAM_ACCESS_TOKEN$/, '')}_THREADS_ACCESS_TOKEN` === key ||
    `${account.accessTokenEnv.replace(/_INSTAGRAM_ACCESS_TOKEN$/, '')}_THREADS_USER_ID` === key
  ));
}

function canManageSecret(session, key, accounts = []) {
  if (isOwner(session)) return true;
  const account = accountForSecretKey(accounts, key);
  return Boolean(account && canAccessAccount(session, account));
}

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

function saoPauloParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function todaySaoPaulo() {
  const parts = saoPauloParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDaysToDateString(dateString, days = 1) {
  const [year, month, day] = String(dateString || todaySaoPaulo()).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 15, 0, 0));
  return date.toISOString().slice(0, 10);
}

function tomorrowSaoPaulo() {
  return addDaysToDateString(todaySaoPaulo(), 1);
}

function weekdaySaoPaulo(dateString = todaySaoPaulo()) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 15, 0, 0)).getUTCDay();
}

function brtDateAndTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };
  const parts = saoPauloParts(date);
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`
  };
}

function daysSinceEpoch(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function pickDailyIndex(items, dateString, slotIndex = 0) {
  if (!items.length) return -1;
  return (daysSinceEpoch(dateString) + slotIndex) % items.length;
}

function compactText(text = '', maxLength = 150) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength);
  const cut = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, cut > 80 ? cut : maxLength).trim()}...`;
}

function activeWeeklyProgramsForDate(programs = [], dateString = todaySaoPaulo()) {
  const weekday = weekdaySaoPaulo(dateString);
  return programs
    .filter((program) => program.status !== 'paused')
    .filter((program) => Array.isArray(program.weekdays) && program.weekdays.map(Number).includes(weekday))
    .filter((program) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(program.time || '')))
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));
}

function weeklyProgramPlanItems(programs = [], dateString = todaySaoPaulo()) {
  return activeWeeklyProgramsForDate(programs, dateString).map((program, index) => ({
    time: program.time,
    slotIndex: `program-${program.id || index}`,
    type: 'program',
    status: 'planned',
    title: program.title || program.name || 'Programa da rádio',
    caption: compactText(program.description || program.callToAction || 'Chamada recorrente da programação semanal.'),
    mode: program.mode === 'story-only' ? 'story' : 'feed + story',
    programId: program.id,
    host: program.host || '',
    imagePath: program.imagePath || '',
    imageUrl: program.imageUrl || '',
    weekdays: program.weekdays || []
  }));
}

function mergeProgramItems(plan = [], programs = [], dateString = todaySaoPaulo()) {
  const programItems = weeklyProgramPlanItems(programs, dateString);
  if (!programItems.length) return plan;
  const byTime = new Map(programItems.map((item) => [item.time, item]));
  const merged = plan.map((item) => {
    if (item.type === 'manual') return item;
    return byTime.get(item.time) || item;
  });
  for (const item of programItems) {
    if (!merged.some((planItem) => planItem.time === item.time)) merged.push(item);
  }
  return merged.sort((a, b) => String(a.time).localeCompare(String(b.time)));
}

const PLAN_TOPICS = {
  juridico: {
    area: 'Advocacia',
    pain: 'lead chega pelo WhatsApp sem contexto, documento ou urgência clara'
  },
  servicos: {
    area: 'Serviços profissionais',
    pain: 'briefing, proposta e follow-up dependem demais da memória de quem vende'
  },
  clinicas: {
    area: 'Clínicas',
    pain: 'paciente chama, pergunta preço, some e volta sem histórico'
  },
  imobiliario: {
    area: 'Imobiliário',
    pain: 'interessado pergunta por imóvel, mas o atendimento demora e perde intenção de compra'
  },
  ecommerce: {
    area: 'E-commerce',
    pain: 'cliente pergunta sobre produto, prazo ou troca e a venda esfria antes do fechamento'
  },
  financeiro: {
    area: 'Financeiro',
    pain: 'conferência manual consome tempo todo mês'
  },
  estetica: {
    area: 'Estética e beleza',
    pain: 'cliente pergunta procedimento, preço e horário, mas a conversa não vira agenda'
  },
  restaurantes: {
    area: 'Restaurantes',
    pain: 'pedido, reserva e dúvida chegam misturados e a equipe perde tempo respondendo repetição'
  },
  comercial: {
    area: 'Comercial',
    pain: 'proposta demora para sair'
  },
  atendimento: {
    area: 'Atendimento',
    pain: 'cliente precisa repetir informação'
  },
  operacao: {
    area: 'Operação',
    pain: 'gargalo pequeno trava entrega importante'
  },
  diretoria: {
    area: 'Diretoria',
    pain: 'reunião discute número em vez de decisão'
  }
};

const DEFAULT_CLIENTE_X_ROTATION = [
  'juridico',
  'servicos',
  'clinicas',
  'imobiliario',
  'ecommerce',
  'financeiro',
  'estetica',
  'restaurantes',
  'comercial',
  'atendimento',
  'operacao',
  'diretoria'
];

const PLAN_CREATIVE_ANGLES = [
  {
    title: (topic) => `O problema escondido em ${topic.area}.`,
    caption: (topic) => `Em ${topic.area}, o prejuízo aparece quando ${topic.pain}. Antes da IA, mapeie entrada, resposta e conferência.`
  },
  {
    title: (topic) => `${topic.area}: 3 pontos para arrumar antes da IA.`,
    caption: (topic) => `Checklist rápido: onde a demanda entra, quem confere a informação e qual resposta pode virar padrão.`
  },
  {
    title: (topic) => `O erro caro que ${topic.area} normaliza.`,
    caption: (topic) => `Tratar rotina repetida como caso isolado custa tempo e contexto. O primeiro passo é transformar repetição em processo.`
  },
  {
    title: (topic) => `Um teste de 30 minutos para ${topic.area}.`,
    caption: (topic) => `Acompanhe uma demanda real do começo ao fim. Se aparecer ${topic.pain}, você achou um bom fluxo para automatizar.`
  },
  {
    title: (topic) => `${topic.area} antes e depois de organizar o fluxo.`,
    caption: (topic) => `Antes cada pessoa resolve do seu jeito. Depois existe registro, padrão e acompanhamento para a IA trabalhar com contexto.`
  },
  {
    title: (topic) => `O bastidor que melhora ${topic.area}.`,
    caption: (topic) => `Cliente vê velocidade, mas o que sustenta isso é bastidor organizado: triagem, registro, resposta e acompanhamento.`
  }
];

function creativePlanAngle(dateString, slotIndex) {
  return PLAN_CREATIVE_ANGLES[
    ((daysSinceEpoch(dateString) * 5) + (slotIndex * 3) + Math.floor(slotIndex / 6)) % PLAN_CREATIVE_ANGLES.length
  ];
}

function editorialDailyPlan(scheduleBrt = [], account = {}, packs = [], scheduledPosts = [], dateString = todaySaoPaulo()) {
  let rotation = Array.isArray(account.contentProfile?.topicRotation)
    ? account.contentProfile.topicRotation.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean)
    : [];
  if (!rotation.length && account.account === 'cliente-x') rotation = DEFAULT_CLIENTE_X_ROTATION;
  if (!rotation.length) return dailyPlan(scheduleBrt, packs, scheduledPosts, dateString);

  const pendingManual = scheduledPosts.filter((post) => {
    if (post.status !== 'pending') return false;
    return brtDateAndTime(post.scheduledFor).date === dateString;
  });
  const profilePackCount = 18;
  const automaticSelectionCount = profilePackCount + packs.length;

  return scheduleBrt.map((time, slotIndex) => {
    const manual = pendingManual.find((post) => brtDateAndTime(post.scheduledFor).time === time);
    if (manual) {
      const manualPack = manual.pack || packs[manual.packIndex] || {};
      return {
        time,
        slotIndex,
        type: 'manual',
        status: 'pending',
        title: manual.title || manualPack.slides?.[0]?.title || `Pack ${manual.packIndex}`,
        caption: compactText(manualPack.caption || ''),
        mode: manual.mode === 'story-only' ? 'story' : 'feed + story',
        postId: manual.id
      };
    }

    const topicId = rotation[pickDailyIndex(rotation, dateString, slotIndex)];
    const topic = PLAN_TOPICS[topicId] || { area: topicId || 'Conteúdo', pain: 'uma rotina importante ainda depende de esforço manual' };
    const packNumber = pickDailyIndex(Array.from({ length: automaticSelectionCount || 1 }), dateString, slotIndex);
    const angle = creativePlanAngle(dateString, slotIndex);
    return {
      time,
      slotIndex,
      type: 'automatic',
      status: 'planned',
      title: angle.title(topic),
      caption: compactText(angle.caption(topic)),
      mode: 'feed + story',
      packIndex: `profile-${packNumber}`
    };
  });
}

function dailyPlan(scheduleBrt = [], packs = [], scheduledPosts = [], dateString = todaySaoPaulo()) {
  const pendingManual = scheduledPosts.filter((post) => {
    if (post.status !== 'pending') return false;
    return brtDateAndTime(post.scheduledFor).date === dateString;
  });

  return scheduleBrt.map((time, slotIndex) => {
    const manual = pendingManual.find((post) => brtDateAndTime(post.scheduledFor).time === time);
    if (manual) {
      const manualPack = manual.pack || packs[manual.packIndex] || {};
      return {
        time,
        slotIndex,
        type: 'manual',
        status: 'pending',
        title: manual.title || manualPack.slides?.[0]?.title || `Pack ${manual.packIndex}`,
        caption: compactText(manualPack.caption || ''),
        mode: manual.mode === 'story-only' ? 'story' : 'feed + story',
        postId: manual.id
      };
    }

    const packIndex = pickDailyIndex(packs, dateString, slotIndex);
    const pack = packIndex >= 0 ? packs[packIndex] : {};
    return {
      time,
      slotIndex,
      type: 'automatic',
      status: 'planned',
      title: pack.slides?.[0]?.title || 'Conteúdo automático pelo perfil da conta',
      caption: compactText(pack.caption || ''),
      mode: 'feed + story',
      packIndex
    };
  });
}

function publisherDailyPlan(accountKey = 'cliente-x', dateString = todaySaoPaulo()) {
  const result = spawnSync(process.execPath, [
    'automation/instagram-template/scripts/publish-carousel.mjs',
    '--account',
    accountKey,
    '--plan-day',
    '--plan-date',
    dateString
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      INSTAGRAM_TEMPLATE_DISABLE_ENGAGEMENT_AI: process.env.INSTAGRAM_TEMPLATE_DISABLE_ENGAGEMENT_AI || ''
    },
    timeout: 20_000
  });
  if (result.status !== 0) {
    const message = result.stderr || result.stdout || `exit ${result.status}`;
    throw new Error(`Nao consegui calcular plano real do publicador: ${message.trim()}`);
  }
  const payload = JSON.parse(result.stdout);
  return Array.isArray(payload.dailyPlan) ? payload.dailyPlan : [];
}

function maskSecret(value = '') {
  const text = String(value || '');
  if (!text) return '';
  if (text.length <= 10) return `${text.slice(0, 2)}...${text.slice(-2)}`;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

function secretStatuses(accounts = readJson(ACCOUNTS_PATH)) {
  const keys = [...new Set([
    ...SECRET_KEYS,
    ...accountSecretKeys(accounts)
  ].filter(Boolean))];

  return keys.map((key) => {
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

function userError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function vercelApiPath(path) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (VERCEL_TEAM_ID) url.searchParams.set('teamId', VERCEL_TEAM_ID);
  return url;
}

async function vercelFetch(path, options = {}, token = vercelTokenFromEnv()) {
  if (!token) throw userError('Configure VERCEL_TOKEN para salvar variaveis pelo painel.');
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
    throw userError(payload.error?.message || payload.message || `Vercel HTTP ${response.status}`, response.status);
  }
  return payload;
}

async function validateAccessValue(key, value, companion = {}) {
  const text = String(value || '').trim();
  if (!isEditableSecretKey(key)) throw userError('Variavel nao permitida.');
  if (!text) throw userError('Cole um valor antes de validar.');

  if (key === 'ADMIN_EMAIL') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw userError('Email invalido.');
    return { ok: true, message: 'Email admin valido.' };
  }

  if (key === 'ADMIN_PASSWORD') {
    if (text.length < 8) throw userError('Senha precisa ter pelo menos 8 caracteres.');
    return { ok: true, message: 'Senha admin com tamanho valido.' };
  }

  if (key === 'ADMIN_SESSION_SECRET') {
    if (text.length < 32) throw userError('ADMIN_SESSION_SECRET precisa ter pelo menos 32 caracteres.');
    return { ok: true, message: 'Chave de sessao com tamanho valido.' };
  }

  if (key === 'THREADS_APP_ID') {
    if (!/^\d{6,30}$/.test(text)) throw userError('THREADS_APP_ID deve ser o ID numerico do aplicativo Meta.');
    return { ok: true, message: 'Formato do App ID do Threads valido.' };
  }

  if (key === 'THREADS_APP_SECRET') {
    if (text.length < 16) throw userError('THREADS_APP_SECRET parece incompleto.');
    return { ok: true, message: 'Formato do App Secret do Threads valido.' };
  }

  if (key.endsWith('_THREADS_ACCESS_TOKEN') || key.endsWith('_THREADS_USER_ID')) {
    const prefix = key.replace(/_THREADS_(?:ACCESS_TOKEN|USER_ID)$/, '');
    const token = key.endsWith('_THREADS_ACCESS_TOKEN') ? text : String(companion.threadsAccessToken || process.env[`${prefix}_THREADS_ACCESS_TOKEN`] || '').trim();
    const userId = key.endsWith('_THREADS_USER_ID') ? text : String(companion.threadsUserId || process.env[`${prefix}_THREADS_USER_ID`] || 'me').trim();
    if (!token) return { ok: true, message: `${key} preenchido. Conecte a conta para validar o token.` };
    const response = await fetch(`https://graph.threads.net/v1.0/${encodeURIComponent(userId || 'me')}?fields=id,username&access_token=${encodeURIComponent(token)}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.error) throw userError(payload.error?.message || `Threads recusou os dados: HTTP ${response.status}.`, response.status);
    return { ok: true, message: `Threads validado: @${payload.username || payload.id}.` };
  }

  if (key === 'GITHUB_TOKEN') {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/instagram-feed-cliente-x.yml`, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${text}`,
        'x-github-api-version': '2022-11-28'
      }
    });
    if (!response.ok) throw userError(`GitHub recusou o token: HTTP ${response.status}.`, response.status);
    const workflow = await response.json();
    return { ok: true, message: `GitHub validado: workflow ${workflow.name || 'instagram-feed-cliente-x.yml'} acessivel.` };
  }

  if (key === 'STRIPE_SECRET_KEY') {
    if (!/^sk_(?:test|live)_/.test(text)) throw userError('A chave secreta Stripe deve iniciar com sk_test_ ou sk_live_.');
    try {
      await new Stripe(text).balance.retrieve();
    } catch (error) {
      throw userError(`Stripe recusou a chave secreta: ${error?.message || 'credencial invalida'}`, 400);
    }
    return { ok: true, message: `Stripe validada em modo ${text.startsWith('sk_live_') ? 'real' : 'teste'}.` };
  }

  if (key === 'STRIPE_WEBHOOK_SECRET') {
    if (!/^whsec_[A-Za-z0-9]+$/.test(text) || text.length < 20) throw userError('Webhook secret invalido. Use o valor whsec_ exibido pela Stripe.');
    return { ok: true, message: 'Formato do webhook secret valido. A assinatura final sera conferida no primeiro evento.' };
  }

  if (key.startsWith('STRIPE_PRICE_')) {
    if (!/^price_[A-Za-z0-9]+$/.test(text)) throw userError('ID de preco invalido. Use um identificador price_ da Stripe.');
    const secretKey = String(companion.stripeSecretKey || process.env.STRIPE_SECRET_KEY || '').trim();
    if (!secretKey) return { ok: true, message: 'Formato do Price ID valido. Salve a chave secreta para validar o preco na Stripe.' };
    try {
      const price = await new Stripe(secretKey).prices.retrieve(text);
      if (!price.active) throw userError('Esse preco esta inativo na Stripe.');
      if (price.type !== 'recurring') throw userError('Esse preco nao e recorrente. Crie um preco mensal ou anual.');
      return { ok: true, message: `Preco recorrente validado: ${price.nickname || price.id} · ${price.currency.toUpperCase()}.` };
    } catch (error) {
      if (error?.statusCode) throw error;
      throw userError(`Stripe recusou o Price ID: ${error?.message || 'preco invalido'}`, 400);
    }
  }

  const envRole = accountEnvRole(key);

  if (envRole.role === 'instagram-token' || envRole.role === 'instagram-user-id') {
    const token = envRole.role === 'instagram-token'
      ? text
      : String(companion.accessToken || (envRole.account ? process.env[envRole.account.accessTokenEnv] : '') || '').trim();
    const userId = envRole.role === 'instagram-user-id'
      ? text
      : String(companion.userId || (envRole.account ? process.env[envRole.account.userIdEnv] : '') || '').trim();
    if (!token || !userId) {
      return { ok: true, message: `${key} preenchido. Validação completa da Meta precisa de token e user ID configurados.` };
    }
    const response = await fetch(`https://graph.facebook.com/v22.0/${encodeURIComponent(userId)}?fields=username&access_token=${encodeURIComponent(token)}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.error) {
      throw userError(payload.error?.message || `Meta recusou os dados: HTTP ${response.status}.`, response.status);
    }
    return { ok: true, message: `Meta/Instagram validado: ${payload.username || userId}.` };
  }

  if (envRole.role === 'imgbb-key') {
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
      throw userError(payload.error?.message || `ImgBB recusou a chave: HTTP ${response.status}.`, response.status);
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
  if (!isEditableSecretKey(key)) throw userError('Variavel nao permitida.');
  const text = String(value || '').trim();
  if (!text) throw userError('Cole um valor antes de salvar.');
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

function parseAdminUsersJson() {
  try {
    const users = JSON.parse(process.env.ADMIN_USERS_JSON || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function publicPanelUsers(users = []) {
  return users.map((user) => ({
    email: user.email,
    role: user.role || 'user',
    accounts: Array.isArray(user.accounts) ? user.accounts : [],
    disabled: Boolean(user.disabled)
  }));
}

async function createPanelUser(body = {}, availableAccounts = []) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const accounts = Array.isArray(body.accounts)
    ? body.accounts.map((item) => normalizeAccountKey(item))
    : [];
  const availableKeys = new Set(availableAccounts.map((account) => account.account));

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw userError('Email do usuario invalido.');
  if (password.length < 8) throw userError('Senha do usuario precisa ter pelo menos 8 caracteres.');
  if (accounts.some((account) => !availableKeys.has(account))) throw userError('Uma das contas selecionadas nao existe.');
  if (email === String(process.env.ADMIN_EMAIL || '').toLowerCase()) throw userError('Esse email ja e o admin principal.');

  const users = parseAdminUsersJson().filter((user) => String(user.email || '').toLowerCase() !== email);
  users.push({
    email,
    password,
    role: 'user',
    accounts,
    disabled: false
  });

  const saved = await saveVercelEnv('ADMIN_USERS_JSON', JSON.stringify(users));
  return {
    ok: true,
    users: publicPanelUsers(users),
    message: accounts.length
      ? `${email} salvo em ADMIN_USERS_JSON. Faça redeploy para esse login entrar em vigor.`
      : `${email} salvo sem conta vinculada. Faça redeploy; ele poderá entrar e criar a empresa dele do zero.`,
    saved
  };
}

async function updatePanelUser(body = {}, availableAccounts = []) {
  const email = String(body.email || '').trim().toLowerCase();
  const action = String(body.userAction || 'update').trim().toLowerCase();
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const users = parseAdminUsersJson();
  const index = users.findIndex((user) => String(user.email || '').trim().toLowerCase() === email);

  if (!email) throw userError('Informe o usuário para alterar.');
  if (email === adminEmail) throw userError('O admin principal não pode ser alterado por aqui.');
  if (index === -1) throw userError('Usuário não encontrado.', 404);

  if (action === 'delete') {
    users.splice(index, 1);
    const saved = await saveVercelEnv('ADMIN_USERS_JSON', JSON.stringify(users));
    return {
      ok: true,
      users: publicPanelUsers(users),
      message: `${email} excluído. Faça Redeploy Vercel para bloquear esse login em produção.`,
      saved
    };
  }

  if (action === 'freeze' || action === 'activate') {
    users[index].disabled = action === 'freeze';
    const saved = await saveVercelEnv('ADMIN_USERS_JSON', JSON.stringify(users));
    return {
      ok: true,
      users: publicPanelUsers(users),
      message: action === 'freeze'
        ? `${email} congelado. Faça Redeploy Vercel para bloquear esse login em produção.`
        : `${email} ativado. Faça Redeploy Vercel para liberar esse login em produção.`,
      saved
    };
  }

  if (action !== 'update') throw userError('Ação de usuário inválida.');

  const newEmail = String(body.newEmail || email).trim().toLowerCase();
  const password = String(body.password || '');
  const accounts = Array.isArray(body.accounts)
    ? body.accounts.map((item) => normalizeAccountKey(item))
    : [];
  const availableKeys = new Set(availableAccounts.map((account) => account.account));

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) throw userError('Email do usuário inválido.');
  if (newEmail === adminEmail) throw userError('Esse email já é o admin principal.');
  if (password && password.length < 8) throw userError('Senha do usuário precisa ter pelo menos 8 caracteres.');
  if (accounts.some((account) => !availableKeys.has(account))) throw userError('Uma das contas selecionadas não existe.');
  if (users.some((user, userIndex) => userIndex !== index && String(user.email || '').trim().toLowerCase() === newEmail)) {
    throw userError('Já existe outro usuário com esse email.');
  }

  users[index] = {
    ...users[index],
    email: newEmail,
    role: 'user',
    accounts,
    disabled: Boolean(body.disabled)
  };
  if (password) users[index].password = password;

  const saved = await saveVercelEnv('ADMIN_USERS_JSON', JSON.stringify(users));
  return {
    ok: true,
    users: publicPanelUsers(users),
    message: `${newEmail} atualizado. Faça Redeploy Vercel para aplicar no login em produção.`,
    saved
  };
}

async function redeployVercelProduction() {
  const deployments = await vercelFetch('/v6/deployments?limit=1&target=production');
  const latest = deployments.deployments?.find((deployment) => deployment.target === 'production') ||
    deployments.deployments?.[0];
  if (!latest?.uid) throw userError('Nao encontrei deployment de producao para redeploy.');

  const deployment = await vercelFetch('/v13/deployments', {
    method: 'POST',
    body: JSON.stringify({
      name: VERCEL_PROJECT_NAME,
      target: 'production',
      deploymentId: latest.uid
    })
  });

  return {
    ok: true,
    deploymentId: deployment.id || deployment.uid,
    url: deployment.url ? `https://${deployment.url}` : null,
    inspectorUrl: deployment.inspectorUrl || null,
    readyState: deployment.readyState || deployment.status || 'QUEUED',
    message: 'Redeploy iniciado na Vercel. Aguarde alguns minutos e atualize o painel.'
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 6_000_000) {
        req.destroy();
        reject(userError('Arquivo muito grande. Use PDF/TXT de ate 4 MB.', 413));
      }
    });
    req.on('end', () => {
      try {
        resolve({ raw, body: raw ? JSON.parse(raw) : {} });
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) throw userError('Configure STRIPE_SECRET_KEY na Vercel.', 503);
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function stripePriceForPlan(plan = 'starter') {
  const key = {
    starter: 'STRIPE_PRICE_STARTER',
    professional: 'STRIPE_PRICE_PROFESSIONAL',
    agency: 'STRIPE_PRICE_AGENCY'
  }[plan] || 'STRIPE_PRICE_STARTER';
  const price = process.env[key];
  if (!price) throw userError(`Configure ${key} na Vercel antes de gerar a cobrança.`, 503);
  return price;
}

function requestOrigin(req) {
  const configured = process.env.PUBLIC_APP_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  const protocol = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'cliente-x-instagram.vercel.app').split(',')[0].trim();
  return `${protocol}://${host}`;
}

async function createStripeCheckout(body, session, req) {
  if (!isOwner(session)) throw userError('Somente o administrador principal pode gerar cobrancas.', 403);
  const accountKey = normalizeAccountKey(body.account);
  const accountsFile = await readGithubConfig(ACCOUNTS_FILE_PATH);
  const account = accountsFile.data.find((item) => item.account === accountKey);
  if (!account) throw userError(`Conta ${accountKey} nao encontrada.`, 404);
  const client = account.clientProfile || {};
  if (!client.email) throw userError('Cadastre o email do cliente antes de gerar a cobranca.');
  const plan = ['starter', 'professional', 'agency'].includes(body.plan) ? body.plan : (client.plan || 'starter');
  const origin = requestOrigin(req);
  const sessionCheckout = await stripeClient().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: stripePriceForPlan(plan), quantity: 1 }],
    customer: client.stripeCustomerId || undefined,
    customer_email: client.stripeCustomerId ? undefined : client.email,
    client_reference_id: accountKey,
    metadata: { account: accountKey, plan },
    subscription_data: { metadata: { account: accountKey, plan } },
    success_url: `${origin}/?billing=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?billing=cancelled`
  });
  return { ok: true, checkoutUrl: sessionCheckout.url, checkoutSessionId: sessionCheckout.id, account: accountKey, plan };
}

function stripeEventIdentity(event) {
  const object = event.data?.object || {};
  const customerId = typeof object.customer === 'string' ? object.customer : object.customer?.id;
  const metadata = object.metadata || object.subscription_details?.metadata || object.parent?.subscription_details?.metadata || {};
  return {
    object,
    customerId,
    accountKey: metadata.account || object.client_reference_id || '',
    subscriptionId: typeof object.subscription === 'string' ? object.subscription : object.id?.startsWith?.('sub_') ? object.id : null
  };
}

function billingStatusForEvent(event) {
  const object = event.data?.object || {};
  if (event.type === 'checkout.session.completed') return object.payment_status === 'paid' || object.payment_status === 'no_payment_required' ? 'active' : 'incomplete';
  if (event.type === 'invoice.paid') return 'active';
  if (event.type === 'invoice.payment_failed') return 'past_due';
  if (event.type.startsWith('customer.subscription.')) return object.status || (event.type.endsWith('.deleted') ? 'canceled' : 'incomplete');
  return null;
}

async function processStripeWebhook(event) {
  const billingStatus = billingStatusForEvent(event);
  if (!billingStatus) return { ignored: true };
  const identity = stripeEventIdentity(event);
  const accountsFile = await readGithubConfig(ACCOUNTS_FILE_PATH);
  const index = accountsFile.data.findIndex((item) => item.account === identity.accountKey
    || item.clientProfile?.stripeCustomerId === identity.customerId
    || item.clientProfile?.stripeSubscriptionId === identity.subscriptionId);
  if (index === -1) return { ignored: true, reason: 'account-not-found' };

  const account = accountsFile.data[index];
  const client = account.clientProfile || {};
  const billing = client.billing || {};
  const processedEvents = Array.isArray(billing.processedEvents) ? billing.processedEvents : [];
  if (processedEvents.includes(event.id)) return { duplicate: true, account: account.account };
  if (Number(billing.updatedAtEpoch || 0) > Number(event.created || 0)) return { stale: true, account: account.account };

  const enabled = ['active', 'trialing'].includes(billingStatus);
  account.clientProfile = {
    ...client,
    status: enabled ? 'active' : 'paused',
    stripeCustomerId: identity.customerId || client.stripeCustomerId || null,
    stripeSubscriptionId: identity.subscriptionId || client.stripeSubscriptionId || null,
    billing: {
      ...billing,
      status: billingStatus,
      lastEventType: event.type,
      lastEventId: event.id,
      updatedAt: new Date(Number(event.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
      updatedAtEpoch: Number(event.created || Math.floor(Date.now() / 1000)),
      processedEvents: [...processedEvents, event.id].slice(-20)
    }
  };
  await writeGithubConfig(ACCOUNTS_FILE_PATH, accountsFile.data, accountsFile.sha, `Sync Stripe billing ${account.account}`);
  return { ok: true, account: account.account, billingStatus, clientStatus: account.clientProfile.status };
}

async function handleStripeWebhook(raw, signature) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) throw userError('Configure STRIPE_WEBHOOK_SECRET na Vercel.', 503);
  let event;
  try {
    event = stripeClient().webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw userError('Assinatura do webhook Stripe invalida.', 400);
  }
  return processStripeWebhook(event);
}

function githubToken() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  if (!token) throw userError('GITHUB_TOKEN ausente na Vercel.');
  return token;
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
  if (!response.ok) throw userError(`GitHub HTTP ${response.status}: ${payload.message || text}`, response.status);
  return payload;
}

async function readGithubConfig(filePath) {
  const file = await githubJson(`contents/${filePath}?ref=main`);
  return {
    sha: file.sha,
    data: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8').replace(/^\uFEFF/, ''))
  };
}

async function writeGithubConfig(filePath, data, sha, message) {
  await githubJson(`contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      branch: 'main',
      sha,
      content: Buffer.from(`${JSON.stringify(data, null, 2)}\n`, 'utf8').toString('base64')
    })
  });
}

async function writeGithubFile(filePath, base64Content, message) {
  let sha = null;
  try {
    const existing = await githubJson(`contents/${filePath}?ref=main`);
    sha = existing.sha;
  } catch (error) {
    if (error.statusCode !== 404) throw error;
  }
  await githubJson(`contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      branch: 'main',
      ...(sha ? { sha } : {}),
      content: base64Content
    })
  });
}

async function forceInstagramWatchdog(session) {
  if (!isOwner(session)) throw userError('Apenas o admin principal pode forcar o vigia.', 403);
  const now = new Date().toISOString();
  const content = [
    `force=${now}`,
    'reason=dashboard-watchdog-force',
    'target=instagram-feed-cliente-x'
  ].join('\n');
  await writeGithubFile(
    FORCE_WATCHDOG_FILE_PATH,
    Buffer.from(`${content}\n`, 'utf8').toString('base64'),
    `Force Instagram watchdog ${now}`
  );
  return {
    ok: true,
    message: 'Vigia acionado. O GitHub Actions deve iniciar em alguns instantes.',
    forcedAt: now
  };
}

function envPrefixFromAccount(accountKey) {
  return accountKey.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'CLIENTE';
}

function buildInitialPacksForProfile(profile = {}, brandName = '') {
  const niche = profile.niche || 'empresas';
  const audience = profile.audience || 'donos e gestores';
  const offer = profile.offer || 'automação com IA';
  const tone = profile.tone || 'consultivo';
  return [
    {
      slides: [
        {
          eyebrow: 'Diagnóstico',
          title: `${brandName || niche}: onde a IA pode gerar resultado?`,
          body: `Antes de escolher ferramenta, entenda a rotina que mais pesa para ${audience}.`
        },
        {
          eyebrow: 'Nicho',
          title: `O contexto muda tudo em ${niche}.`,
          body: `A comunicação precisa falar da dor real, da decisão e do risco que esse público já sente.`
        },
        {
          eyebrow: 'Oferta',
          title: `${offer} precisa parecer prático.`,
          body: 'Mostre aplicação, consequência e próximo passo. Conteúdo bonito sem clareza não gera conversa.'
        },
        {
          eyebrow: 'Linha editorial',
          title: `Tom ${tone}, com prova e direção.`,
          body: 'Cada post deve ensinar algo útil e abrir uma porta para atendimento, diagnóstico ou reunião.'
        },
        {
          eyebrow: 'Próximo passo',
          title: 'A automação começa pelo posicionamento.',
          body: 'Com nicho, público e oferta definidos, a IA cria posts mais específicos e menos genéricos.'
        }
      ],
      caption: `${brandName || niche} com IA não começa pela ferramenta.\n\nComeça entendendo o nicho, o público e a oferta.\n\nPara ${audience}, o conteúdo precisa mostrar um problema real, uma aplicação clara e um próximo passo simples.\n\nAqui a linha editorial será ${tone}: útil, direta e conectada a ${offer}.\n\n#inteligenciaartificial #automacao #marketingdigital #gestao #negocios`
    }
  ];
}

function normalizeBrandSummary(value = {}) {
  return {
    description: String(value.description || '').trim(),
    positioning: String(value.positioning || '').trim(),
    differentiator: String(value.differentiator || '').trim()
  };
}

function normalizeColor(value, fallback) {
  const color = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : fallback;
}

function normalizeBrandPalette(value = {}) {
  return {
    primary: normalizeColor(value.primary, '#17211c'),
    secondary: normalizeColor(value.secondary, '#0e7c5a'),
    background: normalizeColor(value.background, '#f4f7f5')
  };
}

function safeUploadName(name = 'documento') {
  return String(name || 'documento')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9._-]/gi, '-')
    .slice(0, 80) || 'documento';
}

function decodeBrandDocument(body = {}) {
  const mimeType = String(body.mimeType || '').toLowerCase();
  const match = String(body.dataUrl || '').match(/^data:(application\/pdf|text\/plain);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw userError('Envie um arquivo PDF ou TXT valido.');
  if (mimeType && mimeType !== match[1]) throw userError('Tipo do arquivo nao confere com o conteudo enviado.');
  const size = Number(body.size || 0);
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 4_000_000 || size > 4_000_000) {
    throw userError('Arquivo muito grande. Use PDF/TXT de ate 4 MB.', 413);
  }
  const ext = match[1] === 'application/pdf' ? '.pdf' : '.txt';
  const name = `${safeUploadName(body.name)}${ext}`;
  return {
    name,
    mimeType: match[1],
    size: bytes.length,
    base64: match[2],
    bytes
  };
}

async function addAccountToPanelUser(email, accountKey) {
  if (!email || isOwner({ email, role: email === process.env.ADMIN_EMAIL ? 'owner' : 'user' })) return null;
  const users = parseAdminUsersJson();
  const user = users.find((item) => String(item.email || '').toLowerCase() === String(email).toLowerCase());
  if (!user) return null;
  user.accounts = [...new Set([...(Array.isArray(user.accounts) ? user.accounts : []), accountKey])];
  await saveVercelEnv('ADMIN_USERS_JSON', JSON.stringify(users));
  return users.map((item) => ({ email: item.email, role: item.role || 'user', accounts: item.accounts || [] }));
}

async function createAccountConfig(body = {}, session = null) {
  const accountKey = normalizeAccountKey(body.account);
  const expectedUsername = String(body.expectedUsername || '').replace(/^@/, '').trim();
  const brandName = String(body.brandName || accountKey).trim();
  const footerText = String(body.footerText || 'IA aplicada a empresas').trim();
  const contentProfile = {
    niche: String(body.niche || '').trim(),
    audience: String(body.audience || '').trim(),
    offer: String(body.offer || '').trim(),
    tone: String(body.tone || 'consultivo').trim() || 'consultivo',
    goal: String(body.goal || 'authority').trim() || 'authority'
  };
  const brandSummary = normalizeBrandSummary(body.brandSummary || {});
  const brandPalette = {
    ...normalizeBrandPalette(body.brandPalette || {}),
    enabled: Boolean(body.brandPaletteEnabled)
  };
  const sourceAccount = normalizeAccountKey(body.sourceAccount || 'cliente-x');
  if (!expectedUsername) throw userError('Informe o @ do Instagram sem espaco.');
  if (!contentProfile.niche || !contentProfile.audience || !contentProfile.offer) {
    throw userError('Informe nicho, publico ideal e oferta principal para criar a conta.');
  }

  const envPrefix = envPrefixFromAccount(accountKey);
  const [accountsFile, contentFile, queueFile] = await Promise.all([
    readGithubConfig(ACCOUNTS_FILE_PATH),
    readGithubConfig(CONTENT_FILE_PATH),
    readGithubConfig(SCHEDULED_FILE_PATH)
  ]);

  if (accountsFile.data.some((item) => item.account === accountKey)) {
    throw userError(`Conta ${accountKey} ja existe.`);
  }

  const source = accountsFile.data.find((item) => item.account === sourceAccount) || accountsFile.data[0] || {};

  const newAccount = {
    account: accountKey,
    expectedUsername,
    brandName,
    footerText,
    accessTokenEnv: `${envPrefix}_INSTAGRAM_ACCESS_TOKEN`,
    userIdEnv: `${envPrefix}_INSTAGRAM_USER_ID`,
    imgbbKeyEnv: `${envPrefix}_IMGBB_API_KEY`,
    contentProfile: { ...contentProfile, visualDirection: 'anatex-editorial' },
    brandSummary,
    brandPalette: { ...brandPalette, enabled: true },
    clientProfile: {
      contactName: String(body.contactName || '').trim(),
      email: String(body.clientEmail || '').trim().toLowerCase(),
      whatsapp: String(body.whatsapp || '').trim(),
      businessType: String(body.businessType || contentProfile.niche).trim(),
      plan: ['starter', 'professional', 'agency'].includes(body.plan) ? body.plan : 'starter',
      status: 'onboarding',
      approvalMode: body.approvalMode === 'approval' ? 'approval' : 'automatic',
      monthlyPrice: Math.max(0, Number(body.monthlyPrice) || 0),
      startedAt: new Date().toISOString()
    },
    scheduleUtc: Array.isArray(source.scheduleUtc) ? source.scheduleUtc : [],
    ...(session && !isOwner(session) ? { ownerEmail: session.email } : {})
  };

  accountsFile.data.push(newAccount);
  contentFile.data.push({
    account: accountKey,
    packs: buildInitialPacksForProfile(contentProfile, brandName || accountKey)
  });
  if (!queueFile.data.some((item) => item.account === accountKey)) {
    queueFile.data.push({ account: accountKey, posts: [] });
  }

  await writeGithubConfig(ACCOUNTS_FILE_PATH, accountsFile.data, accountsFile.sha, `Add Instagram account ${accountKey}`);
  await writeGithubConfig(CONTENT_FILE_PATH, contentFile.data, contentFile.sha, `Add content packs for ${accountKey}`);
  await writeGithubConfig(SCHEDULED_FILE_PATH, queueFile.data, queueFile.sha, `Add scheduled queue for ${accountKey}`);
  const users = session && !isOwner(session)
    ? await addAccountToPanelUser(session.email, accountKey)
    : null;

  return {
    ok: true,
    account: newAccount,
    users,
    message: `Conta ${accountKey} criada no GitHub. Configure os envs ${newAccount.accessTokenEnv}, ${newAccount.userIdEnv} e ${newAccount.imgbbKeyEnv} no painel.`
  };
}

async function updateAccountProfile(body = {}, session = null) {
  const accountKey = normalizeAccountKey(body.account);
  const accountsFile = await readGithubConfig(ACCOUNTS_FILE_PATH);
  const index = accountsFile.data.findIndex((item) => item.account === accountKey);
  if (index === -1) throw userError(`Conta ${accountKey} nao encontrada.`, 404);
  if (!canAccessAccount(session, accountsFile.data[index])) {
    throw userError('Seu usuario nao pode alterar esta conta.', 403);
  }

  const contentProfile = {
    niche: String(body.niche || '').trim(),
    audience: String(body.audience || '').trim(),
    offer: String(body.offer || '').trim(),
    tone: String(body.tone || 'consultivo').trim() || 'consultivo',
    goal: String(body.goal || accountsFile.data[index].contentProfile?.goal || 'authority').trim() || 'authority'
  };
  const brandSummary = normalizeBrandSummary(body.brandSummary || accountsFile.data[index].brandSummary || {});
  const brandPalette = {
    ...normalizeBrandPalette(body.brandPalette || accountsFile.data[index].brandPalette || {}),
    enabled: Boolean(body.brandPaletteEnabled)
  };
  const avatarUrls = Array.isArray(body.avatarUrls)
    ? body.avatarUrls.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 24)
    : Array.isArray(accountsFile.data[index].avatarRotation?.urls)
      ? accountsFile.data[index].avatarRotation.urls
      : [];
  const avatarRotation = {
    enabled: Boolean(body.avatarRotationEnabled),
    urls: avatarUrls
  };
  if (!contentProfile.niche || !contentProfile.audience || !contentProfile.offer) {
    throw userError('Informe nicho, publico ideal e oferta principal para atualizar a conta.');
  }

  accountsFile.data[index] = {
    ...accountsFile.data[index],
    expectedUsername: String(body.expectedUsername || accountsFile.data[index].expectedUsername || '').replace(/^@/, '').trim(),
    brandName: String(body.brandName || accountsFile.data[index].brandName || accountKey).trim(),
    footerText: String(body.footerText || accountsFile.data[index].footerText || 'IA aplicada a empresas').trim(),
    contentProfile,
    brandSummary,
    brandPalette,
    avatarRotation
  };

  await writeGithubConfig(ACCOUNTS_FILE_PATH, accountsFile.data, accountsFile.sha, `Update profile for ${accountKey}`);
  return {
    ok: true,
    account: accountsFile.data[index],
    message: `Perfil editorial de ${accountKey} atualizado. As próximas postagens automáticas usarão esse direcionamento.`
  };
}

async function updateClientStatus(body = {}, session = null) {
  if (!isOwner(session)) throw userError('Somente o administrador principal pode alterar contratos.', 403);
  const accountKey = normalizeAccountKey(body.account);
  const status = ['onboarding', 'active', 'paused'].includes(body.status) ? body.status : 'onboarding';
  const accountsFile = await readGithubConfig(ACCOUNTS_FILE_PATH);
  const index = accountsFile.data.findIndex((item) => item.account === accountKey);
  if (index === -1) throw userError(`Conta ${accountKey} nao encontrada.`, 404);
  accountsFile.data[index].clientProfile = {
    ...(accountsFile.data[index].clientProfile || {}),
    status,
    updatedAt: new Date().toISOString()
  };
  await writeGithubConfig(ACCOUNTS_FILE_PATH, accountsFile.data, accountsFile.sha, `Update client status ${accountKey}`);
  return { ok: true, account: accountsFile.data[index], message: `Cliente ${accountKey}: ${status}.` };
}

async function uploadBrandDocument(body = {}, session = null) {
  const accountKey = normalizeAccountKey(body.account);
  const accountsFile = await readGithubConfig(ACCOUNTS_FILE_PATH);
  const index = accountsFile.data.findIndex((item) => item.account === accountKey);
  if (index === -1) throw userError(`Conta ${accountKey} nao encontrada.`, 404);
  if (!canAccessAccount(session, accountsFile.data[index])) {
    throw userError('Seu usuario nao pode alterar esta conta.', 403);
  }

  const document = decodeBrandDocument(body);
  const documentAnalysis = await analyzeBrandDocument(document.bytes, document.mimeType);
  const uploadedAt = new Date().toISOString();
  const stamp = uploadedAt.replace(/[:.]/g, '-');
  const path = `docs/uploads/brand-documents/${accountKey}/${stamp}-${document.name}`;
  await writeGithubFile(path, document.base64, `Upload brand document for ${accountKey}`);

  accountsFile.data[index] = {
    ...accountsFile.data[index],
    brandDocument: {
      name: document.name,
      mimeType: document.mimeType,
      size: document.size,
      path: `/${path}`,
      uploadedAt,
      textPreview: documentAnalysis.textPreview,
      analysis: documentAnalysis.analysis
    }
  };

  await writeGithubConfig(ACCOUNTS_FILE_PATH, accountsFile.data, accountsFile.sha, `Attach brand document for ${accountKey}`);
  return {
    ok: true,
    account: accountsFile.data[index],
    message: `Documento ${document.name} anexado e analisado no perfil da marca.`
  };
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

async function readWeeklyProgramGroups() {
  return readConfigGroups(WEEKLY_PROGRAMS_FILE_PATH, WEEKLY_PROGRAMS_PATH);
}

function normalizeWeeklyProgram(program = {}) {
  const id = String(program.id || `program-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).trim();
  const name = String(program.name || '').trim();
  const title = String(program.title || name).trim();
  const time = String(program.time || '').trim();
  const weekdays = Array.from(new Set((program.weekdays || []).map(Number)))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);
  if (!name) throw userError('Informe o nome do programa.');
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) throw userError(`Horario invalido em ${name}. Use HH:MM.`);
  if (!weekdays.length) throw userError(`Escolha pelo menos um dia da semana para ${name}.`);
  return {
    id,
    status: program.status === 'paused' ? 'paused' : 'active',
    name,
    title,
    host: String(program.host || '').trim(),
    weekdays,
    time,
    mode: program.mode === 'story-only' ? 'story-only' : 'feed-and-story',
    description: String(program.description || '').trim(),
    callToAction: String(program.callToAction || '').trim(),
    imagePath: String(program.imagePath || '').trim(),
    imageUrl: String(program.imageUrl || '').trim(),
    lastPublishedDate: String(program.lastPublishedDate || '').trim(),
    lastPublishedAt: String(program.lastPublishedAt || '').trim(),
    updatedAt: new Date().toISOString()
  };
}

async function updateWeeklyPrograms(body = {}, session = null) {
  const accountKey = normalizeAccountKey(body.account);
  const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
  const account = accounts.find((item) => item.account === accountKey);
  if (!account) throw userError(`Conta ${accountKey} nao encontrada.`, 404);
  if (!canAccessAccount(session, account)) {
    throw userError('Seu usuario nao pode alterar esta conta.', 403);
  }

  const weeklyFile = await readGithubConfig(WEEKLY_PROGRAMS_FILE_PATH);
  let group = weeklyFile.data.find((item) => item.account === accountKey);
  if (!group) {
    group = { account: accountKey, programs: [] };
    weeklyFile.data.push(group);
  }
  group.programs = (Array.isArray(body.programs) ? body.programs : []).map(normalizeWeeklyProgram);
  await writeGithubConfig(WEEKLY_PROGRAMS_FILE_PATH, weeklyFile.data, weeklyFile.sha, `Update weekly programs for ${accountKey}`);
  return {
    ok: true,
    weeklyPrograms: group.programs,
    message: 'Grade semanal salva no GitHub.'
  };
}

async function readDirectAutomationGroups() {
  return readConfigGroups(DIRECT_AUTOMATIONS_FILE_PATH, DIRECT_AUTOMATIONS_PATH);
}

function normalizeDirectAutomation(value = {}) {
  const keyword = String(value.keyword || '').trim().replace(/^#/, '').slice(0, 40);
  const materialUrl = String(value.materialUrl || '').trim().slice(0, 2000);
  const message = String(value.message || '').trim().slice(0, 1000);
  if (!keyword) throw userError('Informe a palavra-chave que a pessoa deve comentar.');
  if (!materialUrl) throw userError('Anexe um material ou informe o link para envio.');
  if (!message) throw userError('Escreva a mensagem que sera enviada no Direct.');
  return {
    enabled: Boolean(value.enabled), keyword,
    matchMode: value.matchMode === 'exact' ? 'exact' : 'contains',
    mediaId: String(value.mediaId || '').trim().slice(0, 100),
    materialUrl, materialName: String(value.materialName || '').trim().slice(0, 160), message,
    publicReply: String(value.publicReply || 'Enviei o material no seu Direct.').trim().slice(0, 300),
    updatedAt: new Date().toISOString()
  };
}

async function updateDirectAutomation(body = {}, session = null) {
  const accountKey = normalizeAccountKey(body.account);
  const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
  const account = accounts.find((item) => item.account === accountKey);
  if (!account) throw userError(`Conta ${accountKey} nao encontrada.`, 404);
  if (!canAccessAccount(session, account)) throw userError('Seu usuario nao pode alterar esta conta.', 403);
  const file = await readGithubConfig(DIRECT_AUTOMATIONS_FILE_PATH);
  let group = file.data.find((item) => item.account === accountKey);
  if (!group) { group = { account: accountKey, automation: null, deliveries: [] }; file.data.push(group); }
  group.automation = normalizeDirectAutomation(body.automation || {});
  group.deliveries = Array.isArray(group.deliveries) ? group.deliveries.slice(-50) : [];
  await writeGithubConfig(DIRECT_AUTOMATIONS_FILE_PATH, file.data, file.sha, `Update Direct automation for ${accountKey}`);
  return { ok: true, directAutomation: group, message: 'Automacao de Direct salva no painel.' };
}

async function uploadDirectMaterial(body = {}, session = null) {
  const accountKey = normalizeAccountKey(body.account);
  const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
  const account = accounts.find((item) => item.account === accountKey);
  if (!account || !canAccessAccount(session, account)) throw userError('Seu usuario nao pode enviar material para esta conta.', 403);
  const match = String(body.dataUrl || '').match(/^data:(application\/pdf|text\/plain|image\/png|image\/jpeg|image\/webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw userError('Envie PDF, TXT, PNG, JPG ou WEBP.');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 8_000_000) throw userError('Material muito grande. Use arquivo de ate 8 MB.', 413);
  const extensions = { 'application/pdf': '.pdf', 'text/plain': '.txt', 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };
  const name = `${Date.now()}-${safeUploadName(body.name || 'material')}${extensions[match[1]]}`;
  const filePath = `docs/uploads/direct-materials/${accountKey}/${name}`;
  await writeGithubFile(filePath, match[2], `Upload Direct material for ${accountKey}`);
  return { ok: true, name: String(body.name || name), url: `/${filePath}`, message: 'Material anexado ao painel.' };
}

function secureEqualText(left = '', right = '') {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function verifyInstagramWebhookSignature(raw, signature = '') {
  const secret = String(process.env.INSTAGRAM_APP_SECRET || '').trim();
  if (!secret) return true;
  const expected = `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`;
  return secureEqualText(expected, signature);
}

function directMessageText(automation, req) {
  const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || 'cliente-x-instagram.vercel.app').split(',')[0].trim();
  const protocol = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const material = new URL(automation.materialUrl, `${protocol}://${forwardedHost}`).toString();
  return automation.message.includes('{link}')
    ? automation.message.replaceAll('{link}', material)
    : `${automation.message}\n\n${material}`;
}

async function instagramRequest(path, accessToken, body) {
  const response = await fetch(`https://graph.instagram.com/v23.0/${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.error?.message || `Instagram HTTP ${response.status}`);
  return result;
}

function keywordMatches(text, automation) {
  const cleanText = String(text || '').trim().toLocaleLowerCase('pt-BR');
  const keyword = String(automation.keyword || '').trim().toLocaleLowerCase('pt-BR');
  return automation.matchMode === 'exact' ? cleanText === keyword : cleanText.includes(keyword);
}

async function handleInstagramWebhook(body, raw, signature, req) {
  if (!verifyInstagramWebhookSignature(raw, signature)) throw userError('Assinatura do webhook da Meta invalida.', 401);
  if (body?.object !== 'instagram') return { ignored: true, reason: 'object' };

  const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
  const automationsFile = await readGithubConfig(DIRECT_AUTOMATIONS_FILE_PATH);
  let changed = false;
  let processed = 0;

  for (const entry of Array.isArray(body.entry) ? body.entry : []) {
    const account = accounts.find((item) => String(process.env[item.userIdEnv] || '') === String(entry.id || ''));
    if (!account) continue;
    const group = automationsFile.data.find((item) => item.account === account.account);
    const automation = group?.automation;
    const token = String(process.env[account.accessTokenEnv] || '').trim();
    if (!group || !automation?.enabled || !token) continue;
    group.deliveries = Array.isArray(group.deliveries) ? group.deliveries : [];

    for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
      if (change.field !== 'comments') continue;
      const value = change.value || {};
      const commentId = String(value.id || value.comment_id || '');
      const mediaId = String(value.media?.id || value.media_id || '');
      if (!commentId || group.deliveries.some((item) => String(item.commentId) === commentId)) continue;
      if (automation.mediaId && automation.mediaId !== mediaId) continue;
      if (!keywordMatches(value.text, automation)) continue;

      const delivery = {
        commentId,
        mediaId,
        username: String(value.from?.username || ''),
        receivedAt: new Date().toISOString(),
        status: 'failed'
      };
      try {
        const privateReply = await instagramRequest(`${encodeURIComponent(entry.id)}/messages`, token, {
          recipient: { comment_id: commentId },
          message: { text: directMessageText(automation, req) }
        });
        delivery.status = 'sent';
        delivery.messageId = privateReply.message_id || null;
        delivery.recipientId = privateReply.recipient_id || null;
        if (automation.publicReply) {
          const publicReply = await instagramRequest(`${encodeURIComponent(commentId)}/replies`, token, { message: automation.publicReply });
          delivery.publicReplyId = publicReply.id || null;
        }
        processed += 1;
      } catch (error) {
        delivery.error = String(error.message || error).slice(0, 300);
      }
      group.deliveries.push(delivery);
      group.deliveries = group.deliveries.slice(-50);
      changed = true;
    }
  }

  if (changed) {
    await writeGithubConfig(DIRECT_AUTOMATIONS_FILE_PATH, automationsFile.data, automationsFile.sha, 'Record Instagram Direct automation delivery');
  }
  return { processed };
}

async function readWatchdogErrors() {
  return readConfigGroups(WATCHDOG_ERRORS_FILE_PATH, WATCHDOG_ERRORS_PATH);
}

async function readConfigGroups(filePath, localPath) {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  if (!token) return readJson(localPath);

  try {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=main`, {
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
    return readJson(localPath);
  }
}

function threadsRedirectUri(req) {
  const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || 'cliente-x-instagram.vercel.app').split(',')[0].trim();
  const protocol = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return `${protocol}://${forwardedHost}/api/state?threads=callback`;
}

function threadsStateSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

function createThreadsState(accountKey) {
  const payload = Buffer.from(JSON.stringify({ account: accountKey, expiresAt: Date.now() + 15 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', threadsStateSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyThreadsState(value) {
  const [payload, signature] = String(value || '').split('.');
  if (!payload || !signature || !threadsStateSecret()) throw userError('Estado OAuth do Threads invalido.', 400);
  const expected = createHmac('sha256', threadsStateSecret()).update(payload).digest('base64url');
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) throw userError('Assinatura OAuth do Threads invalida.', 400);
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!decoded.account || Number(decoded.expiresAt) < Date.now()) throw userError('Autorização do Threads expirou. Inicie novamente.', 400);
  return decoded;
}

async function completeThreadsOAuth(req, account, code) {
  const appId = String(process.env.THREADS_APP_ID || '').trim();
  const appSecret = String(process.env.THREADS_APP_SECRET || '').trim();
  if (!appId || !appSecret) throw userError('Configure THREADS_APP_ID e THREADS_APP_SECRET antes de conectar.', 503);
  const redirectUri = threadsRedirectUri(req);
  const shortResponse = await fetch('https://graph.threads.net/oauth/access_token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: appId, client_secret: appSecret, grant_type: 'authorization_code', redirect_uri: redirectUri, code })
  });
  const shortPayload = await shortResponse.json().catch(() => ({}));
  if (!shortResponse.ok || !shortPayload.access_token) throw userError(shortPayload.error_message || shortPayload.error?.message || 'Threads recusou o código OAuth.', shortResponse.status);
  const longUrl = new URL('https://graph.threads.net/access_token');
  longUrl.searchParams.set('grant_type', 'th_exchange_token');
  longUrl.searchParams.set('client_secret', appSecret);
  longUrl.searchParams.set('access_token', shortPayload.access_token);
  const longResponse = await fetch(longUrl);
  const longPayload = await longResponse.json().catch(() => ({}));
  const accessToken = longResponse.ok && longPayload.access_token ? longPayload.access_token : shortPayload.access_token;
  const profileResponse = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`);
  const profile = await profileResponse.json().catch(() => ({}));
  if (!profileResponse.ok || !profile.id) throw userError(profile.error?.message || 'Não foi possível validar o perfil do Threads.', profileResponse.status);
  const prefix = account.accessTokenEnv.replace(/_INSTAGRAM_ACCESS_TOKEN$/, '');
  await saveVercelEnv(`${prefix}_THREADS_ACCESS_TOKEN`, accessToken);
  await saveVercelEnv(`${prefix}_THREADS_USER_ID`, String(profile.id));
  await redeployVercelProduction();
  return profile;
}

async function publishThreadsTest(account, text) {
  const cleanText = String(text || '').trim();
  const characterCount = Array.from(cleanText).length;
  if (!cleanText) throw userError('O texto de teste do Threads está vazio.');
  if (characterCount > 470) throw userError(`Texto bloqueado com ${characterCount} caracteres. O sistema permite no máximo 470 para manter margem segura.`);
  const prefix = account.accessTokenEnv.replace(/_INSTAGRAM_ACCESS_TOKEN$/, '');
  const accessToken = String(process.env[`${prefix}_THREADS_ACCESS_TOKEN`] || '').trim();
  const userId = String(process.env[`${prefix}_THREADS_USER_ID`] || '').trim();
  if (!accessToken || !userId) throw userError('Conecte a conta do Threads antes de publicar o teste.', 409);
  const createResponse = await fetch(`https://graph.threads.net/v1.0/${encodeURIComponent(userId)}/threads`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ media_type: 'TEXT', text: cleanText, access_token: accessToken })
  });
  const container = await createResponse.json().catch(() => ({}));
  if (!createResponse.ok || !container.id) throw userError(container.error?.message || `Threads recusou a criação: HTTP ${createResponse.status}.`, createResponse.status);
  const publishResponse = await fetch(`https://graph.threads.net/v1.0/${encodeURIComponent(userId)}/threads_publish`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ creation_id: String(container.id), access_token: accessToken })
  });
  const published = await publishResponse.json().catch(() => ({}));
  if (!publishResponse.ok || !published.id) throw userError(published.error?.message || `Threads recusou a publicação: HTTP ${publishResponse.status}.`, publishResponse.status);
  const detailsResponse = await fetch(`https://graph.threads.net/v1.0/${encodeURIComponent(published.id)}?fields=id,permalink,username,timestamp&access_token=${encodeURIComponent(accessToken)}`);
  const details = await detailsResponse.json().catch(() => ({}));
  return {
    ok: true,
    threadId: String(published.id),
    permalink: details.permalink || null,
    username: details.username || null,
    timestamp: details.timestamp || new Date().toISOString(),
    characterCount,
    message: `Teste publicado no Threads com ${characterCount} caracteres.`
  };
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { body, raw } = await readBody(req);
      if (String(req.query?.instagram || '') === 'webhook') {
        const result = await handleInstagramWebhook(body, raw, req.headers['x-hub-signature-256'] || '', req);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json({ received: true, ...result });
        return;
      }
      if (String(req.query?.billing || '') === 'webhook') {
        const result = await handleStripeWebhook(raw, req.headers['stripe-signature'] || '');
        res.setHeader('cache-control', 'no-store');
        res.status(200).json({ received: true, ...result });
        return;
      }
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
        const key = String(body.key || '').trim();
        const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
        if (!canManageSecret(session, key, accounts)) {
          throw userError('Seu usuario so pode validar acessos das proprias contas.', 403);
        }
        const result = await validateAccessValue(
          key,
          String(body.value || ''),
          body.companion || {}
        );
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'save-access') {
        const key = String(body.key || '').trim();
        const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
        if (!canManageSecret(session, key, accounts)) {
          throw userError('Seu usuario so pode salvar acessos das proprias contas.', 403);
        }
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
      if (body.action === 'create-account') {
        const result = await createAccountConfig(body, session);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'create-stripe-checkout') {
        const result = await createStripeCheckout(body, session, req);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'update-account-profile') {
        const result = await updateAccountProfile(body, session);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'update-client-status') {
        const result = await updateClientStatus(body, session);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'update-weekly-programs') {
        const result = await updateWeeklyPrograms(body, session);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'update-direct-automation') {
        const result = await updateDirectAutomation(body, session);
        res.setHeader('cache-control', 'no-store'); res.status(200).json(result); return;
      }
      if (body.action === 'upload-direct-material') {
        const result = await uploadDirectMaterial(body, session);
        res.setHeader('cache-control', 'no-store'); res.status(200).json(result); return;
      }
      if (body.action === 'upload-brand-document') {
        const result = await uploadBrandDocument(body, session);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'redeploy-vercel') {
        const result = await redeployVercelProduction();
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'force-watchdog') {
        const result = await forceInstagramWatchdog(session);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'publish-threads-test') {
        const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
        const account = requireConfiguredAccount(accounts, String(body.account || 'cliente-x'));
        if (!canAccessAccount(session, account)) throw userError('Seu usuário não pode publicar nesta conta.', 403);
        const defaultText = 'Automação boa não começa pela ferramenta. Começa por uma tarefa repetitiva, um resultado esperado e alguém responsável por revisar as exceções.\n\nEscolha um processo que consome tempo da sua equipe. Meça antes, automatize uma etapa e compare o resultado.\n\nQual tarefa você automatizaria primeiro?\n\n#automação #inteligênciaartificial #negócios';
        const result = await publishThreadsTest(account, body.text || defaultText);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'create-user') {
        if (!isOwner(session)) throw userError('Apenas o admin principal pode criar usuarios.', 403);
        const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
        const result = await createPanelUser(body, accounts);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      if (body.action === 'update-user') {
        if (!isOwner(session)) throw userError('Apenas o admin principal pode alterar usuarios.', 403);
        const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
        const result = await updatePanelUser(body, accounts);
        res.setHeader('cache-control', 'no-store');
        res.status(200).json(result);
        return;
      }
      res.status(400).json({ error: 'Acao invalida.' });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  if (String(req.query?.instagram || '') === 'webhook') {
    const mode = String(req.query?.['hub.mode'] || '');
    const token = String(req.query?.['hub.verify_token'] || '');
    const challenge = String(req.query?.['hub.challenge'] || '');
    const expected = String(process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || '').trim();
    if (mode === 'subscribe' && expected && secureEqualText(token, expected)) {
      res.setHeader('content-type', 'text/plain');
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ error: 'Token de verificacao do webhook invalido.' });
    }
    return;
  }

  if (String(req.query?.threads || '') === 'connect') {
    try {
      const session = getSession(req);
      if (!session) throw userError('Faça login no painel antes de conectar o Threads.', 401);
      const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
      const account = requireConfiguredAccount(accounts, String(req.query?.account || 'cliente-x'));
      if (!canAccessAccount(session, account)) throw userError('Seu usuário não pode conectar esta conta.', 403);
      const appId = String(process.env.THREADS_APP_ID || '').trim();
      if (!appId || !process.env.THREADS_APP_SECRET) throw userError('Cadastre THREADS_APP_ID e THREADS_APP_SECRET em Acessos conectados e faça o redeploy.', 503);
      const authorize = new URL('https://threads.net/oauth/authorize');
      authorize.searchParams.set('client_id', appId);
      authorize.searchParams.set('redirect_uri', threadsRedirectUri(req));
      authorize.searchParams.set('scope', 'threads_basic,threads_content_publish');
      authorize.searchParams.set('response_type', 'code');
      authorize.searchParams.set('state', createThreadsState(account.account));
      res.redirect(302, authorize.toString());
    } catch (error) {
      res.redirect(302, `/?threads=error&message=${encodeURIComponent(error.message)}`);
    }
    return;
  }

  if (String(req.query?.threads || '') === 'callback') {
    try {
      const session = getSession(req);
      if (!session) throw userError('Sua sessão expirou. Entre novamente e conecte o Threads.', 401);
      if (req.query?.error) throw userError(String(req.query.error_description || req.query.error));
      const state = verifyThreadsState(req.query?.state);
      const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
      const account = requireConfiguredAccount(accounts, state.account);
      if (!canAccessAccount(session, account)) throw userError('Seu usuário não pode conectar esta conta.', 403);
      const profile = await completeThreadsOAuth(req, account, String(req.query?.code || ''));
      res.redirect(302, `/?threads=connected&username=${encodeURIComponent(profile.username || profile.id)}`);
    } catch (error) {
      res.redirect(302, `/?threads=error&message=${encodeURIComponent(error.message)}`);
    }
    return;
  }

  const session = getSession(req);
  const accounts = await readConfigGroups(ACCOUNTS_FILE_PATH, ACCOUNTS_PATH);
  const allowedAccounts = session && !isOwner(session)
    ? accounts.filter((item) => canAccessAccount(session, item))
    : accounts;
  if (session && !allowedAccounts.length) {
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({
      account: null,
      accounts: [],
      selectedAccount: null,
      activeVersion: {
        ...ACTIVE_VERSION,
        currentCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || ACTIVE_VERSION.stableCommit,
        currentCommitFull: process.env.VERCEL_GIT_COMMIT_SHA || ACTIVE_VERSION.stableCommit,
        currentCommitUrl: process.env.VERCEL_GIT_COMMIT_SHA
          ? `https://github.com/${OWNER}/${REPO}/commit/${process.env.VERCEL_GIT_COMMIT_SHA}`
          : ACTIVE_VERSION.stableCommitUrl
      },
      session: {
        authenticated: true,
        email: session.email,
        role: session.role,
        accounts: session.accounts || [],
        adminConfigured: hasAdminConfig(),
        adminEmail: configuredAdminEmail() || null
      },
      users: [],
      maintenance: MAINTENANCE,
      watchdogErrors: [],
      accessConfig: [],
      secrets: [],
      scheduleBrt: [],
      dailyPlan: [],
      tomorrowPreview: { date: tomorrowSaoPaulo(), items: [] },
      weeklyPrograms: [],
      packs: [],
      packCount: 0,
      uniqueCaptions: 0,
      scheduledPosts: [],
      latestResult: null,
      latestFailure: null
    });
    return;
  }

  let accountKey = accountFromQuery(req);
  if (session && !canAccessAccount(session, accounts.find((item) => item.account === accountKey) || accountKey)) {
    accountKey = allowedAccounts[0]?.account || accountKey;
  }
  const content = await readConfigGroups(CONTENT_FILE_PATH, CONTENT_PATH);
  const account = requireConfiguredAccount(allowedAccounts, accountKey);
  const accountSummaries = allowedAccounts.map((item) => ({
    account: item.account,
    expectedUsername: item.expectedUsername,
    brandName: item.brandName,
    footerText: item.footerText,
    clientProfile: item.clientProfile || null
  }));
  const group = content.find((item) => item.account === accountKey);
  const scheduledGroups = await readScheduledGroups();
  const weeklyProgramGroups = await readWeeklyProgramGroups();
  const directAutomationGroups = await readDirectAutomationGroups();
  const watchdogErrors = await readWatchdogErrors();
  const scheduledGroup = scheduledGroups.find((item) => item.account === accountKey);
  const weeklyProgramGroup = weeklyProgramGroups.find((item) => item.account === accountKey);
  const directAutomationGroup = directAutomationGroups.find((item) => item.account === accountKey);
  const packs = group?.packs || [];
  const scheduleBrt = account?.scheduleUtc?.map(cronToBrtTime) || [];
  const scheduledPosts = scheduledGroup?.posts || [];
  const weeklyPrograms = weeklyProgramGroup?.programs || [];
  let plan = editorialDailyPlan(scheduleBrt, account, packs, scheduledPosts);
  if (!plan.length) {
    try {
      plan = publisherDailyPlan(accountKey);
    } catch {
      plan = dailyPlan(scheduleBrt, packs, scheduledPosts);
    }
  }
  plan = mergeProgramItems(plan, weeklyPrograms);
  const tomorrowDate = tomorrowSaoPaulo();
  let tomorrowPlan = [];
  try {
    tomorrowPlan = publisherDailyPlan(accountKey, tomorrowDate);
  } catch {
    tomorrowPlan = editorialDailyPlan(scheduleBrt, account, packs, scheduledPosts, tomorrowDate);
  }
  tomorrowPlan = mergeProgramItems(tomorrowPlan, weeklyPrograms, tomorrowDate).slice(0, 3);

  res.setHeader('cache-control', 'no-store');
  res.status(200).json({
    account,
    accounts: accountSummaries,
    selectedAccount: accountKey,
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
      role: session?.role || null,
      accounts: session?.accounts || [],
      adminConfigured: hasAdminConfig(),
      adminEmail: configuredAdminEmail() || null
    },
    users: session && isOwner(session) ? publicUsers() : [],
    maintenance: MAINTENANCE,
    watchdogErrors: watchdogErrors.filter((item) => !item.account || item.account === accountKey).slice(-10).reverse(),
    accessConfig: accessConfigForAccount(account),
    secrets: session ? secretStatuses(accounts) : [],
    scheduleBrt,
    dailyPlan: plan,
    tomorrowPreview: {
      date: tomorrowDate,
      items: tomorrowPlan
    },
    weeklyPrograms,
    directAutomation: directAutomationGroup || { account: accountKey, automation: null, deliveries: [] },
    packs,
    packCount: packs.length,
    uniqueCaptions: new Set(packs.map((pack) => normalizeCaption(pack.caption))).size,
    scheduledPosts,
    latestResult: null,
    latestFailure: null
  });
}
