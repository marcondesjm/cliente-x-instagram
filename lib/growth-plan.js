export const GROWTH_FILE = 'automation/instagram-template/config/growth-plans.json';
export const METRICS = ['reach', 'saves', 'shares', 'profileVisits', 'clicks', 'conversations', 'sales'];
export function normalizeGrowthPlan(input = {}) {
  const fail = (message) => { const error = new Error(message); error.statusCode = 400; throw error; };
  const bio = String(input.bio || '').trim();
  if ([...bio].length > 150) fail('A bio deve ter até 150 caracteres.');
  const startDate = String(input.startDate || '');
  if (startDate && (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !Number.isFinite(Date.parse(startDate)) || new Date(startDate).toISOString().slice(0, 10) !== startDate)) fail('Data de início inválida.');
  const checks = Object.fromEntries(['audience', 'bio', 'demo', 'offer', 'baseline'].map(key => [key, input.checks?.[key] === true]));
  const periods = {};
  for (const period of ['before', 'after']) {
    periods[period] = {};
    for (const key of METRICS) {
      const raw = input.periods?.[period]?.[key];
      if (raw === null || raw === undefined || raw === '') { periods[period][key] = null; continue; }
      if (!['number', 'string'].includes(typeof raw)) fail('Métrica inválida.');
      const value = Number(raw);
      if (!Number.isSafeInteger(value) || value < 0 || value > 1000000000) fail('Use números inteiros entre 0 e 1 bilhão.');
      periods[period][key] = value;
    }
  }
  return { bio, startDate, checks, periods };
}

export function updateGrowthRecord(records, account, plan, revision) {
  const previous = records.find(item => item.account === account);
  if ((previous?.revision || 0) !== revision) {
    const error = new Error('O plano mudou em outra sessão. Recarregue antes de salvar.');
    error.statusCode = 409;
    throw error;
  }
  const record = { account, revision: revision + 1, updatedAt: new Date().toISOString(), plan: normalizeGrowthPlan(plan) };
  return { record, records: [...records.filter(item => item.account !== account), record] };
}
