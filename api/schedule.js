import { requireAdmin } from './_auth.js';

export default function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  res.setHeader('cache-control', 'no-store');
  res.status(501).json({
    error: 'Salvar horarios pela Vercel ainda nao esta habilitado. Use Agendar pack ou Publicar agora para publicacoes manuais.'
  });
}
