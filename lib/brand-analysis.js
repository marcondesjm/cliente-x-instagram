import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const STOP_WORDS = new Set([
  'a', 'ao', 'aos', 'as', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'entre',
  'essa', 'esse', 'esta', 'este', 'isso', 'mais', 'mas', 'na', 'nas', 'no', 'nos', 'o', 'os',
  'ou', 'para', 'pela', 'pelo', 'por', 'que', 'se', 'sem', 'sua', 'suas', 'seu', 'seus', 'um',
  'uma'
]);

function normalizeText(text = '') {
  return String(text)
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function clip(text = '', max = 520) {
  const value = normalizeText(text);
  if (value.length <= max) return value;
  return `${value.slice(0, max).replace(/\s+\S*$/, '')}...`;
}

function splitSentences(text = '') {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 24);
}

function keywordList(text = '') {
  const counts = new Map();
  const words = normalizeText(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/[a-z0-9]{4,}/g) || [];

  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 14)
    .map(([word]) => word);
}

export async function extractBrandDocumentText(bytes, mimeType) {
  if (mimeType === 'text/plain') {
    return normalizeText(Buffer.from(bytes).toString('utf8'));
  }

  if (mimeType === 'application/pdf') {
    const parsed = await pdfParse(Buffer.from(bytes));
    return normalizeText(parsed.text || '');
  }

  return '';
}

export function analyzeBrandDocumentText(text = '') {
  const normalized = normalizeText(text);
  const sentences = splitSentences(normalized);
  const signals = sentences.slice(0, 5).map((item) => clip(item, 180));
  return {
    version: 1,
    analyzedAt: new Date().toISOString(),
    sourceCharacters: normalized.length,
    summary: clip(sentences.slice(0, 3).join(' '), 520),
    keywords: keywordList(normalized),
    signals
  };
}

export async function analyzeBrandDocument(bytes, mimeType) {
  const text = await extractBrandDocumentText(bytes, mimeType);
  const analysis = analyzeBrandDocumentText(text);
  return {
    textPreview: clip(text, 1800),
    analysis
  };
}

export function buildBrandContext(account = {}) {
  const profile = account.contentProfile || {};
  const summary = account.brandSummary || {};
  const document = account.brandDocument || {};
  const analysis = document.analysis || {};
  const parts = [
    account.brandName,
    profile.niche,
    profile.audience,
    profile.offer,
    summary.description,
    summary.positioning,
    summary.differentiator,
    analysis.summary,
    Array.isArray(analysis.keywords) && analysis.keywords.length ? `Palavras-chave do documento: ${analysis.keywords.join(', ')}` : ''
  ].filter(Boolean);
  return clip(parts.join(' | '), 900);
}
