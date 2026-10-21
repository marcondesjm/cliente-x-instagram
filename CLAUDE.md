# Projeto Cliente X Instagram — Handoff de Sessão (2026-10-21 → continuar amanhã)

Este arquivo é o ponto de partida para retomar o trabalho. Leia na ordem: **Constituição Editorial** → **Estado Atual** → **Pendências** → **Comandos Prontos** → **Arquitetura/Armadilhas**.

> A seção **Constituição Editorial** abaixo (IDENTIDADE, REGRAS EDITORIAIS, HIPÓTESES ATIVAS) é compilada automaticamente em `automation/instagram-template/config/claude-editorial-constitution.json` a cada coleta de performance (2h) e injetada nos prompts da API do Claude. Edite as regras manualmente; padrões e hipóteses são preenchidos pelo `claude-learning-review.yml`.

---

## IDENTIDADE
- Nicho: ensino prático de IA para atendimento, vendas e operação de negócios
- Audiência: donos de pequenos e grandes negócios que querem reduzir tarefas repetitivas com IA
- Tom: consultivo, nunca promissor ou sensacionalista
- Objetivo: growth orgânico via utilidade demonstrável (salvamentos, compartilhamentos, comentários)

## REGRAS EDITORIAIS

### Limites Obrigatórios
- Nunca prometer resultado, curtidas ou seguidores, nem em ressalvas negativas
- Conteúdo educativo autoral é exercício fictício com situação hipotética explícita, nunca caso real ocorrido
- Sem algarismos nem hashtags numéricas em legendas
- Legenda entre 300 e 600 caracteres (mirar 400), dois parágrafos curtos, com pergunta útil e convite natural
- Cada cartão: eyebrow 3–32, title 12–72, body 35–180 caracteres; body é UMA frase de 12–18 palavras

### Elementos Obrigatórios
- Capa com dúvida concreta ou situação hipotética reconhecível
- Story relacionado com pergunta própria e convite ao feed, sem copiar a capa
- Procedimento em passos distintos, tratamento de informação ausente e conferência humana

### Padrões Proibidos
- Oposição artificial "não é X, é Y"
- Sequências literais de barra e n — usar quebras JSON normais
- Marcas, estatísticas ou dados externos sem fonte verificada
- Palavras garantido/comprovado, inclusive em negativas

### Padrões Confirmados
<!-- Preenchido automaticamente pelo learning-review. Formato: - [YYYY-MM-DD] descrição (n=, reach≥) -->

### Anti-Padrões Detectados
<!-- Preenchido automaticamente pelo learning-review. Formato: - [YYYY-MM-DD] descrição -->

## HIPÓTESES ATIVAS
<!-- Preenchido automaticamente pelo learning-review a cada 6h. Formato: - [YYYY-MM-DD] eixo/variante — hipótese [formato, métrica] -->

---

## 0. TL;DR do que foi resolvido hoje
1. **Meliori Fisioterapia**: conta estava invisível no dropdown e o convite apontava para "Marcondes". Corrigido (removido `ownerEmail` restritivo + timeout Vercel 10s→60s + vírgula órfã no JSON que derrubou a API). API agora retorna 5 contas incluindo `meliorifisioterapia`.
2. **Sabedoria Kids "conteúdo esgotado"**: vigia travado no slot 1. Estoque reabastecido de 0 → **17 pautas ilustradas inéditas** via workflows `buscar imagens` + `repor cenas`. Limpos 18 erros antigos do vigia. API confirma slots em `awaiting-selection` (prontos para disparo).
3. **Agenda Sabedoria aparecendo na Meliori**: era cache de navegador (API retorna `scheduleBrt:0, dailyPlan:0` para Meliori). Resolvido com Ctrl+F5.

---

