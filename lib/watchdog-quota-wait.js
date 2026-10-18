import {controlSummary} from './claude-control.js';
export function watchdogQuotaWait(error,reserve,budget,now=new Date()) {
 const recovery=reserve.automaticRecovery;
 if(error?.account!=='cliente-x'||error.status!=='open'||error.stage!=='content-selection'||!/radar visual sem foto in[eé]dita|reserva autoral esgotada/i.test(error.error||''))return null;
 if(!['waiting_daily_budget','waiting_review_backoff'].includes(recovery?.phase)||recovery.available!==0||recovery.pendingSlot?.date!==error.date||Number(recovery.pendingSlot?.slotIndex)!==Number(error.slotIndex))return null;
 if(recovery.phase==='waiting_review_backoff'){
  const next=recovery.retryAfter||recovery.nextAttemptAt;
  if(!(Date.parse(next)>now.getTime()))return null;
  return {ok:true,waiting:true,waitingReason:'editorial_review',waitingLabel:'Aguardando reposição revisada',nextAttemptAt:next,runMode:'waiting-stock',message:`A reserva não tem pauta nova aprovada. A reposição está no intervalo de revisão e retomará a partir de ${new Date(next).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})} (Brasília). Nenhuma publicação foi enviada; o horário permanece pendente.`};
 }
 const summary=controlSummary(budget,reserve,now);
 if(summary.quotaMode==='provider')return null;
 if(summary.usage.remaining>=2&&summary.usage.inputTokenLimit-summary.usage.inputTokensAccounted>=2*budget.policy.maxInputTokensPerCall)return null;
 if(!(Date.parse(recovery.nextAttemptAt)>now.getTime()))return null;
 const when=new Date(recovery.nextAttemptAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
 return {ok:true,waiting:true,waitingReason:'daily_budget',nextAttemptAt:recovery.nextAttemptAt,runMode:'waiting-budget',message:`Recuperação aguardando limite interno da automação. Não há conteúdo novo aprovado nem orçamento para geração e revisão. Próxima tentativa prevista: ${when} (Brasília). Nenhum novo disparo foi criado; o horário permanece pendente.`};
}
