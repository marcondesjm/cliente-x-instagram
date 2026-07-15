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

5. No GitHub Actions, rode primeiro com `dry_run=true`.

## Segurança

- Não comite `.env` com token real.
- Confirme que `expectedUsername` bate com a conta real antes de publicar.
- Use dry-run antes da publicação real.
