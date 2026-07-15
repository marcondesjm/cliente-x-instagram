#!/usr/bin/env node
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TEMPLATE_DIR = resolve(ROOT, 'automation', 'instagram-template');
const DEFAULT_CONFIG_DIR = join(TEMPLATE_DIR, 'config');
const RUNS_DIR = join(TEMPLATE_DIR, 'runs');
const IG_BASE = 'https://graph.facebook.com/v21.0';

const PLAIN_ASCII_PORTUGUESE = [
  ['nao', 'não'],
  ['operacao', 'operação'],
  ['automacao', 'automação'],
  ['conteudo', 'conteúdo'],
  ['criterio', 'critério'],
  ['padrao', 'padrão'],
  ['decisao', 'decisão'],
  ['execucao', 'execução'],
  ['proximo', 'próximo'],
  ['proxima', 'próxima'],
  ['gestao', 'gestão'],
  ['acao', 'ação'],
  ['informacao', 'informação'],
  ['revisao', 'revisão'],
  ['seguranca', 'segurança']
];

function parseArgs(argv) {
  const getValue = (name, fallback = undefined) => {
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : fallback;
  };
  return {
    account: getValue('--account', process.env.INSTAGRAM_TEMPLATE_ACCOUNT || 'cliente-exemplo'),
    configDir: resolve(getValue('--config-dir', DEFAULT_CONFIG_DIR)),
    dryRun: argv.includes('--dry-run'),
    renderOnly: argv.includes('--render-only'),
    validateCopy: argv.includes('--validate-copy')
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function configPath(configDir, name) {
  const customPath = join(configDir, `${name}.json`);
  if (existsSync(customPath)) return customPath;
  return join(configDir, `${name}.example.json`);
}

function loadEnv() {
  const env = { ...process.env };
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return env;
  const raw = readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (match && !env[match[1].trim()]) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

function loadConfig(configDir, accountName) {
  const accounts = readJson(configPath(configDir, 'accounts'));
  const contentGroups = readJson(configPath(configDir, 'content-packs'));
  const styles = readJson(configPath(configDir, 'visual-styles'));
  const account = accounts.find((item) => item.account === accountName);
  const content = contentGroups.find((item) => item.account === accountName);
  if (!account) throw new Error(`Conta "${accountName}" nao encontrada no arquivo de contas.`);
  if (!content) throw new Error(`Packs da conta "${accountName}" nao encontrados no arquivo de conteudo.`);
  if (!content.packs?.length) throw new Error(`Conta "${accountName}" nao tem packs de conteudo.`);
  if (!styles.length) throw new Error('Nenhum estilo visual configurado.');
  return { account, packs: content.packs, styles };
}

function timestampSaoPaulo() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}-${map.hour}${map.minute}${map.second}`;
}

function todaySaoPaulo() {
  return timestampSaoPaulo().slice(0, 10);
}

function daysSinceEpoch(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function pickDaily(items, dateString) {
  return items[daysSinceEpoch(dateString) % items.length];
}

function assertNoMojibake(text) {
  const markers = ['Ãƒ', 'Ã‚', 'Ã¢', 'ï¿½'];
  const found = markers.find((marker) => text.includes(marker));
  if (found) throw new Error(`Texto contem mojibake (${found}). Corrija antes de publicar.`);
}

function stripHashtagLines(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');
}

function assertPortugueseAccents(text) {
  const searchable = stripHashtagLines(text);
  const found = PLAIN_ASCII_PORTUGUESE.find(([plain]) => {
    const pattern = new RegExp(`(^|[^\\p{L}])${plain}([^\\p{L}]|$)`, 'iu');
    return pattern.test(searchable);
  });
  if (found) throw new Error(`Texto sem acento: use "${found[1]}" no lugar de "${found[0]}".`);
}

function validatePack(pack) {
  assertNoMojibake(pack.caption);
  assertPortugueseAccents(pack.caption);
  if (!Array.isArray(pack.slides) || pack.slides.length < 2) throw new Error('Cada pack precisa de pelo menos 2 slides.');
  for (const slide of pack.slides) {
    const text = `${slide.eyebrow}\n${slide.title}\n${slide.body}`;
    assertNoMojibake(text);
    assertPortugueseAccents(text);
  }
}

function validatePacks(packs) {
  packs.forEach(validatePack);
}

function slideHtml(slide, index, total, account, style) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 1080px; height: 1080px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; background: ${style.bgTop}; color: ${style.text}; }
    main {
      width: 1080px;
      height: 1080px;
      padding: 62px 70px 58px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        linear-gradient(135deg, ${style.accentSoft}, rgba(124,255,178,0) 34%),
        linear-gradient(180deg, ${style.bgTop} 0%, ${style.bgBottom} 100%);
      position: relative;
    }
    main::before { content: ""; position: absolute; inset: 34px; border: 2px solid rgba(244,247,245,0.1); }
    main::after {
      content: "";
      position: absolute;
      right: -80px;
      top: 150px;
      width: 450px;
      height: 780px;
      background:
        linear-gradient(90deg, ${style.grid} 1px, transparent 1px),
        linear-gradient(180deg, ${style.grid} 1px, transparent 1px);
      background-size: 46px 46px;
      transform: rotate(-7deg);
    }
    section, footer { position: relative; z-index: 2; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 28px; }
    .brand { font-size: 34px; font-weight: 900; color: ${style.text}; }
    .eyebrow { font-size: 28px; font-weight: 900; color: ${style.accent}; text-transform: uppercase; text-align: right; }
    .content { display: flex; flex-direction: column; gap: 34px; }
    h1 { max-width: 850px; font-size: 82px; line-height: 1.03; font-weight: 900; color: ${style.text}; letter-spacing: 0; }
    p { max-width: 830px; font-size: 42px; line-height: 1.18; font-weight: 800; color: ${style.muted}; letter-spacing: 0; }
    .bar { width: ${index % 2 === 0 ? '148px' : '220px'}; height: 12px; background: ${style.accent}; }
    footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; color: #AEB8B2; font-size: 26px; font-weight: 800; }
    footer strong { display: block; color: ${style.text}; font-size: 30px; font-weight: 900; }
  </style>
</head>
<body>
  <main>
    <section class="top">
      <div class="brand">${account.brandName}</div>
      <div class="eyebrow">${slide.eyebrow}</div>
    </section>
    <section class="content">
      <div class="bar"></div>
      <h1>${slide.title}</h1>
      <p>${slide.body}</p>
    </section>
    <footer>
      <div><strong>${account.brandName}</strong>${account.footerText}</div>
      <div>${index}/${total}</div>
    </footer>
  </main>
</body>
</html>`;
}

async function renderSlides(runDir, slides, account, style) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  const imagePaths = [];
  for (let index = 0; index < slides.length; index += 1) {
    const html = slideHtml(slides[index], index + 1, slides.length, account, style);
    assertNoMojibake(html);
    assertPortugueseAccents(`${slides[index].eyebrow}\n${slides[index].title}\n${slides[index].body}`);
    const htmlPath = join(runDir, `slide-${String(index + 1).padStart(2, '0')}.html`);
    const imagePath = join(runDir, `slide-${String(index + 1).padStart(2, '0')}.jpg`);
    writeFileSync(htmlPath, html, 'utf8');
    await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);
    await page.screenshot({ path: imagePath, type: 'jpeg', quality: 94, fullPage: false });
    imagePaths.push(imagePath);
  }
  await browser.close();
  return imagePaths;
}

