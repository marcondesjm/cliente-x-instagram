import {dailyCallLimit,dailyInputTokenLimit} from './editorial-daily-budget.js';
export const CLAUDE_CONFIG='automation/instagram-template/config/';
export const CLAUDE_SCOPES={
 'cliente-x':{budget:'editorial-api-validation.json',stock:'authorial-reserve.json',workflow:'authorial-reserve.yml'},
 'sabedoria-kids':{budget:'kids-scene-replenishment.json',stock:'kids-scene-replenishment.json',workflow:'kids-scene-replenishment.yml'}
};
export const brtDay=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function controlSummary(budget,stock,now=new Date()) {
 const day=brtDay(now),calls=budget.calls||[],today=calls.filter(c=>c.day===day);
 const used=today.reduce((sum,c)=>sum+(Number.isSafeInteger(c.inputTokens)&&c.inputTokens>=0?c.inputTokens:budget.policy.maxInputTokensPerCall),0);
 const limit=dailyCallLimit(budget,day),tokens=dailyInputTokenLimit(budget,day);
 const latest=[...calls].reverse().find(c=>c.status==='completed');
 return {day,enabled:stock.enabled===true,health:stock.health||null,circuit:budget.circuit||null,model:budget.model||null,
  usage:{calls:today.length,limit,remaining:Math.max(0,limit-today.length),inputTokensAccounted:used,inputTokenLimit:tokens,estimatedCalls:today.filter(c=>!Number.isSafeInteger(c.inputTokens)).length},
  policy:{dailyLimit:budget.policy.maxCallsPerDay,todayLimit:budget.policy.dailyCallOverrides?.[day]??null},
  connection:{status:latest?'response_recorded':'unverified',lastResponseAt:latest?.completedAt||null},
  inFlight:today.some(c=>c.status==='reserved'),
  history:calls.slice(-20).reverse().map(c=>({id:c.id,stage:c.stage,status:c.status,startedAt:c.startedAt,completedAt:c.completedAt,inputTokens:Number.isSafeInteger(c.inputTokens)?c.inputTokens:null})),
  entries:(stock.entries||[]).slice(-8).reverse().map(e=>({id:e.id,status:e.status})),
  nextAttemptAt:stock.automaticRecovery?.nextAttemptAt||null};
}
function invalid(message){throw Object.assign(new Error(message),{statusCode:400});}
export function applyControlSettings(budget,stock,body,now=new Date()) {
 const allowed=['scope','action','revision','dailyLimit','todayLimit','enabled'];
 if(Object.keys(body).some(k=>!allowed.includes(k)))invalid('Campo de controle desconhecido.');
 const valid=n=>Number.isSafeInteger(n)&&n>=1&&n<=100;
 if(!valid(body.dailyLimit)||!(body.todayLimit===null||valid(body.todayLimit))||typeof body.enabled!=='boolean')invalid('Informe limites inteiros entre 1 e 100 e o estado da reposição.');
 const day=brtDay(now);
 if((budget.calls||[]).some(c=>c.status==='reserved'))throw Object.assign(new Error('Há uma chamada em andamento. Aguarde a conclusão antes de alterar limites.'),{statusCode:409});
 const count=(budget.calls||[]).filter(c=>c.day===day).length;
 if((body.todayLimit??body.dailyLimit)<count)invalid('O limite de hoje não pode ser menor que o consumo já registrado.');
 budget.policy.maxCallsPerDay=body.dailyLimit;
 budget.policy.maxInputTokensPerDay=Math.max(1500000,body.dailyLimit*budget.policy.maxInputTokensPerCall);
 budget.policy.dailyCallOverrides||={};budget.policy.dailyInputTokenOverrides||={};
 if(body.todayLimit===null){delete budget.policy.dailyCallOverrides[day];delete budget.policy.dailyInputTokenOverrides[day];}
 else {budget.policy.dailyCallOverrides[day]=body.todayLimit;budget.policy.dailyInputTokenOverrides[day]=Math.max(budget.policy.maxInputTokensPerDay,body.todayLimit*budget.policy.maxInputTokensPerCall);}
 stock.enabled=body.enabled;
 return {day,dailyLimit:body.dailyLimit,todayLimit:body.todayLimit,enabled:body.enabled};
}
export function assertCanRun(summary) {
 if(!summary.enabled)invalid('Ative e salve a reposição antes de executar.');
 if(summary.circuit||summary.inFlight)throw Object.assign(new Error('Há uma chamada em andamento ou um bloqueio que precisa ser conferido.'),{statusCode:409});
 if(summary.usage.remaining<2||summary.usage.inputTokenLimit-summary.usage.inputTokensAccounted<240000)invalid('A cota disponível não comporta geração e revisão. Ajuste os limites ou aguarde a renovação.');
}
