#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ACCOUNT = process.env.ACCOUNT || process.env.INSTAGRAM_TEMPLATE_ACCOUNT || 'cliente-x';
const QUEUE_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'scheduled-posts.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

const groups = existsSync(QUEUE_PATH) ? readJson(QUEUE_PATH) : [];
const group = groups.find((item) => item.account === ACCOUNT);
const due = (group?.posts || [])
  .filter((post) => post.status === 'pending' && Date.parse(post.scheduledFor) <= Date.now())
  .sort((a, b) => Date.parse(a.scheduledFor) - Date.parse(b.scheduledFor))[0];

if (process.env.GITHUB_OUTPUT) {
  const fs = await import('node:fs');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_due=${due ? 'true' : 'false'}\n`, 'utf8');
}

console.log(due ? `Due scheduled post: ${due.id}` : 'No due scheduled posts.');
