/**
 * Cliente HTTP para a API Claude-SS (proxy)
 * Base URL: https://claude-ss.ia.br
 * Chave: kp_user_9gMrj-eeqoklSvqiw41PgD_466gD6Isl
 */

const CLAUDE_SS_BASE = 'https://claude-ss.ia.br';
const CLAUDE_SS_API_KEY = 'kp_user_9gMrj-eeqoklSvqiw41PgD_466gD6Isl';

const DEFAULT_MODEL = 'claude-fable-5-1';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Faz uma chamada para a API Claude-SS
 * @param {Object} params - Parâmetros da chamada
 * @param {string} params.model - Modelo Claude (opcional, padrão: claude-sonnet-4)
 * @param {Array} params.messages - Array de mensagens [{role: 'user'|'assistant', content: string}]
 * @param {number} params.maxTokens - Máximo de tokens (opcional)
 * @param {number} params.temperature - Temperatura (opcional, 0-1)
 * @param {Array} params.tools - Ferramentas disponíveis (opcional)
 * @param {Object} params.systemPrompt - Prompt de sistema (opcional)
 * @returns {Promise<Object>} Resposta da API
 */
export async function callClaudeSS(params = {}) {
 const {
  model = DEFAULT_MODEL,
  messages = [],
  maxTokens = DEFAULT_MAX_TOKENS,
  temperature = DEFAULT_TEMPERATURE,
  tools = undefined,
  systemPrompt = undefined
 } = params;

 if (!messages.length || !messages[messages.length - 1]?.content) {
  throw new Error('callClaudeSS: pelo menos uma mensagem com conteúdo é obrigatória');
 }

 const payload = {
  model,
  messages,
  max_tokens: maxTokens,
  temperature
 };

 if (systemPrompt) {
  payload.system = systemPrompt;
 }

 if (tools && Array.isArray(tools)) {
  payload.tools = tools;
 }

 const response = await fetch(`${CLAUDE_SS_BASE}/v1/messages`, {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
   'x-api-key': CLAUDE_SS_API_KEY,
   'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(60000) // 60s timeout
 });

 if (!response.ok) {
  const errorText = await response.text().catch(() => '');
  throw new Error(`Claude-SS API error ${response.status}: ${errorText || response.statusText}`);
 }

 const data = await response.json();
 return data;
}

/**
 * Gera conteúdo editorial usando Claude-SS
 * @param {Object} context - Contexto para geração de conteúdo
 * @param {string} context.niche - Nicho do conteúdo
 * @param {string} context.audience - Audiência alvo
 * @param {string} context.tone - Tom de voz
 * @param {string} context.topic - Tópico principal
 * @returns {Promise<Object>} Conteúdo gerado
 */
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

 const result = await callClaudeSS({
  messages: [
   { role: 'user', content: userMessage }
  ],
  systemPrompt,
  maxTokens: 2048,
  temperature: 0.8
 });

 return {
  content: result.content?.[0]?.text || '',
  usage: result.usage || {},
  model: result.model
 };
}

/**
 * Analisa performance de posts usando Claude-SS
 * @param {Object} metrics - Métricas de performance
 * @param {Array} metrics.posts - Posts com métricas
 * @returns {Promise<Object>} Insights e recomendações
 */
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

 const result = await callClaudeSS({
  messages: [
   { role: 'user', content: userMessage }
  ],
  systemPrompt,
  maxTokens: 4096,
  temperature: 0.5
 });

 return {
  analysis: result.content?.[0]?.text || '',
  usage: result.usage || {}
 };
}

/**
 * Classifica erros do watchdog usando Claude-SS
 * @param {Object} error - Erro detectado
 * @param {string} error.message - Mensagem de erro
 * @param {string} error.stage - Estágio onde ocorreu
 * @returns {Promise<Object>} Classificação e resolução sugerida
 */
export async function classifyWatchdogError(error = {}) {
 const systemPrompt = `Você é um especialista em debugging de workflows de automação.
Classifique erros por severidade e sugira ações corretivas específicas.`;

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

 const result = await callClaudeSS({
  messages: [
   { role: 'user', content: userMessage }
  ],
  systemPrompt,
  maxTokens: 1024,
  temperature: 0.3
 });

 try {
  const jsonMatch = result.content?.[0]?.text?.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
   return {
    classification: JSON.parse(jsonMatch[0]),
    usage: result.usage || {}
   };
  }
 } catch (e) {
  // fallback
 }

 return {
  classification: {
   severity: 'medium',
   category: 'other',
   action: 'manual_review',
   reasoning: 'Não foi possível classificar automaticamente'
  },
  usage: result.usage || {}
 };
}

export default {
 callClaudeSS,
 generateEditorialContent,
 analyzePerformance,
 classifyWatchdogError
};