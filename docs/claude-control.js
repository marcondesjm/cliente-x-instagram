(() => {
 const panel=document.createElement('div');panel.className='panel';panel.id='claudeControl';panel.hidden=true;
 panel.innerHTML=`
 <style>#claudeControl[hidden],#claudeControl [hidden]{display:none!important}</style>
 <div class="panel-head"><div><div class="section-label">Inteligência artificial</div><h2>Controle do Claude</h2></div><span class="status-pill warn" id="claudeStatus">Consultar</span></div>
 <p id="claudeConsumption"></p><p id="claudeConnection"></p><p id="claudeBudgetScope"></p><p id="claudeTokens"></p>
 <form id="claudeSettings" style="display:flex;flex-wrap:wrap;gap:16px;align-items:end">
 <label>Limite diário normal<br><input id="claudeDailyLimit" type="number" min="1" max="100" required style="width:130px"></label>
 <label>Limite total só para hoje<br><input id="claudeTodayLimit" type="number" min="1" max="100" placeholder="Usar normal" style="width:150px"></label>
 <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="claudeEnabled" style="width:auto;margin:0"> Reposição automática ativa</label><button class="btn" type="submit">Salvar controles</button></form>
 <p>Limites maiores permitem mais chamadas e consumo no provedor. O teto de tokens acompanha o número de chamadas. Deixe o limite de hoje vazio para usar o normal. Salve as alterações antes de executar.</p>
 <p id="claudeHealth"></p><div style="display:flex;flex-wrap:wrap;gap:10px"><button class="btn" id="claudeRefresh" type="button">Atualizar dados</button><button class="btn" id="claudeRun" type="button">Repor conteúdo</button><button class="btn" id="claudeAudit" type="button">Executar auditoria editorial</button><button class="btn" id="claudeCalibrate" type="button">Executar calibração visual</button></div>
 <p id="claudeRunNote"></p><p>Auditoria e calibração também consomem chamadas. Não publicam conteúdo.</p><button class="btn" id="claudeLearn" type="button">Analisar desempenho com Claude</button><p id="claudeStrategy" style="white-space:pre-line;overflow-wrap:anywhere"></p><p id="claudeFeedback" role="status" aria-live="polite"></p>
 <details><summary>Chamadas recentes</summary><ul id="claudeHistory" style="overflow-wrap:anywhere"></ul></details>
 <details><summary>Estoque e avaliações</summary><p id="claudeEntries" style="overflow-wrap:anywhere"></p></details>
 <details><summary>Execuções na nuvem</summary><ul id="claudeRuns"></ul></details><p><a id="claudeWorkflow" target="_blank" rel="noopener noreferrer">Abrir histórico completo no GitHub ↗</a> · <a href="https://github.com/marcondesjm/cliente-x-instagram/settings/secrets/actions" target="_blank" rel="noopener noreferrer">Gerenciar credencial no GitHub ↗</a></p>`;
 document.getElementById('maintenanceStatus')?.closest('.panel')?.before(panel);
 let current=null,scope=null,epoch=0,busy=false;
 const el=id=>document.getElementById(id);
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const time=value=>value?new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}):'Ainda não registrado';
 const states={completed:'Concluída',reserved:'Em andamento',failed:'Falhou',ready:'Aprovada',rejected:'Reprovada',draft:'Rascunho'};
 async function request(body){
  const response=await fetch('/api/state?claudeControl=1'+(body?'':'&scope='+encodeURIComponent(scope)),{method:body?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();if(!response.ok)throw Error(data.error||'Não foi possível acessar o controle.');return data;
 }
 function render(data){
  current=data;el('claudeStatus').textContent=data.circuit?'Bloqueio para conferir':data.enabled?'Reposição ativa':'Reposição pausada';
  el('claudeStatus').className='status-pill '+(data.enabled&&!data.circuit?'good':'warn');
  el('claudeConsumption').textContent=`${data.usage.calls} de ${data.usage.limit} chamadas hoje · ${data.usage.remaining} disponíveis`;
  el('claudeTokens').textContent=`${data.usage.inputTokensAccounted.toLocaleString('pt-BR')} de ${data.usage.inputTokenLimit.toLocaleString('pt-BR')} tokens de entrada contabilizados. ${data.usage.estimatedCalls} chamada(s) sem contagem completa usam o máximo reservado. Não é uma fatura do provedor.`;
  el('claudeConnection').textContent=`Modelo: ${data.model||'não configurado'}. Última resposta registrada: ${time(data.connection.lastResponseAt)}. Esse registro não testa a conexão atual.`;
  el('claudeBudgetScope').textContent=scope==='cliente-x'?'Esta cota é compartilhada entre reserva autoral e auditorias editoriais.':'Esta cota controla as avaliações de cenas bíblicas do Sabedoria Kids.';
  el('claudeDailyLimit').value=data.policy.dailyLimit;el('claudeTodayLimit').value=data.policy.todayLimit??'';el('claudeEnabled').checked=data.enabled;
  el('claudeHealth').textContent=data.circuit?`Bloqueio registrado: ${data.circuit}. Consulte a execução antes de retomar.`:`Dia: ${data.day} (Brasília). Próxima tentativa registrada: ${time(data.nextAttemptAt)}. Pausar não interrompe uma tarefa já iniciada.`;
  el('claudeRun').textContent=scope==='cliente-x'?'Repor conteúdo e recuperar horário':'Repor cenas e montar prévias';
  el('claudeRunNote').textContent=scope==='cliente-x'?'Consome chamadas. Conteúdo aprovado pode publicar Feed/Reel e Story para recuperar um horário pendente.':'Consome chamadas. Revê cenas e monta conteúdo aprovado; a publicação depende da agenda existente.';
  el('claudeHistory').innerHTML=data.history.length?data.history.map(c=>`<li><strong>${esc(states[c.status]||c.status)}</strong> · ${esc(c.stage)}<br><small>${esc(time(c.completedAt||c.startedAt))} · ${c.inputTokens===null?'tokens estimados':esc(c.inputTokens)+' tokens de entrada'}</small></li>`).join(''):'<li>Nenhuma chamada registrada.</li>';
  const balance=Number.isInteger(data.stock?.available)?`Estoque inédito elegível: ${data.stock.available}. Meta: ${data.stock.target||'não definida'}. Lote: até ${data.stock.batch||1}. Última checagem: ${time(data.stock.checkedAt)}. Pautas já publicadas não entram nesse saldo. `:'';
  el('claudeEntries').textContent=balance+(data.entries.length?data.entries.map(e=>`${e.id}: ${states[e.status]||e.status}`).join(' · '):'Nenhuma pauta registrada.');
  el('claudeWorkflow').href=data.workflowUrl;el('claudeAudit').hidden=scope!=='cliente-x';el('claudeCalibrate').hidden=scope!=='sabedoria-kids';
  el('claudeLearn').hidden=scope!=='cliente-x';el('claudeStrategy').hidden=scope!=='cliente-x';
  const strategy=data.learningStrategy;
  el('claudeStrategy').textContent=strategy?`Diagnóstico Claude · ${time(strategy.createdAt)} · ${strategy.status==='active'?'hipótese em avaliação':'hipótese expirada'}\n${strategy.diagnosis}\nHipótese: ${strategy.hypothesis}\nEixo: ${strategy.axis} · variante: ${strategy.variant} · métrica: ${strategy.metric}\nLimitações: ${strategy.limitations}\nAnálises respeitam um intervalo mínimo de seis horas e a cota compartilhada. Não publicam conteúdo.`:'Diagnóstico aguardando análise. O Claude pode analisar dados atuais a cada seis horas; a hipótese recebe validade de um dia. Consome a cota compartilhada, sem publicação nesta ação.';
  el('claudeRuns').innerHTML=(data.runs||[]).map(r=>`<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Execução ${esc(r.id)}</a> · ${esc(r.status)}${r.conclusion?' · '+esc(r.conclusion):''}</li>`).join('')||'<li>Nenhuma execução registrada.</li>';
 }
 async function load(account,role,force=false){
  const panel=el('claudeControl');if(!panel)return;
  panel.hidden=role!=='owner';if(panel.hidden){scope=null;current=null;epoch++;return;}
  if(!['cliente-x','sabedoria-kids'].includes(account)){panel.hidden=true;scope=null;current=null;epoch++;return;}
  if(!force&&account===scope&&(busy||panel.contains(document.activeElement)))return;
  scope=account;const ticket=++epoch;current=null;setBusy(true);el('claudeFeedback').textContent='Consultando o estado na nuvem…';
  try{const data=await request();if(ticket!==epoch)return;render(data);el('claudeFeedback').textContent='Dados atualizados. Limites extras valem somente até meia-noite de Brasília.';}
  catch(e){if(ticket===epoch)el('claudeFeedback').textContent=e.message;}
  finally{if(ticket===epoch)setBusy(false);}
 }
 function setBusy(value){busy=value;el('claudeControl').querySelectorAll('button,input').forEach(n=>n.disabled=value);}
 async function act(action){
  if(busy||!current)return;setBusy(true);el('claudeFeedback').textContent='Enviando solicitação…';const activeScope=scope;
  try{
   const body={action,scope,revision:current.revision};
   if(action==='settings')Object.assign(body,{dailyLimit:Number(el('claudeDailyLimit').value),todayLimit:el('claudeTodayLimit').value===''?null:Number(el('claudeTodayLimit').value),enabled:el('claudeEnabled').checked});
   const data=await request(body);if(scope!==activeScope)return;
   if(data.saved)render(data);
   el('claudeFeedback').textContent=data.saved?'Configuração salva na nuvem.':data.message;
   if(data.accepted)current=null;
  }catch(e){if(scope===activeScope)el('claudeFeedback').textContent=e.message;}
  finally{if(scope===activeScope)setBusy(false);}
 }
 document.addEventListener('DOMContentLoaded',()=>{
  el('claudeRefresh')?.addEventListener('click',()=>load(scope,'owner',true));
  el('claudeSettings')?.addEventListener('submit',e=>{e.preventDefault();act('settings');});
  el('claudeRun')?.addEventListener('click',()=>act('run'));
  el('claudeAudit')?.addEventListener('click',()=>act('audit'));
  el('claudeCalibrate')?.addEventListener('click',()=>act('calibrate'));
 });
 window.ClaudeControl={load};
})();
