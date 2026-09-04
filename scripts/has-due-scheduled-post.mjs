#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ACCOUNT = process.env.ACCOUNT || process.env.INSTAGRAM_TEMPLATE_ACCOUNT || 'cliente-x';
const QUEUE_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'scheduled-posts.json');
const WEEKLY_PROGRAMS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'weekly-programs.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

const groups = existsSync(QUEUE_PATH) ? readJson(QUEUE_PATH) : [];
const group = groups.find((item) => item.account === ACCOUNT);
const due = (group?.posts || [])
  .filter((post) => post.status === 'pending' && Date.parse(post.scheduledFor) <= Date.now())
  .sort((a, b) => Date.parse(a.scheduledFor) - Date.parse(b.scheduledFor))[0];

function saoPauloParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function weekdaySaoPaulo(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 15, 0, 0)).getUTCDay();
}

function dueWeeklyProgram() {
  if (!existsSync(WEEKLY_PROGRAMS_PATH)) return null;
  const parts = saoPauloParts();
  const dateString = `${parts.year}-${parts.month}-${parts.day}`;
  const timeString = `${parts.hour}:${parts.minute}`;
  const weekday = weekdaySaoPaulo(dateString);
  const weeklyGroups = readJson(WEEKLY_PROGRAMS_PATH);
  const weeklyGroup = weeklyGroups.find((item) => item.account === ACCOUNT);
  return (weeklyGroup?.programs || [])
    .filter((program) => program.status !== 'paused')
    .filter((program) => program.lastPublishedDate !== dateString)
    .filter((program) => (program.weekdays || []).map(Number).includes(weekday))
    .filter((program) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(program.time || '')))
    .filter((program) => String(program.time) <= timeString)
    .sort((a, b) => String(a.time).localeCompare(String(b.time)))[0] || null;
}

const weeklyDue = dueWeeklyProgram();

if (process.env.GITHUB_ENV && (due || weeklyDue)) {
  const fs = await import('node:fs');
  const nowLocal = saoPauloParts();
  const scheduledAt = due
    ? new Date(due.scheduledFor).toISOString()
    : new Date(`${nowLocal.year}-${nowLocal.month}-${nowLocal.day}T${weeklyDue.time}:00-03:00`).toISOString();
  const local = saoPauloParts(new Date(scheduledAt));
  fs.appendFileSync(process.env.GITHUB_ENV, `INSTAGRAM_TEMPLATE_SLOT_DATE=${local.year}-${local.month}-${local.day}\n`, 'utf8');
  fs.appendFileSync(process.env.GITHUB_ENV, `INSTAGRAM_TEMPLATE_SCHEDULED_AT=${scheduledAt}\n`, 'utf8');
}

if (process.env.GITHUB_OUTPUT) {
  const fs = await import('node:fs');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_due=${due || weeklyDue ? 'true' : 'false'}\n`, 'utf8');
}

console.log(due
  ? `Due scheduled post: ${due.id}`
  : weeklyDue
    ? `Due weekly program: ${weeklyDue.id || weeklyDue.name}`
    : 'No due scheduled posts.');
