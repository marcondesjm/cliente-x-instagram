#!/usr/bin/env node
import { chromium } from 'playwright';
import { createHash, randomInt } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isIP } from 'node:net';
import { basename, dirname, extname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildBrandContext } from '../../../lib/brand-analysis.js';
import { buildResearchPack, EDITORIAL_SOURCES, extractArticleFacts, extractEditorialImageUrl, factualSummary, isPredominantlyEnglish, isUsableEditorialFact, matchesConfiguredEditorialIntent, normalizeEditorialSources, researchFreshEditorialPacks } from '../../../lib/editorial-research.js';
import { summarizePerformanceLearning } from '../../../lib/performance-learning.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TEMPLATE_DIR = resolve(ROOT, 'automation', 'instagram-template');
const DEFAULT_CONFIG_DIR = join(TEMPLATE_DIR, 'config');
const RUNS_DIR = join(TEMPLATE_DIR, 'runs');
const PERFORMANCE_INSIGHTS_PATH = join(DEFAULT_CONFIG_DIR, 'performance-insights.json');
const FEED_WIDTH = 1080;
const FEED_HEIGHT = 1350;
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const STORY_SAFE_TOP = 250;
const STORY_SAFE_BOTTOM = 500;
const STORY_SAFE_HEIGHT = STORY_HEIGHT - STORY_SAFE_TOP - STORY_SAFE_BOTTOM;
// Fotos podem ocupar a faixa decorativa inferior, onde nenhum texto essencial
// deve entrar. Isso evita um rodape visualmente vazio sem disputar espaco com
// os controles do Instagram.
const STORY_PHOTO_BOTTOM_ALLOWANCE = 280;
const FORBIDDEN_GENERIC_RESEARCH_COVERS = [
  /sua equipe vive ocupada.*tarefas importantes não andam/i,
  /trabalho repetido ocupa o tempo que deveria ir para o cliente/i,
  /o cliente espera enquanto sua equipe procura informação/i,
  /sua equipe trabalha muito.*processo acompanha esse esforço/i,
  /uma pequena demora pode virar uma oportunidade perdida/i,
  /apresenta uma novidade sobre/i
];
const IG_BASE = 'https://graph.facebook.com/v21.0';
const RETRY_ATTEMPTS = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_RETRY_ATTEMPTS || '3', 10);
const RETRY_BASE_DELAY_MS = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_RETRY_BASE_DELAY_MS || '2500', 10);
const GITHUB_REF_RETRY_ATTEMPTS = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_GITHUB_REF_RETRY_ATTEMPTS || '6', 10);
const MEDIA_URL_RETRY_ATTEMPTS = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_MEDIA_URL_RETRY_ATTEMPTS || '3', 10);
const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const RETRYABLE_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ENOTFOUND',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET'
]);

const PLAIN_ASCII_PORTUGUESE = [
  ['nao', 'não'],
  ['operacao', 'operação'],
  ['automacao', 'automação'],
  ['conteudo', 'conteúdo'],
  ['criterio', 'critério'],
  ['padrao', 'padrão'],
  ['decisao', 'decisão'],
  ['execucao', 'execução'],
  ['proximo', 'próximo'],
  ['proxima', 'próxima'],
  ['gestao', 'gestão'],
  ['acao', 'ação'],
  ['informacao', 'informação'],
  ['revisao', 'revisão'],
  ['seguranca', 'segurança']
];

function parseArgs(argv) {
  const getValue = (name, fallback = undefined) => {
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : fallback;
  };
  return {
    account: getValue('--account', process.env.INSTAGRAM_TEMPLATE_ACCOUNT || 'cliente-exemplo'),
    configDir: resolve(getValue('--config-dir', DEFAULT_CONFIG_DIR)),
    dryRun: argv.includes('--dry-run'),
    renderOnly: argv.includes('--render-only'),
    planDay: argv.includes('--plan-day'),
    planDate: getValue('--plan-date', ''),
    storyOnly: argv.includes('--story-only'),
    validateCopy: argv.includes('--validate-copy'),
    scheduledOnly: argv.includes('--scheduled-only')
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function configPath(configDir, name) {
  const customPath = join(configDir, `${name}.json`);
  if (existsSync(customPath)) return customPath;
  return join(configDir, `${name}.example.json`);
}

function loadEnv() {
  const env = { ...process.env };
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return env;
  const raw = readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (match && !env[match[1].trim()]) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

function loadConfig(configDir, accountName) {
  const accounts = readJson(configPath(configDir, 'accounts'));
  const contentGroups = readJson(configPath(configDir, 'content-packs'));
  const styles = readJson(configPath(configDir, 'visual-styles'));
  const account = accounts.find((item) => item.account === accountName);
  const content = contentGroups.find((item) => item.account === accountName);
  if (!account) throw new Error(`Conta "${accountName}" nao encontrada no arquivo de contas.`);
  if (!content) throw new Error(`Packs da conta "${accountName}" nao encontrados no arquivo de conteudo.`);
  if (!content.packs?.length) throw new Error(`Conta "${accountName}" nao tem packs de conteudo.`);
  if (!styles.length) throw new Error('Nenhum estilo visual configurado.');
  return { account, packs: content.packs, styles };
}

function scheduledPostsPath(configDir) {
  return configPath(configDir, 'scheduled-posts');
}

function loadScheduledPosts(configDir, accountName) {
  const path = scheduledPostsPath(configDir);
  if (!existsSync(path)) return { path, groups: [{ account: accountName, posts: [] }], group: { account: accountName, posts: [] } };
  const groups = readJson(path);
  let group = groups.find((item) => item.account === accountName);
  if (!group) {
    group = { account: accountName, posts: [] };
    groups.push(group);
  }
  if (!Array.isArray(group.posts)) group.posts = [];
  return { path, groups, group };
}

function dueScheduledPost(configDir, accountName, now = new Date()) {
  const state = loadScheduledPosts(configDir, accountName);
  const post = state.group.posts
    .filter((item) => item.status === 'pending' && Date.parse(item.scheduledFor) <= now.getTime())
    .sort((a, b) => Date.parse(a.scheduledFor) - Date.parse(b.scheduledFor))[0];
  return { ...state, post };
}

function updateScheduledPost(configDir, accountName, id, patch) {
  const state = loadScheduledPosts(configDir, accountName);
  const post = state.group.posts.find((item) => item.id === id);
  if (!post) return null;
  Object.assign(post, patch);
  writeJson(state.path, state.groups);
  return post;
}

function loadWeeklyPrograms(configDir, accountName) {
  const path = configPath(configDir, 'weekly-programs');
  if (!existsSync(path)) return { path, groups: [{ account: accountName, programs: [] }], group: { account: accountName, programs: [] } };
  const groups = readJson(path);
  let group = groups.find((item) => item.account === accountName);
  if (!group) {
    group = { account: accountName, programs: [] };
    groups.push(group);
  }
  if (!Array.isArray(group.programs)) group.programs = [];
  return { path, groups, group };
}

function weekdaySaoPaulo(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 15, 0, 0)).getUTCDay();
}

function currentBrtDateTime(now = new Date()) {
  const stamp = timestampSaoPaulo();
  return {
    date: stamp.slice(0, 10),
    time: `${stamp.slice(11, 13)}:${stamp.slice(13, 15)}`,
    timestamp: now.toISOString()
  };
}

function isWeeklyProgramDue(program, now = new Date()) {
  if (!program || program.status === 'paused') return false;
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(String(program.time || ''))) return false;
  const current = currentBrtDateTime(now);
  if (program.lastPublishedDate === current.date) return false;
  const weekdays = Array.isArray(program.weekdays) ? program.weekdays.map(Number) : [];
  if (!weekdays.includes(weekdaySaoPaulo(current.date))) return false;
  return String(program.time) <= current.time;
}

function programImageSlide(program) {
  const rawImagePath = String(program.feedImagePath || program.imagePath || '').trim();
  const imageUrl = String(program.feedImageUrl || program.imageUrl || (/^https?:\/\//i.test(rawImagePath) ? rawImagePath : '')).trim();
  const imagePath = /^https?:\/\//i.test(rawImagePath) ? '' : rawImagePath;
  if (!imagePath && !imageUrl) return null;
  return {
    eyebrow: 'No ar',
    title: program.name,
    body: program.description || program.callToAction || 'Confira a programação.',
    ...(imagePath ? { imagePath } : {}),
    ...(imageUrl ? { imageUrl } : {})
  };
}

function packFromWeeklyProgram(program, account = {}) {
  const brand = account.brandName || account.expectedUsername || 'Rádio';
  const title = program.title || `Hoje tem ${program.name}`;
  const hostLine = program.host ? `Com ${program.host}.` : `Na programação da ${brand}.`;
  const cta = program.callToAction || 'Acompanhe ao vivo, participe e compartilhe com quem gosta da nossa programação.';
  const slides = [
    programImageSlide(program),
    {
      eyebrow: 'Programação',
      title,
      body: `${program.name} começa às ${program.time}. ${hostLine}`
    },
    {
      eyebrow: 'Ao vivo',
      title: 'Sintonize no horário certo.',
      body: program.description || 'Uma chamada rápida para lembrar o público do programa e aumentar a audiência no momento certo.'
    },
    {
      eyebrow: 'Participe',
      title: 'Chame quem acompanha com você.',
      body: cta
    }
  ].filter(Boolean);
  return {
    slides,
    caption: `${title}\n\n${program.description || hostLine}\n\n${cta}`,
    storyImagePath: String(program.storyImagePath || '').trim(),
    storyImageUrl: String(program.storyImageUrl || '').trim()
  };
}

function dueWeeklyProgramPost(configDir, accountName, account, now = new Date()) {
  const state = loadWeeklyPrograms(configDir, accountName);
  const program = state.group.programs
    .filter((item) => isWeeklyProgramDue(item, now))
    .sort((a, b) => String(a.time).localeCompare(String(b.time)))[0];
  if (!program) return { ...state, post: null, program: null };
  const current = currentBrtDateTime(now);
  return {
    ...state,
    program,
    post: {
      id: `weekly-${program.id}-${current.date}`,
      status: 'pending',
      packIndex: program.id || program.name,
      pack: packFromWeeklyProgram(program, account),
      scheduledFor: `${current.date}T${program.time}:00-03:00`,
      mode: program.mode === 'story-only' ? 'story-only' : 'feed-and-story',
      title: program.title || program.name,
      source: 'weekly-program',
      programId: program.id
    }
  };
}

function updateWeeklyProgramPost(configDir, accountName, id, patch) {
  const match = String(id || '').match(/^weekly-(.+)-(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  const [, programId, dateString] = match;
  const state = loadWeeklyPrograms(configDir, accountName);
  const program = state.group.programs.find((item) => String(item.id) === programId);
  if (!program) return null;
  if (patch.status === 'published') {
    program.lastPublishedDate = dateString;
    program.lastPublishedAt = patch.publishedAt || new Date().toISOString();
  }
  if (patch.status === 'failed') {
    program.lastFailureAt = patch.failedAt || new Date().toISOString();
    program.lastFailureMessage = patch.error || patch.message || 'Falha ao publicar programa.';
  }
  writeJson(state.path, state.groups);
  return program;
}

async function loadSupabasePacks(env, accountName) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const endpoint = new URL('/rest/v1/instagram_posts', url);
  endpoint.searchParams.set('select', 'slot_index,slides,caption');
  endpoint.searchParams.set('account', `eq.${accountName}`);
  endpoint.searchParams.set('active', 'eq.true');
  endpoint.searchParams.set('order', 'slot_index.asc');

  const res = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });
  if (!res.ok) throw new Error(`Supabase posts failed [${res.status}]: ${await res.text()}`);

  const rows = await res.json();
  if (!Array.isArray(rows) || !rows.length) return null;
  return rows.map((row) => ({
    slotIndex: row.slot_index,
    slides: row.slides,
    caption: row.caption
  }));
}

function mergePacks(primaryPacks, fallbackPacks) {
  if (!primaryPacks?.length) return fallbackPacks;

  const captions = new Set(primaryPacks.map((pack) => normalizeCaption(pack.caption)));
  const extras = fallbackPacks.filter((pack) => !captions.has(normalizeCaption(pack.caption)));
  return [...primaryPacks, ...extras];
}

const AUTO_CONTENT_TOPICS = [
  {
    area: 'Comercial',
    pain: 'proposta demora para sair',
    process: 'briefing, escopo, prazo e objeções',
    gain: 'responder com mais contexto e menos retrabalho',
    hashtag: '#comercial #vendas #automacao #inteligenciaartificial #negocios'
  },
  {
    area: 'Atendimento',
    pain: 'cliente precisa repetir informação',
    process: 'histórico, prioridade, dono e próxima ação',
    gain: 'atender com memória operacional',
    hashtag: '#atendimento #crm #inteligenciaartificial #automacao #experienciadocliente'
  },
  {
    area: 'Financeiro',
    pain: 'conferência manual consome tempo todo mês',
    process: 'vencimentos, conciliação, alertas e exceções',
    gain: 'proteger caixa com mais previsibilidade',
    hashtag: '#financeiro #gestao #automacao #inteligenciaartificial #empresas'
  },
  {
    area: 'Marketing',
    pain: 'conteúdo depende de inspiração de última hora',
    process: 'tema, calendário, revisão e reaproveitamento',
    gain: 'manter presença sem perder posicionamento',
    hashtag: '#marketing #conteudo #inteligenciaartificial #automacao #negocios'
  },
  {
    area: 'Operação',
    pain: 'gargalo pequeno trava entrega importante',
    process: 'entrada, regra, responsável e indicador',
    gain: 'tirar esforço manual do caminho crítico',
    hashtag: '#operacao #processos #automacao #produtividade #gestao'
  },
  {
    area: 'RH',
    pain: 'onboarding acontece sem trilha clara',
    process: 'checklists, documentos, mensagens e responsáveis',
    gain: 'dar previsibilidade sem tirar cuidado humano',
    hashtag: '#rh #gestaodepessoas #inteligenciaartificial #automacao #empresas'
  },
  {
    area: 'Diretoria',
    pain: 'reunião discute número em vez de decisão',
    process: 'indicadores, exceções, causa provável e próximo passo',
    gain: 'transformar relatório em ação',
    hashtag: '#diretoria #dados #gestao #inteligenciaartificial #produtividade'
  },
  {
    area: 'Suporte',
    pain: 'dúvida repetida volta para a fila toda semana',
    process: 'base de conhecimento, triagem, prioridade e revisão',
    gain: 'resolver o básico com consistência',
    hashtag: '#suporte #atendimento #automacao #inteligenciaartificial #experienciadocliente'
  },
  {
    area: 'Dados',
    pain: 'relatório nasce de planilha bagunçada',
    process: 'origem, padrão, atualização e dono da informação',
    gain: 'decidir sem perder tempo discutindo a base',
    hashtag: '#dados #businessintelligence #gestao #inteligenciaartificial #automacao'
  },
  {
    area: 'Implantação',
    pain: 'ferramenta pronta não vira hábito',
    process: 'treinamento, rotina, métrica e melhoria contínua',
    gain: 'fazer a automação entrar no dia a dia',
    hashtag: '#implantacao #automacao #inteligenciaartificial #gestao #produtividade'
  }
];

const AUTO_CONTENT_ANGLES = [
  {
    label: 'Diagnóstico',
    hook: 'Antes de automatizar, encontre o ponto que realmente custa caro.',
    insight: 'A IA funciona melhor quando o problema está descrito com começo, regra e resultado esperado.',
    action: 'Mapeie uma rotina repetitiva, escreva o critério de qualidade e só então escolha a ferramenta.'
  },
  {
    label: 'Processo',
    hook: 'Automação boa começa quando o trabalho deixa de morar na cabeça de alguém.',
    insight: 'Quando o fluxo fica visível, a IA consegue resumir, alertar, organizar e executar com menos improviso.',
    action: 'Transforme a rotina em checklist, defina responsáveis e acompanhe o que mudou depois da primeira versão.'
  },
  {
    label: 'Controle',
    hook: 'Velocidade sem revisão apenas espalha erro mais rápido.',
    insight: 'O ganho real aparece quando a empresa combina IA com critérios, logs e pontos claros de aprovação.',
    action: 'Defina o que pode ser automático, o que precisa de validação e quais dados nunca entram sem cuidado.'
  },
  {
    label: 'Escala',
    hook: 'O primeiro projeto de IA deve provar valor sem complicar a operação.',
    insight: 'Começar pequeno ajuda o time a aprender, medir resultado e ganhar confiança para avançar.',
    action: 'Escolha um fluxo simples, publique a regra, meça tempo salvo e melhore com base no uso real.'
  },
  {
    label: 'Rotina',
    hook: 'Toda tarefa que se repete muito merece uma pergunta: por que ainda depende de esforço manual?',
    insight: 'A IA não precisa substituir pessoas para gerar valor; muitas vezes basta reduzir atrito e lembrar o próximo passo.',
    action: 'Observe uma semana de trabalho, marque repetições e escolha uma delas para virar sistema.'
  },
  {
    label: 'Gestão',
    hook: 'IA aplicada não é truque de ferramenta. É método de gestão.',
    insight: 'A empresa ganha quando usa tecnologia para padronizar execução, preservar contexto e melhorar decisão.',
    action: 'Registre o fluxo, revise exceções e transforme cada melhoria em processo compartilhado.'
  }
];

const AUTO_CONTENT_CONTEXTS = [
  {
    trigger: 'quando a equipe cresce e a rotina deixa de caber no improviso',
    proof: 'tempo salvo, menos retrabalho e mais clareza sobre o próximo passo'
  },
  {
    trigger: 'quando o volume aumenta e a operação começa a perder padrão',
    proof: 'respostas mais consistentes, prazos visíveis e decisões menos reativas'
  },
  {
    trigger: 'quando uma tarefa simples passa a consumir atenção todos os dias',
    proof: 'menos dependência de memória, mais registro e mais previsibilidade'
  },
  {
    trigger: 'quando o mesmo erro aparece em semanas diferentes',
    proof: 'um fluxo documentado, uma regra clara e revisão nos pontos certos'
  },
  {
    trigger: 'quando existe dado suficiente, mas falta rotina para usar bem',
    proof: 'indicadores mais úteis, alertas melhores e acompanhamento com dono'
  },
  {
    trigger: 'quando o time sabe o que fazer, mas perde tempo repetindo passos',
    proof: 'execução mais rápida sem abrir mão de controle e qualidade'
  },
  {
    trigger: 'quando a liderança precisa enxergar exceção antes de virar urgência',
    proof: 'sinais mais cedo, prioridades claras e decisões com contexto'
  },
  {
    trigger: 'quando a empresa quer escalar sem criar mais camadas manuais',
    proof: 'processo replicável, logs simples e melhoria contínua'
  }
];

const INDUSTRY_SPECIALISTS = [
  {
    id: 'juridico',
    keywords: ['advogado', 'advogados', 'advocacia', 'juridico', 'jurídico', 'direito', 'contrato', 'contratos', 'escritorio juridico', 'escritório jurídico'],
    area: 'Advocacia',
    pain: 'lead chega pelo WhatsApp sem contexto, documento ou urgência clara',
    process: 'triagem do caso, documentos, área do direito, prazo, risco e próximo atendimento',
    gain: 'transformar contatos soltos em atendimento jurídico mais organizado',
    hashtag: '#advocacia #juridico #inteligenciaartificial #automacao #gestaojuridica',
    trigger: 'quando o escritório recebe muitas conversas e cada atendimento começa do zero',
    proof: 'triagem melhor, histórico salvo e reunião inicial com mais contexto',
    visualCue: 'legal',
    examples: ['triagem de leads', 'organização de documentos', 'follow-up de consulta', 'contratos e prazos']
  },
  {
    id: 'clinicas',
    keywords: ['clinica', 'clínica', 'clinicas', 'clínicas', 'medico', 'médico', 'dentista', 'odontologia', 'consulta', 'paciente', 'saude', 'saúde'],
    area: 'Clínicas',
    pain: 'paciente chama, pergunta preço, some e volta sem histórico',
    process: 'triagem, especialidade, urgência, agenda, confirmação e pós-consulta',
    gain: 'organizar atendimento sem perder acolhimento',
    hashtag: '#clinicas #saude #atendimento #inteligenciaartificial #automacao',
    trigger: 'quando a recepção lida com muitas mensagens e pouca visibilidade de prioridade',
    proof: 'menos mensagens perdidas, agenda mais clara e experiência mais consistente',
    visualCue: 'clinic',
    examples: ['agendamento', 'confirmação de consulta', 'retorno de pacientes', 'triagem inicial']
  },
  {
    id: 'imobiliario',
    keywords: ['imobiliaria', 'imobiliária', 'imovel', 'imóvel', 'imoveis', 'imóveis', 'corretor', 'corretores', 'aluguel', 'locacao', 'locação'],
    area: 'Imobiliário',
    pain: 'interessado pergunta por imóvel, mas o atendimento demora e perde intenção de compra',
    process: 'perfil do cliente, bairro, faixa de preço, urgência, financiamento e visita',
    gain: 'priorizar oportunidades e acelerar visitas com contexto',
    hashtag: '#imobiliario #corretordeimoveis #vendas #inteligenciaartificial #automacao',
    trigger: 'quando muitos leads chegam por anúncio e poucos viram visita qualificada',
    proof: 'lead qualificado, follow-up no prazo e histórico de preferência salvo',
    visualCue: 'real-estate',
    examples: ['captação de lead', 'agendamento de visita', 'qualificação financeira', 'follow-up de proposta']
  },
  {
    id: 'restaurantes',
    keywords: ['restaurante', 'restaurantes', 'delivery', 'cardapio', 'cardápio', 'bar', 'lanchonete', 'pedido', 'ifood'],
    area: 'Restaurantes',
    pain: 'pedido, reserva e dúvida chegam misturados e a equipe perde tempo respondendo repetição',
    process: 'cardápio, reserva, pedido, status, avaliação e recompra',
    gain: 'atender melhor nos horários de pico sem confundir a operação',
    hashtag: '#restaurante #delivery #atendimento #inteligenciaartificial #automacao',
    trigger: 'quando o movimento aumenta e cada mensagem disputa atenção com a operação',
    proof: 'respostas mais rápidas, menos erro de pedido e retorno de cliente melhor acompanhado',
    visualCue: 'restaurant',
    examples: ['reservas', 'pedidos', 'cardápio', 'avaliações']
  },
  {
    id: 'estetica',
    keywords: ['estetica', 'estética', 'beleza', 'salão', 'salao', 'barbearia', 'procedimento', 'spa', 'harmonizacao', 'harmonização'],
    area: 'Estética e beleza',
    pain: 'cliente pergunta procedimento, preço e horário, mas a conversa não vira agenda',
    process: 'interesse, indicação, contraindicação, horários, retorno e reativação',
    gain: 'transformar curiosidade em agenda com cuidado e clareza',
    hashtag: '#estetica #beleza #atendimento #inteligenciaartificial #automacao',
    trigger: 'quando o atendimento precisa educar sem parecer resposta genérica',
    proof: 'mais agendamentos, retornos lembrados e comunicação com padrão',
    visualCue: 'beauty',
    examples: ['pré-atendimento', 'agenda', 'retorno', 'reativação']
  },
  {
    id: 'educacao',
    keywords: ['escola', 'curso', 'cursos', 'educacao', 'educação', 'aluno', 'alunos', 'treinamento', 'mentoria', 'faculdade'],
    area: 'Educação',
    pain: 'interessado pede informação, mas não entende trilha, preço, turma e próximo passo',
    process: 'perfil do aluno, objetivo, turma, material, matrícula e acompanhamento',
    gain: 'orientar alunos com mais clareza até a matrícula',
    hashtag: '#educacao #cursos #atendimento #inteligenciaartificial #automacao',
    trigger: 'quando dúvidas repetidas atrapalham matrícula e suporte',
    proof: 'respostas consistentes, menos evasão de lead e acompanhamento mais visível',
    visualCue: 'education',
    examples: ['captação de alunos', 'matrícula', 'suporte', 'trilhas de estudo']
  },
  {
    id: 'ecommerce',
    keywords: ['ecommerce', 'e-commerce', 'loja', 'varejo', 'produto', 'produtos', 'pedido', 'estoque', 'vendas online'],
    area: 'E-commerce',
    pain: 'cliente pergunta sobre produto, prazo ou troca e a venda esfria antes do fechamento',
    process: 'produto, estoque, frete, pagamento, status do pedido, troca e recompra',
    gain: 'responder com contexto e recuperar carrinhos com mais precisão',
    hashtag: '#ecommerce #vendasonline #atendimento #inteligenciaartificial #automacao',
    trigger: 'quando atendimento e operação não conversam no mesmo ritmo',
    proof: 'menos abandono, status mais claro e recompra melhor trabalhada',
    visualCue: 'ecommerce',
    examples: ['carrinho abandonado', 'status de pedido', 'trocas', 'recompra']
  },
  {
    id: 'financeiro',
    keywords: ['contabilidade', 'contador', 'financeiro', 'financas', 'finanças', 'cobranca', 'cobrança', 'nota fiscal', 'fiscal'],
    area: 'Contabilidade e financeiro',
    pain: 'documento, cobrança e fechamento dependem de lembretes manuais todo mês',
    process: 'pendências, documentos, vencimentos, conciliação, alertas e fechamento',
    gain: 'dar previsibilidade ao mês sem depender de cobrança no improviso',
    hashtag: '#contabilidade #financeiro #gestao #inteligenciaartificial #automacao',
    trigger: 'quando a rotina mensal repete a mesma cobrança e os mesmos atrasos',
    proof: 'menos pendências, prazos visíveis e fechamento mais previsível',
    visualCue: 'finance',
    examples: ['documentos mensais', 'cobranças', 'conciliação', 'alertas']
  },
  {
    id: 'servicos',
    keywords: ['consultoria', 'servico', 'serviço', 'servicos', 'serviços', 'agencia', 'agência', 'prestador', 'proposta', 'orcamento', 'orçamento'],
    area: 'Serviços profissionais',
    pain: 'briefing, proposta e follow-up dependem demais da memória de quem vende',
    process: 'briefing, escopo, prazo, proposta, objeção, aprovação e entrega',
    gain: 'vender serviço com mais contexto e menos retrabalho',
    hashtag: '#servicos #consultoria #vendas #inteligenciaartificial #automacao',
    trigger: 'quando cada proposta nasce do zero e o follow-up fica solto',
    proof: 'propostas mais rápidas, histórico salvo e próximos passos claros',
    visualCue: 'services',
    examples: ['briefing', 'propostas', 'follow-up', 'entrega']
  }
];

const PROFILE_ROTATION_TOPICS = new Map([
  ...INDUSTRY_SPECIALISTS.map((industry) => [industry.id, industry]),
  ...AUTO_CONTENT_TOPICS.map((topic) => [
    normalizeSearchText(topic.area),
    {
      id: normalizeSearchText(topic.area),
      area: topic.area,
      pain: topic.pain,
      process: topic.process,
      gain: topic.gain,
      hashtag: topic.hashtag,
      trigger: `quando ${topic.pain}`,
      proof: topic.gain,
      examples: []
    }
  ])
]);

const ENGAGEMENT_INTELLIGENCE = {
  eyebrowHooks: [
    'Para salvar',
    'Insight prático',
    'Atenção',
    'Aplicação real',
    'Antes de automatizar',
    'Decisão'
  ],
  titleClosers: [
    'O ponto é simples:',
    'Veja o que muda:',
    'Na prática:',
    'O ganho aparece aqui:',
    'O erro comum é este:'
  ],
  ctas: [
    'Salve este post para revisar antes de automatizar uma rotina.',
    'Envie para alguém que ainda está tentando resolver isso só no esforço manual.',
    'Comente "IA" se você quer transformar essa rotina em processo.',
    'Use este raciocínio como checklist antes de escolher qualquer ferramenta.'
  ],
  captionAngles: [
    'Leitura do dia: procure onde o trabalho ainda depende de memória e improviso.',
    'Ponto de atenção: ferramenta sem processo claro costuma apenas acelerar a bagunça.',
    'Aplicação prática: comece por uma rotina pequena, repetida e fácil de medir.',
    'Sinal de oportunidade: quando a equipe repete a mesma pergunta, existe fluxo para organizar.',
    'Pergunta para gestão: qual parte da operação perde contexto toda semana?',
    'Ajuste de processo: antes de automatizar, escreva regra, responsável e próximo passo.',
    'Ideia para revisar: o melhor ganho aparece quando a IA protege padrão, não só velocidade.',
    'Rotina que merece sistema: tudo que volta todo dia precisa deixar rastro e critério.',
    'Antes de escolher ferramenta: defina qual erro a automação precisa reduzir.',
    'Critério para decidir: se não dá para medir antes e depois, ainda é só experimento.',
    'O detalhe que muda a operação: contexto salvo vale mais que resposta rápida e solta.',
    'Diagnóstico rápido: observe onde o cliente espera porque alguém está procurando informação.',
    'Próximo passo possível: transforme uma tarefa repetida em checklist antes de pedir IA.'
  ],
  visualVariants: ['focus', 'numbered', 'quote', 'signal']
};

const ORGANIC_DISCOVERY_STRATEGIES = [
  { id: 'conversation', primarySignal: 'comentarios', hook: 'Se isso acontece na sua empresa, você não está sozinho.', prompt: 'Qual etapa mais trava sua rotina hoje? Conte um exemplo nos comentários.', cta: 'Comente a etapa que mais pesa. Vou usar as respostas para aprofundar os próximos conteúdos.' },
  { id: 'save', primarySignal: 'salvamentos', hook: 'Este é um diagnóstico rápido para aplicar ainda hoje.', prompt: 'Antes de automatizar, revise: problema, responsável, regra e resultado esperado.', cta: 'Salve este post e use esses quatro pontos na próxima revisão de processo.' },
  { id: 'share', primarySignal: 'compartilhamentos', hook: 'Uma decisão simples pode poupar retrabalho de uma equipe inteira.', prompt: 'Quem precisa participar dessa conversa para a mudança sair do papel?', cta: 'Envie para a pessoa que pode ajudar a transformar essa rotina em processo.' },
  { id: 'new-audience', primarySignal: 'alcance de nao seguidores', hook: 'Para quem lidera uma empresa e ainda depende de tarefas manuais todos os dias.', prompt: 'Você está no começo da automação ou já tem algum processo funcionando?', cta: 'Responda "começando" ou "em andamento" nos comentários.' }
];

const FINAL_SLIDE_CALL_CTA = {
  eyebrow: 'Material gratuito',
  title: 'Comente IA para receber.',
  body: '🚀 50 PROMPTS DE IA GRÁTIS! Escreva IA nos comentários e confira o material no seu Direct.'
};

const FREE_PROMPTS_CTA = `Preparei uma seleção com 50 prompts prontos para ajudar você a:

✨ Criar conteúdos para Instagram
📈 Fazer marketing digital
💰 Aumentar suas vendas
📝 Escrever textos persuasivos
🤖 Usar ChatGPT, Claude e outras IAs como um profissional
⚡ Economizar horas de trabalho

O melhor de tudo?

🎁 É totalmente GRATUITO!

👇 Como receber:
1️⃣ Comente IA
2️⃣ Siga o perfil
3️⃣ Acesse o link da bio para baixar.

💬 Marque um amigo que precisa aprender IA.
💾 Salve este post para não perder.
📤 Compartilhe nos seus stories.`;

const FREE_PROMPTS_CTA_MARKER = 'Preparei uma seleção com 50 prompts prontos para ajudar você a:';
const RADAR_MATERIAL_CTA = 'Quer receber 50 prompts prontos para aplicar IA no trabalho?\n\nComente IA e eu envio o material no seu Direct.';
const LEGACY_FREE_PROMPTS_CTA = 'Comente IA para receber 🚀 50 PROMPTS DE IA GRÁTIS!';
const DEFAULT_INSTAGRAM_HASHTAGS = '#automacao #inteligenciaartificial #iaaplicada #gestao #processos #produtividade #transformacaodigital #negocios';
const INSTAGRAM_CAPTION_MAX_LENGTH = 2100;

function withFreePromptsCtaAtEnd(caption = '') {
  const withoutLegacyCta = String(caption).replace(LEGACY_FREE_PROMPTS_CTA, '').replace(/\n{3,}/g, '\n\n').trim();
  const { body, hashtags } = splitCaptionParts(withoutLegacyCta);
  const markerIndex = body.indexOf(FREE_PROMPTS_CTA_MARKER);
  const withoutExistingCta = markerIndex === -1
    ? body
    : body.slice(0, markerIndex).trim();
  return [withoutExistingCta, FREE_PROMPTS_CTA, hashtags].filter(Boolean).join('\n\n');
}

const CONTENT_GOALS = {
  authority: {
    label: 'Autoridade',
    eyebrowHooks: ['Ponto de vista', 'Autoridade', 'Critério', 'Experiência real'],
    captionAngles: [
      'Ângulo de autoridade: mostre o critério antes de mostrar a ferramenta.',
      'Sinal de maturidade: quem entende o processo decide melhor onde aplicar IA.',
      'Ponto de vista da marca: automação boa começa com diagnóstico, não com pressa.'
    ],
    ctas: [
      'Salve este post como referência para discutir IA com mais critério.',
      'Envie para alguém que precisa decidir com mais clareza antes de automatizar.'
    ]
  },
  leads: {
    label: 'Captação de leads',
    eyebrowHooks: ['Oportunidade', 'Lead qualificado', 'Próxima conversa', 'Sinal de demanda'],
    captionAngles: [
      'Ângulo de lead: quando a dor aparece com frequência, existe conversa comercial para abrir.',
      'Sinal para captação: transforme dúvida repetida em convite para diagnóstico.',
      'Ponto comercial: conteúdo bom reduz atrito antes do primeiro contato.'
    ],
    ctas: [
      'Chame no direct com a palavra IA para mapear uma rotina que pode virar sistema.',
      'Envie uma mensagem se você quer identificar onde a IA pode gerar resultado primeiro.'
    ]
  },
  offer: {
    label: 'Oferta ou lançamento',
    eyebrowHooks: ['Oferta clara', 'Decisão', 'Momento de agir', 'Aplicação'],
    captionAngles: [
      'Ângulo de oferta: deixe claro o problema, o ganho e o próximo passo.',
      'Ponto de decisão: uma oferta funciona melhor quando resolve uma dor concreta.',
      'Sinal de compra: quando o custo do improviso fica visível, a solução ganha urgência.'
    ],
    ctas: [
      'Fale comigo para entender como aplicar isso na sua empresa.',
      'Peça uma análise rápida para ver se essa automação faz sentido no seu cenário.'
    ]
  },
  personalBrand: {
    label: 'Marca pessoal',
    eyebrowHooks: ['Bastidor', 'Opinião', 'Aprendizado', 'Experiência'],
    captionAngles: [
      'Ângulo de marca pessoal: opinião forte com exemplo real cria memória.',
      'Bastidor útil: conte o que você aprendeu observando a operação por dentro.',
      'Ponto humano: autoridade cresce quando a experiência vira orientação prática.'
    ],
    ctas: [
      'Comente se essa visão também aparece na sua rotina.',
      'Envie para alguém que acompanha esse tema e quer pensar com mais profundidade.'
    ]
  },
  reactivation: {
    label: 'Reativação',
    eyebrowHooks: ['Retomada', 'Volte a olhar', 'Ainda dá tempo', 'Nova chance'],
    captionAngles: [
      'Ângulo de reativação: às vezes o problema não sumiu, só ficou parado esperando decisão.',
      'Sinal de retomada: uma pequena melhoria pode reabrir uma conversa que esfriou.',
      'Ponto de reentrada: mostre uma oportunidade simples para voltar ao assunto.'
    ],
    ctas: [
      'Se isso ainda está parado aí, me chame para retomar com um primeiro passo simples.',
      'Envie para quem precisa voltar a olhar para essa rotina antes que ela pese mais.'
    ]
  }
};

const ANATEX_COPY_RULES = {
  replacements: [
    [/\bN[aã]o [ée] sobre tirar humanidade\.\s*[ÉE]\s*sobre liberar a equipe para atender melhor\./gi, 'A tecnologia fica nos bastidores para a equipe atender melhor.'],
    [/\bN[aã]o [ée] sobre ([^.!?\n]+),\s*[ée]\s*sobre ([^.!?\n]+)\./gi, 'O foco sai de $1 e vai para $2.'],
    [/\bisso muda tudo\b/gi, 'isso muda a rotina'],
    [/\bTodo mundo\b/g, 'A equipe'],
    [/\btexto gen[eé]rico\b/gi, 'texto sem voz própria'],
    [/\bmensagem gen[eé]rica\b/gi, 'mensagem sem contexto'],
    [/Toda tarefa que se repete muito merece uma pergunta: por que ainda depende de esforço manual\?/gi, 'Toda tarefa que se repete muito merece virar processo antes de depender de esforço manual.']
  ],
  questionTitles: [
    [/^Seu primeiro atendimento vende confiança ou perde contexto\?$/i, 'O primeiro atendimento precisa vender confiança e preservar contexto.'],
    [/^Sua venda termina na reunião ou começa depois dela\?$/i, 'A venda continua depois da reunião.'],
    [/^Seu financeiro controla ou só descobre depois\?$/i, 'O financeiro precisa enxergar antes da urgência.'],
    [/^Seu atendimento tem memória\?$/i, 'Atendimento bom tem memória.'],
    [/^Seu relatório informa ou ajuda a decidir\?$/i, 'Relatório bom ajuda a decidir.'],
    [/^Você atende leads ou escolhe prioridades\?$/i, 'Lead bom precisa virar prioridade clara.'],
    [/^Sua empresa sabe o que sabe\?$/i, 'A empresa precisa organizar o que sabe.'],
    [/^Quantas marcações sua clínica perde por falta de fluxo\?$/i, 'Clínicas perdem marcações quando falta fluxo.'],
    [/^Sua equipe está ocupada ou organizada\?$/i, 'Equipe ocupada precisa virar equipe organizada.'],
    [/^Seu pós-venda fideliza ou só apaga incêndio\?$/i, 'Pós-venda bom fideliza antes de apagar incêndio.'],
    [/^Seu cliente acompanha o projeto ou adivinha\?$/i, 'Cliente bom acompanhado não precisa adivinhar o projeto.'],
    [/^Sua rotina mensal ainda depende de memória\?$/i, 'Rotina mensal não pode depender de memória.'],
    [/^Você lidera a empresa ou segura a fila\?$/i, 'Liderança precisa sair da fila operacional.'],
    [/^Qual rotina da sua empresa já deveria virar sistema\?$/i, 'Toda empresa tem uma rotina pronta para virar sistema.']
  ]
};

const CREATIVE_EDITORIAL_ANGLES = [
  {
    label: 'Gargalo invisível',
    title: (topic) => `O problema escondido ${topic.areaIn || `em ${topic.area}`}.`,
    opener: (topic) => `${topic.areaIn ? `O prejuízo ${topic.areaIn}` : `Em ${topic.area}, o prejuízo`} quase nunca aparece como "falta de IA". Ele aparece quando ${topic.pain}.`,
    slide2Title: (topic) => `O sintoma: ${topic.pain}.`,
    slide3Title: 'Antes da ferramenta, vem o mapa.',
    slide4Title: 'Escolha uma rotina para testar.',
    slide5Title: (topic) => `Menos improviso em ${topic.area}.`,
    caption: (topic, angle, context, sequence, runLine) => `Há um gargalo que costuma passar batido ${topic.areaIn || `em ${topic.area}`}.\n\nEle aparece quando ${topic.pain}. A equipe sente como correria, retrabalho ou resposta atrasada.\n\nAntes de pensar em ferramenta, escolha uma rotina pequena, escreva o passo a passo e defina o que precisa ser conferido.\n\n${angle.action}\n\nObserve este sinal: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: IA boa começa em rotina bem descrita.\n\n${topic.hashtag}`
  },
  {
    label: 'Checklist',
    title: (topic) => `${topic.areaTitle || topic.area}: 3 pontos para arrumar antes da IA.`,
    opener: (topic) => `Se ${topic.pain}, a primeira automação não precisa ser grande. Ela precisa ser clara.`,
    slide2Title: '1. Onde a conversa começa.',
    slide3Title: '2. Quem confere a informação.',
    slide4Title: '3. Qual resposta vira padrão.',
    slide5Title: 'Comece pelo menor fluxo.',
    caption: (topic, angle, context, sequence, runLine) => `Checklist rápido para ${topic.area}.\n\n1. Onde a demanda entra.\n2. Quem confere a informação.\n3. Qual resposta pode virar padrão.\n\nSe hoje ${topic.pain}, esse mapa já mostra onde a IA pode ajudar sem bagunçar a operação.\n\n${angle.action}\n\nPonto para acompanhar: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: menos promessa, mais processo.\n\n${topic.hashtag}`
  },
  {
    label: 'Erro caro',
    title: (topic) => `O erro caro que aparece ${topic.areaIn || `em ${topic.area}`}.`,
    opener: (topic) => `O custo não está só no tempo perdido. Está na decisão tomada com informação incompleta.`,
    slide2Title: (topic) => `Quando ${topic.pain}, alguém paga a conta.`,
    slide3Title: 'A IA precisa de critério.',
    slide4Title: 'Transforme repetição em alerta.',
    slide5Title: 'Automação boa evita surpresa.',
    caption: (topic, angle, context, sequence, runLine) => `Existe um erro caro ${topic.areaIn || `em ${topic.area}`}: tratar rotina repetida como se fosse caso isolado.\n\nQuando ${topic.pain}, a empresa perde tempo, contexto e oportunidade.\n\nA saída começa com critério: o que entra, o que precisa ser conferido e qual resposta não pode depender da memória.\n\n${angle.action}\n\nMétrica simples: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: automação serve para reduzir surpresa.\n\n${topic.hashtag}`
  },
  {
    label: 'Roteiro prático',
    title: (topic) => `Um teste de 30 minutos para ${topic.area}.`,
    opener: (topic) => `Pegue uma demanda real da semana e acompanhe do começo ao fim. O ponto fraco aparece rápido.`,
    slide2Title: 'Anote a primeira pergunta.',
    slide3Title: 'Marque onde trava.',
    slide4Title: 'Padronize só uma resposta.',
    slide5Title: 'Depois pense em escala.',
    caption: (topic, angle, context, sequence, runLine) => `Teste simples para ${topic.area}.\n\nSepare 30 minutos e acompanhe uma demanda real: de onde veio, quem respondeu, onde travou e o que ficou sem registro.\n\nSe você identificar que ${topic.pain}, encontrou um bom primeiro fluxo para automatizar.\n\n${angle.action}\n\nValide com este sinal: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: comece pequeno para crescer certo.\n\n${topic.hashtag}`
  },
  {
    label: 'Antes e depois',
    title: (topic) => `${topic.areaTitle || topic.area} antes e depois de organizar o fluxo.`,
    opener: (topic) => `Antes, cada pessoa resolve do seu jeito. Depois, a operação tem contexto, padrão e acompanhamento.`,
    slide2Title: 'Antes: resposta solta.',
    slide3Title: 'Durante: processo visível.',
    slide4Title: 'Depois: IA com contexto.',
    slide5Title: (topic) => `O ganho aparece em ${topic.gain}.`,
    caption: (topic, angle, context, sequence, runLine) => `Antes e depois ${topic.areaIn || `em ${topic.area}`}.\n\nAntes: ${topic.pain}.\nDepois: entrada clara, informação registrada, resposta padronizada e acompanhamento simples.\n\nÉ aí que a IA deixa de ser novidade e vira apoio real na rotina.\n\n${angle.action}\n\nProcure este sinal: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: clareza antes de escala.\n\n${topic.hashtag}`
  },
  {
    label: 'Bastidor',
    title: (topic) => `Bastidores: ${topic.areaTitle || topic.area}.`,
    opener: (topic) => `Cliente vê velocidade. A equipe sente alívio. Mas o que sustenta isso é bastidor bem organizado.`,
    slide2Title: (topic) => `O bastidor quebra quando ${topic.pain}.`,
    slide3Title: 'Documente o caminho real.',
    slide4Title: 'Deixe a IA apoiar o repetitivo.',
    slide5Title: 'A experiência melhora fora da tela.',
    caption: (topic, angle, context, sequence, runLine) => `O resultado melhora quando existe um bastidor organizado ${topic.areaIn || `em ${topic.area}`}.\n\nEsse bastidor reúne registro, triagem, resposta, acompanhamento e conferência.\n\nQuando ${topic.pain}, a IA pode ajudar, mas só depois que esse caminho está visível.\n\n${angle.action}\n\nAcompanhe: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: bastidor organizado vende melhor.\n\n${topic.hashtag}`
  }
];

function creativeEditorialAngle(dateString, slotIndex, sequence = 0) {
  return CREATIVE_EDITORIAL_ANGLES[
    ((daysSinceEpoch(dateString) * 5) + (slotIndex * 3) + Math.floor(slotIndex / 6) + sequence) % CREATIVE_EDITORIAL_ANGLES.length
  ];
}

function callMaybe(value, ...args) {
  return typeof value === 'function' ? value(...args) : value;
}

function estimateTextLines(text = '', width = 400, fontSize = 30) {
  const avgCharWidth = fontSize * 0.54;
  const charsPerLine = Math.max(12, Math.floor(width / avgCharWidth));
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  let lines = 1;
  let current = 0;
  for (const word of words) {
    const length = word.length + (current ? 1 : 0);
    if (current + length > charsPerLine) {
      lines += 1;
      current = word.length;
    } else {
      current += length;
    }
  }
  return lines;
}

function splitCreativeDescription(text = '') {
  const clean = applyAnatexCopyRules(text).replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/(?<=[.!])\s+/).filter(Boolean);
  const first = sentences[0] || clean;
  const rest = sentences.slice(1).join(' ');
  const words = first.split(' ').filter(Boolean);
  const leadWords = Math.min(4, Math.max(2, Math.floor(words.length / 3)));
  const lead = words.slice(0, leadWords).join(' ');
  const remaining = words.slice(leadWords);
  const emphasisLimit = remaining.length <= 7 ? remaining.length : 5;
  let emphasisWords = remaining.slice(0, emphasisLimit);
  let closeWords = remaining.slice(emphasisLimit);
  if (!rest && closeWords.length && emphasisWords.length && emphasisWords.at(-1).length <= 2) {
    closeWords.unshift(emphasisWords.pop());
  }
  const emphasis = emphasisWords.length ? emphasisWords.join(' ') : first;
  // A arte precisa de uma ideia completa, não de um parágrafo comprimido.
  // A explicação inteira continua na legenda; no cartão fica somente o
  // fechamento da primeira frase, que é legível em fonte grande no celular.
  let close = closeWords.join(' ').trim();
  if (close.split(' ').filter(Boolean).length < 4 && rest) {
    close = rest.split(/(?<=[.!])\s+/)[0].trim();
  }
  return { lead, emphasis, close };
}

