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
    title: 'AWS mostra como separar o custo da IA por equipe e projeto.',
    fact: 'A arquitetura usa dados de uso do Amazon Bedrock, Athena e painéis para dar visibilidade de consumo e custo por área.'
  },
  {
    pattern: /oneadvanced.*50 ai agents.*sovereign aws/i,
    title: 'Empresa britânica coloca mais de 50 agentes de IA em produção.',
    fact: 'A OneAdvanced implantou agentes em infraestrutura soberana da AWS, combinando escala, residência de dados e controle operacional.'
  },
  {
    pattern: /rpa vs.*workflow automation/i,
    title: 'n8n compara RPA e automação de fluxos que precisa durar.',
    fact: 'A análise diferencia robôs que repetem cliques de fluxos integrados por regras, dados e sistemas.'
  },
  {
    pattern: /n8n alternatives.*ai automation platform/i,
    title: 'A escolha da plataforma de automação virou decisão de arquitetura.',
    fact: 'A comparação destaca implantação, integração, governança e manutenção como critérios além do número de recursos.'
  },
  {
    pattern: /agentic workflows.*sagemaker.*agentcore/i,
    title: 'AWS conecta modelos e agentes em fluxos empresariais.',
    fact: 'O exemplo combina SageMaker AI e Bedrock AgentCore para coordenar tarefas, ferramentas e controles em produção.'
  },
  {
    pattern: /agent observability.*production workflows/i,
    title: 'Observabilidade virou requisito para agentes de IA em produção.',
    fact: 'O n8n destaca rastreamento, avaliação e análise de falhas para entender o que cada agente fez e por quê.'
  },
  {
    pattern: /token prices.*host your own llms/i,
    title: 'Hospedar modelos próprios muda a conta da automação com IA.',
    fact: 'A análise do n8n mostra que infraestrutura, utilização e operação pesam tanto quanto o preço nominal dos tokens.'
  },
  {
    pattern: /monitor on-premises.*multi-cloud ai agents.*observability/i,
    title: 'AWS leva monitoramento de agentes para ambientes locais e multicloud.',
    fact: 'A proposta centraliza rastros e métricas para acompanhar agentes executados fora de uma única nuvem.'
  },
  {
    pattern: /automate legacy web applications.*browser tool/i,
    title: 'Agentes de IA começam a operar sistemas antigos pelo navegador.',
    fact: 'A AWS demonstra automação de aplicações legadas com o Browser Tool do AgentCore, sem exigir uma API moderna em cada etapa.'
  },
  {
    pattern: /accelerating m&a due diligence.*agentcore/i,
    title: 'Agentes de IA aceleram análise de documentos em fusões e aquisições.',
    fact: 'O caso da AWS organiza pesquisa, leitura e revisão de grandes volumes de documentos para apoiar a análise prévia de negócios.'
  },
  {
    pattern: /amazon quick.*microsoft 365.*agentic ai/i,
    title: 'AWS leva agentes de IA para o trabalho dentro do Microsoft 365.',
    fact: 'A integração aproxima agentes das ferramentas que as equipes já usam, reduzindo a troca de contexto entre tarefas.'
  },
  {
    pattern: /builder.?s guide to gpt.?5\.6/i,
    title: 'OpenAI publica guia para criar aplicações empresariais com GPT-5.6.',
    fact: 'O guia orienta desenvolvedores sobre padrões de construção, uso de ferramentas e confiabilidade em aplicações com o novo modelo.'
  },
  {
    pattern: /previewing ultrafast mode.*14x/i,
    title: 'OpenAI apresenta modo de IA até 14 vezes mais rápido.',
    fact: 'O modo Ultrafast do GPT-5.6 Sol foi apresentado para fluxos em que baixa latência muda atendimento, análise e execução.'
  },
  {
    pattern: /introducing openai presence/i,
    title: 'OpenAI lança agentes de voz e chat para empresas.',
    fact: 'O Presence foi apresentado para atender, resolver solicitações, usar sistemas da empresa, executar ações aprovadas e encaminhar casos para pessoas.'
  },
  {
    pattern: /building abundant intelligence/i,
    title: 'OpenAI aposta em IA mais acessível para ampliar o uso nas empresas.',
    fact: 'A empresa relaciona ganhos de eficiência e redução de custos à adoção da IA em mais áreas da operação.'
  },
  {
    pattern: /samsung.*chatgpt.*codex/i,
    title: 'Samsung amplia ChatGPT e Codex para equipes globais.',
    fact: 'A implantação alcança desenvolvimento, marketing, produtos, manufatura e funções corporativas.'
  },
  {
    pattern: /mcp|model context protocol/i,
    title: 'Novo padrão MCP reforça integração e segurança para agentes de IA.',
    fact: 'A atualização destaca autorização reforçada, extensões governadas e conexões mais simples entre agentes e sistemas empresariais.'
  },
  {
    pattern: /market surveillance agent/i,
    title: 'AWS mostra um sistema multiagente para monitorar mercados.',
    fact: 'O exemplo combina memória, observabilidade e recuperação por checkpoints para manter o fluxo auditável.'
  },
  {
    pattern: /hp.*frontier/i,
    title: 'HP avança de projetos-piloto para IA em escala empresarial.',
    fact: 'A iniciativa conecta atendimento, informações operacionais, produtividade e desenvolvimento de software.'
  },
  {
    pattern: /dell.*codex/i,
    title: 'Dell e OpenAI aproximam o Codex dos dados internos das empresas.',
    fact: 'A proposta é levar agentes a ambientes híbridos e locais, com acesso governado a documentos, sistemas e conhecimento operacional.'
  },
  {
    pattern: /pwc|office of the cfo/i,
    title: 'OpenAI e PwC levam agentes de IA para rotinas financeiras.',
    fact: 'Os casos incluem pagamentos, contratos, previsões, relatórios e identificação de riscos com supervisão humana.'
  }
];

