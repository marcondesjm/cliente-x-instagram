import { requireAdmin } from '../lib/auth.js';

const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';

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

function githubToken() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  if (!token) throw new Error('ImgBB atingiu o limite e GITHUB_TOKEN esta ausente para salvar a imagem no projeto.');
  return token;
}

async function githubJson(path, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${githubToken()}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`GitHub HTTP ${response.status}: ${payload.message || text}`);
  return payload;
}

function safeUploadName(value = 'imagem') {
  return String(value || 'imagem')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9._-]/gi, '-')
    .slice(0, 80) || 'imagem';
}

async function saveImageToGithub({ name, mime, base64 }) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
  };
  const fileName = `${Date.now()}-${safeUploadName(name)}${extensions[mime]}`;
  const filePath = `docs/uploads/dashboard/${fileName}`;
  await githubJson(`contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Upload dashboard image ${fileName}`,
      branch: 'main',
      content: base64
    })
  });
  return {
    imageUrl: `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${filePath}`,
    imagePath: `/${filePath}`,
    storage: 'github'
  };
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const body = await readBody(req);
    const match = String(body.dataUrl || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) throw new Error('Imagem invalida. Use JPG, PNG ou WEBP.');

    const key = process.env.IMGBB_API_KEY;
    if (!key) {
      json(res, 200, await saveImageToGithub({ name: body.name, mime: match[1], base64: match[2] }));
      return;
    }

    const form = new FormData();
    form.append('image', match[2]);
    form.append('name', String(body.name || 'instagram-slide').replace(/\.[^.]+$/, '').slice(0, 80));

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      body: form
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      const message = payload?.error?.message || `ImgBB HTTP ${response.status}`;
      if (/rate limit/i.test(message)) {
        json(res, 200, {
          ...(await saveImageToGithub({ name: body.name, mime: match[1], base64: match[2] })),
          warning: 'ImgBB atingiu o limite; imagem salva no projeto.'
        });
        return;
      }
      throw new Error(payload?.error?.message || `ImgBB HTTP ${response.status}`);
    }

    json(res, 200, { imageUrl: payload.data.url, storage: 'imgbb' });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}
