import fs from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const C = 'automation/instagram-template/config/';

function checkStock() {
  const packsFile = C + 'content-packs.json';
  const histFile = C + 'publication-history.json';

  const packs = JSON.parse(fs.readFileSync(resolve(ROOT, packsFile), 'utf8'))
    .find(g => g.account === 'sabedoria-kids').packs;
  const hist = JSON.parse(fs.readFileSync(resolve(ROOT, histFile), 'utf8'))['sabedoria-kids'] || [];

  const published = new Set(hist.map(h => h.topic));
  const unpublished = packs.filter(p => !published.has(p.id));

  console.log('=== STATUS SABEDORIA KIDS ===');
  console.log(`Total packs: ${packs.length}`);
  console.log(`Publicados: ${published.size}`);
  console.log(`Disponíveis: ${unpublished.length}`);
  console.log('');

  if (unpublished.length <= 5) {
    console.log('🔴 CRÍTICO: Menos de 5 packs disponíveis!');
    console.log('Ação necessária: Adicione novos packs urgentemente ou configure a chave API para reabastecimento automático.');
    process.exit(1);
  } else if (unpublished.length <= 10) {
    console.log('🟡 ATENÇÃO: Apenas', unpublished.length, 'packs disponíveis.');
    console.log('Recomendação: Configure o reabastecimento automático ou adicione mais packs em breve.');
  } else {
    console.log('🟢 OK:', unpublished.length, 'packs disponíveis. Estoque suficiente.');
  }

  // Verificar estado do reabastecimento automático
  const stateFile = C + 'kids-scene-replenishment.json';
  const state = JSON.parse(fs.readFileSync(resolve(ROOT, stateFile), 'utf8'));
  console.log('');
  console.log('=== REABASTECIMENTO AUTOMÁTICO ===');
  console.log(`Enabled: ${state.enabled ? '✓ Sim' : '✗ Não'}`);
  console.log(`Circuit: ${state.circuit || 'Nenhum bloqueio'}`);
  console.log(`Último piloto: ${state.pilotRun?.status || 'Nunca executado'}`);

  if (!state.enabled) {
    console.log('');
    console.log('⚠️ Reabastecimento automático DESATIVADO');
    console.log('Para ativar, execute: node scripts/enable-auto-replenish.mjs');
  }
}

checkStock();