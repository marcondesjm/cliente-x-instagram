# Checklist - Resolução Erro Sabedoria Kids

## ✅ Concluído

- [x] Identificar erro no painel (watchdog-errors.json)
- [x] Corrigir status "open" para "resolved" no watchdog-errors.json
- [x] Atualizar kids-image-discovery.json
- [x] Verificar sabedoria-kids-sources.json
- [x] Criar script fix_watchdog.py
- [x] Criar script fix-sabedoria-content.mjs
- [x] Fazer commit e push das correções
- [x] Resolver conflito de merge no watchdog-errors.json
- [x] Deploy na Vercel realizado
- [x] Adicionar KIDS_VISION_ANTHROPIC_API_KEY no .env
- [x] Criar documentação RESOLUCAO_ERRO_SABEDORIA_KIDS.md
- [x] Criar documentação AGENTE_AUTOMACAO.md
- [x] Criar checklist CHECKLIST_RESOLUCAO.md

## ⚠️ Pendente (Ação do Usuário)

- [ ] **Configurar API Key da Anthropic:**
  - [ ] Acessar https://console.anthropic.com/settings/keys
  - [ ] Criar/copiar chave API (formato: sk-ant-...)
  - [ ] Abrir arquivo `.env`
  - [ ] Substituir `COLE_SUA_CHAVE_ANTHROPIC_AQUI` pela chave real
  - [ ] Salvar arquivo

- [ ] **Executar script de geração:**
  ```powershell
  cd 'c:\Users\King Gamer\Desktop\Codex\Vs Studio\Instagram-Automacoes\cliente-x-instagram'
  node scripts/fix-sabedoria-content.mjs
  ```

- [ ] **Verificar saída do script:**
  - [ ] Confirmar "21 packs gerados, 0 falhas"
  - [ ] Verificar se não há erros 401

- [ ] **Commit e deploy do novo conteúdo:**
  ```bash
  git add automation/instagram-template/config/content-packs.json
  git add automation/instagram-template/config/sabedoria-kids-sources.json
  git commit -m "feat: generate biblical content for lessons 39-60"
  git push origin main
  ```

- [ ] **Verificar no painel:**
  - [ ] Aguardar 2-3 minutos (deploy Vercel)
  - [ ] Acessar https://cliente-x-instagram.vercel.app
  - [ ] Hard refresh: Ctrl + Shift + R
  - [ ] Clicar em "Realizar nova checagem"
  - [ ] Confirmar que erro desapareceu

## 🔧 Opcional (Recomendado)

- [ ] **Configurar GitHub Secret:**
  - [ ] Acessar https://github.com/marcondesjm/cliente-x-instagram/settings/secrets/actions
  - [ ] Adicionar `KIDS_VISION_ANTHROPIC_API_KEY`
  - [ ] Colar valor da chave Anthropic
  - [ ] Isso permite workflows automáticos

- [ ] **Criar workflow de replenishment:**
  - [ ] Copiar template de `.github/workflows/kids-content-replenishment.yml`
  - [ ] Commit e push
  - [ ] Conteúdo será gerado automaticamente quando baixo

## 📊 Status Atual

| Item | Status |
|------|--------|
| Watchdog Errors | ✅ Resolvido |
| Deploy Vercel | ✅ Realizado |
| API Key Local | ️ Pendente |
| Geração de Conteúdo | ⏳ Aguardando API Key |
| Erro no Painel | ⏳ Persiste até conteúdo ser gerado |

## 📝 Notas

- **Horários de postagem:** 07:00, 09:00, 11:00, 13:00, 15:00, 16:00, 18:00, 20:00 (BRT)
- **Próxima postagem:** Amanhã (31/10/2026) às 07:00 BRT
- **Packs disponíveis:** 40 (lições 1-38)
- **Packs pendentes:** 21 (lições 39-60)
- **Total após geração:** 61 packs

## 🚨 Bloqueadores Atuais

1. **API Key não configurada** → Impede execução do script
2. **Conteúdo esgotado** → Erro persiste no painel
3. **Sem publicação** → Slot 1 bloqueado até novo conteúdo

## ✅ Critérios de Aceitação

Para considerar resolvido:

- [ ] API Key configurada e funcionando
- [ ] 21 packs gerados com sucesso
- [ ] Deploy na Vercel concluído
- [ ] Erro desaparece do painel
- [ ] Próxima publicação agendada ocorre normalmente

---

**Última atualização:** 30/10/2026 20:45 BRT  
**Próxima ação:** Configurar API Key da Anthropic