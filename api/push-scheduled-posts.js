import { requireAdmin } from '../lib/auth.js';

export default function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  res.setHeader('cache-control', 'no-store');
  res.status(200).json({
    ok: true,
    message: 'No painel da Vercel, a agenda ja e enviada para o GitHub ao clicar em Agendar pack.'
  });
}
