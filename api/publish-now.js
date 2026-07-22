import { requireAdmin } from './_auth.js';

const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';
const WORKFLOW = 'instagram-feed-cliente-x.yml';

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
  if (!token) throw new Error('GITHUB_TOKEN ausente na Vercel.');
  return token;
}

async function dispatchWorkflow(inputs) {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${githubToken()}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28'
    },
    body: JSON.stringify({ ref: 'main', inputs })
  });
  if (response.status !== 204) {
    const text = await response.text();
    throw new Error(`GitHub Actions HTTP ${response.status}: ${text}`);
  }
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const body = await readBody(req);
    const packJson = body.pack ? JSON.stringify(body.pack) : '';
    if (packJson.length > 60000) throw new Error('Pack muito grande para disparar pelo GitHub Actions.');

    await dispatchWorkflow({
      account: 'cliente-x',
      dry_run: 'false',
      slot_index: String(Number.isInteger(body.packIndex) ? body.packIndex : 0),
      publish_mode: body.mode === 'story-only' ? 'story-only' : 'feed-and-story',
      scheduled_only: 'false',
      pack_json: packJson
    });

    json(res, 200, {
      ok: true,
      message: 'Publicacao enviada para o GitHub Actions. A postagem deve aparecer em alguns minutos.'
    });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}
