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
  { name: 'TecMundo', url: 'https://www.tecmundo.com.br/news-sitemap.xml', format: 'sitemap' }
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
  }).filter(Boolean).slice(0, 12);
}

const RELEVANT = /\b(ai|artificial intelligence|automation|automate|agent|workflow|machine learning|customer|business|enterprise|productivity|operations|sales|service|data)\b/i;
const IRRELEVANT = /\b(appoints?|appointment|chief revenue officer|earnings|quarterly results|award|event recap|podcast)\b/i;

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

export function parseEditorialFeed(xml, source) {
  const blocks = String(xml).match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) || [];
  return blocks.map((block) => ({
    source: source.name,
    sourceFeed: source.url,
    title: tag(block, ['title']),
    url: itemLink(block),
    publishedAt: tag(block, ['pubDate', 'published', 'updated']),
    summary: tag(block, ['description', 'summary', 'content'])
  })).filter((item) => item.title && item.url);
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
    fact: 'É importante registrar o que a IA fez, conferir erros e entender por que cada decisão foi tomada.'
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
  return match || {
    title: `${item.source} apresenta uma novidade sobre ${theme.label}.`,
    fact: 'A atualização aponta uma oportunidade de revisar como processos, dados e atendimento podem funcionar de forma mais integrada.'
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
  return {
    ...selected,
    offer,
    audience,
    connection: 'Se você se reconheceu nisso, não é falta de esforço da equipe. Muitas vezes a rotina cresceu e o processo deixou de dar o apoio que as pessoas precisam.',
    clarity: 'O primeiro passo não é sair comprando ferramenta. É enxergar onde o tempo se perde, o cliente espera e a equipe fica sem uma resposta clara.',
    desire: 'A equipe encontra o que precisa, sabe o próximo passo e atende melhor.',
    trust: 'Comece pequeno: escolha uma rotina, combine o resultado esperado e acompanhe de perto. Assim a mudança acontece com segurança e sem promessas vazias.',
    cta: `Se isso acontece na sua empresa, podemos olhar para a rotina juntos. Eu ajudo empresas com ${humanOffer}, começando pelo que hoje mais pesa para a equipe. Me chame no Direct.`
  };
}

export function buildResearchPack(item, now = new Date(), options = {}) {
  const theme = themeFor(`${item.title} ${item.summary}`);
  const news = localizedNews(item, theme);
  const business = businessNarrative(theme, options);
  const published = new Date(item.publishedAt);
  const dateLabel = Number.isNaN(published.getTime()) ? 'recentemente' : published.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const id = createHash('sha256').update(item.url).digest('hex').slice(0, 12);
  const niche = String(options.niche || '').trim();
  const customRadar = Boolean(niche && Array.isArray(options.keywords) && options.keywords.length);
  if (customRadar) {
    // A notícia é uma referência, não uma cópia: o público deve ler uma explicação
    // simples em português, sem título técnico ou em inglês da fonte original.
    const sourceSignal = String(news.fact || 'A atualização reforça a importância de processos claros e integrados.').trim();
    const readableSourceSignal = sourceSignal
      ? `${sourceSignal.charAt(0).toLocaleLowerCase('pt-BR')}${sourceSignal.slice(1)}`
      : 'a atualização reforça a importância de processos claros e integrados.';
    const coverHooks = [
      business.hook,
      'O problema não é sua equipe. É o caminho até a resposta.',
      'Quando a informação demora, o cliente sente.',
      'Sua empresa cresceu. A rotina precisa acompanhar.'
    ];
    const coverHook = coverHooks[Number.parseInt(id.slice(-2), 16) % coverHooks.length];
    return {
      research: {
        id,
        source: item.source,
        sourceUrl: item.url,
        sourceTitle: item.title,
        publishedAt: Number.isNaN(published.getTime()) ? null : published.toISOString(),
        researchedAt: now.toISOString(),
        theme: niche
      },
      // AIDA no carrossel: atenção, interesse, desejo e ação. O quarto slide
      // adiciona confiança para que o convite final não pareça uma promessa vazia.
      slides: [
        { eyebrow: 'ISSO ACONTECE AÍ?', title: coverHook, body: `${business.pain} ${business.connection}` },
        { eyebrow: 'POR QUE ISSO IMPORTA', title: business.impact, body: `${item.source} mostra que ${readableSourceSignal} Publicado em ${dateLabel}.` },
        { eyebrow: 'O QUE PODE MUDAR', title: business.solution, body: business.desire },
        { eyebrow: 'COM SEGURANÇA', title: 'Mudança boa não assusta a equipe.', body: business.trust },
        { eyebrow: 'PRÓXIMO PASSO', title: 'Você não precisa resolver tudo sozinho.', body: business.cta }
      ],
      caption: `${coverHook}\n\n${business.pain}\n\n${business.connection}\n\nA atualização oficial da ${item.source} mostra que ${readableSourceSignal}\n\nNo fim, notícia boa é a que ajuda sua empresa a atender melhor, vender com mais cuidado e trabalhar com menos correria. ${business.clarity}\n\n${business.desire}\n\n${business.trust}\n\n${business.cta}\n\nFonte oficial: ${item.source}, ${dateLabel}.`
    };
  }
  return {
    research: {
      id,
      source: item.source,
      sourceUrl: item.url,
      sourceTitle: item.title,
      publishedAt: Number.isNaN(published.getTime()) ? null : published.toISOString(),
      researchedAt: now.toISOString(),
      theme: theme.key
    },
    slides: [
      { eyebrow: 'GESTÃO', title: business.hook, body: business.pain },
      { eyebrow: 'O CUSTO DO MANUAL', title: business.impact, body: `O sinal de mercado: ${news.fact}` },
      { eyebrow: 'AUTOMAÇÃO APLICADA', title: business.solution, body: `${business.solutionDetail} Na prática, a oportunidade é ${theme.application}.` },
      { eyebrow: 'COMEÇO CERTO', title: 'Processo antes da ferramenta.', body: 'Comece por uma rotina repetitiva, defina entrada, resultado esperado e quem confere as exceções.' },
      { eyebrow: 'PRÓXIMO PASSO', title: 'Quer encontrar o primeiro ganho de automação?', body: business.cta }
    ],
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
  const items = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    .filter((item) => {
      const timestamp = Date.parse(item.publishedAt);
      const searchable = `${item.title} ${item.summary}`.toLowerCase();
      const titleSearchable = String(item.title || '').toLowerCase();
      const matchesNiche = includeTerms.length
        ? includeTerms.some((term) => includesEditorialTerm(titleSearchable, term))
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
  return { packs: items.slice(0, options.limit || 13).map((item) => buildResearchPack(item, now, options)), items, failures, researchedAt: now.toISOString() };
}
