import { requireAdmin } from '../lib/auth.js';

function json(res, status, body) {
  res.setHeader('cache-control', 'no-store');
  res.status(status).json(body);
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'GET') {
    json(res, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const rawUrl = String(req.query?.url || '').trim();
    const url = new URL(rawUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('URL de imagem invalida.');
    }

    const response = await fetch(url.href);
    if (!response.ok) throw new Error(`Imagem HTTP ${response.status}`);

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.toLowerCase().startsWith('image/')) {
      throw new Error('URL informada nao retornou uma imagem.');
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    res.setHeader('cache-control', 'public, max-age=900');
    res.setHeader('content-type', contentType);
    res.status(200).send(bytes);
  } catch (error) {
    json(res, 400, { error: error.message });
  }
}
