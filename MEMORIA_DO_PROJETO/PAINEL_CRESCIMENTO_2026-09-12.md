# Painel de melhoria do Instagram — v6.04

Base: origin/main a46c469b, branch feat/growth-panel-20260912, checkout cliente-x-instagram-growth-panel-20260912. Site público consultado antes da alteração: HTTP 200, v6.03, sem a aba de melhoria.

Implementação: aba Melhorar Instagram com checklist, bio copiável, três modelos educativos integrados ao editor existente, proposta de teste de 14 dias e comparação de totais antes/depois. Inputs vazios continuam sem dado; zero informado é preservado. Não contém a nota comercial 42/100 nem promessa de resultado.

O plano é salvo por conta em growth-plans.json, pelo caminho autenticado /api/state, com autorização da conta e revisão para impedir sobrescrita por outra sessão. Em produção, usa o armazenamento GitHub já utilizado pelo painel; no servidor local, usa o arquivo local. Não registrar nomes ou dados pessoais de leads: o formulário recebe somente contagens agregadas.

Modelos criam rascunhos no editor; precisam de revisão e salvamento pelo fluxo existente. Não alteram layout de publicação, agenda, watchdog, bio do Instagram ou automação do Direct. O teste de um post por dia é uma proposta visível, não uma mudança nos disparos.

Validação: scripts/validate-growth-plan.mjs cobre autorização, isolamento de contas, leitura após escrita com GitHub simulado, conflito entre sessões, datas, limites, ausência versus zero e sintaxe dos scripts do painel. Servidor local serviu a página e o script com HTTP 200. Não foi realizada inspeção visual em navegador nesta etapa.

Hospedagem preservada na Vercel: este painel depende de funções Node existentes, sem migração para outro serviço. Publicação e verificação remota devem constar no checkpoint final.
