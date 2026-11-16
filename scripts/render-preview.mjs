import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import stateHandler from '../api/state.js';

const root = fileURLToPath(new URL('../docs/', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function credentials(req) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > 8192) throw new RangeError('Solicitação muito grande.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function handleState(req, res, url) {
  res.setHeader('Cache-Control', 'no-store');
  const query = Object.fromEntries(url.searchParams);
  if (Object.keys(query).some((key) => !['account', 'status'].includes(key))) {
    return json(res, 404, { error: 'Rota indisponível no painel de teste.' });
  }
  let request = req;
  if (req.method === 'POST') {
    let body;
    try {
      body = await credentials(req);
    } catch (error) {
      return json(res, error instanceof RangeError ? 413 : 400, { error: 'Solicitação inválida.' });
    }
    if (body?.action !== 'login' && body?.action !== 'logout') {
      return json(res, 405, { error: 'O painel de teste permite apenas login e consulta.' });
    }
    const loginBody = body.action === 'login'
      ? { action: body.action, email: body.email, password: body.password }
      : { action: body.action };
    request = Object.assign(Readable.from([JSON.stringify(loginBody)]), {
      method: req.method, headers: req.headers, url: req.url
    });
  } else if (req.method !== 'GET') {
    return json(res, 405, { error: 'Método não permitido.' });
  }
  request.query = query;
  res.status = (status) => {
    res.statusCode = status;
    return res;
  };
  res.json = (body) => json(res, res.statusCode, body);
  return stateHandler(request, res);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/healthz' && req.method === 'GET') {
      return json(res, 200, { ok: true });
    }
    if (url.pathname === '/api/state') return await handleState(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return json(res, 405, { error: 'Método não permitido.' });
    }
    const asset = url.pathname === '/' ? 'dashboard.html'
      : url.pathname.startsWith('/docs/') ? decodeURIComponent(url.pathname.slice(6)) : '';
    const file = resolve(root, asset);
    const type = types[extname(file).toLowerCase()];
    if (!asset || !file.startsWith(resolve(root) + sep) || !type) {
      return json(res, 404, { error: 'Arquivo não encontrado.' });
    }
    const info = await stat(file).catch(() => null);
    if (!info?.isFile()) return json(res, 404, { error: 'Arquivo não encontrado.' });
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Length', info.size);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') return res.end();
    await pipeline(createReadStream(file), res);
  } catch {
    if (res.headersSent) return res.destroy();
    json(res, 500, { error: 'Falha ao carregar o painel de teste.' });
  }
});

server.listen(Number(process.env.PORT || 10000), '0.0.0.0');