## 1. Estado Atual Verificado (produção)
- **Deploy ativo**: commit `71f54be2`+ no `main`, API `https://cliente-x-instagram.vercel.app/api/state` → HTTP 200.
- **Contas (5)**: `cliente-x`, `cliente-turismo`, `sabedoria-kids`, `radioieqpc`, `meliorifisioterapia`.
- **Timeout** `api/state.js` = 60s (`vercel.json` → `functions.api/state.js.maxDuration`).
- **Sabedoria Kids**: 37 packs totais, 17 com imagem (prontos), 18 no histórico de publicação, **17 prontos-e-inéditos disponíveis para hoje**. `curatedOnly:true`, `radar.enabled:false`.
- **Watchdog Sabedoria**: após limpeza, ~0–1 erro residual (slot atrasado de ontem); 11 slots em `awaiting-selection`.

### Commits relevantes no `main`
| Commit | O que fez |
|---|---|
| `eae04876` | `maxDuration: 60` em `api/state.js` (timeout Vercel) |
| `68ad3c02` | Removeu `ownerEmail` restritivo de `meliorifisioterapia` |
| `0264db6f` | Corrigiu vírgula órfã no `accounts.json` (JSON inválido → 500) |
| `71f54be2` | Limpou 18 erros `bible-content-selection` stale do watchdog |

---

## 2. Pendências para amanhã (prioridade)

### 2.1 Gerar convite correto da Meliori (ação do usuário, ~30s)
A conta já existe e aparece na API. O convite antigo apontava para `cliente-x` porque foi gerado com a conta errada selecionada.
1. Abrir https://cliente-x-instagram.vercel.app → logar → **Ctrl+F5**.
2. Selecionar `meliorifisioterapia` em "CONTA ATIVA".
3. Clicar **"Gerar para conta selecionada"** (usa `appState.selectedAccount`).
4. Copiar pelo botão **"Copiar convite"** (NUNCA selecionar com o mouse — corrompe o token base64url → "Assinatura do convite inválida").
5. Cliente abre o link → deve ver "Meliori", não "Marcondes".

### 2.2 Ilustrar as 20 pautas Sabedoria Kids sem imagem (expansão, NÃO urgente)
O erro "esgotado" já está resolvido com as 17 pautas atuais. Mas há **20 packs sem ilustração** que poderiam ampliar o estoque. Para gerá-las via API paga de visão, o fluxo exige nesta ordem:
1. `Sabedoria Kids - buscar imagens em sites` (discovery) — popula candidatas em `kids-image-discovery.json`.
2. `Sabedoria Kids - diagnosticar transporte visual` — preenche diagnósticos obrigatórios em `kids-vision-transport-test.json` (holdout 4/4, eventGrounding `depicted-event-v4`, visualDiversity `visual-diversity-v1`). **Sem isso, `activate`/`pilot` falham com "Revisão não pertence ao piloto atual ou venceu".**
3. `Sabedoria Kids - repor cenas novas` modo `pilot` com `pilot_pack=kids-biblia-XX`.

**Travas descobertas (importante):**
- Modo `activate` falha se `pilotRun` estiver vencido (>24h) → precisa rodar `pilot` primeiro para criar piloto fresco.
- Modo `pilot` falha com **"Piloto exige rotina desativada"** se `kids-scene-replenishment.json` → `enabled:true`. A trava de segurança impede piloto pago enquanto a rotina automática está ligada. Para pilotar: temporariamente setar `enabled:false`, rodar pilot, depois religar.
- `calibrate` só testa leitura de pixels; NÃO regenera os diagnósticos holdout/grounding/diversity (esses vêm do workflow de transporte visual).

**Packs sem imagem (20)**: kids-biblia-01, 02, 09, 12, 13, 15, 18, 19, 20, 22, 23, 25, 26, 28, 29, 30, 31, 32, 34, 35.

### 2.3 Tokens Claude "não gastos"
Na verdade foram gastos (13 calls/114k tokens em 2026-10-20; 1.5M–4.3M nos dias anteriores). O consumo vai pelo proxy **`claude-ss`** (`https://claude-ss.ia.br/v1/messages`) com `KIDS_VISION_ANTHROPIC_API_KEY`, em plano fixo confirmado (`billingMode:fixed_plan_user_confirmed`, `policy.quotaMode:provider` → `usesProviderQuota=true`). Por isso **não aparece como cobrança por token no painel direto da Anthropic** — a cota é do provedor. Chave está em GitHub Secret `KIDS_VISION_ANTHROPIC_API_KEY` (não em `.env` local).