function autoPack(topic, angle, context, sequence, runStamp = null, dateString = todaySaoPaulo(), slotIndex = 0) {
  const runLine = runStamp ? `\n\nEdição operacional ${runStamp}.` : '';
  const editorial = creativeEditorialAngle(dateString, slotIndex, sequence);
  const editorialLabel = callMaybe(editorial.label, topic, angle, context);
  const sectionLabelSets = [
    ['Onde aperta', 'Como organizar', 'Na prática', 'Um passo possível'],
    ['O sinal', 'Colocando em ordem', 'Hora de testar', 'Para começar'],
    ['O que observar', 'Por trás do processo', 'Aplicação real', 'Próxima decisão'],
    ['Antes de automatizar', 'O caminho', 'No dia a dia', 'Comece daqui'],
    ['O problema real', 'Arrumando a casa', 'Teste pequeno', 'O que acompanhar'],
    ['Ponto de atenção', 'Dando contexto', 'Saindo do papel', 'Sua vez']
  ];
  const sectionLabels = sectionLabelSets[((daysSinceEpoch(dateString) * 7) + slotIndex + sequence) % sectionLabelSets.length];
  return {
    autoGenerated: true,
    slides: [
      {
        eyebrow: editorialLabel,
        title: callMaybe(editorial.title, topic, angle, context),
        body: callMaybe(editorial.opener, topic, angle, context),
        visualCue: topic.visualCue || 'business'
      },
      {
        eyebrow: sectionLabels[0],
        title: callMaybe(editorial.slide2Title, topic, angle, context),
        body: `Isso fica mais claro ${context.trigger}.`,
        visualCue: topic.visualCue || 'business'
      },
      {
        eyebrow: sectionLabels[1],
        title: callMaybe(editorial.slide3Title, topic, angle, context),
        body: `Organize ${topic.process}. Depois disso, a tecnologia consegue trabalhar com contexto.`,
        visualCue: topic.visualCue || 'business'
      },
      {
        eyebrow: sectionLabels[2],
        title: callMaybe(editorial.slide4Title, topic, angle, context),
        body: angle.insight,
        visualCue: topic.visualCue || 'business'
      },
      {
        eyebrow: sectionLabels[3],
        title: callMaybe(editorial.slide5Title, topic, angle, context),
        body: `Procure ${context.proof}.`,
        visualCue: topic.visualCue || 'business'
      }
    ],
    caption: editorial.caption(topic, angle, context, sequence, runLine)
  };
}

function splitCaptionParts(caption = '') {
  const lines = String(caption).trim().split(/\r?\n/);
  const hashtagLines = lines.filter((line) => line.trim().startsWith('#'));
  const bodyLines = lines.filter((line) => !line.trim().startsWith('#'));
  return {
    body: bodyLines.join('\n').trim(),
    hashtags: hashtagLines.join('\n').trim()
  };
}

function normalizeCaptionBlocks(caption = '') {
  return String(caption || '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function fitInstagramCaption(caption = '', pack = {}) {
  const clean = normalizeCaptionBlocks(caption).join('\n\n');
  if (clean.length <= INSTAGRAM_CAPTION_MAX_LENGTH) return clean;

  const hashtags = splitCaptionParts(clean).hashtags || DEFAULT_INSTAGRAM_HASHTAGS;
  const sourceTitle = String(pack?.research?.sourceTitle || '').trim();
  const sourceUrl = String(pack?.research?.sourceUrl || '').trim();
  const requiredBlocks = [
    sourceTitle ? `Título original: ${sourceTitle}` : '',
    sourceUrl ? `Fonte oficial: ${sourceUrl}` : '',
    RADAR_MATERIAL_CTA,
    hashtags
  ].filter(Boolean);
  const requiredText = requiredBlocks.join('\n\n');
  const maxBodyLength = Math.max(280, INSTAGRAM_CAPTION_MAX_LENGTH - requiredText.length - 4);
  const bodyBlocks = normalizeCaptionBlocks(clean)
    .filter((block) => !block.startsWith('#'))
    .filter((block) => !block.includes(FREE_PROMPTS_CTA_MARKER))
    .filter((block) => block !== RADAR_MATERIAL_CTA)
    .filter((block) => !sourceUrl || !block.includes(sourceUrl))
    .filter((block) => !sourceTitle || !block.includes(sourceTitle));
  const fittedBody = [];
  let bodyLength = 0;
  for (const block of bodyBlocks) {
    const separator = fittedBody.length ? 2 : 0;
    if (bodyLength + separator + block.length <= maxBodyLength) {
      fittedBody.push(block);
      bodyLength += separator + block.length;
      continue;
    }
    const room = maxBodyLength - bodyLength - separator;
    if (room >= 80) fittedBody.push(compactSentence(block, room));
    break;
  }
  let fitted = [...fittedBody, ...requiredBlocks].filter(Boolean).join('\n\n');
  // Fontes com títulos longos e CTAs obrigatórios podem deixar a estimativa
  // inicial alguns caracteres acima do teto. Reduza apenas o último bloco
  // editorial; título, URL, CTA e hashtags permanecem intactos.
  while (fitted.length > INSTAGRAM_CAPTION_MAX_LENGTH && fittedBody.length) {
    const last = fittedBody.pop();
    const excess = fitted.length - INSTAGRAM_CAPTION_MAX_LENGTH;
    const reducedLength = Math.max(0, last.length - excess - 4);
    if (reducedLength >= 80) fittedBody.push(compactSentence(last, reducedLength));
    fitted = [...fittedBody, ...requiredBlocks].filter(Boolean).join('\n\n');
  }
  if (fitted.length > INSTAGRAM_CAPTION_MAX_LENGTH) {
    throw new Error(`Legenda excede o limite seguro do Instagram (${fitted.length}/${INSTAGRAM_CAPTION_MAX_LENGTH}; blocos obrigatorios: ${requiredBlocks.map((block) => block.length).join(',')}).`);
  }
  return fitted;
}

function compactSentence(text = '', maxLength = 132) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength);
  return `${sliced.slice(0, Math.max(0, sliced.lastIndexOf(' '))).trim()}.`;
}

function applyAnatexCopyRules(text = '') {
  let next = String(text || '').replace(/[—–]/g, '-');
  for (const [pattern, replacement] of ANATEX_COPY_RULES.replacements) {
    next = next.replace(pattern, replacement);
  }
  return next.replace(/\?/g, '.');
}

function anatexTitle(title = '') {
  let next = applyAnatexCopyRules(title).trim();
  for (const [pattern, replacement] of ANATEX_COPY_RULES.questionTitles) {
    if (pattern.test(next)) return replacement;
  }
  if (/\?$/.test(next)) {
    next = next
      .replace(/^Você já\s+/i, 'Quando você ')
      .replace(/^Você\s+/i, '')
      .replace(/^Seu\s+/i, 'O seu ')
      .replace(/^Sua\s+/i, 'A sua ')
      .replace(/\?$/, '.');
  }
  return next;
}

function sanitizePackForAnatexStyle(pack = {}) {
  const next = JSON.parse(JSON.stringify(pack));
  next.slides = (next.slides || []).map((slide) => ({
    ...slide,
    eyebrow: applyAnatexCopyRules(slide.eyebrow || ''),
    title: anatexTitle(slide.title || ''),
    body: applyAnatexCopyRules(slide.body || '')
  }));
  next.caption = applyAnatexCopyRules(next.caption || '')
    .split(/\n{3,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n\n');
  return next;
}

function engagementVariant(dateString, slotIndex, offset = 0) {
  return ENGAGEMENT_INTELLIGENCE.visualVariants[
    pickDailyIndex(ENGAGEMENT_INTELLIGENCE.visualVariants, dateString, slotIndex + offset)
  ];
}

function contentGoalFromAccount(account = {}) {
  const goal = account.contentProfile?.goal || 'authority';
  return CONTENT_GOALS[goal] || CONTENT_GOALS.authority;
}

function isIhcHanahEnabled(account = {}) {
  return Boolean(account.contentProfile?.storyMethod?.ihcHanahEnabled);
}

function shortWords(text = '', maxWords = 15) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  return words.slice(0, maxWords).join(' ');
}

function sourceReferenceForCaption(pack = {}) {
  if (!pack.research?.sourceUrl) return '';
  const source = String(pack.research.source || 'Fonte oficial').trim();
  const sourceTitle = String(pack.research.sourceTitle || '').trim();
  const sourceUrl = String(pack.research.sourceUrl || '').trim();
  return [
    `Fonte consultada: ${source}`,
    sourceTitle ? `Título original: ${sourceTitle}` : '',
    sourceUrl
  ].filter(Boolean).join('\n');
}

function applyIhcHanahMethod(pack = {}, account = {}, dateString = todaySaoPaulo(), slotIndex = 0, publishMode = 'feed-and-story') {
  const next = JSON.parse(JSON.stringify(pack));
  const source = String(next.research?.source || '').trim();
  const sourceTitle = String(next.research?.sourceTitle || next.slides?.[0]?.title || '').trim();
  const sourceFacts = Array.isArray(next.research?.sourceFacts) && next.research.sourceFacts.length
    ? next.research.sourceFacts
    : [next.research?.sourceFact, next.slides?.[1]?.title, next.slides?.[2]?.title].filter(Boolean);
  const fact = compactSentence(sourceFacts[0] || next.slides?.[0]?.body || 'uma rotina importante fica pesada quando depende de improviso.', 150);
  const secondFact = compactSentence(sourceFacts[1] || 'o problema aparece quando a equipe precisa decidir rápido sem contexto suficiente.', 145);
  const audience = String(account.contentProfile?.audience || 'donos e gestores').split(',')[0].trim() || 'donos e gestores';
  const offer = String(account.contentProfile?.offer || 'consultoria e automações com IA').trim();
  const hooks = [
    'Você sente que trabalha muito e mesmo assim a operação escapa?',
    'Tem tarefa que parece pequena, mas drena a equipe inteira?',
    'Seu time responde rápido, mas ainda perde contexto no caminho?',
    'A rotina cresceu e ninguém percebeu onde ela começou a pesar?'
  ];
  const hook = shortWords(hooks[pickDailyIndex(hooks, dateString, slotIndex)], 15);
  const realisticScene = source
    ? `Uma cena comum: ${audience} leem uma notícia da ${source} e percebem que a pressão por IA já chegou na rotina.`
    : `Uma cena comum: ${audience} começam o dia tentando resolver tudo no improviso.`;
  const story = [
    realisticScene,
    'No começo, parece só mais uma demanda. Uma mensagem chega, outra fica parada e alguém tenta lembrar o combinado.',
    'A equipe se esforça, mas o processo não ajuda. O problema não é falta de vontade; é falta de caminho visível.',
    `A virada aparece quando a história encontra um sinal concreto: ${fact}`
  ];
  const content = [
    'O aprendizado é simples: antes de pedir mais velocidade, desenhe a rotina que está travando.',
    `Transforme de improviso para fluxo: entrada clara, regra de decisão, responsável e revisão humana.`,
    `Se o tema é ${sourceTitle || 'IA aplicada'}, comece pequeno e meça se reduziu espera, erro ou retrabalho.`
  ];
  const cta = `Comente IA ou chame no Direct para mapear uma rotina que pode virar sistema.`;
  const isReel = publishMode === 'reel-only' || publishMode === 'reel-and-story';
  const items = isReel
    ? [
      ['IDENTIFICAÇÃO', hook, 'Se isso já aconteceu na sua empresa, este conteúdo é para você.'],
      ['HISTÓRIA', 'A rotina começou pequena.', story[0]],
      ['HISTÓRIA', 'Depois virou urgência.', story[1]],
      ['HISTÓRIA', 'O esforço não bastou.', story[2]],
      ['HISTÓRIA', 'A descoberta veio do sinal.', story[3]],
      ['CONTEÚDO', 'Primeiro, desenhe o caminho.', content[0]],
      ['CONTEÚDO', 'Depois, defina o critério.', content[1]],
      ['CONTEÚDO', 'Por fim, acompanhe o ganho.', content[2]],
      ['AÇÃO', 'Quer aplicar isso sem adivinhar?', cta]
    ]
    : [
      ['IDENTIFICAÇÃO', hook, 'Se isso já aconteceu na sua empresa, este carrossel é para você.'],
      ['HISTÓRIA', 'A rotina começou pequena.', story[0]],
      ['HISTÓRIA', 'Depois virou urgência.', story[1]],
      ['HISTÓRIA', 'O time tentou compensar.', 'Mais mensagem, mais reunião, mais cobrança. Só que esforço sem processo cansa rápido.'],
      ['HISTÓRIA', 'A descoberta veio do sinal.', story[3]],
      ['CONTEÚDO', 'Nomeie a dor.', 'Escolha uma rotina específica: atendimento, proposta, cobrança, relatório ou suporte.'],
      ['CONTEÚDO', 'Desenhe o caminho.', content[0]],
      ['CONTEÚDO', 'Defina o critério.', content[1]],
      ['CONTEÚDO', 'Meça a transformação.', content[2]],
      ['AÇÃO', 'Quer transformar uma rotina em sistema?', cta]
    ];
  next.slides = items.map(([eyebrow, title, body]) => ({
    eyebrow,
    title,
    body,
    ihcMethod: 'hanah',
    researchSource: next.research?.source || '',
    researchTitle: next.research?.sourceTitle || '',
    researchDisplayTitle: title,
    researchUrl: next.research?.sourceUrl || ''
  }));
  const sourceReference = sourceReferenceForCaption(next);
  next.caption = [
    hook,
    'História:',
    ...story,
    'Conteúdo:',
    ...content,
    cta,
    sourceReference,
    DEFAULT_INSTAGRAM_HASHTAGS
  ].filter(Boolean).join('\n\n');
  next.ihcHanahMethod = {
    enabled: true,
    format: isReel ? 'reels-9-takes' : 'carousel-10-cards',
    appliedAt: new Date().toISOString()
  };
  return next;
}

function applyBottiniVoice(enhancement, account = {}) {
  const config = account.contentProfile?.bottiniVoice || {};
  const pack = enhancement?.pack;
  if (!config.enabled || !pack || pack.research?.sourceUrl) return enhancement;

  const words = (Array.isArray(config.words) ? config.words : [])
    .map((item) => String(item || '').trim()).filter(Boolean);
  const available = words.length ? words : ['incrível', 'sensacional', 'excelente', 'imperdível', 'isso tem qualidade'];
  const searchable = [pack.caption, ...(pack.slides || []).flatMap((slide) => [slide.title, slide.body])].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
  const promotion = /promoção|oferta|desconto|lançamento/.test(searchable);
  const product = /produto|celular|serviço|solução/.test(searchable);
  const preferredPatterns = promotion ? [/imperd/i, /sensacion/i] : product ? [/incr[ií]vel/i, /excelente/i] : [/sensacion/i, /qualidade/i, /excelente/i];
  const word = preferredPatterns.map((pattern) => available.find((item) => pattern.test(item))).find(Boolean) || available[0];
  const phrase = promotion
    ? `Atenção: esta oportunidade é ${word}.`
    : product
      ? `Olha isso: este produto é ${word}.`
      : /isso tem qualidade/i.test(word)
        ? 'Isso tem qualidade.'
        : `Olha isso: é ${word}.`;
  const next = JSON.parse(JSON.stringify(pack));
  if (!String(next.caption || '').toLocaleLowerCase('pt-BR').includes(word.toLocaleLowerCase('pt-BR'))) {
    next.caption = `${phrase}\n\n${next.caption || ''}`.trim();
  }
  const intensity = ['low', 'balanced', 'high'].includes(config.intensity) ? config.intensity : 'balanced';
  if (intensity !== 'low' && next.slides?.[0]) next.slides[0].eyebrow = promotion ? 'ATENÇÃO' : 'OLHA ISSO';
  if (intensity === 'high' && next.slides?.[0] && !String(next.slides[0].body || '').toLocaleLowerCase('pt-BR').includes(word.toLocaleLowerCase('pt-BR'))) {
    next.slides[0].body = `${phrase} ${next.slides[0].body || ''}`.trim().slice(0, 190);
  }
  next.bottiniVoice = { enabled: true, intensity, word, appliedAt: new Date().toISOString() };
  return {
    ...enhancement,
    pack: next,
    intelligence: { ...(enhancement.intelligence || {}), bottiniVoice: next.bottiniVoice }
  };
}

function preparePackForPublication(pack, dateString, slotIndex, account = {}, publishMode = 'feed-and-story', options = {}) {
  let enhancement;
  if (options.allowIhc !== false && isIhcHanahEnabled(account)) {
    const ihcPack = applyIhcHanahMethod(pack, account, dateString, slotIndex, publishMode);
    enhancement = {
      pack: ihcPack,
      intelligence: {
        enabled: true,
        version: 1,
        method: 'Método IHC da Hanah',
        strategy: ihcPack.ihcHanahMethod?.format || 'ihc',
        appliedAt: ihcPack.ihcHanahMethod?.appliedAt,
        sourceCopyPreserved: Boolean(ihcPack.research?.sourceUrl)
      }
    };
  } else {
    enhancement = enhancePackForEngagement(pack, dateString, slotIndex, account);
  }
  return applyBottiniVoice(enhancement, account);
}

function enhanceSlide(slide, index, dateString, slotIndex, goal = CONTENT_GOALS.authority, totalSlides = 0) {
  const next = { ...slide };
  if (next.imagePath || next.imageUrl) return next;

  next.visualVariant = engagementVariant(dateString, slotIndex, index);
  if (next.preserveEngagementCopy) return next;
  if (totalSlides > 1 && index === totalSlides - 1 && !next.preserveEngagementCopy) {
    return {
      ...next,
      ...FINAL_SLIDE_CALL_CTA
    };
  }

  if (index === 0) {
    const eyebrowHooks = goal.eyebrowHooks || ENGAGEMENT_INTELLIGENCE.eyebrowHooks;
    next.eyebrow = eyebrowHooks[
      pickDailyIndex(eyebrowHooks, dateString, slotIndex)
    ];
    if (next.body && !/[?!.]$/.test(next.body.trim())) next.body = `${next.body.trim()}.`;
  } else if (next.body && next.body.length > 150) {
    next.body = compactSentence(next.body, 148);
  }

  if (index > 0 && index < 4 && next.title && !next.title.includes(':')) {
    const closer = ENGAGEMENT_INTELLIGENCE.titleClosers[
      pickDailyIndex(ENGAGEMENT_INTELLIGENCE.titleClosers, dateString, slotIndex + index)
    ];
    next.body = `${closer} ${next.body || ''}`.trim();
  }

  return next;
}

function organicDiscoveryStrategy(dateString, slotIndex) {
  return ORGANIC_DISCOVERY_STRATEGIES[pickDailyIndex(ORGANIC_DISCOVERY_STRATEGIES, dateString, slotIndex)];
}

function enhanceCaption(caption, dateString, slotIndex, goal = CONTENT_GOALS.authority, discovery = organicDiscoveryStrategy(dateString, slotIndex)) {
  const { body, hashtags } = splitCaptionParts(caption);
  const markerIndex = body.indexOf(FREE_PROMPTS_CTA_MARKER);
  const withoutCta = markerIndex === -1 ? body : body.slice(0, markerIndex).trim();
  const angles = [...(goal.captionAngles || []), ...ENGAGEMENT_INTELLIGENCE.captionAngles];
  const angle = angles[pickDailyIndex(angles, dateString, slotIndex)];
  const slotNote = angle;
  const bodyWithAngle = withoutCta.includes(slotNote) ? withoutCta : `${withoutCta}\n\n${slotNote}`;
  const discoveryBlock = [discovery.hook, discovery.prompt, discovery.cta].filter(Boolean).join('\n\n');
  // O Radar pode partir de uma notícia sem hashtags. A legenda precisa sempre
  // terminar com elas, depois do CTA, para preservar descoberta sem misturar
  // tags ao texto principal.
  const finalHashtags = hashtags || DEFAULT_INSTAGRAM_HASHTAGS;
  return [bodyWithAngle.trim(), discoveryBlock, RADAR_MATERIAL_CTA, finalHashtags].filter(Boolean).join('\n\n');
}

function enhancePackForEngagement(pack, dateString, slotIndex, account = {}) {
  if (process.env.INSTAGRAM_TEMPLATE_DISABLE_ENGAGEMENT_AI === 'true') {
    return {
      pack,
      intelligence: {
        enabled: false,
        reason: 'INSTA_TEMPLATE_DISABLE_ENGAGEMENT_AI ativo.'
      }
    };
  }

  const enhanced = JSON.parse(JSON.stringify(pack));
  const goal = contentGoalFromAccount(account);
  const discovery = organicDiscoveryStrategy(dateString, slotIndex);
  const totalSlides = (enhanced.slides || []).length;
  const preserveResearchCopy = Boolean(enhanced.research?.sourceUrl);
  if (preserveResearchCopy) {
    enhanced.slides = (enhanced.slides || []).map((slide, index) => ({
      ...slide,
      ...(slide.imagePath || slide.imageUrl ? {} : { visualVariant: engagementVariant(dateString, slotIndex, index) })
    }));
    enhanced.caption = `${enhanced.caption || ''}\n\n${discovery.hook}\n\n${discovery.prompt}\n\n${discovery.cta}\n\n${RADAR_MATERIAL_CTA}\n\n${DEFAULT_INSTAGRAM_HASHTAGS}`.trim();
    enhanced.engagementIntelligence = {
      version: 3,
      appliedAt: new Date().toISOString(),
      strategy: `fonte preservada + descoberta organica + ${discovery.primarySignal} + variacao visual`,
      discoveryStrategy: discovery.id,
      primarySignal: discovery.primarySignal,
      goal: goal.label,
      sourceCopyPreserved: true,
      visualVariants: enhanced.slides.map((slide) => slide.visualVariant || 'custom-image'),
      captionCtaAdded: enhanced.caption !== pack.caption
    };
    return { pack: enhanced, intelligence: enhanced.engagementIntelligence };
  }
  enhanced.slides = (enhanced.slides || []).map((slide, index) => enhanceSlide(slide, index, dateString, slotIndex, goal, totalSlides));
  enhanced.caption = enhanceCaption(enhanced.caption || '', dateString, slotIndex, goal, discovery);
  if (account.contentProfile?.visualDirection === 'anatex-editorial') {
    Object.assign(enhanced, sanitizePackForAnatexStyle(enhanced));
  }
  enhanced.engagementIntelligence = {
    version: 3,
    appliedAt: new Date().toISOString(),
    strategy: `hook + descoberta organica + ${discovery.primarySignal} + visual variance + ${goal.label}`,
    goal: goal.label,
    discoveryStrategy: discovery.id,
    primarySignal: discovery.primarySignal,
    visualVariants: enhanced.slides.map((slide) => slide.visualVariant || 'custom-image'),
    captionCtaAdded: enhanced.caption !== pack.caption
  };

  return {
    pack: enhanced,
    intelligence: enhanced.engagementIntelligence
  };
}

function buildAutoContentPacks(dateString, slotIndex, runStamp = null) {
  const packs = [];
  for (const [topicIndex, topic] of AUTO_CONTENT_TOPICS.entries()) {
    for (const [angleIndex, angle] of AUTO_CONTENT_ANGLES.entries()) {
      for (const [contextIndex, context] of AUTO_CONTENT_CONTEXTS.entries()) {
        const sequence = (topicIndex * AUTO_CONTENT_ANGLES.length * AUTO_CONTENT_CONTEXTS.length)
          + (angleIndex * AUTO_CONTENT_CONTEXTS.length)
          + contextIndex;
        packs.push(autoPack(topic, angle, context, sequence, runStamp, dateString, slotIndex));
      }
    }
  }
  const start = pickDailyIndex(packs, dateString, slotIndex);
  return [...packs.slice(start), ...packs.slice(0, start)];
}

function uniqueRunStamp(dateString, slotIndex) {
  return `${dateString} slot ${slotIndex} run ${timestampSaoPaulo().slice(11)}`;
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || ''));
}

function buildLastResortPack(dateString, slotIndex) {
  const stamp = uniqueRunStamp(dateString, slotIndex);
  return autoPack(
    AUTO_CONTENT_TOPICS[pickDailyIndex(AUTO_CONTENT_TOPICS, dateString, slotIndex)],
    AUTO_CONTENT_ANGLES[pickDailyIndex(AUTO_CONTENT_ANGLES, dateString, slotIndex + AUTO_CONTENT_TOPICS.length)],
    AUTO_CONTENT_CONTEXTS[pickDailyIndex(AUTO_CONTENT_CONTEXTS, dateString, slotIndex + AUTO_CONTENT_ANGLES.length)],
    AUTO_CONTENT_TOPICS.length * AUTO_CONTENT_ANGLES.length * AUTO_CONTENT_CONTEXTS.length,
    stamp,
    dateString,
    slotIndex
  );
}

function shortPhrase(value = '', fallback = '') {
  const text = String(value || fallback || '').replace(/\s+/g, ' ').trim();
  if (text.length <= 86) return text;
  return `${text.slice(0, 86).replace(/\s+\S*$/, '')}...`;
}

