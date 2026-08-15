import { createHash } from 'node:crypto';

export const EDITORIAL_SOURCES = [
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
  { name: 'AWS Machine Learning', url: 'https://aws.amazon.com/blogs/machine-learning/feed/' },
  { name: 'Microsoft Cloud', url: 'https://www.microsoft.com/en-us/microsoft-cloud/blog/feed/' },
  { name: 'Google Cloud', url: 'https://cloud.google.com/blog/products/ai-machine-learning/rss' },
  { name: 'n8n', url: 'https://blog.n8n.io/rss/' }
];

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

function themeFor(text = '') {
  if (/agent|copilot/i.test(text)) return { key: 'agentes', label: 'agentes de IA', application: 'executar etapas, consultar dados e encaminhar decisões com supervisão' };
  if (/customer|service|support|contact center/i.test(text)) return { key: 'atendimento', label: 'atendimento inteligente', application: 'organizar solicitações, contexto e próximos passos antes da resposta humana' };
  if (/sales|marketing|commerce|revenue/i.test(text)) return { key: 'comercial', label: 'automação comercial', application: 'proteger o contexto entre lead, proposta e acompanhamento' };
  if (/security|governance|privacy|risk/i.test(text)) return { key: 'governanca', label: 'governança da automação', application: 'definir acesso, revisão humana e rastreabilidade antes de escalar' };
  if (/data|analytics|document|knowledge|search/i.test(text)) return { key: 'dados', label: 'dados conectados à operação', application: 'transformar informação dispersa em consulta e ação prática' };
  if (/workflow|automation|integrat|process|operation/i.test(text)) return { key: 'fluxos', label: 'fluxos automatizados', application: 'conectar tarefas repetitivas sem perder os pontos de controle' };
  return { key: 'produtividade', label: 'IA aplicada à produtividade', application: 'reduzir trabalho repetitivo e devolver foco às decisões importantes' };
}

export function buildResearchPack(item, now = new Date()) {
  const theme = themeFor(`${item.title} ${item.summary}`);
  const published = new Date(item.publishedAt);
  const dateLabel = Number.isNaN(published.getTime()) ? 'recentemente' : published.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const id = createHash('sha256').update(item.url).digest('hex').slice(0, 12);
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
      { eyebrow: 'Radar de automação', title: `${theme.label} ganhou um novo sinal de mercado.`, body: `${item.source} publicou uma atualização em ${dateLabel}. O valor está em resolver um gargalo real.` },
      { eyebrow: 'Leitura prática', title: 'Novidade só vale quando melhora o processo.', body: 'Processo claro vem antes da ferramenta.' },
      { eyebrow: 'Aplicação', title: 'Escolha uma tarefa pequena e mensurável.', body: 'Defina entrada, resultado, revisão humana e um indicador.' },
      { eyebrow: 'Critério', title: 'Automatizar não significa abandonar o controle.', body: 'O controle continua humano.' },
      { eyebrow: 'Próximo passo', title: 'Qual processo da sua empresa merece esse teste?', body: `Use este radar para revisar uma rotina ligada a ${theme.label}. Um bom piloto entrega evidência antes de exigir uma grande mudança.` }
    ],
    caption: `Uma novidade recente sobre ${theme.label} chamou atenção no nosso radar editorial.\n\nO aprendizado mais importante para uma empresa não é correr atrás de toda ferramenta. É identificar onde a tecnologia pode ${theme.application}.\n\nComece com um fluxo pequeno, uma meta mensurável e revisão humana. Se funcionar, amplie com critério.\n\nReferência consultada: ${item.source}, ${dateLabel}. Conteúdo original e análise prática.\n\n#automacao #inteligenciaartificial #gestao #processos #negocios #produtividade`
  };
}

export async function researchFreshEditorialPacks(options = {}) {
  const now = options.now || new Date();
  const fetchImpl = options.fetchImpl || fetch;
  const maxAgeDays = options.maxAgeDays || 21;
  const minTime = now.getTime() - (maxAgeDays * 86400000);
  const results = await Promise.allSettled(EDITORIAL_SOURCES.map(async (source) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || 9000);
    try {
      const response = await fetchImpl(source.url, { headers: { accept: 'application/rss+xml, application/atom+xml, text/xml' }, signal: controller.signal });
      if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
      return parseEditorialFeed(await response.text(), source);
    } finally {
      clearTimeout(timer);
    }
  }));
  const failures = results.filter((result) => result.status === 'rejected').map((result) => result.reason?.message || String(result.reason));
  const seen = new Set();
  const items = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    .filter((item) => {
      const timestamp = Date.parse(item.publishedAt);
      return RELEVANT.test(`${item.title} ${item.summary}`) && !IRRELEVANT.test(item.title) && Number.isFinite(timestamp) && timestamp >= minTime && timestamp <= now.getTime() + 86400000;
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((item) => {
      const key = `${item.source}|${themeFor(`${item.title} ${item.summary}`).key}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return { packs: items.slice(0, options.limit || 8).map((item) => buildResearchPack(item, now)), items, failures, researchedAt: now.toISOString() };
}