---

## 3. Comandos Prontos (PowerShell, cwd = cliente-x-instagram)

### Autenticar gh CLI (token do Git Credential Manager — funciona, escopo repo)
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$credInput = "protocol=https`nhost=github.com`n"
$token = ($credInput | & git credential fill 2>$null | Select-String "^password=" | ForEach-Object { $_.Line -replace '^password=','' })
$env:GH_TOKEN = $token
# gh já instalado via choco (C:\Program Files\GitHub CLI\gh.exe). Auth: marcondesjm.
```

### Disparar workflows Sabedoria Kids
```powershell
& gh workflow run "Sabedoria Kids - buscar imagens em sites" --ref main
& gh workflow run "Sabedoria Kids - diagnosticar transporte visual" --ref main
& gh workflow run "Sabedoria Kids - repor cenas novas" --ref main -f mode=replenish
& gh workflow run "Sabedoria Kids - repor cenas novas" --ref main -f mode=pilot -f pilot_pack=kids-biblia-01
& gh workflow run "Sabedoria Kids - repor cenas novas" --ref main -f mode=activate
# Monitorar:
& gh run list --workflow="Sabedoria Kids - repor cenas novas" --limit 3
& gh run view <RUN_ID> --log --job <JOB_ID> | Select-String -Pattern "health|blocked|error|Error" | Select-Object -Last 30
```

### Verificar estoque Sabedoria Kids (prontos vs inéditos)
```powershell
node -e "const fs=require('fs'),crypto=require('crypto');const C='automation/instagram-template/config/';const packs=JSON.parse(fs.readFileSync(C+'content-packs.json','utf8')).find(g=>g.account==='sabedoria-kids').packs;const hist=(JSON.parse(fs.readFileSync(C+'publication-history.json','utf8'))['sabedoria-kids'])||[];const fp=p=>{try{const s=p.slides[0];return crypto.createHash('sha256').update(JSON.stringify({t:s.title,b:s.body})).digest('hex')}catch{return ''}};const used=new Set(hist.map(h=>h.feedFingerprint).filter(Boolean));const ready=packs.filter(p=>p.slides&&p.slides[0]&&p.slides[0].imagePath);const unpub=ready.filter(p=>!used.has(fp(p)));console.log('total='+packs.length+' ready='+ready.length+' hist='+hist.length+' UNPUBLISHED-READY='+unpub.length);"
```

### Validar JSON ANTES de deployar (usar Node, não PowerShell)
```powershell
node -e "JSON.parse(require('fs').readFileSync('automation/instagram-template/config/accounts.json','utf8'));console.log('JSON VALIDO')"
```

### Validar constituição editorial
```powershell
node scripts/compile-editorial-constitution.mjs
```

### Checar estado da API de produção
```powershell
& curl.exe -s "https://cliente-x-instagram.vercel.app/api/state?account=sabedoria-kids" --max-time 60 -o "_st.json"
node -e "const d=JSON.parse(require('fs').readFileSync('_st.json','utf8'));console.log('account:',d.selectedAccount,'slots:',(d.dailyPlan||[]).length,'errosAbertos:',(d.watchdogErrors||[]).filter(e=>e.status==='open').length)"
Remove-Item -Force "_st.json" -ErrorAction SilentlyContinue
```

---

## 4. Arquitetura e Armadilhas

### Fluxo de seleção de conteúdo (publish-carousel.mjs)
- `planForAutomaticSlots(account,...)` itera `account.scheduleUtc` — se vazio, retorna agenda vazia (por isso Meliori sem horários = 0 slots, SEM vazamento).
- Erro "Conteúdo bíblico ilustrado inédito esgotado" é lançado em `publish-carousel.mjs` (~linha 5988/11931) quando `!radar.enabled && account.contentProfile.curatedOnly` e não há pack inédito. Stage: `bible-content-selection`.
- `illustratedStockSummary` (lib/illustrated-stock-summary.js) calcula ready/unpublished comparando fingerprints com `publication-history.json`.

### Constituição editorial (loop de aprendizado contínuo)
- `scripts/compile-editorial-constitution.mjs` lê `CLAUDE.md` + `performance-insights.json` e gera `claude-editorial-constitution.json` (validado contra `editorial-constitution-v1`).
- `lib/claude-performance-context.js` carrega a constituição e prependa `constitutionBrief()` em todo `claudeLearningBrief()` enviado à API.
- `scripts/replenish-authorial-reserve.mjs --analyze-only` faz writeback: cada hipótese aceita é anexada em `## HIPÓTESES ATIVAS` do CLAUDE.md.
- Workflow `instagram-performance-learning.yml` recompila a constituição a cada 2h após coletar performance.

