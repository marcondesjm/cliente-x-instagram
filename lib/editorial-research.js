import { createHash } from 'node:crypto';

export const EDITORIAL_SOURCES = [
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
  { name: 'AWS Machine Learning', url: 'https://aws.amazon.com/blogs/machine-learning/feed/' },
  { name: 'Microsoft Cloud', url: 'https://www.microsoft.com/en-us/microsoft-cloud/blog/feed/' },
  { name: 'Google Cloud', url: 'https://cloud.google.com/blog/products/ai-machine-learning/rss' },
  { name: 'Google DeepMind', url: 'https://deepmind.google/sitemap.xml', format: 'sitemap', pathPattern: /\/discover\/blog\// },
  { name: 'Anthropic Claude', url: 'https://www.anthropic.com/sitemap.xml', format: 'sitemap', pathPattern: /\/news\// },
  { name: 'NVIDIA AI', url: 'https://blogs.nvidia.com/blog/category/deep-learning/feed/' },
  { name: 'n8n', url: 'https://blog.n8n.io/rss/' }
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
      title: titleFromUrl(url),
      url,
      publishedAt: tag(block, ['lastmod']),
      summary: `Atualização oficial publicada por ${source.name}.`
    };
  }).filter((item) => item.title && item.url && (!source.pathPattern || source.pathPattern.test(item.url)));
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
  const audience = String(options.audience || 'gestores e donos de empresas').trim();
  const narratives = {
    agentes: {
      hook: 'Sua equipe ainda perde tempo procurando informação antes de agir?',
      pain: 'Quando cada pessoa precisa abrir sistemas, copiar dados e confirmar contexto, a operação fica lenta e o cliente sente.',
      impact: 'O atraso parece pequeno até virar retrabalho, resposta perdida e decisão tomada tarde.',
      solution: 'Contexto pronto antes da próxima ação.',
      solutionDetail: 'Um agente bem definido organiza contexto, consulta regras e prepara o próximo passo para a equipe.'
    },
    atendimento: {
      hook: 'Seu atendimento ainda começa do zero a cada conversa?',
      pain: 'Sem histórico, prioridade e próximo passo visíveis, a equipe responde mais devagar e o cliente repete tudo.',
      impact: 'A empresa perde tempo, confiança e oportunidades que poderiam avançar para uma conversa comercial.',
      solution: 'Atendimento com memória e prioridade.',
      solutionDetail: 'A automação pode organizar contexto e encaminhar a demanda certa para a pessoa certa.'
    },
    comercial: {
      hook: 'Quantos leads esfriam enquanto a equipe procura informação?',
      pain: 'Quando lead, proposta e acompanhamento ficam em lugares diferentes, a venda depende de memória e urgência.',
      impact: 'O resultado é retorno atrasado, follow-up esquecido e oportunidade que não chega à reunião.',
      solution: 'Lead, proposta e próximo passo conectados.',
      solutionDetail: 'Uma automação conecta o histórico do lead, sinaliza prioridade e prepara o próximo contato.'
    },
    governanca: {
      hook: 'Sua empresa automatiza sem saber quem conferiu cada decisão?',
      pain: 'Sem acesso definido, registro e revisão, um processo rápido pode criar risco em vez de ganho.',
      impact: 'O custo aparece quando ninguém consegue explicar o que aconteceu, corrigir a falha ou responsabilizar uma etapa.',
      solution: 'Regra, registro e revisão.',
      solutionDetail: 'Automação madura já nasce com regras, rastreabilidade e revisão humana nos pontos críticos.'
    },
    dados: {
      hook: 'Sua equipe decide com dados espalhados em várias telas?',
      pain: 'Quando a informação fica dispersa, cada decisão exige busca manual, conferência e troca de mensagens.',
      impact: 'A operação perde velocidade e o gestor recebe a resposta quando a oportunidade já passou.',
      solution: 'A informação certa antes da decisão.',
      solutionDetail: 'A automação conecta fontes, organiza contexto e entrega a informação certa antes da decisão.'
    },
    fluxos: {
      hook: 'Sua operação ainda depende de alguém lembrar o próximo passo?',
      pain: 'Tarefas repetitivas feitas por mensagens, planilhas e cobrança manual criam atraso e deixam exceções escondidas.',
      impact: 'O gargalo cresce em silêncio até virar retrabalho, cliente sem resposta e equipe sobrecarregada.',
      solution: 'Fluxo claro, sem depender de memória.',
      solutionDetail: 'Um fluxo automatizado conecta tarefas, responsáveis e avisos sem perder controle da operação.'
    },
    produtividade: {
      hook: 'Sua equipe está ocupada, mas a rotina continua manual?',
      pain: 'Quando a mesma informação é procurada, copiada e conferida todos os dias, sobra menos tempo para vender e decidir.',
      impact: 'O custo não está só nas horas: está na oportunidade que para enquanto a equipe apaga incêndio.',
      solution: 'Menos repetição. Mais decisão.',
      solutionDetail: 'A IA pode tirar repetição da rotina e devolver foco para atendimento, vendas e decisões importantes.'
    }
  };
  const selected = narratives[theme.key] || narratives.produtividade;
  return {
    ...selected,
    offer,
    audience,
    cta: `Quer mapear uma automação com retorno para sua empresa? Eu ajudo com ${offer}. Me chame no Direct.`
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
      slides: [
        { eyebrow: 'GARGALO DO NEGÓCIO', title: business.hook, body: business.pain },
        { eyebrow: 'O SINAL DO MERCADO', title: business.impact, body: `${item.source} mostra que ${readableSourceSignal} Publicado em ${dateLabel}.` },
        { eyebrow: 'AUTOMAÇÃO APLICADA', title: business.solution, body: `${business.solutionDetail} Para ${niche}, escolha uma rotina real, defina o resultado esperado e mantenha a conferência necessária.` },
        { eyebrow: 'COMEÇO CERTO', title: 'Processo antes da ferramenta.', body: 'Mapeie o que entra, quem decide, qual resposta deve sair e onde a equipe precisa intervir.' },
        { eyebrow: 'PRÓXIMO PASSO', title: 'Transforme uma dor recorrente em um sistema.', body: business.cta }
      ],
      caption: `${business.hook}\n\n${business.pain}\n\nA atualização oficial da ${item.source} mostra que ${readableSourceSignal}\n\nPara ${niche}, a notícia só vale quando vira melhoria de processo, atendimento, vendas ou operação.\n\n${business.cta}\n\nFonte oficial: ${item.source}, ${dateLabel}.`
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
      const matchesNiche = includeTerms.length
        ? includeTerms.some((term) => searchable.includes(term))
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
