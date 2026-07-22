import { canAccessAccount, requireAdmin } from '../lib/auth.js';
import { accountFromBody } from '../lib/accounts.js';

const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';
const WORKFLOW = 'instagram-feed-cliente-x.yml';

function json(res, status, body) {
  res.setHeader('cache-control', 'no-store');
  res.status(status).json(body);
}

function githubToken() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  if (!token) throw new Error('GITHUB_TOKEN ausente na Vercel.');
  return token;
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
  const session = requireAdmin(req, res);
  if (!session) return;

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const body = await readBody(req);
    const account = accountFromBody(body);
    if (!canAccessAccount(session, account)) {
      json(res, 403, { error: 'Seu usuario nao tem acesso a esta conta.' });
      return;
    }
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
      method: 'POST',
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${githubToken()}`,
        'content-type': 'application/json',
        'x-github-api-version': '2022-11-28'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          account,
          dry_run: 'false',
          slot_index: '0',
          publish_mode: 'feed-and-story',
          scheduled_only: 'true',
          pack_json: ''
        }
      })
    });
    if (response.status !== 204) {
      const text = await response.text();
      throw new Error(`GitHub Actions HTTP ${response.status}: ${text}`);
    }
    json(res, 200, { ok: true, message: 'Fila enviada para o GitHub Actions.' });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}
