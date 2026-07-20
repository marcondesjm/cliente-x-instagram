import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CONTENT_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'content-packs.json');
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');
const ACCOUNT = 'cliente-x';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function normalizeCaption(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function cronToBrtTime(cron) {
  const [minute, hour] = cron.split(' ').map(Number);
  const brtHour = (hour + 21) % 24;
  return `${String(brtHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  const accounts = readJson(ACCOUNTS_PATH);
  const content = readJson(CONTENT_PATH);
  const account = accounts.find((item) => item.account === ACCOUNT);
  const group = content.find((item) => item.account === ACCOUNT);
  const packs = group?.packs || [];

  res.setHeader('cache-control', 'no-store');
  res.status(200).json({
    account,
    scheduleBrt: account?.scheduleUtc?.map(cronToBrtTime) || [],
    packs,
    packCount: packs.length,
    uniqueCaptions: new Set(packs.map((pack) => normalizeCaption(pack.caption))).size,
    latestResult: null,
    latestFailure: null
  });
}
