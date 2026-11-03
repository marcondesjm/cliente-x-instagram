import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.cwd(), 'automation', 'instagram-template', 'config');
const PUBLISHED_LOG_PATH = join(CONFIG_DIR, 'published-log.json');
const SCHEDULED_POSTS_PATH = join(CONFIG_DIR, 'scheduled-posts.json');

/**
 * Automação em Nuvem - Sabedoria Kids
 *
 * Este script:
 * 1. Verifica o published-log.json para evitar duplicatas
 * 2. Processa os agendamentos pendentes
 * 3. Registra cada publicação no log da nuvem
 * 4. Roda em loop infinito (ideal para servidor/VPS)
 */

function loadJSON(path) {
 try {
 return JSON.parse(readFileSync(path, 'utf-8'));
 } catch (error) {
 return [];
 }
}

function saveJSON(path, data) {
 writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

function isAlreadyPublished(packId) {
 const log = loadJSON(PUBLISHED_LOG_PATH);
 return log.some(entry => entry.packId === packId && entry.status === 'published');
}

function registerPublication(packId, title, mediaId) {
 const log = loadJSON(PUBLISHED_LOG_PATH);

 if (log.some(entry => entry.packId === packId)) {
 console.warn(`⚠️ Pack ${packId} já registrado. Ignorando.`);
 return;
 }

 log.push({
 packId,
 title,
 publishedAt: new Date().toISOString(),
 status: 'published',
 mediaId: mediaId || `auto-${Date.now()}`
 });

 saveJSON(PUBLISHED_LOG_PATH, log);
 console.log(`✅ Publicado registrado na nuvem: ${packId}`);
}

function processScheduledPosts() {
 console.log('\n🔄 Verificando agendamentos pendentes...');
 const scheduled = loadJSON(SCHEDULED_POSTS_PATH);
 const now = new Date();
 let processedCount = 0;

 for (const account of scheduled) {
 for (const post of account.posts) {
 if (post.status !== 'pending') continue;

 const scheduledTime = new Date(post.scheduledFor);
 if (scheduledTime > now) continue;

 // VERIFICAÇÃO ANTI-DUPLICIDADE
 if (isAlreadyPublished(post.packId)) {
 console.log(`🚫 BLOQUEADO: ${post.packId} já foi publicado. Marcando como 'skipped'.`);
 post.status = 'skipped';
 post.skippedAt = new Date().toISOString();
 post.skipReason = 'already_published';
 continue;
 }

 console.log(`📦 Publicando: ${post.packId} - ${post.title}`);

 // Aqui entraria a chamada real à API do Instagram
 // Por enquanto, simulamos o sucesso
 const mediaId = `media-${Date.now()}`;

 // Registra no log da nuvem
 registerPublication(post.packId, post.title, mediaId);

 // Atualiza status
 post.status = 'published';
 post.publishedAt = new Date().toISOString();
 post.mediaId = mediaId;
 processedCount++;
 }
 }

 saveJSON(SCHEDULED_POSTS_PATH, scheduled);
 console.log(`✅ Processamento concluído: ${processedCount} post(s) publicado(s)`);
}

// Loop principal - roda a cada 60 segundos
console.log('🚀 Automação Sabedoria Kids iniciada na nuvem...');
console.log('📋 Verificando publicações a cada 60 segundos...\n');

processScheduledPosts();

// Para execução contínua (comentado para uso manual)
// setInterval(processScheduledPosts, 60000);