import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.cwd(), 'automation', 'instagram-template', 'config');
const PUBLISHED_LOG_PATH = join(CONFIG_DIR, 'published-log.json');
const CONTENT_PACKS_PATH = join(CONFIG_DIR, 'content-packs.json');

/**
 * Verifica quais packs da conta Sabedoria Kids já foram publicados
 * e lista os próximos disponíveis na nuvem.
 */

function loadPublishedLog() {
  try {
    const data = readFileSync(PUBLISHED_LOG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function loadContentPacks() {
  try {
    const data = readFileSync(CONTENT_PACKS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

const publishedLog = loadPublishedLog();
const allPacks = loadContentPacks();

// Filtra apenas os packs da conta sabedoria-kids
const kidsPacks = allPacks.filter(p => p.id && p.id.startsWith('kids-biblia'));

console.log('📊 STATUS DAS PUBLICAÇÕES - SABEDORIA KIDS\n');
console.log('─'.repeat(100));

let publishedCount = 0;
let pendingCount = 0;

kidsPacks.forEach(pack => {
  const isPublished = publishedLog.some(entry => entry.packId === pack.id);
  const status = isPublished ? '✅ PUBLICADO' : '⏳ PRONTO PARA PUBLICAR';

  if (isPublished) {
    publishedCount++;
  } else {
    pendingCount++;
  }

  console.log(`${status.padEnd(20)} | ${pack.id.padEnd(25)} | ${pack.title?.substring(0, 50) || 'Sem título'}`);
});

console.log('─'.repeat(100));
console.log(`\nResumo:`);
console.log(`Total de packs: ${kidsPacks.length}`);
console.log(`Publicados: ${publishedCount}`);
console.log(`Próximos na fila: ${pendingCount}`);

console.log('\n🚀 PRÓXIMOS 5 PROJETOS PARA PUBLICAR:');
const nextPacks = kidsPacks.filter(p => !publishedLog.some(entry => entry.packId === p.id)).slice(0, 5);
nextPacks.forEach((pack, index) => {
  console.log(`${index + 1}. ${pack.id} - ${pack.title}`);
});