import { requireAdmin, canAccessAccount } from '../lib/auth.js';
import { normalizeAccountKey } from '../lib/accounts.js';

export function scheduleFromTimes(times) {
  if (!Array.isArray(times) || !times.length || times.length > 24) throw new Error('Informe de 1 a 24 horários.');
  if (times.some(time => typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) throw new Error('Horário inválido. Use HH:MM em Brasília.');
  if (new Set(times).size !== times.length) throw new Error('Não repita horários.');
  return [...times].sort().map(time => {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${(hour + 3) % 24} * * *`;
  });
}

export default async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  const session = requireAdmin(req, res);
  if (!session) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const accountKey = normalizeAccountKey(body.account);
    const scheduleUtc = scheduleFromTimes(body.times);
    if (!process.env.GITHUB_TOKEN) return res.status(503).json({ error: 'GitHub não configurado para salvar a agenda.' });
    const url = 'https://api.github.com/repos/marcondesjm/cliente-x-instagram/contents/automation/instagram-template/config/accounts.json';
    const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
    const response = await fetch(`${url}?ref=main`, { headers });
    if (!response.ok) return res.status(502).json({ error: 'Não foi possível consultar a configuração da agenda.' });
    const file = await response.json();
    const accounts = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
    const account = accounts.find(item => item.account === accountKey);
    if (!account) return res.status(404).json({ error: 'Conta não encontrada.' });
    if (!canAccessAccount(session, account)) return res.status(403).json({ error: 'Sem acesso a esta conta.' });
    // Slots already published are indexed by this array; preserve their meaning.
    if (account.automaticScheduleStartsAt && Date.now() >= Date.parse(account.automaticScheduleStartsAt) && JSON.stringify(account.scheduleUtc) !== JSON.stringify(scheduleUtc)) {
      return res.status(409).json({ error: 'A agenda automática já iniciou. Ajuste a grade com migração dos slots para preservar o histórico.' });
    }
    account.scheduleUtc = scheduleUtc;
    const saved = await fetch(url, { method: 'PUT', headers, body: JSON.stringify({ branch: 'main', sha: file.sha, message: `Update Instagram schedule ${accountKey}`, content: Buffer.from(`${JSON.stringify(accounts, null, 2)}\n`).toString('base64') }) });
    if (!saved.ok) return res.status(saved.status === 409 ? 409 : 502).json({ error: 'Não foi possível salvar a agenda. Atualize o painel e tente novamente.' });
    return res.status(200).json({ account: { account: accountKey, scheduleUtc }, scheduleBrt: [...body.times].sort() });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
