# Template de automacao para Instagram

Este template reaproveita o fluxo do feed do NerionOS para outras contas de Instagram.

## O que ele faz

- Renderiza carrossel 1080x1080 com Playwright.
- Escolhe pack de conteudo por data.
- Alterna estilos visuais por data.
- Valida acentos em PT-BR e bloqueia mojibake.
- Permite `render-only` para revisar imagens sem publicar.
- Permite `dry-run` para criar container no Instagram sem publicar.
- Publica carrossel via Instagram Graph API.

## Arquivos principais

- `automation/instagram-template/config/accounts.example.json`
- `automation/instagram-template/config/content-packs.example.json`
- `automation/instagram-template/config/visual-styles.example.json`
- `automation/instagram-template/scripts/publish-carousel.mjs`
- `automation/instagram-template/workflows/instagram-feed-template.yml`

## Como criar uma nova conta

1. Duplique os arquivos `.example.json` para `accounts.json`, `content-packs.json` e `visual-styles.json` se quiser manter configuracoes reais fora dos exemplos.
2. Adicione a conta em `accounts.json` ou `accounts.example.json`.
3. Crie os packs no grupo correspondente em `content-packs.json` ou `content-packs.example.json`.
4. Configure os secrets no GitHub com os nomes usados na conta:
   - `CLIENTE_INSTAGRAM_ACCESS_TOKEN`
   - `CLIENTE_INSTAGRAM_USER_ID`
   - `IMGBB_API_KEY`
5. Copie `workflows/instagram-feed-template.yml` para `.github/workflows/instagram-feed-<cliente>.yml`.
6. Ajuste o `on.schedule` se quiser agendamento automatico.

## Comandos locais

Validar textos:

```powershell
node automation\instagram-template\scripts\publish-carousel.mjs --account cliente-exemplo --validate-copy
```

Renderizar sem publicar:

```powershell
node automation\instagram-template\scripts\publish-carousel.mjs --account cliente-exemplo --render-only
```

Dry-run:

```powershell
node automation\instagram-template\scripts\publish-carousel.mjs --account cliente-exemplo --dry-run
```

Publicar de verdade:

```powershell
node automation\instagram-template\scripts\publish-carousel.mjs --account cliente-exemplo
```

## Checklist antes de publicar

- A conta retornada pela Graph API bate com `expectedUsername`.
- `--validate-copy` passa.
- `--render-only` gera imagens revisadas.
- A legenda nao tem mojibake.
- O primeiro workflow para uma conta nova deve rodar com `dry_run=true`.
