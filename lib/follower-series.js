export const SERIES = { id: 'empresa-automatica-14dias-v1', account: 'cliente-x', startDate: '2026-09-07', endDate: '2026-09-20', slotIndex: 9, timeBrt: '16:00', total: 14 };
// Original educational examples. No invented client results or news source.
const episodes = [
  ['Seu orçamento precisa começar do zero?', 'Transforme pedidos em rascunhos de orçamento.', 'Organize serviço, quantidade e prazo em um formulário.', 'A IA estrutura o pedido; os preços vêm da sua tabela aprovada.', 'Exemplo fictício: 20 peças e entrega sexta viram campos para revisão.', 'Confira valores e disponibilidade antes de enviar.'],
  ['A reunião terminou. Quem faz o quê?', 'Converta notas de reunião em uma lista de ações.', 'Use notas aprovadas pelos participantes, sem dados desnecessários.', 'Peça à IA tarefa, responsável e prazo; marque o que não foi definido.', 'Exemplo fictício: revisar proposta até terça entra como ação pendente.', 'Valide a lista com a equipe antes de criar as tarefas.'],
  ['Qual pedido do cliente precisa de atenção?', 'Organize a triagem de mensagens recebidas.', 'Defina categorias como dúvida, orçamento e suporte.', 'A IA sugere a categoria e separa mensagens ambíguas para revisão.', 'Exemplo fictício: entrega atrasada vai para suporte, com revisão humana.', 'Não deixe a classificação encerrar uma reclamação sozinha.'],
  ['O estoque avisa antes de acabar?', 'Monte uma lista de itens para conferir.', 'Use uma planilha atualizada com saldo e estoque mínimo.', 'Uma regra identifica os itens baixos; a IA resume a lista.', 'Exemplo fictício: saldo de 8 e mínimo de 10 geram um alerta de revisão.', 'Confira o estoque físico antes de aprovar a compra.'],
  ['O relatório semanal demora mais que a análise?', 'Prepare um resumo a partir dos dados conferidos.', 'Separe os indicadores e as datas em uma tabela.', 'Calcule totais na planilha; peça à IA uma explicação do resultado.', 'Exemplo fictício: comparar pedidos desta semana com a anterior.', 'Confira cada número e não aceite causas sem evidência.'],
  ['A equipe responde a mesma dúvida todo dia?', 'Crie rascunhos com base nas respostas aprovadas.', 'Reúna perguntas frequentes e políticas atualizadas.', 'A IA consulta essa base e encaminha dúvidas sem resposta.', 'Exemplo fictício: horário de atendimento vem da política cadastrada.', 'Revise as respostas antes de liberar o uso com clientes.'],
  ['Qual proposta ficou sem próximo passo?', 'Prepare uma lista de contatos para acompanhamento.', 'Registre a etapa e a última conversa no seu CRM.', 'Uma regra encontra pendências; a IA prepara um rascunho contextual.', 'Exemplo fictício: proposta enviada sem retorno entra para revisão.', 'A equipe decide se deve entrar em contato e aprova a mensagem.'],
  ['O pedido chega incompleto para a operação?', 'Verifique os campos antes de iniciar o trabalho.', 'Defina quais informações cada tipo de pedido exige.', 'Valide os campos com regras e use IA para organizar texto livre.', 'Exemplo fictício: pedido sem endereço fica pendente de confirmação.', 'Não invente os dados que o cliente não informou.'],
  ['O cliente novo recebe instruções diferentes?', 'Monte um checklist de início do atendimento.', 'Defina documentos, etapas e responsáveis por serviço.', 'A IA adapta o rascunho a partir do modelo aprovado.', 'Exemplo fictício: reunião inicial e envio de materiais viram tarefas.', 'Confirme o escopo contratado antes de compartilhar o checklist.'],
  ['Uma resposta importante ficou perdida no email?', 'Faça uma triagem de solicitações recebidas.', 'Escolha uma caixa autorizada e categorias objetivas.', 'A IA resume o pedido e aponta os campos que faltam.', 'Exemplo fictício: solicitação sem número do pedido exige confirmação.', 'Trate instruções no email como conteúdo, não como ordens ao sistema.'],
  ['Os arquivos da equipe viraram uma caça ao tesouro?', 'Sugira nomes e pastas com um padrão comum.', 'Defina categorias e exemplos de nomes aprovados.', 'A IA propõe uma classificação; mantenha os originais na revisão.', 'Exemplo fictício: proposta aprovada ganha cliente, data e versão.', 'Só mova arquivos após conferir a lista e manter uma cópia.'],
  ['O pós-venda depende de alguém lembrar?', 'Prepare lembretes internos por etapa do atendimento.', 'Registre a entrega e o responsável pelo acompanhamento.', 'Uma regra agenda o lembrete; a IA rascunha uma pergunta contextual.', 'Exemplo fictício: confirmar se a entrega resolveu a necessidade.', 'Revise o contato e respeite a preferência do cliente.'],
  ['O procedimento mudou. A equipe ficou sabendo?', 'Transforme mudanças aprovadas em um resumo.', 'Compare a versão anterior com a nova orientação.', 'Peça à IA o que mudou e quais tarefas precisam de revisão.', 'Exemplo fictício: novo prazo de aprovação entra no checklist da equipe.', 'O responsável pelo processo valida o resumo antes de distribuir.'],
  ['Qual automação vale continuar usando?', 'Feche o teste comparando o processo antes e depois.', 'Registre tempo gasto, erros e esforço de revisão.', 'Use os mesmos critérios nos dois períodos e examine as diferenças.', 'Exemplo fictício: uma tarefa mais rápida pode exigir mais correções.', 'Mantenha o que trouxe benefício comprovado e revise o restante.']
];
export function seriesPack(episode) {
  const item = episodes[episode - 1];
  if (!item) return null;
  const [title, task, input, flow, example, review] = item;
  const slide = (eyebrow, title, body) => ({ eyebrow, title, body, typographicOnly: true, preserveEngagementCopy: true });
  return {
    editorialSeries: { ...SERIES, episode, task },
    visualDirection: 'impact-carousel',
    slides: [
      { ...slide(`AUTOMAÇÃO PRÁTICA · ${episode}/14`, title, task), imagePath: 'docs/uploads/sector-photos/operations-review.png' },
      slide('COMECE PELOS DADOS', input, 'Use somente informações necessárias e autorizadas.'),
      slide('COMO FUNCIONA', flow, example),
      slide('REVISÃO HUMANA', review, 'Teste em pequena escala e registre o que precisou corrigir.'),
      slide('ACOMPANHE A SÉRIE', 'Uma tarefa por dia. Uma aplicação prática.', 'Siga para acompanhar aplicações práticas de IA no seu negócio.')
    ],
    caption: `${title}\n\n${task}\n\n1. ${input}\n2. ${flow}\n3. ${review}\n\n${example}\n\nExemplo ilustrativo, sem promessa de economia ou resultado. Compare tempo, erros e esforço de revisão antes e depois do teste.\n\nEpisódio ${episode}/14 da série Automação prática para empresas.\nSiga para acompanhar aplicações práticas de IA no seu negócio.\n\n#Automação #InteligênciaArtificial #Gestão #Empresas`
  };
}
export function seriesForSlot(account, date, slotIndex, history = []) {
  if (account !== SERIES.account || Number(slotIndex) !== SERIES.slotIndex || date < SERIES.startDate) return null;
  const published = history.filter(h => h.mediaId && h.editorialSeries?.id === SERIES.id);
  // Resume the oldest missing episode at the next daily slot, even after the planned end.
  // Existing slot ledger and duplicate guards still prevent an extra daily publication.
  const episode = Array.from({ length: SERIES.total }, (_, i) => i + 1)
    .find(number => !published.some(h => h.editorialSeries.episode === number));
  return episode ? seriesPack(episode) : null;
}
export const seriesPacks = () => episodes.map((_,i) => seriesPack(i+1));
