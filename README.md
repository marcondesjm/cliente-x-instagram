# Cliente X Instagram Automation

Projeto separado para automatizar posts de feed/carrossel da conta Cliente X.

## Primeiros passos

1. Ajuste `automation/instagram-template/config/accounts.json` com o `expectedUsername` real.
2. Ajuste os packs em `automation/instagram-template/config/content-packs.json`.
3. Configure secrets no GitHub Actions:
   - `CLIENTE_X_INSTAGRAM_ACCESS_TOKEN`
   - `CLIENTE_X_INSTAGRAM_USER_ID`
   - `IMGBB_API_KEY`
4. Rode localmente:

```powershell
npm install
npm run validate-copy
npm run render-only
```

5. No GitHub Actions, rode primeiro manualmente com `dry_run=true`.
6. O workflow `.github/workflows/instagram-feed-cliente-x.yml` fica agendado para publicar às 11:50, 13:00, 16:00, 19:00 e 22:00 no horário de Brasília. Esse agendamento roda no GitHub Actions e não depende do PC ligado.

## Segurança

- Não comite `.env` com token real.
- Confirme que `expectedUsername` bate com a conta real antes de publicar.
- Use dry-run antes da publicação real.
- Para o agendamento funcionar com o PC desligado, o repositório precisa estar no GitHub com Actions habilitado e com os secrets `CLIENTE_X_INSTAGRAM_ACCESS_TOKEN`, `CLIENTE_X_INSTAGRAM_USER_ID` e `IMGBB_API_KEY` configurados.
