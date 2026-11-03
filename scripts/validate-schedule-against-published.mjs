import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.cwd(), 'automation', 'instagram-template', 'config');
const PUBLISHED_LOG_PATH = join(CONFIG_DIR, 'published-log.json');
const SCHEDULED_POSTS_PATH = join(CONFIG_DIR, 'scheduled-posts.json');

/**
 * Valida a fila de agendamento contra o log de publicações na nuvem.
 * Remove automaticamente qualquer item que já tenha sido publicado.
 */

function loadJSON(path) {
 try {
 return JSON.parse(readFileSync(path, 'utf-8'));
 } catch (error) {
 return [];
 }
}

const publishedLog = loadJSON(PUBLISHED_LOG_PATH);
const scheduledPosts = loadJSON(SCHEDULED_POSTS_PATH);

if (!Array.isArray(scheduledPosts)) {
 console.log('Nenhum agendamento encontrado.');
 process.exit(0);
}

let removedCount = 0;
const cleanedSchedule = [];

for (const account of scheduledPosts) {
 const validPosts = account.posts.filter(post => {
 if (!post.packId) return true;

 const isPublished = publishedLog.some(entry => entry.packId === post.packId);

 if (isPublished) {
 console.log(`🚫 BLOQUEADO: Pack "${post.packId}" já foi publicado em ${new Date(publishedLog.find(e => e.packId === post.packId).publishedAt).toLocaleDateString('pt-BR')}. Removendo da fila.`);
 removedCount++;
 return false;
 }

 return true;
 });

 if (validPosts.length > 0 || account.posts.length === 0) {
 cleanedSchedule.push({ ...account, posts: validPosts });
 }
}

if (removedCount > 0) {
 console.log(`\n✅ Fila limpa: ${removedCount} item(s) removido(s) por duplicidade.`);
 // Nota: Não salvamos automaticamente para permitir revisão manual antes
 console.log('⚠️ Arquivo não alterado automaticamente. Revise os itens acima.');
} else {
 console.log('✅ Todos os itens agendados são novos. Nenhuma duplicidade encontrada.');
}