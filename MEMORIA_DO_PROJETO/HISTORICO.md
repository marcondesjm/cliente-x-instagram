# Historico

## 2026-08-15 22:24 BRT

Corrigida a sobreposicao de elemento decorativo sobre foto real nos carrosseis futuros.

Resumo:

- O gerador agora oculta o icone visual do nicho quando o slide ja possui foto de contexto.
- A pre-visualizacao do dashboard usa a mesma regra para corresponder a arte publicada.
- A correcao resolve o caso em que uma foto de balanca recebia outra balanca desenhada sobre ela.
- Versao visivel atualizada para `v4.73` em `api/state.js` e `docs/dashboard.html`.

Validado:

- `npm run validate-copy`: passou.
- `npm run render-only`: passou.
- Inspecao visual do slide renderizado: foto de contexto permanece limpa, sem icone duplicado.

Deploy/publicacao:

- Deploy: aguardando envio deste checkpoint.
- Instagram real: nao foi feita nova publicacao para esta correcao; ela vale para os proximos posts gerados.

## 2026-08-15 22:18 BRT

Checkpoint completo salvo a pedido do usuario.

Resumo:

- Dashboard de producao confirmado na versao `v4.72`.
- Radar editorial ativo com fontes oficiais configuradas para OpenAI, AWS Machine Learning, Microsoft Cloud, Google Cloud, Google DeepMind, Anthropic Claude, NVIDIA AI e n8n.
- O radar esta configurado para orientar as proximas pautas automaticas; a agenda preserva os 13 horarios em BRT.
- Foi criada e enviada uma noticia real da OpenAI no padrao atual de carrossel, sem salvar por cima do conteudo manual do editor.
- A legenda recebeu a fonte oficial e o bloco padrao de CTA dos 50 prompts gratuitos.

Publicacao confirmada:

- Conta: `@marcondes.machado.oficial`.
- Horario do disparo: 2026-08-15 22:15 BRT.
- GitHub Actions: run `#713`, concluido com `success` as 22:16 BRT.
- Formato enviado: feed + story, carrossel com 5 slides.
- Permalink confirmado no feed: `https://www.instagram.com/p/DcFQxaXICT-/`.
- Pauta: modo ultrarrapido da OpenAI para fluxos que exigem baixa latencia.
- Fonte oficial: `https://openai.com/index/previewing-ultrafast`.

Estado dos repositorios:

- `cliente-x-instagram-modern`: branch `feature/modern-editorial-system`, commit `5bbbfcb`, workspace limpo.
- Fluxo operacional de publicacao: `cliente-x-instagram`, branch `main`, commit `9449559`, workspace limpo.
- Esta memoria fica no projeto moderno, mas registra explicitamente quando uma operacao foi executada pelo repositorio operacional para impedir confusao na retomada.

Deploy/publicacao:

- Deploy: dashboard de producao confirmado em `v4.72`.
- Instagram real: sim, permalink confirmado.

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
