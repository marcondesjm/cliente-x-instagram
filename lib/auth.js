import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'cliente_x_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const OWNER_ROLE = 'owner';
const USER_ROLE = 'user';

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-session-secret';
}

function safeEqual(a = '', b = '') {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
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

function parseAdminUsers() {
  try {
    const users = JSON.parse(process.env.ADMIN_USERS_JSON || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function configuredUsers() {
  const users = [];
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    users.push({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: OWNER_ROLE,
      accounts: ['*'],
      disabled: false
    });
  }

  for (const user of parseAdminUsers()) {
    if (!user?.email || !user?.password) continue;
    users.push({
      email: String(user.email).trim(),
      password: String(user.password),
      role: user.role === OWNER_ROLE ? OWNER_ROLE : USER_ROLE,
      accounts: Array.isArray(user.accounts) ? user.accounts.map(String) : [],
      disabled: Boolean(user.disabled)
    });
  }

  return users;
}

export function publicUsers() {
  return configuredUsers().map((user) => ({
    email: user.email,
    role: user.role,
    accounts: user.accounts,
    disabled: user.disabled
  }));
}

function findUser(email) {
  const normalized = normalizeEmail(email);
  return configuredUsers().find((user) => safeEqual(normalizeEmail(user.email), normalized));
}

export function createSessionCookie(email) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${normalizeEmail(email)}:${issuedAt}`;
  const token = `${payload}:${sign(payload)}`;
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function validateLogin(email, password) {
  if (!hasAdminConfig()) return false;
  const user = findUser(normalizeEmail(email));
  return Boolean(user && !user.disabled && safeEqual(password, user.password));
}

export function getSession(req) {
  const cookie = parseCookies(req.headers.cookie || '')[COOKIE_NAME];
  if (!cookie) return null;

  const parts = cookie.split(':');
  if (parts.length !== 3) return null;
  const [email, issuedAtText, signature] = parts;
  const normalizedEmail = normalizeEmail(email);
  const payload = `${normalizedEmail}:${issuedAtText}`;
  if (!safeEqual(signature, sign(payload))) return null;

  const issuedAt = Number(issuedAtText);
  if (!Number.isFinite(issuedAt)) return null;
  const age = Math.floor(Date.now() / 1000) - issuedAt;
  if (age < 0 || age > SESSION_TTL_SECONDS) return null;
  const user = findUser(normalizedEmail);
  if (!user || user.disabled) return null;

  return {
    email: normalizedEmail,
    issuedAt,
    role: user.role,
    accounts: user.accounts
  };
}

export function requireAdmin(req, res) {
  const session = getSession(req);
  if (session) return session;

  res.setHeader('cache-control', 'no-store');
  res.status(401).json({ error: 'Login de admin necessario.' });
  return null;
}

export function isOwner(session) {
  return session?.role === OWNER_ROLE;
}

export function canAccessAccount(session, account) {
  if (!session) return false;
  if (isOwner(session)) return true;
  if (typeof account === 'object' && account) {
    if (account.ownerEmail && account.ownerEmail === session.email) return true;
    return session.accounts?.includes(account.account);
  }
  return session.accounts?.includes(account);
}

export function requireOwner(req, res) {
  const session = requireAdmin(req, res);
  if (!session) return null;
  if (isOwner(session)) return session;

  res.setHeader('cache-control', 'no-store');
  res.status(403).json({ error: 'Apenas o admin principal pode executar esta acao.' });
  return null;
}