function normalizeSearchText(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectIndustrySpecialist(account = {}) {
  const profile = account.contentProfile || {};
  const brandSummary = account.brandSummary || {};
  const documentAnalysis = account.brandDocument?.analysis || {};
  const haystack = normalizeSearchText([
    account.brandName,
    profile.niche,
    profile.audience,
    profile.offer,
    brandSummary.description,
    brandSummary.positioning,
    brandSummary.differentiator,
    documentAnalysis.summary,
    ...(Array.isArray(documentAnalysis.keywords) ? documentAnalysis.keywords : []),
    ...(Array.isArray(documentAnalysis.signals) ? documentAnalysis.signals : [])
  ].filter(Boolean).join(' '));

  return INDUSTRY_SPECIALISTS.find((industry) => (
    industry.keywords.some((keyword) => haystack.includes(normalizeSearchText(keyword)))
  )) || null;
}

function pickProfileRotationTopic(profile = {}, dateString = todaySaoPaulo(), slotIndex = 0) {
  const rotation = Array.isArray(profile.topicRotation) ? profile.topicRotation : [];
  const ids = rotation.map((item) => normalizeSearchText(item)).filter(Boolean);
  if (!ids.length) return null;
  const selected = ids[pickDailyIndex(ids, dateString, slotIndex)];
  return PROFILE_ROTATION_TOPICS.get(selected) || null;
}

const CLIENTE_X_ESSENCE_TOPICS = [
  {
    id: 'cliente-x-ia-pratica', area: 'a aplicação prática de IA', areaTitle: 'Aplicação prática de IA', areaIn: 'na aplicação prática de IA',
    pain: 'a equipe testa ferramentas, mas ainda não transforma uma rotina real em resultado',
    process: 'problema, rotina, regra, ferramenta, revisão humana e métrica',
    gain: 'tirar a IA do teste e colocá-la para economizar tempo no trabalho',
    hashtag: '#inteligenciaartificial #produtividade #negocios #automacao #gestao', visualCue: 'business',
    examples: ['rotinas administrativas', 'análise', 'documentação', 'decisão']
  },
  {
    id: 'cliente-x-codex', area: 'o uso do Codex', areaTitle: 'Uso do Codex', areaIn: 'no uso do Codex',
    pain: 'tarefas de desenvolvimento e documentação ainda começam do zero',
    process: 'objetivo, contexto do projeto, instrução, execução, teste e revisão',
    gain: 'desenvolver, revisar e documentar projetos com mais velocidade e controle',
    hashtag: '#codex #inteligenciaartificial #desenvolvimento #produtividade #tecnologia', visualCue: 'business',
    examples: ['criação de sistemas', 'revisão de código', 'documentação', 'automação']
  },
  {
    id: 'cliente-x-agentes', area: 'o uso de agentes de IA', areaTitle: 'Agentes de IA', areaIn: 'no uso de agentes de IA',
    pain: 'processos com várias etapas dependem de acompanhamento manual e perdem contexto',
    process: 'objetivo, ferramentas, memória, regras, permissões, logs e supervisão humana',
    gain: 'transformar tarefas encadeadas em operações acompanháveis',
    hashtag: '#agentesdeia #inteligenciaartificial #automacao #processos #negocios', visualCue: 'business',
    examples: ['pesquisa', 'atendimento', 'relatórios', 'tarefas encadeadas']
  },
  {
    id: 'cliente-x-automacao', area: 'a automação empresarial', areaTitle: 'Automação empresarial', areaIn: 'na automação empresarial',
    pain: 'atendimento, vendas e operação repetem tarefas que poderiam virar um fluxo claro',
    process: 'entrada, triagem, registro, resposta, acompanhamento, alerta e indicador',
    gain: 'economizar horas sem perder contexto nem controle humano',
    hashtag: '#automacao #inteligenciaartificial #atendimento #vendas #gestao', visualCue: 'services',
    examples: ['atendimento', 'follow-up', 'propostas', 'relatórios']
  },
  {
    id: 'cliente-x-prompts', area: 'a criação de prompts úteis', areaTitle: 'Prompts úteis', areaIn: 'na criação de prompts úteis',
    pain: 'pedidos genéricos produzem respostas genéricas e pouco aproveitáveis',
    process: 'papel, contexto, tarefa, restrições, formato de saída e exemplo',
    gain: 'obter respostas mais claras, reutilizáveis e próximas do resultado esperado',
    hashtag: '#prompts #inteligenciaartificial #chatgpt #produtividade #ia', visualCue: 'business',
    examples: ['análise', 'conteúdo', 'planejamento', 'atendimento']
  },
  {
    id: 'cliente-x-saas', area: 'a criação de SaaS com IA', areaTitle: 'SaaS com IA', areaIn: 'na criação de SaaS com IA',
    pain: 'uma boa ideia não avança porque falta transformar problema, fluxo e oferta em produto',
    process: 'dor real, público, proposta, protótipo, validação, cobrança e melhoria',
    gain: 'tirar um projeto do papel e aproximá-lo de uma oferta vendável',
    hashtag: '#saas #inteligenciaartificial #empreendedorismo #produto #tecnologia', visualCue: 'business',
    examples: ['MVP', 'validação', 'automação', 'monetização']
  }
];

function profileTopicFromAccount(account = {}, dateString = todaySaoPaulo(), slotIndex = 0) {
  const profile = account.contentProfile || {};
  const brandSummary = account.brandSummary || {};
  const documentAnalysis = account.brandDocument?.analysis || {};
  if (!profile.niche && !profile.audience && !profile.offer && !brandSummary.description && !documentAnalysis.summary) return null;
  const selectedRotationTopic = pickProfileRotationTopic(profile, dateString, slotIndex);
  const clienteXTopic = account.account === 'cliente-x' && !selectedRotationTopic
    ? CLIENTE_X_ESSENCE_TOPICS[pickDailyIndex(CLIENTE_X_ESSENCE_TOPICS, dateString, slotIndex)]
    : null;
  const industry = selectedRotationTopic || clienteXTopic || detectIndustrySpecialist(account);
  const niche = profile.niche || account.brandName || 'negócio';
  const audience = profile.audience || 'clientes';
  const offer = profile.offer || 'solução com IA';
  const tone = profile.tone || 'consultivo';
  const goal = contentGoalFromAccount(account);
  const brandContext = buildBrandContext(account);
  const documentKeywords = Array.isArray(documentAnalysis.keywords) ? documentAnalysis.keywords.slice(0, 5).join(', ') : '';
  const differentiator = shortPhrase(brandSummary.differentiator || documentAnalysis.summary, offer);
  return {
    area: industry?.area || niche,
    areaTitle: industry?.areaTitle || industry?.area || niche,
    areaIn: industry?.areaIn || '',
    pain: industry?.pain || `${shortPhrase(audience, 'clientes')} ainda precisa entender o valor de ${differentiator}`,
    process: industry
      ? `${industry.process}. Oferta da marca: ${shortPhrase(offer, 'solução com IA')}. Tom ${tone}. Contexto: ${brandContext}`
      : `dor do público, promessa, prova, objeções e próximo passo em tom ${tone}. Objetivo dos posts: ${goal.label}. Contexto da empresa: ${brandContext}`,
    gain: industry?.gain || (documentKeywords
      ? `transformar ${documentKeywords} em conversa prática sobre ${offer}`
      : `transformar interesse em conversa sobre ${offer}`),
    hashtag: industry?.hashtag || '#inteligenciaartificial #automacao #marketingdigital #negocios #conteudo',
    industryId: industry?.id || 'perfil',
    industryExamples: industry?.examples || [],
    visualCue: industry?.visualCue || 'business',
    goal: goal.label
  };
}

function buildProfileContentPacks(account, dateString, slotIndex, runStamp = null) {
  const topic = profileTopicFromAccount(account, dateString, slotIndex);
  if (!topic) return [];
  const specialistContext = topic.industryId !== 'perfil'
    ? [{ trigger: `quando ${topic.pain}`, proof: `${topic.gain}; exemplos: ${topic.industryExamples.join(', ')}` }]
    : [];
  const contexts = specialistContext.length ? [...specialistContext, ...AUTO_CONTENT_CONTEXTS] : AUTO_CONTENT_CONTEXTS;
  const packs = [];
  for (const [angleIndex, angle] of AUTO_CONTENT_ANGLES.entries()) {
    for (const [contextIndex, context] of contexts.entries()) {
      const sequence = (angleIndex * contexts.length) + contextIndex;
      packs.push(autoPack(topic, angle, context, sequence, runStamp, dateString, slotIndex));
    }
  }
  const start = pickDailyIndex(packs, dateString, slotIndex);
  return [...packs.slice(start), ...packs.slice(0, start)];
}

function timestampSaoPaulo() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}-${map.hour}${map.minute}${map.second}`;
}

function todaySaoPaulo() {
  return timestampSaoPaulo().slice(0, 10);
}

function daysSinceEpoch(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function pickDaily(items, dateString, slotIndex = 0) {
  return items[pickDailyIndex(items, dateString, slotIndex)];
}

function pickDailyIndex(items, dateString, slotIndex = 0) {
  return (daysSinceEpoch(dateString) + slotIndex) % items.length;
}

function cronToBrtTime(cron) {
  const [minute, hour] = String(cron).split(' ').map(Number);
  const brtHour = (hour + 21) % 24;
  return `${String(brtHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function compactPlanText(text = '', maxLength = 160) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength);
  const cut = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, cut > 80 ? cut : maxLength).trim()}...`;
}

function plannedModeForSlot(account = {}, slotIndex = 0) {
  const reelSlots = new Set((account.reelScheduleSlots || []).map(Number).filter(Number.isInteger));
  return reelSlots.has(Number(slotIndex)) ? 'reel + story' : 'feed + story';
}

function planForAutomaticSlots(account, localPacks, dateString) {
  return (account.scheduleUtc || []).map((cron, slotIndex) => {
    const profilePacks = buildProfileContentPacks(account, dateString, slotIndex);
    const automaticSelectionPacks = profilePacks.length ? mergePacks(profilePacks, localPacks) : localPacks;
    const packIndexNumber = pickDailyIndex(automaticSelectionPacks, dateString, slotIndex);
    const rawPack = automaticSelectionPacks[packIndexNumber] || {};
    const mode = plannedModeForSlot(account, slotIndex);
    const publishMode = mode === 'reel + story' ? 'reel-and-story' : 'feed-and-story';
    const enhancement = preparePackForPublication(rawPack, dateString, slotIndex, account, publishMode);
    const pack = enhancement.pack || rawPack;
    return {
      time: cronToBrtTime(cron),
      slotIndex,
      type: 'automatic',
      status: 'planned',
      title: pack.slides?.[0]?.title || 'Conteúdo automático pelo perfil da conta',
      caption: compactPlanText(pack.caption || ''),
      mode,
      packIndex: profilePacks.length ? `profile-${packIndexNumber}` : packIndexNumber
    };
  });
}

function radarConfigForAccount(account = {}) {
  const saved = account.contentProfile?.radar || {};
  const sources = normalizeEditorialSources(saved.sources);
  return {
    enabled: typeof saved.enabled === 'boolean' ? saved.enabled : account.account === 'cliente-x',
    maxAgeDays: Math.max(1, Math.min(90, Number(saved.maxAgeDays) || 60)),
    keywords: Array.isArray(saved.keywords) ? saved.keywords.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 30) : [],
    excludeKeywords: Array.isArray(saved.excludeKeywords) ? saved.excludeKeywords.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 30) : [],
    sources: sources.length ? sources : (account.account === 'cliente-x' ? EDITORIAL_SOURCES : [])
  };
}

function radarResearchOptions(account = {}) {
  const radar = radarConfigForAccount(account);
  return {
    radar,
    options: {
      maxAgeDays: radar.maxAgeDays,
      limit: 80,
      sources: radar.sources,
      keywords: radar.keywords,
      excludeKeywords: radar.excludeKeywords,
      niche: account.contentProfile?.niche || '',
      offer: account.contentProfile?.offer || ''
    }
  };
}

function radarCachePath(configDir) {
  return join(configDir, 'radar-cache.json');
}

function readRadarCache(configDir, accountKey, maxAgeHours = 48) {
  const path = radarCachePath(configDir);
  if (!existsSync(path)) return null;
  const cache = readJson(path)?.[accountKey];
  if (!Array.isArray(cache?.packs) || !cache.packs.length) return null;
  const researchedAt = Date.parse(cache.researchedAt || '');
  if (!Number.isFinite(researchedAt) || Date.now() - researchedAt > maxAgeHours * 60 * 60 * 1000) return null;
  return {
    packs: cache.packs,
    items: [],
    failures: [],
    researchedAt: cache.researchedAt,
    maxAgeDays: cache.maxAgeDays,
    fromCache: true
  };
}

function writeRadarCache(configDir, accountKey, result = {}) {
  if (!Array.isArray(result.packs) || !result.packs.length) return;
  const path = radarCachePath(configDir);
  const cache = existsSync(path) ? readJson(path) : {};
  cache[accountKey] = {
    researchedAt: result.researchedAt || new Date().toISOString(),
    maxAgeDays: result.maxAgeDays || 7,
    packs: result.packs
  };
  writeJson(path, cache);
}

async function researchRadarWithFallback(options = {}, minimumAgeDays = 7) {
  const configuredWindow = Math.max(minimumAgeDays, Math.min(30, Number(options.maxAgeDays) || 7));
  const windows = [7, 15, 30].filter((days) => days >= configuredWindow);
  let lastResult = { packs: [], items: [], failures: [], researchedAt: new Date().toISOString() };
  for (const maxAgeDays of windows) {
    const result = await researchFreshEditorialPacks({
      ...options,
      maxAgeDays,
      limit: maxAgeDays === 30 ? 160 : 100
    });
    lastResult = { ...result, maxAgeDays };
    if (result.packs.length) return lastResult;
    console.log(`Radar editorial: nenhuma pauta elegivel nos ultimos ${maxAgeDays} dias; ampliando a busca.`);
  }
  return lastResult;
}

function planForNewsSlots(account, newsPacks, dateString) {
  return (account.scheduleUtc || []).map((cron, slotIndex) => {
    const packIndexNumber = pickDailyIndex(newsPacks, dateString, slotIndex);
    const rawPack = newsPacks[packIndexNumber] || {};
    const mode = plannedModeForSlot(account, slotIndex);
    const publishMode = mode === 'reel + story' ? 'reel-and-story' : 'feed-and-story';
    const enhancement = preparePackForPublication(rawPack, dateString, slotIndex, account, publishMode);
    const pack = enhancement.pack || rawPack;
    return {
      time: cronToBrtTime(cron),
      slotIndex,
      type: 'automatic',
      status: 'planned',
      title: pack.slides?.[0]?.title || `Notícia recente para ${account.contentProfile?.niche || 'sua área'}`,
      caption: compactPlanText(pack.caption || ''),
      mode,
      packIndex: `news-${packIndexNumber}`,
      sourceUrl: rawPack.research?.sourceUrl || '',
      source: rawPack.research?.source || '',
      sourceTitle: rawPack.research?.sourceTitle || ''
    };
  });
}

function readSlotIndex() {
  const raw = process.env.INSTAGRAM_TEMPLATE_SLOT_INDEX || '0';
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 0) throw new Error('INSTAGRAM_TEMPLATE_SLOT_INDEX precisa ser um inteiro maior ou igual a zero.');
  return value;
}

function assertNoMojibake(text) {
  const markers = ['Ãƒ', 'Ã‚', 'Ã¢', 'ï¿½'];
  const found = markers.find((marker) => text.includes(marker));
  if (found) throw new Error(`Texto contem mojibake (${found}). Corrija antes de publicar.`);
}

function stripHashtagLines(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');
}

function assertPortugueseAccents(text) {
  // Slugs de URLs nao usam acentos por padrao (ex.: /operacao-comercial/).
  // A revisao deve analisar apenas o texto que o publico le, sem confundir o
  // endereco tecnico da fonte oficial com erro ortografico na publicacao.
  const searchable = stripHashtagLines(text).replace(/https?:\/\/\S+/gi, ' ');
  const found = PLAIN_ASCII_PORTUGUESE.find(([plain]) => {
    const pattern = new RegExp(`(^|[^\\p{L}])${plain}([^\\p{L}]|$)`, 'iu');
    return pattern.test(searchable);
  });
  if (found) throw new Error(`Texto sem acento: use "${found[1]}" no lugar de "${found[0]}".`);
}

function validHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '').trim());
}

function hexToRgb(hex) {
  const value = parseInt(String(hex).slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function contrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  return ((r * 299 + g * 587 + b * 114) / 1000) > 150 ? '#17211c' : '#ffffff';
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, '0')).join('')}`;
}

function mixHex(left, right, weight = 0.5) {
  const a = hexToRgb(left);
  const b = hexToRgb(right);
  return rgbToHex({
    r: a.r * (1 - weight) + b.r * weight,
    g: a.g * (1 - weight) + b.g * weight,
    b: a.b * (1 - weight) + b.b * weight
  });
}

function readableMuted(text) {
  return text === '#ffffff' ? '#e7eee9' : '#4b5b53';
}

function paletteVariant(style, name, { accent, accentSoft, grid, bgTop, bgBottom, ...extra }) {
  const text = contrastColor(bgTop);
  return {
    ...style,
    ...extra,
    name,
    accent,
    accentSoft,
    grid,
    bgTop,
    bgBottom,
    text,
    muted: readableMuted(text)
  };
}

