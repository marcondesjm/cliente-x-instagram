import { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const {
  FACEBOOK_PAGE_ID: pageId,
  FACEBOOK_PAGE_TOKEN: pageToken,
  GITHUB_OUTPUT: output,
  GITHUB_RUN_ID: runId,
  GITHUB_STEP_SUMMARY: summary,
  INSTAGRAM_MEDIA_ID: instagramId,
  RUNNER_TEMP: temp
} = process.env;

const graphBase = 'https://graph.facebook.com/v27.0';
const payloadPath = join(temp, 'facebook-payload.json');
const preparedPath = join(temp, 'facebook-prepared.json');
const attemptsPath = join(temp, 'facebook-attempt.txt');
const validId = (value) => /^\d+$/.test(String(value ?? ''));
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

function isHttpsUrl(value) {
  return typeof value === 'string' && URL.canParse(value) && new URL(value).protocol === 'https:';
}

function collect() {
  const runs = 'automation/instagram-template/runs/cliente-x';
  if (!existsSync(runs)) return;
  const publications = [];
  for (const entry of readdirSync(runs, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(runs, entry.name);
    const resultPath = join(dir, 'result.json');
    if (!existsSync(resultPath)) continue;
    const result = readJson(resultPath);
    if (result.workflowRun !== runId || result.account !== 'cliente-x' || result.dryRun || !validId(result.mediaId)) continue;
    publications.push({ result, dir });
  }
  if (publications.length === 0) return;
  if (publications.length > 1) throw new Error('Não foi possível identificar uma única publicação do Instagram neste agendamento.');
  const [{ result, dir }] = publications;
  const caption = readFileSync(join(dir, 'caption.txt'), 'utf8');
  const payload = result.reelMode
    ? { instagramId: result.mediaId, caption, videoUrl: result.reelVideoUrl }
    : { instagramId: result.mediaId, caption, images: result.imageUrls };
  writeFileSync(payloadPath, JSON.stringify(payload));
  appendFileSync(output, `media_id=${result.mediaId}\n`);
}

async function metaRequest(url, label, { form, headers = {}, method = form ? 'POST' : 'GET' } = {}) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: { Authorization: `OAuth ${pageToken}`, ...headers },
      body: form ? new URLSearchParams(form) : undefined,
      redirect: 'error',
      signal: AbortSignal.timeout(45_000)
    });
  } catch {
    throw new Error(`${label}: a Meta não confirmou a solicitação.`);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.error) {
    const code = [data?.error?.code, data?.error?.error_subcode].filter(Number.isInteger).join('/');
    throw new Error(`${label}: HTTP ${response.status}${code ? ` (Meta ${code})` : ''}.`);
  }
  return data;
}

const graph = (path, label, form) => metaRequest(`${graphBase}/${path}`, label, {
  form,
  headers: { Authorization: `Bearer ${pageToken}` }
});

async function prepare() {
  const payload = readJson(payloadPath);
  if (!validId(pageId) || !pageToken || !validId(instagramId) || String(payload.instagramId) !== instagramId) {
    throw new Error('A configuração da Página ou o identificador da publicação original está incorreto.');
  }
  const page = await graph('me?fields=id', 'Validar token da Página');
  if (String(page.id) !== pageId) throw new Error('O token informado pertence a outro destino.');

  let prepared;
  if (payload.videoUrl) {
    if (!isHttpsUrl(payload.videoUrl)) throw new Error('O vídeo do Reel não tem uma URL HTTPS válida.');
    const { video_id: videoId, upload_url: uploadUrl } = await graph(`${pageId}/video_reels`, 'Criar sessão do Reel', { upload_phase: 'start' });
    if (!validId(videoId) || !isHttpsUrl(uploadUrl) || new URL(uploadUrl).origin !== 'https://rupload.facebook.com') {
      throw new Error('A Meta devolveu uma sessão de upload inválida.');
    }
    const uploaded = await metaRequest(uploadUrl, 'Enviar vídeo do Reel', {
      method: 'POST',
      headers: { file_url: payload.videoUrl }
    });
    if (uploaded.success !== true) throw new Error('A Meta não confirmou o upload do vídeo.');
    prepared = { videoId };
  } else {
    if (!Array.isArray(payload.images) || !payload.images.length || !payload.images.every(isHttpsUrl)) {
      throw new Error('A publicação do Instagram não tem URLs válidas para as fotos.');
    }
    const photoIds = [];
    for (const url of payload.images) {
      const photo = await graph(`${pageId}/photos`, 'Enviar foto para a Página', {
        url,
        published: 'false',
        temporary: 'true'
      });
      if (!validId(photo.id)) throw new Error('A Meta não devolveu o ID de uma foto.');
      photoIds.push(photo.id);
    }
    prepared = { photoIds };
  }
  writeFileSync(preparedPath, JSON.stringify(prepared));
  writeFileSync(attemptsPath, instagramId);
}

async function publish() {
  const { caption } = readJson(payloadPath);
  const { videoId, photoIds } = readJson(preparedPath);
  let facebookId;
  if (videoId) {
    const result = await graph(`${pageId}/video_reels`, 'Publicar Reel na Página', {
      upload_phase: 'finish',
      video_id: videoId,
      video_state: 'PUBLISHED',
      description: caption
    });
    if (result.success !== true) throw new Error('A Meta não confirmou a solicitação de publicação do Reel.');
    facebookId = videoId;
    for (let attempt = 0; attempt < 12; attempt++) {
      const { status } = await graph(`${videoId}?fields=status`, 'Consultar publicação do Reel');
      const phase = status?.publishing_phase;
      if (phase?.status === 'complete' && phase.publish_status === 'published') {
        appendFileSync(summary, `Facebook · Reel publicado na Página MJM Digital (ID ${facebookId}).\n`);
        return;
      }
      if (status?.video_status === 'error' || phase?.status === 'error') break;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    throw new Error(`A publicação do Reel ${facebookId} ainda não foi confirmada pela Meta.`);
  }

  const attached = Object.fromEntries(photoIds.map((id, index) => [
    `attached_media[${index}]`,
    JSON.stringify({ media_fbid: String(id) })
  ]));
  const result = await graph(`${pageId}/feed`, 'Publicar fotos na Página', { message: caption, ...attached });
  if (!/^\d+(?:_\d+)?$/.test(String(result.id))) throw new Error('A Meta não devolveu o ID da publicação.');
  appendFileSync(summary, `Facebook · Fotos publicadas na Página MJM Digital (ID ${result.id}).\n`);
}

try {
  const action = process.argv[2];
  if (action === 'collect') collect();
  else if (action === 'prepare') await prepare();
  else if (action === 'publish') await publish();
  else throw new Error('Etapa de publicação do Facebook inválida.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