async function graphGet(path, params = {}) {
  const url = new URL(`${IG_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Graph GET failed [${res.status}]: ${await res.text()}`);
  return res.json();
}

async function graphPost(path, params = {}) {
  const url = new URL(`${IG_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error(`Graph POST failed [${res.status}]: ${await res.text()}`);
  return res.json();
}

async function uploadToImgBB(imagePath, apiKey) {
  const form = new FormData();
  form.append('key', apiKey);
  form.append('image', readFileSync(resolve(imagePath)).toString('base64'));
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`imgBB upload failed [${res.status}]: ${await res.text()}`);
  const json = await res.json();
  if (!json.success) throw new Error(`imgBB upload failed: ${JSON.stringify(json)}`);
  return json.data.url;
}

async function pollContainer(containerId, token) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const status = await graphGet(`/${containerId}`, { fields: 'status_code', access_token: token });
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') throw new Error(`Container ${containerId} failed.`);
    await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 3000));
  }
  throw new Error(`Container ${containerId} timed out.`);
}

async function main() {
  const args = parseArgs(process.argv);
  const { account, packs, styles } = loadConfig(args.configDir, args.account);
  validatePacks(packs);
  if (args.validateCopy) {
    console.log(JSON.stringify({ ok: true, account: account.account, checkedPacks: packs.length }, null, 2));
    return;
  }

  const today = todaySaoPaulo();
  const pack = pickDaily(packs, today);
  const style = pickDaily(styles, today);
  const runId = `${timestampSaoPaulo()}${args.renderOnly ? '-render-only' : ''}`;
  const runDir = join(RUNS_DIR, account.account, runId);
  mkdirSync(runDir, { recursive: true });
  writeFileSync(join(runDir, 'daily-pack.json'), JSON.stringify({ date: today, account: account.account, visualStyle: style.name, ...pack }, null, 2), 'utf8');
  writeFileSync(join(runDir, 'caption.txt'), pack.caption, 'utf8');
  const imagePaths = await renderSlides(runDir, pack.slides, account, style);

  if (args.renderOnly) {
    console.log(JSON.stringify({ ok: true, renderOnly: true, account: account.account, runDir, visualStyle: style.name, imagePaths }, null, 2));
    return;
  }

  const env = loadEnv();
  const token = env[account.accessTokenEnv];
  const userId = env[account.userIdEnv];
  const imgbbKey = env[account.imgbbKeyEnv];
  if (!token) throw new Error(`${account.accessTokenEnv} ausente.`);
  if (!userId) throw new Error(`${account.userIdEnv} ausente.`);
  if (!imgbbKey) throw new Error(`${account.imgbbKeyEnv} ausente.`);

  const igAccount = await graphGet(`/${userId}`, { fields: 'id,username', access_token: token });
  if (igAccount.username !== account.expectedUsername) {
    throw new Error(`Conta errada: esperado ${account.expectedUsername}, retornou ${igAccount.username}.`);
  }

  const imageUrls = await Promise.all(imagePaths.map((imagePath) => uploadToImgBB(imagePath, imgbbKey)));
  const children = await Promise.all(imageUrls.map((imageUrl) => graphPost(`/${userId}/media`, {
    image_url: imageUrl,
    is_carousel_item: 'true',
    access_token: token
  })));
  const childIds = children.map((child) => child.id);
  await Promise.all(childIds.map((childId) => pollContainer(childId, token)));
  const carousel = await graphPost(`/${userId}/media`, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption: pack.caption,
    access_token: token
  });
  await pollContainer(carousel.id, token);

  const baseResult = { ok: true, dryRun: args.dryRun, account: account.account, runDir, imagePaths, imageUrls, childIds, carouselId: carousel.id };
  if (args.dryRun) {
    writeFileSync(join(runDir, 'result.json'), JSON.stringify(baseResult, null, 2), 'utf8');
    console.log(JSON.stringify(baseResult, null, 2));
    return;
  }

  const media = await graphPost(`/${userId}/media_publish`, { creation_id: carousel.id, access_token: token });
  const details = await graphGet(`/${media.id}`, { fields: 'id,permalink,timestamp', access_token: token });
  const result = { ...baseResult, mediaId: media.id, ...details };
  writeFileSync(join(runDir, 'result.json'), JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  mkdirSync(RUNS_DIR, { recursive: true });
  writeFileSync(join(RUNS_DIR, `failure-${timestampSaoPaulo()}.json`), JSON.stringify({ ok: false, error: error.message }, null, 2), 'utf8');
  console.error(error.message);
  process.exit(1);
});
