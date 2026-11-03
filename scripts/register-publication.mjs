import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.cwd(), 'automation', 'instagram-template', 'config');
const PUBLISHED_LOG_PATH = join(CONFIG_DIR, 'published-log.json');
const CONTENT_PACKS_PATH = join(CONFIG_DIR, 'content-packs.json');

/**
 * Registra uma publicação no log centralizado (nuvem)
 * Uso: node register-publication.mjs <packId> [mediaId]
 */

function loadPublishedLog() {
 try {
 const data = readFileSync(PUBLISHED_LOG_PATH, 'utf-8');
 return JSON.parse(data);
 } catch (error) {
 return [];
 }
}

function savePublishedLog(log) {
 writeFileSync(PUBLISHED_LOG_PATH, JSON.stringify(log, null, 2), 'utf-8');
 console.log('✅ Registro salvo na nuvem.');
}

function getPackTitle(packId) {
 try {
 const data = readFileSync(CONTENT_PACKS_PATH, 'utf-8');
 const packs = JSON.parse(data);
 const pack = packs.find(p => p.id === packId);
 return pack ? pack.title : 'Título não encontrado';
 } catch (error) {
 return 'Título não encontrado';
 }
}

const packId = process.argv[2];
const mediaId = process.argv[3] || `auto-${Date.now()}`;

if (!packId) {
 console.error('❌ Erro: packId é obrigatório');
 console.error('Uso: node register-publication.mjs <packId> [mediaId]');
 process.exit(1);
}

const log = loadPublishedLog();

// Verifica se já foi publicado
if (log.some(entry => entry.packId === packId)) {
 console.warn(`⚠️ Atenção: ${packId} já está registrado como publicado.`);
 console.log('Nenhuma ação necessária.');
 process.exit(0);
}

// Registra nova publicação
log.push({
 packId,
 title: getPackTitle(packId),
 publishedAt: new Date().toISOString(),
 status: 'published',
 mediaId
});

savePublishedLog(log);
console.log(`✅ Pack "${packId}" registrado com sucesso.`);
console.log(`📅 Publicado em: ${new Date().toLocaleString('pt-BR')}`);