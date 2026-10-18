import {controlSummary} from './claude-control.js';
export function watchdogQuotaWait(error,reserve,budget,now=new Date()) {
 const recovery=reserve.automaticRecovery;
 if(error?.account!=='cliente-x'||error.status!=='open'||error.stage!=='content-selection'||!/radar visual sem foto in[eé]dita|reserva autoral esgotada/i.test(error.error||''))return null;
 if(recovery?.phase!=='waiting_daily_budget'||recovery.available!==0||recovery.pendingSlot?.date!==error.date||Number(recovery.pendingSlot?.slotIndex)!==Number(error.slotIndex))return null;
 const summary=controlSummary(budget,reserve,now);
 if(summary.usage.remaining>=2&&summary.usage.inputTokenLimit-summary.usage.inputTokensAccounted>=2*budget.policy.maxInputTokensPerCall)return null;
 if(!(Date.parse(recovery.nextAttemptAt)>now.getTime()))return null;
 const when=new Date(recovery.nextAttemptAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
 return {ok:true,waiting:true,waitingReason:'daily_budget',nextAttemptAt:recovery.nextAttemptAt,runMode:'waiting-budget',message:`Recuperação aguardando limite interno da automação. Não há conteúdo novo aprovado nem orçamento para geração e revisão. Próxima tentativa prevista: ${when} (Brasília). Nenhum novo disparo foi criado; o horário permanece pendente.`};
}
