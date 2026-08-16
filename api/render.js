import { requireAdmin } from '../lib/auth.js';

const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';

function validDate(value = '') {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value));
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  const date = String(req.body?.previewDate || '').trim();
  const slotIndex = Number(req.body?.slotIndex);
  const account = String(req.body?.account || 'cliente-x').trim();
  if (!validDate(date) || !Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 12) {
    res.status(400).json({ error: 'Informe uma data valida e um horario entre 0 e 12.' });
    return;
  }
  const token = String(process.env.GITHUB_TOKEN || '').trim();
  if (!token) {
    res.status(503).json({ error: 'GITHUB_TOKEN nao esta configurado para renderizar a previa real.' });
    return;
  }
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/instagram-render-preview.yml/dispatches`, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json'
    },
    body: JSON.stringify({ ref: 'main', inputs: { account, preview_date: date, slot_index: String(slotIndex) } })
  });
  if (!response.ok) {
    res.status(response.status).json({ error: `Nao consegui iniciar a renderizacao real: GitHub HTTP ${response.status}.` });
    return;
  }
  const base = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/docs/generated/previews/${encodeURIComponent(account)}/${date}/slot-${slotIndex}`;
  res.setHeader('cache-control', 'no-store');
  res.status(202).json({
    ok: true,
    pending: true,
    imageUrls: [1, 2, 3, 4, 5].map((index) => `${base}/slide-${String(index).padStart(2, '0')}.jpg`),
    message: 'Renderizacao oficial iniciada. O painel aguardara os JPGs do publicador.'
  });
}
