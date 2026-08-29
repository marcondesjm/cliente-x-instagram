#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');
const ACCOUNT = process.env.ACCOUNT || process.env.INSTAGRAM_TEMPLATE_ACCOUNT || 'cliente-x';

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
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

function writeOutput(values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value ?? ''}`).join('\n');
  console.log(lines);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines}\n`, 'utf8');
  if (process.env.GITHUB_ENV) {
    appendFileSync(process.env.GITHUB_ENV, `INSTAGRAM_TEMPLATE_SLOT_INDEX=${values.slot_index}\n`, 'utf8');
    appendFileSync(process.env.GITHUB_ENV, `INSTAGRAM_TEMPLATE_SLOT_DATE=${values.slot_date}\n`, 'utf8');
    appendFileSync(process.env.GITHUB_ENV, `INSTAGRAM_TEMPLATE_SCHEDULED_AT=${values.scheduled_at}\n`, 'utf8');
  }
}

const slotIndex = Number.parseInt(argValue('--slot-index', process.env.INSTAGRAM_TEMPLATE_SLOT_INDEX || ''), 10);
const requestedDate = argValue('--date', process.env.INSTAGRAM_TEMPLATE_SLOT_DATE || saoPauloDate(new Date()));
if (!Number.isInteger(slotIndex) || slotIndex < 0) {
  throw new Error('Informe um slot_index valido para resolver os metadados do horario.');
}

const accounts = readJson(ACCOUNTS_PATH, []);
const account = accounts.find((item) => item.account === ACCOUNT);
if (!account) throw new Error(`Conta ${ACCOUNT} nao encontrada em accounts.json.`);

const cron = account.scheduleUtc?.[slotIndex];
if (!cron) throw new Error(`Slot ${slotIndex} nao existe na agenda da conta ${ACCOUNT}.`);

const now = new Date();
const scheduledAt = [-1, 0, 1]
  .map((offset) => scheduledAtUtc(cron, utcDay(now, offset)))
  .find((candidate) => candidate && saoPauloDate(candidate) === requestedDate);

if (!scheduledAt) {
  throw new Error(`Nao foi possivel calcular scheduledAt para ${ACCOUNT} ${requestedDate} slot ${slotIndex}.`);
}

writeOutput({
  slot_index: slotIndex,
  slot_date: requestedDate,
  scheduled_at: scheduledAt.toISOString(),
  cron
});
