#!/usr/bin/env node

/**
 * Lê o token do .env e testa se está funcionando na API da Meta
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const ENV_PATH = join(ROOT, '.env');

// Lê o arquivo .env
const envContent = readFileSync(ENV_PATH, 'utf8');

// Encontra a linha do CLIENTE_X_INSTAGRAM_ACCESS_TOKEN
const tokenLine = envContent.split('\n').find(line =>
  line.trim().startsWith('CLIENTE_X_INSTAGRAM_ACCESS_TOKEN=')
);

if (!tokenLine) {
 console.log('❌ CLIENTE_X_INSTAGRAM_ACCESS_TOKEN não encontrado no .env');
 process.exit(1);
}

// Extrai o valor do token (tudo após o primeiro =)
const token = tokenLine.substring(tokenLine.indexOf('=') + 1).trim();
const userId = '17841404470203300';

console.log('🔍 Testando token da Meta (Instagram)...\n');
console.log(`User ID: ${userId}`);
console.log(`Token: ${token.substring(0, 30)}... (${token.length} chars)\n`);

async function testar() {
 try {
 const response = await fetch(
 `https://graph.facebook.com/v23.0/${encodeURIComponent(userId)}?fields=id,username&access_token=${encodeURIComponent(token)}`,
 { signal: AbortSignal.timeout(10000) }
 );

 const data = await response.json();

 if (!response.ok || data.error) {
 console.log('❌ Token INVÁLIDO ou EXPIRADO:');
 console.log(` Erro: ${data.error?.message || `HTTP ${response.status}`}`);
 console.log(` Código: ${data.error?.code}`);
 console.log('\n💡 Motivos comuns:');
 console.log(' • Token expirou (tokens long-lived duram ~60 dias)');
 console.log(' • Senha do Facebook foi alterada');
 console.log(' • App desativado no Meta for Developers');
 console.log(' • Permissões revogadas manualmente');
 console.log('\n🔄 Para gerar novo token:');
 console.log(' 1. Acesse developers.facebook.com/tools/explorer/');
 console.log(' 2. Selecione seu app');
 console.log(' 3. Gere um token com permissões instagram_basic, pages_show_list');
 console.log(' 4. Troque por um token long-lived via Graph API');
 process.exit(1);
 } else {
 console.log('✅ Token VÁLIDO e FUNCIONANDO!');
 console.log(` Username: @${data.username || userId}`);
 console.log(` User ID: ${data.id || userId}`);
 console.log('\nℹ️ Próximo passo:');
 console.log(' Este token está válido. Se estava dando erro antes, pode ter sido');
 console.log(' um problema temporário ou você já gerou um novo.');
 }
 } catch (error) {
 console.log('❌ Erro de conexão:', error.message);
 process.exit(1);
 }
}

testar();