function rotateItems(items, startIndex = 0) {
  const offset = ((startIndex % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function styleForSlide(style, index = 1) {
  if (!Array.isArray(style.slidePalettes) || !style.slidePalettes.length) return style;
  return style.slidePalettes[(index - 1) % style.slidePalettes.length];
}

function cssUrl(value = '') {
  return `url("${String(value).replace(/\\/g, '/').replace(/"/g, '%22')}")`;
}

function stableAvatarOffset(value = '') {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function accountAvatarRotationUrls(account = {}) {
  const rotation = account.avatarRotation || {};
  return Array.isArray(rotation.urls)
    ? rotation.urls.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
}

function pickAvatarRotationStart(account = {}, publicationHistory = [], seed = '') {
  const urls = accountAvatarRotationUrls(account);
  if (!account.avatarRotation?.enabled || !urls.length) return null;

  const recentCoverAvatars = [...publicationHistory]
    .reverse()
    .map((entry) => String(entry?.coverAvatar || '').trim())
    .filter(Boolean)
    .slice(0, Math.max(0, urls.length - 1));
  const preferred = stableAvatarOffset(seed) % urls.length;
  for (let step = 0; step < urls.length; step += 1) {
    const candidate = (preferred + step) % urls.length;
    if (!recentCoverAvatars.includes(urls[candidate])) return candidate;
  }
  return preferred;
}

function pickAccountAvatar(account = {}, index = 1, visualCue = '', context = {}) {
  const rotation = account.avatarRotation || {};
  const urls = accountAvatarRotationUrls(account);
  if (rotation.enabled && urls.length) {
    const recordedOffset = Number(context.avatarRotationStart);
    const hasRecordedOffset = Number.isInteger(recordedOffset) && recordedOffset >= 0;
    const dateOffset = hasRecordedOffset
      ? recordedOffset
      : stableAvatarOffset(context.dateString || todaySaoPaulo()) % urls.length;
    const slotOffset = Number.isInteger(Number(context.slotIndex)) ? Number(context.slotIndex) : 0;
    const slideOffset = Math.max(0, Number(index || 1) - 1);
    const storyOffset = context.story ? Math.max(1, Math.ceil(urls.length / 2)) : 0;
    const generationOffset = hasRecordedOffset ? 0 : Math.max(0, Number(context.creativeGeneration || 1) - 1);
    // Percorre a rotacao na ordem dos horarios. A pauta ja varia capa, paleta e
    // composicao; usa-la novamente aqui podia anular o slotOffset e repetir as
    // mesmas duas fotos em posts consecutivos.
    const offset = dateOffset + (hasRecordedOffset ? 0 : slotOffset) + slideOffset + storyOffset + generationOffset;
    return urls[offset % urls.length];
  }
  return String(account.avatarUrl || account.avatarPath || '').trim();
}

function accountAvatarCssImage(account = {}, index = 1, visualCue = '', context = {}) {
  const pickedAvatar = pickAccountAvatar(account, index, visualCue, context);
  if (/^https?:\/\//i.test(pickedAvatar) || /^data:image\//i.test(pickedAvatar)) return cssUrl(pickedAvatar);

  const avatarUrl = String(account.avatarUrl || '').trim();
  if (!pickedAvatar && avatarUrl) return cssUrl(avatarUrl);

  const avatarPath = pickedAvatar || String(account.avatarPath || '').trim();
  if (!avatarPath) return '';

  const source = resolve(ROOT, avatarPath.replace(/^\/+/, ''));
  if (!existsSync(source)) {
    console.warn(`Avatar configurado nao encontrado: ${account.avatarPath}`);
    return '';
  }
  return cssUrl(`file:///${source.replace(/\\/g, '/')}`);
}

function accountUsernameDisplay(account = {}) {
  const username = String(account.expectedUsername || '').replace(/^@/, '').trim();
  return username ? `@${username}` : (account.brandName || 'Marcondes Machado');
}

function localAssetCssImage(path = '') {
  const source = resolve(ROOT, String(path || '').replace(/^\/+/, ''));
  if (!existsSync(source)) return '';
  return cssUrl(`file:///${source.replace(/\\/g, '/')}`);
}

function fileCssImage(path = '') {
  const value = String(path || '').trim();
  if (!value) return '';
  const source = isAbsolute(value) ? value : resolve(ROOT, value.replace(/^\/+/, ''));
  if (!existsSync(source)) return '';
  return cssUrl(`file:///${source.replace(/\\/g, '/')}`);
}

async function downloadResearchSourceImage(pack = {}, runDir = '') {
  const sourceImageUrl = String(pack?.research?.sourceImageUrl || '').trim();
  if (!/^https:\/\//i.test(sourceImageUrl)) return null;
  // WordPress costuma anunciar no feed uma miniatura como `-340x191.webp`.
  // Ela pode ficar abaixo do limite de qualidade embora o original esteja no
  // mesmo endereço. Tente a versão original antes de aceitar a miniatura.
  const originalImageUrl = sourceImageUrl.replace(/-\d{2,4}x\d{2,4}(?=\.[a-z0-9]+(?:\?|$))/i, '');
  const candidates = [...new Set([originalImageUrl, sourceImageUrl])];
  try {
    const extensions = new Map([
      ['image/jpeg', '.jpg'],
      ['image/png', '.png'],
      ['image/webp', '.webp'],
      ['image/avif', '.avif']
    ]);
    let lastError = null;
    for (const candidateUrl of candidates) {
      try {
        const response = await fetchWithContext(candidateUrl, {
          headers: {
            accept: 'image/avif,image/webp,image/png,image/jpeg',
            'user-agent': 'Mozilla/5.0 Cliente-X-Radar/1.0'
          },
          redirect: 'follow'
        }, 'radar-source-image');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const contentType = String(response.headers.get('content-type') || '').split(';')[0].toLowerCase();
        if (!extensions.has(contentType)) throw new Error(`tipo ${contentType || 'desconhecido'} nao aceito`);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length < 20000) throw new Error(`arquivo pequeno demais (${bytes.length} bytes)`);
        if (bytes.length > 12000000) throw new Error(`arquivo grande demais (${bytes.length} bytes)`);
        const destination = join(runDir, `radar-source-image${extensions.get(contentType)}`);
        writeFileSync(destination, bytes);
        return destination;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('imagem indisponivel');
  } catch (error) {
    console.warn(`Imagem da materia indisponivel; usando rodizio visual seguro: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function isPrivateNetworkAddress(address = '') {
  const value = String(address || '').toLowerCase();
  if (value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80:')) return true;
  const parts = value.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
  return parts[0] === 10
    || parts[0] === 127
    || parts[0] === 0
    || (parts[0] === 169 && parts[1] === 254)
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168);
}

async function assertSafeExternalImageUrl(rawUrl = '') {
  const url = new URL(String(rawUrl || '').trim());
  if (url.protocol !== 'https:') throw new Error('Use um link HTTPS para buscar imagem externa.');
  const hostname = url.hostname.toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.local')) throw new Error('Este endereço de imagem não é permitido.');
  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some((item) => isPrivateNetworkAddress(item.address))) {
    throw new Error('O link de imagem aponta para uma rede privada e foi bloqueado.');
  }
  return url;
}

async function fetchSafeExternalResource(rawUrl, accept, label) {
  let current = await assertSafeExternalImageUrl(rawUrl);
  for (let redirect = 0; redirect < 5; redirect += 1) {
    const response = await fetchWithContext(current, {
      headers: { accept, 'user-agent': 'Mozilla/5.0 Cliente-X-Image-Importer/1.0' },
      redirect: 'manual'
    }, label);
    if (response.status < 300 || response.status >= 400) return { response, url: current };
    const location = response.headers.get('location');
    if (!location) throw new Error('O site redirecionou sem informar o destino da imagem.');
    current = await assertSafeExternalImageUrl(new URL(location, current).toString());
  }
  throw new Error('O link de imagem redirecionou muitas vezes.');
}

async function downloadExternalSlideImage(rawUrl, runDir, slideIndex) {
  let targetUrl = String(rawUrl || '').trim();
  let fetched = await fetchSafeExternalResource(targetUrl, 'image/avif,image/webp,image/png,image/jpeg,text/html', `slide-${slideIndex}-source`);
  let contentType = String(fetched.response.headers.get('content-type') || '').split(';')[0].toLowerCase();
  if (contentType === 'text/html' || contentType === 'application/xhtml+xml') {
    const html = await fetched.response.text();
    if (html.length > 2500000) throw new Error(`A página do slide ${slideIndex} é grande demais para localizar a imagem principal.`);
    targetUrl = extractEditorialImageUrl(html, fetched.url.toString());
    if (!targetUrl) throw new Error(`Não encontrei uma imagem principal válida na página informada para o slide ${slideIndex}.`);
    fetched = await fetchSafeExternalResource(targetUrl, 'image/avif,image/webp,image/png,image/jpeg', `slide-${slideIndex}-image`);
    contentType = String(fetched.response.headers.get('content-type') || '').split(';')[0].toLowerCase();
  }
  if (!fetched.response.ok) throw new Error(`Imagem externa do slide ${slideIndex} indisponível: HTTP ${fetched.response.status}.`);
  const extensions = new Map([['image/jpeg', '.jpg'], ['image/png', '.png'], ['image/webp', '.webp'], ['image/avif', '.avif']]);
  if (!extensions.has(contentType)) throw new Error(`O link do slide ${slideIndex} não retornou JPG, PNG, WebP ou AVIF.`);
  const bytes = Buffer.from(await fetched.response.arrayBuffer());
  if (bytes.length < 20000 || bytes.length > 12000000) throw new Error(`A imagem externa do slide ${slideIndex} precisa ter entre 20 KB e 12 MB.`);
  const destination = join(runDir, `slide-source-${String(slideIndex).padStart(2, '0')}${extensions.get(contentType)}`);
  writeFileSync(destination, bytes);
  return destination;
}

function visualCueFromText(text = '') {
  const value = normalizeSearchText(text);
  if (/\b(turismo|turistica|turistico|viagem|viagens|pousada|hotel|praia|destino|radio)\b/.test(value)) return 'tourism';
  if (/\b(imobiliaria|imobiliario|corretor|imovel|imoveis|casa|apartamento)\b/.test(value)) return 'real-estate';
  if (/\b(juridico|advocacia|advogado|escritorio juridico|contrato|processo)\b/.test(value)) return 'legal';
  if (/\b(clinica|medico|paciente|consulta|saude|dentista)\b/.test(value)) return 'clinic';
  if (/\b(restaurante|delivery|cardapio|pedido|mesa|cozinha)\b/.test(value)) return 'restaurant';
  if (/\b(estetica|beleza|agenda|procedimento|salao)\b/.test(value)) return 'beauty';
  if (/\b(educacao|curso|aluno|aula|escola|treinamento)\b/.test(value)) return 'education';
  if (/\b(ecommerce|e-commerce|loja|produto|carrinho|pedido)\b/.test(value)) return 'ecommerce';
  if (/\b(financeiro|cobranca|relatorio|caixa|pagamento|boleto)\b/.test(value)) return 'finance';
  if (/\b(servico|suporte|atendimento|projeto|operacao)\b/.test(value)) return 'services';
  return 'business';
}

function visualCueForAccount(account = {}, fallbackText = '') {
  const profile = account.contentProfile || {};
  const identity = normalizeSearchText([
    profile.niche,
    account.clientProfile?.businessType,
    account.brandName
  ].filter(Boolean).join(' '));
  if (/\b(juridico|advocacia|advogado|escritorio juridico)\b/.test(identity)) return 'legal';
  if (/\b(turismo|viagem|pousada|hotel|destino)\b/.test(identity)) return 'tourism';
  if (/\b(imobiliaria|imobiliario|corretor|imovel|imoveis)\b/.test(identity)) return 'real-estate';
  if (/\b(clinica|medico|odontologia|saude|dentista)\b/.test(identity)) return 'clinic';
  if (/\b(restaurante|delivery|cardapio|cozinha)\b/.test(identity)) return 'restaurant';
  if (/\b(estetica|beleza|salao)\b/.test(identity)) return 'beauty';
  if (/\b(educacao|curso|aluno|aula|escola)\b/.test(identity)) return 'education';
  if (/\b(ecommerce|loja|varejo)\b/.test(identity)) return 'ecommerce';
  // Contas de IA, automação, consultoria e serviços usam visual empresarial,
  // mesmo quando o texto menciona palavras como "processo" ou "contrato".
  if (/\b(ia|inteligencia artificial|automacao|consultoria|empresa|negocio|servico)\b/.test(identity)) return 'business';
  return visualCueFromText(fallbackText);
}

function sectorPhotoCssImage(cue = 'business', slideIndex = 1, renderContext = {}) {
  const photos = {
    legal: ['docs/uploads/sector-photos/legal.jpg', 'docs/uploads/sector-photos/operations-review.png'],
    tourism: ['docs/uploads/sector-photos/tourism.jpg', 'docs/uploads/sector-photos/operations-review.png'],
    'real-estate': ['docs/uploads/sector-photos/real-estate.jpg', 'docs/uploads/sector-photos/operations-review.png'],
    restaurant: ['docs/uploads/sector-photos/restaurant.jpg', 'docs/uploads/sector-photos/operations-review.png'],
    clinic: ['docs/uploads/sector-photos/clinic.jpg', 'docs/uploads/sector-photos/operations-review.png'],
    beauty: ['docs/uploads/sector-photos/beauty.jpg', 'docs/uploads/sector-photos/operations-review.png'],
    ecommerce: ['docs/uploads/sector-photos/ecommerce.jpg', 'docs/uploads/sector-photos/operations-review.png'],
    finance: ['docs/uploads/sector-photos/finance.jpg', 'docs/uploads/sector-photos/operations-review.png'],
    services: [
      'docs/uploads/sector-photos/operations-review.png',
      'docs/uploads/automation-cloud-evening.jpg',
      'docs/uploads/automation-leave-office.jpg',
      'docs/uploads/sector-photos/finance.jpg'
    ],
    business: [
      'docs/uploads/sector-photos/operations-review.png',
      'docs/uploads/automation-cloud-evening.jpg',
      'docs/uploads/automation-leave-office.jpg',
      'docs/uploads/sector-photos/finance.jpg',
      'docs/uploads/impact-ai-approval-v1.png',
      'docs/uploads/impact-ai-continuity-v1.png',
      'docs/uploads/impact-ai-workflow-team-v1.png'
    ]
  };
  const options = photos[cue] || photos.business;
  const dateSeed = daysSinceEpoch(renderContext.dateString || todaySaoPaulo());
  const variationSeed = stableAvatarOffset(renderContext.variationSeed || '') % options.length;
  const slotSeed = Number(renderContext.slotIndex || 0) + Number(renderContext.creativeGeneration || 0) + variationSeed;
  return localAssetCssImage(options[(dateSeed + slotSeed + slideIndex) % options.length]);
}

function sectorVisualHtml(cue = 'business') {
  const common = 'fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"';
  const shapes = {
    'real-estate': `
      <path ${common} d="M80 198V122l70-56 70 56v76"/>
      <path ${common} d="M58 122l92-74 92 74"/>
      <path ${common} d="M126 198v-52h48v52"/>
      <path ${common} d="M42 218h216"/>
      <path ${common} d="M208 74h38v138"/>
      <circle cx="230" cy="65" r="18" fill="currentColor" opacity="0.22"/>
    `,
    legal: `
      <path ${common} d="M150 58v168M82 88h136M98 88l-42 72h84L98 88ZM202 88l-42 72h84l-42-72Z"/>
      <path ${common} d="M110 226h80M128 202h44"/>
      <circle cx="150" cy="58" r="18" fill="currentColor" opacity="0.24"/>
    `,
    clinic: `
      <rect x="62" y="78" width="176" height="154" rx="28" ${common}/>
      <path ${common} d="M150 112v86M107 155h86"/>
      <path ${common} d="M104 78V52M196 78V52"/>
      <circle cx="74" cy="216" r="18" fill="currentColor" opacity="0.22"/>
    `,
    restaurant: `
      <circle cx="154" cy="154" r="70" ${common}/>
      <circle cx="154" cy="154" r="34" ${common}/>
      <path ${common} d="M58 62v168M82 62v168M58 118h24"/>
      <path ${common} d="M244 62c-28 30-28 70 0 102v66"/>
      <circle cx="230" cy="214" r="18" fill="currentColor" opacity="0.22"/>
    `,
    beauty: `
      <path ${common} d="M150 48l24 70 70 24-70 24-24 70-24-70-70-24 70-24 24-70Z"/>
      <path ${common} d="M72 58l10 28 28 10-28 10-10 28-10-28-28-10 28-10 10-28Z"/>
      <circle cx="228" cy="214" r="18" fill="currentColor" opacity="0.22"/>
    `,
    education: `
      <path ${common} d="M42 96l108-44 108 44-108 44L42 96Z"/>
      <path ${common} d="M86 122v58c34 28 94 28 128 0v-58"/>
      <path ${common} d="M258 96v78"/>
      <circle cx="258" cy="190" r="15" fill="currentColor" opacity="0.24"/>
    `,
    ecommerce: `
      <path ${common} d="M58 72h32l24 112h112l24-76H104"/>
      <circle cx="126" cy="216" r="18" ${common}/>
      <circle cx="214" cy="216" r="18" ${common}/>
      <path ${common} d="M142 58h62l28 36"/>
      <circle cx="230" cy="70" r="18" fill="currentColor" opacity="0.22"/>
    `,
    finance: `
      <path ${common} d="M62 214h182"/>
      <path ${common} d="M84 182v-48M132 182V96M180 182v-70M228 182V72"/>
      <path ${common} d="M76 88c36 22 58 20 90-2s54-26 90-2"/>
      <circle cx="88" cy="66" r="20" fill="currentColor" opacity="0.22"/>
    `,
    tourism: `
      <path ${common} d="M58 184c42-34 82-34 124 0s74 34 116 0"/>
      <path ${common} d="M108 170l42-104 42 104M126 126h48"/>
      <path ${common} d="M76 216h160"/>
      <circle cx="226" cy="76" r="30" ${common}/>
      <circle cx="80" cy="72" r="18" fill="currentColor" opacity="0.22"/>
    `,
    services: `
      <rect x="60" y="84" width="180" height="132" rx="26" ${common}/>
      <path ${common} d="M114 84V62h72v22M96 134h108M96 172h76"/>
      <circle cx="220" cy="176" r="20" fill="currentColor" opacity="0.22"/>
    `,
    business: `
      <rect x="66" y="82" width="168" height="142" rx="24" ${common}/>
      <path ${common} d="M108 82V58h84v24M104 132h92M104 172h58"/>
      <circle cx="218" cy="178" r="18" fill="currentColor" opacity="0.22"/>
    `
  };
  return `<svg class="sector-cue" viewBox="0 0 300 280" aria-hidden="true">${shapes[cue] || shapes.business}</svg>`;
}

function htmlText(value = '') {
  return String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function researchSourceCardHtml(source = '', sourceTitle = '', sourceUrl = '', sourceImage = '') {
  const name = htmlText(source || 'Fonte oficial');
  const title = htmlText(sourceTitle || 'Título da matéria não informado');
  const linkStatus = /^https:\/\//i.test(sourceUrl) ? 'MATÉRIA IDENTIFICADA · LINK NA LEGENDA' : 'LINK DA MATÉRIA AUSENTE';
  const imageStyle = sourceImage ? ` style='background-image: linear-gradient(180deg, rgba(9,20,31,.18), rgba(9,20,31,.92)), ${sourceImage};'` : '';
  return `<div class="context-photo news-context${sourceImage ? ' has-source-image' : ''}"${imageStyle}><span>FONTE OFICIAL</span><strong>${name}</strong><small>${title}</small><em>${linkStatus}</em><i></i></div>`;
}

function anatexSlideHtml(slide, index, total, account, style, renderContext = {}) {
  const slideStyle = styleForSlide(style, index);
  const title = anatexTitle(slide.title || '');
  const body = applyAnatexCopyRules(slide.body || '');
  const creativeBody = splitCreativeDescription(body);
  const eyebrow = applyAnatexCopyRules(slide.eyebrow || 'Pra saber');
  const accent = slideStyle.accent || '#a7563d';
  const accentText = contrastColor(accent);
  const soft = slideStyle.accentSoft || 'rgba(167,86,61,0.16)';
  const headline = title.replace(/\s+IA\b/i, ' <strong>IA</strong>');
  const baseMode = slideStyle.templateMode || 'paper';
  // A capa é a principal peça percebida no feed. Alternar também a composição
  // (e não somente a paleta) evita uma sequência de capas com a mesma cara.
  // Capas automáticas precisam alternar estruturas realmente diferentes. O
  // antigo par paper/split mantinha a fotografia como miniatura no alto e
  // fazia Reels consecutivos parecerem a mesma peça.
  const coverModes = ['native', 'visual', 'editorial'];
  const coverModeSeed = daysSinceEpoch(renderContext.dateString || todaySaoPaulo())
    + Number(renderContext.slotIndex || 0)
    + Number(renderContext.creativeGeneration || 0);
  const mode = index === 1
    ? coverModes[Math.abs(coverModeSeed) % coverModes.length]
    : baseMode;
  const visualCue = slide.visualCue || visualCueForAccount(account, `${slide.title || ''} ${slide.body || ''} ${slide.eyebrow || ''}`);
  const avatarImage = accountAvatarCssImage(account, index, visualCue, renderContext);
  const avatarClass = avatarImage ? ' has-avatar' : '';
  const usernameDisplay = accountUsernameDisplay(account);
  const engagementRole = index === 1 ? 'hook' : index === total ? 'cta' : index === total - 1 ? 'proof' : 'value';
  const isImpact = String(style.name || '').startsWith('impact-carousel');
  const explicitSlideImage = slide.imagePath
    ? fileCssImage(resolve(ROOT, String(slide.imagePath).replace(/^\/+/, '')))
    : '';
  const researchSource = String(slide.researchSource || '').trim();
  const researchTitle = String(slide.researchDisplayTitle || slide.researchTitle || '').trim();
  const researchUrl = String(slide.researchUrl || '').trim();
  const researchImage = index === 1 ? fileCssImage(renderContext.researchSourceImagePath || '') : '';
  const useSectorPhoto = isImpact
    ? Boolean(explicitSlideImage || researchImage || engagementRole === 'hook')
    : engagementRole === 'hook' || engagementRole === 'proof';
  const sectorPhotoImage = explicitSlideImage || (useSectorPhoto ? sectorPhotoCssImage(visualCue, index, renderContext) : '');
  // Only replace the visual with the source card when the article image was
  // actually downloaded. Otherwise keep the safe photographic rotation.
  const showNewsContext = Boolean(useSectorPhoto && researchSource && researchImage);
  const sectorPhotoClass = sectorPhotoImage || researchImage ? ' has-sector-photo' : '';
  const imageLayoutClass = isImpact && sectorPhotoImage && ['book-hero', 'book-split', 'book-editorial'].includes(slide.imageLayout)
    ? ` ${slide.imageLayout}`
    : '';
  const isReelMode = renderContext.publishMode === 'reel-only' || renderContext.publishMode === 'reel-and-story';
  const outputHeight = isReelMode ? STORY_HEIGHT : FEED_HEIGHT;
  const swipeCue = index === 1 && !isReelMode ? '<div class="swipe-cue">arraste para ver</div>' : '';
  const commentKeyword = `${title} ${body}`.match(/\bcomente\s+([\p{L}\p{N}_-]+)/iu)?.[1];
  const finalCue = commentKeyword ? `comente ${commentKeyword}` : /\bcomente\b/i.test(`${title} ${body}`) ? 'comente IA' : 'link na bio';
  const saveCue = index === total ? `<div class="save-cue">${finalCue}</div>` : index === 3 ? '<div class="save-cue">salve este passo</div>' : '';
  // A capa usa duas colunas previsiveis. O antigo layout de canto reduzia a
  // foto para um selo e quebrava a proporcao em relacao aos demais cartoes.
  const coverLayouts = ['layout-right', 'layout-left'];
  const coverLayout = coverLayouts[stableAvatarOffset(renderContext.variationSeed || slide.title || '') % coverLayouts.length];
  const headlineLengthClass = title.length >= 120 ? 'headline-very-long' : (title.length >= 78 ? 'headline-long' : '');
  const placement = [
    mode === 'split' ? 'layout-left' : index === 1 ? coverLayout : index % 3 === 2 ? 'layout-left' : index % 3 === 0 ? 'layout-corner' : 'layout-right',
    `mode-${mode}`,
    `role-${engagementRole}`,
    isReelMode ? 'reel-mode' : '',
    researchImage ? 'has-research-image' : '',
    isImpact ? 'impact-carousel' : '',
    headlineLengthClass,
    index % 2 === 0 ? 'slide-even' : 'slide-odd'
  ].join(' ');
  const noteWidth = mode === 'minimal' ? 650 : mode === 'poster' || mode === 'magazine' ? 430 : mode === 'split' || placement?.includes?.('layout-left') ? 380 : 390;
  // A leitura deve ser consistente entre os cartões 01, 02, 03...; texto
  // mais longo aumenta a altura do cartão, nunca reduz a fonte abaixo do padrão.
  const noteFontSize = engagementRole === 'cta' ? 24 : 25;
  const noteLines = estimateTextLines(body, noteWidth, noteFontSize);
  // O texto de fechamento ocupa a área colorida do cartão. Escalas muito
  // baixas deixavam letras pequenas e um grande vazio no bloco de apoio.
  // O bloco verde é lido no celular; 24px ainda ficava pequeno nos cartões
  // compactos. Mantemos um tamanho editorial confortável e deixamos a caixa
  // ocupar a altura necessária.
  const closeFontSize = engagementRole === 'cta' ? 26 : 30;
  const closeLines = creativeBody.close ? estimateTextLines(creativeBody.close, noteWidth - 32, closeFontSize) : 0;
  const closeMinHeight = creativeBody.close
    ? Math.max(156, Math.min(390, 58 + (closeLines * closeFontSize * 1.30)))
    : 0;
  const noteMinHeight = engagementRole === 'cta'
    ? Math.min(500, Math.max(300, 150 + closeMinHeight + (noteLines * noteFontSize * 0.72)))
    : Math.min(450, Math.max(270, 122 + closeMinHeight + (noteLines * noteFontSize * 0.98)));
  const progressItems = Array.from({ length: total }, (_, itemIndex) => (
    `<span class="${itemIndex + 1 <= index ? 'active' : ''}"></span>`
  )).join('');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: ${FEED_WIDTH}px; height: ${outputHeight}px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${slideStyle.bgTop}; color: ${slideStyle.text}; }
    main {
      width: ${FEED_WIDTH}px;
      height: ${outputHeight}px;
      padding: 42px 58px 58px;
      position: relative;
      background:
        radial-gradient(circle at 88% 12%, ${soft} 0 150px, transparent 151px),
        radial-gradient(circle at 88% 90%, rgba(167,86,61,0.10) 0 240px, transparent 241px),
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
    }
    main::before { content: ""; position: absolute; left: 56px; right: 56px; top: 48px; height: 2px; background: rgba(167,86,61,0.42); }
    main::after {
      content: "";
      position: absolute;
      left: 16px;
      top: 98px;
      width: 120px;
      height: 210px;
      opacity: 0.26;
      background-image: radial-gradient(${accent} 3px, transparent 4px);
      background-size: 22px 22px;
    }
    .brand { position: relative; z-index: 2; margin-left: 60px; font-size: 32px; line-height: 1; font-weight: 900; color: ${accent}; }
    .arrows { position: absolute; right: 96px; top: 37px; display: flex; gap: 6px; color: ${accent}; font-size: 34px; font-weight: 900; z-index: 2; }
    .badge { position: absolute; left: 84px; top: 122px; z-index: 2; display: inline-flex; align-items: center; gap: 14px; max-width: 560px; padding: 14px 28px; border-radius: 14px; background: ${accent}; color: #fff6ef; font-size: 27px; line-height: 1; font-weight: 900; text-transform: uppercase; }
    .badge span { width: 32px; height: 32px; flex: 0 0 32px; border-radius: 50%; border: 3px solid #fff6ef; display: inline-block; position: relative; }
    .badge span::after { content: ""; position: absolute; left: 8px; top: 7px; width: 9px; height: 14px; border-right: 4px solid #fff6ef; border-bottom: 4px solid #fff6ef; transform: rotate(40deg); }
    .headline { position: relative; z-index: 2; margin-top: 142px; max-width: 570px; font-size: 68px; line-height: 0.98; letter-spacing: 0; font-weight: 900; color: ${slideStyle.text}; overflow-wrap: break-word; }
    .headline strong { display: inline; color: ${accent}; font: inherit; }
    .swipe-cue, .save-cue {
      position: absolute;
      z-index: 4;
      right: 58px;
      bottom: 58px;
      padding: 14px 24px;
      border-radius: 999px;
      background: ${accent};
      color: #fff6ef;
      font-size: 25px;
      line-height: 1;
      font-weight: 900;
      text-transform: uppercase;
      box-shadow: 0 18px 36px rgba(56,42,32,0.16);
    }
    .save-cue { right: auto; left: 72px; bottom: 56px; background: ${slideStyle.text}; }
    .progress { position: absolute; left: 72px; right: 72px; bottom: 108px; z-index: 4; display: flex; gap: 8px; }
    .progress span { height: 8px; flex: 1; border-radius: 999px; background: rgba(20,38,47,0.13); }
    .progress span.active { background: ${accent}; }
    .context-photo {
      position: absolute;
      right: 58px;
      top: 246px;
      width: 370px;
      height: 236px;
      border-radius: 28px;
      background: ${sectorPhotoImage || 'rgba(255,255,255,0.24)'} center center / cover no-repeat;
      border: 8px solid rgba(255,250,246,0.82);
      box-shadow: 0 24px 58px rgba(56,42,32,0.15);
      overflow: hidden;
      z-index: 1;
      opacity: 0.88;
    }
    .context-photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,250,246,0.10), rgba(19,34,56,0.18)); }
    .context-photo.news-context { display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 22px 24px; background: linear-gradient(135deg, #132238, ${accent}); color: #fffaf7; opacity: 1; }
    .context-photo.news-context.has-source-image { justify-content: flex-end; background-position: center; background-size: cover; }
    .context-photo.news-context.has-source-image small { display: none; }
    .context-photo.news-context.has-source-image strong { font-size: 32px; }
    .context-photo.news-context::after { background: radial-gradient(circle at 88% 20%, rgba(255,255,255,.18) 0 54px, transparent 55px); }
    .news-context > * { position: relative; z-index: 1; }
    .news-context span { font-size: 15px; font-weight: 900; letter-spacing: .12em; }
    .news-context strong { font-size: 36px; line-height: .94; font-weight: 900; }
    .news-context small { display: -webkit-box; max-width: 100%; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3; font-size: 16px; line-height: 1.1; font-weight: 800; }
    .news-context em { position: relative; z-index: 1; font-size: 11px; line-height: 1.1; font-style: normal; font-weight: 900; letter-spacing: .06em; opacity: .88; }
    .news-context i { width: 50px; height: 5px; margin-top: 2px; border-radius: 99px; background: #fffaf7; opacity: .9; }
    .note {
      position: absolute;
      left: 78px;
      top: 700px;
      width: 540px;
      min-height: ${noteMinHeight}px;
      padding: 34px 38px 30px 108px;
      border: 2px solid rgba(167,86,61,0.20);
      border-radius: 24px;
      background: rgba(255,250,246,0.76);
      z-index: 2;
      font-size: ${noteFontSize}px;
      line-height: 1.13;
      font-weight: 800;
      color: ${slideStyle.text};
    }
    .note::before { content: "${String(index).padStart(2, '0')}"; position: absolute; left: 28px; top: 30px; width: 56px; height: 56px; border-radius: 50%; background: ${accent}; color: #fff6ef; display: grid; place-items: center; font-size: 25px; font-weight: 900; }
    .note .lead { display: block; margin-bottom: 5px; color: ${accent}; font-size: 0.78em; line-height: 1.05; font-weight: 900; }
    .note .emphasis { display: block; max-width: 100%; color: ${slideStyle.text}; font-size: 1.12em; line-height: 1; font-weight: 900; }
    .note .close { display: block; max-width: 100%; min-height: ${closeMinHeight}px; margin-top: 14px; padding: 18px 18px 19px; border-radius: 12px; background: ${accent}; color: #fff6ef; font-size: ${closeFontSize}px; line-height: 1.16; font-weight: 900; overflow-wrap: anywhere; }
    .note .close:empty { display: none; }
    .panel {
      position: absolute;
      right: 56px;
      top: 450px;
      width: 360px;
      height: 470px;
      border-radius: 30px;
      background: rgba(255,255,255,0.48);
      border: 2px solid rgba(167,86,61,0.16);
      box-shadow: 0 26px 60px rgba(94,50,34,0.14);
      transform: rotate(3deg);
      z-index: 1;
      overflow: hidden;
    }
    .panel::before { content: "IA"; position: absolute; left: 42px; top: 38px; color: rgba(167,86,61,0.18); font-size: 110px; line-height: 1; font-weight: 900; }
    .panel::after { content: ""; position: absolute; left: 42px; right: 42px; bottom: 68px; height: 230px; background: repeating-linear-gradient(180deg, rgba(167,86,61,0.24) 0 10px, transparent 10px 34px); }
    .panel.has-avatar {
      background-color: rgba(255,250,246,0.82);
      background-image: ${avatarImage || 'none'};
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      border: 7px solid rgba(255,250,246,0.9);
      box-shadow: 0 28px 70px rgba(94,50,34,0.24);
    }
    .panel.has-avatar::before,
    .panel.has-avatar::after { display: none; }
    .sector-cue {
      position: absolute;
      right: 64px;
      top: 228px;
      width: 278px;
      height: 260px;
      z-index: 2;
      color: ${accent};
      opacity: 0.34;
      filter: drop-shadow(0 18px 28px rgba(94,50,34,0.10));
    }
    .layout-left .panel { left: 58px; right: auto; top: 450px; width: 360px; height: 470px; transform: rotate(-3deg); }
    .layout-left .context-photo { left: 58px; right: auto; top: 204px; width: 360px; height: 230px; }
    .layout-left .badge { left: 470px; }
    .layout-left .headline { margin-left: 420px; max-width: 540px; font-size: 58px; }
    .layout-left .subline { margin-left: 372px; max-width: 600px; }
    .layout-left .note { left: 470px; top: 720px; width: 540px; min-height: 230px; font-size: 28px; }
    .layout-left main::after { left: auto; right: 16px; }
    .layout-left .sector-cue { left: 92px; right: auto; top: 198px; width: 238px; opacity: 0.28; }
    .layout-corner .badge { top: 112px; }
    .layout-corner .headline { max-width: 760px; font-size: 62px; line-height: 1.02; }
    .layout-corner .panel { top: 610px; right: 70px; bottom: auto; width: 310px; height: 310px; border-radius: 50%; transform: rotate(0deg); z-index: 3; }
    .layout-corner .context-photo { right: 72px; top: 284px; width: 316px; height: 220px; border-radius: 34px; }
    .layout-corner .panel::before { font-size: 62px; left: 50%; top: 50%; transform: translate(-50%, -50%); }
    .layout-corner .panel::after { display: none; }
    .layout-corner .note { left: 70px; top: 610px; bottom: auto; width: 610px; min-height: 250px; padding: 34px 34px 32px 104px; font-size: 26px; line-height: 1.13; }
    .layout-corner .bubble { display: none; }
    .layout-corner .sector-cue { right: 72px; top: 248px; width: 250px; opacity: 0.30; }
    .mode-split main {
      background:
        linear-gradient(90deg, rgba(255,250,246,0.82) 0 52%, transparent 52%),
        radial-gradient(circle at 82% 24%, ${soft} 0 230px, transparent 231px),
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
    }
    .mode-split .panel { top: 350px; width: 410px; height: 540px; border-radius: 34px; }
    .mode-split .context-photo { top: 150px; right: 76px; width: 330px; height: 210px; }
    .mode-split .headline { margin-top: 154px; font-size: 60px; }
    .mode-split .note { top: 812px; min-height: 210px; }
    .mode-split .sector-cue { right: 82px; top: 118px; width: 250px; opacity: 0.28; }
    .mode-poster main {
      background:
        radial-gradient(circle at 50% 112%, ${soft} 0 430px, transparent 431px),
        linear-gradient(180deg, rgba(255,255,255,0.66) 0 50%, transparent 50%),
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
    }
    .mode-poster .badge { left: 50%; top: 118px; transform: translateX(-50%); }
    .mode-poster .headline { margin: 185px auto 0; max-width: 900px; font-size: 86px; line-height: 0.96; text-align: center; }
    .mode-poster .panel { right: 84px; top: 760px; width: 300px; height: 300px; border-radius: 50%; transform: none; z-index: 3; }
    .mode-poster .context-photo { left: 50%; top: 500px; width: 560px; height: 216px; transform: translateX(-50%); border-radius: 30px; }
    .mode-poster .note { left: 86px; top: 760px; width: 610px; min-height: 250px; font-size: 29px; background: rgba(255,250,246,0.90); }
    .mode-poster .sector-cue { left: 50%; right: auto; top: 508px; width: 310px; transform: translateX(-50%); opacity: 0.22; }
    .layout-left.mode-poster .headline { margin: 185px auto 0; max-width: 900px; font-size: 86px; }
    .layout-left.mode-poster .panel { left: auto; right: 84px; top: 760px; width: 300px; height: 300px; }
    .layout-left.mode-poster .note { left: 86px; top: 760px; width: 610px; min-height: 250px; }
    .layout-left.mode-poster .sector-cue { left: 50%; right: auto; top: 508px; width: 310px; transform: translateX(-50%); }
    .mode-minimal main::after { display: none; }
    .mode-minimal main {
      background:
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
    }
    .mode-minimal .badge { top: 138px; background: rgba(255,250,246,0.82); color: ${accent}; border: 2px solid ${accent}; }
    .mode-minimal .badge span { border-color: ${accent}; }
    .mode-minimal .badge span::after { border-color: ${accent}; }
    .mode-minimal .headline { margin-top: 188px; max-width: 760px; font-size: 70px; }
    .mode-minimal .panel { top: 510px; right: 72px; width: 260px; height: 230px; border-radius: 28px; opacity: 0.94; }
    .mode-minimal .context-photo { left: 86px; top: 510px; width: 520px; height: 190px; border-radius: 24px; opacity: 0.80; }
    .mode-minimal .note { left: 86px; top: 780px; width: 840px; min-height: 210px; padding-left: 128px; background: rgba(255,255,255,0.58); }
    .mode-minimal .sector-cue { right: 98px; top: 520px; width: 250px; opacity: 0.22; }
    .layout-left.mode-minimal .headline { margin-left: 0; max-width: 760px; font-size: 70px; }
    .layout-left.mode-minimal .panel { left: auto; right: 72px; top: 510px; width: 260px; height: 230px; }
    .layout-left.mode-minimal .note { left: 86px; top: 780px; width: 840px; }
    .layout-left.mode-minimal .sector-cue { left: auto; right: 98px; top: 520px; width: 250px; }
    .mode-magazine main {
      background:
        linear-gradient(90deg, ${slideStyle.bgBottom} 0 34%, transparent 34%),
        radial-gradient(circle at 86% 16%, ${soft} 0 190px, transparent 191px),
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
    }
    .mode-magazine .brand { margin-left: 0; writing-mode: vertical-rl; transform: rotate(180deg); position: absolute; left: 30px; top: 112px; font-size: 28px; }
    .mode-magazine main::before { left: 104px; }
    .mode-magazine .badge { left: 124px; top: 132px; }
    .mode-magazine .headline { margin-top: 196px; margin-left: 70px; max-width: 610px; font-size: 60px; }
    .mode-magazine .context-photo { left: 124px; right: auto; top: 570px; width: 500px; height: 174px; border-radius: 24px; }
    .mode-magazine .panel { top: 420px; right: 70px; width: 320px; height: 430px; transform: rotate(-2deg); }
    .mode-magazine .note { left: 124px; top: 790px; width: 560px; }
    .mode-magazine .sector-cue { right: 100px; top: 142px; width: 220px; opacity: 0.24; }
    .layout-left.mode-magazine .panel { left: 62px; right: auto; top: 420px; width: 320px; height: 430px; }
    .layout-left.mode-magazine .note { left: 430px; top: 790px; width: 560px; }
    .layout-left.mode-magazine .sector-cue { left: 122px; right: auto; top: 190px; width: 190px; opacity: 0.22; }
    .role-hook .headline { max-width: 560px; font-size: 68px; }
    .role-hook.headline-long .headline {
      margin-left: 0;
      max-width: 900px;
      font-size: 54px;
      line-height: 1.03;
    }
    .role-hook.headline-very-long .headline {
      margin-left: 0;
      max-width: 920px;
      font-size: 46px;
      line-height: 1.04;
    }
    .role-hook .panel { top: 520px; width: 410px; height: 280px; border-radius: 30px; transform: none; }
    .role-hook.has-sector-photo .panel { display: none; }
    .role-hook.has-research-image .panel { display: none; }
    .role-hook.has-research-image .news-context { top: 520px; width: 410px; height: 280px; border-radius: 30px; }
    .layout-left.role-hook.has-research-image .news-context { left: 44px; right: auto; }
    .layout-right.role-hook.has-research-image .news-context { left: auto; right: 44px; }
    .layout-left.role-hook .panel { left: 44px; right: auto; }
    .layout-right.role-hook .panel { left: auto; right: 44px; }
    .layout-right.role-hook .headline { max-width: 520px; }
    .role-hook .note { min-height: ${Math.max(234, noteMinHeight)}px; font-size: ${Math.min(noteFontSize, 28)}px; }
    .mode-split.role-hook .note { top: 720px; }
    .role-value .note::after {
      content: "";
      position: absolute;
      right: 28px;
      top: 34px;
      width: 78px;
      height: 78px;
      border-radius: 18px;
      border: 4px solid ${accent};
      opacity: 0.18;
    }
    .role-proof .headline { margin-top: 166px; }
    .role-proof .headline::before {
      content: "ANTES / DEPOIS";
      display: block;
      margin-bottom: 18px;
      color: ${accent};
      font-size: 26px;
      line-height: 1;
      font-weight: 900;
    }
    .role-cta .badge { background: ${slideStyle.text}; color: #fff6ef; border-color: ${slideStyle.text}; }
    .role-cta .badge span { border-color: #fff6ef; }
    .role-cta .badge span::after { border-color: #fff6ef; }
    .role-cta .headline { max-width: 860px; font-size: 82px; }
    .role-cta .note { background: ${accent}; color: #fff6ef; border: 0; font-size: 24px; line-height: 1.08; min-height: ${Math.max(340, noteMinHeight)}px; padding-top: 36px; }
    .role-cta .note::before { background: #fff6ef; color: ${accent}; }
    .role-cta .note .lead,
    .role-cta .note .emphasis { color: #fff6ef; }
    .role-cta .note .lead { font-size: 0.82em; }
    .role-cta .note .emphasis { font-size: 1.12em; line-height: 1.02; }
    .role-cta .note .close { background: #fff6ef; color: ${accent}; margin-top: 18px; }
    .role-cta .progress { bottom: 156px; }
    .role-cta .save-cue { bottom: 56px; min-width: 230px; text-align: center; }
    /* Modern editorial system: inspired by native posts, product proof and clean magazine layouts. */
    .mode-native main, .mode-visual main, .mode-statement main, .mode-profile main, .mode-editorial main {
      background: linear-gradient(180deg, #ffffff 0%, ${slideStyle.bgTop} 100%);
    }
    .mode-native main::after, .mode-visual main::after, .mode-statement main::after,
    .mode-profile main::after, .mode-editorial main::after,
    .mode-native .sector-cue, .mode-visual .sector-cue, .mode-statement .sector-cue,
    .mode-profile .sector-cue, .mode-editorial .sector-cue,
    .mode-native .arrows, .mode-visual .arrows, .mode-statement .arrows,
    .mode-profile .arrows, .mode-editorial .arrows { display: none; }
    .mode-native main::before, .mode-visual main::before, .mode-statement main::before,
    .mode-profile main::before, .mode-editorial main::before { left: 58px; right: 58px; background: rgba(19,34,56,0.12); }
    .mode-native .brand, .mode-visual .brand, .mode-statement .brand,
    .mode-profile .brand, .mode-editorial .brand { margin-left: 78px; color: ${slideStyle.text}; font-size: 28px; }
    .mode-native .brand::before, .mode-visual .brand::before, .mode-statement .brand::before,
    .mode-profile .brand::before, .mode-editorial .brand::before {
      content: ""; position: absolute; left: -62px; top: -10px; width: 46px; height: 46px;
      border-radius: 50%; background: ${avatarImage || accent} center / cover no-repeat; border: 3px solid #fff;
      box-shadow: 0 5px 18px rgba(19,34,56,0.14);
    }
    .mode-native .badge, .mode-visual .badge, .mode-statement .badge,
    .mode-profile .badge, .mode-editorial .badge {
      top: 112px; left: 58px; padding: 0; border: 0; border-radius: 0; background: transparent;
      color: ${accent}; font-size: 23px; letter-spacing: .08em;
    }
    .mode-native .badge span, .mode-visual .badge span, .mode-statement .badge span,
    .mode-profile .badge span, .mode-editorial .badge span { display: none; }
    .mode-native .headline { margin-top: 118px; max-width: 900px; font-size: 66px; line-height: 1.02; }
    .mode-native .context-photo { left: 58px; right: 58px; top: 510px; width: auto; height: 430px; border: 0; border-radius: 12px; box-shadow: none; opacity: 1; }
    .mode-native .panel { display: none; }
    .mode-native .note { left: 58px; top: 970px; width: 964px; min-height: 210px; padding: 26px 30px; border: 0; border-radius: 12px; background: ${slideStyle.bgBottom}; }
    .mode-native .note::before { display: none; }
    .mode-native .note .close { background: transparent; color: ${slideStyle.text}; padding: 8px 0 0; min-height: 0; }
    .mode-visual .headline { margin: 118px 0 0; max-width: 880px; font-size: 70px; }
    .mode-visual .context-photo { left: 58px; right: 58px; top: 430px; width: auto; height: 560px; border: 0; border-radius: 18px; box-shadow: none; opacity: 1; }
    .mode-visual .panel { left: auto; right: 82px; top: 765px; width: 220px; height: 220px; border-radius: 50%; transform: none; z-index: 3; }
    .mode-visual .note { left: 58px; top: 1018px; width: 964px; min-height: 185px; padding: 24px 30px; border: 0; background: transparent; }
    .mode-visual .note::before { display: none; }
    .mode-visual .note .close { display: block; min-height: 0; padding: 8px 0 0; background: transparent; color: ${slideStyle.text}; }
    .mode-statement .badge { left: 50%; transform: translateX(-50%); }
    .mode-statement .brand { margin-left: 78px; }
    .mode-statement .headline { margin: 260px auto 0; max-width: 920px; font-size: 92px; line-height: .98; text-align: center; }
    .mode-statement .headline::before { content: ""; display: block; width: 84px; height: 8px; margin: 0 auto 42px; background: ${accent}; }
    .mode-statement .context-photo, .mode-statement .panel { display: none; }
    .mode-statement.role-proof .context-photo {
      display: block;
      left: 180px;
      right: 180px;
      top: 500px;
      width: auto;
      height: 290px;
      border: 0;
      border-radius: 20px;
      box-shadow: 0 24px 54px rgba(19,34,56,.14);
      opacity: 1;
    }
    .mode-statement .note { left: 130px; top: 820px; width: 820px; min-height: 250px; padding: 36px 44px; border: 0; background: transparent; text-align: center; }
    .mode-statement .note::before { display: none; }
    .mode-statement .note .close { display: block; min-height: 0; padding: 10px 0 0; background: transparent; color: ${slideStyle.text}; }
    .mode-profile .headline { margin-top: 118px; max-width: 820px; font-size: 72px; }
    .mode-profile .context-photo { display: none; }
    .mode-profile .panel { left: 58px; right: 58px; top: 510px; width: auto; height: 610px; border: 0; border-radius: 20px; transform: none; background-size: cover; background-position: center 18%; }
    .mode-profile .note { left: 620px; top: 890px; width: 400px; min-height: 240px; padding: 28px; border: 0; background: rgba(255,255,255,.92); }
    .mode-profile .note::before { display: none; }
    .mode-profile .note .close { display: block; min-height: 0; padding: 8px 0 0; background: transparent; color: ${slideStyle.text}; }
    .mode-editorial main { background: linear-gradient(90deg, #fff 0 43%, ${slideStyle.bgBottom} 43% 100%); }
    .mode-editorial .headline { margin: 150px 0 0 430px; max-width: 560px; font-size: 66px; }
    .mode-editorial .context-photo { left: 58px; right: auto; top: 175px; width: 380px; height: 760px; border: 0; border-radius: 12px; box-shadow: none; opacity: 1; }
    .mode-editorial .panel { display: none; }
    .mode-editorial .note { left: 480px; top: 610px; width: 520px; min-height: 360px; padding: 34px; border: 0; background: rgba(255,255,255,.66); }
    .mode-editorial .note::before { display: none; }
    .mode-editorial .note .lead { color: ${accent}; }
    .mode-editorial .note .emphasis, .mode-editorial .note .close { color: ${slideStyle.text}; }
    .mode-editorial .note .close { background: transparent; padding: 12px 0 0; }
    .mode-native .progress, .mode-visual .progress, .mode-statement .progress,
    .mode-profile .progress, .mode-editorial .progress { bottom: 82px; }
    .mode-native .save-cue, .mode-visual .save-cue, .mode-statement .save-cue,
    .mode-profile .save-cue, .mode-editorial .save-cue { bottom: 118px; }
    .mode-native .swipe-cue, .mode-visual .swipe-cue, .mode-statement .swipe-cue,
    .mode-profile .swipe-cue, .mode-editorial .swipe-cue { background: ${slideStyle.text}; font-size: 20px; }
    /* Contrast guard: modern layouts always start on a white surface. */
    .mode-native .brand, .mode-visual .brand, .mode-statement .brand,
    .mode-profile .brand, .mode-editorial .brand,
    .mode-native .headline, .mode-visual .headline, .mode-statement .headline,
    .mode-profile .headline, .mode-editorial .headline { color: #132238; }
    .mode-native .note, .mode-visual .note, .mode-statement .note,
    .mode-profile .note, .mode-editorial .note {
      background: rgba(255,255,255,.90);
      color: #132238;
    }
    .mode-native .note .emphasis, .mode-native .note .close,
    .mode-visual .note .emphasis, .mode-visual .note .close,
    .mode-statement .note .emphasis, .mode-statement .note .close,
    .mode-profile .note .emphasis, .mode-profile .note .close,
    .mode-editorial .note .emphasis, .mode-editorial .note .close { color: #132238; }
    .mode-native.role-cta .note, .mode-visual.role-cta .note, .mode-statement.role-cta .note,
    .mode-profile.role-cta .note, .mode-editorial.role-cta .note {
      background: ${accent};
      color: ${accentText};
    }
    .mode-native.role-cta .note .lead, .mode-native.role-cta .note .emphasis,
    .mode-visual.role-cta .note .lead, .mode-visual.role-cta .note .emphasis,
    .mode-statement.role-cta .note .lead, .mode-statement.role-cta .note .emphasis,
    .mode-profile.role-cta .note .lead, .mode-profile.role-cta .note .emphasis,
    .mode-editorial.role-cta .note .lead, .mode-editorial.role-cta .note .emphasis { color: ${accentText}; }
    .mode-native.role-cta .note .close, .mode-visual.role-cta .note .close,
    .mode-statement.role-cta .note .close, .mode-profile.role-cta .note .close,
    .mode-editorial.role-cta .note .close { background: ${accentText}; color: ${accent}; }
    .impact-carousel main { background: linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%); }
    .impact-carousel .brand, .impact-carousel .headline { color: ${slideStyle.text}; }
    .impact-carousel main::before { background: ${slideStyle.grid}; }
    .impact-carousel.has-sector-photo .panel { display: none; }
    .impact-carousel.has-sector-photo .context-photo {
      display: block;
      left: 58px;
      right: 58px;
      top: 430px;
      width: auto;
      height: 590px;
      border: 0;
      border-radius: 24px;
      transform: none;
      opacity: 1;
      background-position: center;
      box-shadow: 0 28px 72px rgba(0,0,0,.30);
    }
    .impact-carousel.has-sector-photo .context-photo::after {
      background: linear-gradient(180deg, rgba(5,5,5,.02) 42%, rgba(5,5,5,.64) 100%);
    }
    .impact-carousel.has-sector-photo.role-hook.has-research-image .news-context {
      left: 58px;
      right: 58px;
      top: 430px;
      width: auto;
      height: 590px;
      border-radius: 24px;
    }
    .impact-carousel.has-sector-photo.has-research-image .news-context span,
    .impact-carousel.has-sector-photo.has-research-image .news-context strong,
    .impact-carousel.has-sector-photo.has-research-image .news-context small,
    .impact-carousel.has-sector-photo.has-research-image .news-context em { display: none; }
    .impact-carousel.has-sector-photo .headline {
      margin: 152px 0 0;
      max-width: 920px;
      font-size: 66px;
      text-align: left;
    }
    .impact-carousel.has-sector-photo .note {
      left: 82px;
      top: 920px;
      width: 720px;
      min-height: 210px;
      padding: 30px 34px 30px 104px;
      background: rgba(255,255,255,.94);
      color: #111;
      box-shadow: 0 22px 54px rgba(0,0,0,.22);
    }
    .impact-carousel.has-sector-photo .note .emphasis,
    .impact-carousel.has-sector-photo .note .close { color: #111; }
    .impact-carousel.has-sector-photo .save-cue { background: #111; color: #fff; }
    .impact-carousel.has-sector-photo.role-cta .note .lead { color: ${accent}; }
    .impact-carousel.has-sector-photo.book-split .context-photo {
      left: 570px;
      right: 58px;
      top: 255px;
      width: auto;
      height: 790px;
    }
    .impact-carousel.has-sector-photo.book-split .headline {
      margin-top: 165px;
      max-width: 450px;
      font-size: 61px;
    }
    .impact-carousel.has-sector-photo.book-split .note {
      left: 70px;
      top: 790px;
      width: 450px;
      min-height: 225px;
    }
    .impact-carousel.has-sector-photo.book-split .save-cue {
      left: 570px;
      right: 58px;
      width: fit-content;
    }
    .impact-carousel.has-sector-photo.book-editorial .context-photo {
      left: 58px;
      right: auto;
      top: 330px;
      width: 555px;
      height: 735px;
    }
    .impact-carousel.has-sector-photo.book-editorial .headline {
      margin: 178px 0 0 620px;
      max-width: 402px;
      font-size: 54px;
      word-break: normal;
      overflow-wrap: normal;
    }
    .impact-carousel.has-sector-photo.book-editorial .note {
      left: 655px;
      top: 785px;
      width: 360px;
      min-height: 280px;
      padding-left: 96px;
    }
    /* Impact cards must feel intentionally filled on a phone screen. Generic
       statement/corner rules used to leave the middle half almost empty. */
    .impact-carousel.role-value .headline,
    .impact-carousel.role-proof .headline {
      margin: 185px 0 0;
      max-width: 930px;
      font-size: 76px;
      line-height: 1.01;
      text-align: left;
    }
    .impact-carousel.role-proof .headline::before { display: none; }
    .impact-carousel.role-value .note,
    .impact-carousel.role-proof .note {
      display: flex;
      flex-direction: column;
      justify-content: center;
      left: 82px;
      top: 680px;
      width: 916px;
      min-height: 330px;
      padding: 46px 52px 46px 112px;
      border-radius: 28px;
      font-size: 31px;
      line-height: 1.14;
      box-shadow: 0 24px 64px rgba(0,0,0,.18);
    }
    .impact-carousel.role-value .panel,
    .impact-carousel.role-proof .panel {
      right: 92px;
      top: 440px;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      transform: none;
      z-index: 3;
    }
    .impact-carousel.role-cta .headline {
      margin: 170px 0 0;
      max-width: 900px;
      font-size: 82px;
      line-height: 1;
      text-align: left;
    }
    .impact-carousel.role-cta .panel {
      right: 86px;
      top: 470px;
      width: 270px;
      height: 270px;
      border-radius: 50%;
      transform: none;
      z-index: 3;
    }
    .impact-carousel.role-cta .note {
      display: flex;
      flex-direction: column;
      justify-content: center;
      left: 58px;
      top: 650px;
      width: 964px;
      min-height: 420px;
      padding: 48px 54px;
      border-radius: 28px;
      font-size: 31px;
      line-height: 1.14;
    }
    .impact-carousel.role-cta .note .lead,
    .impact-carousel.role-cta .note .emphasis,
    .impact-carousel.role-cta .note .close {
      display: block;
      background: transparent;
      color: #fff6ef;
      padding: 0;
      margin-top: 16px;
    }
    .impact-carousel.role-cta .note .lead { margin-top: 0; font-size: .9em; }
    .impact-carousel.role-cta .note .emphasis { font-size: 1.1em; }
    /* A fotografia usa um cartão branco no fechamento. As regras genéricas de
       CTA vinham depois e recolocavam texto quase branco sobre esse fundo. */
    .impact-carousel.has-sector-photo.role-cta .note .lead,
    .impact-carousel.has-sector-photo.role-cta .note .emphasis,
    .impact-carousel.has-sector-photo.role-cta .note .close {
      color: #111;
    }
    .impact-carousel.role-cta .save-cue {
      bottom: 72px;
      background: #fff6ef;
      color: #111;
    }
    .impact-carousel.role-cta .progress { bottom: 150px; }
    .impact-carousel.has-sector-photo .swipe-cue {
      background: #111;
      color: #fff;
      border-color: #111;
    }
    .impact-carousel .save-cue {
      background: #111;
      color: #fff;
      border: 2px solid rgba(255,255,255,.22);
    }
    /* Reel cover: keep every essential element inside Instagram's visible crop.
       Supporting copy belongs to the following takes, not below the cover photo. */
    .reel-mode { padding-bottom: 96px; }
    .reel-mode .progress { bottom: 174px; }
    .reel-mode footer { bottom: 92px; }
    .reel-mode.role-hook .note { display: none; }
    .reel-mode.role-hook .context-photo { top: 455px; height: 1000px; }
    .impact-carousel.reel-mode.has-sector-photo.role-hook .context-photo { height: 1120px; }
    .impact-carousel.reel-mode.has-sector-photo.book-split.role-hook .context-photo {
      top: 255px;
      height: 1320px;
    }
    .impact-carousel.reel-mode.has-sector-photo.book-editorial.role-hook .context-photo {
      top: 330px;
      height: 1230px;
    }
    /* No quadro 9:16, a coluna à esquerda da foto precisa explicar a promessa
       da capa. Mantemos o corpo curto visível em vez de deixar metade vazia. */
    .impact-carousel.reel-mode.has-sector-photo.role-hook .note {
      display: flex;
      flex-direction: column;
      justify-content: center;
      left: 58px;
      top: 690px;
      width: 440px;
      min-height: 300px;
      padding: 34px 38px;
      background: rgba(255,255,255,.94);
      color: #111;
      font-size: 29px;
      line-height: 1.12;
    }
    .impact-carousel.reel-mode.has-sector-photo.role-hook .note::before { display: none; }
    .impact-carousel.reel-mode.has-sector-photo.role-hook .note .lead,
    .impact-carousel.reel-mode.has-sector-photo.role-hook .note .emphasis,
    .impact-carousel.reel-mode.has-sector-photo.role-hook .note .close {
      color: #111;
      background: transparent;
      min-height: 0;
      margin-top: 7px;
      padding: 0;
    }
    .impact-carousel.reel-mode.has-sector-photo.role-hook .note .lead { margin-top: 0; color: ${accent}; }
    .reel-mode.role-hook .panel { top: 1060px; height: 420px; }
    .reel-mode.role-hook .swipe-cue { bottom: 105px; }
    .reel-mode.role-value .note,
    .reel-mode.role-proof .note { top: 940px; min-height: 420px; }
    .reel-mode.role-value .panel,
    .reel-mode.role-proof .panel { height: 580px; }
    .reel-mode.role-cta .note { top: 820px; min-height: 570px; }
    .bubble { display: none; position: absolute; right: 116px; bottom: 270px; width: 132px; height: 96px; border-radius: 34px; background: #f1d8c7; z-index: 3; }
    .bubble::before { content: "..."; position: absolute; inset: 0; display: grid; place-items: center; color: ${accent}; font-size: 58px; line-height: 0.5; font-weight: 900; letter-spacing: 5px; }
    .spark { position: absolute; color: ${accent}; opacity: 0.7; z-index: 2; font-size: 42px; font-weight: 900; }
    .s1 { right: 400px; top: 170px; }
    .s2 { right: 126px; bottom: 108px; }
    footer { position: absolute; right: 58px; bottom: 58px; z-index: 3; color: ${accent}; font-size: 27px; font-weight: 900; }
  </style>
</head>
<body>
  <main class="${placement}${sectorPhotoClass}${imageLayoutClass}">
    <div class="brand">${usernameDisplay}</div>
    <div class="arrows">&gt;&gt;</div>
    <div class="badge"><span></span>${eyebrow}</div>
    ${swipeCue}
    ${saveCue}
    ${showNewsContext ? researchSourceCardHtml(researchSource, researchTitle, researchUrl, researchImage) : (sectorPhotoImage ? '<div class="context-photo"></div>' : '')}
    ${sectorPhotoImage || showNewsContext ? '' : sectorVisualHtml(visualCue)}
    <div class="panel${avatarClass}"></div>
    <div class="spark s1">*</div>
    <div class="spark s2">*</div>
    <section>
      <h1 class="headline">${headline}</h1>
    </section>
    <div class="note"><span class="lead">${creativeBody.lead}</span><span class="emphasis">${creativeBody.emphasis}</span><span class="close">${creativeBody.close}</span></div>
    <div class="bubble"></div>
    <div class="progress">${progressItems}</div>
    <footer>${index}/${total}</footer>
  </main>
</body>
</html>`;
}

function styleWithBrandPalette(style, account = {}, { dateString = todaySaoPaulo(), slotIndex = 0, variationSeed = 0 } = {}) {
  const palette = account.brandPalette || {};
  if (!palette.enabled) return style;
  if (!validHexColor(palette.primary) && !validHexColor(palette.secondary) && !validHexColor(palette.background)) {
    return style;
  }
  const primary = validHexColor(palette.primary) ? palette.primary.toLowerCase() : '#17211c';
  const secondary = validHexColor(palette.secondary) ? palette.secondary.toLowerCase() : style.accent;
  const background = validHexColor(palette.background) ? palette.background.toLowerCase() : style.bgTop;

  const lightTop = mixHex(background, '#ffffff', 0.18);
  const lightBottom = mixHex(background, secondary, 0.08);
  const deepPrimary = mixHex(primary, '#000000', 0.72);
  const deepSecondary = mixHex(secondary, '#000000', 0.68);
  const techTop = style.bgTop;
  const techBottom = style.bgBottom;
  const editorialTop = mixHex(primary, style.bgTop, 0.58);
  const editorialBottom = mixHex(secondary, style.bgBottom, 0.50);

  const defaultVariants = [
    paletteVariant(style, `${style.name}-brand-light`, {
      accent: secondary,
      accentSoft: rgba(secondary, 0.16),
      grid: rgba(primary, 0.10),
      bgTop: lightTop,
      bgBottom: lightBottom
    }),
    paletteVariant(style, `${style.name}-brand-deep`, {
      accent: secondary,
      accentSoft: rgba(secondary, 0.24),
      grid: rgba(secondary, 0.14),
      bgTop: deepPrimary,
      bgBottom: deepSecondary
    }),
    paletteVariant(style, `${style.name}-brand-tech`, {
      accent: validHexColor(style.accent) ? style.accent : secondary,
      accentSoft: validHexColor(style.accent) ? rgba(style.accent, 0.18) : rgba(secondary, 0.22),
      grid: validHexColor(style.accent) ? rgba(style.accent, 0.12) : rgba(secondary, 0.13),
      bgTop: techTop,
      bgBottom: techBottom
    }),
    paletteVariant(style, `${style.name}-brand-editorial`, {
      accent: validHexColor(style.accent) ? mixHex(secondary, style.accent, 0.42) : secondary,
      accentSoft: validHexColor(style.accent) ? rgba(style.accent, 0.14) : rgba(secondary, 0.18),
      grid: validHexColor(style.accent) ? rgba(style.accent, 0.09) : rgba(primary, 0.10),
      bgTop: editorialTop,
      bgBottom: editorialBottom
    })
  ];

  const anatexVariants = [
    paletteVariant(style, `${style.name}-paper`, {
      templateMode: 'paper',
      accent: secondary,
      accentSoft: rgba(secondary, 0.14),
      grid: rgba(secondary, 0.12),
      bgTop: '#f7f4ee',
      bgBottom: '#e7edf0',
      text: '#132238',
      muted: '#3b4654'
    }),
    paletteVariant(style, `${style.name}-linen`, {
      templateMode: 'paper',
      accent: '#b45f35',
      accentSoft: 'rgba(180,95,53,0.13)',
      grid: 'rgba(35,54,72,0.11)',
      bgTop: '#f8f1e8',
      bgBottom: '#e6ddd2',
      text: '#192736',
      muted: '#46515c'
    }),
    paletteVariant(style, `${style.name}-sage`, {
      templateMode: 'paper',
      accent: '#2f766d',
      accentSoft: 'rgba(47,118,109,0.12)',
      grid: 'rgba(47,118,109,0.10)',
      bgTop: '#f5f6f0',
      bgBottom: '#dfe8dc',
      text: '#14262f',
      muted: '#394a46'
    }),
    paletteVariant(style, `${style.name}-sky`, {
      templateMode: 'paper',
      accent: '#315f7d',
      accentSoft: 'rgba(49,95,125,0.12)',
      grid: 'rgba(49,95,125,0.10)',
      bgTop: '#f7fbfb',
      bgBottom: '#ddebf0',
      text: '#102333',
      muted: '#354a58'
    }),
    paletteVariant(style, `${style.name}-magazine`, {
      templateMode: 'paper',
      accent: '#8f5c42',
      accentSoft: 'rgba(143,92,66,0.13)',
      grid: 'rgba(143,92,66,0.10)',
      bgTop: '#fbf8f2',
      bgBottom: '#e5e9e2',
      text: '#17211c',
      muted: '#4c5650'
    }),
    paletteVariant(style, `${style.name}-lavender`, {
      templateMode: 'paper',
      accent: '#705b91',
      accentSoft: 'rgba(112,91,145,0.13)',
      grid: 'rgba(112,91,145,0.10)',
      bgTop: '#faf7fb',
      bgBottom: '#e8e1ed',
      text: '#1f2335',
      muted: '#514c5e'
    }),
    paletteVariant(style, `${style.name}-olive`, {
      templateMode: 'paper',
      accent: '#65713d',
      accentSoft: 'rgba(101,113,61,0.13)',
      grid: 'rgba(101,113,61,0.10)',
      bgTop: '#faf9f1',
      bgBottom: '#e8e8d6',
      text: '#20271d',
      muted: '#505744'
    })
  ];

  const impactVariants = [
    paletteVariant(style, `${style.name}-black`, {
      templateMode: 'statement', accent: '#ff3b30', accentSoft: 'rgba(255,59,48,0.16)',
      grid: 'rgba(255,255,255,0.08)', bgTop: '#050505', bgBottom: '#111111', text: '#ffffff', muted: '#e8e8e8'
    }),
    paletteVariant(style, `${style.name}-white`, {
      templateMode: 'editorial', accent: '#ff3b30', accentSoft: 'rgba(255,59,48,0.10)',
      grid: 'rgba(0,0,0,0.08)', bgTop: '#ffffff', bgBottom: '#f1f1f1', text: '#090909', muted: '#303030'
    }),
    paletteVariant(style, `${style.name}-visual`, {
      templateMode: 'visual', accent: '#ff3b30', accentSoft: 'rgba(255,59,48,0.16)',
      grid: 'rgba(255,255,255,0.08)', bgTop: '#050505', bgBottom: '#151515', text: '#ffffff', muted: '#eeeeee'
    })
  ];

  const isImpact = style.name === 'impact-carousel';
  const variants = isImpact ? impactVariants : style.layout === 'anatex-editorial' ? anatexVariants : defaultVariants;
  const variationOffset = Math.abs(Number(variationSeed) || 0) % variants.length;
  const selectedIndex = style.layout === 'anatex-editorial'
    ? (daysSinceEpoch(dateString) + slotIndex + variationOffset) % variants.length
    : (pickDailyIndex(variants, dateString, slotIndex) + variationOffset) % variants.length;
  const slidePalettes = style.layout === 'anatex-editorial' && !isImpact
    ? [variants[selectedIndex]]
    : rotateItems(variants, selectedIndex);
  return {
    ...slidePalettes[0],
    name: `${slidePalettes[0].name}-slot-${slotIndex}`,
    slidePalettes
  };
}

function pickVisualStyle(styles, account, dateString, slotIndex) {
  const requested = account.contentProfile?.visualDirection;
  if (requested) {
    const configured = styles.find((style) => style.name === requested || style.layout === requested);
    if (configured) return configured;
  }
  return pickDaily(styles, dateString, slotIndex);
}

function validatePack(pack) {
  assertNoMojibake(pack.caption);
  assertPortugueseAccents(pack.caption);
  if (String(pack.caption || '').length > INSTAGRAM_CAPTION_MAX_LENGTH) {
    throw new Error(`Legenda excede o limite seguro do Instagram (${String(pack.caption || '').length}/${INSTAGRAM_CAPTION_MAX_LENGTH}).`);
  }
  if (!Array.isArray(pack.slides) || pack.slides.length < 2) throw new Error('Cada pack precisa de pelo menos 2 slides.');
  for (const slide of pack.slides) {
    const hasImage = Boolean(slide.imagePath || slide.imageUrl);
    const text = `${slide.eyebrow}\n${slide.title}\n${slide.body}`;
    assertNoMojibake(text);
    assertPortugueseAccents(text);
    if (!hasImage && (!slide.eyebrow || !slide.title || !slide.body)) {
      throw new Error('Slides sem imagem precisam de banner, titulo e descricao.');
    }
    if (isPredominantlyEnglish(text)) {
      throw new Error('Publicacao bloqueada: um slide ainda contém texto predominantemente em inglês.');
    }
  }
  const captionWithoutUrls = String(pack.caption || '').replace(/https?:\/\/\S+/gi, '');
  if (isPredominantlyEnglish(captionWithoutUrls)) {
    throw new Error('Publicacao bloqueada: a legenda ainda contém texto predominantemente em inglês.');
  }
  if (pack.research) {
    const sourceUrl = String(pack.research.sourceUrl || '').trim();
    const sourceTitle = String(pack.research.sourceTitle || '').trim();
    const sourceFact = String(pack.research.sourceFact || '').trim();
    if (!/^https:\/\//i.test(sourceUrl)) throw new Error('Radar bloqueado: link HTTPS da matéria original ausente.');
    if (sourceTitle.length < 12) throw new Error('Radar bloqueado: título original da matéria ausente ou insuficiente.');
    if (sourceFact.length < 45 || normalizeContentFingerprint(sourceFact) === normalizeContentFingerprint(sourceTitle)) {
      throw new Error('Radar bloqueado: o contexto factual apenas repete o título da matéria.');
    }
    if (/^a matéria informa:?/i.test(sourceFact)) {
      throw new Error('Radar bloqueado: o fato da matéria não pode ser um rótulo repetindo o título.');
    }
    const sourceFacts = Array.isArray(pack.research.sourceFacts) ? pack.research.sourceFacts : [sourceFact];
    if (sourceFacts.some((fact) => isPredominantlyEnglish(fact))) {
      throw new Error('Radar bloqueado: o conteúdo principal da matéria ainda está em inglês.');
    }
    const firstComment = String(pack.firstComment || '').trim();
    if (!isPredominantlyEnglish(sourceTitle) && !firstComment.includes(sourceTitle)) throw new Error('Radar bloqueado: o primeiro comentário não apresenta o título original da matéria.');
    if (!firstComment.includes(sourceUrl)) throw new Error('Radar bloqueado: o primeiro comentário não contém o link completo da matéria.');
    if (!isPredominantlyEnglish(sourceTitle) && !String(pack.caption || '').includes(sourceTitle)) throw new Error('Radar bloqueado: a legenda não apresenta o título original da matéria.');
    if (!String(pack.caption || '').includes(sourceUrl)) throw new Error('Radar bloqueado: a legenda não contém o link completo da matéria como garantia.');
    const coverTitle = String(pack.slides?.[0]?.title || '');
    if (FORBIDDEN_GENERIC_RESEARCH_COVERS.some((pattern) => pattern.test(coverTitle))) {
      throw new Error('Radar bloqueado: capa genérica sem contexto real da matéria.');
    }
    if (pack.slides.some((slide) => slide.researchSource !== pack.research.source || slide.researchTitle !== sourceTitle || slide.researchUrl !== sourceUrl)) {
      throw new Error('Radar bloqueado: o anexo visual não identifica fonte, título e link da matéria real.');
    }
    if (isPredominantlyEnglish(sourceTitle) && pack.slides.some((slide) => !slide.researchDisplayTitle || isPredominantlyEnglish(slide.researchDisplayTitle))) {
      throw new Error('Radar bloqueado: o cartão visual da fonte ainda apresenta o título em inglês.');
    }
  }
}

function validatePacks(packs) {
  packs.forEach(validatePack);
}

async function fetchWithContext(url, options, label) {
  try {
    return await fetch(url, options);
  } catch (error) {
    const cause = error.cause || error;
    const detail = [cause.code, cause.message].filter(Boolean).join(': ');
    const wrapped = new Error(`${label} request failed${detail ? ` (${detail})` : ''}`);
    wrapped.stage = label;
    wrapped.causeCode = cause.code;
    wrapped.retryable = !cause.code || RETRYABLE_CODES.has(cause.code);
    throw wrapped;
  }
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function retryDelay(attempt) {
  return RETRY_BASE_DELAY_MS * (2 ** (attempt - 1));
}

function createHttpError(label, status, body) {
  const bodyPreview = body.slice(0, 1200);
  const error = new Error(`${label} failed [${status}]: ${bodyPreview}`);
  let payload = null;
  try {
    payload = body ? JSON.parse(body) : null;
  } catch {
    payload = null;
  }
  const graphError = payload?.error;
  const graphMediaTimeout = graphError
    && (graphError.code === -2
      || graphError.error_subcode === 2207003
      || /timeout|tempo limite|download da m[ií]dia/i.test(`${graphError.message || ''} ${graphError.error_user_msg || ''}`));
  const graphMediaDownloadRejected = graphError
    && graphError.code === 9004
    && graphError.error_subcode === 2207052;
  const githubRefRace = label.startsWith('GitHub ')
    && status === 422
    && /update is not a fast forward/i.test(String(payload?.message || body));
  error.stage = label;
  error.status = status;
  error.responseBody = bodyPreview;
  error.retryable = RETRYABLE_STATUS.has(status)
    || Boolean(graphMediaTimeout)
    || Boolean(graphMediaDownloadRejected)
    || githubRefRace;
  error.mediaUrlRejected = Boolean(graphMediaDownloadRejected);
  return error;
}

async function withRetry(label, operation, attempts = RETRY_ATTEMPTS) {
  const maxAttempts = Number.isInteger(attempts) && attempts > 0 ? attempts : 1;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      error.stage = error.stage || label;
      error.attempt = attempt;
      error.attempts = maxAttempts;
      const canRetry = error.retryable && attempt < maxAttempts;
      if (!canRetry) break;

      const delay = retryDelay(attempt);
      console.warn(`${label} falhou na tentativa ${attempt}/${maxAttempts}; tentando de novo em ${Math.round(delay / 1000)}s. ${error.message}`);
      await sleep(delay);
    }
  }

  throw lastError;
}

function localChromiumExecutable() {
  const explicitPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || process.env.CHROME_EXECUTABLE_PATH;
  if (explicitPath) return explicitPath;

  if (process.platform !== 'win32') return null;

  const candidates = [
    process.env.ProgramFiles && join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env['ProgramFiles(x86)'] && join(process.env['ProgramFiles(x86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.ProgramFiles && join(process.env.ProgramFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env['ProgramFiles(x86)'] && join(process.env['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe')
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate)) || null;
}

async function launchChromium() {
  const executablePath = localChromiumExecutable();
  return executablePath ? chromium.launch({ executablePath }) : chromium.launch();
}

function slideHtml(slide, index, total, account, style, renderContext = {}) {
  if (style.layout === 'anatex-editorial' || account.contentProfile?.visualDirection === 'anatex-editorial') {
    return anatexSlideHtml(slide, index, total, account, style, renderContext);
  }
  const slideStyle = styleForSlide(style, index);
  const variant = slide.visualVariant || 'focus';
  const titleSize = variant === 'quote' ? 74 : variant === 'signal' ? 86 : 82;
  const bodySize = variant === 'numbered' ? 40 : 42;
  const align = variant === 'quote' ? 'center' : 'left';
  const rail = variant === 'numbered'
    ? `<div class="rail">${String(index).padStart(2, '0')}</div>`
    : '';
  const signal = variant === 'signal'
    ? '<div class="signal"><span></span><span></span><span></span></div>'
    : '';
  const usernameDisplay = accountUsernameDisplay(account);
  const isReelMode = renderContext.publishMode === 'reel-only' || renderContext.publishMode === 'reel-and-story';
  const outputHeight = isReelMode ? STORY_HEIGHT : FEED_HEIGHT;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: ${FEED_WIDTH}px; height: ${outputHeight}px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${slideStyle.bgTop}; color: ${slideStyle.text}; }
    main {
      width: ${FEED_WIDTH}px;
      height: ${outputHeight}px;
      padding: 62px 70px 58px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        linear-gradient(135deg, ${slideStyle.accentSoft}, ${rgba(slideStyle.accent, 0)} 34%),
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
      position: relative;
    }
    main::before { content: ""; position: absolute; inset: 34px; border: 2px solid rgba(244,247,245,0.1); }
    main::after {
      content: "";
      position: absolute;
      right: -80px;
      top: 150px;
      width: 450px;
      height: 780px;
      background:
        linear-gradient(90deg, ${slideStyle.grid} 1px, transparent 1px),
        linear-gradient(180deg, ${slideStyle.grid} 1px, transparent 1px);
      background-size: 46px 46px;
      transform: rotate(-7deg);
    }
    .rail { position: absolute; left: 70px; bottom: 160px; font-size: 150px; line-height: 1; font-weight: 900; color: ${slideStyle.accent}; opacity: 0.16; z-index: 1; }
    .signal { position: absolute; right: 70px; bottom: 92px; display: flex; gap: 14px; z-index: 1; }
    .signal span { width: 16px; height: 88px; border-radius: 99px; background: ${slideStyle.accent}; opacity: 0.28; }
    .signal span:nth-child(2) { height: 132px; opacity: 0.52; }
    .signal span:nth-child(3) { height: 62px; opacity: 0.2; }
    section, footer { position: relative; z-index: 2; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 28px; }
    .brand { font-size: 34px; font-weight: 900; color: ${slideStyle.text}; }
    .eyebrow { font-size: 28px; font-weight: 900; color: ${slideStyle.accent}; text-transform: uppercase; text-align: right; }
    .content { display: flex; flex-direction: column; gap: 34px; text-align: ${align}; align-items: ${align === 'center' ? 'center' : 'flex-start'}; }
    h1 { max-width: 850px; font-size: ${titleSize}px; line-height: 1.03; font-weight: 900; color: ${slideStyle.text}; letter-spacing: 0; }
    p { max-width: 830px; font-size: ${bodySize}px; line-height: 1.18; font-weight: 800; color: ${slideStyle.muted}; letter-spacing: 0; }
    .bar { width: ${index % 2 === 0 ? '148px' : '220px'}; height: 12px; background: ${slideStyle.accent}; }
    footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; color: ${slideStyle.muted}; font-size: 26px; font-weight: 800; }
    footer strong { display: block; color: ${slideStyle.text}; font-size: 30px; font-weight: 900; }
  </style>
</head>
<body>
  <main class="${isReelMode ? 'reel-mode' : ''}">
    ${rail}
    ${signal}
    <section class="top">
      <div class="brand">${usernameDisplay}</div>
      <div class="eyebrow">${slide.eyebrow}</div>
    </section>
    <section class="content">
      <div class="bar"></div>
      <h1>${slide.title}</h1>
      <p>${slide.body}</p>
    </section>
    <footer>
      <div><strong>${account.brandName}</strong>${account.footerText}</div>
      <div>${index}/${total}</div>
    </footer>
  </main>
</body>
</html>`;
}

async function renderSlides(runDir, slides, account, style, renderContext = {}) {
  const browser = await launchChromium();
  const isReelMode = renderContext.publishMode === 'reel-only' || renderContext.publishMode === 'reel-and-story';
  const outputHeight = isReelMode ? STORY_HEIGHT : FEED_HEIGHT;
  const page = await browser.newPage({ viewport: { width: FEED_WIDTH, height: outputHeight }, deviceScaleFactor: 1 });
  const imagePaths = [];
  for (let index = 0; index < slides.length; index += 1) {
    let slide = slides[index];
    const imagePath = join(runDir, `slide-${String(index + 1).padStart(2, '0')}.jpg`);
    if (slide.imageUrl) {
      const downloadedImagePath = await downloadExternalSlideImage(slide.imageUrl, runDir, index + 1);
      slide = { ...slide, imagePath: downloadedImagePath, imageUrl: '' };
    }
    if (slide.imagePath && !String(style.name || '').startsWith('impact-carousel')) {
      const source = resolve(ROOT, String(slide.imagePath).replace(/^\/+/, ''));
      if (!existsSync(source)) throw new Error(`Imagem do slide ${index + 1} nao encontrada: ${slide.imagePath}`);
      const customImagePath = join(runDir, `slide-${String(index + 1).padStart(2, '0')}${extname(source).toLowerCase() || '.jpg'}`);
      copyFileSync(source, customImagePath);
      imagePaths.push(customImagePath);
      continue;
    }
    const html = slideHtml(slide, index + 1, slides.length, account, style, renderContext);
    assertNoMojibake(html);
    assertPortugueseAccents(`${slide.eyebrow}\n${slide.title}\n${slide.body}`);
    const htmlPath = join(runDir, `slide-${String(index + 1).padStart(2, '0')}.html`);
    writeFileSync(htmlPath, html, 'utf8');
    await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);
    const overlapCheck = await page.evaluate(() => {
      const headline = document.querySelector('.headline');
      const note = document.querySelector('.note');
      if (!headline) return { corrected: 0, collisions: [] };
      const headlineRect = headline.getBoundingClientRect();
      const noteRect = note?.getBoundingClientRect();
      const visuals = [...document.querySelectorAll('.panel, .context-photo')].filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0;
      });
      let corrected = 0;
      const intersectsHeadline = (rect) => !(
        rect.right <= headlineRect.left
        || rect.left >= headlineRect.right
        || rect.bottom <= headlineRect.top
        || rect.top >= headlineRect.bottom
      );
      const intersects = (first, second) => !(
        first.right <= second.left
        || first.left >= second.right
        || first.bottom <= second.top
        || first.top >= second.bottom
      );
      const headlineIntersectsNote = () => {
        if (!note || getComputedStyle(note).display === 'none') return false;
        return intersects(headline.getBoundingClientRect(), note.getBoundingClientRect());
      };
      // O cartao de apoio tambem e um bloco visual. Titulos longos em layouts
      // editoriais podiam crescer por baixo dele sem que a validacao percebesse.
      for (let pass = 0; pass < 4 && headlineIntersectsNote(); pass += 1) {
        const headlineStyle = getComputedStyle(headline);
        headline.style.fontSize = `${Math.max(38, Math.floor(parseFloat(headlineStyle.fontSize) * 0.88))}px`;
        headline.style.lineHeight = '0.96';
        corrected += 1;
      }
      if (headlineIntersectsNote()) {
        const headlineBottom = Math.ceil(headline.getBoundingClientRect().bottom);
        const noteHeight = Math.ceil(note.getBoundingClientRect().height);
        const desiredTop = headlineBottom + 28;
        if (desiredTop + noteHeight <= 1120) {
          note.style.top = `${desiredTop}px`;
          corrected += 1;
        }
      }
      const canvasSafeBottom = document.body.clientHeight > 1350 ? document.body.clientHeight - 260 : 1120;
      const safeBottomFor = (rect) => {
        const overlapsNoteHorizontally = noteRect
          && rect.right > noteRect.left
          && rect.left < noteRect.right;
        return Math.floor(Math.min(overlapsNoteHorizontally ? noteRect.top - 28 : canvasSafeBottom, canvasSafeBottom));
      };
      for (const visual of visuals) {
        const rect = visual.getBoundingClientRect();
        if (!intersectsHeadline(rect)) continue;
        const safeTop = Math.ceil(headlineRect.bottom + 34);
        const safeBottom = safeBottomFor(rect);
        const safeHeight = safeBottom - safeTop;
        const preserveCoverPhoto = visual.classList.contains('panel') && document.querySelector('main')?.classList.contains('role-hook');
        const minimumHeight = preserveCoverPhoto ? 280 : 150;
        if (safeHeight >= minimumHeight) {
          visual.style.top = `${safeTop}px`;
          visual.style.height = `${Math.max(minimumHeight, Math.min(Math.round(rect.height), safeHeight))}px`;
          corrected += 1;
        } else if (!preserveCoverPhoto) {
          // Em slides internos a foto e apoio visual. Se um titulo factual
          // longo ocupar a area disponivel, preservar a leitura e ocultar o
          // apoio e melhor do que bloquear toda a publicacao.
          visual.style.display = 'none';
          corrected += 1;
        }
      }
      const visibleVisuals = visuals.filter((visual) => getComputedStyle(visual).display !== 'none');
      for (let firstIndex = 0; firstIndex < visibleVisuals.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < visibleVisuals.length; secondIndex += 1) {
          const first = visibleVisuals[firstIndex];
          const second = visibleVisuals[secondIndex];
          const ordered = [first, second].sort((left, right) => left.getBoundingClientRect().top - right.getBoundingClientRect().top);
          const upperRect = ordered[0].getBoundingClientRect();
          const lowerRect = ordered[1].getBoundingClientRect();
          if (!intersects(upperRect, lowerRect)) continue;
          const safeTop = Math.ceil(upperRect.bottom + 24);
          const safeBottom = safeBottomFor(lowerRect);
          if (safeTop + lowerRect.height <= safeBottom) {
            ordered[1].style.top = `${safeTop}px`;
            corrected += 1;
          }
        }
      }
      const collisions = visibleVisuals
        .filter((visual) => getComputedStyle(visual).display !== 'none' && intersectsHeadline(visual.getBoundingClientRect()))
        .map((visual) => visual.className);
      if (headlineIntersectsNote()) collisions.push('headline x note');
      for (let firstIndex = 0; firstIndex < visibleVisuals.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < visibleVisuals.length; secondIndex += 1) {
          const firstRect = visibleVisuals[firstIndex].getBoundingClientRect();
          const secondRect = visibleVisuals[secondIndex].getBoundingClientRect();
          if (intersects(firstRect, secondRect)) {
            collisions.push(`${visibleVisuals[firstIndex].className} x ${visibleVisuals[secondIndex].className}`);
          }
        }
      }
      return { corrected, collisions };
    });
    if (overlapCheck.collisions.length) {
      throw new Error(`Slide ${index + 1} rejeitado: imagem sobrepoe o titulo (${overlapCheck.collisions.join(', ')}).`);
    }
    await page.screenshot({ path: imagePath, type: 'jpeg', quality: 94, fullPage: false });
    imagePaths.push(imagePath);
  }
  await browser.close();
  return imagePaths;
}

function anatexStoryHtml(slide, account, style, renderContext = {}) {
  const slideStyle = styleForSlide(style, 1);
  const title = anatexTitle(slide.title || '');
  const body = applyAnatexCopyRules(slide.body || '');
  // O Story tem menos area util que o carrossel. Mostra a primeira ideia
  // completa e deixa a explicacao integral para a legenda/carrossel, evitando
  // que um segundo periodo avance sobre a fotografia.
  const storyBody = body.split(/(?<=[.!])\s+/).filter(Boolean)[0] || body;
  const eyebrow = applyAnatexCopyRules(slide.eyebrow || 'Pra saber');
  const accent = slideStyle.accent || '#a7563d';
  const mode = slideStyle.templateMode || 'native';
  const storyTitleLength = String(slide.title || '').trim().length;
  const titleClass = storyTitleLength >= 95 ? ' title-very-long' : (storyTitleLength >= 55 ? ' title-long' : '');
  const soft = slideStyle.accentSoft || 'rgba(167,86,61,0.16)';
  const visualCue = slide.visualCue || visualCueForAccount(account, `${slide.title || ''} ${slide.body || ''} ${slide.eyebrow || ''}`);
  const researchSource = String(slide.researchSource || '').trim();
  const researchTitle = String(slide.researchDisplayTitle || slide.researchTitle || '').trim();
  const researchUrl = String(slide.researchUrl || '').trim();
  const showNewsContext = Boolean(researchSource);
  const hasFeedContinuation = renderContext.publishMode !== 'story-only';
  const feedContinuationText = 'Confira o conteúdo completo no feed.';
  const researchImage = fileCssImage(renderContext.researchSourceImagePath || '');
  const avatarImage = accountAvatarCssImage(account, 0, visualCue, { ...renderContext, story: true });
  const explicitStoryImage = slide.imagePath
    ? fileCssImage(resolve(ROOT, String(slide.imagePath).replace(/^\/+/, '')))
    : '';
  // A URL editorial pode existir no feed e ainda apontar para vídeo/embed ou
  // falhar no download. Nesse caso o Story precisa manter uma fotografia real
  // do rodízio, nunca um retângulo degradê tratado como imagem.
  const fallbackStoryImage = explicitStoryImage || sectorPhotoCssImage(visualCue, 0, renderContext);
  const storyVisualImage = researchImage || fallbackStoryImage;
  const storyPhotoClass = storyVisualImage ? ' has-story-photo' : '';
  const avatarBlock = showNewsContext
    ? ''
    : (avatarImage ? `<div class="avatar"></div>` : `<div class="panel"><span>IA</span></div>`);
  const usernameDisplay = accountUsernameDisplay(account);
  const isImpactStyle = String(style.name || '').startsWith('impact-carousel');
  const impactClass = isImpactStyle ? ' impact-carousel' : '';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: ${STORY_WIDTH}px; height: ${STORY_HEIGHT}px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${slideStyle.bgTop}; color: ${slideStyle.text}; }
    main {
      width: ${STORY_WIDTH}px;
      height: ${STORY_HEIGHT}px;
      padding: ${STORY_SAFE_TOP}px 72px ${STORY_SAFE_BOTTOM}px;
      position: relative;
      background:
        radial-gradient(circle at 84% 8%, ${soft} 0 210px, transparent 211px),
        radial-gradient(circle at 14% 92%, rgba(167,86,61,0.10) 0 260px, transparent 261px),
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
    }
    main::before { content: ""; position: absolute; left: 72px; right: 72px; top: ${STORY_SAFE_TOP}px; height: 2px; background: rgba(167,86,61,0.42); }
    .brand { position: relative; z-index: 2; margin-left: 52px; color: ${accent}; font-size: 42px; font-weight: 900; }
    .badge { position: relative; z-index: 2; margin-top: 54px; display: inline-flex; padding: 18px 32px; border-radius: 18px; background: ${accent}; color: #fff6ef; font-size: 34px; line-height: 1; font-weight: 900; text-transform: uppercase; }
    h1 { position: relative; z-index: 2; margin-top: 54px; max-width: 850px; font-size: 92px; line-height: 0.98; letter-spacing: 0; font-weight: 900; color: #111; }
    h1 strong { color: ${accent}; font: inherit; }
    p { position: relative; z-index: 2; margin-top: 34px; max-width: 500px; font-size: 40px; line-height: 1.16; font-weight: 800; color: #3f332d; }
    .feed-cta { position: relative; z-index: 3; margin-top: 28px; display: inline-flex; max-width: 500px; padding: 20px 28px; border-radius: 18px; background: #132238; color: #fff; font-size: 30px; line-height: 1.12; font-weight: 900; }
    .avatar, .panel {
      position: absolute;
      right: 82px;
      bottom: ${STORY_SAFE_BOTTOM}px;
      width: 390px;
      height: 520px;
      border-radius: 36px;
      transform: rotate(3deg);
      border: 8px solid rgba(255,250,246,0.92);
      box-shadow: 0 30px 80px rgba(94,50,34,0.22);
      overflow: hidden;
      z-index: 1;
    }
    .avatar {
      background-color: rgba(255,250,246,0.82);
      background-image: ${avatarImage || 'none'};
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
    }
    .avatar::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,246,239,0.03), rgba(17,17,17,0.18)); }
    .panel { background: rgba(255,255,255,0.50); display: grid; place-items: center; }
    .panel span { color: rgba(167,86,61,0.18); font-size: 124px; font-weight: 900; }
    .note { position: absolute; left: 72px; bottom: ${STORY_SAFE_BOTTOM + 20}px; z-index: 2; width: 600px; padding: 28px 36px; border-radius: 28px; background: rgba(255,250,246,0.78); border: 2px solid rgba(167,86,61,0.18); color: #211915; font-size: 31px; line-height: 1.18; font-weight: 900; }
    footer { position: absolute; left: 72px; bottom: ${STORY_SAFE_BOTTOM + 4}px; color: ${accent}; font-size: 30px; font-weight: 900; z-index: 2; }
    .visual-card { display: none; position: absolute; left: 72px; right: 72px; top: 820px; height: 610px; border-radius: 24px; background: ${storyVisualImage || slideStyle.bgBottom} center / cover no-repeat; }
    .visual-card.news-context-story { display: none; padding: 56px; background-image: ${storyVisualImage ? `linear-gradient(180deg, rgba(9,20,31,.08), rgba(9,20,31,.38)), ${storyVisualImage}` : 'none'}; background-position: center; background-size: cover; color: #fffaf7; }
    .news-context-story span, .news-context-story strong, .news-context-story small { display: block; position: relative; z-index: 1; }
    .news-context-story span { font-size: 26px; font-weight: 900; letter-spacing: .12em; }
    .news-context-story strong { margin-top: 26px; font-size: 78px; line-height: .95; }
    .news-context-story small { margin-top: 28px; max-width: 470px; font-size: 28px; line-height: 1.12; font-weight: 800; }
    .news-context-story { justify-content: flex-end; padding: 30px; }
    .news-context-story strong { margin-top: 10px; font-size: 48px; line-height: .98; }
    .news-context-story small { display: none; }
    .mode-native main, .mode-visual main, .mode-statement main, .mode-profile main, .mode-editorial main { background: linear-gradient(180deg, #fff 0%, ${slideStyle.bgTop} 100%); }
    .mode-native main::before, .mode-visual main::before, .mode-statement main::before, .mode-profile main::before, .mode-editorial main::before { background: rgba(19,34,56,.12); }
    .mode-native .brand, .mode-visual .brand, .mode-statement .brand, .mode-profile .brand, .mode-editorial .brand { color: ${slideStyle.text}; }
    .mode-native .badge, .mode-visual .badge, .mode-statement .badge, .mode-profile .badge, .mode-editorial .badge { background: transparent; color: ${accent}; padding: 0; letter-spacing: .08em; }
    .mode-native h1 { font-size: 86px; max-width: 900px; }
    .mode-native p { max-width: 500px; font-size: 39px; }
    .mode-native .avatar { right: 72px; bottom: ${STORY_SAFE_BOTTOM}px; width: 360px; height: 400px; border-radius: 22px; transform: none; }
    .mode-visual h1 { margin-top: 46px; font-size: 80px; }
    .mode-visual p { font-size: 40px; }
    .mode-visual .visual-card { display: block; }
    .mode-visual .avatar { width: 220px; height: 220px; right: 100px; bottom: ${STORY_SAFE_BOTTOM + 70}px; border-radius: 50%; transform: none; }
    .mode-statement .badge { display: block; margin-top: 170px; text-align: center; }
    .mode-statement h1 { margin: 160px auto 0; max-width: 920px; font-size: 104px; text-align: center; }
    .mode-statement h1::before { content: ""; display: block; width: 100px; height: 10px; margin: 0 auto 56px; background: ${accent}; }
    .mode-statement p { margin: 52px auto 0; max-width: 850px; text-align: center; }
    .mode-statement .avatar, .mode-statement .panel, .mode-statement .note { display: none; }
    .mode-profile h1 { font-size: 86px; }
    .mode-profile .avatar { left: 72px; right: 72px; bottom: ${STORY_SAFE_BOTTOM}px; width: auto; height: 760px; border-radius: 26px; transform: none; background-position: center 18%; }
    .mode-profile .note { left: 520px; bottom: ${STORY_SAFE_BOTTOM + 40}px; width: 488px; background: rgba(255,255,255,.92); }
    .mode-editorial main { background: linear-gradient(90deg, #fff 0 60%, ${slideStyle.bgBottom} 60%); }
    .mode-editorial h1 { max-width: 610px; font-size: 82px; }
    .mode-editorial p { max-width: 560px; font-size: 39px; }
    .mode-editorial .visual-card { display: block; left: 650px; right: 56px; top: 520px; height: 720px; }
    .mode-editorial .avatar { right: 92px; bottom: ${STORY_SAFE_BOTTOM + 20}px; width: 300px; height: 390px; transform: none; }
    .title-long { padding-left: 88px; padding-right: 88px; }
    .title-long::before { left: 88px; right: 88px; }
    .title-long .brand { margin-left: 0; font-size: 38px; }
    .title-long .badge { margin-top: 46px; font-size: 31px; }
    .title-long h1 { margin-top: 42px; max-width: 860px; font-size: 64px; line-height: .98; }
    .title-long p { margin-top: 24px; max-width: 540px; font-size: 33px; }
    .title-long .feed-cta { margin-top: 20px; max-width: 540px; padding: 18px 25px; font-size: 27px; }
    .title-long .avatar { right: 88px; bottom: ${STORY_SAFE_BOTTOM}px; width: 340px; height: 430px; transform: none; }
    .title-long .note { left: 88px; bottom: ${STORY_SAFE_BOTTOM + 120}px; width: 560px; padding: 24px 30px; }
    .title-long footer { left: 88px; bottom: ${STORY_SAFE_BOTTOM + 40}px; }
    .title-very-long .badge { margin-top: 62px; }
    .title-very-long h1 { margin-top: 58px; max-width: 900px; font-size: 50px; line-height: 1.04; }
    .title-very-long p { margin-top: 34px; font-size: 30px; line-height: 1.22; }
    .title-very-long .feed-cta { margin-top: 30px; max-width: 540px; font-size: 25px; }
    .title-very-long .avatar { width: 320px; height: 400px; }
    .impact-carousel main { background: linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%); }
    .impact-carousel h1 { color: ${slideStyle.text}; }
    .impact-carousel p { color: ${slideStyle.muted}; }
    .impact-carousel .feed-cta { background: ${accent}; color: #fff; }
    .impact-carousel.has-story-photo .visual-card { display: block; left: 72px; right: 72px; top: 980px; height: 720px; border-radius: 30px; background-position: center; box-shadow: 0 28px 72px rgba(0,0,0,.28); }
    .impact-carousel.has-story-photo .avatar, .impact-carousel.has-story-photo .panel, .impact-carousel.has-story-photo .note { display: none; }
    /* The handle already identifies the account at the top. Repeating the
       personal name over the lower photograph looks like an accidental
       watermark and competes with the editorial image. */
    .impact-carousel.has-story-photo footer { display: none; }
    .impact-carousel.has-story-photo.mode-statement .badge { margin-top: 62px; text-align: left; }
    .impact-carousel.has-story-photo.mode-statement h1 { margin: 52px 0 0; max-width: 900px; font-size: 68px; text-align: left; }
    .impact-carousel.has-story-photo.mode-statement h1::before { width: 84px; height: 9px; margin: 0 0 34px; }
    .impact-carousel.has-story-photo.mode-statement p { margin: 28px 0 0; max-width: 850px; font-size: 31px; text-align: left; }
    .impact-carousel.has-story-photo.mode-statement .feed-cta { margin-top: 22px; max-width: 560px; padding: 16px 22px; font-size: 27px; }
  </style>
</head>
<body>
  <main class="mode-${mode}${titleClass}${impactClass}${storyPhotoClass}">
    <div class="brand">${usernameDisplay}</div>
    <div class="badge">${eyebrow}</div>
    <h1>${title.replace(/\s+IA\b/i, ' <strong>IA</strong>')}</h1>
    <p>${storyBody}</p>
    ${hasFeedContinuation ? `<div class="feed-cta">${feedContinuationText}</div>` : ''}
    <div class="visual-card${showNewsContext ? ' news-context-story' : ''}"${showNewsContext && !isImpactStyle ? ` style="display:block;left:auto;right:72px;top:auto;bottom:${STORY_SAFE_BOTTOM}px;width:390px;height:460px;"` : ''}>${showNewsContext && !isImpactStyle ? `<span>FONTE OFICIAL</span><strong>${htmlText(researchSource)}</strong><small>${htmlText(researchTitle)}</small><small>Matéria identificada · link na legenda</small>` : ''}</div>
    ${avatarBlock}
    <div class="note">${account.footerText}</div>
    <footer>${account.brandName}</footer>
  </main>
</body>
</html>`;
}

function storyHtml(slide, account, style, renderContext = {}) {
  if (style.layout === 'anatex-editorial' || account.contentProfile?.visualDirection === 'anatex-editorial') {
    return anatexStoryHtml(slide, account, style, renderContext);
  }
  const slideStyle = styleForSlide(style, 1);
  const variant = slide.visualVariant || 'focus';
  const titleSize = variant === 'quote' ? 82 : 90;
  const align = variant === 'quote' ? 'center' : 'left';
  const usernameDisplay = accountUsernameDisplay(account);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: ${STORY_WIDTH}px; height: ${STORY_HEIGHT}px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${slideStyle.bgTop}; color: ${slideStyle.text}; }
    main {
      width: ${STORY_WIDTH}px;
      height: ${STORY_HEIGHT}px;
      padding: ${STORY_SAFE_TOP}px 76px ${STORY_SAFE_BOTTOM}px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        linear-gradient(135deg, ${slideStyle.accentSoft}, ${rgba(slideStyle.accent, 0)} 40%),
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
      position: relative;
    }
    main::before { content: ""; position: absolute; left: 48px; right: 48px; top: ${STORY_SAFE_TOP}px; bottom: ${STORY_SAFE_BOTTOM}px; border: 2px solid rgba(244,247,245,0.1); }
    main::after {
      content: "";
      position: absolute;
      right: -120px;
      top: 270px;
      width: 520px;
      height: 1120px;
      background:
        linear-gradient(90deg, ${slideStyle.grid} 1px, transparent 1px),
        linear-gradient(180deg, ${slideStyle.grid} 1px, transparent 1px);
      background-size: 50px 50px;
      transform: rotate(-7deg);
    }
    .story-mark { position: absolute; right: 76px; bottom: 180px; width: 180px; height: 180px; border: 18px solid ${slideStyle.accent}; border-radius: 50%; opacity: 0.18; z-index: 1; }
    section, footer { position: relative; z-index: 2; }
    .brand { font-size: 38px; font-weight: 900; color: ${slideStyle.text}; }
    .eyebrow { font-size: 32px; font-weight: 900; color: ${slideStyle.accent}; text-transform: uppercase; margin-top: 110px; }
    .content { display: flex; flex-direction: column; gap: 38px; text-align: ${align}; align-items: ${align === 'center' ? 'center' : 'flex-start'}; }
    .bar { width: 210px; height: 14px; background: ${slideStyle.accent}; }
    h1 { max-width: 880px; font-size: ${titleSize}px; line-height: 1.03; font-weight: 900; color: ${slideStyle.text}; letter-spacing: 0; }
    p { max-width: 850px; font-size: 44px; line-height: 1.2; font-weight: 800; color: ${slideStyle.muted}; letter-spacing: 0; }
    footer { color: ${slideStyle.muted}; font-size: 30px; font-weight: 800; }
    footer strong { display: block; color: ${slideStyle.text}; font-size: 36px; font-weight: 900; margin-bottom: 6px; }
  </style>
</head>
<body>
  <main>
    <div class="story-mark"></div>
    <section>
      <div class="brand">${usernameDisplay}</div>
      <div class="eyebrow">${slide.eyebrow}</div>
    </section>
    <section class="content">
      <div class="bar"></div>
      <h1>${slide.title}</h1>
      <p>${slide.body}</p>
    </section>
    <footer><strong>${account.brandName}</strong>${account.footerText}</footer>
  </main>
</body>
</html>`;
}

async function renderStory(runDir, pack, account, style, renderContext = {}) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const html = storyHtml(pack.slides[0], account, style, renderContext);
  assertNoMojibake(html);
  assertPortugueseAccents(`${pack.slides[0].eyebrow}\n${pack.slides[0].title}\n${pack.slides[0].body}`);
  const htmlPath = join(runDir, 'story.html');
  const imagePath = join(runDir, 'story.jpg');
  writeFileSync(htmlPath, html, 'utf8');
  await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);
  const storyLayout = await page.evaluate(({ safeTop, safeBottom, storyHeight, storyWidth, photoBottomAllowance }) => {
    const copyBlocks = [...document.querySelectorAll('h1, p, .feed-cta')].filter((element) => getComputedStyle(element).display !== 'none');
    const image = [...document.querySelectorAll('.visual-card, .avatar')]
      .find((element) => getComputedStyle(element).display !== 'none');
    const imageVisible = Boolean(image && getComputedStyle(image).display !== 'none');
    const intersects = (copyRect, imageRect) => !(
      copyRect.right <= imageRect.left
      || copyRect.left >= imageRect.right
      || copyRect.bottom <= imageRect.top
      || copyRect.top >= imageRect.bottom
    );
    const collisions = () => {
      if (!imageVisible) return [];
      const imageRect = image.getBoundingClientRect();
      return copyBlocks
        .filter((copy) => intersects(copy.getBoundingClientRect(), imageRect))
        .map((copy) => ({
          element: copy,
          label: copy.className || copy.tagName.toLowerCase()
        }));
    };
    const constrainCopyBesideImage = () => {
      if (!imageVisible) return 0;
      const imageRect = image.getBoundingClientRect();
      let changed = 0;
      for (const { element } of collisions()) {
        const rect = element.getBoundingClientRect();
        const availableWidth = Math.floor(imageRect.left - rect.left - 24);
        if (availableWidth < 280) continue;
        element.style.maxWidth = `${availableWidth}px`;
        element.style.width = 'fit-content';
        changed += 1;
      }
      return changed;
    };
    let corrected = constrainCopyBesideImage();
    if (collisions().length && imageVisible) {
      const imageStyle = getComputedStyle(image);
      image.style.transform = 'none';
      image.style.width = `${Math.max(260, Math.floor(parseFloat(imageStyle.width) * 0.86))}px`;
      image.style.height = `${Math.max(320, Math.floor(parseFloat(imageStyle.height) * 0.86))}px`;
      image.style.right = '72px';
      corrected += 1 + constrainCopyBesideImage();
    }
    if (collisions().length) {
      for (const { element } of collisions()) {
        const elementStyle = getComputedStyle(element);
        element.style.fontSize = `${Math.max(22, Math.floor(parseFloat(elementStyle.fontSize) * 0.84))}px`;
        element.style.lineHeight = '1.08';
        element.style.marginTop = '16px';
        if (element.classList.contains('feed-cta')) element.style.padding = '14px 18px';
        corrected += 1;
      }
      corrected += constrainCopyBesideImage();
    }
    const safeBottomEdge = storyHeight - safeBottom;
    const copyExceedsSafeBottom = () => copyBlocks.some((element) => element.getBoundingClientRect().bottom > safeBottomEdge - 8);
    for (let pass = 0; pass < 3 && (copyExceedsSafeBottom() || collisions().length); pass += 1) {
      for (const element of copyBlocks) {
        const elementStyle = getComputedStyle(element);
        element.style.fontSize = `${Math.max(21, Math.floor(parseFloat(elementStyle.fontSize) * 0.88))}px`;
        element.style.lineHeight = '1.06';
        element.style.marginTop = `${Math.max(10, Math.floor(parseFloat(elementStyle.marginTop || '0') * 0.68))}px`;
        if (element.classList.contains('feed-cta')) element.style.padding = '12px 16px';
        corrected += 1;
      }
      corrected += constrainCopyBesideImage();
    }
    const remainingCollisions = collisions().map(({ element, label }) => {
      const copyRect = element.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      return `${label}@${Math.round(copyRect.left)},${Math.round(copyRect.top)},${Math.round(copyRect.right)},${Math.round(copyRect.bottom)}->foto@${Math.round(imageRect.left)},${Math.round(imageRect.top)},${Math.round(imageRect.right)},${Math.round(imageRect.bottom)}`;
    });
    const safeElements = [...document.querySelectorAll('.brand, .badge, h1, p, .feed-cta, .visual-card, .avatar, .note, footer')]
      .filter((element) => getComputedStyle(element).display !== 'none');
    const outsideSafeArea = safeElements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        // A borda/arredondamento da foto pode ultrapassar alguns pixels por
        // causa do recorte e da rasterizacao do Chromium. Isso nao compromete
        // a area segura; textos continuam com a tolerancia estrita.
        const isPhoto = element.classList.contains('avatar') || element.classList.contains('visual-card');
        const tolerance = isPhoto ? 12 : 2;
        const allowedBottom = safeBottomEdge + (isPhoto ? photoBottomAllowance : 0);
        const outside = rect.left < 48 - tolerance
          || rect.right > storyWidth - 48 + tolerance
          || rect.top < safeTop - tolerance
          || rect.bottom > allowedBottom + tolerance;
        return outside ? `${element.className || element.tagName.toLowerCase()}@${Math.round(rect.left)},${Math.round(rect.top)},${Math.round(rect.right)},${Math.round(rect.bottom)}` : '';
      })
      .filter(Boolean);
    return { overlap: remainingCollisions.length > 0, collisions: remainingCollisions, corrected, outsideSafeArea };
  }, { safeTop: STORY_SAFE_TOP, safeBottom: STORY_SAFE_BOTTOM, storyHeight: STORY_HEIGHT, storyWidth: STORY_WIDTH, photoBottomAllowance: STORY_PHOTO_BOTTOM_ALLOWANCE });
  if (storyLayout.corrected) {
    writeFileSync(htmlPath, await page.content(), 'utf8');
    console.log(`Story ajustado automaticamente em ${storyLayout.corrected} correcao(oes) de layout.`);
  }
  if (storyLayout.overlap) throw new Error(`Story rejeitado: autocorrecao nao eliminou sobreposicao (${storyLayout.collisions.join(', ')}).`);
  if (storyLayout.outsideSafeArea.length) {
    throw new Error(`Story rejeitado: elemento fora da area segura (${storyLayout.outsideSafeArea.join(', ')}).`);
  }
  await page.screenshot({ path: imagePath, type: 'jpeg', quality: 94, fullPage: false });
  await browser.close();
  return imagePath;
}

async function graphGet(path, params = {}) {
  const label = `Graph GET ${path}`;
  return withRetry(label, async () => {
    const url = new URL(`${IG_BASE}${path}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const res = await fetchWithContext(url, undefined, label);
    const text = await res.text();
    if (!res.ok) throw createHttpError(label, res.status, text);
    return text ? JSON.parse(text) : {};
  });
}

async function graphPost(path, params = {}) {
  const label = `Graph POST ${path}`;
  return withRetry(label, async () => {
    const url = new URL(`${IG_BASE}${path}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const res = await fetchWithContext(url, { method: 'POST' }, label);
    const text = await res.text();
    if (!res.ok) throw createHttpError(label, res.status, text);
    return text ? JSON.parse(text) : {};
  });
}

function normalizeCaption(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function saoPauloDateFromIso(isoString) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(isoString));
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

async function fetchRecentMedia(userId, token) {
  const media = await graphGet(`/${userId}/media`, {
    fields: 'id,caption,permalink,timestamp',
    limit: '50',
    access_token: token
  });
  return media.data || [];
}

function findDuplicateCaption(media, caption) {
  const expectedCaption = normalizeCaption(caption);
  const expectedCore = normalizeContentFingerprint(caption);
  const expectedTokens = new Set(expectedCore.split(' ').filter((token) => token.length > 3));
  return media.find((item) => {
    if (!item.caption) return false;
    const actualCaption = normalizeCaption(item.caption);
    if (actualCaption === expectedCaption) return true;
    const actualCore = normalizeContentFingerprint(item.caption);
    if (Math.min(actualCore.length, expectedCore.length) > 120
      && (actualCore.includes(expectedCore) || expectedCore.includes(actualCore))) return true;
    const actualTokens = new Set(actualCore.split(' ').filter((token) => token.length > 3));
    if (!expectedTokens.size || !actualTokens.size) return false;
    let common = 0;
    for (const token of expectedTokens) if (actualTokens.has(token)) common += 1;
    return common / Math.min(expectedTokens.size, actualTokens.size) >= 0.86;
  });
}

function normalizeContentFingerprint(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/#\S+/g, ' ')
    .replace(/\b(?:serie pratica|edicao operacional|slot|run)\b[^\n.]*/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function packContentFingerprint(pack = {}) {
  const content = (pack.slides || []).map((slide) => ({
    eyebrow: normalizeContentFingerprint(slide.eyebrow),
    title: normalizeContentFingerprint(slide.title),
    body: normalizeContentFingerprint(slide.body)
  }));
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

function publicationHistoryPath(configDir) {
  return join(configDir, 'publication-history.json');
}

function readPublicationHistory(configDir, accountKey) {
  const path = publicationHistoryPath(configDir);
  if (!existsSync(path)) return [];
  const history = readJson(path);
  return Array.isArray(history?.[accountKey]) ? history[accountKey] : [];
}

function bookStoryPacks(configDir, accountKey) {
  const { group } = loadScheduledPosts(configDir, accountKey);
  return (group.posts || [])
    .map((post) => post?.pack)
    .filter((pack) => pack?.authoredBook && Array.isArray(pack.slides) && pack.slides.length);
}

function pickBookStoryAfterNews(history = [], candidates = [], newsInterval = 5) {
  if (!candidates.length) return null;
  const bookTitles = new Set(candidates.map((pack) => normalizedCoverTitle(pack)).filter(Boolean));
  let newsStories = 0;
  for (const entry of [...history].reverse()) {
    const entryTitle = normalizeContentFingerprint(entry.storyCoverTitle || entry.coverTitle || '');
    const isBookStory = entry.storyContentKind === 'book' || bookTitles.has(entryTitle);
    if (isBookStory && entry.storyMediaId) break;
    if (entry.storyMediaId && entry.research?.sourceUrl) newsStories += 1;
  }
  if (newsStories < newsInterval) return null;

  const usedBookTitles = new Set(history
    .filter((entry) => entry.storyContentKind === 'book' || bookTitles.has(normalizeContentFingerprint(entry.storyCoverTitle || entry.coverTitle || '')))
    .map((entry) => normalizeContentFingerprint(entry.storyCoverTitle || entry.coverTitle || ''))
    .filter(Boolean));
  return candidates.find((pack) => !usedBookTitles.has(normalizedCoverTitle(pack)))
    || candidates[Math.floor(newsStories / newsInterval) % candidates.length];
}

function recordPublicationHistory(configDir, accountKey, pack, result) {
  const path = publicationHistoryPath(configDir);
  const history = existsSync(path) ? readJson(path) : {};
  const entries = Array.isArray(history[accountKey]) ? history[accountKey] : [];
  const fingerprint = packContentFingerprint(pack);
  const storyPack = result.storyHistoryPack || pack;
  const storyFingerprint = packContentFingerprint(storyPack);
  if (!entries.some((entry) => entry.feedFingerprint === fingerprint || entry.storyFingerprint === fingerprint)) {
    entries.push({
      feedFingerprint: result.storyOnly ? null : fingerprint,
      storyFingerprint,
      storyContentKind: result.storyContentKind || (storyPack.authoredBook ? 'book' : (storyPack.research?.sourceUrl ? 'news' : 'editorial')),
      storyCoverTitle: String(storyPack?.slides?.[0]?.title || '').trim() || null,
      captionFingerprint: createHash('sha256').update(normalizeCaption(pack.caption || '')).digest('hex'),
      coverTitle: String(pack?.slides?.[0]?.title || '').trim() || null,
      coverAvatar: result.coverAvatar || null,
      avatarRotationStart: Number.isInteger(result.avatarRotationStart) ? result.avatarRotationStart : null,
      publishedAt: new Date().toISOString(),
      mediaId: result.mediaId || null,
      storyMediaId: result.storyMediaId || null,
      firstCommentId: result.firstCommentId || null,
      firstCommentError: result.firstCommentError || null,
      permalink: result.permalink || null,
      selectionMode: result.selectionMode || null,
      learning: result.learningDecision || null,
      learningContext: result.learningContext || null,
      research: pack.research || null
    });
  }
  history[accountKey] = entries;
  writeJson(path, history);
}

function findDuplicatePack(history, pack) {
  const fingerprint = packContentFingerprint(pack);
  return history.find((entry) => entry.feedFingerprint === fingerprint || entry.storyFingerprint === fingerprint);
}

function findDuplicateResearchSource(history, pack) {
  const sourceUrl = String(pack?.research?.sourceUrl || '').trim().replace(/\/$/, '');
  if (!sourceUrl) return null;
  return history.find((entry) => String(entry?.research?.sourceUrl || '').trim().replace(/\/$/, '') === sourceUrl);
}

function findConsecutiveResearchSource(history, pack) {
  const source = String(pack?.research?.source || '').trim().toLocaleLowerCase('pt-BR');
  if (!source) return null;
  const lastResearchPublication = [...history].reverse().find((entry) => entry?.research?.source);
  if (!lastResearchPublication) return null;
  return String(lastResearchPublication.research.source || '').trim().toLocaleLowerCase('pt-BR') === source
    ? lastResearchPublication
    : null;
}

function normalizedCoverTitle(pack = {}) {
  return normalizeContentFingerprint(String(pack?.slides?.[0]?.title || '').trim());
}

function findDuplicateCoverTitle(recentMedia = [], history = [], pack = {}) {
  const expected = normalizedCoverTitle(pack);
  if (!expected) return null;
  const historyMatch = history.find((entry) => normalizeContentFingerprint(entry?.coverTitle || '') === expected);
  if (historyMatch) return historyMatch;
  return recentMedia.find((item) => {
    const firstParagraph = String(item?.caption || '').split(/\n\s*\n|\r?\n/)[0];
    return normalizeContentFingerprint(firstParagraph) === expected;
  }) || null;
}

function titleWordNgrams(value = '', size = 5) {
  const words = normalizeContentFingerprint(value).split(' ').filter(Boolean);
  if (words.length < size) return [];
  return Array.from({ length: words.length - size + 1 }, (_, index) => words.slice(index, index + size).join(' '));
}

function findSemanticCoverTitle(history = [], pack = {}) {
  const expected = normalizedCoverTitle(pack);
  if (!expected) return null;
  const expectedWords = new Set(expected.split(' ').filter((word) => word.length > 2));
  const expectedNgrams = new Set(titleWordNgrams(expected));
  return [...history].slice(-48).reverse().find((entry) => {
    const actual = normalizeContentFingerprint(entry?.coverTitle || '');
    if (!actual) return false;
    const actualWords = new Set(actual.split(' ').filter((word) => word.length > 2));
    const union = new Set([...expectedWords, ...actualWords]);
    const common = [...expectedWords].filter((word) => actualWords.has(word)).length;
    const jaccard = union.size ? common / union.size : 0;
    const repeatedPhrase = titleWordNgrams(actual).some((ngram) => expectedNgrams.has(ngram));
    return repeatedPhrase || (Math.min(expectedWords.size, actualWords.size) >= 4 && jaccard >= 0.72);
  }) || null;
}

function findDuplicateSelection(pack, recentMedia = [], publicationHistory = []) {
  if (pack?.research?.sourceUrl) {
    // A pauta e a chamada de capa precisam ser novas. Fontes diferentes nao
    // justificam repetir a mesma promessa visual em posts proximos.
    return findDuplicateResearchSource(publicationHistory, pack)
      || findConsecutiveResearchSource(publicationHistory, pack)
      || findDuplicateCoverTitle(recentMedia, publicationHistory, pack)
      || findSemanticCoverTitle(publicationHistory, pack)
      || findDuplicatePack(publicationHistory, pack);
  }
  return findDuplicateCoverTitle(recentMedia, publicationHistory, pack)
    || findSemanticCoverTitle(publicationHistory, pack)
    || findDuplicateCaption(recentMedia, pack.caption)
    || findDuplicatePack(publicationHistory, pack);
}

function balanceResearchPacksByHistory(packs = [], publicationHistory = [], dateString = '', slotIndex = 0) {
  if (!packs.some((pack) => pack?.research?.source)) return packs.map((pack, index) => ({ pack, originalIndex: index }));
  const stats = new Map();
  // O perfil visivel deve variar agora. Contagens de meses/dias anteriores nao
  // podem fazer uma fonte dominar a grade recente por parecer pouco usada no
  // total acumulado.
  const recentResearchHistory = publicationHistory
    .filter((entry) => entry?.research?.source)
    .slice(-12);
  for (const entry of recentResearchHistory) {
    const source = String(entry?.research?.source || '').trim().toLocaleLowerCase('pt-BR');
    if (!source) continue;
    const current = stats.get(source) || { count: 0, lastPublishedAt: 0 };
    current.count += 1;
    current.lastPublishedAt = Math.max(current.lastPublishedAt, Date.parse(entry.publishedAt) || 0);
    stats.set(source, current);
  }
  const buckets = new Map();
  packs.forEach((pack, originalIndex) => {
    const source = String(pack?.research?.source || 'sem fonte').trim();
    if (!buckets.has(source)) buckets.set(source, []);
    buckets.get(source).push({ pack, originalIndex });
  });
  const sourceQueues = [...buckets.entries()].map(([source, queue]) => {
    const normalized = source.toLocaleLowerCase('pt-BR');
    const sourceStats = stats.get(normalized) || { count: 0, lastPublishedAt: 0 };
    const start = queue.length ? pickDailyIndex(queue, dateString, slotIndex) : 0;
    return {
      source,
      count: sourceStats.count,
      lastPublishedAt: sourceStats.lastPublishedAt,
      queue: [...queue.slice(start), ...queue.slice(0, start)]
    };
  }).sort((left, right) => (
    left.count - right.count
    || left.lastPublishedAt - right.lastPublishedAt
    || left.source.localeCompare(right.source, 'pt-BR')
  ));
  const balanced = [];
  while (sourceQueues.some((item) => item.queue.length)) {
    for (const item of sourceQueues) {
      if (item.queue.length) balanced.push(item.queue.shift());
    }
  }
  return balanced;
}

function learningObjective(primarySignal = '') {
  if (/salvamento|compartilhamento/iu.test(primarySignal)) return 'utility';
  if (/comentario|comentário/iu.test(primarySignal)) return 'conversation';
  if (/direct|perfil|seguidor|conversao|conversão/iu.test(primarySignal)) return 'conversion';
  return 'discovery';
}

function learningDaypart(slotTime = '') {
  const hour = Number.parseInt(String(slotTime).match(/(?:^|T)(\d{2}):/)?.[1] || '', 10);
  if (!Number.isInteger(hour)) return 'unknown';
  if (hour < 10) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function publicationFormat(publishMode = '') {
  return String(publishMode).startsWith('reel') ? 'REELS' : 'FEED';
}

function learningTopicTokens(entry = {}) {
  const text = `${entry.coverTitle || entry?.slides?.[0]?.title || ''} ${entry.research?.theme || ''}`.toLocaleLowerCase('pt-BR');
  return ['automação', 'agente', 'dados', 'gestão', 'produtividade', 'vendas', 'cliente', 'custo', 'token', 'modelo', 'empresa', 'mercado', 'segurança']
    .filter((token) => text.includes(token));
}

function learningHookArchetype(entry = {}) {
  const title = String(entry.coverTitle || entry?.slides?.[0]?.title || '').trim();
  if (/\?|como|por que/iu.test(title)) return 'pergunta';
  if (/\d|%|r\$|milh(?:ão|ões)|bilh(?:ão|ões)/iu.test(title)) return 'dado';
  if (/erro|risco|cuidado|antes|não faça|nao faca/iu.test(title)) return 'alerta';
  if (/novo|mudou|lançou|chegou|agora/iu.test(title)) return 'novidade';
  return 'afirmação';
}

function contentFatigue(pack = {}, publicationHistory = []) {
  const recent = publicationHistory.slice(-18).reverse();
  const source = String(pack?.research?.source || '').trim().toLocaleLowerCase('pt-BR');
  const topics = new Set(learningTopicTokens(pack));
  const hook = learningHookArchetype(pack);
  let penalty = 0;
  const reasons = [];
  recent.forEach((entry, index) => {
    const recency = Math.max(0.2, 1 - (index / 20));
    if (source && String(entry?.research?.source || '').trim().toLocaleLowerCase('pt-BR') === source) penalty += 1.2 * recency;
    const previousTopics = learningTopicTokens(entry);
    if (previousTopics.some((topic) => topics.has(topic))) penalty += 0.65 * recency;
    if (learningHookArchetype(entry) === hook) penalty += 0.35 * recency;
  });
  const bounded = Number(Math.min(9, penalty).toFixed(2));
  if (bounded >= 1) reasons.push('fadiga-editorial-recente');
  return { penalty: bounded, reasons };
}

function organicPotentialScore(pack = {}, dateString = todaySaoPaulo(), publicationHistory = [], learningContext = {}) {
  const research = pack.research || {};
  const title = String(research.sourceTitle || pack.slides?.[0]?.title || '').trim();
  const caption = String(pack.caption || '').trim();
  const facts = Array.isArray(research.sourceFacts) ? research.sourceFacts.filter(Boolean) : [];
  const searchable = `${title}\n${caption}\n${facts.join('\n')}`.toLocaleLowerCase('pt-BR');
  let score = 45;
  const signals = [];
  const add = (points, signal) => {
    score += points;
    signals.push(signal);
  };

  if (research.sourceImageUrl || pack.slides?.[0]?.imageUrl || pack.slides?.[0]?.imagePath) add(12, 'imagem-editorial');
  if (title.length >= 38 && title.length <= 96) add(10, 'titulo-legivel');
  else if (title.length > 125) add(-12, 'titulo-longo');
  if (/\d|%|r\$|milh(?:ao|ão|oes|ões)|bilh(?:ao|ão|oes|ões)/iu.test(title)) add(7, 'dado-concreto');
  if (/empresa|negocio|negócio|gestao|gestão|produtividade|custo|econom|vendas|cliente|trabalho|mercado/iu.test(searchable)) add(8, 'relevancia-empresarial');
  if (/como|por que|segredo|erro|risco|muda|novo|primeiro|antes|depois|guia|passo|descubra/iu.test(title)) add(7, 'curiosidade-util');
  if (/ia|inteligencia artificial|inteligência artificial|automacao|automação|agente|modelo|dados|token/iu.test(searchable)) add(6, 'aderencia-ao-perfil');
  if (facts.length >= 3) add(7, 'densidade-factual');
  if (facts.some((fact) => String(fact).length >= 150)) add(4, 'contexto-aprofundado');
  if (/chocante|imperdivel|imperdível|voce nao vai acreditar|você não vai acreditar|matriculas abertas|matrículas abertas|pre-mba|pré-mba/iu.test(searchable)) add(-20, 'promocao-ou-clickbait');

  const fatigue = contentFatigue(pack, publicationHistory);
  if (fatigue.penalty) add(-fatigue.penalty, ...fatigue.reasons);

  const publishedAt = Date.parse(research.publishedAt || '');
  const referenceAt = Date.parse(`${dateString}T23:59:59-03:00`);
  if (Number.isFinite(publishedAt) && Number.isFinite(referenceAt)) {
    const ageDays = Math.max(0, (referenceAt - publishedAt) / 86400000);
    if (ageDays <= 1.5) add(10, 'pauta-recente');
    else if (ageDays <= 3.5) add(6, 'pauta-atual');
    else if (ageDays > 15) add(-7, 'pauta-antiga');
  }

  const performanceState = performanceLearningSnapshot().readiness.learningEnabled
    ? performanceLearningSnapshot().models
    : {};
  const sourceKey = String(research.source || '').trim().toLocaleLowerCase('pt-BR');
  const learnedSource = performanceState.sources?.[sourceKey];
  if (learnedSource?.samples >= 2) {
    const adjustment = Math.max(-6, Math.min(6, (Number(learnedSource.learnedScore) - 50) * 0.3));
    if (Math.abs(adjustment) >= 0.5) add(adjustment, adjustment > 0 ? 'fonte-com-bom-historico' : 'fonte-com-baixo-historico');
  }
  const learnedTopics = Object.entries(performanceState.topics || {})
    .filter(([topic, model]) => model?.samples >= 2 && searchable.includes(topic))
    .map(([, model]) => Number(model.learnedScore) || 50);
  if (learnedTopics.length) {
    const average = learnedTopics.reduce((sum, value) => sum + value, 0) / learnedTopics.length;
    const adjustment = Math.max(-6, Math.min(6, (average - 50) * 0.3));
    if (Math.abs(adjustment) >= 0.5) add(adjustment, adjustment > 0 ? 'tema-com-bom-historico' : 'tema-com-baixo-historico');
  }

  const contextKey = [learningContext.format, learningContext.daypart, learningContext.objective].filter(Boolean).join('|');
  const learnedContext = performanceState.contexts?.[contextKey];
  if (learnedContext?.samples >= 2) {
    const adjustment = Math.max(-5, Math.min(5, (Number(learnedContext.learnedScore) - 50) * 0.25));
    if (Math.abs(adjustment) >= 0.5) add(adjustment, adjustment > 0 ? 'contexto-com-bom-historico' : 'contexto-com-baixo-historico');
  }

  return { score: Number(Math.max(0, Math.min(100, score)).toFixed(2)), signals, fatiguePenalty: fatigue.penalty, contextKey: contextKey || null };
}

let cachedPerformanceLearningSnapshot = null;

function performanceLearningSnapshot() {
  if (cachedPerformanceLearningSnapshot) return cachedPerformanceLearningSnapshot;
  const stored = existsSync(PERFORMANCE_INSIGHTS_PATH)
    ? readJson(PERFORMANCE_INSIGHTS_PATH)
    : { accounts: {} };
  const accountState = stored?.accounts?.[process.env.ACCOUNT || 'cliente-x'] || {};
  cachedPerformanceLearningSnapshot = {
    models: accountState.models || {},
    readiness: summarizePerformanceLearning(accountState, stored?.updatedAt)
  };
  return cachedPerformanceLearningSnapshot;
}

function shortlistByOrganicPotential(candidates = [], dateString = '', limit = 3) {
  const ranked = candidates.map((candidate) => ({
    ...candidate,
    organicPotential: organicPotentialScore(candidate.pack, dateString)
  })).sort((left, right) => right.organicPotential.score - left.organicPotential.score || left.originalIndex - right.originalIndex);
  const bestScore = ranked[0]?.organicPotential.score ?? 0;
  return ranked.filter((candidate) => candidate.organicPotential.score >= bestScore - 8).slice(0, limit);
}

function controlledExperimentMode(dateString = '', slotIndex = 0) {
  const bucket = createHash('sha256').update(`${dateString}:${slotIndex}:organic-experiment-v1`).digest()[0] % 10;
  if (bucket < 7) return 'exploit';
  if (bucket < 9) return 'explore';
  return 'experiment';
}

function selectWithControlledExploration(candidates = [], dateString = '', slotIndex = 0, chooseIndex = randomInt, publicationHistory = [], learningContext = {}) {
  const ranked = candidates.map((candidate) => ({
    ...candidate,
    organicPotential: organicPotentialScore(candidate.pack, dateString, publicationHistory, learningContext)
  })).sort((left, right) => right.organicPotential.score - left.organicPotential.score || left.originalIndex - right.originalIndex);
  const mode = controlledExperimentMode(dateString, slotIndex);
  const bestScore = ranked[0]?.organicPotential.score ?? 0;
  let pool = ranked.filter((candidate) => candidate.organicPotential.score >= bestScore - 8).slice(0, 3);
  if (mode === 'explore') {
    pool = ranked.filter((candidate) => candidate.organicPotential.score >= bestScore - 15).slice(1, 5);
    if (!pool.length) pool = ranked.slice(0, 3);
  } else if (mode === 'experiment') {
    pool = ranked.slice(0, 6);
  }
  const selected = pool[chooseIndex(pool.length)];
  const experimentAxis = mode === 'experiment' ? 'topic-angle' : mode === 'explore' ? 'candidate-novelty' : 'performance';
  return selected ? { ...selected, selectionMode: mode, experimentAxis } : null;
}

function pickFreshPack(packs, dateString, slotIndex, recentMedia = [], publicationHistory = [], chooseIndex = randomInt, learningContext = {}) {
  const candidates = balanceResearchPacksByHistory(packs, publicationHistory, dateString, slotIndex);
  const freshCandidates = candidates.filter(({ pack }) => !findDuplicateSelection(pack, recentMedia, publicationHistory));
  const researchCandidates = freshCandidates.filter(({ pack }) => pack?.research?.source);
  if (researchCandidates.length) {
    const recentSourceCounts = new Map();
    for (const entry of publicationHistory.filter((item) => item?.research?.source).slice(-12)) {
      const source = String(entry.research.source).trim().toLocaleLowerCase('pt-BR');
      recentSourceCounts.set(source, (recentSourceCounts.get(source) || 0) + 1);
    }
    const bySource = new Map();
    for (const candidate of researchCandidates) {
      const source = String(candidate.pack.research.source).trim().toLocaleLowerCase('pt-BR');
      if (!bySource.has(source)) bySource.set(source, []);
      bySource.get(source).push(candidate);
    }
    const sourceGroups = [...bySource.entries()].map(([source, queue]) => ({
      source,
      count: recentSourceCounts.get(source) || 0,
      queue
    }));
    const minimumCount = Math.min(...sourceGroups.map((item) => item.count));
    // Sorteia de verdade entre as fontes oficiais equilibradas. A margem de uma
    // publicacao preserva variedade sem transformar uma unica fonte em escolha fixa.
    const balancedPool = sourceGroups.filter((item) => item.count <= minimumCount + 1);
    const selectedSource = balancedPool[chooseIndex(balancedPool.length)];
    const selected = selectWithControlledExploration(selectedSource.queue, dateString, slotIndex, chooseIndex, publicationHistory, learningContext);
    return {
      pack: selected.pack,
      packIndex: selected.originalIndex,
      organicPotential: selected.organicPotential,
      selectionMode: selected.selectionMode,
      experimentAxis: selected.experimentAxis,
      skippedDuplicates: candidates.length - freshCandidates.length
    };
  }
  if (freshCandidates.length) {
    const selected = selectWithControlledExploration(freshCandidates, dateString, slotIndex, chooseIndex, publicationHistory, learningContext);
    return { pack: selected.pack, packIndex: selected.originalIndex, organicPotential: selected.organicPotential, selectionMode: selected.selectionMode, experimentAxis: selected.experimentAxis, skippedDuplicates: candidates.length - freshCandidates.length };
  }
  return {
    pack: null,
    packIndex: null,
    skippedDuplicates: packs.length,
    duplicate: candidates.length ? findDuplicateSelection(candidates[0].pack, recentMedia, publicationHistory) : null
  };
}

async function uploadToImgBB(imagePath, apiKey) {
  return withRetry('ImgBB upload', async () => {
    const form = new FormData();
    form.append('key', apiKey);
    form.append('image', readFileSync(resolve(imagePath)).toString('base64'));
    const res = await fetchWithContext('https://api.imgbb.com/1/upload', { method: 'POST', body: form }, 'ImgBB upload');
    const text = await res.text();
    if (!res.ok) throw createHttpError('ImgBB upload', res.status, text);
    const json = text ? JSON.parse(text) : {};
    if (!json.success) {
      const error = new Error(`ImgBB upload failed: ${JSON.stringify(json).slice(0, 1200)}`);
      error.stage = 'ImgBB upload';
      error.retryable = Boolean(json?.error?.code >= 500);
      throw error;
    }
    return json.data.url;
  });
}

async function assertRemoteImageReady(imageUrl) {
  await withRetry('Media URL check', async () => {
    const res = await fetchWithContext(imageUrl, {
      method: 'GET',
      headers: { 'user-agent': 'facebookexternalhit/1.1' }
    }, 'Media URL check');
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.toLowerCase().startsWith('image/')) {
      const error = new Error(`URL de imagem ainda nao pronta: HTTP ${res.status} ${contentType}`);
      error.stage = 'Media URL check';
      error.retryable = true;
      throw error;
    }
    await res.arrayBuffer();
  }, 4);
}

async function assertRemoteVideoReady(videoUrl) {
  await withRetry('Video URL check', async () => {
    const res = await fetchWithContext(videoUrl, {
      method: 'GET',
      headers: { 'user-agent': 'facebookexternalhit/1.1' }
    }, 'Video URL check');
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!res.ok || (!contentType.startsWith('video/') && !contentType.includes('octet-stream'))) {
      const error = new Error(`URL de video ainda nao pronta: HTTP ${res.status} ${contentType}`);
      error.stage = 'Video URL check';
      error.retryable = true;
      throw error;
    }
    await res.arrayBuffer();
  }, 4);
}

async function uploadReadyImageToImgBB(imagePath, apiKey) {
  const imageUrl = await uploadToImgBB(imagePath, apiKey);
  await assertRemoteImageReady(imageUrl);
  return imageUrl;
}

async function githubApi(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN ausente para hospedagem de imagens.');
  const res = await fetchWithContext(`https://api.github.com${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'cliente-x-instagram-publisher',
      'x-github-api-version': '2022-11-28',
      ...(options.headers || {})
    }
  }, 'GitHub image hosting');
  const text = await res.text();
  if (!res.ok) throw createHttpError('GitHub image hosting', res.status, text);
  return text ? JSON.parse(text) : {};
}

async function hostRenderedImagesOnGitHub(imagePaths, accountKey, runId) {
  const repository = process.env.GITHUB_REPOSITORY;
  const branch = process.env.GITHUB_REF_NAME || 'main';
  if (!repository || !process.env.GITHUB_TOKEN || process.env.GITHUB_ACTIONS !== 'true') return null;

  return withRetry('GitHub image hosting', async () => {
    const ref = await githubApi(`/repos/${repository}/git/ref/heads/${encodeURIComponent(branch)}`);
    const headSha = ref.object?.sha;
    if (!headSha) throw new Error(`Nao foi possivel identificar o HEAD de ${repository}:${branch}.`);

    const tree = [];
    for (const imagePath of imagePaths) {
      const blob = await githubApi(`/repos/${repository}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: readFileSync(resolve(imagePath)).toString('base64'), encoding: 'base64' })
      });
      tree.push({
        path: `docs/generated/${accountKey}/${runId}/${basename(imagePath)}`,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
    }

    const createdTree = await githubApi(`/repos/${repository}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: headSha, tree })
    });
    const commit = await githubApi(`/repos/${repository}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: `Host Instagram images ${accountKey} ${runId}`,
        tree: createdTree.sha,
        parents: [headSha]
      })
    });
    await githubApi(`/repos/${repository}/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false })
    });

    const urls = tree.map((item) => `https://raw.githubusercontent.com/${repository}/${commit.sha}/${item.path}`);
    await Promise.all(urls.map((url) => assertRemoteImageReady(url)));
    console.log(`Imagens hospedadas no GitHub em um unico commit: ${commit.sha}.`);
    return urls;
  }, GITHUB_REF_RETRY_ATTEMPTS);
}

