import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const ACCOUNTS_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'accounts.json');

/**
 * Verifica a validade do token tentando acessar o perfil do Instagram
 * Se funcionar, o token é válido. A Meta não expõe data de expiração via API pública.
 */
async function checkMetaTokenValidity(accessToken, userId) {
 if (!accessToken || !userId) {
 return { valid: false, error: 'Token ou User ID não configurados' };
 }

 try {
 // Tenta acessar o perfil - se funcionar, token é válido
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

 // Token válido! Como a Meta não expõe expiry via API pública,
 // assumimos que tokens long-lived duram ~540 dias (18 meses)
 // ou ~60 dias para tokens padrão
 const now = new Date();
 const estimatedExpiry = new Date(now.getTime() + (540 * 24 * 60 * 60 * 1000));

 return {
 valid: true,
 username: data.username || userId,
 userId: data.id || userId,
 // Não temos como saber a data exata sem debug_token com App Token
 // Mas tokens gerados pelo painel da Meta geralmente são long-lived (~540 dias)
 estimatedExpiryDays: 540,
 estimatedExpiryDate: estimatedExpiry.toISOString()
 };

 } catch (error) {
 return {
 valid: false,
 error: error.message || 'Erro ao verificar token'
 };
 }
}

export default async function handler(req, res) {
 if (req.method !== 'GET') {
 return res.status(405).json({ error: 'Método não permitido' });
 }

 try {
 const accounts = JSON.parse(readFileSync(ACCOUNTS_PATH, 'utf8'));
 const accountKey = req.query.account;
 let targetAccounts = accounts;

 if (accountKey) {
 targetAccounts = accounts.filter(a => a.account === accountKey);
 if (targetAccounts.length === 0) {
 return res.status(404).json({ error: 'Conta não encontrada' });
 }
 }

 const results = [];

 for (const account of targetAccounts) {
 const accessTokenEnv = account.accessTokenEnv;
 const userIdEnv = account.userIdEnv;
 const accessToken = process.env[accessTokenEnv];
 const userId = process.env[userIdEnv];

 if (!accessToken || !userId) {
 results.push({
 account: account.account,
 brandName: account.brandName,
 status: 'not_configured',
 message: 'Token ou User ID não configurado',
 accessTokenEnv,
 userIdEnv,
 alert: {
 type: 'critical',
 message: 'Token não configurado. Configure no Vercel.',
 action: 'Adicionar variável no Vercel: Settings > Environment Variables'
 }
 });
 continue;
 }

 const validity = await checkMetaTokenValidity(accessToken, userId);

 // Atualiza o accounts.json com a data estimada
 const now = new Date().toISOString();
 account.metaTokenLastChecked = now;
 if (validity.valid && validity.estimatedExpiryDate) {
 // Só atualiza se não tiver uma data já salva (preserva data manual)
 if (!account.metaTokenExpiry) {
 account.metaTokenExpiry = validity.estimatedExpiryDate;
 }
 }

 let status = 'valid';
 let alert = null;

 if (!validity.valid) {
 status = 'expired';
 alert = {
 type: 'critical',
 message: `Token expirado ou inválido. Renovar imediatamente.`,
 action: 'Gerar novo token em developers.facebook.com/apps e atualizar no Vercel'
 };
 } else {
 // Calcula dias baseados na data salva ou estimada
 const expiryDate = account.metaTokenExpiry ? new Date(account.metaTokenExpiry) : new Date(validity.estimatedExpiryDate);
 const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

 if (daysUntilExpiry <= 7) {
 status = 'expiring_soon';
 alert = {
 type: 'warning',
 message: `Token pode expirar em ${daysUntilExpiry} dias (${expiryDate.toLocaleDateString('pt-BR')}). Tokens Meta duram ~540 dias.`,
 action: 'Verificar se token ainda funciona. Se falhar, renovar.'
 };
 } else if (daysUntilExpiry <= 30) {
 status = 'expiring_warning';
 alert = {
 type: 'info',
 message: `Token estimado expirar em ${daysUntilExpiry} dias (${expiryDate.toLocaleDateString('pt-BR')})`,
 action: 'Monitorar - tokens Meta duram ~540 dias após geração'
 };
 } else {
 status = 'valid';
 alert = {
 type: 'success',
 message: `Token válido (~${daysUntilExpiry} dias restantes, estimado)`,
 action: null
 };
 }

 results.push({
 account: account.account,
 brandName: account.brandName,
 status,
 validity: validity.valid ? {
 username: validity.username,
 estimatedExpiryDays: validity.estimatedExpiryDays
 } : null,
 daysUntilExpiry,
 metaTokenExpiry: account.metaTokenExpiry,
 metaTokenLastChecked: account.metaTokenLastChecked,
 alert,
 accessTokenEnv,
 userIdEnv
 });
 }

 // Salva as atualizações no accounts.json
 writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2) + '\n', 'utf8');

 return res.status(200).json({
 success: true,
 timestamp: new Date().toISOString(),
 accounts: results
 });

 } catch (error) {
 console.error('Erro ao verificar status do token Meta:', error);
 return res.status(500).json({
 success: false,
 error: error.message || 'Erro interno ao verificar token'
 });
 }
}