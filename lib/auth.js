import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'cliente_x_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-session-secret';
}

function safeEqual(a = '', b = '') {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function sign(value) {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

function parseCookies(header = '') {
  return Object.fromEntries(
    String(header)
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        if (index === -1) return [part, ''];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

export function configuredAdminEmail() {
  return process.env.ADMIN_EMAIL || '';
}

export function hasAdminConfig() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

export function createSessionCookie(email) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${email}:${issuedAt}`;
  const token = `${payload}:${sign(payload)}`;
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function validateLogin(email, password) {
  if (!hasAdminConfig()) return false;
  return safeEqual(email, process.env.ADMIN_EMAIL) && safeEqual(password, process.env.ADMIN_PASSWORD);
}

export function getSession(req) {
  const cookie = parseCookies(req.headers.cookie || '')[COOKIE_NAME];
  if (!cookie) return null;

  const parts = cookie.split(':');
  if (parts.length !== 3) return null;
  const [email, issuedAtText, signature] = parts;
  const payload = `${email}:${issuedAtText}`;
  if (!safeEqual(signature, sign(payload))) return null;

  const issuedAt = Number(issuedAtText);
  if (!Number.isFinite(issuedAt)) return null;
  const age = Math.floor(Date.now() / 1000) - issuedAt;
  if (age < 0 || age > SESSION_TTL_SECONDS) return null;
  if (process.env.ADMIN_EMAIL && email !== process.env.ADMIN_EMAIL) return null;

  return { email, issuedAt };
}

export function requireAdmin(req, res) {
  const session = getSession(req);
  if (session) return session;

  res.setHeader('cache-control', 'no-store');
  res.status(401).json({ error: 'Login de admin necessario.' });
  return null;
}
