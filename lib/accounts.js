export const DEFAULT_ACCOUNT = 'cliente-x';

export function normalizeAccountKey(value) {
  const account = String(value || DEFAULT_ACCOUNT).trim();
  if (!/^[a-z0-9][a-z0-9_-]{1,60}$/i.test(account)) {
    const error = new Error('Conta invalida. Use letras, numeros, hifen ou underline.');
    error.statusCode = 400;
    throw error;
  }
  return account;
}

export function accountFromQuery(req) {
  return normalizeAccountKey(req.query?.account || DEFAULT_ACCOUNT);
}

export function accountFromBody(body) {
  return normalizeAccountKey(body?.account || DEFAULT_ACCOUNT);
}

export function findAccount(accounts, accountKey) {
  return accounts.find((item) => item.account === accountKey);
}

export function requireConfiguredAccount(accounts, accountKey) {
  const account = findAccount(accounts, accountKey);
  if (!account) throw new Error(`Conta ${accountKey} nao encontrada em accounts.json.`);
  return account;
}
