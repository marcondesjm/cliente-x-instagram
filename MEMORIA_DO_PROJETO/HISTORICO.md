# Historico

## 2026-08-16 14:10 BRT

Checkpoint funcional do Radar progressivo solicitado pelo usuario:

- O Radar pesquisa primeiro fontes oficiais dos ultimos `7 dias`.
- Sem pauta valida, amplia automaticamente a janela para `15 dias` e depois para `30 dias`.
- Se as pautas encontradas ja tiverem sido usadas, o publicador tambem amplia a janela para procurar uma pauta oficial nao repetida.
- O bloqueio permanece ativo quando nenhuma pauta oficial valida e nao repetida for encontrada nem em 30 dias; nao existe retorno para conteudo solto ou generico.
- A regra vale para publicacao automatica e para `Publicar agora`; o painel informa a sequencia `7, 15 e 30 dias` durante a busca.
- Validacoes aprovadas: sintaxe de `api/publish-now.js`, sintaxe do publicador, `npm run validate-copy` com `74` packs e protecao de duplicidade `ok`.
- Commit da mudanca: `b57aeda` (`Amplia janela do Radar ate 30 dias`); integracao final com o estado automatico: `e8c254c`.
- Deploy de producao: `dpl_4vorukSWwdxmLpc7eNe4R1wKXUXh`, alias `https://cliente-x-instagram.vercel.app`, confirmado com HTTP `200` e a nova mensagem presente.
- Este e o novo checkpoint do Radar e deve ser preservado nas proximas alteracoes.

## 2026-08-16 14:00 BRT

Checkpoint comercial solicitado pelo usuario:

- O selo principal do card de preco da landing foi alterado de `Oferta especial` para `Oferta relampago`.
- Permanecem preservados o preco anterior de `R$ 397/mes`, o valor promocional de `R$ 197/mes`, a condicao para novos clientes e os volumes anunciados.
- Arquivo alterado: `docs/plataforma.html`.
- Esta mudanca e o novo checkpoint visual da oferta e nao deve ser revertida sem pedido explicito.

## 2026-08-16 13:48 BRT

Novo checkpoint salvo a pedido do usuario depois das evolucoes do Direct e da oferta comercial.

Multiplas automacoes de Direct:

- O modelo deixou de aceitar somente um objeto `automation` e passou a aceitar ate `10` itens em `automations`, mantendo compatibilidade com a campanha antiga.
- A campanha existente dos 50 prompts foi preservada como primeira automacao; a API de producao confirmou `1` automacao carregada e conexao Meta ativa.
- Cada automacao pode ter nome, palavras-chave/tags, modo de correspondencia, publicacao opcional, material, mensagem privada, resposta publica e estado ativo independentes.
- O painel possui seletor de automacao, `+ Nova automacao/material`, remocao da selecionada e salvamento plural.
- O webhook procura a primeira automacao ativa cuja palavra-chave e publicacao correspondam ao comentario e envia somente o material associado.
- O historico registra `automationId` e `automationName`, permitindo saber qual campanha respondeu.
- Palavras-chave repetidas entre campanhas ativas sao bloqueadas para impedir respostas ambiguas.
- Versao visivel: `v4.96`.
- Commit: `8068264` (`Permite multiplas automacoes de Direct`).
- Deploy: `dpl_8ZuoN5iViqD61hU8yc6Xpo1jHoCR`.
- Validacoes: sintaxe de `api/state.js`, script inline do dashboard, `npm run validate-copy`, HTTP `200`, seletor/botoes entregues e migracao antiga preservada.
- Proximo teste operacional: cadastrar uma segunda automacao real com tag e material diferentes, salvar, comentar a tag em uma publicacao e confirmar o Direct e o registro no historico.

Landing e oferta comercial:

