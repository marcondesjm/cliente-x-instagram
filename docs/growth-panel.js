(() => {
  const suggestedBio = 'IA para donos de pequenos negócios\nMenos tarefas repetitivas. Mais tempo para vender.\nVeja por onde começar ↓';
  const checks = { audience: 'Definir o negócio e a dificuldade que quero atender', bio: 'Revisar a bio e o destino do link', demo: 'Preparar uma demonstração com exemplo concreto', offer: 'Explicar o que acontece na conversa comercial', baseline: 'Acompanhar a comparação automática dos períodos' };

  const templates = [
    { title: 'Seu orçamento precisa começar do zero?', goal: 'Mostre como organizar um pedido antes de preparar a proposta.', steps: [['Organize a entrada', 'Use um pedido fictício e separe serviço, quantidade e prazo.'], ['Peça um rascunho', 'Peça à IA para organizar apenas os dados fornecidos e apontar o que falta.'], ['Confira a proposta', 'Use sua tabela aprovada. Revise preços e disponibilidade antes de enviar.']], cta: 'Qual parte mais atrasa seus orçamentos: entender o pedido ou montar a proposta?' },
    { title: 'Antes de automatizar o atendimento', goal: 'Entregue um checklist que a equipe consiga usar.', steps: [['Reúna as dúvidas', 'Liste as cinco perguntas mais frequentes e escreva respostas aprovadas.'], ['Defina os limites', 'Quando faltar uma resposta na base, encaminhe a dúvida para uma pessoa.'], ['Teste antes de liberar', 'Use perguntas fictícias e incompletas. Revise as respostas com a equipe.']], cta: 'Salve este checklist para revisar com quem atende seus clientes.' },
    { title: 'A reunião terminou. Quem faz o quê?', goal: 'Transforme notas em tarefas, responsáveis e prazos para revisão.', steps: [['Comece com um exemplo', 'Use notas fictícias de uma reunião, sem informações de clientes.'], ['Use este pedido', 'Organize em tarefa, responsável e prazo. Use só o que está escrito. Quando faltar algo, marque a confirmar.'], ['Confirme com a equipe', 'Revise a tabela antes de criar tarefas. A equipe confirma os compromissos.']], cta: 'Quer avaliar uma aplicação como essa no seu negócio? Solicite uma conversa pelo link da bio.' }
  ];
  let account = '', revision = 0, loaded = false, requestId = 0, evidenceRequest = 0, savedPlan = {};
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const dateLabel = date => date ? new Date(`${date}T12:00:00Z`).toLocaleDateString('pt-BR',{timeZone:'UTC'}) : '—';
  const collectedLabel = date => date ? new Date(date).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}) + ' BRT' : 'Sem coleta';
  const el = id => document.getElementById(id);
  const message = text => { el('growthMessage').textContent = text; };
  function render(plan = {}) {
    el('growthBody').innerHTML = `<fieldset id="growthFields" style="border:0;padding:0;min-width:0"><div class="growth-columns"><div class="growth-block"><h3>1. Prepare o perfil</h3>${Object.entries(checks).map(([key, label]) => `<label class="growth-check"><input type="checkbox" data-growth-check="${key}">${label}</label>`).join('')}</div><div class="growth-block"><h3>2. Deixe claro o próximo passo</h3><label for="growthBio">Rascunho da bio</label><textarea id="growthBio" maxlength="150"></textarea><small id="growthBioCount"></small><div class="growth-actions"><button type="button" id="growthCopy">Copiar bio</button><button type="button" id="growthBioLink">Abrir página Bio</button></div><small>Copie para o Instagram após revisar. Salvar o plano não altera seu perfil. A página Bio é o destino do link.</small></div></div><div class="growth-block"><h3>3. Prepare conteúdo prático</h3><div class="growth-templates">${templates.map((t,i) => `<article class="growth-template"><small>Modelo ${i+1} · carrossel</small><h3>${t.title}</h3><p>${t.goal}</p><button type="button" data-growth-template="${i}">Abrir no editor</button></article>`).join('')}</div><p id="growthStrategy">Carregando a estratégia desta conta.</p><small id="growthSchedule"></small><div class="growth-actions"><button type="button" id="growthAgenda">Revisar agenda atual</button></div></div><div class="growth-block" id="growthResults"><h3>4. Resultados automáticos</h3><p>Comparação dos últimos 14 dias completos com os 14 dias anteriores, atualizada a partir das coletas disponíveis.</p><div class="growth-actions"><button type="button" id="growthRefresh">Atualizar resultados</button></div><div id="growthEvidence"></div></div><div class="growth-actions"><button type="button" id="growthSave">Salvar plano</button></div></fieldset><button type="button" id="growthReload">Recarregar plano salvo</button>`;
    el('growthBio').value = plan.bio ?? suggestedBio;
    Object.entries(plan.checks || {}).forEach(([key,value]) => { const input = document.querySelector(`[data-growth-check="${key}"]`); if(input) input.checked = value === true; });
    el('growthFields').disabled = !loaded;
    update();
    el('growthBody').oninput = update;
    el('growthRefresh').onclick = refreshEvidence;
    el('growthCopy').onclick = async () => { try { await navigator.clipboard.writeText(el('growthBio').value); message('Bio copiada. Cole no Instagram após revisar.'); } catch { message('Não foi possível copiar. Selecione o texto da bio e copie manualmente.'); } };
    el('growthBioLink').onclick = () => activateDashboardView('bio');
    el('growthAgenda').onclick = () => activateDashboardView('schedule');
    el('growthSave').onclick = save;
    el('growthReload').onclick = () => { if (loaded && !confirm('Recarregar o plano salvo e descartar as alterações desta aba?')) return; loaded = false; loadGrowthPanel(); };
    document.querySelectorAll('[data-growth-template]').forEach(button => { button.onclick = () => draft(Number(button.dataset.growthTemplate)); });
  }
  function update() {
    el('growthProgress').textContent = `${document.querySelectorAll('[data-growth-check]:checked').length} de 5 ações`;
    el('growthBioCount').textContent = `${[...el('growthBio').value].length}/150 caracteres`;
  }

  window.resetGrowthAccount = selected => {
    if (account !== selected) { account = selected; loaded = false; revision = 0; savedPlan = {}; requestId++; evidenceRequest++; render(); }
    if (document.querySelector('main').dataset.activeView === 'growth') loadGrowthPanel();
  };
  window.loadGrowthPanel = async () => {
    if (loaded || !appState.selectedAccount) return;
    account = appState.selectedAccount;
    const selected = account, id = ++requestId; evidenceRequest++;
    render(); message('Carregando plano desta conta…');
    try {
      const result = await api('/api/state', { method: 'POST', body: JSON.stringify({action:'load-growth-plan',account:selected}) });
      if (id !== requestId || selected !== appState.selectedAccount) return;
      revision = result.record?.revision || 0; savedPlan = result.record?.plan || {}; loaded = true; render(savedPlan);
      el('growthSchedule').textContent = `Agenda atual: ${result.scheduleCount ?? appState.scheduleBrt?.length ?? 0} horários. Editar este formulário não altera os disparos.`;
      el('growthStrategy').textContent = result.strategy?.enabled ? result.strategy.mode === 'integrated-slot' ? `Agenda de ${result.scheduleCount} postagens diárias: aula em carrossel às 16h BRT, incluída nos horários, com Story complementar. Aulas a partir de ${dateLabel(result.strategy.startDate)}; aprendizado educativo mantido. Os demais horários continuam com o Radar.` : `Estratégia educativa ativa: um carrossel às 16h BRT com Story complementar. Início: ${dateLabel(result.strategy.startDate)}. Revisão: ${dateLabel(result.strategy.reviewDate)}. Ciclo de 10 posts: 7 tutoriais, 2 notícias aplicáveis e 1 oferta. Sem notícia adequada, entra tutorial.` : 'Estratégia educativa ainda não ativada nesta conta.';
      renderEvidence(result.evidence, result.evidenceError);
      message(result.record ? `Plano carregado. Último salvamento: ${new Date(result.record.updatedAt).toLocaleString('pt-BR')}.` : 'Plano inicial pronto. Revise e salve para continuar depois.');
    } catch(error) { if (id === requestId) message(`Não foi possível carregar: ${error.message}. Use Recarregar plano salvo.`); }
  };
  async function refreshEvidence() {
    if(!loaded)return;
    const selected=account, id=++evidenceRequest;
    el('growthEvidence').textContent='Atualizando a comparação deste período…';
    try {
      const result=await api('/api/state',{method:'POST',body:JSON.stringify({action:'load-growth-plan',account:selected})});
      if(id!==evidenceRequest || selected!==appState.selectedAccount)return;
      renderEvidence(result.evidence,result.evidenceError);
    }catch(error){if(id===evidenceRequest && selected===appState.selectedAccount)el('growthEvidence').textContent=`Não foi possível atualizar: ${error.message}`;}
  }
  function renderEvidence(report, error) {
    const target=el('growthEvidence');target.replaceChildren();
    if(!report){target.textContent=error || 'Sem comparação automática disponível nesta conta.';return;}
    const learning=report.learning || {}, d=report.diagnostics || {};
    const groups=report.groups || [];
    const topics=Object.values(learning.topics || {}).filter(topic=>topic.posts>=3).length;
    const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
    const historical=report.endDate<today;
    const status=learning.status==='ready' ? 'Preferência assistida disponível' : learning.status==='stale' ? 'Coleta precisa ser atualizada' : 'Aguardando evidência suficiente';
    const progress=(label,value,total)=>`<div class="growth-evidence-progress"><span>${label} <strong>${Number(value)||0}/${total}</strong></span><progress max="${total}" value="${Math.min(total,Math.max(0,Number(value)||0))}" aria-label="${label}"></progress></div>`;
    const cards=[['Última coleta',collectedLabel(report.collectedAt),report.live?'Consultada na nuvem':'Cópia da implantação'],['Publicações educativas',d.publishedEducational ?? '—',`${d.publishedTutorials ?? '—'} tutoriais no histórico`],['Tutoriais na amostra',d.trackedTutorials ?? '—',`${d.totalSamples ?? '—'} publicações acompanhadas`],['Elegíveis para aprender',learning.eligiblePosts ?? 0,'Exigem coleta válida de 24–36h']];
    target.innerHTML=`<section class="growth-evidence-summary" aria-label="Resumo das coletas automáticas"><div class="growth-evidence-heading"><h3>Acompanhamento automático</h3><span class="growth-evidence-status">${escape(status)}</span></div><div class="growth-evidence-cards">${cards.map(([label,value,note])=>`<article><small>${escape(label)}</small><strong>${escape(value)}</strong><small>${escape(note)}</small></article>`).join('')}</div><p>Este aprendizado avalia as aulas dos últimos 42 dias e é separado do indicador geral da conta. O histórico confirma as publicações; só tutoriais com métricas válidas entram nos critérios abaixo.</p><div class="growth-evidence-goals">${progress('Tutoriais elegíveis',learning.eligiblePosts,6)}${progress('Alcance acumulado elegível',learning.totalReach,180)}${progress('Temas com pelo menos 3 tutoriais',topics,2)}</div><p>${escape(learning.reason || 'Aguardando coletas suficientes.')}</p></section>`;
    const notes=[];
    if(d.missingFromSamples)notes.push(`${d.missingFromSamples} tutoriais publicados ainda não estão na amostra. As próximas coletas preservam o histórico educativo de até 42 dias; não reconstroem janelas de coleta já perdidas.`);
    const labels={waiting:'ainda não completaram 24h',missingWindow:'sem coleta válida entre 24h e 36h',missingMetrics:'sem todas as métricas exigidas',lowReach:'com alcance abaixo de 20',otherFormat:'em outro formato',unmappedTopic:'sem tema educativo identificado',outsideWindow:'fora dos últimos 42 dias'};
    for(const [key,count] of Object.entries(d.reasons || {}))if(count)notes.push(`${count} ${labels[key] || key}.`);
    if(notes.length){const block=document.createElement('details');block.className='growth-evidence-details';block.open=true;const heading=document.createElement('summary');heading.textContent='Por que alguns tutoriais ainda não entram?';block.append(heading);const list=document.createElement('ul');for(const text of notes){const li=document.createElement('li');li.textContent=text;list.append(li);}block.append(list);target.append(block);}
    const period=document.createElement('div');period.className='growth-evidence-period';period.innerHTML=`<strong>${historical?'Período concluído':'Período em andamento'}</strong><p>Antes: ${escape(dateLabel(report.baselineStart))} a ${escape(dateLabel(report.baselineEnd))}<br>Teste: ${escape(dateLabel(report.startDate))} a ${escape(dateLabel(report.endDate))}</p><small>O período avança automaticamente a cada dia, pelo horário de Brasília. Os valores são medianas das amostras disponíveis por publicação.</small>`;target.append(period);
    if(!groups.length){const empty=document.createElement('p');empty.className='growth-evidence-empty';empty.textContent='Ainda não há amostras comparáveis nos últimos 14 dias completos. A comparação será preenchida conforme as coletas ficarem disponíveis. Ausência de dados não significa resultado zero.';target.append(empty);}
    if(groups.length && groups.every(group=>!group.before.posts || !group.after.posts)){const warning=document.createElement('p');warning.className='growth-evidence-empty';warning.textContent='Há dados em apenas um dos períodos de cada grupo. É possível consultar os resultados disponíveis, mas ainda não concluir melhora ou piora entre os períodos.';target.append(warning);}
    const metric=(group,period,key)=>{const m=group[period]?.metrics?.[key];return m?.median==null?'Sem dado':`${m.median.toLocaleString('pt-BR')} · ${m.observed} amostras`;};
    for(const group of groups){const block=document.createElement('section');block.className='growth-evidence-group';block.innerHTML=`<h4>${escape(group.format==='FEED'?'Feed / carrossel':group.format==='REELS'?'Reels':group.format)} · após ${Number(group.window)} horas</h4><small>${Number(group.before.posts)} posts antes · ${Number(group.after.posts)} no teste · valores medianos por publicação</small><div class="growth-table"><table><thead><tr><th>Métrica</th><th>Antes</th><th>Teste</th></tr></thead><tbody>${[['views','Visualizações'],['reach','Alcance'],['saved','Salvamentos'],['shares','Compartilhamentos']].map(([key,label])=>`<tr><th scope="row">${label}</th><td>${escape(metric(group,'before',key))}</td><td>${escape(metric(group,'after',key))}</td></tr>`).join('')}</tbody></table></div>`;target.append(block);}
    const footer=document.createElement('small');footer.textContent='Comparamos o mesmo formato nas janelas de 24–36h e 72–96h. Amostras não representam os totais da conta. Poucos dados não comprovam ganho; conversas e vendas não são medidas por estas coletas.';target.append(footer);
  }
  async function save() {
    if (!loaded || account !== appState.selectedAccount) return;
    if (![...el('growthFields').querySelectorAll('input, textarea')].every(input => input.reportValidity())) return;
    const selected = account, id = requestId;
    const plan = { bio:el('growthBio').value, startDate:savedPlan.startDate || '', checks:{}, periods:savedPlan.periods || {before:{},after:{}} };
    document.querySelectorAll('[data-growth-check]').forEach(input => plan.checks[input.dataset.growthCheck] = input.checked);
    el('growthFields').disabled = true; el('growthReload').disabled = true; message('Salvando plano…');
    try {
      const result = await api('/api/state', {method:'POST',body:JSON.stringify({action:'save-growth-plan',account:selected,revision,plan})});
      if (id !== requestId || selected !== appState.selectedAccount) return;
      revision = result.record.revision;
      message('Plano salvo para esta conta. A bio do Instagram e a agenda não foram alteradas.');
    } catch(error) { if (id === requestId) message(`Não foi possível salvar: ${error.message}`); }
    finally { if (id === requestId) { el('growthFields').disabled = false; el('growthReload').disabled = false; } }
  }
  function draft(index) {
    const t = templates[index];
    syncEditorToState();
    const slides = [[t.title,t.goal], ...t.steps, ['Próximo passo',t.cta]].map(([title,body]) => ({eyebrow:'IA aplicada a negócios',title,body,imagePath:'',imageUrl:''}));
    appState.packs.push({ slides, caption:`${t.title}\n\n${t.goal}\n\n${t.steps.map(([title,body]) => `${title}: ${body}`).join('\n\n')}\n\n${t.cta}` });
    appState.selectedPack = appState.packs.length-1; appState.selectedSlide=0;
    renderEditor(); activateDashboardView('content');
    setMessage('Rascunho criado. Revise texto e prévia, confira o histórico e salve o conteúdo antes de agendar. Nada foi publicado.', 'good');
  }
})();
