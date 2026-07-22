import { createSessionCookie, validateLogin } from '../_auth.js';

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
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const body = await readBody(req);
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    if (!validateLogin(email, password)) {
      res.status(401).json({ error: 'Email ou senha invalidos.' });
      return;
    }

    res.setHeader('Set-Cookie', createSessionCookie(email));
    res.setHeader('cache-control', 'no-store');
    res.status(200).json({ ok: true, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
