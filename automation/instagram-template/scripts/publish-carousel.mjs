#!/usr/bin/env node
import { chromium } from 'playwright';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBrandContext } from '../../../lib/brand-analysis.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TEMPLATE_DIR = resolve(ROOT, 'automation', 'instagram-template');
const DEFAULT_CONFIG_DIR = join(TEMPLATE_DIR, 'config');
const RUNS_DIR = join(TEMPLATE_DIR, 'runs');
const FEED_WIDTH = 1080;
const FEED_HEIGHT = 1350;
const IG_BASE = 'https://graph.facebook.com/v21.0';
const RETRY_ATTEMPTS = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_RETRY_ATTEMPTS || '3', 10);
const RETRY_BASE_DELAY_MS = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_RETRY_BASE_DELAY_MS || '2500', 10);
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
  const rawImagePath = String(program.imagePath || '').trim();
  const imageUrl = String(program.imageUrl || (/^https?:\/\//i.test(rawImagePath) ? rawImagePath : '')).trim();
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
    caption: `${title}\n\n${program.description || hostLine}\n\n${cta}`
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

const FINAL_SLIDE_CALL_CTA = {
  eyebrow: 'Convite',
  title: 'Call gratuita de 30 minutos.',
  body: 'Acesse o link da bio e escolha um horário para uma conversa prática sobre IA na sua operação.'
};

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
    title: (topic) => `O problema escondido em ${topic.area}.`,
    opener: (topic) => `Em ${topic.area}, o prejuízo quase nunca aparece como "falta de IA". Ele aparece quando ${topic.pain}.`,
    slide2Title: (topic) => `O sintoma: ${topic.pain}.`,
    slide3Title: 'Antes da ferramenta, vem o mapa.',
    slide4Title: 'Escolha uma rotina para testar.',
    slide5Title: (topic) => `Menos improviso em ${topic.area}.`,
    caption: (topic, angle, context, sequence, runLine) => `${topic.area} tem um gargalo que costuma passar batido.\n\nEle aparece quando ${topic.pain}. A equipe sente como correria, retrabalho ou resposta atrasada.\n\nAntes de pensar em ferramenta, escolha uma rotina pequena, escreva o passo a passo e defina o que precisa ser conferido.\n\n${angle.action}\n\nObserve este sinal: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: IA boa começa em rotina bem descrita.\n\n${topic.hashtag}`
  },
  {
    label: 'Checklist',
    title: (topic) => `${topic.area}: 3 pontos para arrumar antes da IA.`,
    opener: (topic) => `Se ${topic.pain}, a primeira automação não precisa ser grande. Ela precisa ser clara.`,
    slide2Title: '1. Onde a conversa começa.',
    slide3Title: '2. Quem confere a informação.',
    slide4Title: '3. Qual resposta vira padrão.',
    slide5Title: 'Comece pelo menor fluxo.',
    caption: (topic, angle, context, sequence, runLine) => `Checklist rápido para ${topic.area}.\n\n1. Onde a demanda entra.\n2. Quem confere a informação.\n3. Qual resposta pode virar padrão.\n\nSe hoje ${topic.pain}, esse mapa já mostra onde a IA pode ajudar sem bagunçar a operação.\n\n${angle.action}\n\nPonto para acompanhar: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: menos promessa, mais processo.\n\n${topic.hashtag}`
  },
  {
    label: 'Erro caro',
    title: (topic) => `O erro caro que ${topic.area} normaliza.`,
    opener: (topic) => `O custo não está só no tempo perdido. Está na decisão tomada com informação incompleta.`,
    slide2Title: (topic) => `Quando ${topic.pain}, alguém paga a conta.`,
    slide3Title: 'A IA precisa de critério.',
    slide4Title: 'Transforme repetição em alerta.',
    slide5Title: 'Automação boa evita surpresa.',
    caption: (topic, angle, context, sequence, runLine) => `Existe um erro caro em ${topic.area}: tratar rotina repetida como se fosse caso isolado.\n\nQuando ${topic.pain}, a empresa perde tempo, contexto e oportunidade.\n\nA saída começa com critério: o que entra, o que precisa ser conferido e qual resposta não pode depender da memória.\n\n${angle.action}\n\nMétrica simples: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: automação serve para reduzir surpresa.\n\n${topic.hashtag}`
  },
  {
    label: 'Roteiro prático',
    title: (topic) => `Um teste de 30 minutos para ${topic.area}.`,
    opener: (topic) => `Pegue uma demanda real da semana e acompanhe do começo ao fim. O ponto fraco aparece rápido.`,
    slide2Title: 'Anote a primeira pergunta.',
    slide3Title: 'Marque onde trava.',
    slide4Title: 'Padronize só uma resposta.',
    slide5Title: 'Depois pense em escala.',
    caption: (topic, angle, context, sequence, runLine) => `Teste simples para ${topic.area}.\n\nSepare 30 minutos e acompanhe uma demanda real: de onde veio, quem respondeu, onde travou e o que ficou sem registro.\n\nSe aparecer ${topic.pain}, você encontrou um bom primeiro fluxo para automatizar.\n\n${angle.action}\n\nValide com este sinal: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: comece pequeno para crescer certo.\n\n${topic.hashtag}`
  },
  {
    label: 'Antes e depois',
    title: (topic) => `${topic.area} antes e depois de organizar o fluxo.`,
    opener: (topic) => `Antes, cada pessoa resolve do seu jeito. Depois, a operação tem contexto, padrão e acompanhamento.`,
    slide2Title: 'Antes: resposta solta.',
    slide3Title: 'Durante: processo visível.',
    slide4Title: 'Depois: IA com contexto.',
    slide5Title: (topic) => `O ganho aparece em ${topic.gain}.`,
    caption: (topic, angle, context, sequence, runLine) => `Antes e depois em ${topic.area}.\n\nAntes: ${topic.pain}.\nDepois: entrada clara, informação registrada, resposta padronizada e acompanhamento simples.\n\nÉ aí que a IA deixa de ser novidade e vira apoio real na rotina.\n\n${angle.action}\n\nProcure este sinal: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: clareza antes de escala.\n\n${topic.hashtag}`
  },
  {
    label: 'Bastidor',
    title: (topic) => `O bastidor que melhora ${topic.area}.`,
    opener: (topic) => `Cliente vê velocidade. A equipe sente alívio. Mas o que sustenta isso é bastidor bem organizado.`,
    slide2Title: (topic) => `O bastidor quebra quando ${topic.pain}.`,
    slide3Title: 'Documente o caminho real.',
    slide4Title: 'Deixe a IA apoiar o repetitivo.',
    slide5Title: 'A experiência melhora fora da tela.',
    caption: (topic, angle, context, sequence, runLine) => `O que melhora ${topic.area} muitas vezes não aparece na vitrine.\n\nAparece no bastidor: registro, triagem, resposta, acompanhamento e conferência.\n\nQuando ${topic.pain}, a IA pode ajudar, mas só depois que esse caminho está visível.\n\n${angle.action}\n\nAcompanhe: ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: bastidor organizado vende melhor.\n\n${topic.hashtag}`
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

function autoPack(topic, angle, context, sequence, runStamp = null, dateString = todaySaoPaulo(), slotIndex = 0) {
  const runLine = runStamp ? `\n\nEdição operacional ${runStamp}.` : '';
  const editorial = creativeEditorialAngle(dateString, slotIndex, sequence);
  const editorialLabel = callMaybe(editorial.label, topic, angle, context);
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
        eyebrow: 'Diagnóstico',
        title: callMaybe(editorial.slide2Title, topic, angle, context),
        body: `Isso fica mais claro ${context.trigger}.`,
        visualCue: topic.visualCue || 'business'
      },
      {
        eyebrow: 'Organização',
        title: callMaybe(editorial.slide3Title, topic, angle, context),
        body: `Organize ${topic.process}. Depois disso, a tecnologia consegue trabalhar com contexto.`,
        visualCue: topic.visualCue || 'business'
      },
      {
        eyebrow: 'Aplicação',
        title: callMaybe(editorial.slide4Title, topic, angle, context),
        body: angle.insight,
        visualCue: topic.visualCue || 'business'
      },
      {
        eyebrow: 'Próximo passo',
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

function enhanceSlide(slide, index, dateString, slotIndex, goal = CONTENT_GOALS.authority, totalSlides = 0) {
  const next = { ...slide };
  if (next.imagePath || next.imageUrl) return next;

  next.visualVariant = engagementVariant(dateString, slotIndex, index);
  if (totalSlides > 1 && index === totalSlides - 1) {
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

function enhanceCaption(caption, dateString, slotIndex, goal = CONTENT_GOALS.authority) {
  const { body, hashtags } = splitCaptionParts(caption);
  const ctas = [...(goal.ctas || []), ...ENGAGEMENT_INTELLIGENCE.ctas];
  const angles = [...(goal.captionAngles || []), ...ENGAGEMENT_INTELLIGENCE.captionAngles];
  const cta = ctas[pickDailyIndex(ctas, dateString, slotIndex)];
  const angle = angles[pickDailyIndex(angles, dateString, slotIndex)];
  const slotNote = angle;
  const hasCta = /salve|envie|comente|compartilhe|mande/i.test(body);
  const bodyWithAngle = body.includes(slotNote) ? body : `${body}\n\n${slotNote}`;
  const enhancedBody = hasCta ? bodyWithAngle : `${bodyWithAngle}\n\n${cta}`;
  return [enhancedBody.trim(), hashtags].filter(Boolean).join('\n\n');
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
  const totalSlides = (enhanced.slides || []).length;
  enhanced.slides = (enhanced.slides || []).map((slide, index) => enhanceSlide(slide, index, dateString, slotIndex, goal, totalSlides));
  enhanced.caption = enhanceCaption(enhanced.caption || '', dateString, slotIndex, goal);
  if (account.contentProfile?.visualDirection === 'anatex-editorial') {
    Object.assign(enhanced, sanitizePackForAnatexStyle(enhanced));
  }
  enhanced.engagementIntelligence = {
    version: 1,
    appliedAt: new Date().toISOString(),
    strategy: `hook + CTA + visual variance + ${goal.label}`,
    goal: goal.label,
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

function profileTopicFromAccount(account = {}, dateString = todaySaoPaulo(), slotIndex = 0) {
  const profile = account.contentProfile || {};
  const brandSummary = account.brandSummary || {};
  const documentAnalysis = account.brandDocument?.analysis || {};
  if (!profile.niche && !profile.audience && !profile.offer && !brandSummary.description && !documentAnalysis.summary) return null;
  const industry = pickProfileRotationTopic(profile, dateString, slotIndex) || detectIndustrySpecialist(account);
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

function planForAutomaticSlots(account, localPacks, dateString) {
  return (account.scheduleUtc || []).map((cron, slotIndex) => {
    const profilePacks = buildProfileContentPacks(account, dateString, slotIndex);
    const automaticSelectionPacks = profilePacks.length ? mergePacks(profilePacks, localPacks) : localPacks;
    const packIndexNumber = pickDailyIndex(automaticSelectionPacks, dateString, slotIndex);
    const rawPack = automaticSelectionPacks[packIndexNumber] || {};
    const enhancement = enhancePackForEngagement(rawPack, dateString, slotIndex, account);
    const pack = enhancement.pack || rawPack;
    return {
      time: cronToBrtTime(cron),
      slotIndex,
      type: 'automatic',
      status: 'planned',
      title: pack.slides?.[0]?.title || 'Conteúdo automático pelo perfil da conta',
      caption: compactPlanText(pack.caption || ''),
      mode: 'feed + story',
      packIndex: profilePacks.length ? `profile-${packIndexNumber}` : packIndexNumber
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
  const searchable = stripHashtagLines(text);
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

function accountAvatarCssImage(account = {}) {
  const avatarUrl = String(account.avatarUrl || '').trim();
  if (avatarUrl) return cssUrl(avatarUrl);

  const avatarPath = String(account.avatarPath || '').trim();
  if (!avatarPath) return '';

  const source = resolve(ROOT, avatarPath.replace(/^\/+/, ''));
  if (!existsSync(source)) {
    console.warn(`Avatar configurado nao encontrado: ${account.avatarPath}`);
    return '';
  }
  return cssUrl(`file:///${source.replace(/\\/g, '/')}`);
}

function localAssetCssImage(path = '') {
  const source = resolve(ROOT, String(path || '').replace(/^\/+/, ''));
  if (!existsSync(source)) return '';
  return cssUrl(`file:///${source.replace(/\\/g, '/')}`);
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

function sectorPhotoCssImage(cue = 'business') {
  const photos = {
    legal: 'docs/uploads/sector-photos/legal.jpg',
    tourism: 'docs/uploads/sector-photos/tourism.jpg',
    'real-estate': 'docs/uploads/sector-photos/real-estate.jpg',
    restaurant: 'docs/uploads/sector-photos/restaurant.jpg',
    clinic: 'docs/uploads/sector-photos/clinic.jpg',
    beauty: 'docs/uploads/sector-photos/beauty.jpg',
    ecommerce: 'docs/uploads/sector-photos/ecommerce.jpg',
    finance: 'docs/uploads/sector-photos/finance.jpg',
    services: 'docs/uploads/sector-photos/ecommerce.jpg',
    business: 'docs/uploads/sector-photos/finance.jpg'
  };
  return localAssetCssImage(photos[cue] || photos.business);
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

function anatexSlideHtml(slide, index, total, account, style) {
  const slideStyle = styleForSlide(style, index);
  const title = anatexTitle(slide.title || '');
  const body = applyAnatexCopyRules(slide.body || '');
  const eyebrow = applyAnatexCopyRules(slide.eyebrow || 'Pra saber');
  const accent = slideStyle.accent || '#a7563d';
  const soft = slideStyle.accentSoft || 'rgba(167,86,61,0.16)';
  const headline = title.replace(/\s+IA\b/i, ' <strong>IA</strong>');
  const avatarImage = accountAvatarCssImage(account);
  const avatarClass = avatarImage ? ' has-avatar' : '';
  const mode = slideStyle.templateMode || 'paper';
  const visualCue = slide.visualCue || visualCueFromText(`${slide.title || ''} ${slide.body || ''} ${slide.eyebrow || ''}`);
  const sectorPhotoImage = sectorPhotoCssImage(visualCue);
  const sectorPhotoClass = sectorPhotoImage ? ' has-sector-photo' : '';
  const engagementRole = index === 1 ? 'hook' : index === total ? 'cta' : index === total - 1 ? 'proof' : 'value';
  const swipeCue = index === 1 ? '<div class="swipe-cue">arraste para ver</div>' : '';
  const saveCue = index === total ? '<div class="save-cue">link na bio</div>' : index === 3 ? '<div class="save-cue">salve este passo</div>' : '';
  const noteFontSize = body.length > 170 ? 24 : body.length > 125 ? 26 : body.length > 95 ? 28 : 30;
  const noteMinHeight = body.length > 170 ? 330 : body.length > 125 ? 295 : body.length > 95 ? 258 : 238;
  const progressItems = Array.from({ length: total }, (_, itemIndex) => (
    `<span class="${itemIndex + 1 <= index ? 'active' : ''}"></span>`
  )).join('');
  const placement = [
    mode === 'split' ? 'layout-left' : index % 3 === 2 ? 'layout-left' : index % 3 === 0 ? 'layout-corner' : 'layout-right',
    `mode-${mode}`,
    `role-${engagementRole}`,
    index % 2 === 0 ? 'slide-even' : 'slide-odd'
  ].join(' ');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: ${FEED_WIDTH}px; height: ${FEED_HEIGHT}px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${slideStyle.bgTop}; color: ${slideStyle.text}; }
    main {
      width: ${FEED_WIDTH}px;
      height: ${FEED_HEIGHT}px;
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
    .headline { position: relative; z-index: 2; margin-top: 98px; max-width: 600px; font-size: 68px; line-height: 0.98; letter-spacing: 0; font-weight: 900; color: ${slideStyle.text}; overflow-wrap: break-word; }
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
    .panel.has-avatar { background: ${avatarImage || 'rgba(255,255,255,0.48)'} center center / contain no-repeat; border: 7px solid rgba(255,250,246,0.9); box-shadow: 0 28px 70px rgba(94,50,34,0.24); }
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
    .layout-corner .headline::after {
      content: "Processo antes da ferramenta";
      display: inline-flex;
      margin-top: 38px;
      padding: 16px 24px;
      border-radius: 16px;
      background: rgba(255,250,246,0.68);
      border: 2px solid rgba(167,86,61,0.18);
      color: ${accent};
      font-size: 26px;
      line-height: 1;
      font-weight: 900;
      text-transform: uppercase;
    }
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
    .mode-split .headline { margin-top: 126px; font-size: 60px; }
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
    .mode-minimal .badge { background: rgba(255,250,246,0.82); color: ${accent}; border: 2px solid ${accent}; }
    .mode-minimal .badge span { border-color: ${accent}; }
    .mode-minimal .badge span::after { border-color: ${accent}; }
    .mode-minimal .headline { margin-top: 150px; max-width: 760px; font-size: 70px; }
    .mode-minimal .panel { top: 210px; right: 72px; width: 260px; height: 260px; border-radius: 50%; opacity: 0.94; }
    .mode-minimal .context-photo { left: 86px; top: 510px; width: 520px; height: 190px; border-radius: 24px; opacity: 0.80; }
    .mode-minimal .note { left: 86px; top: 780px; width: 840px; min-height: 210px; padding-left: 128px; background: rgba(255,255,255,0.58); }
    .mode-minimal .sector-cue { right: 98px; top: 520px; width: 250px; opacity: 0.22; }
    .layout-left.mode-minimal .headline { margin-left: 0; max-width: 760px; font-size: 70px; }
    .layout-left.mode-minimal .panel { left: auto; right: 72px; top: 210px; width: 260px; height: 260px; }
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
    .mode-magazine .badge { left: 124px; }
    .mode-magazine .headline { margin-top: 136px; margin-left: 70px; max-width: 610px; font-size: 62px; }
    .mode-magazine .context-photo { left: 124px; right: auto; top: 508px; width: 500px; height: 190px; border-radius: 24px; }
    .mode-magazine .panel { top: 420px; right: 70px; width: 320px; height: 430px; transform: rotate(-2deg); }
    .mode-magazine .note { left: 124px; top: 745px; width: 560px; }
    .mode-magazine .sector-cue { right: 100px; top: 142px; width: 220px; opacity: 0.24; }
    .layout-left.mode-magazine .panel { left: 62px; right: auto; top: 420px; width: 320px; height: 430px; }
    .layout-left.mode-magazine .note { left: 430px; top: 745px; width: 560px; }
    .layout-left.mode-magazine .sector-cue { left: 122px; right: auto; top: 190px; width: 190px; opacity: 0.22; }
    .role-hook .headline { font-size: 74px; }
    .role-hook .note { min-height: ${Math.max(234, noteMinHeight)}px; font-size: ${Math.min(noteFontSize, 28)}px; }
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
    .role-cta .note { background: ${accent}; color: #fff6ef; border: 0; font-size: 34px; }
    .role-cta .note::before { background: #fff6ef; color: ${accent}; }
    .bubble { display: none; position: absolute; right: 116px; bottom: 270px; width: 132px; height: 96px; border-radius: 34px; background: #f1d8c7; z-index: 3; }
    .bubble::before { content: "..."; position: absolute; inset: 0; display: grid; place-items: center; color: ${accent}; font-size: 58px; line-height: 0.5; font-weight: 900; letter-spacing: 5px; }
    .spark { position: absolute; color: ${accent}; opacity: 0.7; z-index: 2; font-size: 42px; font-weight: 900; }
    .s1 { right: 400px; top: 170px; }
    .s2 { right: 126px; bottom: 108px; }
    footer { position: absolute; right: 58px; bottom: 58px; z-index: 3; color: ${accent}; font-size: 27px; font-weight: 900; }
  </style>
</head>
<body>
  <main class="${placement}${sectorPhotoClass}">
    <div class="brand">${account.brandName}</div>
    <div class="arrows">&gt;&gt;</div>
    <div class="badge"><span></span>${eyebrow}</div>
    ${swipeCue}
    ${saveCue}
    ${sectorPhotoImage ? '<div class="context-photo"></div>' : ''}
    ${sectorVisualHtml(visualCue)}
    <div class="panel${avatarClass}"></div>
    <div class="spark s1">*</div>
    <div class="spark s2">*</div>
    <section>
      <h1 class="headline">${headline}</h1>
    </section>
    <div class="note">${body}</div>
    <div class="bubble"></div>
    <div class="progress">${progressItems}</div>
    <footer>${index}/${total}</footer>
  </main>
</body>
</html>`;
}

function styleWithBrandPalette(style, account = {}, { dateString = todaySaoPaulo(), slotIndex = 0 } = {}) {
  const palette = account.brandPalette || {};
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
      templateMode: 'split',
      accent: '#b45f35',
      accentSoft: 'rgba(180,95,53,0.13)',
      grid: 'rgba(35,54,72,0.11)',
      bgTop: '#f8f1e8',
      bgBottom: '#e6ddd2',
      text: '#192736',
      muted: '#46515c'
    }),
    paletteVariant(style, `${style.name}-sage`, {
      templateMode: 'poster',
      accent: '#2f766d',
      accentSoft: 'rgba(47,118,109,0.12)',
      grid: 'rgba(47,118,109,0.10)',
      bgTop: '#f5f6f0',
      bgBottom: '#dfe8dc',
      text: '#14262f',
      muted: '#394a46'
    }),
    paletteVariant(style, `${style.name}-sky`, {
      templateMode: 'minimal',
      accent: '#315f7d',
      accentSoft: 'rgba(49,95,125,0.12)',
      grid: 'rgba(49,95,125,0.10)',
      bgTop: '#f7fbfb',
      bgBottom: '#ddebf0',
      text: '#102333',
      muted: '#354a58'
    }),
    paletteVariant(style, `${style.name}-magazine`, {
      templateMode: 'magazine',
      accent: '#8f5c42',
      accentSoft: 'rgba(143,92,66,0.13)',
      grid: 'rgba(143,92,66,0.10)',
      bgTop: '#fbf8f2',
      bgBottom: '#e5e9e2',
      text: '#17211c',
      muted: '#4c5650'
    })
  ];

  const variants = style.layout === 'anatex-editorial' ? anatexVariants : defaultVariants;
  const selectedIndex = style.layout === 'anatex-editorial'
    ? ((daysSinceEpoch(dateString) * 3) + (slotIndex * 2)) % variants.length
    : pickDailyIndex(variants, dateString, slotIndex);
  const slidePalettes = rotateItems(variants, selectedIndex);
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
  if (!Array.isArray(pack.slides) || pack.slides.length < 2) throw new Error('Cada pack precisa de pelo menos 2 slides.');
  for (const slide of pack.slides) {
    const hasImage = Boolean(slide.imagePath || slide.imageUrl);
    const text = `${slide.eyebrow}\n${slide.title}\n${slide.body}`;
    assertNoMojibake(text);
    assertPortugueseAccents(text);
    if (!hasImage && (!slide.eyebrow || !slide.title || !slide.body)) {
      throw new Error('Slides sem imagem precisam de banner, titulo e descricao.');
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
  error.stage = label;
  error.status = status;
  error.responseBody = bodyPreview;
  error.retryable = RETRYABLE_STATUS.has(status) || Boolean(graphMediaTimeout) || Boolean(graphMediaDownloadRejected);
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

function slideHtml(slide, index, total, account, style) {
  if (style.layout === 'anatex-editorial' || account.contentProfile?.visualDirection === 'anatex-editorial') {
    return anatexSlideHtml(slide, index, total, account, style);
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
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: ${FEED_WIDTH}px; height: ${FEED_HEIGHT}px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${slideStyle.bgTop}; color: ${slideStyle.text}; }
    main {
      width: ${FEED_WIDTH}px;
      height: ${FEED_HEIGHT}px;
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
  <main>
    ${rail}
    ${signal}
    <section class="top">
      <div class="brand">${account.brandName}</div>
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

async function renderSlides(runDir, slides, account, style) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: FEED_WIDTH, height: FEED_HEIGHT }, deviceScaleFactor: 1 });
  const imagePaths = [];
  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index];
    const imagePath = join(runDir, `slide-${String(index + 1).padStart(2, '0')}.jpg`);
    if (slide.imageUrl) {
      imagePaths.push(String(slide.imageUrl).trim());
      continue;
    }
    if (slide.imagePath) {
      const source = resolve(ROOT, String(slide.imagePath).replace(/^\/+/, ''));
      if (!existsSync(source)) throw new Error(`Imagem do slide ${index + 1} nao encontrada: ${slide.imagePath}`);
      const customImagePath = join(runDir, `slide-${String(index + 1).padStart(2, '0')}${extname(source).toLowerCase() || '.jpg'}`);
      copyFileSync(source, customImagePath);
      imagePaths.push(customImagePath);
      continue;
    }
    const html = slideHtml(slide, index + 1, slides.length, account, style);
    assertNoMojibake(html);
    assertPortugueseAccents(`${slide.eyebrow}\n${slide.title}\n${slide.body}`);
    const htmlPath = join(runDir, `slide-${String(index + 1).padStart(2, '0')}.html`);
    writeFileSync(htmlPath, html, 'utf8');
    await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);
    await page.screenshot({ path: imagePath, type: 'jpeg', quality: 94, fullPage: false });
    imagePaths.push(imagePath);
  }
  await browser.close();
  return imagePaths;
}

function anatexStoryHtml(slide, account, style) {
  const slideStyle = styleForSlide(style, 1);
  const title = anatexTitle(slide.title || '');
  const body = applyAnatexCopyRules(slide.body || '');
  const eyebrow = applyAnatexCopyRules(slide.eyebrow || 'Pra saber');
  const accent = slideStyle.accent || '#a7563d';
  const soft = slideStyle.accentSoft || 'rgba(167,86,61,0.16)';
  const avatarImage = accountAvatarCssImage(account);
  const avatarBlock = avatarImage
    ? `<div class="avatar"></div>`
    : `<div class="panel"><span>IA</span></div>`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 1080px; height: 1920px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${slideStyle.bgTop}; color: ${slideStyle.text}; }
    main {
      width: 1080px;
      height: 1920px;
      padding: 84px 72px 92px;
      position: relative;
      background:
        radial-gradient(circle at 84% 8%, ${soft} 0 210px, transparent 211px),
        radial-gradient(circle at 14% 92%, rgba(167,86,61,0.10) 0 260px, transparent 261px),
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
    }
    main::before { content: ""; position: absolute; left: 72px; right: 72px; top: 92px; height: 2px; background: rgba(167,86,61,0.42); }
    .brand { position: relative; z-index: 2; margin-left: 52px; color: ${accent}; font-size: 42px; font-weight: 900; }
    .badge { position: relative; z-index: 2; margin-top: 96px; display: inline-flex; padding: 18px 32px; border-radius: 18px; background: ${accent}; color: #fff6ef; font-size: 34px; line-height: 1; font-weight: 900; text-transform: uppercase; }
    h1 { position: relative; z-index: 2; margin-top: 54px; max-width: 850px; font-size: 92px; line-height: 0.98; letter-spacing: 0; font-weight: 900; color: #111; }
    h1 strong { color: ${accent}; font: inherit; }
    p { position: relative; z-index: 2; margin-top: 34px; max-width: 820px; font-size: 46px; line-height: 1.16; font-weight: 800; color: #3f332d; }
    .avatar, .panel {
      position: absolute;
      right: 82px;
      bottom: 250px;
      width: 390px;
      height: 520px;
      border-radius: 36px;
      transform: rotate(3deg);
      border: 8px solid rgba(255,250,246,0.92);
      box-shadow: 0 30px 80px rgba(94,50,34,0.22);
      overflow: hidden;
      z-index: 1;
    }
    .avatar { background: ${avatarImage || 'rgba(255,255,255,0.50)'} center center / cover no-repeat; }
    .avatar::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,246,239,0.03), rgba(17,17,17,0.18)); }
    .panel { background: rgba(255,255,255,0.50); display: grid; place-items: center; }
    .panel span { color: rgba(167,86,61,0.18); font-size: 124px; font-weight: 900; }
    .note { position: absolute; left: 72px; bottom: 120px; z-index: 2; width: 640px; padding: 34px 42px; border-radius: 28px; background: rgba(255,250,246,0.78); border: 2px solid rgba(167,86,61,0.18); color: #211915; font-size: 34px; line-height: 1.18; font-weight: 900; }
    footer { position: absolute; left: 72px; bottom: 54px; color: ${accent}; font-size: 30px; font-weight: 900; z-index: 2; }
  </style>
</head>
<body>
  <main>
    <div class="brand">${account.brandName}</div>
    <div class="badge">${eyebrow}</div>
    <h1>${title.replace(/\s+IA\b/i, ' <strong>IA</strong>')}</h1>
    <p>${body}</p>
    ${avatarBlock}
    <div class="note">${account.footerText}</div>
    <footer>${account.brandName}</footer>
  </main>
</body>
</html>`;
}

function storyHtml(slide, account, style) {
  if (style.layout === 'anatex-editorial' || account.contentProfile?.visualDirection === 'anatex-editorial') {
    return anatexStoryHtml(slide, account, style);
  }
  const slideStyle = styleForSlide(style, 1);
  const variant = slide.visualVariant || 'focus';
  const titleSize = variant === 'quote' ? 82 : 90;
  const align = variant === 'quote' ? 'center' : 'left';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 1080px; height: 1920px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${slideStyle.bgTop}; color: ${slideStyle.text}; }
    main {
      width: 1080px;
      height: 1920px;
      padding: 116px 76px 104px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        linear-gradient(135deg, ${slideStyle.accentSoft}, ${rgba(slideStyle.accent, 0)} 40%),
        linear-gradient(180deg, ${slideStyle.bgTop} 0%, ${slideStyle.bgBottom} 100%);
      position: relative;
    }
    main::before { content: ""; position: absolute; inset: 48px; border: 2px solid rgba(244,247,245,0.1); }
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
      <div class="brand">${account.brandName}</div>
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

async function renderStory(runDir, pack, account, style) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const html = storyHtml(pack.slides[0], account, style);
  assertNoMojibake(html);
  assertPortugueseAccents(`${pack.slides[0].eyebrow}\n${pack.slides[0].title}\n${pack.slides[0].body}`);
  const htmlPath = join(runDir, 'story.html');
  const imagePath = join(runDir, 'story.jpg');
  writeFileSync(htmlPath, html, 'utf8');
  await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);
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
  return media.find((item) => item.caption && normalizeCaption(item.caption) === expectedCaption);
}

function pickFreshPack(packs, dateString, slotIndex, recentMedia = []) {
  const startIndex = pickDailyIndex(packs, dateString, slotIndex);
  for (let offset = 0; offset < packs.length; offset += 1) {
    const packIndex = (startIndex + offset) % packs.length;
    const pack = packs[packIndex];
    const duplicate = findDuplicateCaption(recentMedia, pack.caption);
    if (!duplicate) return { pack, packIndex, skippedDuplicates: offset };
  }
  return {
    pack: null,
    packIndex: null,
    skippedDuplicates: packs.length,
    duplicate: findDuplicateCaption(recentMedia, packs[startIndex].caption)
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

async function uploadReadyImageToImgBB(imagePath, apiKey) {
  const imageUrl = await uploadToImgBB(imagePath, apiKey);
  await assertRemoteImageReady(imageUrl);
  return imageUrl;
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
  const supabasePacks = await loadSupabasePacks(env, args.account);
  const packs = mergePacks(supabasePacks, localPacks);
  validatePacks(packs);

  const today = args.planDate || todaySaoPaulo();
  if (args.planDay) {
    console.log(JSON.stringify({
      ok: true,
      account: account.account,
      date: today,
      dailyPlan: planForAutomaticSlots(account, packs, today)
    }, null, 2));
    return;
  }

  const slotIndex = readSlotIndex();
  const profilePacks = buildProfileContentPacks(account, today, slotIndex);
  const autoPacks = profilePacks.length ? profilePacks : buildAutoContentPacks(today, slotIndex);
  const automaticSelectionPacks = profilePacks.length ? mergePacks(profilePacks, packs) : packs;
  validatePacks(autoPacks);
  validatePacks(automaticSelectionPacks);
  if (args.validateCopy) {
    console.log(JSON.stringify({
      ok: true,
      account: account.account,
      checkedPacks: packs.length,
      checkedAutoPacks: autoPacks.length,
      checkedAutomaticSelectionPacks: automaticSelectionPacks.length
    }, null, 2));
    return;
  }

  const style = styleWithBrandPalette(pickVisualStyle(styles, account, today, slotIndex), account, { dateString: today, slotIndex });
  let pack = pickDaily(automaticSelectionPacks, today, slotIndex);
  let packIndex = profilePacks.length
    ? `profile-${pickDailyIndex(automaticSelectionPacks, today, slotIndex)}`
    : pickDailyIndex(automaticSelectionPacks, today, slotIndex);
  let skippedDuplicates = 0;
  let scheduledPost = null;
  let publishMode = process.env.INSTAGRAM_TEMPLATE_PUBLISH_MODE === 'story-only' || args.storyOnly
    ? 'story-only'
    : 'feed-and-story';
  let dashboardPack = null;
  if (process.env.INSTAGRAM_TEMPLATE_PACK_JSON?.trim()) {
    dashboardPack = JSON.parse(process.env.INSTAGRAM_TEMPLATE_PACK_JSON);
    validatePack(dashboardPack);
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
      publishMode = scheduledPost.mode === 'story-only' ? 'story-only' : 'feed-and-story';
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

  const token = env[account.accessTokenEnv];
  const userId = env[account.userIdEnv];
  const imgbbKey = env[account.imgbbKeyEnv];
  if (!args.renderOnly) {
    if (!token) throw new Error(`${account.accessTokenEnv} ausente.`);
    if (!userId) throw new Error(`${account.userIdEnv} ausente.`);
    if (!imgbbKey) throw new Error(`${account.imgbbKeyEnv} ausente.`);

    const igAccount = await graphGet(`/${userId}`, { fields: 'id,username', access_token: token });
    if (igAccount.username !== account.expectedUsername) {
      throw new Error(`Conta errada: esperado ${account.expectedUsername}, retornou ${igAccount.username}.`);
    }

    if (!scheduledPost && !dashboardPack && !args.storyOnly) {
      const recentMedia = await fetchRecentMedia(userId, token);
      const fresh = pickFreshPack(automaticSelectionPacks, today, slotIndex, recentMedia);
      if (!fresh.pack) {
        const autoFresh = pickFreshPack(autoPacks, today, slotIndex, recentMedia);
        if (!autoFresh.pack) {
          const fallbackPack = buildLastResortPack(today, slotIndex);
          validatePack(fallbackPack);
          pack = fallbackPack;
          packIndex = `auto-unique-${slotIndex}`;
          skippedDuplicates = fresh.skippedDuplicates + autoFresh.skippedDuplicates;
          console.log(`Conteudo unico de emergencia selecionado porque ${automaticSelectionPacks.length} captions preferenciais e ${autoPacks.length} captions automaticas ja aparecem nas midias recentes.`);
        } else {
          pack = autoFresh.pack;
          packIndex = `auto-${autoFresh.packIndex}`;
          skippedDuplicates = fresh.skippedDuplicates + autoFresh.skippedDuplicates;
          console.log(`Conteudo automatico selecionado porque ${automaticSelectionPacks.length} captions preferenciais ja aparecem nas midias recentes.`);
        }
      } else {
        pack = fresh.pack;
        packIndex = profilePacks.length ? `profile-${fresh.packIndex}` : fresh.packIndex;
        skippedDuplicates = fresh.skippedDuplicates;
      }
    }
  }

  const runId = `${timestampSaoPaulo()}-slot-${slotIndex}${args.renderOnly ? '-render-only' : ''}`;
  const runDir = join(RUNS_DIR, account.account, runId);
  mkdirSync(runDir, { recursive: true });
  const enhancement = enhancePackForEngagement(pack, today, slotIndex, account);
  pack = enhancement.pack;
  validatePack(pack);
  writeFileSync(join(runDir, 'engagement-intelligence.json'), JSON.stringify(enhancement.intelligence, null, 2), 'utf8');
  writeFileSync(join(runDir, 'daily-pack.json'), JSON.stringify({ date: today, slotIndex, packIndex, skippedDuplicates, account: account.account, visualStyle: style.name, intelligence: enhancement.intelligence, ...pack }, null, 2), 'utf8');
  writeFileSync(join(runDir, 'caption.txt'), pack.caption, 'utf8');
  const storyOnly = publishMode === 'story-only';
  const imagePaths = storyOnly ? [] : await renderSlides(runDir, pack.slides, account, style);
  const storyImagePath = await renderStory(runDir, pack, account, style);

  if (args.renderOnly) {
    console.log(JSON.stringify({ ok: true, renderOnly: true, account: account.account, runDir, visualStyle: style.name, slotIndex, packIndex, imagePaths, storyImagePath }, null, 2));
    return;
  }

  let storyImageUrl = '';
  let story = null;
  let imageUrls = [];
  let childIds = [];
  let carousel = null;
  if (!storyOnly) {
    const children = [];
    for (const imagePath of imagePaths) {
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
  ({ story, imageUrl: storyImageUrl } = await createStoryFromImage(userId, token, storyImagePath, imgbbKey));

  const baseResult = {
    ok: true,
    dryRun: args.dryRun,
    storyOnly,
    scheduledPostId: scheduledPost?.id,
    account: account.account,
    runDir,
    slotIndex,
    packIndex,
    skippedDuplicates,
    imagePaths,
    storyImagePath,
    imageUrls,
    storyImageUrl,
    childIds,
    carouselId: carousel?.id,
    storyContainerId: story.id
  };
  if (args.dryRun) {
    writeFileSync(join(runDir, 'result.json'), JSON.stringify(baseResult, null, 2), 'utf8');
    console.log(JSON.stringify(baseResult, null, 2));
    return;
  }

  let media = null;
  let details = null;
  if (!storyOnly) {
    media = await graphPost(`/${userId}/media_publish`, { creation_id: carousel.id, access_token: token });
    details = await graphGet(`/${media.id}`, { fields: 'id,permalink,timestamp', access_token: token });
  }
  const storyMedia = await graphPost(`/${userId}/media_publish`, { creation_id: story.id, access_token: token });
  const storyDetails = await graphGet(`/${storyMedia.id}`, { fields: 'id,timestamp', access_token: token });
  const result = { ...baseResult, mediaId: media?.id, ...(details || {}), storyMediaId: storyMedia.id, story: storyDetails };
  if (scheduledPost) {
    const scheduledPatch = {
      status: 'published',
      publishedAt: new Date().toISOString(),
      mediaId: media?.id,
      permalink: details?.permalink,
      storyMediaId: storyMedia.id
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