async function hostRenderedVideoOnGitHub(videoPath, accountKey, runId) {
  const repository = process.env.GITHUB_REPOSITORY;
  const branch = process.env.GITHUB_REF_NAME || 'main';
  if (!repository || !process.env.GITHUB_TOKEN || process.env.GITHUB_ACTIONS !== 'true') return null;
  return withRetry('GitHub video hosting', async () => {
    const ref = await githubApi(`/repos/${repository}/git/ref/heads/${encodeURIComponent(branch)}`);
    const headSha = ref.object?.sha;
    if (!headSha) throw new Error(`Nao foi possivel identificar o HEAD de ${repository}:${branch}.`);
    const blob = await githubApi(`/repos/${repository}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: readFileSync(resolve(videoPath)).toString('base64'), encoding: 'base64' })
    });
    const assetPath = `docs/generated/${accountKey}/${runId}/${basename(videoPath)}`;
    const createdTree = await githubApi(`/repos/${repository}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: headSha, tree: [{ path: assetPath, mode: '100644', type: 'blob', sha: blob.sha }] })
    });
    const commit = await githubApi(`/repos/${repository}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({ message: `Host Instagram Reel ${accountKey} ${runId}`, tree: createdTree.sha, parents: [headSha] })
    });
    await githubApi(`/repos/${repository}/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false })
    });
    const url = `https://raw.githubusercontent.com/${repository}/${commit.sha}/${assetPath}`;
    await assertRemoteVideoReady(url);
    console.log(`Reel hospedado no GitHub: ${commit.sha}.`);
    return url;
  }, GITHUB_REF_RETRY_ATTEMPTS);
}

