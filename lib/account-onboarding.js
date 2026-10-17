import { normalizeAccountKey } from './accounts.js';

function invalid(message) {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
}

export function instagramUsername(value = '') {
  let username = String(value).trim();
  if (!username) return '';
  if (/^https?:\/\//i.test(username)) {
    let url;
    try { url = new URL(username); } catch { invalid('Link do Instagram inválido.'); }
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname) || url.username || url.password) invalid('Informe um link HTTPS de perfil do Instagram.');
    if (!/^\/[a-z0-9._]+\/?$/i.test(url.pathname)) invalid('Envie o perfil, não um link de publicação.');
    username = url.pathname.replace(/^\/|\/$/g, '');
  }
  username = username.replace(/^@/, '').toLowerCase();
  if (!/^[a-z0-9_](?:[a-z0-9._]{0,28}[a-z0-9_])?$/i.test(username) || username.includes('..') || ['p', 'reel', 'reels', 'stories', 'explore', 'accounts', 'direct'].includes(username)) invalid('Nome de usuário do Instagram inválido.');
  return username;
}

export function secretPrefix(key) {
  return key.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export function onboardingIdentity(body = {}, accounts = []) {
  const expectedUsername = instagramUsername(body.expectedUsername);
  const rawKey = String(body.account || '').trim().toLowerCase() || expectedUsername.replace(/\./g, '-');
  if (!rawKey) invalid('Informe o Instagram ou a chave da conta.');
  const accountKey = normalizeAccountKey(rawKey);
  const envPrefix = secretPrefix(accountKey);
  if (accounts.some(a => a.account.toLowerCase() === accountKey)) invalid(`Conta ${accountKey} já existe.`);
  if (accounts.some(a => secretPrefix(a.account) === envPrefix || a.accessTokenEnv === `${envPrefix}_INSTAGRAM_ACCESS_TOKEN` || a.userIdEnv === `${envPrefix}_INSTAGRAM_USER_ID`)) invalid('Esta chave conflita com as credenciais de outra conta. Use uma chave diferente.');
  if (expectedUsername && accounts.some(a => String(a.expectedUsername || '').replace(/^@/, '').toLowerCase() === expectedUsername)) invalid('Este Instagram já está cadastrado. Selecione a conta existente.');
  const times = body.times === undefined ? [] : body.times;
  if (!Array.isArray(times) || times.length > 24 || times.some(t => typeof t !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) || new Set(times).size !== times.length) invalid('Informe até 24 horários diferentes em Brasília, no formato HH:MM.');
  const scheduleUtc = [...times].sort().map(t => { const [h, m] = t.split(':').map(Number); return `${m} ${(h + 3) % 24} * * *`; });
  return { accountKey, expectedUsername, envPrefix, scheduleUtc };
}

export function starterPacks(profile, brandName) {
  return [{
    slides: [
      { eyebrow: brandName, title: `Um espaço para falar de ${profile.niche}`, body: `Conteúdo pensado para ${profile.audience}.`, typographicOnly: true },
      { eyebrow: 'O que você encontra aqui', title: profile.offer, body: 'Informação, conversa e novos conteúdos por aqui.', typographicOnly: true },
      { eyebrow: 'Vamos conversar', title: 'O que você gostaria de aprender?', body: 'Conte nos comentários qual assunto você quer ver nas próximas publicações.', typographicOnly: true }
    ],
    caption: `${brandName}\n\nUm espaço sobre ${profile.niche}, pensado para ${profile.audience}.\n\nAqui você encontra ${profile.offer}.\n\nQue assunto você gostaria de ver por aqui?`
  }];
}