- Oferta alterada de `R$ 397/mes` para o valor promocional de `R$ 197/mes`, mantendo o valor anterior riscado e a implantacao gratuita.
- Volume comercial exibido: mais de `12` carrosseis no feed por dia e `12` Stories diarios.
- Hero, card do plano, FAQ e mensagem do WhatsApp foram sincronizados com a nova oferta.
- Commit da oferta: `d13e07a`; integracao com estado automatico do repositorio em `87e9188`.
- As capturas da plataforma foram reenquadradas para maior nitidez: hero em `4:3` com aproximadamente `657 x 493 px` e editor em `16:9` com aproximadamente `944 x 530 px`.
- Zoom e flutuacao continua foram removidos das imagens para evitar desfoque; brilho e revelacao permanecem nas molduras.
- Commit de nitidez: `7c3362f`.
- O card promocional recebeu selo, preco antigo, `R$ 197/mes` em destaque e etiquetas de volume/implantacao no commit `60ecf24`.
- Os beneficios foram encurtados e transformados em cartoes; depois passaram a ocupar toda a largura do hero, com quatro colunas no desktop e duas em telas menores (`6c22e96` e `3a3f30e`).
- A frase redundante `Voce economiza R$ 200 por mes` foi substituida por `Condicao especial para novos clientes` no commit `8b57824`.
- Deploy atual: `dpl_kbGZFCgmtv5CG12Z7aYpnsgk1zbq`, alias `https://cliente-x-instagram.vercel.app/plataforma`.
- Validacoes em producao: HTTP `200`, oferta e beneficios presentes, imagens sem transformacao continua, nenhum overflow horizontal e workspace limpo.

## 2026-08-16 13:03 BRT

Checkpoint geral aprovado pelo usuario com a confirmacao: `ate tudo funcionando grave na memoria tudo que foi feito`.

Este registro consolida como estado funcional que deve ser preservado:

- Projeto correto: `cliente-x-instagram-modern`, branch `feature/modern-editorial-system` sincronizada com `origin/main`.
- Dashboard em producao: `https://cliente-x-instagram.vercel.app/`, versao visivel `v4.95`.
- Landing comercial em producao: `https://cliente-x-instagram.vercel.app/plataforma`.
- Radar estrito: publicacao imediata, automatica, manual ou agendada com Radar ativo exige fonte oficial registrada em `research.sourceUrl`; sem pauta recente e nao repetida, bloquear sem publicar conteudo generico.
- Correcao do Radar: `7a68a40`, integrada ao fluxo operacional em `f989790`.
- Landing com oferta clara de `R$ 397/mes`, implantacao gratuita e publicacoes conforme o calendario contratado; a promessa antiga de `12 conteudos por dia` foi removida.
- Imagens da landing padronizadas em `f128503`, sem deformacao e sem overflow horizontal.
- Hero refinado em `62bca4e`: duas colunas, captura ao lado do texto, perspectiva, brilho, flutuacao e sinais de Radar/publicacao.
- Galeria animada em `6496736`: editor, Carrossel e Story com profundidade, brilho e movimentos internos, preservando `prefers-reduced-motion`.
- Pagina Bio atualizada em `6ca72ab`: dois controles `+ Adicionar novo botao`, campo inferior destacado, criacao de ate 10 botoes, rolagem e foco automaticos, upload de icone, previa, remocao, destaque principal e salvamento preservados.
- Deploy atual do dashboard/Pagina Bio: `dpl_DtMP5Ck78euCZ7ibCYkww1bwaGDY`.
- Deploy atual registrado da landing animada: `dpl_8z3sE3dBibautQnFJSTkidTSJwf8`; o alias publico permaneceu o mesmo nos deploys seguintes.
- Validacoes acumuladas: sintaxe, `npm run validate-copy`, `npm run render-only`, HTTP `200`, imagens carregadas e ausencia de overflow horizontal.
- Automacao continua executando na nuvem por GitHub Actions, Vercel e Meta; o computador pode permanecer desligado.

Regra de preservacao:

- Este e um checkpoint funcional aprovado. Nao reverter Radar, CTA dos 50 prompts, hashtags, rotacao de fotos, protecoes de contraste/sobreposicao, landing, animacoes ou Pagina Bio sem pedido explicito do usuario.
- Nao conectar Vercel ao Git nem alterar dominios sem autorizacao explicita.
- Em futuras publicacoes, continuar exigindo permalink e registro tecnico como prova; um run verde isolado nao comprova postagem real.

## 2026-08-16 13:01 BRT

