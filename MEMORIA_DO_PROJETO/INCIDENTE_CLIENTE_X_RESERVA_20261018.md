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

Reposição validada no run 39142326219: regressão factual 4/4 e seis alegações revisadas, com inspeção dos quatro cartões e Story. Pauta authorial-7170d58abcfb7faa, “Pedidos duplicados sobrecarregam a operação”, ready com authorial-layout-v3 e exact-source-id-v1. O primeiro render foi retido após inspeção local identificar corte do Story e interiores vazios; composição corrigida, renderizada novamente e submetida a outra revisão independente. Citações livres foram substituídas pela seleção de IDs de fonte: o sistema copia literalmente a fonte escolhida e mantém o controle semântico positivo/negativo. Nenhuma citação inválida foi aceita.

Check local do publicador carregou uma reserva aprovada, selecionou o ID esperado para slot 1 e preservou a legenda. Revisões consumiram o teto editorial existente de 12 chamadas de 18/10; novas avaliações aguardam a renovação e o próximo ciclo. O estoque aprovado permanece utilizável, sem aumentar limite.

Recuperação real acionada pelo mecanismo já existente .github/force-instagram-watchdog.txt, commit 8c26635b, sem publicação manual nem alteração da agenda. Run 39142554068 concluiu com sucesso e publicou o slot 1 às 12:56 BRT. Feed CAROUSEL 18017783831744794, permalink https://www.instagram.com/p/DepDekfDVbu/ ; Story 18011158589969681. Primeiro comentário não configurado para essa pauta autoral: ID e erro nulos. result.json confirma dryRun=false e feed-and-story, packIndex editorial-visual-reserve-1. Fotos jornalísticas repetidas foram recusadas; a reserva autoral foi o caminho realmente usado.

publication-history.json e published-slots.json persistiram o slot 1, e os alertas correspondentes passaram a resolved com resolvedRun=39142554068. Artefato baixado e imagens finais conferidas localmente: capa, interiores e Story legíveis, diagrama completo e conclusão preservada. Evidências locais em output/authorial-publication-proof.json e output/authorial-published/; os JPEGs publicados também estão em docs/generated/cliente-x/2026-10-18-125522-slot-1/.

O incidente do slot 1 está resolvido. A reserva liberada foi consumida por essa publicação: outros horários ainda dependem de notícias com foto inédita ou de futuras pautas aprovadas após renovação da cota. Não afirmar estoque contínuo, meta de quatro materiais atingida ou treze publicações garantidas. Rotina em nuvem, computador pode ficar desligado. Próximo passo: acompanhar reposição de 19/10 e ampliar os briefings revisados quando o catálogo acabar.
