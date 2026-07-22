#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const LEDGER_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'published-slots.json');
const ACCOUNT = process.env.ACCOUNT || process.env.INSTAGRAM_TEMPLATE_ACCOUNT || 'cliente-x';
const slotIndex = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_SLOT_INDEX || '', 10);
const slotDate = process.env.INSTAGRAM_TEMPLATE_SLOT_DATE || '';
const scheduledAt = process.env.INSTAGRAM_TEMPLATE_SCHEDULED_AT || '';

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

if (!ACCOUNT || !slotDate || !Number.isInteger(slotIndex)) {
  throw new Error('ACCOUNT, INSTAGRAM_TEMPLATE_SLOT_INDEX e INSTAGRAM_TEMPLATE_SLOT_DATE precisam estar definidos.');
}

const ledger = readJson(LEDGER_PATH, []);
const nextEntry = {
  account: ACCOUNT,
  date: slotDate,
  slotIndex,
  scheduledAt,
  status: 'published',
  publishedAt: new Date().toISOString(),
  workflowRun: process.env.GITHUB_RUN_ID || null
};
const index = ledger.findIndex((entry) => (
  entry.account === nextEntry.account &&
  entry.date === nextEntry.date &&
  Number(entry.slotIndex) === nextEntry.slotIndex
));

if (index >= 0) {
  ledger[index] = { ...ledger[index], ...nextEntry };
} else {
  ledger.push(nextEntry);
}

ledger.sort((a, b) => (
  String(a.account).localeCompare(String(b.account)) ||
  String(a.date).localeCompare(String(b.date)) ||
  Number(a.slotIndex) - Number(b.slotIndex)
));

mkdirSync(dirname(LEDGER_PATH), { recursive: true });
writeFileSync(LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
console.log(`Slot ${ACCOUNT} ${slotDate} #${slotIndex} marcado como publicado.`);
