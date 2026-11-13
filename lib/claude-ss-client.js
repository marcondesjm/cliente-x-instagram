/**
 * Cliente HTTP para o Claude Gateway (proxy Anthropic).
 * A credencial deve existir apenas em CLAUDE_SS_API_KEY no ambiente do servidor.
 */
const CLAUDE_SS_BASE = (process.env.CLAUDE_SS_BASE_URL || 'https://claude-ss.ia.br').replace(/\/+$/, '');
const DEFAULT_MODEL = process.env.CLAUDE_SS_MODEL || 'claude-fable-5-1';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;
const RETRYABLE_STATUSES = new Set([529, 503, 502, 504]);

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function callClaudeSS(params = {}) {
 const {
  model = DEFAULT_MODEL, messages = [], maxTokens = DEFAULT_MAX_TOKENS,
  temperature = DEFAULT_TEMPERATURE, tools, systemPrompt,
  fetchImpl = fetch, sleep = wait, maxRetries = 3
 } = params;
 const apiKey = process.env.CLAUDE_SS_API_KEY;
 if (!apiKey) throw new Error('CLAUDE_SS_API_KEY ausente. Configure a credencial nos secrets da Vercel/GitHub Actions.');
 if (!Array.isArray(messages) || !messages.length || !messages[messages.length - 1]?.content) {
  throw new Error('callClaudeSS: pelo menos uma mensagem com conteúdo é obrigatória');
 }
 const payload = { model, messages, max_tokens: maxTokens, temperature };
 if (systemPrompt) payload.system = systemPrompt;
 if (Array.isArray(tools)) payload.tools = tools;

 let lastError;
 for (let attempt = 0; attempt <= maxRetries; attempt++) {
  let response;
  try {
   response = await fetchImpl(`${CLAUDE_SS_BASE}/v1/messages`, {
    method: 'POST', redirect: 'error',
    headers: {
     'Content-Type': 'application/json',
     'x-api-key': apiKey,
     'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60000)
   });
  } catch (error) {
   lastError = error;
   if (attempt >= maxRetries) throw new Error(`Claude Gateway: falha de rede após ${attempt + 1} tentativa(s): ${error.message}`);
   await sleep(Math.min(8000, 1000 * (2 ** attempt)));
   continue;
  }
  if (response.ok) return await response.json();

  const errorText = await response.text().catch(() => '');
  const retryable = RETRYABLE_STATUSES.has(response.status);
  const retryAfter = Number(response.headers?.get?.('retry-after'));
  lastError = new Error(`Claude Gateway HTTP ${response.status}: ${errorText.slice(0, 1200) || response.statusText}`);
  lastError.status = response.status;
  if (!retryable || attempt >= maxRetries) throw lastError;
  const delay = Number.isFinite(retryAfter) && retryAfter > 0
   ? Math.min(30000, retryAfter * 1000)
   : Math.min(8000, 1000 * (2 ** attempt));
  await sleep(delay);
 }
 throw lastError || new Error('Claude Gateway: falha não identificada.');
}

export async function generateEditorialContent(context = {}) {
 const { niche, audience, tone, topic } = context;
 const systemPrompt = `Você é um especialista em criação de conteúdo para redes sociais focado em ${niche || 'negócios'}.
Seu público-alvo é: ${audience || 'empreendedores e donos de negócios'}.
Mantenha um tom ${tone || 'consultivo e educativo'}.
Nunca prometa resultados garantidos. Use linguagem clara e prática.`;
 const userMessage = `Crie um post educativo sobre: ${topic || 'automação com IA para negócios'}

Requisitos:
- Título chamativo (máx 72 caracteres)
- Legenda entre 300-600 caracteres
- Inclua uma pergunta para engajamento
- Estrutura: problema → solução prática → convite à ação`;
 const result = await callClaudeSS({ messages: [{ role: 'user', content: userMessage }], systemPrompt, maxTokens: 2048, temperature: 0.8 });
 return { content: result.content?.[0]?.text || '', usage: result.usage || {}, model: result.model };
}

export async function analyzePerformance(metrics = {}) {
 const systemPrompt = `Você é um analista de dados especializado em métricas de redes sociais.
Analise os dados fornecidos e identifique padrões, tendências e oportunidades de melhoria.
Seja específico e acionável nas recomendações.`;
 const userMessage = `Analise estas métricas de performance e sugira melhorias:

${JSON.stringify(metrics, null, 2)}

Forneça:
1. Top 3 insights sobre o que está funcionando
2. Top 3 problemas identificados
3. Recomendações práticas para os próximos 7 dias`;
 const result = await callClaudeSS({ messages: [{ role: 'user', content: userMessage }], systemPrompt, maxTokens: 4096, temperature: 0.5 });
 return { analysis: result.content?.[0]?.text || '', usage: result.usage || {} };
}

export async function classifyWatchdogError(error = {}) {
 const systemPrompt = 'Você é um especialista em debugging de workflows de automação. Classifique erros por severidade e sugira ações corretivas específicas.';
 const userMessage = `Classifique este erro de workflow:

Erro: ${error.message || 'desconhecido'}
Estágio: ${error.stage || 'desconhecido'}

Retorne em JSON:
{
 "severity": "low" | "medium" | "high",
 "category": "network" | "auth" | "content" | "config" | "other",
 "action": "retry" | "fix_config" | "manual_review" | "ignore",
 "reasoning": "explicação breve"
}`;
 const result = await callClaudeSS({ messages: [{ role: 'user', content: userMessage }], systemPrompt, maxTokens: 1024, temperature: 0.3 });
 try {
  const jsonMatch = result.content?.[0]?.text?.match(/\{[\s\S]*\}/);
  if (jsonMatch) return { classification: JSON.parse(jsonMatch[0]), usage: result.usage || {} };
 } catch {}
 return { classification: { severity: 'medium', category: 'other', action: 'manual_review', reasoning: 'Não foi possível classificar automaticamente' }, usage: result.usage || {} };
}

export default { callClaudeSS, generateEditorialContent, analyzePerformance, classifyWatchdogError };