Checkpoint da criacao de novos botoes na Pagina Bio salvo a pedido do usuario.

Alteracao:

- O controle pequeno do cabecalho foi renomeado para `+ Adicionar novo botao`.
- Foi criado um segundo campo destacado logo abaixo do ultimo botao cadastrado, evitando que o usuario precise voltar ao topo depois de editar o Botao 4 ou seguintes.
- O campo explica que o novo destino pode ter icone, titulo, descricao e link.
- Ao adicionar, o painel cria o proximo cartao, rola suavemente ate ele, posiciona o cursor no campo Titulo e mostra confirmacao visivel antes de salvar.
- A interface impede adicionar mais de `10` botoes e informa o limite; o limite corresponde ao normalizador da API.
- No celular, o campo e o botao passam para uma coluna e o botao ocupa toda a largura.
- Os dois controles usam a mesma funcao `addBioLink()`, preservando remover, escolher botao principal, upload de icone, previa e salvamento existentes.

Versao e validacao:

- Versao visivel atualizada de `v4.94` para `v4.95` em `api/state.js` e `docs/dashboard.html`.
- `npm run validate-copy`: passou.
- `node --check api/state.js`: passou.
- Producao respondeu HTTP `200` e continha `v4.95`, `Criar mais um botao`, `addBioLinkBottom` e a mensagem de limite.
- Commit publicado: `6ca72ab` (`Adiciona novo botao na pagina Bio`).
- Deploy Vercel: `dpl_DtMP5Ck78euCZ7ibCYkww1bwaGDY`, alias preservado em `https://cliente-x-instagram.vercel.app/`.

## 2026-08-16 12:53 BRT

Checkpoint das animacoes refinadas da landing salvo a pedido do usuario.

Hero:

- O topo voltou a usar duas colunas em desktop, com texto a esquerda e a captura real da plataforma a direita, eliminando o grande espaco vazio lateral e a imagem solta abaixo.
- A captura recebeu moldura com profundidade, perspectiva, sombra, brilho atravessando a tela e movimento flutuante suave.
- Foram adicionados os indicadores animados `Radar editorial ativo` e `Publicacao confirmada pela Meta` para equilibrar a composicao vertical sem deformar a imagem.
- O bloco visual do hero foi validado com aproximadamente `624 x 520 px` em viewport desktop de `1920 px`.
- Commit: `62bca4e` (`Refina hero e animacoes da landing`).
- Deploy: `dpl_CdiNXNni2iFwRsrFVKXcRscP8y7r`.

Galeria do produto:

- O editor, o Carrossel e o Story receberam o mesmo acabamento visual do hero: molduras com profundidade, brilho de entrada, movimento interno suave e revelacao escalonada durante a rolagem.
- O editor usa animacao `editor-breathe` e o selo `Editor conectado a marca`.
- Carrossel e Story usam `creative-float` em ritmos alternados e os selos `Criativo pronto - Feed 4:5` e `Criativo pronto - Story 9:16`.
- Os formatos originais foram preservados; os dois criativos continuam dentro de molduras de mesma altura, sem distorcao.
- A pagina respeita `prefers-reduced-motion`, desativando os movimentos para usuarios que solicitam animacao reduzida.
- Validacao visual local e em producao: animacoes ativadas ao rolar, imagens carregadas, nenhum overflow horizontal.
- Commit publicado: `6496736` (`Anima galeria de produto da landing`).
- Deploy atual: `dpl_8z3sE3dBibautQnFJSTkidTSJwf8`, em `https://cliente-x-instagram.vercel.app/plataforma`.

## 2026-08-16 12:46 BRT

Checkpoint salvo a pedido do usuario depois da correcao do Radar e da padronizacao visual da landing.

Radar automatico:

