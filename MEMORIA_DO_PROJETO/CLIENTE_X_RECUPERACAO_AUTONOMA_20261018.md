# Cliente X — falta de estoque com recuperação automática

Pedido explícito: o erro de foto inédita/reserva esgotada deve acionar tentativa pelo Claude sem botão ou solicitação no chat.

## Ciclo instalado

- Conclusão do Feed ou do Vigia aciona authorial-reserve.yml por workflow_run, restrito à branch main. O preflight lê o erro persistido e considera somente falta de conteúdo da conta cliente-x em slot automático ainda pendente do dia. Falha de token, outra conta, slot já publicado ou erro de infraestrutura não disparam geração por esse caminho.
- Há verificação horária no minuto 35, inclusive após a renovação da cota às 00h BRT. Preflight puro não faz chamadas pagas e dispensa instalação/render quando não há orçamento. Registra waiting_daily_budget e a próxima verificação esperada. Mantém os mesmos limites editoriais 12 chamadas/1,5M tokens e a trava de concorrência compartilhada com a auditoria.
- Dentro da cota, Claude gera e revisa pautas; estoque busca até 13 materiais elegíveis, sem ampliar o limite de chamadas. Cada lote continua limitado a duas pautas. Rejeição editorial agenda intervalo de duas horas antes de nova tentativa; não altera resultado rejeitado para aprovado.
- O catálogo pode propor novos exercícios fictícios em contextos empresariais predefinidos, partindo das orientações autorais existentes. Cada ID tem briefing determinístico e verificação literal; a revisão independente ainda exige diferença concreta de conteúdo. Não depende de ampliar o catálogo manualmente e não fabrica notícia, resultado real ou fonte externa. Histórico enviado à API é limitado para evitar payload crescente.
- Havendo estoque aprovado e inédito, um job chama o workflow reutilizável do Vigia. Ele seleciona o horário pendente pelas regras normais, mantém exclusão mútua com o Feed, instala dependências e publica em modo automático. Não usa dispatch manual de publicação. Alertas só são encerrados pelo caminho de publicação bem-sucedida e persistência de histórico/ledger.
- As soluções dos alertas abertos dessa classe são atualizadas para explicar o tratamento automático. O alerta permanece aberto durante espera e revisão.

## Limites

Automação tenta corrigir e retoma após a cota; não garante que o modelo aprovará material nem que haverá treze novos posts todos os dias. Não aumenta orçamento, relaxa proteção contra repetição ou renova credenciais por erro editorial. O preflight pode esperar um circuito do provedor; conteúdo anteriormente aprovado permanece separado da geração.

## Validação

Testes simulam incidente correto, conta/etapa errada, slot já publicado, material consumido e título semanticamente repetido, cota e virada de dia BRT, retomada, backoff editorial e bloqueio do provedor. Contrato YAML de workflow_run, outputs, secrets herdados e workflow_call conferido; validate-copy e recuperação de agenda passaram. Preflight local com o estado real de 18/10 detectou slot 2, zero estoque elegível e 12/12 chamadas usadas, aguardando 19/10 às 00:35 BRT para a primeira verificação horária após renovação, sujeita à fila do GitHub.

Prova do primeiro ciclo na nuvem será registrada após a instalação. A espera por cota não deve ser relatada como publicação ou aprovação editorial.


## Revisão completa da recuperação Claude — 18/10/2026 BRT

Correções: planejador e executor compartilham a mesma regressão factual e sua validade por fingerprint/modelo/tempo, reservando duas chamadas quando a regressão ainda vale e três quando precisa ser refeita. Contagem de estoque exige os recibos de geração e revisão. O prompt exige situação hipotética na abertura e evita termos bloqueados também em negativas.

Retomada após cota: falta de conteúdo registrada no dia anterior permanece elegível tanto no planejador quanto no seletor do Vigia, com data/slot originais. Exceção restrita à conta cliente-x, estágio content-selection e erro de foto inédita/reserva esgotada; sem fila manual, slot publicado/inicializado, data futura, outra conta ou retomada indiscriminada de dias antigos. A janela é hoje e o dia BRT anterior. Não altera as treze faixas nem o orçamento.

Testes: validate-authorial-reserve, validate-authorial-slot-recovery (seletor real em fixture), validate-recovery-workflow, validate-restored-schedule (isolado do ledger de produção), validate-copy (76 pautas) e git diff --check passaram. A cota real continua insuficiente para gerar e revisar; publicação nova ainda não confirmada.
