# 🚀 Guia de Deploy na Nuvem - Sabedoria Kids

Este projeto agora possui um sistema anti-duplicidade integrado que consulta o arquivo `published-log.json` antes de qualquer publicação, garantindo que nenhum post seja publicado duas vezes.

## Arquivos Criados para a Nuvem

1. **`scripts/run-cloud-automation.mjs`**: Script principal que roda 24/7, verifica agendamentos e consulta o log de publicações.
2. **`automation/instagram-template/config/published-log.json`**: Banco de dados local que registra tudo que foi publicado.
3. **`Dockerfile`**: Configuração para rodar o projeto em qualquer servidor Docker.
4. **`railway.toml`**: Configuração específica para deploy no Railway.app.

## Como Funciona o Controle Anti-Duplicidade

- Antes de publicar, o script lê o `published-log.json`.
- Se o `packId` já estiver lá com status "published", ele pula o item e marca como "skipped".
- Ao publicar com sucesso, o registro é salvo imediatamente no log.

## Passo a Passo para Publicar na Nuvem (Railway)

1. **Suba o código para o GitHub** (exceto o `.env`).
2. **Crie um projeto no Railway** e conecte o repositório.
3. **Adicione as Variáveis de Ambiente** na aba "Variables":
   - `SABEDORIA_KIDS_INSTAGRAM_ACCESS_TOKEN`
   - `SABEDORIA_KIDS_INSTAGRAM_USER_ID`
4. **O deploy será automático**. O script `run-cloud-automation.mjs` iniciará e ficará verificando novos agendamentos.

## Próximos Passos Locais

Para testar o sistema de controle antes de subir:
```bash
node scripts/run-cloud-automation.mjs
```

Este comando verificará a fila atual, bloqueará o "kids-biblia-02" (já publicado) e mostrará o status no console.