- O post `https://www.instagram.com/p/DcGzElaoLRl/` foi rastreado ate o slot automatico 4, GitHub Actions run `31956024126`, publicado em 2026-08-16 12:35 BRT.
- O registro tecnico desse post continha `research: null`: ele nao veio de uma pauta oficial do Radar.
- Causa encontrada: quando todas as pautas recentes do Radar eram consideradas repetidas, o publicador trocava silenciosamente para um pack automatico generico ou de emergencia.
- Correcao: com o Radar ativo, o fluxo nao usa mais fallback generico. Toda publicacao real precisa conter `pack.research.sourceUrl`; sem fonte oficial recente e nao repetida, o horario e bloqueado e nenhum post e enviado.
- A trava tambem impede que um pack manual ou agendado sem fonte oficial contorne o Radar.
- Commit da correcao: `7a68a40` (`Bloqueia fallback generico com Radar ativo`).
- Integracao que colocou a correcao no `origin/main`: `f989790`.
- Validacoes: `node --check`, `npm run validate-copy` e `npm run render-only` passaram; o Radar encontrou `13` pautas oficiais e o render usou `packIndex: news-11`.
- Nao foi disparada nova publicacao real como teste, para nao criar outro post indesejado. A proxima execucao automatica deve ser confirmada por permalink e por `research.sourceUrl` no historico.

Landing comercial:

- A primeira tela agora informa diretamente que a plataforma cria artes, carrosseis, Stories e legendas, agenda e publica com o computador desligado.
- Oferta exibida no hero: plataforma, configuracao e suporte por `R$ 397/mes`, com implantacao gratuita nesta oferta.
- A afirmacao de `12 conteudos por dia` foi removida. O texto correto e `Publicacoes diarias conforme o calendario contratado`.
- As duas capturas da plataforma foram padronizadas com largura visual de aproximadamente `980 px` e altura de aproximadamente `460 px` em desktop.
- Os exemplos de Carrossel e Story mantem suas proporcoes originais dentro de molduras com a mesma altura visual de `610 px`, sem esticar, recortar ou quebrar a responsividade.
- Validacao visual em producao: nenhuma imagem quebrada e nenhum overflow horizontal em viewport desktop de `1920 px`.
- Commit publicado: `f128503` (`Padroniza imagens da landing page`).
- Deploy Vercel de producao: `dpl_2FYeQrvb4Ccbx8qsrAsz15YCE8fu`, alias preservado em `https://cliente-x-instagram.vercel.app/plataforma`.

## 2026-08-16 12:32 BRT

Checkpoint da landing comercial da plataforma salvo a pedido do usuario.

Endereco publicado:

- `https://cliente-x-instagram.vercel.app/plataforma`
- A raiz `https://cliente-x-instagram.vercel.app/` continua sendo o dashboard; dominio e conexao Git/Vercel nao foram alterados.

Posicionamento comercial aprovado:

- Nome provisorio usado na pagina: `Nerion Social`; fazer consulta formal de marca antes do lancamento definitivo.
- Mensagem principal: rede social ativa, cuidada e sempre atualizada.
- A plataforma pesquisa pautas, cria o conteudo, produz criativos para carrossel e Story, escreve legendas, organiza a agenda e publica automaticamente na nuvem.
- O computador pode ficar desligado e o cliente nao precisa executar cada postagem manualmente depois da configuracao da marca, estrategia e regras.
- A comunicacao destaca que presenca constante aumenta oportunidades de engajamento e ajuda a atrair seguidores reais e alinhados, com potencial para interagir, pedir informacoes, comprar produtos ou contratar servicos.
- Nao prometer crescimento, curtidas, seguidores ou vendas garantidas; apresentar consistencia como aumento de oportunidades.

Oferta registrada:

- `Plano Completo`: `R$ 397/mes` para uma marca.
- Volume apresentado: ate `12 conteudos por dia`.
- Entrega descrita: carrossel no feed + Story correspondente, agenda automatica, Direct, perfil editorial, identidade visual e suporte.
- Implantacao de `R$ 297` aparece riscada com o selo `Implantacao gratis`.
- Para frequencia menor, a pagina direciona para consulta de um plano menor pelo WhatsApp.
- Licenca personalizada para agencias e operacoes estruturadas permanece sob medida.

Visual e experiencia:

