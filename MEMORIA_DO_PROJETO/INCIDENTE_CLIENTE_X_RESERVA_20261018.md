# Cliente X — reposição autoral assistida por Claude — 18/10/2026

## Incidente observado

Conta cliente-x, @marcondes.machado.oficial. Run 39136840769 falhou no slot 1, etapa content-selection, às 11:39 BRT, antes de enviar mídia à Meta.

visual-selection.json registrou duas matérias do Tecnoblog sem foto inédita aprovada. Conferência das URLs atuais contra o histórico confirmou repetição: capas-iasartboard-2.png já aparecia em 14/09 e Capa-Mark-Zuckerberg-03-1536x864.png em 13/09. A única reserva autoral, “Antes de automatizar, defina quando a IA deve parar.”, já foi publicada em 17/10 às 14:42 BRT. O bloqueio preservou a proteção contra repetição.

## Correção implementada

Workflow authorial-reserve.yml gera até duas pautas por execução, busca quatro reservas elegíveis e roda às 06:35/15:35 BRT. Usa o segredo existente e o MESMO teto de 12 chamadas/1,5M tokens da auditoria editorial; mesma trava de concorrência. Não altera a cota Kids, o cron de publicação, credenciais Meta ou conteúdo já publicado.

Pautas educativas limitadas a briefings fictícios revisados, sem notícia, caso real, estatísticas ou resultado prometido. Claude redige quatro cartões, legenda e Story; uma chamada independente revê todo o texto contra as fontes literais e o histórico, além de inspecionar os cinco renders. Antes de avaliar conteúdo, um teste positivo/negativo controla alegações inventadas e instruções maliciosas.

Artes são diagramas autorais identificados, pertinentes ao briefing, com capa/Story próprios. Nenhuma fotografia repetida é liberada. Estoque separado em authorial-reserve.json; somente ready com hash exato do texto, ativos, render, citações e recibos de geração/revisão entra na seleção da conta cliente-x. Outras contas não recebem essas pautas. Texto revisado é preservado pelo formatador. Publicação e recuperação de alerta dependem do fluxo automático e dos ledgers reais.

O catálogo de briefings é finito: após avaliar todos, topics_exhausted exige ampliação editorial. Um estoque ou workflow verde não prova publicação nem garante preencher os 13 horários.

## Validações

validate-authorial-reserve, validate-editorial-visual-reserve, validate-editorial-api-review, validate-recovery-workflow, validate-kids-scene-replenishment e validate-copy passaram localmente. Primeiro run 39140989442 falhou por export ausente antes de chamar a API; corrigido. Run 39141126559 rejeitou citação fora da fonte no teste factual; nenhuma pauta liberada. A resposta estruturada agora é persistida antes da validação para diagnóstico, sem segredos.

## Prova de produção

Em conferência: run 39141267484. Não declarar reposição validada ou incidente resolvido até confirmar conteúdo ready, seleção automática, publicação real, histórico e encerramento do alerta.