const REEL_SOUNDTRACKS = [
  { id: 'pulso-produtivo', bpm: 104, chords: [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 53]], melody: [72, 76, 79, 76, 69, 72, 76, 72] },
  { id: 'ideias-em-movimento', bpm: 110, chords: [[50, 54, 57, 61], [47, 50, 54, 57], [43, 47, 50, 54], [45, 49, 52, 55]], melody: [74, 78, 81, 78, 71, 74, 78, 76] },
  { id: 'futuro-leve', bpm: 98, chords: [[45, 49, 52, 56], [41, 45, 49, 52], [38, 42, 45, 49], [40, 44, 47, 50]], melody: [69, 73, 76, 73, 66, 69, 73, 71] },
  { id: 'beethoven-01-classica', work: 'Sinfonia nº 1', bpm: 112, classical: true, chords: [[48, 52, 55], [53, 57, 60], [55, 59, 62], [48, 52, 55]], melody: [72, 76, 79, 76, 74, 77, 81, 79] },
  { id: 'beethoven-02-vivace', work: 'Sinfonia nº 2', bpm: 118, classical: true, chords: [[50, 54, 57], [55, 59, 62], [57, 61, 64], [50, 54, 57]], melody: [74, 78, 81, 86, 81, 78, 76, 74] },
  { id: 'beethoven-03-heroica', work: 'Sinfonia nº 3 Eroica', bpm: 108, classical: true, chords: [[51, 55, 58], [56, 60, 63], [58, 62, 65], [51, 55, 58]], melody: [75, 79, 82, 87, 84, 82, 79, 75] },
  { id: 'beethoven-04-luminosa', work: 'Sinfonia nº 4', bpm: 116, classical: true, chords: [[46, 50, 53], [51, 55, 58], [53, 57, 60], [46, 50, 53]], melody: [70, 74, 77, 82, 79, 77, 74, 70] },
  { id: 'beethoven-05-destino', work: 'Sinfonia nº 5', bpm: 108, classical: true, chords: [[48, 51, 55], [44, 48, 51], [43, 47, 50], [48, 51, 55]], melody: [67, 67, 67, 63, 65, 65, 65, 62] },
  { id: 'beethoven-06-pastoral', work: 'Sinfonia nº 6 Pastoral', bpm: 92, classical: true, chords: [[53, 57, 60], [58, 62, 65], [60, 64, 67], [53, 57, 60]], melody: [69, 72, 77, 72, 74, 72, 69, 65] },
  { id: 'beethoven-07-allegretto', work: 'Sinfonia nº 7', bpm: 80, classical: true, chords: [[45, 48, 52], [43, 47, 50], [41, 45, 48], [40, 44, 47]], melody: [69, 69, 71, 72, 72, 71, 69, 67] },
  { id: 'beethoven-08-brincante', work: 'Sinfonia nº 8', bpm: 120, classical: true, chords: [[53, 57, 60], [48, 52, 55], [55, 59, 62], [53, 57, 60]], melody: [77, 81, 84, 81, 79, 77, 76, 77] },
  { id: 'beethoven-09-alegria', work: 'Sinfonia nº 9 Coral', bpm: 100, classical: true, chords: [[50, 54, 57], [55, 59, 62], [57, 61, 64], [50, 54, 57]], melody: [66, 66, 67, 69, 69, 67, 66, 64, 62, 62, 64, 66] }
];
const REEL_BEETHOVEN_SOUNDTRACKS = REEL_SOUNDTRACKS.filter((track) => track.classical && /^beethoven-\d{2}-/.test(track.id));

