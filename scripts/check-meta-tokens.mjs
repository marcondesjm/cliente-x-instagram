#!/usr/bin/env node

/**
 * Script para verificar a validade dos tokens da Meta (Instagram)
 * Usa verificação prática: tenta acessar o perfil para ver se o token funciona
 *
 * Tokens "never-expiring" da Meta duram ~540 dias (18 meses)
 *
 * Uso: node scripts/check-meta-tokens.mjs [--account <nome>] [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');

// Parse argumentos
const args = process.argv.slice(2);
const accountFilter = args.includes('--account') ? args[args.indexOf('--account') + 1] : null;
const dryRun = args.includes('--dry-run');

/**
 * Verifica se o token funciona tentando acessar o perfil do Instagram
 */
async function checkMetaTokenValidity(accessToken, userId) {
 if (!accessToken || !userId) {
 return { valid: false, error: 'Token ou User ID não configurados' };
 }

 try {
 const response = await fetch(
 `https://graph.facebook.com/v23.0/${encodeURIComponent(userId)}?fields=id,username&access_token=${encodeURIComponent(accessToken)}`,
 { signal: AbortSignal.timeout(10000) }
 );

 const data = await response.json().catch(() => ({}));

 if (!response.ok || data.error) {
 const errorMessage = data.error?.message || `HTTP ${response.status}`;
 const isExpired = data.error?.code === 190 ||
 data.error?.type === 'OAuthException' ||
 errorMessage.toLowerCase().includes('expired') ||
 errorMessage.toLowerCase().includes('invalid');

 return {
 valid: false,
 error: errorMessage,
 isExpired,
 errorCode: data.error?.code
 };
 }

 // Token funciona! Estimativa: tokens long-lived duram ~540 dias
 return {
 valid: true,
 username: data.username || userId,
 userId: data.id || userId
 };

 } catch (error) {
 return {
 valid: false,
 error: error.message || 'Erro ao verificar token'
 };
 }
}

/**
 * Carrega variáveis de ambiente do arquivo .env.local ou do processo
 */
function loadEnvVars() {
 const envLocalPath = join(ROOT, '.env.local');
 const envPath = join(ROOT, '.env');

 let envContent = '';
 try {
 envContent = readFileSync(envLocalPath, 'utf8');
 } catch {
 try {
 envContent = readFileSync(envPath, 'utf8');
 } catch {
 console.log('⚠️ Nenhum arquivo .env encontrado, usando variáveis do processo');
 return;
 }
 }

 envContent.split('\n').forEach(line => {
 const trimmed = line.trim();
 if (trimmed && !trimmed.startsWith('#')) {
 const [key, ...valueParts] = trimmed.split('=');
 const value = valueParts.join('=').trim();
 if (key && value && !process.env[key.trim()]) {
 process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
 }
 }
 });
}

