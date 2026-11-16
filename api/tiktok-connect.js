import { randomBytes, timingSafeEqual } from 'node:crypto';
import { getSession, isOwner } from '../lib/auth.js';
import { sealPinterest, openPinterest } from '../lib/pinterest-api.js';

const defaultRedirect = 'https://cliente-x-instagram.vercel.app/api/tiktok-connect';
const stateCookie = '__Host-cliente_x_tiktok_sandbox_state';
const stateLifetime = 600;

function cookie(value, maxAge) {
  return `${stateCookie}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function stateMatches(expected, received) {
  if (typeof expected !== 'string' || typeof received !== 'string') return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(received);
  return left.length === right.length && timingSafeEqual(left, right);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const session = getSession(req);
  if (!isOwner(session)) {
    return res.status(session ? 403 : 401).json({ error: 'Entre como administrador do Cliente X.' });
  }

  const key = process.env.TIKTOK_SANDBOX_CLIENT_KEY?.trim();
  const secret = process.env.TIKTOK_SANDBOX_CLIENT_SECRET?.trim();
  const cookieKey = process.env.ADMIN_SESSION_SECRET;
  const redirectUri = process.env.TIKTOK_SANDBOX_REDIRECT_URI?.trim() || defaultRedirect;
  if (!key || !secret || !cookieKey || cookieKey.length < 32) {
    return res.status(503).json({ error: 'O sandbox do TikTok ainda não está configurado.' });
  }

  const { start, code, state, error } = req.query || {};
  if (start === '1' && !code && !state && !error) {
    const nonce = randomBytes(32).toString('base64url');
    const payload = { nonce, email: session.email, expiresAt: Date.now() + stateLifetime * 1000 };
    res.setHeader('Set-Cookie', cookie(sealPinterest(payload, cookieKey), stateLifetime));
    const authorization = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authorization.search = new URLSearchParams({
      client_key: key,
      response_type: 'code',
      scope: 'user.info.basic,video.publish',
      redirect_uri: redirectUri,
      state: nonce,
    }).toString();
    return res.redirect(303, authorization.toString());
  }

  const rawCookie = String(req.headers.cookie || '').split(';').map(part => part.trim())
    .find(part => part.startsWith(stateCookie + '='))?.slice(stateCookie.length + 1);
  const saved = rawCookie && openPinterest(rawCookie, cookieKey);
  if (!saved || saved.email !== session.email || saved.expiresAt <= Date.now() ||
      !stateMatches(saved.nonce, state)) {
    return res.status(400).json({ error: 'Sessão de autorização inválida ou expirada. Inicie a conexão novamente.' });
  }
  res.setHeader('Set-Cookie', cookie('', 0));
  if (error || typeof code !== 'string' || !code) {
    return res.status(400).json({ error: 'A autorização do TikTok não foi concluída.' });
  }

  try {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: key,
        client_secret: secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.access_token || !result.open_id) {
      return res.status(502).json({ error: 'O TikTok não confirmou a autorização.' });
    }
    const scopes = String(result.scope || '').split(',').map(scope => scope.trim());
    return res.json({ authorized: true, canPublish: scopes.includes('video.publish'), sandbox: true });
  } catch {
    return res.status(502).json({ error: 'Não foi possível concluir a conexão com o TikTok.' });
  }
}
