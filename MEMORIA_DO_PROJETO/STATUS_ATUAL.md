# Status Atual

Atualizado em: 2026-08-15 21:05 BRT

## Projeto ativo

- Pasta: `cliente-x-instagram-modern`
- Branch: `feature/modern-editorial-system`
- Commit atual: `39d2d13` (`Add official news radar status to dashboard`)
- Dashboard: `docs/dashboard.html`
- Versao visivel atual: `v4.60`

## Estado do workspace

- Alteracoes locais pendentes no momento da checagem:
  - `api/upload-image.js`
  - `api/state.js`
  - `docs/dashboard.html`
  - `MEMORIA_DO_PROJETO/`
- O projeto moderno esta em uma linha separada do `cliente-x-instagram` original.
- Nao foi feito deploy nesta retomada.
- Nao foi feita publicacao real no Instagram nesta retomada.

## Validacoes executadas

Comandos rodados em `cliente-x-instagram-modern`:

```powershell
node --check api\upload-image.js
npm run validate-copy
```

Resultado:

- `node --check api\upload-image.js`: passou.
- `validate-copy`: passou.
- Conta: `cliente-x`.

Validacao anterior preservada:

- `dry-run` passou em 2026-08-15 21:02 BRT.
- O radar editorial encontrou 13 temas recentes e priorizou todos os horarios do Cliente X.

## Proximos pontos provaveis

- Verificar visualmente o dashboard moderno.
- Testar upload de icone no painel publicado depois do deploy.
- Conferir se o radar editorial/Supabase esta alimentando os posts como esperado.
- Ajustar o SQL aberto em `cliente-x-instagram/supabase/instagram-posts.sql`, se esse for o proximo foco.
- Antes de qualquer deploy, confirmar explicitamente com o usuario.

## Cuidados importantes

- Preservar os 13 horarios de postagem.
- Nao tratar dry-run como prova de post real.
- O upload de imagens do painel tenta ImgBB primeiro; se o ImgBB retornar limite, o endpoint salva em `docs/uploads/dashboard/` via GitHub e devolve uma URL publica `raw.githubusercontent.com` para uso imediato.
- Para prova de publicacao real, exigir conta, permalink, horario e etapa exata.
- Bump de versao visivel deve atualizar `api/state.js` e `docs/dashboard.html` juntos quando houver mudanca aprovada para commit/deploy.
