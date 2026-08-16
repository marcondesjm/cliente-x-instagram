# Historico

## 2026-08-16 00:51 BRT

Checkpoint completo aprovado pelo usuario.

Resumo:

- Usuario confirmou que o estado atual esta bom e pediu para salvar tudo ate este ponto.
- Produção preservada em `v4.87`; codigo de capas distintas em `55fe44b`.
- Registro operacional, prova da publicacao e imagens hospedadas consolidados no commit `d13b723`.
- Workspace limpo e `origin/main` sincronizado no momento do checkpoint.

Itens que devem ser preservados na retomada:

- Radar com fontes oficiais recentes e linguagem simples para empresas brasileiras.
- Estrutura humana/AIDA, CTA fixo dos 50 prompts e hashtags finais.
- Capas com paleta, composicao, titulo e cenarios de foto variados.
- Publicacao comprovada apenas por workflow concluido e permalink do Instagram.

## 2026-08-16 00:40 BRT

Correcao de repeticao visual das capas do Radar concluida.

Resumo:

- A pauta agora influencia paleta, composicao, titulo e escolha de foto da capa.
- Foram removidas da rotacao tres fotos muito parecidas, todas com notebook e fundo escuro.
- As proximas capas usam somente cenarios diferentes: escritorio, reuniao, apresentacao e ambiente descontraido.
- O texto de abertura tambem recebe variacao para evitar capas com a mesma manchete.
- Versao visivel atualizada para `v4.87`.

Validado:

- `npm run validate-copy`: passou (`20` packs, `54` packs automaticos e `74` selecoes automaticas).
- Dois renders do Radar com fontes diferentes foram inspecionados visualmente e mostraram foto, composicao, cor e titulo distintos.

Deploy/publicacao:

- Deploy: sim. Producao Vercel confirmada em `https://cliente-x-instagram.vercel.app` na versao `v4.87`.
- Instagram real: a proxima publicacao manual sera disparada apos este registro, com confirmacao obrigatoria por permalink.

## 2026-08-16 00:46 BRT

Publicacao manual pelo Radar concluida apos o registro da memoria.

Resumo:

- O painel autenticado disparou a publicacao imediata usando somente pauta recente do Radar.
- O workflow usou a configuracao visual `v4.87`, com fotos de cenarios distintos na rotacao de capas.
- A pauta publicada foi adaptada para empresas, com fonte oficial n8n.

Comprovacao:

- GitHub Actions: `31924984201` finalizado com `success`.
- Carrossel confirmado visivel no perfil `@marcondes.machado.oficial`.
- Permalink: `https://www.instagram.com/p/DcFh6FWG8f0/`.

Deploy/publicacao:

- Deploy: ja estava ativo em `v4.87`.
- Instagram real: sim, feed confirmado por permalink.

## 2026-08-16 00:21 BRT

Checkpoint editorial e operacional atualizado a pedido do usuario.

Resumo:

- Versao de producao confirmada: `v4.84`.
- Branch: `feature/modern-editorial-system`.
- Commit: `1d99471` (`Build trust-led human radar storytelling`), tambem presente em `origin/main`.
- O Radar passou a aceitar apenas noticias oficiais dos ultimos 7 dias para `Publicar agora`; se nao houver pauta elegivel, bloqueia o envio em vez de usar conteudo manual ou generico.
- Titulos tecnicos e em ingles das fontes nao devem aparecer na comunicacao ao publico. As noticias sao explicadas em portugues brasileiro simples.
- O novo padrao de comunicacao e: conexao humana, clareza do problema, confianca no caminho e convite natural para conversar.
- A linguagem deve falar de pessoas, clientes, rotina, equipe e resultado. IA e automacao entram como meio, nao como assunto principal.
- A fonte oficial continua sendo registrada, mas de forma curta, sem repetir o titulo original na arte.
- O CTA fixo dos 50 prompts, hashtags finais, Direct e os 13 horarios BRT foram preservados.

Validado:

- `node --check lib/editorial-research.js`: passou.
- `npm run validate-copy`: passou.
- `npm run render-only`: passou; Radar encontrou 13 temas recentes em fontes oficiais.
- Inspecao visual do render confirmou a abertura humana e a leitura legivel do carrossel.
- Dashboard publico confirmado em `https://cliente-x-instagram.vercel.app` com versao `v4.84`.

Deploy/publicacao:

- Deploy: sim, Vercel Production confirmado na versao `v4.84`.
- Instagram real mais recente: `https://www.instagram.com/p/DcFdj-ZjQef/`, GitHub Actions run `31923469806` concluido com `success` em 2026-08-16 00:08 BRT.
- Observacao: a postagem real foi publicada antes do refinamento final de tom humano; a regra vale para os proximos posts.

## 2026-08-15 23:15 BRT

Corrigido o fluxo de publicacao imediata para usar somente o Radar de noticias oficiais de IA do dia.

- Problema encontrado: `Publicar agora` enviava o pack manual aberto no editor, mesmo quando o dashboard mostrava pautas do Radar.
- Correcao: `api/publish-now.js` agora busca uma pauta oficial atual, adapta o conteudo para empresas e a envia como `pack_json` ao publicador.
- Regra de seguranca: sem noticia oficial elegivel no mesmo dia, a publicacao falha de forma explicita e nada e enviado ao Instagram.
- A conta `cliente-x` passou a ter Radar ativo com periodo `Somente hoje`.
- Painel e producao atualizados para `v4.78`.
- Commit publicado: `4e0b3f2`.


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
