#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const RUNS_DIR = join(ROOT, 'automation', 'instagram-template', 'runs');
const ERRORS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'watchdog-errors.json');
const statusArg = process.argv.find((arg) => arg.startsWith('--status='));
const status = statusArg ? statusArg.split('=')[1] : 'failed';
const ACCOUNT = process.env.ACCOUNT || process.env.INSTAGRAM_TEMPLATE_ACCOUNT || 'cliente-x';

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function latestFailure() {
  if (!existsSync(RUNS_DIR)) return null;
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) {
        walk(path);
      } else if (/failure-\d{4}-\d{2}-\d{2}-\d{6}\.json$/.test(path)) {
        files.push({ path, mtimeMs: stat.mtimeMs });
      }
    }
  };
  walk(RUNS_DIR);
  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  if (!files[0]) return null;
  return { path: files[0].path, ...readJson(files[0].path, {}) };
}

function solutionFor(errorText = '', stage = '') {
  const text = `${stage} ${errorText}`.toLowerCase();
  if (/oauth|access token|token|permission|permiss/.test(text)) {
    return 'Gerar novo token Meta/Instagram, atualizar o secret da conta no Vercel e no GitHub, depois rodar validar acessos no painel.';
  }
  if (/conta errada|expectedusername|username|user_id|user id/.test(text)) {
    return 'Conferir se o Instagram User ID e o token pertencem ao mesmo @ configurado em accounts.json.';
  }
  if (/imgbb|upload/.test(text)) {
    return 'Validar ou trocar IMGBB_API_KEY no painel, salvar no Vercel/GitHub Secrets e redeployar se necessário.';
  }
  if (/mojibake|acento|validate copy|caption|texto|slide/.test(text)) {
    return 'Corrigir o texto do pack indicado no painel, rodar validar textos e salvar antes da próxima publicação.';
  }
  if (/playwright|chromium|browser/.test(text)) {
    return 'Reexecutar o workflow; se repetir, conferir instalação do Playwright no GitHub Actions.';
  }
  if (/duplicate|duplicad/.test(text)) {
    return 'Adicionar ou editar packs com captions novas para evitar bloqueio por conteúdo repetido.';
  }
  return 'Abrir o run do GitHub Actions, copiar a etapa que falhou e corrigir o token, conteúdo ou dependência indicada antes da próxima tentativa.';
}

const errors = readJson(ERRORS_PATH, []);
const slotIndex = Number.parseInt(process.env.INSTAGRAM_TEMPLATE_SLOT_INDEX || '', 10);
const slotDate = process.env.INSTAGRAM_TEMPLATE_SLOT_DATE || null;
const scheduledAt = process.env.INSTAGRAM_TEMPLATE_SCHEDULED_AT || null;
const workflowRun = process.env.GITHUB_RUN_ID || null;
const workflowName = process.env.GITHUB_WORKFLOW || null;
const runUrl = workflowRun
  ? `https://github.com/${process.env.GITHUB_REPOSITORY || 'marcondesjm/cliente-x-instagram'}/actions/runs/${workflowRun}`
  : null;

if (status === 'resolved') {
  let touched = false;
  for (const entry of errors) {
    const sameSlot = entry.account === ACCOUNT &&
      (!slotDate || entry.date === slotDate) &&
      (!Number.isInteger(slotIndex) || Number(entry.slotIndex) === slotIndex);
    if (sameSlot && entry.status === 'open') {
      entry.status = 'resolved';
      entry.resolvedAt = new Date().toISOString();
      entry.resolvedRun = workflowRun;
      touched = true;
    }
  }
  writeJson(ERRORS_PATH, errors);
  console.log(touched ? 'Erro do vigia marcado como resolvido.' : 'Nenhum erro aberto do vigia para resolver.');
  process.exit(0);
}

const failure = latestFailure();
const errorText = failure?.error || 'Workflow falhou antes de gerar failure.json.';
const stage = failure?.stage || 'github-actions';
const key = [
  ACCOUNT,
  slotDate || 'sem-data',
  Number.isInteger(slotIndex) ? slotIndex : 'sem-slot',
  workflowRun || Date.now()
].join(':');

const entry = {
  key,
  status: 'open',
  account: ACCOUNT,
  date: slotDate,
  slotIndex: Number.isInteger(slotIndex) ? slotIndex : null,
  scheduledAt,
  failedAt: new Date().toISOString(),
  workflowRun,
  workflowName,
  runUrl,
  stage,
  error: errorText,
  solution: solutionFor(errorText, stage),
  failurePath: failure?.path ? failure.path.replace(ROOT, '').replace(/\\/g, '/').replace(/^\/+/, '') : null
};

const previousIndex = errors.findIndex((item) => item.key === key);
if (previousIndex >= 0) {
  errors[previousIndex] = entry;
} else {
  errors.push(entry);
}
writeJson(ERRORS_PATH, errors.slice(-50));
console.log(`Erro do vigia registrado: ${entry.solution}`);
