import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Configurações do gateway Anthropic fornecidas pelo usuário
const GATEWAY_URL = 'https://claude-ss.ia.br';
const API_KEY = 'kp_user_9gMrj-eeqoklSvqiw41PgD_466gD6Isl';

console.log('=== REABASTECIMENTO AUTOMÁTICO SABEDORIA KIDS ===');
console.log('Gateway:', GATEWAY_URL);
console.log('Executando reabastecimento local com modo calibrate...');

try {
  // Executar o script de reabastecimento em modo calibrate (sem chamadas pagas)
  const result = execSync(
    'node scripts/replenish-kids-scenes.mjs --calibrate --persist',
    {
      cwd: ROOT,
      env: {
        ...process.env,
        KIDS_VISION_ANTHROPIC_API_KEY: API_KEY,
        REVIEW_MODE: 'calibrate'
      },
      stdio: 'inherit'
    }
  );

  console.log('\n✓ Reabastecimento concluído com sucesso!');
} catch (error) {
  console.error('\n⚠️ Erro durante o reabastecimento:', error.message);
  console.log('\nPara configurar o reabastecimento completo, adicione a chave API nos secrets do GitHub:');
  console.log('https://github.com/marcondesjm/cliente-x-instagram/settings/secrets/actions');
}