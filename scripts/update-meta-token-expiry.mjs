#!/usr/bin/env node

/**
 * Script para atualizar manualmente a data de expiração do token da Meta
 * Uso: node scripts/update-meta-token-expiry.mjs --account <nome> --expiry <YYYY-MM-DD ou dias>
 * Exemplos:
 *   --account cliente-x --expiry 2026-12-31
 *   --account cliente-x --expiry 60 (daqui a 60 dias)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');

const args = process.argv.slice(2);
const accountName = args.includes('--account') ? args[args.indexOf('--account') + 1] : null;
const expiryValue = args.includes('--expiry') ? args[args.indexOf('--expiry') + 1] : null;

if (!accountName || !expiryValue) {
 console.log('Uso: node scripts/update-meta-token-expiry.mjs --account <nome> --expiry <YYYY-MM-DD ou dias>');
 console.log('Exemplos:');
 console.log('  --account cliente-x --expiry 2026-12-31');
 console.log('  --account cliente-x --expiry 60');
 process.exit(1);
}

let accounts = JSON.parse(readFileSync(ACCOUNTS_PATH, 'utf8'));
const account = accounts.find(a => a.account === accountName);

if (!account) {
 console.error(`Conta "${accountName}" não encontrada`);
 process.exit(1);
}

// Calcula a data de expiração
let expiryDate;
if (/^\d{4}-\d{2}-\d{2}$/.test(expiryValue)) {
 // Data específica
 expiryDate = new Date(expiryValue + 'T12:00:00.000Z');
} else if (/^\d+$/.test(expiryValue)) {
 // Número de dias a partir de hoje
 const days = parseInt(expiryValue);
 expiryDate = new Date();
 expiryDate.setDate(expiryDate.getDate() + days);
} else {
 console.error('Formato de expiração inválido. Use YYYY-MM-DD ou número de dias.');
 process.exit(1);
}

const now = new Date().toISOString();

account.metaTokenExpiry = expiryDate.toISOString();
account.metaTokenLastChecked = now;

writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2) + '\n', 'utf8');

console.log(`✅ Token da conta "${accountName}" atualizado:`);
console.log(`   Expiração: ${expiryDate.toLocaleDateString('pt-BR')}`);
console.log(`   Última verificação: ${new Date(now).toLocaleDateString('pt-BR')}`);

// Calcula dias restantes
const diffMs = expiryDate.getTime() - Date.now();
const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
console.log(`   Dias restantes: ${daysLeft}`);