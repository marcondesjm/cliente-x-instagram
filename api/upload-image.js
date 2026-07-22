function json(res, status, body) {
  res.setHeader('cache-control', 'no-store');
  res.status(status).json(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const key = process.env.IMGBB_API_KEY;
    if (!key) throw new Error('IMGBB_API_KEY ausente na Vercel.');

    const body = await readBody(req);
    const match = String(body.dataUrl || '').match(/^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) throw new Error('Imagem invalida. Use JPG, PNG ou WEBP.');

    const form = new FormData();
    form.append('image', match[1]);
    form.append('name', String(body.name || 'instagram-slide').replace(/\.[^.]+$/, '').slice(0, 80));

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      body: form
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message || `ImgBB HTTP ${response.status}`);
    }

    json(res, 200, { imageUrl: payload.data.url });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}
