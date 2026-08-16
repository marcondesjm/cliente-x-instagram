# Historico

## 2026-08-15 21:05 BRT

Corrigido o erro de upload de icone quando o ImgBB retorna `Rate limit reached`.

Resumo:

- `api/upload-image.js` agora tenta ImgBB primeiro.
- Se o ImgBB bater limite, o endpoint salva a imagem no GitHub em `docs/uploads/dashboard/`.
- O retorno inclui `imageUrl` publica do `raw.githubusercontent.com`, para o painel usar a imagem imediatamente sem depender de outro deploy para servir o arquivo novo.
- O painel continua recebendo `imagePath` e consegue preencher o campo do icone.
- Versao visivel atualizada para `v4.60` em `api/state.js` e `docs/dashboard.html`.

Validado:

- `node --check api\upload-image.js` passou.
- `npm run validate-copy` passou.

Pendente:

- Testar o upload do icone no painel publicado depois de deploy.
- Fazer commit/deploy somente com confirmacao do usuario.

Deploy/publicacao:

- Deploy: nao
- Instagram real: nao

## 2026-08-15 21:03 BRT

Criada a pasta `MEMORIA_DO_PROJETO` para manter uma memoria portavel do projeto.

Estado registrado:

- Projeto ativo: `cliente-x-instagram-modern`
- Branch: `feature/modern-editorial-system`
- Commit: `39d2d13`
- Dashboard: `v4.59`
- Workspace limpo
- `npm run validate-copy` passou
- `npm run dry-run` passou
- Nenhum deploy feito
- Nenhuma publicacao real feita

Observacao: o projeto original `cliente-x-instagram` tambem esta presente no workspace e contem o arquivo aberto `supabase/instagram-posts.sql`.
