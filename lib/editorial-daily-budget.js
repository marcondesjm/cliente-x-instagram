// Date-scoped authorizations expire automatically at the BRT day boundary.
export const usesProviderQuota=state=>state.policy?.quotaMode==='provider'&&state.billingMode==='fixed_plan_user_confirmed'&&state.provider==='claude-ss';
export function dailyCallLimit(state,day) {
  if(usesProviderQuota(state))return Infinity;
  const override=state.policy.dailyCallOverrides?.[day];
  return Number.isSafeInteger(override)&&override>0?override:state.policy.maxCallsPerDay;
}
export function dailyInputTokenLimit(state,day) {
  if(usesProviderQuota(state))return Infinity;
  const override=state.policy.dailyInputTokenOverrides?.[day];
  return Number.isSafeInteger(override)&&override>0?override:state.policy.maxInputTokensPerDay;
}

export function authorialProviderRetry(budget, now = new Date()) {
  if (budget.circuit !== 'provider_response_unconfirmed' || budget.calls.some(call => call.status === 'reserved')) return null;
  const last = budget.calls.at(-1);
  if (last?.status !== 'failed' || !last.stage?.startsWith('authorial:') || last.failureKind === 'local_validation') return null;
  if (last.httpStatus != null && ![408, 429, 500, 502, 503, 504, 529].includes(last.httpStatus)) return null;
  const completedAt = Date.parse(last.completedAt);
  if (!Number.isFinite(completedAt) || completedAt >= now.getTime()) return null;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const failureDay = formatter.format(completedAt);
  const day = formatter.format(now);
  const sameDayAllowed = usesProviderQuota(budget) && budget.authorialProviderRetryDay !== day;
  const nextDay = Date.parse(failureDay + 'T00:00:00-03:00') + 86_400_000;
  const eligibleAt = sameDayAllowed ? Math.min(completedAt + 30 * 60_000, nextDay) : nextDay;
  return { eligibleAt: new Date(eligibleAt).toISOString(), ready: now.getTime() >= eligibleAt, sameDay: day === failureDay, day };
}