function renderOriginalInstrumentalWav(runDir, durationSeconds, trackIndex) {
  const sampleRate = 48000;
  const channels = 2;
  const frames = Math.ceil(durationSeconds * sampleRate);
  const track = REEL_BEETHOVEN_SOUNDTRACKS[trackIndex % REEL_BEETHOVEN_SOUNDTRACKS.length];
  const pcm = Buffer.alloc(frames * channels * 2);
  const secondsPerBeat = 60 / track.bpm;
  const midiFrequency = (note) => 440 * (2 ** ((note - 69) / 12));
  const noise = (sample) => {
    const value = Math.sin((sample + 1) * 12.9898 + trackIndex * 78.233) * 43758.5453;
    return ((value - Math.floor(value)) * 2) - 1;
  };
  let peak = 0;
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  for (let sample = 0; sample < frames; sample += 1) {
    const t = sample / sampleRate;
    const beat = t / secondsPerBeat;
    const beatNumber = Math.floor(beat);
    const beatTime = (beat - beatNumber) * secondsPerBeat;
    const eighth = Math.floor(beat * 2);
    const eighthTime = ((beat * 2) - eighth) * (secondsPerBeat / 2);
    const chord = track.chords[Math.floor(beatNumber / 4) % track.chords.length];
    let pad = 0;
    for (const note of chord) {
      const frequency = midiFrequency(note + 12);
      pad += Math.sin(2 * Math.PI * frequency * t) * 0.55;
      pad += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.16;
      pad += Math.sin(2 * Math.PI * frequency * 0.5 * t) * 0.12;
    }
    pad *= 0.07 * (0.78 + 0.22 * Math.sin(2 * Math.PI * 0.12 * t));
    const bassFrequency = midiFrequency(chord[0] - 12);
    const bassEnvelope = Math.exp(-beatTime * 3.2);
    const bass = (Math.sin(2 * Math.PI * bassFrequency * t) + 0.28 * Math.sin(2 * Math.PI * bassFrequency * 2 * t)) * bassEnvelope * 0.19;
    const kickPhase = 2 * Math.PI * (76 * beatTime - 38 * beatTime * beatTime);
    const percussionLevel = track.classical ? 0.12 : 1;
    const kick = Math.sin(kickPhase) * Math.exp(-beatTime * 17) * 0.72 * percussionLevel;
    const snareActive = beatNumber % 4 === 1 || beatNumber % 4 === 3;
    const snare = snareActive && beatTime < 0.24
      ? ((noise(sample) * 0.52) + Math.sin(2 * Math.PI * 185 * beatTime) * 0.34) * Math.exp(-beatTime * 19) * 0.42 * percussionLevel
      : 0;
    const hat = noise(sample * 3) * Math.exp(-eighthTime * 62) * (eighth % 2 ? 0.12 : 0.17) * percussionLevel;
    const melodyNote = track.melody[eighth % track.melody.length];
    const melodyFrequency = midiFrequency(melodyNote);
    const melodyEnvelope = Math.exp(-eighthTime * 8.5);
    const bowedTone = track.classical ? 0.22 * Math.sin(2 * Math.PI * melodyFrequency * 3 * t) : 0;
    const melody = (Math.sin(2 * Math.PI * melodyFrequency * t) + 0.32 * Math.sin(2 * Math.PI * melodyFrequency * 2 * t) + bowedTone) * melodyEnvelope * (track.classical ? 0.12 : 0.14);
    const intro = Math.min(1, t / 1.2);
    const outro = Math.min(1, Math.max(0, durationSeconds - t) / 1.8);
    const master = intro * outro;
    const leftValue = (pad + bass + kick + snare * 0.92 + hat * 0.72 + melody * 0.78) * master;
    const rightValue = (pad * 0.96 + bass + kick + snare + hat + melody) * master;
    left[sample] = leftValue;
    right[sample] = rightValue;
    peak = Math.max(peak, Math.abs(leftValue), Math.abs(rightValue));
  }
  const gain = peak > 0 ? Math.min(0.92 / peak, 1.8) : 1;
  for (let sample = 0; sample < frames; sample += 1) {
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[sample] * gain)) * 32767), sample * 4);
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[sample] * gain)) * 32767), sample * 4 + 2);
  }
  const wav = Buffer.alloc(44 + pcm.length);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + pcm.length, 4); wav.write('WAVE', 8);
  wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(channels, 22);
  wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * channels * 2, 28); wav.writeUInt16LE(channels * 2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(pcm.length, 40); pcm.copy(wav, 44);
  const audioPath = join(runDir, `${track.id}.wav`);
  writeFileSync(audioPath, wav);
  return { ...track, audioPath };
}

function renderReelVideo(runDir, imagePaths) {
  if (!imagePaths.length) throw new Error('Reel precisa de pelo menos uma cena renderizada.');
  const reelPath = join(runDir, 'reel.mp4');
  const sceneSeconds = 5;
  const transitionSeconds = 0.65;
  const durationSeconds = (imagePaths.length * sceneSeconds) - ((imagePaths.length - 1) * transitionSeconds);
  const requestedTrackIndex = Number.parseInt(process.env.INSTAGRAM_REEL_SOUNDTRACK_INDEX || '', 10);
  const trackIndex = Number.isInteger(requestedTrackIndex) && requestedTrackIndex >= 0
    ? requestedTrackIndex % REEL_BEETHOVEN_SOUNDTRACKS.length
    : stableAvatarOffset(imagePaths.join('|')) % REEL_BEETHOVEN_SOUNDTRACKS.length;
  const audioTrack = renderOriginalInstrumentalWav(runDir, durationSeconds, trackIndex);
  const inputs = imagePaths.flatMap((imagePath) => ['-loop', '1', '-t', String(sceneSeconds), '-i', resolve(imagePath)]);
  const filters = imagePaths.map((_, index) => reelSceneFilter(index)).join(';');
  const transitionNames = ['fade', 'slideleft', 'smoothleft', 'circleopen'];
  const transitionSeed = stableAvatarOffset(imagePaths.join('|'));
  const transitionParts = [];
  let previousVideo = '[v0]';
  for (let index = 1; index < imagePaths.length; index += 1) {
    const output = index === imagePaths.length - 1 ? '[outv]' : `[xf${index}]`;
    const transition = transitionNames[(transitionSeed + index - 1) % transitionNames.length];
    const offset = (index * sceneSeconds) - (index * transitionSeconds);
    transitionParts.push(`${previousVideo}[v${index}]xfade=transition=${transition}:duration=${transitionSeconds}:offset=${offset.toFixed(2)}${output}`);
    previousVideo = output;
  }
  const audioInputIndex = imagePaths.length;
  const audioFilter = `[${audioInputIndex}:a]highpass=f=45,lowpass=f=14000,loudnorm=I=-15:LRA=9:TP=-1.5[outa]`;
  const result = spawnSync('ffmpeg', [
    '-y', ...inputs,
    '-i', audioTrack.audioPath,
    '-filter_complex', `${filters};${transitionParts.join(';')};${audioFilter}`, '-map', '[outv]', '-map', '[outa]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', '-shortest', reelPath
  ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  if (result.error) throw new Error(`FFmpeg indisponivel para gerar Reel: ${result.error.message}`);
  if (result.status !== 0 || !existsSync(reelPath)) throw new Error(`Falha ao gerar Reel: ${(result.stderr || '').slice(-1600)}`);
  writeFileSync(join(runDir, 'reel-audio.json'), JSON.stringify({
    id: audioTrack.id,
    kind: 'instrumental-original-arranged',
    inspiration: audioTrack.work || 'trilha original da plataforma',
    rights: audioTrack.classical ? 'composicao em dominio publico; arranjo e sintese proprios' : 'composicao e sintese proprias',
    arrangement: ['bateria', 'baixo', 'acordes', 'melodia'],
    bpm: audioTrack.bpm,
    durationSeconds,
    sampleRate: 48000,
    channels: 2,
    loudnessTargetLufs: -15,
    truePeakTargetDb: -1.5,
    fadeInSeconds: 1.2,
    fadeOutSeconds: 1.8,
    transitionSeconds,
    transitions: imagePaths.slice(1).map((_, index) => transitionNames[(transitionSeed + index) % transitionNames.length])
  }, null, 2), 'utf8');
  return { reelPath, audioTrack: audioTrack.id };
}

function reelSceneFilter(index) {
  return `[${index}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v${index}]`;
}

async function createReel(userId, token, videoUrl, caption) {
  const reel = await graphPost(`/${userId}/media`, {
    media_type: 'REELS', video_url: videoUrl, caption, share_to_feed: 'true', access_token: token
  });
  await pollContainer(reel.id, token);
  return reel;
}

async function createCarouselChildFromImage(userId, token, imagePath, apiKey) {
  return withRetry('Create carousel child', async (attempt) => {
    const imageUrl = isHttpUrl(imagePath)
      ? imagePath
      : await uploadReadyImageToImgBB(imagePath, apiKey);
    try {
      const child = await graphPost(`/${userId}/media`, {
        image_url: imageUrl,
        is_carousel_item: 'true',
        access_token: token
      });
      return { child, imageUrl };
    } catch (error) {
      if (error.mediaUrlRejected && attempt < MEDIA_URL_RETRY_ATTEMPTS) {
        console.warn(`Meta recusou a URL ${imageUrl}; reenviando a imagem para gerar outra URL.`);
      }
      throw error;
    }
  }, MEDIA_URL_RETRY_ATTEMPTS);
}

async function pollContainer(containerId, token) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const status = await graphGet(`/${containerId}`, { fields: 'status_code', access_token: token });
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') throw new Error(`Container ${containerId} failed.`);
    await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 3000));
  }
  throw new Error(`Container ${containerId} timed out.`);
}

async function createStory(userId, token, imageUrl) {
  const story = await graphPost(`/${userId}/media`, {
    media_type: 'STORIES',
    image_url: imageUrl,
    access_token: token
  });
  await pollContainer(story.id, token);
  return story;
}

async function createStoryFromImage(userId, token, imagePath, apiKey) {
  return withRetry('Create story media', async (attempt) => {
    const imageUrl = isHttpUrl(imagePath)
      ? imagePath
      : await uploadReadyImageToImgBB(imagePath, apiKey);
    try {
      const story = await createStory(userId, token, imageUrl);
      return { story, imageUrl };
    } catch (error) {
      if (error.mediaUrlRejected && attempt < MEDIA_URL_RETRY_ATTEMPTS) {
        console.warn(`Meta recusou a URL do story ${imageUrl}; reenviando a imagem para gerar outra URL.`);
      }
      throw error;
    }
  }, MEDIA_URL_RETRY_ATTEMPTS);
}