function localizedNews(item = {}, theme = {}) {
  const sourceText = `${item.title} ${item.summary}`;
  const match = NEWS_TRANSLATIONS.find((entry) => entry.pattern.test(sourceText));
  return match || {
    title: `${item.source} apresenta uma novidade sobre ${theme.label}.`,
    fact: `A atualização trata de ${String(item.title || theme.label).replace(/[.!?]+$/, '')} e abre uma discussão prática sobre processos empresariais.`
  };
}

export function buildResearchPack(item, now = new Date(), options = {}) {
  const theme = themeFor(`${item.title} ${item.summary}`);
  const news = localizedNews(item, theme);
  const published = new Date(item.publishedAt);
  const dateLabel = Number.isNaN(published.getTime()) ? 'recentemente' : published.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const id = createHash('sha256').update(item.url).digest('hex').slice(0, 12);
  const niche = String(options.niche || '').trim();
  const customRadar = Boolean(niche && Array.isArray(options.keywords) && options.keywords.length);
  if (customRadar) {
    const headline = String(item.title || `Atualização publicada por ${item.source}`).replace(/\s+/g, ' ').trim();
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
        { eyebrow: 'Notícia do setor', title: headline, body: `${item.source} publicou esta atualização em ${dateLabel}.` },
        { eyebrow: 'Por que importa', title: `O que observar em ${niche}.`, body: 'Use a novidade como ponto de partida para analisar impacto, oportunidade e limites antes de agir.' },
        { eyebrow: 'Aplicação prática', title: 'Traga o tema para a rotina da empresa.', body: 'Escolha uma dúvida, processo ou decisão real do público e explique o próximo passo com clareza.' },
        { eyebrow: 'Cuidados', title: 'Fonte, contexto e orientação responsável.', body: 'Confirme a informação original e evite promessas ou conclusões que não estejam na publicação oficial.' },
        { eyebrow: 'Próximo passo', title: options.offer || 'Converse com nossa equipe.', body: 'Salve este conteúdo e acompanhe o perfil para mais atualizações do setor.' }
      ],
      caption: `${headline}\n\n${item.source} publicou esta atualização em ${dateLabel}.\n\nPara quem atua com ${niche}, vale avaliar o contexto e transformar a informação em uma decisão prática para a rotina.\n\nFonte oficial: ${item.source}.\n\n${options.offer || 'Acompanhe o perfil para mais conteúdos do setor.'}`
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
      { eyebrow: 'Notícia recente', title: news.title, body: `${item.source} publicou a atualização em ${dateLabel}. ${news.fact}` },
      { eyebrow: 'O que muda', title: `A notícia coloca ${theme.label} mais perto da operação.`, body: `Para empresas, a oportunidade é ${theme.application}.` },
      { eyebrow: 'Aplicação prática', title: 'Escolha um processo real antes da ferramenta.', body: 'Comece por uma tarefa repetida, defina a entrada, a resposta esperada e quem faz a conferência.' },
      { eyebrow: 'Gestão', title: 'Escala exige acesso, registro e revisão humana.', body: 'Teste com poucos usuários, acompanhe erros e só amplie depois de medir o resultado.' },
      { eyebrow: 'Material gratuito', title: 'Comente IA para receber.', body: '🚀 50 PROMPTS DE IA GRÁTIS! Escreva IA nos comentários e confira o material no seu Direct.' }
    ],
    caption: `${news.title}\n\n${news.fact}\n\nNa prática, uma empresa pode usar esse movimento para ${theme.application}. O melhor começo é um fluxo pequeno, uma meta mensurável e revisão humana.\n\nFonte oficial consultada: ${item.source}, ${dateLabel}.\n\nComente IA para receber 🚀 50 PROMPTS DE IA GRÁTIS!\n\n#automacao #inteligenciaartificial #gestao #processos #negocios #produtividade`
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