async function main() {
 console.log('🔍 Verificando tokens da Meta (Instagram)...\n');
 console.log('ℹ️ Tokens "never-expiring" da Meta duram ~540 dias (18 meses)\n');

 loadEnvVars();

 let accounts = JSON.parse(readFileSync(ACCOUNTS_PATH, 'utf8'));

 if (accountFilter) {
 accounts = accounts.filter(a => a.account === accountFilter);
 if (accounts.length === 0) {
 console.error(`❌ Conta "${accountFilter}" não encontrada`);
 process.exit(1);
 }
 }

 const results = [];
 const now = new Date().toISOString();

 for (const account of accounts) {
 const accessToken = process.env[account.accessTokenEnv];
 const userId = process.env[account.userIdEnv];

 console.log(`\n📱 ${account.brandName || account.account} (${account.account})`);

 if (!accessToken || !userId) {
 console.log(` ⚠️ Token ou User ID não configurado`);
 console.log(` accessTokenEnv: ${account.accessTokenEnv}`);
 console.log(` userIdEnv: ${account.userIdEnv}`);

 if (!dryRun) {
 account.metaTokenLastChecked = now;
 account.metaTokenExpiry = null;
 }

 results.push({
 account: account.account,
 status: 'not_configured',
 message: 'Token ou User ID não configurado'
 });
 continue;
 }

 console.log(' Verificando se token funciona...');
 const validity = await checkMetaTokenValidity(accessToken, userId);

 if (validity.valid) {
 // Calcula dias restantes baseado na data salva ou estima 540 dias
 let daysUntilExpiry;
 let expiryDate;

 if (account.metaTokenExpiry) {
 // Usa data salva manualmente
 expiryDate = new Date(account.metaTokenExpiry);
 daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
 } else {
 // Estima 540 dias a partir de agora (token long-lived)
 expiryDate = new Date(Date.now() + (540 * 24 * 60 * 60 * 1000));
 daysUntilExpiry = 540;
 }

 console.log(` ✅ Token válido - @${validity.username}`);
 console.log(` Expiração estimada: ${daysUntilExpiry} dias (${expiryDate.toLocaleDateString('pt-BR')})`);

 if (!dryRun) {
 account.metaTokenLastChecked = now;
 // Só salva se não tiver data já definida
 if (!account.metaTokenExpiry) {
 account.metaTokenExpiry = expiryDate.toISOString();
 }
 }

 results.push({
 account: account.account,
 status: 'valid',
 username: validity.username,
 daysUntilExpiry,
 expiryDate: expiryDate.toLocaleDateString('pt-BR')
 });
 } else {
 const statusIcon = validity.isExpired ? '⏰' : '❌';
 const statusText = validity.isExpired ? 'EXPIRADO' : 'INVÁLIDO';
 console.log(` ${statusIcon} Token ${statusText}: ${validity.error}`);

 if (!dryRun) {
 account.metaTokenLastChecked = now;
 account.metaTokenExpiry = null;
 }

 results.push({
 account: account.account,
 status: validity.isExpired ? 'expired' : 'invalid',
 error: validity.error
 });
 }
 }

 // Salva alterações no accounts.json se não for dry-run
 if (!dryRun) {
 writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2) + '\n', 'utf8');
 console.log('\n💾 Arquivo accounts.json atualizado');
 } else {
 console.log('\n🔍 Dry run - nenhuma alteração foi salva');
 }

 // Resumo
 console.log('\n' + '='.repeat(70));
 console.log('RESUMO:');
 const validCount = results.filter(r => r.status === 'valid').length;
 const expiredCount = results.filter(r => r.status === 'expired').length;
 const invalidCount = results.filter(r => r.status === 'invalid').length;
 const notConfiguredCount = results.filter(r => r.status === 'not_configured').length;

 console.log(` ✅ Válidos: ${validCount}`);
 console.log(` ⏰ Expirados: ${expiredCount}`);
 console.log(` ❌ Inválidos: ${invalidCount}`);
 console.log(` ⚠️ Não configurados: ${notConfiguredCount}`);
 console.log('='.repeat(70));

 // Alertas críticos
 if (expiredCount > 0 || invalidCount > 0) {
 console.log('\n🚨 AÇÃO NECESSÁRIA:');
 results.filter(r => r.status === 'expired' || r.status === 'invalid').forEach(r => {
 console.log(` • ${r.account}: ${r.error || 'Token expirado'}`);
 });
 console.log('\n Para renovar:');
 console.log(' 1. Acesse developers.facebook.com/apps');
 console.log(' 2. Selecione o app correspondente');
 console.log(' 3. Gere um novo token de acesso de longa duração (~540 dias)');
 console.log(' 4. Atualize no Vercel (Variáveis de Ambiente)');
 console.log(' 5. Execute este script novamente para verificar');
 } else if (validCount > 0) {
 console.log('\n✅ Todos os tokens configurados estão funcionando!');
 }

 // Exit code baseado nos resultados
 if (expiredCount > 0 || invalidCount > 0) {
 process.exit(2); // Tokens problemáticos encontrados
 }
}

main().catch(error => {
 console.error('\n❌ Erro fatal:', error.message);
 process.exit(1);
});