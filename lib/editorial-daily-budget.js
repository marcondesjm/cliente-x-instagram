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
