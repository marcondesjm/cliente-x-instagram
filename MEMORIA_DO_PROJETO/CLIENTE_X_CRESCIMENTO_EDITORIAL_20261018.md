# Cliente X — prioridade de público e seguidores

Pedido explícito de 18/10/2026: pautas que atraiam curtidas e pessoas interessadas em seguir o Instagram. Aplicação em cliente-x, @marcondes.machado.oficial; demais contas preservadas.

## Diretriz aplicada

Objetivo principal configurado como growth, disponível também no painel e no briefing. Prioridade editorial: uma situação reconhecível por quem atende, vende ou organiza uma empresa; abertura específica em linguagem simples; resposta completa no próprio conteúdo; exemplo fictício concreto; exercício útil; convite natural com benefício de acompanhar o perfil. Conteúdo deve servir para salvar ou enviar a um colega, sem condicionar a resposta a curtida, comentário, marcação ou compartilhamento.

Claude recebe a diretriz na geração. Nova pauta autoral identificada com business-audience-growth-v1 só entra na reserva após revisão independente confirmar hookSpecific, payoffDelivered, followReason e shareReason, além dos controles factuais, de novidade e visual existentes. São critérios editoriais, não previsões de desempenho. Dados não fornecidos pela API não viram prova de seguidores. Notícias continuam preservando fontes, títulos, fatos e proteção contra repetição.

Seleção automática ganha peso para problemas e aplicações empresariais concretas. Chamadas comerciais ao Direct deixam de ser a prioridade desse objetivo. Rotação de sinais trabalha descoberta, salvamento e compartilhamento; crescimento líquido de seguidores é conferido na conta, sem atribuí-lo automaticamente a um post. Agenda e formatos existentes preservados. Conteúdo publicado não foi excluído nem refeito.

## Ângulos para as próximas pautas

- A mensagem parece urgente. Quem definiu a prioridade?
- O pedido veio abreviado. Sua IA entendeu o mesmo?
- Você mudou a instrução. A resposta melhorou mesmo?
- A IA respondeu rápido. Quanto você precisou corrigir?
- Vai transferir o atendimento? Leve as pendências junto.

São orientações para a geração e revisão futuras, não estoque pronto ou promessas de sequência publicada.

## Referência e linha de base

Meta: https://about.fb.com/br/news/2024/04/ajudando-o-criador-de-conteudo-a-encontrar-novos-publicos/ — priorização de conteúdo original elegível em recomendações e cuidado com clickbait e truques de engajamento. Hub de boas práticas: https://about.fb.com/news/2024/10/best-practices-education-hub-creators-instagram/ . Consultados em 18/10/2026. Nenhuma fórmula de viralização inferida dessas fontes.

Snapshot de performance atualizado em 18/10 às 15:57 UTC: 2.615 seguidores; variação líquida de +8 na comparação diária da conta, sem atribuição causal a posts. Últimos 30 dias, observação de 24h colhida entre 24–32h: 54 Feed (mediana 22 visualizações) e 66 Reels (mediana 14). Um Reel de jogos chegou a 1.711 visualizações nessa janela, mas follows está indisponível para todos os 66 Reels; isso não comprova captação de seguidores e não justifica desviar o nicho para jogos. Coortes separadas por formato e janela. Evidência local: output/growth-baseline.json. Dados históricos, não resultado da nova diretriz.

## Validação e limite operacional

Testes de critérios de crescimento, retenção das provas/hash, rejeição por falta de resposta ou convite, bloqueio de incentivo artificial, briefing, sintaxe do painel/API e validate-copy passaram localmente. A cota editorial de 18/10 já terminou: nenhuma nova chamada paga foi feita para esta alteração. Validação semântica real do novo conjunto growth aguarda renovação da cota e próximo ciclo programado; não afirmar novas pautas aprovadas ou crescimento causado por esta mudança.

Implementação 6132c2a9 e testes de importação/geração c7c245e0 enviados a main. Deploy de produção dpl_AhmvCDLssfMFbMaqVFntbKPuLTzm READY, alias https://cliente-x-instagram.vercel.app . Conferência pública às 13:11 BRT: dashboard, briefing e normalizador HTTP200 com opção growth; configuração remota da conta confirma goal=growth. Evidência local output/growth-release-proof.json. A versão visual existente e o PDF Kids foram preservados.
