export function recoverTransientCalls(state,now=new Date()) {
 if(state.billingMode!=='fixed_plan_user_confirmed')return false;
 if(state.circuit && state.circuit!=='provider_temporarily_unavailable')return false;
 let changed=false;
 for(const call of state.calls.filter(c=>c.status==='reserved' && Date.parse(c.startedAt)+30*60*1000<=now.getTime())) {
  // A cancelled 25-minute review workflow can no longer have an active request.
  // Keep its usage unconfirmed; budget accounting charges the per-call maximum.
  call.status='interrupted';call.completedAt=now.toISOString();call.inputTokens=null;call.error='Workflow interrompido antes do recibo.';
  state.circuit='provider_temporarily_unavailable';state.retryAfter=new Date(Date.parse(call.startedAt)+60*60*1000).toISOString();changed=true;
 }
 if(state.circuit==='provider_temporarily_unavailable' && Date.parse(state.retryAfter)<=now.getTime()) {
  state.circuit=null;delete state.retryAfter;changed=true;
 }
 return changed;
}
