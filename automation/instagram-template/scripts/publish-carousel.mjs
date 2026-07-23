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
const IG_BASE = 'https://graph.facebook.com/v21.0';
const RETRY_ATTEMPTS = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_RETRY_ATTEMPTS || '3', 10);
const RETRY_BASE_DELAY_MS = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_RETRY_BASE_DELAY_MS || '2500', 10);
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

function autoPack(topic, angle, context, sequence, runStamp = null) {
  const runLine = runStamp ? `\n\nEdição operacional ${runStamp}.` : '';
  return {
    autoGenerated: true,
    slides: [
      {
        eyebrow: angle.label,
        title: `${topic.area}: onde a IA realmente ajuda?`,
        body: angle.hook
      },
      {
        eyebrow: 'Dor',
        title: `O sinal aparece quando ${topic.pain}.`,
        body: `Isso fica mais claro ${context.trigger}.`
      },
      {
        eyebrow: 'Base',
        title: 'Sem processo claro, a IA improvisa.',
        body: `Organize ${topic.process}. Depois disso, a tecnologia consegue trabalhar com contexto.`
      },
      {
        eyebrow: 'Aplicação',
        title: 'Automatize uma parte verificável.',
        body: angle.insight
      },
      {
        eyebrow: 'Próximo passo',
        title: `O ganho é ${topic.gain}.`,
        body: `Procure ${context.proof}.`
      }
    ],
    caption: `${topic.area} com IA não começa pela ferramenta.\n\nComeça quando você identifica que ${topic.pain}, descreve o processo e define o que precisa ser conferido antes de escalar.\n\n${angle.action}\n\nO melhor sinal para acompanhar é ${context.proof}.${runLine}\n\nSérie prática ${String(sequence + 1).padStart(3, '0')}: automação boa transforma rotina em sistema.\n\n${topic.hashtag}`
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

function engagementVariant(dateString, slotIndex, offset = 0) {
  return ENGAGEMENT_INTELLIGENCE.visualVariants[
    pickDailyIndex(ENGAGEMENT_INTELLIGENCE.visualVariants, dateString, slotIndex + offset)
  ];
}

function enhanceSlide(slide, index, dateString, slotIndex) {
  const next = { ...slide };
  if (next.imagePath || next.imageUrl) return next;

  next.visualVariant = engagementVariant(dateString, slotIndex, index);
  if (index === 0) {
    next.eyebrow = ENGAGEMENT_INTELLIGENCE.eyebrowHooks[
      pickDailyIndex(ENGAGEMENT_INTELLIGENCE.eyebrowHooks, dateString, slotIndex)
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

function enhanceCaption(caption, dateString, slotIndex) {
  const { body, hashtags } = splitCaptionParts(caption);
  const cta = ENGAGEMENT_INTELLIGENCE.ctas[
    pickDailyIndex(ENGAGEMENT_INTELLIGENCE.ctas, dateString, slotIndex)
  ];
  const angle = ENGAGEMENT_INTELLIGENCE.captionAngles[
    pickDailyIndex(ENGAGEMENT_INTELLIGENCE.captionAngles, dateString, slotIndex)
  ];
  const slotNote = angle;
  const hasCta = /salve|envie|comente|compartilhe|mande/i.test(body);
  const bodyWithAngle = body.includes(slotNote) ? body : `${body}\n\n${slotNote}`;
  const enhancedBody = hasCta ? bodyWithAngle : `${bodyWithAngle}\n\n${cta}`;
  return [enhancedBody.trim(), hashtags].filter(Boolean).join('\n\n');
}

function enhancePackForEngagement(pack, dateString, slotIndex) {
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
  enhanced.slides = (enhanced.slides || []).map((slide, index) => enhanceSlide(slide, index, dateString, slotIndex));
  enhanced.caption = enhanceCaption(enhanced.caption || '', dateString, slotIndex);
  enhanced.engagementIntelligence = {
    version: 1,
    appliedAt: new Date().toISOString(),
    strategy: 'hook + CTA + visual variance',
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
        packs.push(autoPack(topic, angle, context, sequence, runStamp));
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
    stamp
  );
}

function shortPhrase(value = '', fallback = '') {
  const text = String(value || fallback || '').replace(/\s+/g, ' ').trim();
  if (text.length <= 86) return text;
  return `${text.slice(0, 86).replace(/\s+\S*$/, '')}...`;
}

function profileTopicFromAccount(account = {}) {
  const profile = account.contentProfile || {};
  const brandSummary = account.brandSummary || {};
  const documentAnalysis = account.brandDocument?.analysis || {};
  if (!profile.niche && !profile.audience && !profile.offer && !brandSummary.description && !documentAnalysis.summary) return null;
  const niche = profile.niche || account.brandName || 'negócio';
  const audience = profile.audience || 'clientes';
  const offer = profile.offer || 'solução com IA';
  const tone = profile.tone || 'consultivo';
  const brandContext = buildBrandContext(account);
  const documentKeywords = Array.isArray(documentAnalysis.keywords) ? documentAnalysis.keywords.slice(0, 5).join(', ') : '';
  const differentiator = shortPhrase(brandSummary.differentiator || documentAnalysis.summary, offer);
  return {
    area: niche,
    pain: `${shortPhrase(audience, 'clientes')} ainda precisa entender o valor de ${differentiator}`,
    process: `dor do público, promessa, prova, objeções e próximo passo em tom ${tone}. Contexto da empresa: ${brandContext}`,
    gain: documentKeywords
      ? `transformar ${documentKeywords} em conversa prática sobre ${offer}`
      : `transformar interesse em conversa sobre ${offer}`,
    hashtag: '#inteligenciaartificial #automacao #marketingdigital #negocios #conteudo'
  };
}

function buildProfileContentPacks(account, dateString, slotIndex, runStamp = null) {
  const topic = profileTopicFromAccount(account);
  if (!topic) return [];
  const packs = [];
  for (const [angleIndex, angle] of AUTO_CONTENT_ANGLES.entries()) {
    for (const [contextIndex, context] of AUTO_CONTENT_CONTEXTS.entries()) {
      const sequence = (angleIndex * AUTO_CONTENT_CONTEXTS.length) + contextIndex;
      packs.push(autoPack(topic, angle, context, sequence, runStamp));
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

function styleWithBrandPalette(style, account = {}) {
  const palette = account.brandPalette || {};
  if (!validHexColor(palette.primary) && !validHexColor(palette.secondary) && !validHexColor(palette.background)) {
    return style;
  }
  const primary = validHexColor(palette.primary) ? palette.primary.toLowerCase() : '#17211c';
  const secondary = validHexColor(palette.secondary) ? palette.secondary.toLowerCase() : style.accent;
  const background = validHexColor(palette.background) ? palette.background.toLowerCase() : style.bgTop;
  const text = contrastColor(background);
  return {
    ...style,
    name: `${style.name}-brand`,
    accent: secondary,
    accentSoft: rgba(secondary, 0.18),
    grid: rgba(primary, 0.11),
    bgTop: background,
    bgBottom: background,
    text,
    muted: text === '#ffffff' ? '#e7eee9' : '#4b5b53'
  };
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
  error.stage = label;
  error.status = status;
  error.responseBody = bodyPreview;
  error.retryable = RETRYABLE_STATUS.has(status) || Boolean(graphMediaTimeout);
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
    body { width: 1080px; height: 1080px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${style.bgTop}; color: ${style.text}; }
    main {
      width: 1080px;
      height: 1080px;
      padding: 62px 70px 58px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        linear-gradient(135deg, ${style.accentSoft}, rgba(124,255,178,0) 34%),
        linear-gradient(180deg, ${style.bgTop} 0%, ${style.bgBottom} 100%);
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
        linear-gradient(90deg, ${style.grid} 1px, transparent 1px),
        linear-gradient(180deg, ${style.grid} 1px, transparent 1px);
      background-size: 46px 46px;
      transform: rotate(-7deg);
    }
    .rail { position: absolute; left: 70px; bottom: 160px; font-size: 150px; line-height: 1; font-weight: 900; color: ${style.accent}; opacity: 0.16; z-index: 1; }
    .signal { position: absolute; right: 70px; bottom: 92px; display: flex; gap: 14px; z-index: 1; }
    .signal span { width: 16px; height: 88px; border-radius: 99px; background: ${style.accent}; opacity: 0.28; }
    .signal span:nth-child(2) { height: 132px; opacity: 0.52; }
    .signal span:nth-child(3) { height: 62px; opacity: 0.2; }
    section, footer { position: relative; z-index: 2; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 28px; }
    .brand { font-size: 34px; font-weight: 900; color: ${style.text}; }
    .eyebrow { font-size: 28px; font-weight: 900; color: ${style.accent}; text-transform: uppercase; text-align: right; }
    .content { display: flex; flex-direction: column; gap: 34px; text-align: ${align}; align-items: ${align === 'center' ? 'center' : 'flex-start'}; }
    h1 { max-width: 850px; font-size: ${titleSize}px; line-height: 1.03; font-weight: 900; color: ${style.text}; letter-spacing: 0; }
    p { max-width: 830px; font-size: ${bodySize}px; line-height: 1.18; font-weight: 800; color: ${style.muted}; letter-spacing: 0; }
    .bar { width: ${index % 2 === 0 ? '148px' : '220px'}; height: 12px; background: ${style.accent}; }
    footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; color: #AEB8B2; font-size: 26px; font-weight: 800; }
    footer strong { display: block; color: ${style.text}; font-size: 30px; font-weight: 900; }
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
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
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

function storyHtml(slide, account, style) {
  const variant = slide.visualVariant || 'focus';
  const titleSize = variant === 'quote' ? 82 : 90;
  const align = variant === 'quote' ? 'center' : 'left';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 1080px; height: 1920px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${style.bgTop}; color: ${style.text}; }
    main {
      width: 1080px;
      height: 1920px;
      padding: 116px 76px 104px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        linear-gradient(135deg, ${style.accentSoft}, rgba(124,255,178,0) 40%),
        linear-gradient(180deg, ${style.bgTop} 0%, ${style.bgBottom} 100%);
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
        linear-gradient(90deg, ${style.grid} 1px, transparent 1px),
        linear-gradient(180deg, ${style.grid} 1px, transparent 1px);
      background-size: 50px 50px;
      transform: rotate(-7deg);
    }
    .story-mark { position: absolute; right: 76px; bottom: 180px; width: 180px; height: 180px; border: 18px solid ${style.accent}; border-radius: 50%; opacity: 0.18; z-index: 1; }
    section, footer { position: relative; z-index: 2; }
    .brand { font-size: 38px; font-weight: 900; color: ${style.text}; }
    .eyebrow { font-size: 32px; font-weight: 900; color: ${style.accent}; text-transform: uppercase; margin-top: 110px; }
    .content { display: flex; flex-direction: column; gap: 38px; text-align: ${align}; align-items: ${align === 'center' ? 'center' : 'flex-start'}; }
    .bar { width: 210px; height: 14px; background: ${style.accent}; }
    h1 { max-width: 880px; font-size: ${titleSize}px; line-height: 1.03; font-weight: 900; color: ${style.text}; letter-spacing: 0; }
    p { max-width: 850px; font-size: 44px; line-height: 1.2; font-weight: 800; color: ${style.muted}; letter-spacing: 0; }
    footer { color: #AEB8B2; font-size: 30px; font-weight: 800; }
    footer strong { display: block; color: ${style.text}; font-size: 36px; font-weight: 900; margin-bottom: 6px; }
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

async function main() {
  const args = parseArgs(process.argv);
  const env = loadEnv();
  const { account, packs: localPacks, styles } = loadConfig(args.configDir, args.account);
  const supabasePacks = await loadSupabasePacks(env, args.account);
  const packs = mergePacks(supabasePacks, localPacks);
  validatePacks(packs);

  const today = todaySaoPaulo();
  const slotIndex = readSlotIndex();
  const profilePacks = buildProfileContentPacks(account, today, slotIndex);
  const autoPacks = profilePacks.length ? profilePacks : buildAutoContentPacks(today, slotIndex);
  validatePacks(autoPacks);
  if (args.validateCopy) {
    console.log(JSON.stringify({
      ok: true,
      account: account.account,
      checkedPacks: packs.length,
      checkedAutoPacks: autoPacks.length
    }, null, 2));
    return;
  }

  const style = styleWithBrandPalette(pickDaily(styles, today), account);
  let pack = pickDaily(packs, today, slotIndex);
  let packIndex = pickDailyIndex(packs, today, slotIndex);
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
      packIndex = `scheduled-${scheduledPost.packIndex}`;
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
      const fresh = pickFreshPack(packs, today, slotIndex, recentMedia);
      if (!fresh.pack) {
        const autoFresh = pickFreshPack(autoPacks, today, slotIndex, recentMedia);
        if (!autoFresh.pack) {
          const fallbackPack = buildLastResortPack(today, slotIndex);
          validatePack(fallbackPack);
          pack = fallbackPack;
          packIndex = `auto-unique-${slotIndex}`;
          skippedDuplicates = fresh.skippedDuplicates + autoFresh.skippedDuplicates;
          console.log(`Conteudo unico de emergencia selecionado porque ${packs.length} captions locais e ${autoPacks.length} captions automaticas ja aparecem nas midias recentes.`);
        } else {
          pack = autoFresh.pack;
          packIndex = `auto-${autoFresh.packIndex}`;
          skippedDuplicates = fresh.skippedDuplicates + autoFresh.skippedDuplicates;
          console.log(`Conteudo automatico selecionado porque ${packs.length} captions locais ja aparecem nas midias recentes.`);
        }
      } else {
        pack = fresh.pack;
        packIndex = fresh.packIndex;
        skippedDuplicates = fresh.skippedDuplicates;
      }
    }
  }

  const runId = `${timestampSaoPaulo()}-slot-${slotIndex}${args.renderOnly ? '-render-only' : ''}`;
  const runDir = join(RUNS_DIR, account.account, runId);
  mkdirSync(runDir, { recursive: true });
  const enhancement = enhancePackForEngagement(pack, today, slotIndex);
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

  const storyImageUrl = await uploadToImgBB(storyImagePath, imgbbKey);
  let imageUrls = [];
  let childIds = [];
  let carousel = null;
  if (!storyOnly) {
    imageUrls = await Promise.all(imagePaths.map((imagePath) => (
      isHttpUrl(imagePath) ? imagePath : uploadToImgBB(imagePath, imgbbKey)
    )));
    const children = await Promise.all(imageUrls.map((imageUrl) => graphPost(`/${userId}/media`, {
      image_url: imageUrl,
      is_carousel_item: 'true',
      access_token: token
    })));
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
  const story = await createStory(userId, token, storyImageUrl);

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
    updateScheduledPost(args.configDir, account.account, scheduledPost.id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      mediaId: media?.id,
      permalink: details?.permalink,
      storyMediaId: storyMedia.id
    });
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
      updateScheduledPost(args.configDir, args.account, scheduledPostId, {
        status: 'failed',
        failedAt: new Date().toISOString(),
        error: error.message
      });
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
