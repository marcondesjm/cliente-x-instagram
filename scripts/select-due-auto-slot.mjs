#!/usr/bin/env node
import { existsSync, readFileSync, appendFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ACCOUNT = process.env.ACCOUNT || process.env.INSTAGRAM_TEMPLATE_ACCOUNT || 'cliente-x';
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');
const LEDGER_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'published-slots.json');
const GRACE_MINUTES = Number.parseInt(process.env.AUTO_POST_GRACE_MINUTES || '2', 10);
const AUTO_POST_LIMIT_PER_DAY = Number.parseInt(process.env.AUTO_POST_LIMIT_PER_DAY || '1', 10);

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function writeOutput(values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value ?? ''}`).join('\n');
  console.log(lines);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines}\n`, 'utf8');
  if (process.env.GITHUB_ENV && values.slot_index !== undefined) {
    appendFileSync(process.env.GITHUB_ENV, `INSTAGRAM_TEMPLATE_SLOT_INDEX=${values.slot_index}\n`, 'utf8');
    appendFileSync(process.env.GITHUB_ENV, `INSTAGRAM_TEMPLATE_SLOT_DATE=${values.slot_date}\n`, 'utf8');
    appendFileSync(process.env.GITHUB_ENV, `INSTAGRAM_TEMPLATE_SCHEDULED_AT=${values.scheduled_at}\n`, 'utf8');
  }
}

function saoPauloDate(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function utcDay(date, offset = 0) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + offset));
}

function scheduledAtUtc(cron, day) {
  const [minute, hour] = String(cron).split(' ').map(Number);
  if (!Number.isInteger(minute) || !Number.isInteger(hour)) return null;
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute));
}

function ledgerKey(entry) {
  return `${entry.account}:${entry.date}:${entry.slotIndex}`;
}

const accounts = readJson(ACCOUNTS_PATH, []);
const account = accounts.find((item) => item.account === ACCOUNT);
if (!account) throw new Error(`Conta ${ACCOUNT} nao encontrada em accounts.json.`);

const ledger = readJson(LEDGER_PATH, []);
const done = new Set(
  ledger
    .filter((entry) => entry.status === 'published' || entry.status === 'initialized')
    .map(ledgerKey)
);

const now = new Date();
const dueUntil = new Date(now.getTime() - Math.max(0, GRACE_MINUTES) * 60_000);
const currentLocalDate = saoPauloDate(now);
const publishedToday = ledger.filter((entry) => (
  entry.account === ACCOUNT &&
  entry.date === currentLocalDate &&
  entry.status === 'published'
)).length;

if (AUTO_POST_LIMIT_PER_DAY > 0 && publishedToday >= AUTO_POST_LIMIT_PER_DAY) {
  writeOutput({
    has_due: 'false',
    reason: `daily_auto_limit_reached:${publishedToday}/${AUTO_POST_LIMIT_PER_DAY}`
  });
  process.exit(0);
}

const candidates = [];

for (const offset of [-1, 0]) {
  const day = utcDay(now, offset);
  for (const [slotIndex, cron] of (account.scheduleUtc || []).entries()) {
    const scheduledAt = scheduledAtUtc(cron, day);
    if (!scheduledAt || scheduledAt > dueUntil) continue;
    const slotDate = saoPauloDate(scheduledAt);
    if (slotDate !== currentLocalDate) continue;
    const candidate = {
      account: account.account,
      date: slotDate,
      slotIndex,
      cron,
      scheduledAt
    };
    if (!done.has(ledgerKey(candidate))) candidates.push(candidate);
  }
}

candidates.sort((a, b) => a.scheduledAt - b.scheduledAt || a.slotIndex - b.slotIndex);
const due = candidates[0];

if (!due) {
  writeOutput({ has_due: 'false' });
  process.exit(0);
}

writeOutput({
  has_due: 'true',
  slot_index: due.slotIndex,
  slot_date: due.date,
  scheduled_at: due.scheduledAt.toISOString(),
  cron: due.cron
});