### Watchdog / resolução de erros
- Erros registrados em `automation/instagram-template/config/watchdog-errors.json` (array; campos: key, status, account, date, slotIndex, stage, error, resolvedAt).
- Um erro `bible-content-selection` só vira `resolved` quando um disparo real publica conteúdo novo para aquele slot (lib/scheduled-content-guard.js:61). Para limpar manualmente erros stale: marcar `status:'resolved'` + `resolvedAt` e commitar.

### Onboarding / convites
- Token de convite = base64url assinado (HMAC-SHA256 com `ADMIN_SESSION_SECRET`), payload `{account, email, expiresAt}`. TTL 48h. Qualquer alteração ao copiar invalida a assinatura.
- `canAccessAccount` (lib/auth.js): owner vê tudo; não-owner vê só se `account.ownerEmail===session.email` OU conta está em `session.accounts`. Owner = email === `ADMIN_EMAIL` (Vercel env). Admin atual: `marcondesgestaotrafego@gmail.com`.
- Página de ativação: `/ativar` → `docs/ativar.html`; lê `?token=` e chama `/api/state?instagram=invite&token=`.

### Deploy
- Vercel faz auto-deploy do `main` via integração Git (caminho saudável). `vercel deploy --prod` via CLI builda do **working tree local** — se o arquivo local estiver quebrado, derruba a produção (aconteceu hoje com a vírgula órfã). Preferir push para `main` e deixar o auto-deploy, OU validar JSON com Node antes.
- `readConfigGroups(filePath, localPath)` lê do GitHub primeiro, cai no local (empacotado no build) se falhar.

### Armadilhas gerais
- **PowerShell `ConvertFrom-Json` aceita vírgulas penduradas que o Node rejeita.** Sempre validar configs com `node -e "JSON.parse(...)"` antes de deployar.
- O `git push` frequentemente é rejeitado (non-fast-forward) porque workflows automáticos commitam o tempo todo ("Update Instagram schedule state"). Sempre `git pull --rebase origin main` antes do push; se der conflito em `watchdog-errors.json`/`*-state.json`, abortar o rebase, resetar para `origin/main`, reaplicar a mudança sobre o estado fresco e pushar de novo.
- `gho_` (token OAuth do Git) não tem escopo `read:org`, mas funciona para `gh workflow run` / `gh run view` via `$env:GH_TOKEN`.
- Arquivos de estado dos workflows Kids: `kids-scene-replenishment.json` (estado/calls/diagnostics/pilotRun/circuit), `kids-reviewed-scenes.json` (recipes), `kids-scene-automation.json` (assembly entries), `kids-image-discovery.json` (candidatas de imagem), `kids-vision-transport-test.json` (diagnósticos de visão que destravam activate/pilot).

---

## 5. Checklist de retomada amanhã
- [ ] Meliori: gerar convite com a conta correta selecionada (item 2.1) e confirmar com o cliente que abre "Meliori".
- [ ] Sabedoria Kids: confirmar no painel que os slots 08:00–20:00 publicaram automaticamente (estoque de 17 já cobre o dia).
- [ ] (Opcional) Ilustrar as 20 pautas restantes: discovery → diagnóstico visual → pilot (com `enabled:false` temporário) → activate (item 2.2).
- [ ] Se editar qualquer `*.json` de config: validar com Node antes de commitar/deployar.
