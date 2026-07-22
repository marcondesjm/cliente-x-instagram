import { requireAdmin } from '../_auth.js';

const SECRET_KEYS = [
  'GITHUB_TOKEN',
  'CLIENTE_X_INSTAGRAM_ACCESS_TOKEN',
  'CLIENTE_X_INSTAGRAM_USER_ID',
  'IMGBB_API_KEY',
  'ADMIN_EMAIL'
];

function mask(value = '') {
  const text = String(value || '');
  if (!text) return '';
  if (text.length <= 10) return `${text.slice(0, 2)}...${text.slice(-2)}`;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

function secretStatus(key) {
  const value = process.env[key] || '';
  return {
    key,
    configured: Boolean(value),
    masked: mask(value),
    length: value.length
  };
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  res.setHeader('cache-control', 'no-store');
  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      secrets: SECRET_KEYS.map(secretStatus),
      canEditHere: false,
      message: 'Valores completos nao sao exibidos. Para trocar, atualize as variaveis no Vercel Production e redeploye.'
    });
    return;
  }

  if (req.method === 'POST') {
    res.status(501).json({
      error: 'Troca direta pelo painel exige VERCEL_API_TOKEN. Atualize no Vercel Production ou adicione esse token administrativo com cuidado.'
    });
    return;
  }

  res.status(405).json({ error: 'Metodo nao permitido.' });
}
