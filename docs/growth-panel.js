(() => {
  const suggestedBio = 'IA para donos de pequenos negócios\nMenos tarefas repetitivas. Mais tempo para vender.\nVeja por onde começar ↓';
  const checks = { audience: 'Definir o negócio e a dificuldade que quero atender', bio: 'Revisar a bio e o destino do link', demo: 'Preparar uma demonstração com exemplo concreto', offer: 'Explicar o que acontece na conversa comercial', baseline: 'Registrar os 14 dias anteriores para comparação' };
  const metrics = { reach: 'Alcance', saves: 'Salvamentos', shares: 'Compartilhamentos', profileVisits: 'Visitas ao perfil', clicks: 'Cliques no link', conversations: 'Conversas qualificadas', sales: 'Vendas confirmadas' };
  const templates = [
    { title: 'Seu orçamento precisa começar do zero?', goal: 'Mostre como organizar um pedido antes de preparar a proposta.', steps: [['Organize a entrada', 'Use um pedido fictício e separe serviço, quantidade e prazo.'], ['Peça um rascunho', 'Peça à IA para organizar apenas os dados fornecidos e apontar o que falta.'], ['Confira a proposta', 'Use sua tabela aprovada. Revise preços e disponibilidade antes de enviar.']], cta: 'Qual parte mais atrasa seus orçamentos: entender o pedido ou montar a proposta?' },
    { title: 'Antes de automatizar o atendimento', goal: 'Entregue um checklist que a equipe consiga usar.', steps: [['Reúna as dúvidas', 'Liste as cinco perguntas mais frequentes e escreva respostas aprovadas.'], ['Defina os limites', 'Quando faltar uma resposta na base, encaminhe a dúvida para uma pessoa.'], ['Teste antes de liberar', 'Use perguntas fictícias e incompletas. Revise as respostas com a equipe.']], cta: 'Salve este checklist para revisar com quem atende seus clientes.' },
    { title: 'A reunião terminou. Quem faz o quê?', goal: 'Transforme notas em tarefas, responsáveis e prazos para revisão.', steps: [['Comece com um exemplo', 'Use notas fictícias de uma reunião, sem informações de clientes.'], ['Use este pedido', 'Organize em tarefa, responsável e prazo. Use só o que está escrito. Quando faltar algo, marque a confirmar.'], ['Confirme com a equipe', 'Revise a tabela antes de criar tarefas. A equipe confirma os compromissos.']], cta: 'Quer avaliar uma aplicação como essa no seu negócio? Solicite uma conversa pelo link da bio.' }
  ];
  let account = '', revision = 0, loaded = false, requestId = 0;
  const el = id => document.getElementById(id);
  const message = text => { el('growthMessage').textContent = text; };
  function render(plan = {}) {
    el('growthBody').innerHTML = `<fieldset id="growthFields" style="border:0;padding:0;min-width:0"><div class="growth-columns"><div class="growth-block"><h3>1. Prepare o perfil</h3>${Object.entries(checks).map(([key, label]) => `<label class="growth-check"><input type="checkbox" data-growth-check="${key}">${label}</label>`).join('')}</div><div class="growth-block"><h3>2. Deixe claro o próximo passo</h3><label for="growthBio">Rascunho da bio</label><textarea id="growthBio" maxlength="150"></textarea><small id="growthBioCount"></small><div class="growth-actions"><button type="button" id="growthCopy">Copiar bio</button><button type="button" id="growthBioLink">Abrir página Bio</button></div><small>Copie para o Instagram após revisar. Salvar o plano não altera seu perfil. A página Bio é o destino do link.</small></div></div><div class="growth-block"><h3>3. Prepare conteúdo prático</h3><div class="growth-templates">${templates.map((t,i) => `<article class="growth-template"><small>Modelo ${i+1} · carrossel</small><h3>${t.title}</h3><p>${t.goal}</p><button type="button" data-growth-template="${i}">Abrir no editor</button></article>`).join('')}</div><p id="growthStrategy">Carregando a estratégia desta conta.</p><div id="growthEvidence"></div><small id="growthSchedule"></small><div class="growth-actions"><button type="button" id="growthAgenda">Revisar agenda atual</button></div></div><div class="growth-block"><h3>4. Compare períodos de 14 dias</h3><label for="growthStart">Início do experimento</label><input id="growthStart" type="date"><p id="growthDates">Escolha a data para identificar os períodos.</p><small>Preencha os totais conferidos nos Insights e no seu controle comercial. Deixe vazio quando não souber. Não registre nomes nem dados de clientes. Conversa qualificada: negócio, dificuldade e interesse real identificados.</small><div class="growth-table"><table><thead><tr><th scope="col">Métrica</th><th scope="col">14 dias anteriores</th><th scope="col">14 dias do teste</th><th scope="col">Variação</th></tr></thead><tbody>${Object.entries(metrics).map(([key,label]) => `<tr><th scope="row">${label}</th>${['before','after'].map(p => `<td><input type="number" min="0" max="1000000000" step="1" data-growth-period="${p}" data-growth-metric="${key}" aria-label="${label}: ${p === 'before' ? 'antes' : 'teste'}" placeholder="Sem dado"></td>`).join('')}<td id="growthDelta-${key}">—</td></tr>`).join('')}</tbody></table></div><small>Compare períodos completos. Mais curtidas não comprovam vendas; este painel não atribui conversões a um post nem promete crescimento.</small></div><div class="growth-actions"><button type="button" id="growthSave">Salvar plano e resultados</button></div></fieldset><button type="button" id="growthReload">Recarregar plano salvo</button>`;
    el('growthBio').value = plan.bio ?? suggestedBio;
    el('growthStart').value = plan.startDate || '';
    Object.entries(plan.checks || {}).forEach(([key,value]) => { const input = document.querySelector(`[data-growth-check="${key}"]`); if(input) input.checked = value === true; });
    document.querySelectorAll('[data-growth-metric]').forEach(input => { input.value = plan.periods?.[input.dataset.growthPeriod]?.[input.dataset.growthMetric] ?? ''; });
    el('growthFields').disabled = !loaded;
    update();
    el('growthBody').oninput = update;
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
    const date = el('growthStart').value;
    const offset = days => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+days); return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); };
    el('growthDates').textContent = date ? `Antes: ${offset(-14)} a ${offset(-1)}. Teste: ${offset(0)} a ${offset(13)}.` : 'Escolha a data para identificar os períodos.';
    for (const key of Object.keys(metrics)) {
      const values = ['before','after'].map(p => document.querySelector(`[data-growth-period="${p}"][data-growth-metric="${key}"]`).value);
      el(`growthDelta-${key}`).textContent = values.some(v => v === '') ? 'Sem comparação' : `${Number(values[1])-Number(values[0]) > 0 ? '+' : ''}${(Number(values[1])-Number(values[0])).toLocaleString('pt-BR')}`;
    }
  }
  window.resetGrowthAccount = selected => {
    if (account !== selected) { account = selected; loaded = false; revision = 0; requestId++; render(); }
    if (document.querySelector('main').dataset.activeView === 'growth') loadGrowthPanel();
  };
  window.loadGrowthPanel = async () => {
    if (loaded || !appState.selectedAccount) return;
    account = appState.selectedAccount;
    const selected = account, id = ++requestId;
    render(); message('Carregando plano desta conta…');
    try {
      const result = await api('/api/state', { method: 'POST', body: JSON.stringify({action:'load-growth-plan',account:selected}) });
      if (id !== requestId || selected !== appState.selectedAccount) return;
      revision = result.record?.revision || 0; loaded = true; render(result.record?.plan);
      el('growthSchedule').textContent = `Agenda atual: ${result.scheduleCount ?? appState.scheduleBrt?.length ?? 0} horários. Editar este formulário não altera os disparos.`;
      el('growthStrategy').textContent = result.strategy?.enabled ? `Estratégia educativa ativa: um carrossel às 16h BRT com Story complementar. Início: ${result.strategy.startDate}. Revisão: ${result.strategy.reviewDate}. Ciclo de 10 posts: 7 tutoriais, 2 notícias aplicáveis e 1 oferta. Sem notícia adequada, entra tutorial.` : 'Estratégia educativa ainda não ativada nesta conta.';
      renderEvidence(result.evidence, result.evidenceError);
      message(result.record ? `Plano carregado. Último salvamento: ${new Date(result.record.updatedAt).toLocaleString('pt-BR')}.` : 'Plano inicial pronto. Revise e salve para continuar depois.');
    } catch(error) { if (id === requestId) message(`Não foi possível carregar: ${error.message}. Use Recarregar plano salvo.`); }
  };
  function renderEvidence(report, error) {
    const target = el('growthEvidence');
    if (!report) { target.textContent = error || 'Sem comparação automática disponível nesta conta.'; return; }
    const heading = document.createElement('h3'); heading.textContent = 'Coletas automáticas: comparação por formato e idade'; target.append(heading);
    const note = document.createElement('p'); note.textContent = `Base: ${report.baselineStart} a ${report.baselineEnd}. Teste: ${report.startDate} a ${report.endDate}. Última coleta: ${report.collectedAt || 'indisponível'}. ${report.live ? 'Dados consultados na nuvem.' : 'Cópia local da última implantação; atualização ao vivo indisponível.'} Amostras disponíveis, não totais completos da conta.`; target.append(note);
    for (const group of report.groups) {
      const block = document.createElement('p');
      const metric = (period, key) => { const m = group[period].metrics[key]; return m.median === null ? 'sem dado' : `${m.median.toLocaleString('pt-BR')} (n=${m.observed})`; };
      block.textContent = `${group.format} · ${group.window}h · ${group.before.posts} posts antes / ${group.after.posts} no teste. Medianas antes → teste: views ${metric('before','views')} → ${metric('after','views')}; alcance ${metric('before','reach')} → ${metric('after','reach')}; salvos ${metric('before','saved')} → ${metric('after','saved')}; compartilhamentos ${metric('before','shares')} → ${metric('after','shares')}.`;
      target.append(block);
    }
    const footer = document.createElement('small'); footer.textContent = 'Coletas fora das janelas de 24–36h e 72–96h são excluídas. Compare o mesmo formato. Nenhum ganho é concluído com poucos posts. Conversas e vendas são registradas abaixo por você.'; target.append(footer);
  }
  async function save() {
    if (!loaded || account !== appState.selectedAccount) return;
    if (![...el('growthFields').querySelectorAll('input, textarea')].every(input => input.reportValidity())) return;
    const selected = account, id = requestId;
    const plan = { bio:el('growthBio').value, startDate:el('growthStart').value, checks:{}, periods:{before:{},after:{}} };
    document.querySelectorAll('[data-growth-check]').forEach(input => plan.checks[input.dataset.growthCheck] = input.checked);
    document.querySelectorAll('[data-growth-metric]').forEach(input => plan.periods[input.dataset.growthPeriod][input.dataset.growthMetric] = input.value === '' ? null : Number(input.value));
    el('growthFields').disabled = true; el('growthReload').disabled = true; message('Salvando plano…');
    try {
      const result = await api('/api/state', {method:'POST',body:JSON.stringify({action:'save-growth-plan',account:selected,revision,plan})});
      if (id !== requestId || selected !== appState.selectedAccount) return;
      revision = result.record.revision;
      message('Plano e resultados salvos para esta conta. A bio do Instagram e a agenda não foram alteradas.');
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
