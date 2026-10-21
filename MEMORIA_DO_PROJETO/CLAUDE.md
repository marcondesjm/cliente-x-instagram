# Projeto Cliente X Instagram — Histórico da Sessão (2026-10-21)

## 1. Meliori Fisioterapia (Onboarding e Visibilidade)
- **Problema:** Conta invisível no dropdown e convite apontando para "Marcondes".
- **Causa:** `ownerEmail` restritivo (`ehdecasashop@gmail.com`) e timeout de 10s na criação de contas.
- **Solução:** 
  - Removido `ownerEmail` do `accounts.json` (commit `68ad3c02`).
  - Aumentado `maxDuration` para 60s no `vercel.json` (commit `eae04876`).
  - Corrigida vírgula órfã no JSON que derrubou a API (commit `0264db6f`).
- **Estado:** API retorna 5 contas. Para gerar o convite: selecionar `meliorifisioterapia` no dashboard (Ctrl+F5) e clicar em "Gerar para conta selecionada".

## 2. Sabedoria Kids (Erro "Conteúdo Esgotado")
- **Problema:** Vigia travado no slot 1 com "Conteúdo bíblico ilustrado inédito esgotado".
- **Diagnóstico:** 0 pautas prontas-inéditas (17 publicadas, 20 sem imagem).
- **Ações Executadas:**
  1. Disparado `Sabedoria Kids - buscar imagens em sites` (discovery).
  2. Disparado `Sabedoria Kids - repor cenas novas` (replenish).
  3. Disparado `Sabedoria Kids - diagnosticar transporte visual` (para validar diagnósticos de visão).
  4. Limpeza manual de 18 erros antigos no `watchdog-errors.json` (commit `71f54be2`).
- **Resultado:** Estoque recuperado para **17 pautas prontas-inéditas**. API confirma 0 erros abertos críticos e 11 slots em `awaiting-selection`.
- **Nota sobre Tokens:** O consumo ocorre via proxy `claude-ss` (plano fixo), não aparecendo no painel direto da Anthropic. O modo `activate` para as 20 pautas restantes exige piloto com rotina desativada (trava de segurança).

## 3. Agenda Meliori vs Sabedoria Kids
- **Problema:** Agenda de 12 slots da Sabedoria aparecia na Meliori.
- **Verificação:** API retorna `scheduleBrt: 0` e `dailyPlan: 0` para Meliori.
- **Conclusão:** Era cache de navegador. Resolvido com Ctrl+F5.

## Commits Relevantes (Main)
- `eae04876`: Increase api/state.js serverless timeout to 60s
- `68ad3c02`: Remove restrictive ownerEmail from meliorifisioterapia account
- `0264db6f`: Fix orphaned trailing comma in accounts.json
- `71f54be2`: Clear stale sabedoria-kids bible-content-selection watchdog errors

## Lições Técnicas
- Validar JSON com `node -e` antes de deployar (PowerShell aceita vírgulas penduradas que o Node rejeita).
- `vercel deploy --prod` via CLI usa o working tree local; se estiver quebrado, derruba a produção.
- O fluxo de ilustração Kids exige: Discovery -> Diagnóstico Visual Válido -> Pilot/Activate.