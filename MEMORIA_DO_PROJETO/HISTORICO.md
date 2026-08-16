# Historico

## 2026-08-15 22:45 BRT

Corrigida a ordem das hashtags nas legendas automaticas.

Resumo:

- O bloco padrao dos 50 prompts estava removendo hashtags ao ser reposicionado no fim da legenda.
- As hashtags agora sao preservadas e aparecem depois do CTA, no final real do texto.
- A regra vale para pautas do Radar e demais posts que passam pelo aprimoramento automatico de legenda.

Validado:

- `npm run validate-copy`: passou.
- `npm run render-only`: passou.
- Legenda renderizada confirmou as hashtags `#automacao #inteligenciaartificial #gestao #processos #negocios #produtividade` apos o bloco dos 50 prompts.

Deploy/publicacao:

- Deploy: sim. Producao Vercel confirmada com versao `v4.77`.
- Instagram real: nao foi enviada nova postagem; a correcao vale para os proximos posts automaticos.

## 2026-08-15 22:40 BRT

Atualizado o visual das noticias do Radar para representar a propria fonte da pauta.

Resumo:

- Quando a pauta vier de uma fonte oficial, o carrossel mostra um cartao visual com o nome da fonte, em vez de foto generica de setor.
- Exemplo validado: `OpenAI · Fonte oficial · Atualização que pode virar ganho operacional`.
- O titulo principal continua focado na dor empresarial; a fonte funciona como prova e contexto visual da noticia.
- A mesma regra foi aplicada ao feed, story e pre-visualizacao do dashboard.

Validado:

- `npm run validate-copy`: passou.
- `npm run render-only`: passou.
- Inspecao visual do render confirmou que o cartao OpenAI substitui a balanca juridica.

Deploy/publicacao:

- Deploy: sim. Producao Vercel confirmada com versao `v4.76`.
- Instagram real: nao foi enviada nova postagem; o visual vale para os proximos posts automaticos.

## 2026-08-15 22:35 BRT

Corrigida a selecao de imagens de contexto por nicho da conta.

Resumo:

- A conta de IA e automacao empresarial nao pode mais receber imagem juridica apenas porque o texto cita `processo` ou `contrato`.
- A imagem agora e escolhida primeiro pelo nicho configurado; o Cliente X usa visual de operacao e analise de processo.
- Contas juridicas, de turismo, imobiliarias, clinicas, restaurantes, estetica, educacao e e-commerce continuam recebendo visuais especificos de seus nichos.
- A pre-visualizacao do dashboard recebeu a mesma regra do publicador.

Validado:

- `npm run validate-copy`: passou.
- `npm run render-only`: passou.
- Render do Cliente X confirmado sem a foto da balanca juridica.

Deploy/publicacao:

- Deploy: sim. Producao Vercel confirmada com versao `v4.75`.
- Instagram real: nao foi enviada nova postagem; a correcao vale para os proximos posts automaticos.

## 2026-08-15 22:30 BRT

Redirecionado o Radar editorial para atrair empresas interessadas em automacao.

Resumo:

- As fontes oficiais permanecem como base de credibilidade, mas o titulo nao abre mais com a novidade de uma plataforma.
- O carrossel agora abre com dor de negocio, mostra o custo do processo manual, apresenta aplicacao pratica de automacao e termina convidando para diagnostico no Direct.
- O objetivo editorial da conta `cliente-x` foi alterado de `Autoridade` para `Captação de leads`.
- Foram criadas abordagens para atendimento, comercial, agentes, dados, fluxos, governanca e produtividade.
- A legenda relaciona a fonte oficial ao problema empresarial e mantem o CTA padrao dos 50 prompts no final.

Exemplo validado:

- Abertura: `Seu atendimento ainda começa do zero a cada conversa?`
- Foco: historico, prioridade e proximo passo visiveis para reduzir resposta lenta e repeticao do cliente.
- Fonte usada somente como contexto, nao como manchete do post.

Validado:

- `npm run validate-copy`: passou.
- `npm run render-only`: passou.
- Inspecao visual confirmou o novo gancho empresarial no slide de abertura.

Deploy/publicacao:

- Deploy: sim. Producao Vercel confirmada com versao `v4.74`.
- Instagram real: nenhuma nova postagem foi enviada nesta alteracao; a regra vale para os proximos posts automaticos.

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

- Deploy: sim. Producao Vercel confirmada em `https://cliente-x-instagram.vercel.app/` com versao `v4.73`.
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
