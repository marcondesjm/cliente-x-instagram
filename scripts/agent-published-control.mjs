import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.cwd(), 'automation', 'instagram-template', 'config');
const PUBLISHED_LOG_PATH = join(CONFIG_DIR, 'published-log.json');
const SCHEDULED_POSTS_PATH = join(CONFIG_DIR, 'scheduled-posts.json');
const CONTENT_PACKS_PATH = join(CONFIG_DIR, 'content-packs.json');

/**
 * Agente de Controle de Publicações - Sabedoria Kids
 *
 * Este agente verifica o arquivo published-log.json (banco de dados na nuvem)
 * para garantir que nenhum pack seja publicado duas vezes.
 */

function loadPublishedLog() {
  try {
    const data = readFileSync(PUBLISHED_LOG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Arquivo de log não encontrado ou inválido. Criando novo.');
    return [];
  }
}

function savePublishedLog(log) {
  writeFileSync(PUBLISHED_LOG_PATH, JSON.stringify(log, null, 2), 'utf-8');
  console.log('✅ Log de publicações atualizado na nuvem.');
}

function loadScheduledPosts() {
  try {
    const data = readFileSync(SCHEDULED_POSTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveScheduledPosts(posts) {
  writeFileSync(SCHEDULED_POSTS_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

function loadContentPacks() {
  try {
    const data = readFileSync(CONTENT_PACKS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function getPackTitle(packId) {
  const packs = loadContentPacks();
  const pack = packs.find(p => p.id === packId);
  return pack ? pack.title : 'Título desconhecido';
}

/**
 * Verifica se um pack já foi publicado
 */
function isAlreadyPublished(packId) {
  const log = loadPublishedLog();
  return log.some(entry => entry.packId === packId && entry.status === 'published');
}

/**
 * Registra uma nova publicação no log da nuvem
 */
function registerPublication(packId, mediaId, title) {
  const log = loadPublishedLog();

  // Evita duplicidade
  if (log.some(entry => entry.packId === packId)) {
    console.warn(`⚠️ Pack ${packId} já está registrado. Ignorando.`);
    return;
  }

  log.push({
    packId,
    title: title || getPackTitle(packId),
    publishedAt: new Date().toISOString(),
    status: 'published',
    mediaId: mediaId || `auto-${Date.now()}`
  });

  savePublishedLog(log);
}

/**
 * Limpa a fila de agendamento removendo itens já publicados
 */
function cleanScheduledQueue() {
  const scheduled = loadScheduledPosts();
  const cleaned = [];
  let removedCount = 0;

  for (const account of scheduled) {
    const validPosts = [];

    for (const post of account.posts) {
      if (post.packId && isAlreadyPublished(post.packId)) {
        console.log(`🚫 Removendo pack já publicado: ${post.packId} (${getPackTitle(post.packId)})`);
        removedCount++;
      } else {
        validPosts.push(post);
      }
    }

    if (validPosts.length > 0 || account.posts.length === 0) {
      cleaned.push({ ...account, posts: validPosts });
    }
  }

  if (removedCount > 0) {
    saveScheduledPosts(cleaned);
    console.log(`✅ Fila limpa: ${removedCount} item(s) removido(s) por já terem sido publicados.`);
  } else {
    console.log('✅ Fila de agendamento já está limpa.');
  }
}

/**
 * Lista todos os packs disponíveis e seu status
 */
function listAllPacksStatus() {
  const packs = loadContentPacks();
  const log = loadPublishedLog();
  const kidsPacks = packs.filter(p => p.id && p.id.startsWith('kids-biblia'));

  console.log('\n📊 STATUS DOS PACKS SABEDORIA KIDS:\n');
  console.log('─'.repeat(80));

  kidsPacks.forEach(pack => {
    const published = log.find(entry => entry.packId === pack.id);
    const status = published ? '✅ PUBLICADO' : '⏳ PENDENTE';
    const date = published ? new Date(published.publishedAt).toLocaleDateString('pt-BR') : '-';

    console.log(`${status.padEnd(15)} | ${pack.id.padEnd(20)} | ${pack.title?.substring(0, 40).padEnd(40)} | Publicado em: ${date}`);
  });

  console.log('─'.repeat(80));
  console.log(`\nTotal: ${kidsPacks.length} packs | Publicados: ${log.length} | Pendentes: ${kidsPacks.length - log.length}\n`);
}

// Execução principal
const command = process.argv[2];

switch (command) {
  case 'check':
    cleanScheduledQueue();
    break;

  case 'list':
    listAllPacksStatus();
    break;

  case 'register':
    const packId = process.argv[3];
    const mediaId = process.argv[4];
    if (!packId) {
      console.error('Uso: node agent-published-control.mjs register <packId> [mediaId]');
      process.exit(1);
    }
    registerPublication(packId, mediaId);
    break;

  default:
    console.log('🤖 Agente de Controle de Publicações - Sabedoria Kids\n');
    console.log('Comandos disponíveis:');
    console.log('  node agent-published-control.mjs check    - Verifica e limpa fila de agendamento');
    console.log('  node agent-published-control.mjs list     - Lista status de todos os packs');
    console.log('  node agent-published-control.mjs register <packId> [mediaId] - Registra publicação manual');
    break;
}