import fs from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const C = 'automation/instagram-template/config/';

// Ler estado atual
const stateFile = C + 'kids-scene-replenishment.json';
const state = JSON.parse(fs.readFileSync(resolve(ROOT, stateFile), 'utf8'));

// Ativar reabastecimento automático
state.enabled = true;
state.circuit = null;
state.health = 'ok';
state.message = '';
state.lastReviewAt = new Date().toISOString();

// Salvar estado atualizado
fs.writeFileSync(resolve(ROOT, stateFile), JSON.stringify(state, null, 2) + '\n', 'utf8');

console.log('✓ Reabastecimento automático ATIVADO');
console.log('Estado:', state.enabled);
console.log('Circuit:', state.circuit || 'Nenhum bloqueio');
console.log('Health:', state.health);
console.log('');
console.log('PRÓXIMO PASSO: Configure a chave KIDS_VISION_ANTHROPIC_API_KEY nos secrets do GitHub');
console.log('Acesse: https://github.com/marcondesjm/cliente-x-instagram/settings/secrets/actions');
console.log('Adicione o secret: KIDS_VISION_ANTHROPIC_API_KEY com sua chave da API Anthropic');