- Landing responsiva em desktop e celular, sem rolagem horizontal.
- Direcao visual moderna e mais humana: tipografia contida, paleta neutra, cartoes retos, sombras discretas e menos elementos tipicos de template de IA.
- Capturas reais do dashboard e do editor foram adicionadas, com links para ampliar.
- Exemplos reais de carrossel e Story foram adicionados sem recorte; no celular aparecem empilhados em largura integral.
- Fotos comerciais da automacao foram geradas e salvas em `docs/uploads/automation-leave-office.jpg` e `docs/uploads/automation-cloud-evening.jpg`.
- Animacoes sutis: entrada do hero, revelacao por rolagem, atraso entre cartoes, zoom leve nas fotos e navegacao com profundidade apos scroll.
- `prefers-reduced-motion` desativa os movimentos para acessibilidade.

Validacoes:

- Todas as imagens da landing carregaram em producao com HTTP `200`.
- Layout validado sem overflow horizontal.
- Animacao validada com `40` elementos chegando ao estado visivel e sem erros no console.
- CTAs do WhatsApp, ancoras internas, oferta, FAQ e dashboard na raiz foram preservados.

Commits da landing:

- `e84e86d` - cria landing comercial da plataforma.
- `b8fb8fa` - define oferta piloto da landing.
- `f9e4004` - torna landing mais humana com telas reais.
- `207bda1` - corrige galeria responsiva.
- `a9851dc` - reduz preco do plano inicial.
- `0374aa7` - define plano completo com conteudo diario.
- `f534dd2` - ilustra automacao completa.
- `eebedfe` - oferece implantacao gratuita.
- `43c07c2` - refina o visual moderno.
- `68d94f9` - adiciona animacoes sutis.
- `c387903` - destaca criacao e publicacao automaticas.
- `897eb0a` - destaca presenca ativa e engajamento.
- `ecb94ec` - destaca seguidores reais e potenciais clientes.

Deploy/publicacao:

- Landing: publicada e confirmada em producao.
- Dashboard: preservado na raiz, ainda com checkpoint funcional `v4.94`.
- Instagram real: nenhuma nova postagem foi disparada durante a criacao da landing.

Proximo passo:

- Validar o nome comercial antes do lancamento definitivo e acompanhar conversas geradas pelos CTAs do WhatsApp.
- Se houver interesse comercial, preparar termos, politica de privacidade, contrato do plano e processo de onboarding.

## 2026-08-16 11:20 BRT

Checkpoint completo da versao `v4.94` salvo a pedido do usuario.

Resumo:

- A rotacao das fotos de Marcondes agora percorre as quatro imagens cadastradas antes de repetir; a pauta nao interfere mais na sequencia dos horarios.
- A foto do primeiro slide ganhou moldura padrao de `410 x 280`, recorte proporcional `cover` e protecao contra achatamento pelo corretor de sobreposicao.
- As capas deixaram de usar a composicao de canto que transformava a foto em um elemento pequeno; permanecem composicoes equilibradas em duas colunas.
- O Story usa somente a primeira ideia completa do texto do slide, mantendo a explicacao integral no carrossel e na legenda.
- Foi adicionada uma trava que rejeita o render do Story se texto e foto se sobrepuserem.
- CTA dos 50 prompts, hashtags finais, Radar com fontes oficiais, Direct e 13 horarios BRT foram preservados.

Commits preservados:

- `eaad1b1` - evita repeticao de fotos na rotacao.
- `0594843` - padroniza a foto da capa.
- `8ad4557` - evita texto sobre foto nos Stories.

Validado:

- `node --check automation/instagram-template/scripts/publish-carousel.mjs`: passou.
- `npm run validate-copy`: passou (`20` packs, `54` packs automaticos e `74` selecoes automaticas).
- `npm run render-only`: passou; Radar encontrou `13` temas recentes em fontes oficiais.
- Capa inspecionada: foto maior, proporcional e sem choque com titulo ou cartao de apoio.
- Story inspecionado: frase completa termina acima da foto, sem corte nem sobreposicao.
- Producao consultada em `/api/state`: versao `v4.94` confirmada.

Deploy/publicacao:

- Deploy: sim, Vercel Production `https://cliente-x-instagram.vercel.app` confirmado em `v4.94`.
- Instagram real: nenhuma publicacao foi disparada durante estas correcoes; elas valem para os proximos posts automaticos.

