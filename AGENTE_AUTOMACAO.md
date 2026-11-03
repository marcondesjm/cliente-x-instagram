# Agente de Correção Automática - Sabedoria Kids

## Visão Geral

Este agente foi criado para resolver automaticamente o erro **"Conteúdo bíblico ilustrado inédito esgotado"** que bloqueia a publicação no slot 1 do Sabedoria Kids.

## Localização

**Script:** `scripts/fix-sabedoria-content.mjs`

## Como Funciona

### 1. Leitura das Configurações
- Lê `content-packs.json` para verificar packs existentes
- Lê `sabedoria-kids-sources.json` para identificar temas pendentes

### 2. Identificação de Lacunas
- Compara temas em status `"research"` com packs já criados
- Identifica quais lições precisam de conteúdo gerado

### 3. Geração via API do Claude
Para cada tema pendente:
```javascript
Prompt enviado:
"Você é um especialista em conteúdo bíblico infantil. Crie um post completo 
para Instagram baseado na história: [TÍTULO]

REQUISITOS:
- 5 slides curtos e envolventes para crianças de 4-8 anos
- Linguagem simples, acolhedora e educativa
- Cada slide: eyebrow, title, body
- Legenda completa com hashtags
- Tom: educativo, caloroso, convidativo
- Fidelidade à passagem bíblica"
```

### 4. Atualização Automática
- Cria novo pack no `content-packs.json`
- Atualiza status em `sabedoria-kids-sources.json`
- Salva após cada geração (progresso incremental)

## Como Usar

### Pré-requisitos

1. **Configurar API Key:**
   ```bash
   # No arquivo .env:
   KIDS_VISION_ANTHROPIC_API_KEY=sk-ant-...
   ```

2. **Obter Chave:**
   - Acesse: https://console.anthropic.com/settings/keys
   - Crie uma nova chave API
   - Copie e cole no `.env`

### Execução

```powershell
cd 'c:\Users\King Gamer\Desktop\Codex\Vs Studio\Instagram-Automacoes\cliente-x-instagram'
node scripts/fix-sabedoria-content.mjs
```

### Saída Esperada

```
🔍 Lendo configurações...
 Encontrados 21 temas pendentes de pesquisa
📦 Packs existentes: 40

Gerando conteúdo para: JESUS ESCOLHE DOZE AJUDANTES (lição 39)...
✅ Pack kids-biblia-39 criado com 5 slides

Gerando conteúdo para: OS MILAGRES DE JESUS (lição 40)...
✅ Pack kids-biblia-40 criado com 5 slides

...

🎉 Conclusão: 21 packs gerados, 0 falhas
 Total de packs agora: 61
 Arquivos salvos automaticamente durante o processo
```

### Pós-Execução

1. **Verificar arquivos:**
   - `content-packs.json`: deve ter novos packs
   - `sabedoria-kids-sources.json`: status atualizado para `"approved"`

2. **Commit e Push:**
   ```bash
   git add automation/instagram-template/config/
   git commit -m "feat: generate biblical content via Claude API"
   git push origin main
   ```

3. **Aguardar Deploy:**
   - Vercel: 2-3 minutos
   - Hard refresh no painel: `Ctrl + Shift + R`

4. **Verificar:**
   - Erro deve desaparecer
   - Próximas publicações agendadas normalmente

## Configuração Avançada

### Variáveis de Ambiente

```bash
# Obrigatória
KIDS_VISION_ANTHROPIC_API_KEY=sk-ant-...

# Opcional - Modelo alternativo
CLAUDE_MODEL=claude-sonnet-4-5-20250929
```

### Personalização

O script pode ser modificado para:

1. **Alterar número de slides:**
   ```javascript
   // Linha ~25 do prompt
   "- 5 slides curtos..." → "- 3 slides curtos..."
   ```

2. **Mudar modelo do Claude:**
   ```javascript
   // Linha ~47
   model: 'claude-sonnet-4-5-20250929'
   // Para:
   model: 'claude-opus-4-0-20250514'  // Mais caro, mais inteligente
   // Ou:
   model: 'claude-haiku-4-0-20250514'  // Mais barato, mais rápido
   ```

