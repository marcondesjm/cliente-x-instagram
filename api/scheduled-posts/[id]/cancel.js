import { requireAdmin } from '../../_auth.js';

const OWNER = 'marcondesjm';
const REPO = 'cliente-x-instagram';
const ACCOUNT = 'cliente-x';
const FILE_PATH = 'automation/instagram-template/config/scheduled-posts.json';

function json(res, status, body) {
  res.setHeader('cache-control', 'no-store');
  res.status(status).json(body);
}

function githubToken() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  if (!token) throw new Error('GITHUB_TOKEN ausente na Vercel.');
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

async function readQueueFile() {
  const file = await githubJson(`contents/${FILE_PATH}?ref=main`);
  const content = Buffer.from(file.content, 'base64').toString('utf8');
  return { sha: file.sha, groups: JSON.parse(content.replace(/^\uFEFF/, '')) };
}

async function writeQueueFile(groups, sha) {
  await githubJson(`contents/${FILE_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'Cancel scheduled Instagram post',
      branch: 'main',
      sha,
      content: Buffer.from(`${JSON.stringify(groups, null, 2)}\n`, 'utf8').toString('base64')
    })
  });
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Metodo nao permitido.' });
    return;
  }

  try {
    const id = req.query.id;
    const { sha, groups } = await readQueueFile();
    const group = groups.find((item) => item.account === ACCOUNT);
    const post = group?.posts?.find((item) => item.id === id);
    if (!post) throw new Error('Post agendado nao encontrado.');
    if (post.status !== 'pending') throw new Error('Somente posts pendentes podem ser cancelados.');
    post.status = 'cancelled';
    post.cancelledAt = new Date().toISOString();
    await writeQueueFile(groups, sha);
    json(res, 200, { ok: true, scheduledPosts: group.posts, post });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}