Proximo passo:

- Conferir o primeiro post automatico gerado em `v4.94`, exigindo permalink para confirmar o feed e verificando visualmente o Story publicado.

## 2026-08-16 01:25 BRT

Checkpoint da versao `v4.91` salvo antes de nova publicacao manual.

Resumo:

- O texto do bloco verde foi ampliado para leitura confortavel no celular.
- A arte agora usa uma frase de apoio curta e completa; o paragrafo continua na legenda, sem ser comprimido na imagem.
- O cartao conserva espaco, contraste e o indicador “Arraste para ver” livre.
- Validacoes aprovadas: `node --check`, `npm run validate-copy` e `npm run render-only`.
- Render inspecionado visualmente: fonte grande, sem corte e sem sobreposicao.
- Producao Vercel confirmada em `v4.91`; commit `8a17e72` no `origin/main`.

Deploy/publicacao:

- Deploy: sim, `https://cliente-x-instagram.vercel.app` confirmou a versao `v4.91`.
- Instagram real: uma nova publicacao sera disparada apos este registro, com comprovacao obrigatoria por permalink.

## 2026-08-16 01:11 BRT

Checkpoint da versao `v4.90` salvo antes de nova publicacao manual.

Resumo:

- O cartao de apoio `01` deixou de reduzir a fonte quando o texto e maior.
- A fonte do texto de fechamento agora segue escala fixa e legivel, equivalente ao cartao `02`.
- Quando necessario, o cartao cresce em altura; no layout dividido, ele e reposicionado para nao cobrir o indicador “Arraste para ver”.
- Validacoes aprovadas: `node --check`, `npm run validate-copy` e `npm run render-only`.
- Render inspecionado: texto legivel, foto fora do titulo e indicador de deslize livre.
- Producao Vercel confirmada em `v4.90`; commit `aa4b8d0` no `origin/main`.

Deploy/publicacao:

- Deploy: sim, `https://cliente-x-instagram.vercel.app` confirmou a versao `v4.90`.
- Instagram real: uma nova publicacao sera disparada apos este registro, com comprovacao obrigatoria por permalink.

## 2026-08-16 01:04 BRT

Checkpoint da versao `v4.89` aprovado pelo usuario.

Resumo:

- Usuario confirmou que o resultado esta muito bom e pediu para salvar este ponto.
- Preservar hashtags finais, cartoes de apoio maiores, capas variadas, CTA dos 50 prompts e linguagem humana/AIDA.
- Publicacao mais recente confirmada: `https://www.instagram.com/p/DcFjsXZHIil/`.
- Workflow correspondente: `31925600428`, concluido com `success`.
- Workspace limpo e repositorio sincronizado no momento do checkpoint.

## 2026-08-16 01:02 BRT

Publicacao manual do Radar concluida depois do registro da versao `v4.89`.

Comprovacao:

- GitHub Actions: `31925600428` finalizado com `success`.
- Carrossel confirmado visivel no perfil `@marcondes.machado.oficial`.
- Permalink: `https://www.instagram.com/p/DcFjsXZHIil/`.

Padrao aplicado:

- Pauta atual de fonte oficial, adaptada para empresas brasileiras.
- Legenda com CTA dos 50 prompts e hashtags ao final.
- Cartoes de texto com fonte maior e espaco proporcional ao conteudo.

Deploy/publicacao:

- Deploy: ja estava ativo em `v4.89`.
- Instagram real: sim, feed confirmado por permalink.

## 2026-08-16 00:58 BRT

Memoria atualizada antes de nova publicacao manual do Radar.

Resumo:

- Producao confirmada em `v4.89`, commit `d7f8122`.
- As legendas automaticas do Radar agora sempre terminam com hashtags.
- Os cartoes de texto ganharam fonte maior e altura proporcional, reduzindo o espaco vazio.
- Validacoes executadas: `node --check`, `npm run validate-copy` e `npm run render-only`, todas aprovadas.

Deploy/publicacao:

- Deploy: sim. Vercel confirmou a versao `v4.89` em producao.
- Instagram real: uma nova publicacao sera disparada apos este registro, com comprovacao por permalink.

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
