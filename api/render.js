import { requireAdmin } from './_auth.js';

export default function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  res.setHeader('cache-control', 'no-store');
  res.status(200).json({
    ok: true,
    stdout: 'A previa do slide e atualizada no painel. A renderizacao final em JPG acontece no GitHub Actions ao publicar.'
  });
}
