import { createHash } from 'node:crypto';

export const EDITORIAL_SOURCES = [
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
  { name: 'AWS Machine Learning', url: 'https://aws.amazon.com/blogs/machine-learning/feed/' },
  { name: 'Microsoft Cloud', url: 'https://www.microsoft.com/en-us/microsoft-cloud/blog/feed/' },
  { name: 'Google Cloud', url: 'https://cloud.google.com/blog/products/ai-machine-learning/rss' },
  { name: 'Google DeepMind', url: 'https://deepmind.google/sitemap.xml', format: 'sitemap', pathPattern: /\/discover\/blog\// },
  { name: 'Anthropic Claude', url: 'https://www.anthropic.com/sitemap.xml', format: 'sitemap', pathPattern: /\/news\// },
  { name: 'NVIDIA AI', url: 'https://blogs.nvidia.com/blog/category/deep-learning/feed/' },
  { name: 'n8n', url: 'https://blog.n8n.io/rss/' },
  { name: 'G1 Tecnologia', url: 'https://g1.globo.com/rss/g1/tecnologia/' },
  { name: 'Olhar Digital', url: 'https://olhardigital.com.br/feed/' },
  { name: 'TecMundo', url: 'https://www.tecmundo.com.br/news-sitemap.xml', format: 'sitemap' },
  { name: 'Microsoft AI', url: 'https://news.microsoft.com/source/tag/ai/feed/' },
  { name: 'Google Oficial', url: 'https://blog.google/feed/' },
  { name: 'IBM AI', url: 'https://newsroom.ibm.com/press-releases-artificial-intelligence?pagetemplate=rss' }
];

export function normalizeEditorialSources(sources = []) {
  if (!Array.isArray(sources)) return [];
  const names = new Set();
  return sources.map((source) => {
    const name = String(source?.name || '').trim().slice(0, 80);
    const url = String(source?.url || '').trim();
    if (!name || !/^https:\/\//i.test(url) || names.has(`${name}|${url}`)) return null;
    names.add(`${name}|${url}`);
    const knownSource = EDITORIAL_SOURCES.find((item) => item.url === url);
    return knownSource ? { ...knownSource, name } : { name, url };
  }).filter(Boolean).slice(0, 24);
}

const RELEVANT = /\b(ai|artificial intelligence|automation|automate|agent|workflow|machine learning|customer|business|enterprise|productivity|operations|sales|service|data)\b/i;
const IRRELEVANT = /\b(appoints?|appointment|chief revenue officer|earnings|quarterly results|award|event recap|podcast|smartwatch|promo[cç][aã]o|oferta|desconto|sele[cç][aã]o imperd[ií]vel|compre|comprar)\b/i;

function decodeXml(value = '') {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block, names) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
    if (match) return decodeXml(match[1]);
  }
  return '';
}

function itemLink(block) {
  const plain = tag(block, ['link']);
  if (/^https?:\/\//i.test(plain)) return plain;
  const href = block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || '';
  return decodeXml(href);
}

function absoluteHttpsUrl(value = '', baseUrl = '') {
  try {
    const url = new URL(decodeXml(value), baseUrl || undefined);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function acceptableEditorialImageUrl(value = '', baseUrl = '') {
  const url = absoluteHttpsUrl(value, baseUrl);
  const normalizedUrl = url.replace(/\/$/, '');
  const normalizedBase = absoluteHttpsUrl(baseUrl).replace(/\/$/, '');
  if (!url || normalizedUrl === normalizedBase || /(?:logo|icon|avatar|sprite|badge|favicon|tracking|pixel)|\.svg(?:\?|$)/i.test(url)) return '';
  return url;
}

function feedImageUrl(block = '', articleUrl = '') {
  const candidates = [
    ...[...String(block).matchAll(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*(?:url|href)=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]),
    tag(block, ['image', 'thumbnail'])
  ];
  return candidates.map((candidate) => acceptableEditorialImageUrl(candidate, articleUrl)).find(Boolean) || '';
}

export function extractEditorialImageUrl(html = '', articleUrl = '') {
  const source = String(html || '');
  const metaCandidates = [...source.matchAll(/<meta\b[^>]*(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image(?::src)?)["'][^>]*content=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1]);
  const reversedMetaCandidates = [...source.matchAll(/<meta\b[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image(?::src)?)["'][^>]*>/gi)]
    .map((match) => match[1]);
  const jsonLdCandidates = [...source.matchAll(/["'](?:image|contentUrl)["']\s*:\s*(?:\[\s*)?["']([^"']+)["']/gi)]
    .map((match) => match[1]);
  return [...metaCandidates, ...reversedMetaCandidates, ...jsonLdCandidates]
    .map((candidate) => acceptableEditorialImageUrl(candidate, articleUrl))
    .find(Boolean) || '';
}

export function parseEditorialFeed(xml, source) {
  const blocks = String(xml).match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) || [];
  return blocks.map((block) => {
    const url = itemLink(block);
    return {
      source: source.name,
      sourceFeed: source.url,
      title: tag(block, ['title']),
      url,
      publishedAt: tag(block, ['pubDate', 'published', 'updated']),
      summary: tag(block, ['description', 'summary', 'content']),
      imageUrl: feedImageUrl(block, url)
    };
  }).filter((item) => item.title && item.url);
}

function titleFromUrl(url = '') {
  const slug = String(url).split('/').filter(Boolean).at(-1) || '';
  return decodeURIComponent(slug).replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
}

export function parseEditorialSitemap(xml, source) {
  const blocks = String(xml).match(/<url>\s*[\s\S]*?<\/url>/gi) || [];
  return blocks.map((block) => {
    const url = tag(block, ['loc']);
    return {
      source: source.name,
      sourceFeed: source.url,
      title: tag(block, ['news:title']) || titleFromUrl(url),
      url,
      publishedAt: tag(block, ['news:publication_date', 'lastmod']),
      summary: `Atualização publicada por ${source.name}.`
    };
  }).filter((item) => item.title && item.url && (!source.pathPattern || source.pathPattern.test(item.url)));
}

function normalizedEditorialText(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function factualSummary(item = {}) {
  const title = String(item.title || '').trim();
  const summary = decodeXml(item.summary || '')
    .replace(/^(?:\s*)O post\s+.+?\s+apareceu primeiro em\s+.+?\s*\.?$/i, '')
    .replace(/^(?:\s*)The post\s+.+?\s+appeared first on\s+.+?\s*\.?$/i, '')
    .replace(/^Atualização publicada por .+?\.?$/i, '')
    .trim();
  const normalizedTitle = normalizedEditorialText(title);
  const normalizedSummary = normalizedEditorialText(summary);
  if (summary.length < 45 || !normalizedSummary || normalizedSummary === normalizedTitle) return '';
  const withoutTitle = normalizedSummary.replace(normalizedTitle, '').trim();
  if (withoutTitle.length < 30) return '';
  return summary.length > 320 ? `${summary.slice(0, 317).replace(/\s+\S*$/, '')}...` : summary;
}

export function extractArticleFacts(html = '', item = {}) {
  const titleKey = normalizedEditorialText(item.title || '');
  const rejected = /^(\[[^\]]+\]|publicidade|leia mais|veja tamb[eé]m|compartilhe|assine|cobertura editorial|logo da|.+ é jornalista)/i;
  const paragraphs = [...String(html).matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)]
    .map((match) => decodeXml(match[1]))
    .map((text) => text.replace(/\s+/g, ' ').trim())
    .filter((text) => text.length >= 70 && text.length <= 520 && !rejected.test(text));
  const seen = new Set();
  return paragraphs.filter((text) => {
    const key = normalizedEditorialText(text);
    if (!key || key === titleKey || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

function compactFactualStatement(value = '', maxLength = 80) {
  const sentence = String(value || '').split(/(?<=[.!?])\s+/).filter(Boolean)[0] || String(value || '');
  if (sentence.length <= maxLength) return sentence;
  return `${sentence.slice(0, maxLength - 3).replace(/\s+\S*$/, '')}...`;
}

export function isPredominantlyEnglish(value = '') {
  const text = ` ${String(value || '').toLowerCase().replace(/[^a-záàâãéêíóôõúç\s]/g, ' ')} `;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const english = text.match(/\b(the|and|with|for|from|into|this|that|how|what|where|why|who|learn|build|building|workflow|workflows|automation|comparing|versus|provides|needed|understand|more|your|their|they|are|can|will|would|when|which|get|getting|better|best|new|using|use|make|makes|handling|tasks|harder|debug|captures|full|execution|including|model|calls|tool|tools|invocations|visibility|reliable|reliability|security|scalability|observability|operations|long|term|failure|failures|break|welcome|day|project|problem|team|guide|letter|governor|responsible|infrastructure|launch|launches|helping|health|wellness|education|startups|turn|trusted|products|generation|supporting|accelerator|week|weeks|catching|wildfires|earlier|gives|firefighters|head|start|appeared|first|source)\b/g)?.length || 0;
  const portuguese = text.match(/\b(o|a|os|as|de|da|do|das|dos|e|com|para|uma|um|que|como|quando|onde|por|mais|sua|seu|empresa|empresas)\b/g)?.length || 0;
  const accentedPortuguese = text.match(/[áàâãéêíóôõúç]/g)?.length || 0;
  return (english >= 3 && english > portuguese)
    || (words.length >= 5 && english >= 2 && portuguese === 0 && accentedPortuguese === 0);
}

export function rotateEditorialItemsBySource(items = []) {
  const buckets = new Map();
  for (const item of items) {
    const source = String(item?.source || 'Fonte editorial').trim();
    if (!buckets.has(source)) buckets.set(source, []);
    buckets.get(source).push(item);
  }
  const queues = [...buckets.values()]
    .map((queue) => queue.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)))
    .sort((a, b) => Date.parse(b[0]?.publishedAt) - Date.parse(a[0]?.publishedAt));
  const rotated = [];
  while (queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      if (queue.length) rotated.push(queue.shift());
    }
  }
  return rotated;
}

function includesEditorialTerm(text = '', term = '') {
  const normalizeSearch = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const normalizedText = normalizeSearch(text);
  const cleanTerm = normalizeSearch(term).trim();
  if (!cleanTerm) return false;
  const escaped = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(normalizedText);
}

const EDITORIAL_TERM_ALIASES = new Map([
  ['ai', ['ia', 'inteligencia artificial']],
  ['artificial intelligence', ['inteligencia artificial', 'ia']],
  ['automation', ['automacao', 'automatizacao']],
  ['automate', ['automatizar', 'automatizado']],
  ['agent', ['agente', 'agentes']],
  ['workflow', ['fluxo', 'fluxos', 'processo', 'processos']],
  ['machine learning', ['aprendizado de maquina', 'aprendizagem de maquina']],
  ['customer', ['cliente', 'clientes', 'atendimento']],
  ['business', ['empresa', 'empresas', 'negocio', 'negocios']],
  ['enterprise', ['empresa', 'empresarial', 'corporativo']],
  ['productivity', ['produtividade']],
  ['operations', ['operacao', 'operacoes']],
  ['sales', ['venda', 'vendas', 'comercial']],
  ['service', ['servico', 'servicos', 'atendimento']],
  ['data', ['dado', 'dados']]
]);

function includesEditorialTermOrAlias(text = '', term = '') {
  if (includesEditorialTerm(text, term)) return true;
  const cleanTerm = String(term || '').trim().toLowerCase();
  return (EDITORIAL_TERM_ALIASES.get(cleanTerm) || []).some((alias) => includesEditorialTerm(text, alias));
}

const STRONG_EDITORIAL_TERMS = new Set([
  'ai', 'artificial intelligence', 'automation', 'automate', 'workflow', 'machine learning'
]);

export function matchesConfiguredEditorialIntent(title = '', includeTerms = []) {
  const normalizedTerms = includeTerms.map((term) => String(term || '').trim().toLowerCase()).filter(Boolean);
  const hasStrongMatch = normalizedTerms
    .filter((term) => STRONG_EDITORIAL_TERMS.has(term))
    .some((term) => includesEditorialTermOrAlias(title, term));
  if (hasStrongMatch) return true;

  const hasAgentMatch = normalizedTerms.some((term) => term === 'agent' && includesEditorialTermOrAlias(title, term));
  const hasAiQualifier = ['ai', 'artificial intelligence', 'machine learning', 'automation']
    .some((term) => includesEditorialTermOrAlias(title, term));
  return hasAgentMatch && hasAiQualifier;
}

function themeFor(text = '') {
  if (/agent|copilot/i.test(text)) return { key: 'agentes', label: 'agentes de IA', application: 'executar etapas, consultar dados e encaminhar decisões com supervisão' };
  if (/customer|service|support|contact center/i.test(text)) return { key: 'atendimento', label: 'atendimento inteligente', application: 'organizar solicitações, contexto e próximos passos antes da resposta humana' };
  if (/sales|marketing|commerce|revenue/i.test(text)) return { key: 'comercial', label: 'automação comercial', application: 'proteger o contexto entre lead, proposta e acompanhamento' };
  if (/security|governance|privacy|risk/i.test(text)) return { key: 'governanca', label: 'governança da automação', application: 'definir acesso, revisão humana e rastreabilidade antes de escalar' };
  if (/data|analytics|document|knowledge|search/i.test(text)) return { key: 'dados', label: 'dados conectados à operação', application: 'transformar informação dispersa em consulta e ação prática' };
  if (/workflow|automation|integrat|process|operation/i.test(text)) return { key: 'fluxos', label: 'fluxos automatizados', application: 'conectar tarefas repetitivas sem perder os pontos de controle' };
  return { key: 'produtividade', label: 'IA aplicada à produtividade', application: 'reduzir trabalho repetitivo e devolver foco às decisões importantes' };
}

const NEWS_TRANSLATIONS = [
  {
    pattern: /evolve your marketing with new ai tools|google ads.*analytics.*ai updates/i,
    title: 'Google adiciona novas ferramentas de IA ao Ads e ao Analytics.',
    fact: 'O Google anunciou recursos de inteligência artificial no Ads e no Analytics para ajudar empresas a encontrar informações e agir com mais rapidez.',
    facts: [
      'O Google anunciou recursos de inteligência artificial no Ads e no Analytics para ajudar empresas a encontrar informações e agir com mais rapidez.',
      'As novidades incluem resumos nas páginas iniciais, relatórios visuais criados por comandos simples e comparação de desempenho com empresas semelhantes.'
    ]
  },
  {
    pattern: /ibm partners with openai.*secure ai deployment|ibm.*openai.*core operations/i,
    title: 'IBM e OpenAI ampliam o uso seguro de IA nas operações das empresas.',
    fact: 'IBM e OpenAI anunciaram uma parceria para ajudar empresas a aplicar inteligência artificial em sistemas e processos centrais com mais segurança.',
    facts: [
      'IBM e OpenAI anunciaram uma parceria para ajudar empresas a aplicar inteligência artificial em sistemas e processos centrais com mais segurança.',
      'A iniciativa integra modelos da OpenAI à plataforma de entrega de IA da IBM Consulting para modernizar aplicações e apoiar resultados de negócio.'
    ]
  },
  {
    pattern: /supporting thailand.*next generation.*ai startups|thailand.*mhesi.*eight.?week accelerator/i,
    title: 'OpenAI apoia dez startups da Tailândia a transformar protótipos de IA em produtos confiáveis.',
    fact: 'OpenAI e o Ministério da Educação Superior da Tailândia lançaram um programa acelerador de oito semanas para dez startups de saúde, bem-estar e educação.',
    facts: [
      'OpenAI e o Ministério da Educação Superior da Tailândia lançaram um programa acelerador de oito semanas para dez startups de saúde, bem-estar e educação.',
      'O objetivo é ajudar essas startups a transformar protótipos de inteligência artificial em produtos confiáveis.'
    ]
  },
  {
    pattern: /rpa\s+vs\.?\s+workflow automation|comparing rpa versus workflow automation/i,
    title: 'n8n explica a diferença entre robô de clique e automação de verdade.',
    fact: 'A comparação mostra que automações baseadas em processos tendem a oferecer mais controle, segurança e capacidade de crescimento do que robôs que apenas repetem cliques.',
    facts: [
      'Robôs de clique repetem ações na tela e podem quebrar quando um sistema muda de posição, aparência ou sequência.',
      'Automações de processos conectam sistemas e regras de forma mais visível, facilitando controle, manutenção e crescimento.'
    ]
  },
  {
    pattern: /bedrock cost attribution.*athena.*cudos/i,
    title: 'AWS mostra como saber quanto cada área gasta com IA.',
    fact: 'A empresa mostra como acompanhar o uso da IA por equipe para evitar surpresa na conta no fim do mês.'
  },
  {
    pattern: /oneadvanced.*50 ai agents.*sovereign aws/i,
    title: 'Empresa coloca mais de 50 assistentes de IA para trabalhar.',
    fact: 'O caso mostra que é possível usar IA em escala sem perder o controle sobre dados e tarefas.'
  },
  {
    pattern: /rpa vs.*workflow automation/i,
    title: 'n8n explica a diferença entre robô de clique e automação de verdade.',
    fact: 'Robôs só repetem cliques. Uma automação bem feita conecta regras, dados e sistemas para o trabalho não parar.'
  },
  {
    pattern: /n8n alternatives.*ai automation platform/i,
    title: 'Escolher a ferramenta de automação vai além de ver recursos.',
    fact: 'Antes de escolher, vale olhar se ela conversa com seus sistemas, é segura e continua simples de manter.'
  },
  {
    pattern: /agentic workflows.*sagemaker.*agentcore/i,
    title: 'AWS mostra como colocar IA para ajudar no trabalho do dia a dia.',
    fact: 'O exemplo organiza tarefas, ferramentas e conferências para a IA ajudar sem virar uma caixa-preta.'
  },
  {
    pattern: /agent observability.*production workflows/i,
    title: 'Empresa precisa saber o que a IA fez antes de confiar nela.',
    fact: 'É importante registrar o que a IA fez, conferir erros e entender por que cada decisão foi tomada.',
    facts: [
      'Agentes de IA executam tarefas em várias etapas e podem seguir caminhos diferentes mesmo quando recebem pedidos parecidos.',
      'A observabilidade registra chamadas do modelo, ferramentas utilizadas e interações com sistemas externos para mostrar onde uma falha aconteceu.',
      'Com esse histórico, a equipe consegue investigar comportamentos inesperados, corrigir problemas e tornar a automação mais confiável.'
    ]
  },
  {
    pattern: /token prices.*host your own llms/i,
    title: 'Ter uma IA própria pode custar mais do que parece.',
    fact: 'Não é só o preço da ferramenta: servidor, uso e manutenção também entram na conta.'
  },
  {
    pattern: /monitor on-premises.*multi-cloud ai agents.*observability/i,
    title: 'AWS ajuda empresas a acompanhar IA em vários sistemas.',
    fact: 'A proposta reúne informações para a empresa ver o que a IA está fazendo, mesmo quando usa mais de um ambiente.'
  },
  {
    pattern: /automate legacy web applications.*browser tool/i,
    title: 'IA pode ajudar até em sistemas antigos da empresa.',
    fact: 'O exemplo mostra uma IA usando o navegador para apoiar tarefas em sistemas que ainda não têm integração moderna.'
  },
  {
    pattern: /accelerating m&a due diligence.*agentcore/i,
    title: 'IA ajuda empresas a revisar muitos documentos mais rápido.',
    fact: 'O caso mostra a IA organizando pesquisa, leitura e revisão para a equipe decidir com mais agilidade.'
  },
  {
    pattern: /amazon quick.*microsoft 365.*agentic ai/i,
    title: 'AWS leva IA para as ferramentas que a equipe já usa.',
    fact: 'A ideia é reduzir o tempo perdido trocando de tela e procurando informação durante o trabalho.'
  },
  {
    pattern: /builder.?s guide to gpt.?5\.6/i,
    title: 'OpenAI ensina como criar IA mais confiável para empresas.',
    fact: 'O guia reforça que a IA precisa de regras claras, boas ferramentas e conferência antes de atender clientes ou tomar ações.'
  },
  {
    pattern: /previewing ultrafast mode.*14x/i,
    title: 'OpenAI apresenta IA mais rápida para tarefas urgentes.',
    fact: 'Velocidade ajuda quando atendimento, análise ou operação não podem deixar o cliente esperando.'
  },
  {
    pattern: /introducing openai presence/i,
    title: 'OpenAI lança IA para conversar e ajudar no atendimento.',
    fact: 'A IA pode atender pedidos simples, consultar sistemas e passar os casos mais delicados para uma pessoa.'
  },
  {
    pattern: /building abundant intelligence/i,
    title: 'OpenAI fala em levar IA para mais áreas das empresas.',
    fact: 'O foco é economizar tempo e reduzir custo em tarefas que hoje dependem de muito trabalho manual.'
  },
  {
    pattern: /samsung.*chatgpt.*codex/i,
    title: 'Samsung amplia o uso de IA em várias áreas da empresa.',
    fact: 'A IA passa a apoiar equipes de tecnologia, marketing, produtos e outras áreas do negócio.'
  },
  {
    pattern: /mcp|model context protocol/i,
    title: 'Novo padrão ajuda a IA a acessar sistemas com mais segurança.',
    fact: 'A proposta busca deixar mais claro o que a IA pode acessar e quais ações ela tem permissão para fazer.'
  },
  {
    pattern: /market surveillance agent/i,
    title: 'AWS mostra várias IAs trabalhando juntas com controle.',
    fact: 'O exemplo registra as etapas e permite conferir o que aconteceu se algo sair do esperado.'
  },
  {
    pattern: /hp.*frontier/i,
    title: 'HP leva IA do teste para o trabalho real da empresa.',
    fact: 'A iniciativa usa IA em atendimento, operação e produtividade, não apenas em demonstrações.'
  },
  {
    pattern: /dell.*codex/i,
    title: 'Dell e OpenAI aproximam IA dos dados internos das empresas.',
    fact: 'A proposta ajuda a empresa a usar seus documentos e sistemas com acesso controlado e mais segurança.'
  },
  {
    pattern: /pwc|office of the cfo/i,
    title: 'OpenAI e PwC levam IA para tarefas financeiras.',
    fact: 'A IA pode ajudar em pagamentos, contratos e relatórios, mas uma pessoa continua conferindo as decisões importantes.'
  }
];

function localizedNews(item = {}, theme = {}) {
  const sourceText = `${item.title} ${item.summary}`;
  const match = NEWS_TRANSLATIONS.find((entry) => entry.pattern.test(sourceText));
  const sourceTitle = String(item.title || '').trim();
  const realSummary = factualSummary(item);
  const untranslatedEnglishTitle = isPredominantlyEnglish(sourceTitle) && !match;
  return {
    title: untranslatedEnglishTitle ? '' : (match?.title || sourceTitle),
    fact: untranslatedEnglishTitle ? '' : (match?.fact || ((!isPredominantlyEnglish(realSummary) && realSummary) || '')),
    facts: Array.isArray(match?.facts) ? match.facts : []
  };
}

function businessNarrative(theme = {}, options = {}) {
  const offer = String(options.offer || 'consultoria e automações com IA para atendimento, vendas e operação').trim();
  const humanOffer = offer.replace(/\s+com\s+IA\b/gi, '').replace(/\s{2,}/g, ' ').trim();
  const audience = String(options.audience || 'gestores e donos de empresas').trim();
  const narratives = {
    agentes: {
      hook: 'Sua equipe quer resolver, mas passa o dia procurando informação?',
      pain: 'Quando cada pessoa precisa abrir telas, copiar dados e pedir confirmação, sobra menos tempo para atender bem quem está do outro lado.',
      impact: 'O atraso parece pequeno, até virar retrabalho, resposta esquecida e cliente esperando.',
      solution: 'Mais tempo para resolver o que importa.',
      solutionDetail: 'Uma rotina bem organizada reúne o contexto e deixa o próximo passo claro para a equipe.'
    },
    atendimento: {
      hook: 'Seu cliente ainda precisa repetir tudo a cada conversa?',
      pain: 'Sem histórico e próximo passo visíveis, a equipe demora mais para responder e o cliente sente que ninguém o conhece.',
      impact: 'Aos poucos, a empresa perde confiança e oportunidades que poderiam virar uma boa conversa.',
      solution: 'Atendimento que lembra e acolhe.',
      solutionDetail: 'Uma rotina simples pode organizar o histórico e levar cada pedido para a pessoa certa.'
    },
    comercial: {
      hook: 'Quantas boas oportunidades se perdem por falta de retorno?',
      pain: 'Quando contato, proposta e acompanhamento ficam separados, a venda passa a depender da memória de alguém.',
      impact: 'O resultado é resposta atrasada, retorno esquecido e uma oportunidade que nem chega à reunião.',
      solution: 'Cada cliente com um próximo passo claro.',
      solutionDetail: 'Uma rotina organizada mostra o histórico, sinaliza prioridade e ajuda a equipe a não esquecer ninguém.'
    },
    governanca: {
      hook: 'Sua empresa consegue explicar como uma decisão foi tomada?',
      pain: 'Quando ninguém sabe quem conferiu cada etapa, a pressa pode virar problema em vez de ajudar.',
      impact: 'A dificuldade aparece quando é preciso entender um erro, corrigir algo ou dar uma resposta ao cliente.',
      solution: 'Velocidade com alguém no controle.',
      solutionDetail: 'Uma boa rotina deixa as regras claras, registra as etapas e mantém a conferência humana onde ela importa.'
    },
    dados: {
      hook: 'Sua equipe sabe onde encontrar a informação certa na hora certa?',
      pain: 'Quando os dados ficam espalhados, cada decisão vira busca, conferência e troca de mensagens.',
      impact: 'A resposta chega tarde e uma boa oportunidade pode passar.',
      solution: 'Informação pronta para decidir melhor.',
      solutionDetail: 'Uma rotina organizada junta o que importa e evita que a equipe procure tudo do zero.'
    },
    fluxos: {
      hook: 'Sua operação ainda depende de alguém lembrar o próximo passo?',
      pain: 'Quando tudo fica em mensagens, planilhas e lembretes, a equipe trabalha muito e mesmo assim algo acaba ficando para trás.',
      impact: 'O problema cresce em silêncio até virar retrabalho, cliente sem resposta e gente sobrecarregada.',
      solution: 'Um caminho claro para todo mundo.',
      solutionDetail: 'Uma rotina bem desenhada mostra o que fazer, quem cuida e quando é hora de avisar alguém.'
    },
    produtividade: {
      hook: 'Sua equipe vive ocupada, mas as tarefas importantes não andam?',
      pain: 'Quando a mesma informação é procurada, copiada e conferida todos os dias, falta tempo para vender, atender e pensar melhor.',
      impact: 'O custo não está só nas horas: está na oportunidade que para enquanto a equipe apaga incêndio.',
      solution: 'Menos correria. Mais tempo para o cliente.',
      solutionDetail: 'Uma rotina mais simples tira a repetição do caminho e devolve foco para atendimento, vendas e decisões importantes.'
    }
  };
  const selected = narratives[theme.key] || narratives.produtividade;
  const closingVariants = [
    {
      eyebrow: 'COMECE POR AQUI',
      title: 'Qual rotina merece ser simplificada primeiro?',
      cta: `Escolha o processo que mais se repete e vamos desenhar um primeiro teste. Eu ajudo empresas com ${humanOffer}. Me chame no Direct.`
    },
    {
      eyebrow: 'DIAGNÓSTICO RÁPIDO',
      title: 'Onde sua equipe mais perde tempo hoje?',
      cta: `Comece pelo ponto que mais atrasa uma resposta ou decisão. Posso ajudar a transformar esse gargalo em um fluxo simples. Me chame no Direct.`
    },
    {
      eyebrow: 'PRÓXIMO PASSO',
      title: 'Que processo você gostaria de organizar?',
      cta: `Mapeie uma entrada, um resultado esperado e quem confere as exceções. Se quiser estruturar esse começo, fale comigo no Direct.`
    },
    {
      eyebrow: 'TESTE PEQUENO',
      title: 'Quer transformar esse problema em um primeiro teste?',
      cta: `Escolha uma tarefa pequena, repetitiva e mensurável. Vamos avaliar juntos onde a IA pode ajudar com segurança. Me chame no Direct.`
    },
    {
      eyebrow: 'PONTO DE PARTIDA',
      title: 'Qual gargalo merece atenção agora?',
      cta: `Observe onde o cliente espera e a equipe procura informação. Esse pode ser o primeiro processo a melhorar. Fale comigo no Direct.`
    },
    {
      eyebrow: 'COMEÇO POSSÍVEL',
      title: 'Vamos escolher um começo possível?',
      cta: `Não precisa mudar tudo de uma vez. Uma rotina bem escolhida já permite medir tempo, qualidade e resultado. Me chame no Direct.`
    },
    {
      eyebrow: 'PARA SUA EMPRESA',
      title: 'Sua equipe enfrenta esse cenário?',
      cta: `Transforme o problema em um fluxo com regra, responsável e próximo passo. Eu posso ajudar nesse desenho. Fale comigo no Direct.`
    },
    {
      eyebrow: 'RESULTADO PRÁTICO',
      title: 'Qual seria o primeiro ganho para sua empresa?',
      cta: `Pode ser responder mais rápido, reduzir retrabalho ou acompanhar melhor cada oportunidade. Vamos mapear essa prioridade no Direct.`
    }
  ];
  const closingSeed = String(options.seed || `${theme.key}|${offer}|${audience}`);
  const closingIndex = Number.parseInt(createHash('sha256').update(closingSeed).digest('hex').slice(0, 8), 16) % closingVariants.length;
  const closing = closingVariants[closingIndex];
  return {
    ...selected,
    offer,
    audience,
    connection: 'Se você se reconheceu nisso, não é falta de esforço da equipe. Muitas vezes a rotina cresceu e o processo deixou de dar o apoio que as pessoas precisam.',
    clarity: 'O primeiro passo não é sair comprando ferramenta. É enxergar onde o tempo se perde, o cliente espera e a equipe fica sem uma resposta clara.',
    desire: 'A equipe encontra o que precisa, sabe o próximo passo e atende melhor.',
    trust: 'Comece pequeno: escolha uma rotina, combine o resultado esperado e acompanhe de perto. Assim a mudança acontece com segurança e sem promessas vazias.',
    ctaEyebrow: closing.eyebrow,
    ctaTitle: closing.title,
    cta: closing.cta
  };
}

export function buildResearchPack(item, now = new Date(), options = {}) {
  const theme = themeFor(`${item.title} ${item.summary}`);
  const news = localizedNews(item, theme);
  const business = businessNarrative(theme, { ...options, seed: item.url });
  const published = new Date(item.publishedAt);
  const dateLabel = Number.isNaN(published.getTime()) ? 'recentemente' : published.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const id = createHash('sha256').update(item.url).digest('hex').slice(0, 12);
  const niche = String(options.niche || '').trim();
  const customRadar = Boolean(niche && Array.isArray(options.keywords) && options.keywords.length);
  const withSourceAttachment = (slide) => ({
    ...slide,
    researchSource: item.source,
    researchTitle: item.title,
    researchDisplayTitle: news.title || item.title,
    researchUrl: item.url
  });
  if (customRadar) {
    // A notícia é uma referência, não uma cópia: o público deve ler uma explicação
    // simples em português, sem título técnico ou em inglês da fonte original.
    const articleFacts = Array.isArray(item.articleFacts) ? item.articleFacts.filter((fact) => fact && !isPredominantlyEnglish(fact)) : [];
    const sourceFacts = articleFacts.length >= 2 ? articleFacts : (news.facts.length >= 2 ? news.facts : [news.fact].filter(Boolean));
    const sourceSignal = compactFactualStatement(sourceFacts[0]);
    const sourceContinuation = sourceFacts[1] || '';
    const readableSourceSignal = sourceFacts.slice(0, 3).join('\n\n');
    const coverHook = news.title;
    const sourceTitleReference = isPredominantlyEnglish(item.title)
      ? 'Pauta original em inglês disponível no link.'
      : `Título original: ${item.title}`;
    const sourceReference = `Fonte consultada: ${item.source}\n${sourceTitleReference}\n${item.url}`;
    const firstComment = `Fonte consultada: ${item.source}\n${sourceTitleReference}\n${item.url}`;
    return {
      research: {
        id,
        source: item.source,
        sourceUrl: item.url,
        sourceTitle: item.title,
        sourceImageUrl: item.imageUrl || '',
        publishedAt: Number.isNaN(published.getTime()) ? null : published.toISOString(),
        researchedAt: now.toISOString(),
        theme: niche,
        sourceFact: news.fact,
        sourceFacts
      },
      // AIDA no carrossel: atenção, interesse, desejo e ação. O quarto slide
      // adiciona confiança para que o convite final não pareça uma promessa vazia.
      slides: [
        { eyebrow: `NOTÍCIA · ${item.source}`, title: coverHook, body: `Publicada em ${dateLabel}. O carrossel explica o contexto real da matéria.` },
        { eyebrow: 'O QUE A MATÉRIA DIZ', title: sourceSignal, body: `Fonte: ${item.source}. Fonte consultada e link completo na legenda.` },
        sourceContinuation
          ? { eyebrow: 'A MATÉRIA CONTINUA', title: compactFactualStatement(sourceContinuation), body: `Este é o segundo ponto factual apresentado pela ${item.source}.` }
          : { eyebrow: 'LEITURA PARA EMPRESAS', title: `Onde ${theme.label} pode entrar na rotina?`, body: `A conexão possível é ${theme.application}. Essa aplicação é uma análise editorial, não uma afirmação da matéria.` },
        { eyebrow: 'LEITURA PARA EMPRESAS', title: 'O que isso muda para quem usa IA?', body: `A conexão possível é ${theme.application}. Esta é uma análise editorial separada da notícia.` },
        { eyebrow: business.ctaEyebrow, title: business.ctaTitle, body: `${business.cta} O link completo está na legenda.` }
      ].map(withSourceAttachment),
      caption: `${coverHook}\n\nEntenda a matéria:\n${readableSourceSignal}\n\nPublicada em ${dateLabel}.\n\nLeitura para empresas:\nA conexão possível é ${theme.application}. Essa parte é uma análise editorial sobre aplicação prática, não uma afirmação atribuída à matéria.\n\n${business.cta}\n\n${sourceReference}`,
      firstComment
    };
  }
  return {
    research: {
      id,
      source: item.source,
      sourceUrl: item.url,
      sourceTitle: item.title,
      sourceImageUrl: item.imageUrl || '',
      publishedAt: Number.isNaN(published.getTime()) ? null : published.toISOString(),
      researchedAt: now.toISOString(),
      theme: theme.key,
      sourceFact: news.fact
    },
    slides: [
      { eyebrow: 'GESTÃO', title: business.hook, body: business.pain },
      { eyebrow: 'O CUSTO DO MANUAL', title: business.impact, body: `O sinal de mercado: ${news.fact}` },
      { eyebrow: 'AUTOMAÇÃO APLICADA', title: business.solution, body: `${business.solutionDetail} Na prática, a oportunidade é ${theme.application}.` },
      { eyebrow: 'COMEÇO CERTO', title: 'Processo antes da ferramenta.', body: 'Comece por uma rotina repetitiva, defina entrada, resultado esperado e quem confere as exceções.' },
      { eyebrow: business.ctaEyebrow, title: business.ctaTitle, body: business.cta }
    ].map(withSourceAttachment),
    caption: `${business.hook}\n\n${business.pain}\n\nA notícia da ${item.source} reforça esse cenário: ${news.fact}\n\nNa prática, uma empresa pode usar esse movimento para ${theme.application}. O melhor começo é um fluxo pequeno, uma meta mensurável e revisão humana.\n\n${business.cta}\n\nFonte oficial consultada: ${item.source}, ${dateLabel}.\n\n#automacao #inteligenciaartificial #gestao #processos #negocios #produtividade`
  };
}

export async function researchFreshEditorialPacks(options = {}) {
  const now = options.now || new Date();
  const fetchImpl = options.fetchImpl || fetch;
  const maxAgeDays = options.maxAgeDays || 21;
  const sources = normalizeEditorialSources(options.sources).length
    ? normalizeEditorialSources(options.sources)
    : EDITORIAL_SOURCES;
  const includeTerms = Array.isArray(options.keywords)
    ? options.keywords.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean).slice(0, 30)
    : [];
  const excludeTerms = Array.isArray(options.excludeKeywords)
    ? options.excludeKeywords.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean).slice(0, 30)
    : [];
  const minTime = now.getTime() - (maxAgeDays * 86400000);
  const results = await Promise.allSettled(sources.map(async (source) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || 9000);
    try {
      const response = await fetchImpl(source.url, { headers: { accept: 'application/rss+xml, application/atom+xml, text/xml' }, signal: controller.signal });
      if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
      const text = await response.text();
      return source.format === 'sitemap'
        ? parseEditorialSitemap(text, source)
        : parseEditorialFeed(text, source);
    } finally {
      clearTimeout(timer);
    }
  }));
  const failures = results.filter((result) => result.status === 'rejected').map((result) => result.reason?.message || String(result.reason));
  const seen = new Set();
  const itemsByRecency = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    .filter((item) => {
      const timestamp = Date.parse(item.publishedAt);
      const searchable = `${item.title} ${item.summary}`.toLowerCase();
      const titleSearchable = String(item.title || '').toLowerCase();
      const matchesNiche = includeTerms.length
        ? matchesConfiguredEditorialIntent(titleSearchable, includeTerms)
        : RELEVANT.test(searchable);
      const excluded = excludeTerms.some((term) => searchable.includes(term));
      return matchesNiche && !excluded && !IRRELEVANT.test(item.title) && Number.isFinite(timestamp) && timestamp >= minTime && timestamp <= now.getTime() + 86400000;
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((item) => {
      const key = item.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const items = rotateEditorialItemsBySource(itemsByRecency);
  const factualItems = items.filter((item) => Boolean(localizedNews(item, themeFor(`${item.title} ${item.summary}`)).fact));
  const candidates = factualItems.slice(0, options.limit || 13);
  const enrichedResults = await Promise.allSettled(candidates.map(async (item) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.articleTimeoutMs || 7000);
    try {
      const response = await fetchImpl(item.url, { headers: { accept: 'text/html', 'user-agent': 'Mozilla/5.0 Cliente-X-Radar/1.0' }, signal: controller.signal });
      if (!response.ok) return item;
      const articleHtml = await response.text();
      const articleFacts = extractArticleFacts(articleHtml, item);
      const imageUrl = item.imageUrl || extractEditorialImageUrl(articleHtml, item.url);
      return {
        ...item,
        ...(articleFacts.length >= 2 ? { articleFacts } : {}),
        ...(imageUrl ? { imageUrl } : {})
      };
    } finally {
      clearTimeout(timer);
    }
  }));
  const enrichedItems = enrichedResults.map((result, index) => result.status === 'fulfilled' ? result.value : candidates[index]);
  return { packs: enrichedItems.map((item) => buildResearchPack(item, now, options)), items: enrichedItems, failures, researchedAt: now.toISOString() };
}
