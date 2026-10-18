// Date-scoped authorizations expire automatically at the BRT day boundary.
export function dailyCallLimit(state,day) {
  const override=state.policy.dailyCallOverrides?.[day];
  return Number.isSafeInteger(override)&&override>0?override:state.policy.maxCallsPerDay;
}
export function dailyInputTokenLimit(state,day) {
  const override=state.policy.dailyInputTokenOverrides?.[day];
  return Number.isSafeInteger(override)&&override>0?override:state.policy.maxInputTokensPerDay;
}
