#!/usr/bin/env node

/**
 * Testa qualquer token do Instagram sem salvar no .env
 * Uso: node testar-token.mjs <SEU_TOKEN_AQUI> [USER_ID]
 */

const token = process.argv[2];
const userId = process.argv[3] || '17841404470203300';

if (!token) {
  console.log('❌ Uso: node testar-token.mjs <SEU_TOKEN_AQUI> [USER_ID]');
  console.log('Exemplo: node testar-token.mjs EAASzEPd8... 17841404470203300');
  process.exit(1);
}

console.log('🔍 Testando token na API da Meta...\n');
console.log(`User ID: ${userId}`);
console.log(`Token: ${token.substring(0, 25)}... (${token.length} caracteres)\n`);

async function testar() {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${encodeURIComponent(userId)}?fields=id,username&access_token=${encodeURIComponent(token)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.log('❌ Token INVÁLIDO ou EXPIRADO:');
      console.log(`   Erro: ${data.error?.message || `HTTP ${response.status}`}`);
      console.log(`   Código: ${data.error?.code}`);
      console.log('\n💡 Motivos comuns:');
      console.log('   • Token expirou (tokens long-lived duram 60 dias)');
      console.log('   • Senha do Facebook foi alterada');
      console.log('   • App desativado no Meta for Developers');
      process.exit(1);
    } else {
      console.log('✅ Token VÁLIDO e FUNCIONANDO!');
      console.log(`   Username: @${data.username || userId}`);
      console.log(`   User ID: ${data.id || userId}`);
      console.log('\nℹ️ Próximo passo:');
      console.log('   Atualize este token no arquivo .env e no Vercel (Settings > Environment Variables).');
    }
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    process.exit(1);
  }
}

testar();