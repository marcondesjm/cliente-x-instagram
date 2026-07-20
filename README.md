# Cliente X Instagram Automation

Projeto separado para automatizar posts de feed/carrossel da conta Cliente X.

## Primeiros passos

1. Ajuste `automation/instagram-template/config/accounts.json` com o `expectedUsername` real.
2. Ajuste os packs em `automation/instagram-template/config/content-packs.json`.
3. Configure secrets no GitHub Actions:
   - `CLIENTE_X_INSTAGRAM_ACCESS_TOKEN`
   - `CLIENTE_X_INSTAGRAM_USER_ID`
   - `IMGBB_API_KEY`
   - `SUPABASE_URL` (opcional, se quiser puxar posts do Supabase)
   - `SUPABASE_SERVICE_ROLE_KEY` (opcional, se quiser puxar posts do Supabase)
4. Rode localmente:

```powershell
npm install
npm run validate-copy
npm run render-only
npm run dashboard
```

5. No GitHub Actions, rode primeiro manualmente com `dry_run=true`.
6. O workflow `.github/workflows/instagram-feed-cliente-x.yml` fica agendado para publicar às 6:30, 8:10, 9:00, 11:50, 12:10, 13:00, 13:50, 14:15, 14:50, 16:00, 17:40, 19:00 e 22:00 no horário de Brasília. Esse agendamento roda no GitHub Actions e não depende do PC ligado.

## Dashboard local

Rode `npm run dashboard` e abra `http://localhost:4173`.

O painel permite acompanhar próximos horários, últimos runs do GitHub Actions, editar manualmente horários, banners/slides e legendas, salvar em `content-packs.json`, atualizar `accounts.json`/workflow/README, validar textos e renderizar prévias.

## Segurança

- Não comite `.env` com token real.
- Confirme que `expectedUsername` bate com a conta real antes de publicar.
- Use dry-run antes da publicação real.
- No Windows, os scripts `npm run ...` carregam os certificados do sistema antes de chamar a automação.
- A automação pula packs cuja legenda já apareceu nas últimas publicações do perfil para evitar repetição.
- Para o agendamento funcionar com o PC desligado, o repositório precisa estar no GitHub com Actions habilitado e com os secrets `CLIENTE_X_INSTAGRAM_ACCESS_TOKEN`, `CLIENTE_X_INSTAGRAM_USER_ID` e `IMGBB_API_KEY` configurados.
