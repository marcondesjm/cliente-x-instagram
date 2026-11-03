#!/usr/bin/env node

/**
 * Teste rápido para verificar se o token da Meta está funcionando
 */

const accessToken = process.env.CLIENTE_X_INSTAGRAM_ACCESS_TOKEN;
const userId = process.env.CLIENTE_X_INSTAGRAM_USER_ID;

console.log('🔍 Testando token da Meta (Instagram)...\n');
console.log(`User ID: ${userId || 'NÃO CONFIGURADO'}`);
console.log(`Token: ${accessToken ? `${accessToken.substring(0, 20)}...` : 'NÃO CONFIGURADO'}\n`);

if (!accessToken || !userId) {
 console.log('❌ Token ou User ID não configurados nas variáveis de ambiente.');
 process.exit(1);
}

async function testToken() {
 try {
 const response = await fetch(
 `https://graph.facebook.com/v23.0/${encodeURIComponent(userId)}?fields=id,username&access_token=${encodeURIComponent(accessToken)}`,
 { signal: AbortSignal.timeout(10000) }
 );

 const data = await response.json();

 if (!response.ok || data.error) {
 console.log('❌ Token INVÁLIDO ou EXPIRADO:');
 console.log(`   Erro: ${data.error?.message || `HTTP ${response.status}`}`);
 console.log('\n💡 Isso pode acontecer mesmo com tokens "never-expiring" se:');
 console.log('   • O app foi desativado/deletado no Facebook Developer');
 console.log('   • A senha do Facebook foi alterada');
 console.log('   • As permissões foram revogadas manualmente');
 process.exit(1);
 } else {
 console.log('✅ Token VÁLIDO!');
 console.log(`   Username: @${data.username || userId}`);
 console.log(`   User ID: ${data.id || userId}`);
 console.log('\nℹ️ Tokens "never-expiring" da Meta duram ~540 dias (18 meses)');
 console.log('   Eles podem ser invalidados se:');
 console.log('   • Senha do Facebook for alterada');
 console.log('   • App for desativado no Developer Dashboard');
 console.log('   • Permissões forem revogadas manualmente');
 }
 } catch (error) {
 console.log('❌ Erro ao testar token:', error.message);
 process.exit(1);
 }
}

testToken();