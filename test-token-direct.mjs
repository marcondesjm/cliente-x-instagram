#!/usr/bin/env node

/**
 * Teste direto do token da Meta (Instagram) - sem depender de .env
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const ENV_PATH = join(ROOT, '.env');

// Carrega variáveis do .env manualmente
const envContent = readFileSync(ENV_PATH, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
 const trimmed = line.trim();
 if (trimmed && !trimmed.startsWith('#')) {
 const [key, ...valueParts] = trimmed.split('=');
 const value = valueParts.join('=').trim();
 if (key && value) {
 envVars[key.trim()] = value.replace(/^["']|["']$/g, '');
 }
 }
});

const accessToken = envVars.CLIENTE_X_INSTAGRAM_ACCESS_TOKEN;
const userId = envVars.CLIENTE_X_INSTAGRAM_USER_ID;

console.log('🔍 Testando token da Meta (Instagram)...\n');
console.log(`User ID: ${userId || 'NÃO CONFIGURADO'}`);
console.log(`Token: ${accessToken ? `${accessToken.substring(0, 30)}... (${accessToken.length} chars)` : 'NÃO CONFIGURADO'}\n`);

if (!accessToken || !userId) {
 console.log('❌ Token ou User ID não encontrados no arquivo .env');
 process.exit(1);
}

async function testToken() {
 try {
 console.log('Testando acesso à API do Instagram...');
 const response = await fetch(
 `https://graph.facebook.com/v23.0/${encodeURIComponent(userId)}?fields=id,username&access_token=${encodeURIComponent(accessToken)}`,
 { signal: AbortSignal.timeout(10000) }
 );

 const data = await response.json();

 if (!response.ok || data.error) {
 console.log('❌ Token INVÁLIDO ou EXPIRADO:');
 console.log(` Erro: ${data.error?.message || `HTTP ${response.status}`}`);
 console.log(` Código: ${data.error?.code}`);
 console.log('\n💡 Tokens "never-expiring" podem ser invalidados se:');
 console.log(' • O app foi desativado no Facebook Developer');
 console.log(' • A senha do Facebook foi alterada');
 console.log(' • As permissões foram revogadas manualmente');
 console.log(' • O token foi gerado há mais de ~540 dias');
 process.exit(1);
 } else {
 console.log('✅ Token VÁLIDO e FUNCIONANDO!');
 console.log(` Username: @${data.username || userId}`);
 console.log(` User ID: ${data.id || userId}`);
 console.log('\nℹ️ Status: Token operacional');
 console.log(' Tokens long-lived da Meta duram ~540 dias (18 meses)');
 }
 } catch (error) {
 console.log('❌ Erro ao testar token:', error.message);
 process.exit(1);
 }
}

testToken();