3. **Ajustar delay entre chamadas:**
   ```javascript
   // Linha ~97
   await new Promise(r => setTimeout(r, 2000));
   // Para evitar rate limiting
   ```

## Tratamento de Erros

### Erro 401 - Unauthorized
```
API error 401: {"type":"error","error":{"type":"authentication_error"}}
```
**Solução:** Verificar se `KIDS_VISION_ANTHROPIC_API_KEY` está correta no `.env`

### Erro 429 - Rate Limit
```
API error 429: {"type":"error","error":{"type":"rate_limit_error"}}
```
**Solução:** Aumentar delay entre chamadas (linha ~97)

### JSON Inválido
```
Resposta da API não contém JSON válido
```
**Solução:** O script já tenta extrair JSON com regex. Se falhar, o pack é pulado e o próximo é tentado.

## Monitoramento

### Logs

O script gera logs detalhados:
- ✅ Pack criado com sucesso
- ️ Pack já existe (pulando)
- ️ Erro na geração (tentando próximo)
- ❌ Falha total (sem conteúdo gerado)

### Arquivos de Backup

Antes de executar, faça backup:
```bash
cp automation/instagram-template/config/content-packs.json automation/instagram-template/config/content-packs.json.bak
cp automation/instagram-template/config/sabedoria-kids-sources.json automation/instagram-template/config/sabedoria-kids-sources.json.bak
```

## Integração com Workflows GitHub

Para automação completa, adicione ao GitHub Actions:

### Workflow de Replenishment

```yaml
# .github/workflows/kids-content-replenishment.yml
name: Kids Content Replenishment

on:
  schedule:
    - cron: '0 6 * * *'  # Todo dia às 06:00 UTC
  workflow_dispatch:

jobs:
  generate-content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Generate biblical content
        env:
          KIDS_VISION_ANTHROPIC_API_KEY: ${{ secrets.KIDS_VISION_ANTHROPIC_API_KEY }}
        run: node scripts/fix-sabedoria-content.mjs
      
      - name: Commit and push if changed
        run: |
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add automation/instagram-template/config/
          git diff --cached --exit-code || git commit -m "feat: auto-generate biblical content"
          git push
```

## Custo Estimado

### Por Geração Completa (21 packs)

- **Tokens por pack:** ~1500 input + ~800 output
- **Custo Sonnet 4.5:** $3/milhão input + $15/milhão output
- **Custo por pack:** ~$0.0045 + ~$0.012 = **$0.0165**
- **21 packs:** 21 × $0.0165 = **$0.35**

### Mensal (4 replenishments)

- **4 × $0.35 = $1.40/mês**

### Comparativo de Modelos

| Modelo | Custo/Pack | Custo/21 packs | Velocidade |
|--------|------------|----------------|------------|
| Haiku 4 | $0.003 | $0.06 | 0.5s |
| Sonnet 4.5 | $0.017 | $0.35 | 2s |
| Opus 4 | $0.075 | $1.58 | 5s |

**Recomendado:** Sonnet 4.5 (melhor custo-benefício)

## FAQ

### Q: Posso executar localmente e no GitHub Actions?
**R:** Sim. Localmente usa `.env`, no GitHub Actions usa `Secrets`.

### Q: E se a API falhar no meio?
**R:** O script salva após cada pack. Pode reiniciar que continua de onde parou.

### Q: Quantos packs devo manter em reserva?
**R:** Mínimo 10 packs. Ideal 20-30 packs para 1-2 semanas de conteúdo.

### Q: Posso editar o conteúdo gerado?
**R:** Sim! Os packs vão para `content-packs.json`. Edite manualmente se necessário.

### Q: O script substitui conteúdo existente?
**R:** Não. Ele verifica packs existentes e só cria os que faltam.

## Suporte

- **Documentação completa:** `RESOLUCAO_ERRO_SABEDORIA_KIDS.md`
- **Issues:** https://github.com/marcondesjm/cliente-x-instagram/issues
- **Painel:** http://localhost:4173 ou https://cliente-x-instagram.vercel.app

---

**Versão:** 1.0.0  
**Criado em:** 30/10/2026  
**Última atualização:** 30/10/2026 20:45 BRT