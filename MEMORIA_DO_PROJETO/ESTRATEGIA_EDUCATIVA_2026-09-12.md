# Estratégia educativa v6.05

Pedido autorizado: aplicar conteúdo educativo, frequência menor, conversão e medição. Base origin/main 30635e99; branch feat/education-first-20260912; checkout cliente-x-instagram-education-20260912.

## Operação

- Agenda Cliente X reduzida de 13 horários para um carrossel às 16h BRT, com Story complementar. Cron principal às 16h07; watchdog continua consultando a agenda e o histórico. Outras contas preservadas.
- Transição em 12/09: já há posts hoje. Não recuperar horários antigos. Ciclo começa em 13/09, revisão em 27/09. Não marcar slots antigos como publicados, apagar mídia ou republicar.
- Ciclo de dez posts: sete tutoriais, duas notícias aplicáveis e uma oferta. No primeiro período de 14 dias, alvo de dez tutoriais, três notícias e uma oferta. Sem notícia de IA aplicável, usar tutorial inédito. A distribuição é hipótese editorial, não regra da Meta.
- Dezesseis aulas: nove episódios ainda inéditos da série existente com conteúdo ampliado e sete aulas adicionais. Cada aula tem exemplo fictício, prompt copiável, saída ilustrativa, revisão e um próximo passo. Série já publicada nos episódios 1 a 5 preservada.
- Guarda de biblioteca bloqueia preenchimento genérico quando não houver aula inédita elegível; adicionar novas aulas revisadas antes do esgotamento. Não prometer produção educativa infinita a partir desta biblioteca finita.
- Campos education no histórico e nas coletas permitem auditoria do tipo e da aula. CTAs educativos preservados sem acrescentar chamadas de notícias, material ou Direct.

## Conversão e medição

- Bio do Instagram observada já atualizada pelo usuário: IA para donos de pequenos e grandes negócios; menos tarefas repetitivas; veja por onde começar. Texto preservado.
- Página do link da bio: promessa educativa e chamada que pede a tarefa a melhorar, sem garantia de economia ou resultado. Destino existente preservado.
- Plano persistido por conta com início em 13/09; métricas comerciais não inventadas. Dados automáticos são separados dos campos manuais.
- Snapshot education-baseline-20260912.json: 181 observações elegíveis, quatro grupos por formato e janela, coleta de 12/09 às 12:12Z. Amostra parcial dos 14 dias anteriores; ausências não viram zero. Cada métrica informa sua cobertura.
- Painel apresenta medianas por formato nas janelas de 24–36h e 72–96h; exclui coletas tardias e mídias duplicadas. Esses intervalos são escolhas do experimento. Conversas qualificadas e vendas dependem de registro comercial manual, não de inferência a partir de curtidas.

## Validação

- validate-education-strategy: ciclo de 14 dias, estoque de aulas para substituição de todas as notícias no teste, transição, limite diário BRT, cron, notícias irrelevantes, fatos preservados, repetição, idade das coletas, ausência versus zero.
- validate-growth-plan, validate-follower-growth e validate-copy passaram; sintaxe e diff conferidos.
- Render real sem publicar para 13/09 selecionou episódio 6: A equipe responde a mesma dúvida todo dia? Inspeção visual da capa, card do prompt e Story confirmou composição sem sobreposição. Layout aprovado preservado.
- Render é prévia, não publicação. Primeira prova de Meta só poderá ser obtida após o novo horário; ganhos de engajamento ainda não medidos.
