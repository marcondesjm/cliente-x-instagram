const outputLimitForCall=state=>state.policy.maxOutputTokensPerCall||8000;
const boundedTransportFailure=(call,packId,latestId,state)=>call.id===latestId && call.status==='failed' && call.stage===`select:${packId}` && Number.isSafeInteger(call.maxOutputTokens) && call.maxOutputTokens>0 && call.maxOutputTokens<=outputLimitForCall(state) && (call.httpStatus===429 || call.httpStatus>=500 || call.httpStatus==null && /timeout|aborted|fetch failed|terminated/i.test(call.error||''));

export function recoverableUsageReceipt(state,now=new Date()) {
  const pilot=state.pilotRun,proof=state.recoveredUsageReceipt;
  const supportedCircuit=state.circuit==='invalid_usage_receipt' || proof?.status==='bounded_for_fresh_pilot' && ['provider_response_unconfirmed','provider_temporarily_unavailable'].includes(state.circuit);
  if(!supportedCircuit || state.enabled || state.billingMode!=='fixed_plan_user_confirmed' || pilot?.status!=='rejected' || !/^kids-biblia-\d{2}$/.test(pilot.packId || ''))return null;
  if(proof?.status==='bounded_for_fresh_pilot' && proof.packId===pilot.packId) {
    const receipt=(state.calls||[]).find(c=>c.id===proof.callId);
    const retryCalls=(state.calls||[]).filter(c=>(proof.recoveryPilotIds||[]).includes(c.pilotId));
    const fresh=Number.isFinite(Date.parse(proof.reconciledAt)) && now.getTime()-Date.parse(proof.reconciledAt)<24*60*60*1000;
    const exact=receipt?.pilotId===proof.pilotId && receipt.status==='completed' && receipt.stage===`select:${proof.packId}` && receipt.stopReason==='end_turn' && receipt.usageStatus==='unconfirmed_counted_at_maximum' && receipt.inputTokens==null && receipt.outputTokens===0;
    // Old selection replies are never reused; their full request bounds are charged and the next pilot starts fresh.
    const emptySelection=c=>c.status==='completed' && c.stage===`select:${proof.packId}` && c.stopReason==='end_turn' && c.usageStatus==='unconfirmed_counted_at_maximum' && c.inputTokens==null && (c.outputTokens==null || c.outputTokens===0);
    const validReceipt=c=>c.status==='completed' && (Number.isSafeInteger(c.inputTokens) && c.inputTokens>0 && c.inputTokens<=state.policy.maxInputTokensPerCall || c.inputTokens==null && c.usageStatus==='unconfirmed_counted_at_maximum') && Number.isSafeInteger(c.outputTokens) && c.outputTokens>0 && ['tool_use','end_turn'].includes(c.stopReason);
    const transportFailure=c=>boundedTransportFailure(c,proof.packId,state.calls.at(-1)?.id,state);
    const bounded=retryCalls.every(c=>validReceipt(c) || emptySelection(c) || transportFailure(c)) && retryCalls.filter(emptySelection).length<=2;
    const latestTransport=retryCalls.find(transportFailure);
    const retryAt=Date.parse(state.retryAfter || latestTransport?.completedAt || '');
    const cooldownPassed=state.circuit==='invalid_usage_receipt' || Number.isFinite(retryAt) && now.getTime()>=retryAt+(state.retryAfter?0:60*60*1000);
    if(fresh && exact && bounded && cooldownPassed && (proof.recoveryPilotIds||[]).length<3)return {...proof,inputTokensReserved:state.policy.maxInputTokensPerCall,outputTokensReserved:Number.isSafeInteger(receipt.maxOutputTokens)?receipt.maxOutputTokens:8000};
    return null;
  }
  if(state.circuit!=='invalid_usage_receipt')return null;
  const calls=(state.calls||[]).filter(c=>c.pilotId===pilot.id);
  if(calls.length<1 || calls.length>Math.min(10,pilot.maxCalls||10) || calls.some(c=>c.status==='reserved') || now.getTime()-Date.parse(pilot.startedAt)>=24*60*60*1000)return null;
  const uncertain=calls.filter(c=>c.inputTokens==null || !Number.isSafeInteger(c.outputTokens) || c.outputTokens<1);
  if(uncertain.length!==1)return null;
  const receipt=uncertain[0];
  const discardedResponse=state.lastResponse?.stage===receipt.stage && state.lastResponse.value==null;
  if(receipt.status!=='completed' || receipt.stage!==`select:${pilot.packId}` || receipt.stopReason!=='end_turn' || !discardedResponse || receipt.usageStatus!=='unconfirmed_counted_at_maximum' || receipt.inputTokens!=null || receipt.outputTokens!==0)return null;
  const inputUsed=calls.reduce((n,c)=>n+(Number.isSafeInteger(c.inputTokens)&&c.inputTokens>=0?c.inputTokens:state.policy.maxInputTokensPerCall),0);
  const outputUsed=calls.reduce((n,c)=>n+(Number.isSafeInteger(c.maxOutputTokens)?c.maxOutputTokens:outputLimitForCall(state)),0);
  if(inputUsed>Math.min(1200000,pilot.maxInputTokens||1200000) || outputUsed>Math.min(80000,pilot.maxOutputTokens||80000))return null;
  if(calls.some(c=>c!==receipt && (c.status!=='completed' || !Number.isSafeInteger(c.inputTokens) || c.inputTokens<1 || c.inputTokens>state.policy.maxInputTokensPerCall || !Number.isSafeInteger(c.outputTokens) || c.outputTokens<1 || c.stopReason!=='tool_use')))return null;
  return {callId:receipt.id,pilotId:pilot.id,packId:pilot.packId,inputTokensReserved:state.policy.maxInputTokensPerCall,outputTokensReserved:Number.isSafeInteger(receipt.maxOutputTokens)?receipt.maxOutputTokens:8000};
}