async function main() {
  const args = parseArgs(process.argv);
  const env = loadEnv();
  const { account, packs: localPacks, styles } = loadConfig(args.configDir, args.account);
  const { radar, options: radarOptions } = radarResearchOptions(account);
  if (!args.renderOnly && !args.dryRun && !args.validateCopy && account.clientProfile && account.clientProfile.status !== 'active') {
    const billingStatus = account.clientProfile.billing?.status || account.clientProfile.status || 'onboarding';
    throw new Error(`Publicacao bloqueada para ${account.account}: cliente ${billingStatus}. Regularize ou ative o contrato antes de publicar.`);
  }
  const supabasePacks = await loadSupabasePacks(env, args.account);
  const packs = mergePacks(supabasePacks, localPacks);
  validatePacks(packs);

  const today = args.planDate || todaySaoPaulo();
  if (args.planDay) {
    let plannedNews = [];
    if (radar.enabled && radar.sources.length) {
      try {
        plannedNews = (await researchRadarWithFallback(radarOptions)).packs;
      } catch {}
    }
    console.log(JSON.stringify({
      ok: true,
      account: account.account,
      date: today,
      dailyPlan: plannedNews.length
        ? planForNewsSlots(account, plannedNews, today)
        : planForAutomaticSlots(account, packs, today)
    }, null, 2));
    return;
  }

  const slotIndex = readSlotIndex();
  const publicationHistory = readPublicationHistory(args.configDir, account.account);
  const creativeBatchSize = 74;
  const creativeGeneration = Math.floor(publicationHistory.length / creativeBatchSize) + 1;
  // Keep the real publication aligned with the dashboard preview. Freshness is
  // still enforced by date rotation and the publication-history duplicate guard.
  const generationSlotIndex = slotIndex;
  const creativeBatchRemaining = creativeBatchSize - (publicationHistory.length % creativeBatchSize);
  const profilePacks = buildProfileContentPacks(account, today, generationSlotIndex);
  const autoPacks = profilePacks.length ? profilePacks : buildAutoContentPacks(today, generationSlotIndex);
  let editorialResearch = { packs: [], items: [], failures: [], researchedAt: new Date().toISOString() };
  if (!args.validateCopy && radar.enabled && radar.sources.length) {
    try {
      editorialResearch = await researchRadarWithFallback(radarOptions);
      if (editorialResearch.packs.length && !args.dryRun) {
        writeRadarCache(args.configDir, account.account, editorialResearch);
      } else if (!editorialResearch.packs.length) {
        const cachedResearch = readRadarCache(args.configDir, account.account);
        if (cachedResearch) {
          editorialResearch = cachedResearch;
          console.log(`Radar editorial: coleta atual sem pautas; ${cachedResearch.packs.length} pautas da ultima coleta valida foram recuperadas automaticamente.`);
        }
      }
      console.log(`Radar editorial: ${editorialResearch.packs.length} temas encontrados em fontes oficiais na janela de ${editorialResearch.maxAgeDays || 7} dias.`);
      if (editorialResearch.failures.length) console.log(`Radar editorial: ${editorialResearch.failures.length} fonte(s) indisponivel(is); fluxo continuara com as demais.`);
    } catch (error) {
      const cachedResearch = readRadarCache(args.configDir, account.account);
      if (cachedResearch) {
        editorialResearch = cachedResearch;
        console.log(`Radar editorial indisponivel (${error.message}); ${cachedResearch.packs.length} pautas da ultima coleta valida foram recuperadas automaticamente.`);
      } else {
        console.log(`Radar editorial indisponivel (${error.message}). A publicacao real sera bloqueada para nao usar conteudo generico.`);
      }
    }
  }
  const baseSelectionPacks = profilePacks.length ? mergePacks(profilePacks, packs) : packs;
  let useResearchThisSlot = radar.enabled && editorialResearch.packs.length > 0;
  let usedEditorialReserveThisSlot = false;
  let automaticSelectionPacks = useResearchThisSlot
    ? editorialResearch.packs
    : baseSelectionPacks;
  if (useResearchThisSlot) {
    automaticSelectionPacks = automaticSelectionPacks.map((candidate) => ({
      ...candidate,
      caption: fitInstagramCaption(candidate.caption, candidate)
    }));
  }
  if (useResearchThisSlot) console.log('Radar editorial configurado priorizado para este horário automático.');
  validatePacks(autoPacks);
  validatePacks(automaticSelectionPacks);
  if (args.validateCopy) {
    const githubRaceProbe = createHttpError(
      'GitHub image hosting',
      422,
      JSON.stringify({ message: 'Update is not a fast forward', status: '422' })
    );
    if (!githubRaceProbe.retryable) throw new Error('Recuperacao da corrida de referencia do GitHub falhou no teste.');
    const githubInvalidProbe = createHttpError(
      'GitHub image hosting',
      422,
      JSON.stringify({ message: 'Validation Failed', status: '422' })
    );
    if (githubInvalidProbe.retryable) throw new Error('Erro permanente 422 do GitHub foi marcado para repeticao indevida.');
    const duplicateProbePack = automaticSelectionPacks[0];
    const configuredBookStoryPacks = bookStoryPacks(args.configDir, account.account);
    if (!configuredBookStoryPacks.length) throw new Error('Rodízio editorial não encontrou Stories autorais do livro na fila configurada.');
    const bookRotationProbe = { authoredBook: { title: 'Livro' }, slides: [{ title: 'Trecho inédito', body: 'Aplicação prática.' }], caption: 'Trecho autoral.' };
    const fiveNewsProbe = Array.from({ length: 5 }, (_, index) => ({
      storyMediaId: `story-${index}`,
      coverTitle: `Notícia ${index}`,
      research: { sourceUrl: `https://example.com/news-${index}` }
    }));
    if (pickBookStoryAfterNews(fiveNewsProbe.slice(0, 4), [bookRotationProbe])) throw new Error('Rodízio do livro antecipou o Story antes de cinco notícias.');
    if (pickBookStoryAfterNews(fiveNewsProbe, [bookRotationProbe]) !== bookRotationProbe) throw new Error('Rodízio do livro não selecionou Story após cinco notícias.');
    if (pickBookStoryAfterNews([...fiveNewsProbe, { storyMediaId: 'book-story', storyContentKind: 'book', storyCoverTitle: 'Trecho inédito' }], [bookRotationProbe])) {
      throw new Error('Rodízio do livro repetiu Story sem acumular outras cinco notícias.');
    }
    const duplicateProbe = pickFreshPack([duplicateProbePack], today, slotIndex, [], [{
      feedFingerprint: packContentFingerprint(duplicateProbePack),
      storyFingerprint: packContentFingerprint(duplicateProbePack)
    }]);
    if (duplicateProbe.pack) throw new Error('Protecao anti-repeticao falhou no teste de historico.');
    const coverProbe = findDuplicateCoverTitle([], [{
      coverTitle: duplicateProbePack?.slides?.[0]?.title || ''
    }], duplicateProbePack);
    if (!coverProbe) throw new Error('Protecao anti-repeticao de capa falhou no teste de historico.');
    const datedDuplicateProbe = {
      ...duplicateProbePack,
      slides: duplicateProbePack.slides.map((slide, index) => index === duplicateProbePack.slides.length - 1
        ? { ...slide, body: `${slide.body} Edicao operacional 31/08/2026 12:00 BRT.` }
        : slide),
      caption: `${duplicateProbePack.caption}\n\nEdicao operacional 31/08/2026 12:00 BRT.`
    };
    if (!findDuplicateSelection(datedDuplicateProbe, [], [{
      coverTitle: duplicateProbePack?.slides?.[0]?.title || '',
      feedFingerprint: packContentFingerprint(duplicateProbePack)
    }])) {
      throw new Error('Data de edicao permitiu repetir titulo ou tema editorial no teste de historico.');
    }
    const semanticTemplateProbe = findSemanticCoverTitle([{
      coverTitle: 'SaaS com IA: 3 pontos para arrumar antes da IA.'
    }], {
      slides: [{ title: 'Uso do Codex: 3 pontos para arrumar antes da IA.' }]
    });
    if (!semanticTemplateProbe) throw new Error('Variacao superficial de titulo passou pela protecao semantica.');
    const sourceProbePack = {
      ...duplicateProbePack,
      research: { source: 'Fonte de teste', sourceUrl: 'https://example.com/noticia-nova' }
    };
    const sourceProbe = findConsecutiveResearchSource([{
      research: { source: 'Fonte de teste', sourceUrl: 'https://example.com/noticia-anterior' }
    }], sourceProbePack);
    if (!sourceProbe) throw new Error('Rodizio de fontes falhou no teste de historico.');
    const balancedProbePacks = ['Fonte A', 'Fonte B', 'Fonte C'].map((source, index) => ({
      research: { source, sourceUrl: `https://example.com/${index}` },
      slides: [{ eyebrow: source, title: `Titulo ${source}`, body: `Corpo ${source}` }],
      caption: `Legenda ${source}`
    }));
    const balancedProbe = pickFreshPack(balancedProbePacks, today, slotIndex, [], [
      { publishedAt: '2026-08-14T10:00:00.000Z', research: { source: 'Fonte A', sourceUrl: 'https://example.com/a1' } },
      { publishedAt: '2026-08-15T10:00:00.000Z', research: { source: 'Fonte A', sourceUrl: 'https://example.com/a2' } },
      { publishedAt: '2026-08-16T10:00:00.000Z', research: { source: 'Fonte B', sourceUrl: 'https://example.com/b1' } }
    ]);
    if (balancedProbe.pack?.research?.source !== 'Fonte C') throw new Error('Balanceamento por fonte falhou no teste de historico.');
    const historicalNoise = Array.from({ length: 20 }, (_, index) => ({
      publishedAt: `2026-07-${String(index + 1).padStart(2, '0')}T10:00:00.000Z`,
      research: { source: 'Fonte C', sourceUrl: `https://example.com/c-old-${index}` }
    }));
    const recentWindow = [
      ...Array.from({ length: 6 }, (_, index) => ({ publishedAt: `2026-08-16T${String(index).padStart(2, '0')}:00:00.000Z`, research: { source: 'Fonte A', sourceUrl: `https://example.com/a-recent-${index}` } })),
      ...Array.from({ length: 6 }, (_, index) => ({ publishedAt: `2026-08-17T${String(index).padStart(2, '0')}:00:00.000Z`, research: { source: 'Fonte B', sourceUrl: `https://example.com/b-recent-${index}` } }))
    ];
    const recentBalancedProbe = pickFreshPack(balancedProbePacks, today, slotIndex, [], [...historicalNoise, ...recentWindow]);
    if (recentBalancedProbe.pack?.research?.source !== 'Fonte C') throw new Error('Janela recente de balanceamento por fonte falhou.');
    const randomSourceProbe = pickFreshPack(balancedProbePacks, today, slotIndex, [], [], (length) => length - 1);
    if (randomSourceProbe.pack?.research?.source !== 'Fonte C') throw new Error('Sorteio entre fontes oficiais falhou no teste controlado.');
    const randomFirstSourceProbe = pickFreshPack(balancedProbePacks, today, slotIndex, [], [], () => 0);
    if (randomFirstSourceProbe.pack?.research?.source !== 'Fonte A') throw new Error('Sorteio nao percorre fontes oficiais elegiveis.');
    const organicPotentialProbe = shortlistByOrganicPotential([
      {
        originalIndex: 0,
        pack: {
          research: { source: 'Fonte A', sourceTitle: 'Nota institucional semanal', publishedAt: '2026-07-01T10:00:00.000Z' },
          slides: [{ title: 'Nota institucional semanal' }],
          caption: 'Resumo geral sem aplicação prática.'
        }
      },
      {
        originalIndex: 1,
        pack: {
          research: {
            source: 'Fonte A',
            sourceTitle: 'Como reduzir 30% do custo de tokens de IA nas empresas',
            sourceImageUrl: 'https://example.com/tokens.jpg',
            publishedAt: `${today}T12:00:00-03:00`,
            sourceFacts: ['Empresas mediram o consumo.', 'A gestão de tokens reduz custos.', 'O controle melhora a produtividade operacional com dados comparáveis.']
          },
          slides: [{ title: 'Como reduzir 30% do custo de tokens de IA nas empresas' }],
          caption: 'Um passo prático para gestão de inteligência artificial.'
        }
      }
    ], today);
    if (organicPotentialProbe[0]?.originalIndex !== 1 || organicPotentialProbe[0]?.organicPotential?.score < 75) {
      throw new Error('Motor de potencial orgânico não priorizou a pauta recente, concreta e útil.');
    }
    const fatiguePack = organicPotentialProbe[0].pack;
    const fatigueHistory = Array.from({ length: 6 }, (_, index) => ({
      publishedAt: `${today}T${String(10 + index).padStart(2, '0')}:00:00-03:00`,
      coverTitle: fatiguePack.slides[0].title,
      research: { source: fatiguePack.research.source, theme: 'gestão de tokens e dados' }
    }));
    const freshScore = organicPotentialScore(fatiguePack, today, [], { format: 'REELS', daypart: 'afternoon', objective: 'utility' });
    const fatiguedScore = organicPotentialScore(fatiguePack, today, fatigueHistory, { format: 'REELS', daypart: 'afternoon', objective: 'utility' });
    if (fatiguedScore.score >= freshScore.score || fatiguedScore.fatiguePenalty < 1 || fatiguedScore.contextKey !== 'REELS|afternoon|utility') {
      throw new Error('Controle de fadiga ou contexto auditável falhou no teste.');
    }
    const experimentModes = Array.from({ length: 1000 }, (_, index) => controlledExperimentMode(`teste-${index}`, index % 13));
    if (!experimentModes.includes('exploit') || !experimentModes.includes('explore') || !experimentModes.includes('experiment')) {
      throw new Error('Exploração controlada 70/20/10 falhou no teste determinístico.');
    }
    const exploitShare = experimentModes.filter((mode) => mode === 'exploit').length / experimentModes.length;
    if (exploitShare < 0.64 || exploitShare > 0.76) throw new Error('Distribuição de exploração controlada saiu da faixa segura.');
    const avatarProbeAccount = {
      avatarRotation: { enabled: true, urls: Array.from({ length: 7 }, (_, index) => `foto-${index + 1}`) }
    };
    const avatarProbeHistory = [];
    const avatarProbeCovers = [];
    for (let index = 0; index < 7; index += 1) {
      const avatarStart = pickAvatarRotationStart(avatarProbeAccount, avatarProbeHistory, `pauta-${index}`);
      const coverAvatar = avatarProbeAccount.avatarRotation.urls[avatarStart];
      avatarProbeCovers.push(coverAvatar);
      avatarProbeHistory.push({ coverAvatar });
    }
    if (new Set(avatarProbeCovers).size !== 7) throw new Error('Rodizio anti-repeticao de fotos falhou no teste de historico.');
    const sameCarouselPhotoContext = { dateString: today, slotIndex, creativeGeneration: 1, variationSeed: 'teste-carrossel' };
    const coverSectorPhoto = sectorPhotoCssImage('business', 1, sameCarouselPhotoContext);
    const proofSectorPhoto = sectorPhotoCssImage('business', 4, sameCarouselPhotoContext);
    if (!coverSectorPhoto || !proofSectorPhoto || coverSectorPhoto === proofSectorPhoto) {
      throw new Error('Rodizio de fotos dentro do mesmo carrossel falhou.');
    }
    const ecommercePhoto = 'ecommerce.jpg';
    const genericReelPhotos = Array.from({ length: 16 }, (_, index) => sectorPhotoCssImage('business', index + 1, {
      dateString: today,
      slotIndex: index,
      creativeGeneration: 1,
      variationSeed: `teste-reel-generico-${index}`
    }));
    if (genericReelPhotos.some((photo) => photo.includes(ecommercePhoto))) {
      throw new Error('Foto de ecommerce vazou para o rodizio visual de Reels empresariais.');
    }
    const ecommerceSectorPhotos = Array.from({ length: 4 }, (_, index) => sectorPhotoCssImage('ecommerce', index + 1, sameCarouselPhotoContext));
    if (!ecommerceSectorPhotos.some((photo) => photo.includes(ecommercePhoto))) {
      throw new Error('Foto de ecommerce deixou de estar disponivel para pautas realmente ligadas ao setor.');
    }
    const radarKeywords = ['AI', 'artificial intelligence', 'automation', 'agent', 'workflow', 'machine learning'];
    if (matchesConfiguredEditorialIntent('Governo pode comprar luvas de choque para agentes de imigração', radarKeywords)) {
      throw new Error('Filtro semantico do Radar confundiu agentes de imigracao com agentes de IA.');
    }
    if (!matchesConfiguredEditorialIntent('Empresas adotam agentes de IA para automatizar tarefas', radarKeywords)) {
      throw new Error('Filtro semantico do Radar rejeitou uma pauta valida sobre agentes de IA.');
    }
    if (normalizeEditorialSources(EDITORIAL_SOURCES).length !== EDITORIAL_SOURCES.length) {
      throw new Error('Rodizio do Radar descartou fontes oficiais configuradas.');
    }
    const editorialImageProbe = extractEditorialImageUrl(`
      <html><head><meta property="og:image" content="/media/noticia-ia-empresas-1600x900.jpg"></head></html>
    `, 'https://fonte-oficial.example/noticias/ia-empresas');
    if (editorialImageProbe !== 'https://fonte-oficial.example/media/noticia-ia-empresas-1600x900.jpg') {
      throw new Error('Extracao da imagem oficial da materia falhou.');
    }
    const rejectedEditorialLogo = extractEditorialImageUrl('<meta property="og:image" content="https://fonte-oficial.example/logo.svg">', 'https://fonte-oficial.example/noticia');
    if (rejectedEditorialLogo) throw new Error('Filtro de imagem editorial aceitou logo ou SVG como foto da materia.');
    assertPortugueseAccents('Operação confirmada. https://fonte-oficial.example/noticia/operacao-comercial-no-brasil');
    const validationNow = new Date();
    const researchIntegrityProbe = buildResearchPack({
      source: 'TecMundo',
      title: 'Empresas adotam agentes de IA para automatizar tarefas',
      url: 'https://www.tecmundo.com.br/mercado/exemplo-agentes-ia.htm',
      publishedAt: validationNow.toISOString(),
      summary: 'A matéria apresenta o uso de agentes de IA em tarefas empresariais.'
    }, validationNow, {
      niche: 'automação com IA para empresas',
      keywords: radarKeywords,
      audience: 'gestores',
      offer: 'consultoria e automações com IA'
    });
    validatePack(researchIntegrityProbe);
    const ihcProbeAccount = {
      contentProfile: {
        audience: 'gestores',
        offer: 'consultoria e automações com IA',
        storyMethod: { ihcHanahEnabled: true }
      }
    };
    const ihcReelProbe = preparePackForPublication(researchIntegrityProbe, today, slotIndex, ihcProbeAccount, 'reel-and-story').pack;
    const ihcCarouselProbe = preparePackForPublication(researchIntegrityProbe, today, slotIndex, ihcProbeAccount, 'feed-and-story').pack;
    validatePack(ihcReelProbe);
    validatePack(ihcCarouselProbe);
    if (ihcReelProbe.slides.length !== 9 || ihcCarouselProbe.slides.length !== 10) {
      throw new Error('Método IHC da Hanah não respeitou 9 takes para Reel e 10 cards para carrossel.');
    }
    if (shortWords(ihcReelProbe.slides[0]?.title || '', 15) !== ihcReelProbe.slides[0]?.title) {
      throw new Error('Gancho inicial do Método IHC passou de 15 palavras.');
    }
    if (!ihcReelProbe.caption.includes(researchIntegrityProbe.research.sourceUrl)) {
      throw new Error('Método IHC perdeu o link da fonte oficial.');
    }
    const bottiniProbeAccount = {
      contentProfile: {
        bottiniVoice: {
          enabled: true,
          intensity: 'balanced',
          words: ['incrível', 'sensacional', 'excelente', 'imperdível', 'isso tem qualidade']
        }
      }
    };
    const proprietaryBottiniProbe = {
      caption: 'Conheça este produto para automatizar o atendimento.',
      slides: [{ eyebrow: 'PRODUTO', title: 'Um atendimento mais rápido', body: 'A solução organiza as conversas.' }]
    };
    const bottiniPrepared = preparePackForPublication(proprietaryBottiniProbe, today, slotIndex, bottiniProbeAccount, 'feed-and-story');
    if (!bottiniPrepared.pack.caption.includes('incrível') || bottiniPrepared.pack.slides[0]?.eyebrow !== 'OLHA ISSO') {
      throw new Error(`Botão Bottini não aplicou a dose equilibrada ao conteúdo próprio: ${JSON.stringify({ caption: bottiniPrepared.pack.caption, eyebrow: bottiniPrepared.pack.slides[0]?.eyebrow, bottiniVoice: bottiniPrepared.pack.bottiniVoice })}`);
    }
    const radarBottiniPrepared = preparePackForPublication(researchIntegrityProbe, today, slotIndex, bottiniProbeAccount, 'feed-and-story');
    if (radarBottiniPrepared.pack.bottiniVoice || radarBottiniPrepared.pack.caption.includes('Olha isso:')) {
      throw new Error('Botão Bottini alterou indevidamente uma notícia do Radar.');
    }
    const realSummaryProbe = factualSummary({
      title: 'CEO da Anthropic: rejeição à IA é crise de confiança no setor',
      summary: 'Dario Amodei nega pessimismo em relação às inteligências artificiais e reconhece que o público geral questiona os ganhos com o avanço da tecnologia. O post CEO da Anthropic: rejeição à IA é crise de confiança no setor apareceu primeiro em Olhar Digital.'
    });
    if (!/Dario Amodei/i.test(realSummaryProbe) || /O post apareceu/i.test(realSummaryProbe)) {
      throw new Error('Extração do contexto factual da matéria falhou.');
    }
    const articleFactsProbe = extractArticleFacts(`
      <p>O logotipo da OpenAI é visto em um telefone celular em frente à tela inicial do ChatGPT — Foto: AP/Michael Dwyer, Arquivo</p>
      <p>A percepção do público sobre inteligência artificial virou o centro de um debate no setor de tecnologia.</p>
      <p>Amodei afirmou que busca equilibrar os riscos reais e as oportunidades criadas pela tecnologia.</p>
      <p>A rejeição, segundo o executivo, decorre de uma crise de confiança acumulada ao longo de décadas.</p>
    `, { title: 'CEO da Anthropic: rejeição à IA é crise de confiança no setor' });
    const continuedResearchProbe = buildResearchPack({
      source: 'Olhar Digital',
      title: 'CEO da Anthropic: rejeição à IA é crise de confiança no setor',
      url: 'https://olhardigital.com.br/exemplo-anthropic',
      publishedAt: validationNow.toISOString(),
      summary: realSummaryProbe,
      articleFacts: articleFactsProbe
    }, validationNow, { niche: 'automação com IA para empresas', keywords: radarKeywords });
    const continuedSlideCopy = continuedResearchProbe.slides.map((slide) => `${slide.title}\n${slide.body}`).join('\n');
    if (articleFactsProbe.length < 3 || !continuedSlideCopy.includes(articleFactsProbe[1].slice(0, 48)) || !continuedResearchProbe.caption.includes(articleFactsProbe[2])) {
      throw new Error('Continuidade factual entre matéria, slide 3 e legenda falhou.');
    }
    if (articleFactsProbe.some((fact) => /Foto:|Michael Dwyer|logotipo da OpenAI/i.test(fact))) {
      throw new Error('Legenda ou crédito de imagem foi aceito como fato da matéria.');
    }
    if (isUsableEditorialFact('A empresa anunciou uma operação comercial no Brasil, mas os detalhes ainda serão...')) {
      throw new Error('Resumo factual truncado foi aceito pelo Radar.');
    }
    const editorialVariationProbes = Array.from({ length: 12 }, (_, index) => buildResearchPack({
      source: 'Fonte de teste',
      title: `Matéria empresarial ${index + 1}`,
      url: `https://example.com/materia-cta-${index + 1}`,
      publishedAt: validationNow.toISOString(),
      summary: 'A matéria apresenta automação e inteligência artificial aplicadas a processos empresariais.'
    }, validationNow, { niche: 'automação com IA para empresas', keywords: radarKeywords }));
    const closingVariationProbe = editorialVariationProbes
      .map((probe) => `${probe.slides.at(-1)?.title}|${probe.slides.at(-1)?.body}`);
    if (new Set(closingVariationProbe).size < 6) {
      throw new Error('Rodizio de chamadas do ultimo slide gerou pouca variacao.');
    }
    const structureVariationProbe = editorialVariationProbes
      .map((probe) => probe.slides.slice(0, 4).map((slide) => slide.eyebrow).join('|'));
    if (new Set(structureVariationProbe).size < 5) {
      throw new Error('Rodizio editorial do Radar gerou pouca variacao estrutural.');
    }
    const englishResearchProbe = buildResearchPack({
      source: 'n8n',
      title: 'Building AI Agent Observability for Production Workflows',
      url: 'https://blog.n8n.io/ai-agent-observability/',
      publishedAt: validationNow.toISOString(),
      summary: 'Learn how AI agent observability provides the visibility needed to understand failures and build reliable workflows.',
      articleFacts: [
        'AI agents are getting better at handling complex multi-step tasks, but they are also getting harder to debug.',
        'AI agent observability captures model calls, tool invocations, and interactions with external systems.'
      ]
    }, validationNow, { niche: 'automação com IA para empresas', keywords: radarKeywords });
    validatePack(englishResearchProbe);
    if (englishResearchProbe.research.sourceFacts.some((fact) => isPredominantlyEnglish(fact)) || /\bLearn how\b/i.test(englishResearchProbe.caption)) {
      throw new Error('Localização obrigatória para português falhou.');
    }
    const thailandTranslationProbe = buildResearchPack({
      source: 'OpenAI',
      title: 'Supporting Thailand’s next generation of AI startups',
      url: 'https://openai.com/index/supporting-next-generation-ai-startups-thailand',
      publishedAt: validationNow.toISOString(),
      summary: 'OpenAI and Thailand’s MHESI launch an eight-week accelerator helping 10 health, wellness, and education startups turn AI prototypes into trusted products.'
    }, validationNow, { niche: 'automação com IA para empresas', keywords: radarKeywords });
    validatePack(thailandTranslationProbe);
    const thailandExplanation = thailandTranslationProbe.caption.split('Entenda a matéria:\n')[1]?.split('\n\nPublicada em')[0] || '';
    if (!thailandExplanation || isPredominantlyEnglish(thailandExplanation) || /eight-week accelerator|trusted products/i.test(thailandExplanation)) {
      throw new Error('Tradução da pauta internacional não foi aplicada após Entenda a matéria.');
    }
    if (!/dez startups|programa acelerador de oito semanas/i.test(thailandExplanation)) {
      throw new Error('Tradução da pauta internacional perdeu o fato principal da matéria.');
    }
    const ibmTranslationProbe = buildResearchPack({
      source: 'IBM AI',
      url: 'https://newsroom.ibm.com/ibm-openai-core-operations',
      title: 'IBM Partners with OpenAI to Accelerate Secure AI Deployment for Enterprises Across Core Operations',
      publishedAt: validationNow.toISOString(),
      summary: 'IBM and OpenAI announced a partnership to help enterprises deploy AI at scale across core operations.'
    }, validationNow, { niche: 'automação com IA para empresas', keywords: radarKeywords });
    validatePack(ibmTranslationProbe);
    if (ibmTranslationProbe.slides.some((slide) => isPredominantlyEnglish(slide.researchDisplayTitle))) {
      throw new Error('Título do cartão visual da fonte não foi traduzido para português.');
    }
    if (!isPredominantlyEnglish('Your AI project WILL break. Welcome to the Day 2 problem.')) {
      throw new Error('Detector de título técnico em inglês falhou.');
    }
    if (!isPredominantlyEnglish('Catching wildfires earlier: AI gives firefighters a head start')) {
      throw new Error('Detector de título jornalístico em inglês falhou.');
    }
    if (factualSummary({
      title: 'Catching wildfires earlier: AI gives firefighters a head start',
      summary: 'The post Catching wildfires earlier: AI gives firefighters a head start appeared first on Source .'
    })) {
      throw new Error('Boilerplate de feed em inglês foi aceito como fato jornalístico.');
    }
    const untranslatedEnglishProbe = buildResearchPack({
      source: 'n8n',
      title: 'Your AI project WILL break. Welcome to the Day 2 problem.',
      url: 'https://blog.n8n.io/day-2-problem-test/',
      publishedAt: validationNow.toISOString(),
      summary: 'Your AI project will eventually fail unless the team prepares operations for the second day.'
    }, validationNow, { niche: 'automação com IA para empresas', keywords: radarKeywords });
    let untranslatedEnglishBlocked = false;
    try {
      validatePack(untranslatedEnglishProbe);
    } catch (error) {
      untranslatedEnglishBlocked = /contexto factual|inglês|titulo|título|banner/i.test(String(error.message || ''));
    }
    if (!untranslatedEnglishBlocked) throw new Error('Pauta sem tradução editorial não foi bloqueada.');
    const genericResearchProbe = {
      ...researchIntegrityProbe,
      slides: researchIntegrityProbe.slides.map((slide, index) => index === 0
        ? { ...slide, title: 'Trabalho repetido ocupa o tempo que deveria ir para o cliente.' }
        : slide)
    };
    let genericResearchBlocked = false;
    try {
      validatePack(genericResearchProbe);
    } catch (error) {
      genericResearchBlocked = /capa genérica/i.test(String(error.message || ''));
    }
    if (!genericResearchBlocked) throw new Error('Trava de chamadas genéricas do Radar falhou.');
    if (FEED_WIDTH !== 1080 || FEED_HEIGHT !== 1350 || FEED_WIDTH / FEED_HEIGHT !== 4 / 5) {
      throw new Error('Arquitetura do Feed deve permanecer em 1080 x 1350 (4:5).');
    }
    if (STORY_WIDTH !== 1080 || STORY_HEIGHT !== 1920 || STORY_SAFE_TOP !== 250 || STORY_SAFE_BOTTOM !== 500 || STORY_SAFE_HEIGHT !== 1170) {
      throw new Error('Arquitetura segura do Story foi alterada fora do padrao 250/1170/500.');
    }
    const impactStoryStyle = styles.find((candidate) => candidate.name === 'impact-carousel');
    const impactStoryProbe = impactStoryStyle ? anatexStoryHtml({
      eyebrow: 'Trecho do livro',
      title: 'O gestor de IA não substitui especialistas. Ele coordena.',
      body: 'Como Ser Gestor do Claude Code, Capítulo 1, página 7.',
      imagePath: 'docs/uploads/book-claude-briefing.png'
    }, account, impactStoryStyle, { publishMode: 'feed-and-story' }) : '';
    if (!impactStoryProbe.includes('has-story-photo') || !impactStoryProbe.includes('book-claude-briefing.png')) {
      throw new Error('Story de campanha com imagem voltou ao layout apenas textual.');
    }
    if (!impactStoryProbe.includes('height: 720px')) {
      throw new Error('Story com foto voltou a deixar vazio excessivo no rodape.');
    }
    const reelNavigationProbe = impactStoryStyle ? slideHtml({
      eyebrow: 'VALE ENTENDER',
      title: 'Uma pauta recente sobre inteligência artificial.',
      body: 'O vídeo apresenta os pontos em sequência.'
    }, 1, 5, account, impactStoryStyle, { publishMode: 'reel-and-story' }) : '';
    const carouselNavigationProbe = impactStoryStyle ? slideHtml({
      eyebrow: 'VALE ENTENDER',
      title: 'Uma pauta recente sobre inteligência artificial.',
      body: 'O carrossel apresenta os pontos em sequência.'
    }, 1, 5, account, impactStoryStyle, { publishMode: 'feed-and-story' }) : '';
    if (/arraste para ver/i.test(reelNavigationProbe) || !/arraste para ver/i.test(carouselNavigationProbe)) {
      throw new Error('Indicador de arrastar precisa ficar restrito ao carrossel e ausente do Reel.');
    }
    if (!reelNavigationProbe.includes('height: 1920px') || !carouselNavigationProbe.includes('height: 1350px')) {
      throw new Error('Reel deve ser renderizado nativamente em 1080 x 1920 sem alterar o carrossel 4:5.');
    }
    const reelFullFrameProbe = reelSceneFilter(0);
    if (!reelFullFrameProbe.includes('scale=1080:1920') || reelFullFrameProbe.includes('gblur') || reelFullFrameProbe.includes('overlay=')) {
      throw new Error('Reel voltou a usar cartão 4:5 sobre fundo desfocado.');
    }
    if (REEL_BEETHOVEN_SOUNDTRACKS.length !== 9 || REEL_BEETHOVEN_SOUNDTRACKS.some((track) => !track.classical || !track.work)) {
      throw new Error('Rotação dos Reels precisa conter exclusivamente as nove trilhas de Beethoven.');
    }
    console.log(JSON.stringify({
      ok: true,
      account: account.account,
      checkedPacks: packs.length,
      checkedAutoPacks: autoPacks.length,
      checkedAutomaticSelectionPacks: automaticSelectionPacks.length,
      duplicateHistoryGuard: 'ok',
      storyEditorialBalanceGuard: 'five-news-then-one-authored-book',
      checkedBookStoryPacks: configuredBookStoryPacks.length,
      sourceBalanceGuard: 'ok',
      avatarRotationGuard: 'ok',
      checkedAvatarRotation: avatarProbeCovers.length,
      radarSemanticGuard: 'ok',
      radarSourceIntegrityGuard: 'ok'
      ,genericResearchCoverGuard: 'ok'
      ,factualArticleContextGuard: 'ok'
      ,articleContinuationGuard: 'ok'
      ,finalSlideVariationGuard: 'ok'
      ,feedArchitectureGuard: '1080x1350-4:5'
      ,reelSwipeCueGuard: 'ok'
      ,reelFullFrameGuard: '1080x1920-native-no-blurred-bars'
      ,reelSoundtrackGuard: 'beethoven-only-9'
      ,organicPotentialGuard: 'fresh-useful-specific-no-clickbait'
      ,learningContextGuard: 'format-daypart-objective-with-audit-reasons'
      ,editorialFatigueGuard: 'recent-source-topic-hook-decay'
      ,controlledExplorationGuard: '70-20-10-after-quality-and-duplicate-gates'
      ,storySafeZoneGuard: '250-1170-500'
      ,storyCampaignImageGuard: 'explicit-image-prominent'
      ,radarSourceImageGuard: 'og-image-https-with-safe-fallback'
      ,checkedRadarSources: EDITORIAL_SOURCES.length
    }, null, 2));
    return;
  }

  let style = styleWithBrandPalette(pickVisualStyle(styles, account, today, generationSlotIndex), account, { dateString: today, slotIndex: generationSlotIndex });
  let pack = pickDaily(automaticSelectionPacks, today, generationSlotIndex);
  let packIndex = useResearchThisSlot
    ? `news-${pickDailyIndex(automaticSelectionPacks, today, generationSlotIndex)}`
    : profilePacks.length
      ? `profile-${pickDailyIndex(automaticSelectionPacks, today, generationSlotIndex)}`
      : pickDailyIndex(automaticSelectionPacks, today, generationSlotIndex);
  let skippedDuplicates = 0;
  let selectionMode = 'manual';
  let experimentAxis = 'manual';
  let scheduledPost = null;
  let publishMode = process.env.INSTAGRAM_TEMPLATE_PUBLISH_MODE === 'story-only' || args.storyOnly
    ? 'story-only'
    : process.env.INSTAGRAM_TEMPLATE_PUBLISH_MODE === 'reel-only'
      ? 'reel-only'
      : process.env.INSTAGRAM_TEMPLATE_PUBLISH_MODE === 'reel-and-story'
        ? 'reel-and-story'
    : process.env.INSTAGRAM_TEMPLATE_PUBLISH_MODE === 'feed-only'
      ? 'feed-only'
      : 'feed-and-story';
  const automaticReelSlots = new Set((account.reelScheduleSlots || []).map(Number).filter(Number.isInteger));
  if (process.env.INSTAGRAM_TEMPLATE_AUTOMATIC_RUN === 'true' && automaticReelSlots.has(slotIndex)) {
    publishMode = 'reel-and-story';
    console.log(`Horario automatico ${slotIndex} configurado para Reel + Story.`);
  }
  let dashboardPack = null;
  if (process.env.INSTAGRAM_TEMPLATE_PACK_JSON?.trim()) {
    dashboardPack = JSON.parse(process.env.INSTAGRAM_TEMPLATE_PACK_JSON);
    validatePack(dashboardPack);
    if (dashboardPack.slides?.length) dashboardPack.slides.at(-1).preserveEngagementCopy = true;
    pack = dashboardPack;
    packIndex = `dashboard-${slotIndex}`;
  }

  if (!args.renderOnly) {
    scheduledPost = dueScheduledPost(args.configDir, account.account).post;
    if (!scheduledPost) scheduledPost = dueWeeklyProgramPost(args.configDir, account.account, account).post;
    if (scheduledPost) {
      process.env.INSTAGRAM_TEMPLATE_ACTIVE_SCHEDULED_POST_ID = scheduledPost.id;
      if (scheduledPost.pack) {
        validatePack(scheduledPost.pack);
        pack = scheduledPost.pack;
      } else if (!Number.isInteger(scheduledPost.packIndex) || scheduledPost.packIndex < 0 || scheduledPost.packIndex >= packs.length) {
        throw new Error(`Post agendado ${scheduledPost.id} aponta para pack invalido: ${scheduledPost.packIndex}.`);
      } else {
        pack = packs[scheduledPost.packIndex];
      }
      packIndex = scheduledPost.source === 'weekly-program'
        ? `weekly-${scheduledPost.packIndex}`
        : `scheduled-${scheduledPost.packIndex}`;
      publishMode = ['story-only', 'feed-only', 'reel-only', 'reel-and-story'].includes(scheduledPost.mode) ? scheduledPost.mode : 'feed-and-story';
      console.log(`Post agendado selecionado: ${scheduledPost.id} pack ${scheduledPost.packIndex} (${scheduledPost.scheduledFor}).`);
    } else if (args.scheduledOnly) {
      console.log(JSON.stringify({
        ok: true,
        skipped: true,
        scheduledOnly: true,
        account: account.account,
        message: 'Nenhum post agendado pendente para publicar agora.'
      }, null, 2));
      return;
    }
  }

  const selectionSlotCron = (account.scheduleUtc || [])[generationSlotIndex] || '';
  const selectionSlotTime = scheduledPost?.scheduledFor || (selectionSlotCron ? cronToBrtTime(selectionSlotCron) : '');
  const selectionDiscovery = organicDiscoveryStrategy(today, generationSlotIndex);
  const selectionLearningContext = {
    format: publicationFormat(publishMode),
    daypart: learningDaypart(selectionSlotTime),
    objective: learningObjective(selectionDiscovery.primarySignal),
    primarySignal: selectionDiscovery.primarySignal
  };

  const token = env[account.accessTokenEnv];
  const userId = env[account.userIdEnv];
  const imgbbKey = env[account.imgbbKeyEnv];
  if (!args.renderOnly && !args.dryRun) {
    if (!token) throw new Error(`${account.accessTokenEnv} ausente.`);
    if (!userId) throw new Error(`${account.userIdEnv} ausente.`);
    const githubHostingAvailable = process.env.GITHUB_ACTIONS === 'true'
      && Boolean(process.env.GITHUB_TOKEN)
      && Boolean(process.env.GITHUB_REPOSITORY);
    if (!imgbbKey && !githubHostingAvailable) {
      throw new Error(`${account.imgbbKeyEnv} ausente e hospedagem reserva do GitHub indisponivel.`);
    }

    const igAccount = await graphGet(`/${userId}`, { fields: 'id,username', access_token: token });
    if (igAccount.username !== account.expectedUsername) {
      throw new Error(`Conta errada: esperado ${account.expectedUsername}, retornou ${igAccount.username}.`);
    }

    if (!scheduledPost && !dashboardPack && !args.storyOnly) {
      const recentMedia = await fetchRecentMedia(userId, token);
      let fresh = pickFreshPack(automaticSelectionPacks, today, generationSlotIndex, recentMedia, publicationHistory, randomInt, selectionLearningContext);
      if (!fresh.pack && radar.enabled) {
        const currentWindow = Number(editorialResearch.maxAgeDays) || 7;
        for (const maxAgeDays of [15, 30].filter((days) => days > currentWindow)) {
          const expandedResearch = await researchFreshEditorialPacks({
            ...radarOptions,
            maxAgeDays,
            limit: maxAgeDays === 30 ? 160 : 100
          });
          const expandedFresh = pickFreshPack(expandedResearch.packs, today, generationSlotIndex, recentMedia, publicationHistory, randomInt, selectionLearningContext);
          if (expandedFresh.pack) {
            editorialResearch = { ...expandedResearch, maxAgeDays };
            automaticSelectionPacks = expandedResearch.packs;
            useResearchThisSlot = true;
            fresh = expandedFresh;
            console.log(`Radar editorial: pautas da janela anterior estavam repetidas; pauta oficial nao repetida encontrada em ate ${maxAgeDays} dias.`);
            break;
          }
          console.log(`Radar editorial: nenhuma pauta oficial nao repetida encontrada em ate ${maxAgeDays} dias.`);
        }
      }
      if (!fresh.pack) {
        if (radar.enabled) {
          const reserveFresh = pickFreshPack(baseSelectionPacks, today, generationSlotIndex, recentMedia, publicationHistory, randomInt, selectionLearningContext);
          if (reserveFresh.pack) {
            fresh = reserveFresh;
            automaticSelectionPacks = baseSelectionPacks;
            useResearchThisSlot = false;
            usedEditorialReserveThisSlot = true;
            console.log(`Radar editorial: fontes oficiais esgotadas; reserva editorial propria e inedita selecionada sem inventar fonte jornalistica.`);
          } else {
            const fallbackPacks = Array.from({ length: creativeBatchSize }, (_, offset) => buildLastResortPack(today, generationSlotIndex + offset));
            const fallbackFresh = pickFreshPack(fallbackPacks, today, generationSlotIndex, recentMedia, publicationHistory, randomInt, selectionLearningContext);
            if (!fallbackFresh.pack) {
              throw new Error('Reserva editorial bloqueada: nenhuma pauta realmente inedita esta disponivel. Nenhum post repetido foi publicado.');
            }
            validatePack(fallbackFresh.pack);
            pack = fallbackFresh.pack;
            selectionMode = fallbackFresh.selectionMode;
            packIndex = `editorial-reserve-${fallbackFresh.packIndex}`;
            skippedDuplicates = fresh.skippedDuplicates + reserveFresh.skippedDuplicates + fallbackFresh.skippedDuplicates;
            useResearchThisSlot = false;
            usedEditorialReserveThisSlot = true;
            console.log('Radar editorial: fontes oficiais e packs editoriais recentes esgotados; reserva operacional com titulo e tema ineditos selecionada sem inventar fonte jornalistica.');
          }
        }
        if (!radar.enabled) {
          const autoFresh = pickFreshPack(autoPacks, today, generationSlotIndex, recentMedia, publicationHistory, randomInt, selectionLearningContext);
          if (!autoFresh.pack) {
            const fallbackPacks = Array.from({ length: creativeBatchSize }, (_, offset) => buildLastResortPack(today, generationSlotIndex + offset));
            const fallbackFresh = pickFreshPack(fallbackPacks, today, generationSlotIndex, recentMedia, publicationHistory, randomInt, selectionLearningContext);
            if (!fallbackFresh.pack) throw new Error('Conteudo automatico bloqueado: nenhuma pauta realmente inedita esta disponivel. Nenhum post repetido foi publicado.');
            validatePack(fallbackFresh.pack);
            pack = fallbackFresh.pack;
            selectionMode = fallbackFresh.selectionMode;
            packIndex = `auto-unique-${fallbackFresh.packIndex}`;
            skippedDuplicates = fresh.skippedDuplicates + autoFresh.skippedDuplicates + fallbackFresh.skippedDuplicates;
            console.log(`Conteudo unico de emergencia selecionado porque ${automaticSelectionPacks.length} captions preferenciais e ${autoPacks.length} captions automaticas ja aparecem nas midias recentes.`);
          } else {
            pack = autoFresh.pack;
            selectionMode = autoFresh.selectionMode;
            packIndex = `auto-${autoFresh.packIndex}`;
            skippedDuplicates = fresh.skippedDuplicates + autoFresh.skippedDuplicates;
            console.log(`Conteudo automatico selecionado porque ${automaticSelectionPacks.length} captions preferenciais ja aparecem nas midias recentes.`);
          }
        }
      }
      if (fresh.pack) {
        pack = fresh.pack;
        selectionMode = fresh.selectionMode;
        packIndex = useResearchThisSlot ? `news-${fresh.packIndex}` : profilePacks.length ? `profile-${fresh.packIndex}` : fresh.packIndex;
        skippedDuplicates = fresh.skippedDuplicates;
      }
    }
  }

  // O Radar continua obrigado a preservar a fonte oficial. Um pack editorial
  // enviado explicitamente pelo painel e conteudo proprio da marca, nao uma
  // pauta pesquisada, portanto nao deve ser bloqueado por essa exigencia.
  if (!args.renderOnly && !args.dryRun && radar.enabled && !dashboardPack && !scheduledPost && !usedEditorialReserveThisSlot && !pack?.research?.sourceUrl) {
    throw new Error('Radar ativo: a pauta selecionada nao possui uma fonte oficial registrada. Nenhum post foi publicado.');
  }

  const runId = `${timestampSaoPaulo()}-slot-${slotIndex}${args.renderOnly ? '-render-only' : ''}`;
  const runDir = join(RUNS_DIR, account.account, runId);
  mkdirSync(runDir, { recursive: true });
  experimentAxis = selectionMode === 'experiment'
    ? 'topic-angle'
    : selectionMode === 'explore' ? 'candidate-novelty' : selectionMode === 'exploit' ? 'performance' : 'manual';
  const organicPotential = organicPotentialScore(pack, today, publicationHistory, selectionLearningContext);
  const methodAllowed = !dashboardPack && !scheduledPost;
  const enhancement = preparePackForPublication(pack, today, generationSlotIndex, account, publishMode, { allowIhc: methodAllowed });
  pack = enhancement.pack;
  pack.caption = fitInstagramCaption(pack.caption, pack);
  const historyPack = JSON.parse(JSON.stringify(pack));
  // A mesma janela de publicação pode gerar várias pautas. A fonte e o tema
  // precisam participar da identidade visual para que capas de notícias
  // diferentes não pareçam cópias quando usam o mesmo slot.
  const visualSeedInput = [
    pack.research?.id,
    pack.research?.sourceUrl,
    pack.research?.source,
    pack.caption,
    packIndex
  ].filter(Boolean).join('|') || String(packIndex);
  const visualVariationSeed = stableAvatarOffset(visualSeedInput);
  const avatarRotationStart = pickAvatarRotationStart(account, publicationHistory, visualSeedInput);
  const packVisualAccount = pack.visualDirection
    ? { ...account, contentProfile: { ...account.contentProfile, visualDirection: pack.visualDirection } }
    : account;
  style = styleWithBrandPalette(
    pickVisualStyle(styles, packVisualAccount, today, generationSlotIndex),
    account,
    { dateString: today, slotIndex: generationSlotIndex, variationSeed: visualVariationSeed }
  );
  const packVisualCue = visualCueForAccount(account, [
    pack.caption,
    ...(pack.slides || []).flatMap((slide) => [slide.eyebrow, slide.title, slide.body])
  ].filter(Boolean).join(' '));
  pack.slides = pack.slides.map((slide) => ({
    ...slide,
    visualCue: slide.visualCue || packVisualCue,
    researchSource: slide.researchSource || pack.research?.source || '',
    researchTitle: slide.researchTitle || pack.research?.sourceTitle || '',
    researchDisplayTitle: slide.researchDisplayTitle || slide.title || pack.research?.sourceTitle || '',
    researchUrl: slide.researchUrl || pack.research?.sourceUrl || ''
  }));
  if (pack.research && pack.slides.some((slide) => !slide.researchSource || !slide.researchTitle || !/^https:\/\//i.test(slide.researchUrl))) {
    throw new Error('Radar bloqueado: o anexo visual precisa conter fonte, título real e link da matéria.');
  }
  validatePack(pack);
  const learningDecision = performanceLearningSnapshot().readiness;
  const learningContext = {
    ...selectionLearningContext,
    selectionMode,
    experimentAxis,
    contextKey: [selectionLearningContext.format, selectionLearningContext.daypart, selectionLearningContext.objective].join('|'),
    decisionReasons: organicPotential.signals,
    fatiguePenalty: organicPotential.fatiguePenalty,
    modelVersion: learningDecision.modelVersion
  };
  const researchSourceImagePath = await downloadResearchSourceImage(pack, runDir);
  const storyOnly = publishMode === 'story-only';
  const feedOnly = publishMode === 'feed-only';
  const reelOnly = publishMode === 'reel-only';
  const reelAndStory = publishMode === 'reel-and-story';
  const reelMode = reelOnly || reelAndStory;
  const rotatedBookStoryPack = (!scheduledPost && !dashboardPack && !args.storyOnly && !feedOnly && !reelOnly)
    ? pickBookStoryAfterNews(publicationHistory, bookStoryPacks(args.configDir, account.account), 5)
    : null;
  const storyPack = rotatedBookStoryPack
    ? preparePackForPublication(JSON.parse(JSON.stringify(rotatedBookStoryPack)), today, generationSlotIndex, account, 'story-only', { allowIhc: false }).pack
    : pack;
  const storyVisualAccount = storyPack.visualDirection
    ? { ...account, contentProfile: { ...account.contentProfile, visualDirection: storyPack.visualDirection } }
    : account;
  const storyStyle = rotatedBookStoryPack
    ? styleWithBrandPalette(
      pickVisualStyle(styles, storyVisualAccount, today, generationSlotIndex + 1),
      account,
      { dateString: today, slotIndex: generationSlotIndex + 1, variationSeed: stableAvatarOffset(storyPack.slides?.[0]?.title || 'book-story') }
    )
    : style;
  if (rotatedBookStoryPack) console.log(`Rodízio editorial: após cinco Stories de notícias, Story do livro selecionado: ${storyPack.slides?.[0]?.title || 'trecho autoral'}.`);
  if (!args.renderOnly && !args.dryRun && (scheduledPost || dashboardPack || args.storyOnly)) {
    const duplicate = findDuplicatePack(publicationHistory, historyPack);
    if (duplicate) {
      throw new Error(`Conteudo repetido bloqueado: este tema ja foi publicado em ${duplicate.publishedAt || 'uma publicacao anterior'}. Escolha outro conteudo.`);
    }
  }
  writeFileSync(join(runDir, 'engagement-intelligence.json'), JSON.stringify({ ...enhancement.intelligence, organicPotential, selectionMode, learningDecision, learningContext }, null, 2), 'utf8');
  writeFileSync(join(runDir, 'editorial-research.json'), JSON.stringify(editorialResearch, null, 2), 'utf8');
  writeFileSync(join(runDir, 'daily-pack.json'), JSON.stringify({ date: today, slotIndex, packIndex, skippedDuplicates, creativeGeneration, creativeBatchRemaining, account: account.account, visualStyle: style.name, visualVariationSeed, visualSeedInput, avatarRotationStart, coverAvatar: Number.isInteger(avatarRotationStart) ? accountAvatarRotationUrls(account)[avatarRotationStart] || null : null, intelligence: { ...enhancement.intelligence, organicPotential, learningDecision, learningContext }, ...pack }, null, 2), 'utf8');
  writeFileSync(join(runDir, 'caption.txt'), pack.caption, 'utf8');
  const slotCron = (account.scheduleUtc || [])[slotIndex] || '';
  const renderContext = {
    dateString: today,
    slotIndex,
    creativeGeneration,
    slotTime: scheduledPost?.scheduledFor || (slotCron ? cronToBrtTime(slotCron) : ''),
    packIndex,
    variationSeed: visualSeedInput,
    avatarRotationStart,
    researchSourceImagePath,
    scheduledFor: scheduledPost?.scheduledFor || '',
    publishMode
  };
  const imagePaths = storyOnly ? [] : await renderSlides(runDir, pack.slides, account, style, renderContext);
  const customStoryImage = String(pack.storyImageUrl || pack.storyImagePath || '').trim();
  const storyImagePath = (feedOnly || reelOnly) ? null : (customStoryImage || await renderStory(runDir, storyPack, account, storyStyle, { ...renderContext, publishMode: rotatedBookStoryPack ? 'story-only' : publishMode }));
  const reelRender = reelMode ? renderReelVideo(runDir, imagePaths) : null;
  const reelVideoPath = reelRender?.reelPath || null;
  const reelAudioTrack = reelRender?.audioTrack || null;

  if (args.renderOnly) {
    console.log(JSON.stringify({ ok: true, renderOnly: true, account: account.account, runDir, visualStyle: style.name, slotIndex, packIndex, publishMode, avatarRotationStart, coverAvatar: Number.isInteger(avatarRotationStart) ? accountAvatarRotationUrls(account)[avatarRotationStart] || null : null, imagePaths, storyImagePath, reelVideoPath, reelAudioTrack }, null, 2));
    return;
  }

  if (args.dryRun) {
    const dryRunResult = {
      ok: true,
      dryRun: true,
      account: account.account,
      runDir,
      visualStyle: style.name,
      slotIndex,
      packIndex,
      creativeGeneration,
      creativeBatchRemaining,
      imagePaths,
      storyImagePath,
      reelVideoPath,
      reelAudioTrack
    };
    writeFileSync(join(runDir, 'result.json'), JSON.stringify(dryRunResult, null, 2), 'utf8');
    console.log(JSON.stringify(dryRunResult, null, 2));
    return;
  }

  let storyImageUrl = '';
  let story = null;
  let imageUrls = [];
  let childIds = [];
  let carousel = null;
  let reel = null;
  let reelVideoUrl = '';
  const remoteStoryImage = /^https?:\/\//i.test(String(storyImagePath || ''));
  const localStoryImagePath = storyImagePath && !remoteStoryImage
    ? (isAbsolute(String(storyImagePath))
      ? String(storyImagePath)
      : resolve(ROOT, String(storyImagePath).replace(/^\/+/, '')))
    : null;
  const feedImagesAreLocal = imagePaths.every((imagePath) => !/^https?:\/\//i.test(String(imagePath || '')));
  const githubHostedUrls = !reelMode && feedImagesAreLocal
    ? await hostRenderedImagesOnGitHub(localStoryImagePath ? [...imagePaths, localStoryImagePath] : imagePaths, account.account, runId)
    : null;
  const githubHostedReelStoryUrls = reelMode && localStoryImagePath
    ? await hostRenderedImagesOnGitHub([localStoryImagePath], account.account, runId)
    : null;
  const publishImagePaths = githubHostedUrls ? githubHostedUrls.slice(0, imagePaths.length) : imagePaths;
  const publishStoryImagePath = storyImagePath
    ? (remoteStoryImage
      ? storyImagePath
      : (githubHostedUrls ? githubHostedUrls.at(-1) : (githubHostedReelStoryUrls?.[0] || localStoryImagePath)))
    : null;
  if (reelMode) {
    reelVideoUrl = await hostRenderedVideoOnGitHub(reelVideoPath, account.account, runId);
    if (!reelVideoUrl) throw new Error('A publicacao de Reel exige hospedagem publica do video no GitHub Actions.');
    reel = await createReel(userId, token, reelVideoUrl, pack.caption);
  } else if (!storyOnly) {
    const children = [];
    for (const imagePath of publishImagePaths) {
      const result = await createCarouselChildFromImage(userId, token, imagePath, imgbbKey);
      children.push(result.child);
      imageUrls.push(result.imageUrl);
    }
    childIds = children.map((child) => child.id);
    await Promise.all(childIds.map((childId) => pollContainer(childId, token)));
    carousel = await graphPost(`/${userId}/media`, {
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption: pack.caption,
      access_token: token
    });
    await pollContainer(carousel.id, token);
  }
  if (!feedOnly && !reelOnly) ({ story, imageUrl: storyImageUrl } = await createStoryFromImage(userId, token, publishStoryImagePath, imgbbKey));

  const baseResult = {
    ok: true,
    dryRun: args.dryRun,
    storyOnly,
    reelMode,
    publishMode,
    scheduledPostId: scheduledPost?.id,
    account: account.account,
    runDir,
    slotIndex,
    packIndex,
    skippedDuplicates,
    selectionMode,
    learningDecision,
    learningContext,
    imagePaths,
    storyImagePath,
    imageUrls,
    storyImageUrl,
    storyContentKind: storyPack.authoredBook ? 'book' : (storyPack.research?.sourceUrl ? 'news' : 'editorial'),
    storyCoverTitle: String(storyPack?.slides?.[0]?.title || '').trim() || null,
    reelVideoPath,
    reelVideoUrl,
    reelAudioTrack,
    avatarRotationStart,
    coverAvatar: Number.isInteger(avatarRotationStart)
      ? accountAvatarRotationUrls(account)[avatarRotationStart] || null
      : null,
    childIds,
    carouselId: carousel?.id,
    reelContainerId: reel?.id || null,
    storyContainerId: story?.id || null
  };
  let media = null;
  let details = null;
  if (!storyOnly) {
    media = await graphPost(`/${userId}/media_publish`, { creation_id: reelMode ? reel.id : carousel.id, access_token: token });
    details = await graphGet(`/${media.id}`, { fields: 'id,permalink,timestamp', access_token: token });
  }
  let storyMedia = null;
  let storyDetails = null;
  if (!feedOnly && !reelOnly) {
    storyMedia = await graphPost(`/${userId}/media_publish`, { creation_id: story.id, access_token: token });
    storyDetails = await graphGet(`/${storyMedia.id}`, { fields: 'id,timestamp', access_token: token });
  }
  let firstComment = null;
  let firstCommentError = null;
  if (media?.id && String(pack.firstComment || '').trim()) {
    try {
      firstComment = await graphPost(`/${media.id}/comments`, {
        message: String(pack.firstComment).trim(),
        access_token: token
      });
    } catch (error) {
      firstCommentError = error instanceof Error ? error.message : String(error);
      console.error(`Primeiro comentário não publicado: ${firstCommentError}`);
    }
  }
  const result = {
    ...baseResult,
    mediaId: media?.id,
    ...(details || {}),
    storyMediaId: storyMedia?.id || null,
    story: storyDetails,
    firstCommentId: firstComment?.id || null,
    firstCommentError
  };
  recordPublicationHistory(args.configDir, account.account, historyPack, { ...result, storyHistoryPack: storyPack });
  if (scheduledPost) {
    const scheduledPatch = {
      status: 'published',
      publishedAt: new Date().toISOString(),
      mediaId: media?.id,
      permalink: details?.permalink,
      storyMediaId: storyMedia?.id || null
    };
    if (scheduledPost.source === 'weekly-program') {
      updateWeeklyProgramPost(args.configDir, account.account, scheduledPost.id, scheduledPatch);
    } else {
      updateScheduledPost(args.configDir, account.account, scheduledPost.id, scheduledPatch);
    }
    delete process.env.INSTAGRAM_TEMPLATE_ACTIVE_SCHEDULED_POST_ID;
  }
  writeFileSync(join(runDir, 'result.json'), JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  const args = parseArgs(process.argv);
  const scheduledPostId = process.env.INSTAGRAM_TEMPLATE_ACTIVE_SCHEDULED_POST_ID;
  if (scheduledPostId) {
    try {
      const failurePatch = {
        status: 'failed',
        failedAt: new Date().toISOString(),
        error: error.message
      };
      if (!updateScheduledPost(args.configDir, args.account, scheduledPostId, failurePatch)) {
        updateWeeklyProgramPost(args.configDir, args.account, scheduledPostId, failurePatch);
      }
    } catch {
      // Keep the original publication error as the main failure signal.
    }
  }
  mkdirSync(RUNS_DIR, { recursive: true });
  writeFileSync(join(RUNS_DIR, `failure-${timestampSaoPaulo()}.json`), JSON.stringify({
    ok: false,
    stage: error.stage || 'unknown',
    error: error.message,
    status: error.status,
    responseBody: error.responseBody,
    causeCode: error.causeCode,
    attempt: error.attempt,
    attempts: error.attempts,
    retryable: Boolean(error.retryable),
    checkedAt: new Date().toISOString()
  }, null, 2), 'utf8');
  console.error(error.message);
  process.exit(1);
});
