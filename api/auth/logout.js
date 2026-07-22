import { clearSessionCookie } from '../_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  res.setHeader('Set-Cookie', clearSessionCookie());
  res.setHeader('cache-control', 'no-store');
  res.status(200).json({ ok: true });
}
