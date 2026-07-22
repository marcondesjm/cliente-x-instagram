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
    stdout: 'A validacao completa roda automaticamente dentro do GitHub Actions ao publicar. Conteudos salvos pela Vercel tambem sao validados antes do commit.'
  });
}
