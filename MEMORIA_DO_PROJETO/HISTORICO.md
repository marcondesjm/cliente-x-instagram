# Historico

## 2026-08-29 11:44 BRT

- Investigado o novo alerta do vigia no slot 1 (`2026-08-29T11:10:00.000Z`): os runs `33257564135`, `33257565661` e `33257949631` bloquearam corretamente porque o Radar nao encontrou pauta oficial inedita em 30 dias.
- O run de recuperacao manual `33258039686` terminou verde e publicou de fato o carrossel/Story: `https://www.instagram.com/p/DcoKxn_jZ2t/`, media ID `17963739330178902`, Story ID `18108159037891082`, publicado as `2026-08-29T14:37:52.907Z`. A pauta foi editorial propria, sem fonte Radar, porque o Radar havia esgotado fontes ineditas.
- Causa do alerta persistente: o workflow `workflow_dispatch` publicava e resolvia o erro, mas pulava `Mark automatic slot published`; por isso `published-slots.json` nao recebia o slot 1 e o painel podia continuar enxergando o horario como pendente.
- `17fea06` adiciona `scripts/resolve-slot-metadata.mjs`, preenche data/horario do slot em recuperacoes manuais, marca o slot publicado quando `dry_run=false` e melhora a solucao do vigia para Radar esgotado: buscar pauta oficial/ampliar fontes, nao renovar token.
- Estado local atualizado: `published-slots.json` recebeu `cliente-x`, data `2026-08-29`, slot `1`, workflow `33258039686`.
- Validacoes locais: `node --check scripts/resolve-slot-metadata.mjs`, `node --check scripts/record-watchdog-status.mjs`, `node scripts/resolve-slot-metadata.mjs --slot-index 1 --date 2026-08-29` e `npm run validate-copy` passaram.
- Deploy/publicacao: nenhuma nova publicacao foi disparada nesta correcao. A publicacao real citada ja havia ocorrido no run `33258039686`. Pendente autorizacao explicita para push/deploy.

## 2026-08-29 11:35 BRT

- Implementado o botao `PROMPT -- METODO IHC DA HANAH` no painel da conta ativa. A chave fica salva em `contentProfile.storyMethod.ihcHanahEnabled` e permanece desligada por padrao em `cliente-x`.
- Quando ativado no painel, apenas publicacoes automaticas/Radar passam pelo metodo IHC: Reels sao reestruturados em exatamente 9 takes e carrosseis em exatamente 10 cards, sempre no fluxo Identificacao -> Historia -> Conteudo. Packs manuais ou agendados explicitamente pelo painel nao sao reescritos.
- O publicador preserva fonte oficial, titulo original e link HTTPS na legenda quando o Radar fornece pesquisa, alem de registrar o metodo em `engagement-intelligence.json` e `daily-pack.json` da execucao.
- Commit funcional local: `741f7f7` (`Adiciona modo IHC da Hanah no painel`).
- Validacoes locais: `node --check automation/instagram-template/scripts/publish-carousel.mjs`, `node --check api/state.js`, `node --check scripts/dashboard-server.mjs` e `npm run validate-copy` passaram. A validacao conferiu 20 packs, 54 auto packs e 74 combinacoes automaticas.
- Deploy/publicacao: nao houve push, deploy Vercel ou publicacao Instagram nesta alteracao. Pendente autorizacao explicita para enviar ao remoto/producao.

## 2026-08-29 11:22 BRT

- Investigado o relato de parada das publicacoes automaticas. O run agendado `33245349884` terminou verde as 06:23 BRT, mas nao deixou artefato de publicacao; o vigia `33254423905` tentou recuperar o slot 0 de 06:30 BRT e falhou as 10:13 BRT em `Graph POST /17841404470203300/media`.
- Causa real: a Meta recusou a criacao da midia com OAuthException `36004`, `The caption was too long`. Nenhum feed/Reel foi criado nessa tentativa.
- A recuperacao automatica disparada por `b814d03` concluiu com sucesso no run `33257167618` as 11:20 BRT. Publicacao real: `https://www.instagram.com/reel/DcoIsXRglsx/`, media ID `18113312665991179`, Story ID `18048933059597084`, fonte `G1 Tecnologia`, pauta sobre os cinco profissionais de tecnologia mais disputados pelos bancos e investimento de R$ 3 bilhoes em IA.
- O erro aberto `cliente-x:2026-08-29:0:33254423905` foi marcado como resolvido pelo run `33257167618`; estado remoto salvo em `4717510`, Reel hospedado em `c4dfc5d` e Story em `0b3b52b`.
- `dbf7d42` adiciona limite seguro de legenda antes da chamada a Meta: o publicador reduz a legenda por blocos, preserva titulo original, link HTTPS da fonte, CTA do material e hashtags, e bloqueia qualquer legenda final acima do limite seguro.
- A heuristica do vigia tambem foi corrigida para erros `Caption Too Long` / `36004`: a solucao exibida agora orienta reduzir a legenda final, em vez de renovar token Meta.
- Validacoes locais: `node --check automation/instagram-template/scripts/publish-carousel.mjs` passou; `npm run validate-copy` passou com 20 packs, 54 auto packs e 74 combinacoes automaticas.
- Deploy: nao houve deploy Vercel nesta correcao. Instagram real: sim, via run `33257167618`.

## 2026-08-29 01:20 BRT

- O botao `Publicar agora` foi acionado em `reel-and-story`, mas bloqueou corretamente antes da Meta porque as pautas elegiveis que o Radar havia carregado ja estavam no historico.
- Selecionada uma pauta oficial inedita do `TecMundo`: `OpenAI, Anthropic e mais de 100 empresas pedem mais seguranca contra IAs`, publicada em 28/08/2026, com imagem principal extraida da propria materia.
- O pack foi revisado para apresentar tres fatos completos, sem legenda de fotografia, reticencias ou frases cortadas. Os slides tambem usam titulos completos e a legenda separa claramente noticia e leitura editorial.
- Publicacao real concluida no run `33233488693`: `https://www.instagram.com/reel/DcnEFDpDxFY/`, media ID `17954855115207895` e Story ID `18120976189894058`. Reel hospedado em `ba47034`, imagens em `cd66f59` e estado salvo em `094552b`.
- O primeiro comentario falhou com OAuthException codigo 10 por permissao da Meta; Reel e Story foram publicados normalmente e nao houve tentativa duplicada.

## 2026-08-29 01:08 BRT

- Corrigida a falha apontada na legenda do Reel `DcnBvEVgJwC`: o Radar havia tratado a legenda da fotografia e um resumo RSS truncado como conteúdo factual.
- `246118b` identifica e descarta descricoes/creditos de imagem e rejeita fatos terminados em reticencias. Resumos longos agora sao reduzidos somente em limites de frases completas, nunca pelo corte de caracteres.
- Prova direta na mesma materia do G1: a extracao removeu `O logotipo da OpenAI... Foto: AP/Michael Dwyer` e retornou fatos completos sobre a operacao brasileira, 215 milhoes de mensagens por dia e a declaracao de Sam Altman.
- Validacoes: sintaxe dos dois modulos e 74 combinacoes editoriais passaram, incluindo novas travas contra legenda de foto e texto incompleto.
- Producao atualizada para `v5.45`: deploy `dpl_AUiS7MQQeVbF8LibeKH4uuVUBbU3`, estado `READY`; dominio principal confirmou HTTP 200 e HTML `v5.45`.
- A publicacao ja existente nao foi apagada nem republicada sem pedido expresso; a protecao vale para todas as proximas pautas.

## 2026-08-29 01:02 BRT

- O disparo direto do painel foi bloqueado com seguranca por falta de pauta oficial inedita. Os runs `33232219924` e `33232348272` nao criaram midia; o segundo confirmou a protecao contra repeticao.
- Selecionada a pauta nova `OpenAI abre operacao no Brasil apos pais se tornar 3 maior mercado do ChatGPT`, do `G1 Tecnologia`, com artigo de 27/08/2026 e imagem editorial retirada da propria materia.
- `c4dcca3` corrige o falso positivo da validacao de acentos em slugs de URL. As 74 combinacoes passaram e o render completo `2026-08-29-005525-slot-0-render-only` gerou Reel e Story com a imagem oficial e trilha `beethoven-02-vivace`.
- Publicacao real concluida no run `33232626886`: `https://www.instagram.com/reel/DcnBvEVgJwC/`, media ID `18147166390538141` e Story ID `18047383550657974`. Video hospedado em `c527763`, imagens em `a002cad` e estado salvo em `76fdfed`.
- O Reel e o Story foram publicados normalmente. Somente o primeiro comentario falhou com OAuthException codigo 10 por permissao da Meta; nenhuma republicacao foi feita.
- Producao atualizada para `v5.44`: deploy `dpl_27HjdpRdpkcs4y9Hf91i4vUScXj8`, estado `READY`; dominio principal confirmou HTTP 200 e HTML `v5.44`.

## 2026-08-29 00:29 BRT

- `96f55fe` ampliou o Radar para preservar todas as 14 fontes oficiais configuradas e usar, quando valida, a imagem principal da propria materia nos carrosseis, Stories e Reels.
- A extracao reconhece imagens de RSS, `og:image`, Twitter Card e metadados estruturados. O download exige HTTPS, formato de imagem aceito e tamanho seguro; logos, SVGs, pixels, HTML, arquivos pequenos e respostas invalidas acionam o acervo visual de reserva.
- Prova externa: uma materia do Olhar Digital entregou `roman-space-telescope.webp` com HTTP 200 e `image/webp`. A pagina da OpenAI sem imagem valida foi corretamente encaminhada ao fallback.
- Prova completa sem publicar no Instagram: o render `2026-08-29-002617-slot-0-render-only` encontrou 29 pautas oficiais em 30 dias, selecionou uma materia do `G1 Tecnologia`, baixou a imagem real em AVIF e gerou cinco slides, Story e Reel com a fonte identificada e o link integral preservado.
- Validacoes: sintaxe, 74 combinacoes editoriais, 14 fontes do Radar, extracao HTTPS, rejeicao de logo/SVG e inspecao visual da capa e do Story passaram.
- Producao atualizada para `v5.43`: deploy `dpl_9sz6ZQT84XpF82jwDD87Bx2GdMHD`, estado `READY`; API e HTML publicos confirmaram a versao, status `funcionando`, 14 fontes e zero erros abertos.

## 2026-08-29 00:12 BRT

- Identificada a imagem repetitiva enviada pelo usuario como `docs/uploads/sector-photos/ecommerce.jpg`, com cartao, caixas e notebook.
- `a6b15aa` removeu essa imagem dos rodizios genericos `business` e `services`; ela permanece apenas em pautas realmente classificadas como ecommerce.
- Adicionada validacao que percorre 16 escolhas visuais de Reels empresariais e falha se `ecommerce.jpg` reaparecer fora do setor correto. As 74 combinacoes editoriais passaram.
- Render `2026-08-29-000937-slot-0-render-only` confirmou imagens distintas: `automation-leave-office.jpg` na capa e `automation-cloud-evening.jpg` no slide 4, sem a foto reclamada.
- Producao atualizada para `v5.42`: deploy `dpl_HyJ69naNUPvv8o1gfWTjHs7LnnZq`, estado `READY`; API e HTML publicos confirmaram a versao, status `funcionando` e zero erros abertos.

## 2026-08-29 00:04 BRT

- Investigado o erro aberto do slot 2 no run `33229661388`: o Radar esgotou pautas oficiais ineditas em 30 dias e bloqueou corretamente antes da Meta.
- A primeira recuperacao automatica `33229776330` tambem foi bloqueada porque o pack editorial fixo ja constava no historico. `9124d9a` tornou cada recuperacao unica pela edicao operacional, preservando a protecao contra repeticao.
- Producao atualizada para `v5.41`: deploy `dpl_D93XBtCR18D7oQq8GF6hPvfS4Yuy`, estado `READY`.
- Recuperacao real concluida no run `33230259514`: `https://www.instagram.com/reel/Dcm7Cs4kein/`, media ID `18112965037992789`, Story ID `17880179550688046`, trilha `beethoven-05-destino`. O erro foi marcado como resolvido pelo mesmo run.
- O run redundante `33230269009` foi cancelado com autorizacao do usuario. O artefato nao possui `result.json`: houve apenas render/hospedagem, sem segunda midia publicada na Meta.
- API publica confirmou `v5.41`, status `funcionando` e zero erros abertos.

## 2026-08-28 23:54 BRT

- Corrigida a agenda visual, que continuava rotulando todos os slots como `feed + story` mesmo com Reels automaticos operacionais.
- `4b1e85f` faz o plano diario consultar `reelScheduleSlots` tanto no publicador quanto na API e no fallback local do dashboard.
- Validacoes: sintaxe, 74 combinacoes editoriais e plano completo passaram. O plano confirmou oito `reel + story` em 06:30, 09:00, 12:10, 13:50, 14:15, 16:00, 17:40 e 22:00; os cinco slots restantes continuam `feed + story`.
- Producao `v5.40`: deploy `dpl_4R7dGvdoKtTZWgN9tA5MVQwebL4U`, estado `READY`. API publica confirmou HTTP 200, status `funcionando`, oito Reels e cinco carrosseis.

## 2026-08-28 23:46 BRT

- Corrigida a causa que mantinha o painel em `v5.37`: o Node/Vercel CLI nao usava os certificados confiaveis do Windows e encerrava HTTPS com `UNABLE_TO_VERIFY_LEAF_SIGNATURE` / `fetch failed`.
- A conexao voltou com `--use-system-ca`, sem desativar TLS; `vercel whoami` autenticou corretamente.
- Deploy `v5.39` concluido: `dpl_78CPa3dGRLKvePoC9XgeQZ1tAY5j`, estado `READY`, alias `https://cliente-x-instagram.vercel.app`.
- Prova publica: HTTP `200`, HTML com `Versão atual: v5.39` e API com `activeVersion.appVersion: v5.39`, status `funcionando`.

## 2026-08-28 23:31 BRT

- O usuario autorizou explicitamente o deploy da `v5.39` e uma publicacao real de Reel + Story.
- O deploy Vercel foi tentado duas vezes, mas a conexao local falhou com `fetch failed`; ate `vercel whoami` apresentou o mesmo erro. Nenhum deployment novo foi criado e a producao permanece honestamente em `v5.37`.
- A primeira tentativa de publicacao, run `33228825486`, foi bloqueada antes da Meta porque o Radar nao encontrou pauta oficial inedita em 30 dias. Nenhuma midia foi criada.
- A recuperacao usou conteudo editorial proprio sobre crescimento organico, sem repetir noticia nem enfraquecer a exigencia de fonte para pautas jornalisticas.
- Publicacao real concluida no run `33228996617`: `https://www.instagram.com/reel/Dcm3ck6ElYC/`, media ID `18107059028331902`, Story ID `18156576109501120`.
- O Reel usou `beethoven-03-heroica`, arranjo proprio inspirado na Sinfonia nº 3 Eroica, AAC estereo 48 kHz, 108 BPM, 22,4 segundos e quatro transicoes. Video em `a352eae`, Story em `7c379c9` e estado remoto em `13ecfc4`.

## 2026-08-28 23:15 BRT

- A inteligencia editorial passou a alternar um objetivo organico principal por publicacao: comentarios, salvamentos, compartilhamentos ou alcance de novos publicos. O painel tambem indica o sinal prioritario a partir das metricas recentes (`970b269`, versao preparada `v5.38`).
- Adicionada rotacao de 12 trilhas aos Reels: tres composicoes proprias existentes e nove arranjos sintetizados pela plataforma, inspirados nas Sinfonias nº 1 a nº 9 de Beethoven (`3bcfe94`, versao preparada `v5.39`).
- Nenhuma gravacao comercial foi incorporada. As composicoes classicas estao em dominio publico; os novos arranjos e a sintese sao proprios, com percussao reduzida e timbre melodico de cordas.
- `node --check`, `npm run validate-copy` com 74 combinacoes e `git diff --check` passaram.
- Prova tecnica local da variacao `beethoven-05-destino`: Reel H.264 com AAC estereo 48 kHz, 22,4 segundos, volume medio `-16,1 dB` e pico `-1,6 dB`; metadados registram a inspiracao e os direitos do arranjo.
- Estado enviado ao `origin/main` em `3bcfe94`. Deploy Vercel e publicacao Instagram real ainda aguardam confirmacao explicita da acao externa.

## 2026-08-28 22:47 BRT

- Confirmado o relato do usuario: a versao anterior tinha volume correto, mas usava ondas senoidais sustentadas e soava como tom/barulho, nao como musica.
- `21eebd5` substituiu esse gerador por uma composicao instrumental original com bateria, baixo, acordes e melodia. Ha tres arranjos entre 98 e 110 BPM; a saida continua em AAC 48 kHz estereo, agora normalizada a `-15 LUFS`.
- Renderizacao local confirmou `pulso-produtivo`, 104 BPM, quatro camadas instrumentais e transicoes. O MP4 realmente hospedado mediu `-17,0 dB` de volume medio e `-0,9 dB` de pico.
- Publicacao real concluida no run `33227198988`: `https://www.instagram.com/reel/DcmyfPGlO8G/`, media ID `17929839645147286`, video em `e6c1baa` e estado remoto `0691106`; nenhum erro no primeiro comentario.
- Producao `v5.37`: deployment `dpl_4MvN9G9Xh7HK9CS8qETyuBwumAit`, estado `READY`; API publica confirmou HTTP 200 e status `funcionando`.

## 2026-08-28 22:36 BRT

- Corrigido o botao `Corrigir automaticamente`. A causa inicial era o `GITHUB_TOKEN` expirado, que fazia a Vercel receber `GitHub HTTP 401: Bad credentials`.
- O token fine-grained `cliente-x-instagram-vercel` foi regenerado sem exposicao, rotacionado na Vercel Production e configurado para expirar em 26/11/2026.
- A primeira prova eliminou o 401 e iniciou runs reais, mas confirmou que repetir o Radar nao resolvia a falta de pauta oficial inédita. A v5.36 (`ee428de`) passou a despachar um pack editorial proprio nesse caso, preservando a exigencia de fonte oficial para noticias.
- Adicionada trava de tres minutos por erro para impedir varios cliques ou checkagens de criarem runs concorrentes.
- Prova ponta a ponta: run `33226668709` concluiu em 2m28s e publicou `https://www.instagram.com/reel/DcmxGIPlZWZ/`, media ID `17895966213599689` e Story ID `18091479335215213`; estado remoto `e051236` marcou todos os erros do slot 2 como resolvidos.
- Deploy final `dpl_GmK4NeeLXtKEohE5bkYDy3EXAcTy` ficou `READY`; API publica confirmou `v5.36`, HTTP 200, zero erro aberto e token valido ate 26/11/2026.

## 2026-08-28 22:11 BRT

- Confirmado o relato do usuario: o Reel anterior tinha AAC mono 48 kHz com volume medio de apenas `-32,2 dB` e pico de `-24,3 dB`, por isso a trilha quase nao era percebida.
- A correcao `6cc8f69` substituiu os tons estaticos por arranjos eletronicos ambientes com pulsacao, converteu a saida para estereo e aplicou normalizacao `-16 LUFS`/`-1,5 dBTP`, mantendo fades e transicoes.
- O arquivo MP4 realmente hospedado foi auditado: AAC 48 kHz estereo, aproximadamente 137 kbps, volume medio `-18,1 dB` e pico `-6,6 dB`, ganho efetivo de cerca de 14 dB.
- Publicacao real concluida no run `33225513924`: `https://www.instagram.com/reel/DcmuNuZjY3D/`, media ID `18083297000306014`; video em `b57e810`, estado em `2a4bc48` e nenhum erro no primeiro comentario.
- Producao atualizada para `v5.35`: deployment `dpl_CvCwTuaGMxrsAyVgCrMNwiHgtH3C`, estado `READY`; API publica confirmou HTTP 200 e status `funcionando`.

## 2026-08-28 22:01 BRT

- Configurados oito Reels automaticos por dia sem remover os 13 horarios existentes: slots BRT 06:30, 09:00, 12:10, 13:50, 14:15, 16:00, 17:40 e 22:00 publicam Reel + Story; os demais mantem carrossel + Story (`c22c3ac`).
- O video passou a alternar quatro transicoes de 0,65 segundo (`fade`, `slideleft`, `smoothleft`, `circleopen`). A prova tecnica confirmou MP4 vertical H.264, 22,4 segundos, 30 FPS e trilha AAC 48 kHz.
- O run `33224758391` nao criou midia: o Reel foi renderizado, mas o Story parou no limite do ImgBB. `880b2c3` passou a hospedar tambem o Story dos Reels no fallback do GitHub.
- Publicacao real concluida no run `33224978112`: `https://www.instagram.com/reel/Dcms-MJjoGX/`, media ID `17991592248039786`, Story ID `17907262068494462`, trilha `tecnologia-serena` e quatro transicoes confirmadas no artefato.
- Video hospedado em `70bec66`, Story em `fbe8e02` e estado em `269d2fc`. O primeiro comentario falhou isoladamente com OAuthException `#10`, sem afetar Reel, audio ou Story.
- Producao `v5.34`: deployment `dpl_6wTaDycWXHRKERPh977xf3snC8Ek`, estado `READY`; API publica confirmou HTTP 200 e status `funcionando`.

## 2026-08-28 21:45 BRT

- Adicionada trilha instrumental original aos Reels (`f48e396`), sem depender da biblioteca musical do Instagram nem de arquivos de terceiros.
- O gerador escolhe deterministicamente entre tres variacoes, mistura a trilha em volume baixo e aplica entrada de 1,2 segundo e saida de 1,8 segundo. Saida validada com H.264 `1080x1920`/30 FPS e AAC mono 48 kHz.
- O run real `33224292928` foi aceito e publicado pela Meta com a trilha `movimento-leve`: `https://www.instagram.com/reel/DcmrUxHjhK4/`, media ID `18421987573151325`, contêiner `18422853097149007`.
- Video hospedado em `215985b`; estado operacional em `9b6b04f`. O artefato confirmou `reelAudioTrack: movimento-leve`, duracao de 25 segundos e audio original gerado.
- Producao atualizada para `v5.33`: deployment `dpl_BysQpswRJXYSLA1vibUoaXKqnJu9`, estado `READY`; API publica confirmou HTTP 200 e status `funcionando`.
- O primeiro comentario falhou isoladamente com OAuthException `#10`, sem afetar o Reel ou o audio.

## 2026-08-28 21:34 BRT

- Implementada a primeira versao completa de Reels automaticos: o painel permite `So Reel automatico` e `Reel automatico + story`, inclusive em publicacao imediata e agendamento.
- O gerador reutiliza as cinco cenas do Radar em portugues e cria MP4 H.264 vertical `1080x1920`, 30 FPS e 25 segundos, com preenchimento visual desfocado; a publicacao usa `media_type=REELS`, compartilha no feed, aguarda `FINISHED` e grava permalink/ID.
- Implementacao funcional em `6b99732`; instalacao de FFmpeg no runner em `7e34b4d`. `node --check`, `npm run validate-copy`, `git diff --check`, renderizacao e `ffprobe` passaram.
- O run `33223487396` foi bloqueado antes da Meta porque o runner nao tinha FFmpeg; o run `33223563337` foi bloqueado pelo Radar porque nao havia pauta automatica elegivel. Nenhum dos dois criou midia.
- Prova real concluida no run `33223701381`: `https://www.instagram.com/reel/Dcmp9m2lQNJ/`, media ID `18058367948530681`, fonte oficial `n8n`; video hospedado em `a73cd0d` e estado em `796d0a6`.
- A versao `v5.32` foi publicada no deployment `dpl_8QgRnBs9NfnREb9KuvyiTNrDTony`, estado `READY`, no dominio principal. API publica confirmou HTTP 200, versao `v5.32` e status `funcionando`.
- O primeiro comentario do Reel falhou isoladamente com OAuthException `#10`, sem afetar a publicacao do Reel.

## 2026-08-28 21:12 BRT

- Publicacao real solicitada pelo usuario concluida no run `33222614158`, usando uma pauta oficial e ainda nao utilizada do `Google Oficial`.
- Feed confirmado em `https://www.instagram.com/p/DcmneBYASlO/`; media ID `18150159394524409`; Story ID `17955874029235228`.
- Titulo publicado: `Google adiciona novas ferramentas de IA ao Ads e ao Analytics.` A legenda inclui `Entenda a materia:` com dois fatos traduzidos para portugues do Brasil e mantem o titulo original em ingles apenas como referencia tecnica no link.
- Capa, slide 4 e Story foram inspecionados no artefato: todo texto visual esta em portugues; capa e slide 4 usam fotos pessoais diferentes, sem repeticao no mesmo carrossel.
- Imagens persistidas em `40458ee`; estado da agenda e historico de publicacao em `d225dbf`. O primeiro comentario falhou isoladamente com OAuthException `#10`, sem afetar o feed ou o Story.

## 2026-08-28 21:02 BRT

- Corrigida a repeticao de fotos dentro do mesmo carrossel: a categoria empresarial possuia apenas uma foto contextual, usada tanto na capa quanto no slide de resultado.
- A colecao empresarial passou a ter cinco imagens distintas e a validacao bloqueia o render se os slides 1 e 4 receberem a mesma foto.
- `node --check`, `npm run validate-copy` e `npm run render-only` passaram. A previa `2026-08-28-210114-slot-0-render-only` foi inspecionada: capa e slide 4 usam cenas contextuais diferentes e fotos pessoais diferentes.
- Correcao funcional: `7d17fe7` (`Evita fotos repetidas no mesmo carrossel`).
- Versao `v5.31` confirmada na API publica, status `funcionando`, HTTP 200. Deployment `dpl_CHGiP9K2XmCHJ7Q2ezrDynaToHSQ`, estado `READY`, no dominio principal.
- Nenhuma nova publicacao foi enviada ao Instagram nesta correcao; a regra vale para os proximos carrosseis.

## 2026-08-28 20:56 BRT

- A versao visivel do painel foi atualizada de `v5.28` para `v5.29` e, depois da correcao completa de idioma, para `v5.30` em `api/state.js` e `docs/dashboard.html`.
- Producao confirmada em `https://cliente-x-instagram.vercel.app`: `activeVersion.appVersion = v5.30`, status `funcionando`, HTTP 200. Deployment atual: `dpl_9FuzqqFXWnVzvopmq4RTjHzvjNDi`, estado `READY`, sem conectar Git nem alterar dominio.
- O run `33221508012` tentou usar o Radar automatico, mas foi bloqueado porque nenhuma pauta oficial nao repetida estava disponivel; nenhuma midia foi criada.
- Um sorteio controlado entre pautas oficiais verificadas selecionou `IBM AI`. O run `33221750143` publicou feed + Story com texto principal em portugues do Brasil.
- Publicacao confirmada: `https://www.instagram.com/p/Dcmlfu_HR8J/`; media ID `17973789066139952`; Story ID `17918202105223733`; imagens persistidas em `5a23273`; estado operacional em `6f4f805`.
- O artefato confirmou legenda em portugues com dois fatos depois de `Entenda a materia:`. Capa, slides principais e Story tambem foram inspecionados em portugues.
- A auditoria identificou que o pequeno titulo dentro do cartao `FONTE OFICIAL` ainda preservava o titulo original em ingles. O commit `e37a4af` criou um titulo visual traduzido separado, bloqueia cartao em ingles e preserva o original somente como referencia tecnica do link.
- `f2d7bfd` passou a priorizar traducoes editoriais verificadas sobre resumos RSS; `node --check`, `npm run validate-copy` e `git diff --check` passaram.

## 2026-08-28 20:36 BRT

- O Radar passou a sortear criptograficamente entre fontes oficiais elegiveis e equilibradas, sem repetir a mesma fonte em sequencia e sem enfraquecer as travas de URL, pauta, capa ou legenda repetida (`bed0a88`).
- O conjunto oficial foi ampliado com os feeds verificados de Microsoft AI, Google Oficial e IBM AI (`e0c6ae6`).
- A primeira tentativa, run `33220605543`, foi bloqueada corretamente porque as pautas anteriores estavam repetidas; nenhuma midia foi criada.
- A segunda tentativa, run `33220820938`, sorteou `Microsoft AI` e publicou feed + Story: `https://www.instagram.com/p/DcmjdQPHCY2/`, media ID `18166974271460207`, Story ID `18127346965686411`.
- A auditoria do artefato identificou que o resumo RSS dessa pauta era apenas um boilerplate em ingles. O commit `dae86f8` passou a descartar esse padrao e ampliou o detector de ingles, impedindo futuras pautas internacionais sem traducao factual em portugues.
- Validacoes: `node --check` passou nos arquivos alterados; `npm run validate-copy` passou com `sourceBalanceGuard`, `radarSourceIntegrityGuard` e teste especifico contra boilerplate em ingles.
- Imagens da publicacao persistidas em `440b2bb`; historico operacional em `df8741b`; nenhuma alteracao de dominio ou conexao Git/Vercel foi feita.

## 2026-08-28 20:23 BRT

- Corrigida a sobreposicao visual da primeira imagem em pautas do Radar: o autocorretor movia o cartao `FONTE OFICIAL` e a foto pessoal para a mesma coordenada quando o titulo era longo.
- O ajuste agora calcula a area vertical disponivel considerando apenas blocos que realmente cruzam horizontalmente, preserva 24 px entre elementos visuais e bloqueia a renderizacao se qualquer sobreposicao entre cartao e foto permanecer.
- A foto da capa tambem ganhou folga lateral em relacao ao bloco de texto nos layouts esquerdo e direito.
- `node --check`, `npm run validate-copy` e duas execucoes de `npm run render-only` passaram. A previa real encontrou 28 pautas oficiais em 30 dias e confirmou cartao da fonte, foto e texto em areas separadas.
- Correcao publicada no commit `50e4e97` e no deployment `dpl_6dQF5DChNHx54rEL2eW2t8qhMB4o`, estado `READY`, associado ao dominio principal.

## 2026-08-28 20:17 BRT

- Nova publicacao solicitada depois da ampliacao do Radar para 30 dias.
- O run `33219596814` encontrou 28 temas oficiais, mas bloqueou corretamente a publicacao porque todos ja estavam no historico; nenhuma midia foi criada e nao houve duplicacao.
- O fluxo alternou para conteudo editorial proprio da marca, sem atribuir fonte jornalistica inexistente: `Um dono queria crescer, mas centralizava tudo.`
- O run `33219787467` concluiu `Publish feed and story` com sucesso e resolveu o estado do vigia.
- Permalink confirmado: `https://www.instagram.com/p/DcmhYaAFkDC/`; media ID `18123340474891128`; Story ID `17885235213683751`; primeiro comentario sem erro.
- Imagens persistidas no commit `1aa8f6e`; historico operacional persistido em `7aa6d98`.

## 2026-08-28 20:09 BRT

- O Radar da conta `cliente-x` passou de 7 para 30 dias como janela principal de pesquisa em fontes oficiais.
- A coleta inicial pode manter ate 40 pautas candidatas quando a janela e de 30 dias; a agenda continua escolhendo somente os slots necessarios e preserva as travas contra link, noticia, legenda e capa repetidos.
- `api/state.js`, `api/publish-now.js`, o publicador e o painel foram alinhados para exibir e usar os mesmos 30 dias, sem depender de uma tentativa anterior de 7 ou 15 dias.
- Validacoes: `node --check` passou nos tres arquivos JavaScript alterados, `npm run validate-copy` passou com 20 packs, 54 automaticos e 74 selecoes, e `git diff --check` passou.
- Prova real de pesquisa: `npm run render-only` encontrou 28 temas em fontes oficiais na janela de 30 dias e renderizou cinco slides e Story com `packIndex: news-1`.
- Producao atualizada no deployment `dpl_HhXruKG61TDMoqH5RdnHzNqP7yNF`, estado `READY`; o painel confirmou `30` dias e `Checkagem: tudo OK` as 20:10 BRT.

## 2026-08-28 20:03 BRT

- A primeira tentativa manual, run `33218438968`, foi bloqueada corretamente porque o Radar nao encontrou pauta oficial nao repetida em ate 30 dias; nenhuma midia foi criada.
- A segunda tentativa, run `33218701071`, revelou que a trava de fonte do Radar tambem era aplicada indevidamente a packs editoriais enviados explicitamente pelo painel; nenhuma midia foi criada nessa tentativa.
- O commit `6dc9aac` separou os fluxos: pautas pesquisadas pelo Radar continuam obrigadas a preservar `research.sourceUrl`, enquanto conteudo proprio da marca enviado manualmente pode ser publicado sem atribuir uma fonte jornalistica inexistente.
- `node --check`, `npm run validate-copy` e `git diff --check` passaram antes do envio.
- Publicacao real confirmada no run `33218965450`: feed e Story concluidos com sucesso, sem erro no primeiro comentario.
- Permalink: `https://www.instagram.com/p/Dcmf1LkH1jm/`; media ID `18368003272241923`; Story ID `17994351519033665`.
- Conteudo: `A IA nao muda a empresa quando fica solta.`, carrossel de cinco slides e Story.
- Imagens hospedadas no commit `cabc9f2`; historico operacional persistido pelo workflow em `d48ba8f`.

## 2026-08-28 19:45 BRT

- O painel passou a atualizar as metricas privadas a cada 60 segundos, ao voltar para a aba e ao receber foco, sempre sem cache e sem duplicar requisicoes (`b14c958`).
- Deploy de producao concluido diretamente no projeto Vercel existente, sem conectar Git nem alterar dominio: `dpl_CaM64XRiAjqCAYQha1EeNf3bF3NS`, estado `READY`, associado a `https://cliente-x-instagram.vercel.app`.
- Producao conferida no painel: ultima publicacao confirmada pela Meta em 28/08/2026 19:22 BRT, `https://www.instagram.com/p/DcmbM_kGgSV/`.
- O alerta residual do vigia foi corrigido em `13e4245`: execucoes manuais bem-sucedidas agora resolvem erros abertos da conta, e os 50 registros historicos foram marcados como resolvidos usando como prova o run `33216450654`.
- `.vercelignore` passou a excluir `artifact-*`, alem de `.env`, `.env.*`, runs e dependencias, para que artefatos operacionais nao entrem no pacote de deploy.
- Validacao final: `npm run validate-copy` passou com 20 packs, 54 packs automaticos e 74 selecoes; nenhum erro aberto permaneceu em `watchdog-errors.json`.

## 2026-08-28 19:23 BRT

- O Story ganhou autocorrecao progressiva no commit `69ed72e`: limita blocos que invadem a foto, remove rotacao e reduz a imagem quando necessario, compacta texto/CTA em ate tres passes e valida novamente colisao e area segura antes da captura.
- A pauta real que havia falhado, uma versao com explicacao mais extensa e outra com titulo muito longo passaram no dry-run; o HTML corrigido fica salvo no artefato para auditoria.
- Pautas em ingles agora exigem traducao editorial em portugues no commit `07fe734`. O titulo e a fonte originais permanecem identificados pelo link, mas o trecho `Entenda a materia:` nao pode conter o resumo em ingles.
- A pauta `Supporting Thailand’s next generation of AI startups` passou a gerar: `OpenAI e o Ministerio da Educacao Superior da Tailandia lancaram um programa acelerador de oito semanas para dez startups...`.
- Noticias em ingles sem traducao confiavel sao descartadas antes da publicacao; o pacote antigo com resumo em ingles foi bloqueado no teste.
- `node --check` e `npm run validate-copy` passaram; a validacao inclui a traducao da pauta da Tailandia e o bloqueio de uma pauta tecnica inglesa sem traducao.
- Teste real acionado pelo commit `b807b87`: run `33216450654` concluiu `Publish feed and story` com sucesso.
- Publicacao confirmada: `https://www.instagram.com/p/DcmbM_kGgSV/`, media ID `17953144551209392`, Story ID `17980736346111529`.
- A pauta selecionada no teste foi do G1 Tecnologia e ja estava em portugues; os fatos persistidos tambem estao em portugues.
- A auditoria do teste revelou que o evento `push` sobrescrevia para `0` o indice atrasado escolhido pelo vigia. O workflow foi corrigido em `2536b35`, e o livro de slots foi restaurado com os indices `0` e `1` realmente publicados.
- Com o livro corrigido, `node scripts/select-due-auto-slot.mjs` selecionou corretamente o proximo atraso: indice `2`, agendado para 09:00 BRT.

## 2026-08-28 19:09 BRT

- Diagnosticada a interrupcao das publicacoes automaticas: o ultimo post comprovado era de 2026-08-27 07:39 BRT e os runs `33191718296`, `33206219237` e `33214757578` falharam em `Publish feed and story` com `Story rejeitado: texto sobrepoe a foto.`.
- O artefato real do run `33214757578` mostrou o CTA terminando em `x=662` e a foto rotacionada iniciando em `x=594,7`; a colisao de 67 px ocorria no layout normal de pautas com titulo abaixo de 55 caracteres.
- As larguras do corpo e CTA para titulos longos foram corrigidas em `b3377a5`; o CTA do layout normal foi corrigido em `db9dc53` e validado diretamente sobre o HTML que havia falhado, com 22,7 px de folga ate a foto.
- `npm run validate-copy` passou, `npm run dry-run` renderizou cinco slides e Story, e a reproducao automatizada do artefato confirmou `overlap: false` para titulo, corpo e CTA.
- A recuperacao foi acionada somente em `main` pelo commit `7a3e2f2`.
- Run `33215506981` concluiu com sucesso, publicou feed e Story e resolveu os tres erros abertos do vigia.
- Permalink confirmado: `https://www.instagram.com/p/DcmZo_rk_2f/`; media ID `18090005111272483`; Story ID `18144325813720376`.
- Slot recuperado: 2026-08-28, indice `0`, agendado para 06:30 BRT e marcado como publicado as 19:09 BRT.
- Registro operacional final persistido no commit remoto `c212f13`.

## 2026-08-17 11:29 BRT

- Confirmado que o rodizio anterior impedia apenas repeticao consecutiva e usava todo o historico; nos cinco posts observados, o padrao foi `G1 -> n8n -> G1 -> AWS -> G1`.
- O balanceamento passou a considerar a janela movel das ultimas 12 publicacoes pesquisadas, priorizando a fonte menos presente na grade recente.
- Pautas comerciais de produto, oferta, promocao, desconto e smartwatch foram excluidas do Radar.
- A protecao visual agora pode ocultar foto apenas decorativa de slide interno quando nao existe area segura, preservando titulo e texto; a foto de capa permanece protegida.
- `node --check`, `npm run validate-copy` e `npm run render-only` passaram. A previa escolheu `AWS Machine Learning`, nao G1, com conteudo em portugues.
- Commit funcional: `8e1d4a5`.

## 2026-08-17 10:40 BRT

- Publicacao automatica real acionada no commit `beaeab7` para validar a trava de portugues.
- Run `32036009272` concluiu feed e Story com sucesso.
- Permalink: `https://www.instagram.com/p/DcJKe7pFvhP/`; media ID `17904573321496712`; Story ID `17963038641168267`.
- Os cinco slides publicados e o Story foram inspecionados visualmente: todo o texto esta em portugues e as fotos estao inteiras.
- A legenda publica foi extraida diretamente do HTML do Instagram com HTTP 200; esta em portugues e nao contem `Comparing RPA`, `workflow automation` nem `Building Automation That Lasts`.
- O primeiro comentario segue com `OAuthException #10`, sem afetar feed, Story ou legenda.

## 2026-08-17 10:34 BRT

- Corrigida a pauta n8n que publicou `Comparing RPA versus workflow automation` em ingles em um slide e repetiu texto estrangeiro na legenda.
- O detector de idioma passou a reconhecer vocabulário adicional de artigos tecnicos em ingles.
- Slides e legenda agora sao validados no pacote final imediatamente antes da renderizacao/publicacao.
- Titulos originais em ingles nao sao mais copiados para a legenda ou primeiro comentario; fonte e link oficial permanecem obrigatorios.
- A pauta exata `RPA vs. Workflow Automation` foi testada e gerou cinco slides e legenda em portugues, sem nenhum sinalizador de ingles.
- `node --check`, `npm run validate-copy` e `npm run render-only` passaram; commit funcional `f465019`.

## 2026-08-17 10:23 BRT

- Teste automatico real solicitado pelo usuario e acionado no commit `8347d26`.
- Workflow `32034646438` concluiu `Publish feed and story`, marcou o slot e resolveu o vigia com sucesso.
- Feed: `https://www.instagram.com/p/DcJIpuCIF_F/`, media ID `17939869695302140`.
- Story ID: `18006552392956384`.
- O teste usou os ajustes `3ed5efe` e `14822ea` para titulo longo, espacamento do Story e foto proporcional sem corte.
- O primeiro comentario automatico continua sem permissao Meta (`OAuthException #10`), sem afetar feed ou Story.

## 2026-08-17 10:19 BRT

Resumo:

- Diagnosticado o disparo automatico: feed e vigia falhavam em `Publish feed and story` porque a foto do Story ultrapassava em poucos pixels a validacao central.
- Ajustada a tolerancia exclusiva da foto no commit `b8924dc`, preservando a trava rigida para textos.
- Recuperacao acionada pelo commit `98c2f7c`; run `32033523845` publicou feed e Story e resolveu os registros do vigia.
- Publicacao real confirmada: `https://www.instagram.com/p/DcJHScOoCQl/`, media ID `18219025894339463`, Story ID `17868329220638472`.
- Títulos longos receberam fonte progressivamente menor e mais largura no feed; o Story recebeu mais espaco entre seus blocos (`3ed5efe`).
- Fotos pessoais passaram de preenchimento com corte para encaixe proporcional completo no feed e Story (`14822ea`).

Validado:

- `node --check automation/instagram-template/scripts/publish-carousel.mjs` passou.
- `npm run validate-copy` passou com 20 packs fixos, 54 automaticos e 74 selecoes automaticas.
- `npm run render-only` passou; previas de feed e Story foram inspecionadas sem cortes ou sobreposicoes.

Pendente:

- Conferir visualmente a primeira publicacao automatica criada depois de `14822ea`.
- O primeiro comentario automatico ainda retorna `OAuthException #10`; isso nao impediu feed nem Story.

Deploy/publicacao:

- Deploy: alteracoes sincronizadas com `origin/main`; nenhum deploy Vercel necessario.
- Instagram real: sim, run `32033523845` e permalink `DcJHScOoCQl`.

## 2026-08-16 22:07 BRT

As dez telas da plataforma exibidas na landing foram recapturadas na versao atual.

- Foram abertas e conferidas as nove abas reais do painel v5.27: Visao geral, Conteudo, Historico do Direct, Agenda, Grade semanal, Pagina Bio, Clientes, Cobranca e Sistema.
- A aba Conteudo foi registrada em dois pontos para mostrar separadamente a Automacao do Direct e o editor com Radar, totalizando dez demonstracoes.
- Todas as imagens antigas da versao v5.06 foram substituidas por capturas atuais da plataforma em producao.
- O seletor do carrossel deixou de usar uma faixa horizontal escondida e passou a mostrar as dez opcoes em grade: cinco por linha no desktop e duas por linha no celular.
- Os links de ampliacao e o cache das imagens foram atualizados para `v=527`.
- `npm run validate-copy` passou com todas as protecoes editoriais, de fonte, Feed e Story.
- Nenhuma postagem foi enviada a Meta nesta alteracao.
- Commit funcional: `9156514` (`Atualiza todas as telas da landing`); deploy `dpl_4JTm9UNd7Gckzqt94j2CXjVyBWay`; versao `v5.28` confirmada pela API publica.

## 2026-08-16 21:58 BRT

A landing passou a apresentar os dois posts realmente fixados no Instagram.

- O perfil `@marcondes.machado.oficial` foi conferido visualmente e os dois posts com icone de fixacao foram identificados: `DcHuU08EiyD` e `DcHxTYymGS0`.
- Os embeds quebrados, que deixavam caixas vazias, foram substituidos pelas capas locais dos posts e por links para as publicacoes oficiais.
- Cada card recebeu o selo `Fixado no Instagram`, titulo legivel e chamada para abrir o post no perfil.
- A prova da landing tambem passou a apontar para uma publicacao fixada atual, removendo o link antigo indisponivel.
- O layout permanece responsivo para desktop e celular e nao depende mais do carregamento externo do embed.
- `npm run validate-copy` passou com todas as protecoes editoriais, de fonte, feed e Story.
- Nenhuma postagem foi enviada a Meta nesta alteracao.
- Commit funcional: `a9b4b7f` (`Exibe posts fixados na landing`); deploy `dpl_Hf4r1nsbxN2Zq7gGkSo2Seu3Po1L`; versao `v5.27` confirmada pela API publica.

## 2026-08-16 21:52 BRT

O ultimo slide dos carrosseis passou a variar o fechamento entre as materias.

- Antes, as pautas do Radar repetiam a mesma frase `Se isso acontece na sua empresa, vamos olhar juntos...`.
- Foram criadas oito combinacoes de selo, titulo e chamada final, escolhidas de forma deterministica pelo link da materia.
- Exemplos de selos: `COMECE POR AQUI`, `DIAGNOSTICO RAPIDO`, `PROXIMO PASSO`, `TESTE PEQUENO` e `RESULTADO PRATICO`.
- Os fechamentos convidam para diagnostico, primeiro teste, organizacao de processo ou definicao do ganho esperado, sempre com frase completa e chamada para o Direct.
- A mesma materia sempre mantem o mesmo fechamento ao ser renderizada novamente; materias diferentes alternam a chamada.
- A validacao exige pelo menos seis fechamentos distintos em doze pautas de teste (`finalSlideVariationGuard: ok`).
- Previa visual confirmada em `2026-08-16-215226-slot-0-render-only`, com o fechamento `Que processo voce gostaria de organizar?`.
- O limite adaptativo do Story foi antecipado para titulos a partir de 55 caracteres, evitando colisao em chamadas medias.
- Nenhuma postagem foi enviada a Meta nesta alteracao.
- Commit funcional: `f5b3e16` (`Varia chamadas do ultimo slide`); deploy `dpl_BzH3C9gZXaRQ3YqWn2PFvE8oFiH8`; versao `v5.26` confirmada pela API publica.

## 2026-08-16 21:46 BRT

Reorganizada a distribuicao do Story para respeitar visualmente os campos seguros do formato 9:16.

- Problema: o titulo e o CTA ficavam concentrados no alto, enquanto fotografia e assinatura ocupavam um bloco pequeno, deixando um vazio excessivo no centro.
- Titulos longos agora usam margens laterais de 88 px, largura controlada e hierarquia mais equilibrada.
- Fotografia ampliada para `340 x 430 px` e posicionada junto ao bloco inferior da area util.
- Assinatura e nome foram reposicionados ao lado da fotografia, sem invadir o titulo ou a chamada.
- Permanecem preservados os campos definidos: 250 px de seguranca no topo, 1170 px centrais para o conteudo e 500 px livres na base.
- A renderizacao agora tambem bloqueia qualquer elemento que ultrapasse horizontalmente a arte ou saia da area segura vertical.
- Previa validada: `2026-08-16-214551-slot-0-render-only`, usando o mesmo titulo da materia do G1 e uma foto nova do rodizio.
- `npm run validate-copy` passou com `storySafeZoneGuard: 250-1170-500`.
- Nenhuma nova postagem foi enviada a Meta nesta correcao.
- Commit funcional: `9029a62` (`Reorganiza Story nas zonas seguras`); deploy `dpl_9Vxr5PwJqBNfWGdSndtpik4fbgZZ`; versao `v5.25` confirmada pela API publica.

## 2026-08-16 21:40 BRT

Nova materia verdadeira publicada pelo Radar e confirmada pela Meta.

- Fonte: G1 Tecnologia.
- Materia: `Os trabalhadores que 'dao adeus a CLT' atras do sonho de viver fazendo videos de IA`.
- Link da fonte: `https://g1.globo.com/empreendedorismo/noticia/2026/08/12/os-trabalhadores-que-dao-adeus-a-clt-atras-do-sonho-de-viver-fazendo-videos-de-ia.ghtml`.
- Workflow: `31982592122`, concluido com sucesso.
- Feed confirmado: `18112792313046183`.
- Story confirmado: `18108295541022431`.
- Permalink: `https://www.instagram.com/p/DcHxTYymGS0/`.
- O Story `2026-08-16-213846-slot-0` foi inspecionado: titulo longo, CTA e fotografia ficaram sem sobreposicao.
- O rodizio selecionou `avatar-marcondes-rotation-04.png`, confirmando o uso do acervo ampliado.
- O primeiro comentario foi recusado novamente pela Meta com `(#10) Application does not have permission for this action`; o titulo e o link verdadeiro permanecem na legenda.
- Nenhuma materia anterior foi repetida.

## 2026-08-16 21:31 BRT

Corrigida a composicao do Story para titulos longos e ampliado o rodizio de fotos.

- Causa visual: o Story aplicava o mesmo tamanho de titulo a chamadas curtas e longas, enquanto a verificacao de colisao conferia somente o paragrafo contra a foto.
- Titulos com 70 ou mais caracteres agora recebem composicao compacta; a partir de 110 caracteres recebem uma segunda reducao de tipografia e fotografia.
- A protecao de renderizacao agora bloqueia sobreposicao da foto com titulo, texto ou chamada para o feed.
- O mesmo titulo longo do G1 mostrado pelo usuario foi renderizado em `2026-08-16-213050-slot-0-render-only` e inspecionado sem sobreposicao.
- Foram criadas tres novas fotos profissionais exclusivas e adicionadas ao acervo: `avatar-marcondes-rotation-04.png`, `avatar-marcondes-rotation-05.png` e `avatar-marcondes-rotation-06.png`.
- O rodizio da conta passou de 7 para 10 fotos e evita reutilizar qualquer uma das 9 fotos usadas mais recentemente.
- As imagens foram geradas como um novo lote local; gerar uma foto por publicacao em tempo de execucao ainda exigira uma API de geracao de imagens configurada no GitHub Actions.
- `npm run validate-copy` passou; nenhuma publicacao foi enviada a Meta nesta alteracao.
- Commit funcional: `21dcf7d` (`Corrige Story e amplia rodizio de imagens`); deploy de producao `dpl_6kGQBhJrYp1uB5n43m2q6BcgB7MA`; versao `v5.24` confirmada pela API publica.

## 2026-08-16 21:21 BRT

Corrigida a publicacao de conteudo principal em ingles para o publico brasileiro.

- Causa: a capa usava a traducao editorial, mas `articleFacts` preservava diretamente os paragrafos em ingles extraidos de fontes como n8n, OpenAI e AWS.
- O Radar agora detecta texto predominantemente em ingles e nao permite que esses paragrafos entrem nos slides nem na legenda.
- Quando existe uma traducao editorial factual cadastrada, ela substitui os parágrafos estrangeiros; caso contrario, a pauta usa somente o fato em portugues disponivel e nao inventa traducao.
- A materia `Building AI Agent Observability for Production Workflows` ganhou tres pontos factuais em portugues sobre execucao, rastreabilidade e investigacao de falhas.
- O titulo original pode aparecer apenas na referencia final, identificado como `Titulo original (em ingles)`.
- A trava de publicacao rejeita qualquer `sourceFact` ou `sourceFacts` que ainda esteja predominantemente em ingles.
- `npm run validate-copy` passou e um teste direto confirmou slides e legenda em portugues para a mesma pauta do n8n.
- Nenhuma nova publicacao foi enviada a Meta durante esta correcao.
- Commit funcional: `b7691ab` (`Bloqueia conteudo principal em ingles no Radar`).
- Deploy final: `dpl_6fAXjYvXtbRB8VNDbfDo7h8CMbdq`; versao `v5.23`.

## 2026-08-16 21:16 BRT

Publicacoes novas confirmadas pela Meta depois da correcao da trava contra repeticao.

- Workflow `31981283031`: materia do G1 Tecnologia sobre deepfakes nas eleicoes; feed `18025226459893393`, Story `18133189693547611`, permalink `https://www.instagram.com/p/DcHuU08EiyD/`.
- Workflow `31981284877`: materia do n8n sobre observabilidade de agentes de IA; feed `18111392795080213`, Story `18016864748879873`, permalink `https://www.instagram.com/p/DcHuh6Vn4_Q/`.
- As duas pautas possuem URLs e titulos diferentes do Olhar Digital anteriormente repetido, confirmando que a nova trava funcionou.
- Dois posts foram enviados porque o mesmo commit de acionamento chegou a `feature/modern-editorial-system` e `main`, criando dois workflows serializados; futuros acionamentos manuais devem alterar o arquivo do vigia somente em `main`.
- A Meta voltou a recusar o primeiro comentario com erro `(#10) Application does not have permission for this action` em ambos os posts.
- Como protecao, as legendas publicadas mantiveram fonte, titulo original e URL completa da materia.
- Producao final da correcao: `v5.22`, commit funcional `c519d57`, deploy `dpl_C2ZzqJQ6CkTBUUrSpV6ax9qY7CSn`.

## 2026-08-16 21:11 BRT

Diagnosticada e corrigida uma repeticao de materia no comando `Publicar agora` do Radar.

- O workflow `31981001000` publicou feed `18113708173986576` e Story `17899737327349544`, permalink `https://www.instagram.com/p/DcHttB4FEDc/`.
- A publicacao repetiu a materia anterior do Olhar Digital porque `api/publish-now.js` selecionava o primeiro resultado da pesquisa sem consultar `publication-history.json`.
- O primeiro comentario automatico foi recusado pela Meta com erro `(#10) Application does not have permission for this action`; nenhum comentario foi confirmado.
- O comando imediato agora elimina URLs e titulos ja existentes no historico e prefere uma fonte diferente da ultima publicacao.
- Enquanto a permissao de comentarios nao estiver disponivel, titulo e URL completos permanecem na legenda para a fonte nunca desaparecer.
- `npm run validate-copy` passou; a previa `2026-08-16-211019-slot-1-render-only` confirmou uma pauta diferente da OpenAI e o link real na legenda.
- Commit funcional: `c519d57` (`Bloqueia repeticao e garante fonte na legenda`).
- Deploy inicial: `dpl_CRBDRrGMFnHWZ2YXqsHoA5t1wxtW`; deploy final `dpl_C2ZzqJQ6CkTBUUrSpV6ax9qY7CSn`; versao `v5.22`.
- O vigia foi acionado novamente para cumprir o pedido com uma materia realmente nova.

## 2026-08-16 21:01 BRT

Adicionada ao Story do Radar a orientacao para acompanhar a materia completa no feed.

- Nova chamada visivel: `Acompanhe a materia na integra no feed.`
- A chamada aparece apenas nas pautas reais do Radar, em cartao de alto contraste dentro da zona segura do Story.
- A previa `2026-08-16-210036-slot-0-render-only` foi inspecionada e confirmou que o texto nao cobre o titulo nem a fotografia.
- O texto tecnico oculto da fonte tambem foi alinhado para indicar `link no primeiro comentario`.
- `npm run validate-copy` passou com todas as travas editoriais e de arquitetura visual.
- Nenhum novo Story ou post foi enviado a Meta durante esta atualizacao.
- Commit funcional: `22d3b1f` (`Adiciona chamada do feed ao Story`).
- Deploy final: `dpl_J4qAjBZ6f6wGgzXMM3CwnDfAviGU`; versao de producao `v5.21`.

## 2026-08-16 20:56 BRT

Implementado o primeiro comentario automatico com a fonte completa das pautas reais do Radar.

- A legenda agora informa apenas `Fonte: nome da fonte · link da materia no primeiro comentario`, deixando a leitura mais limpa.
- O primeiro comentario preparado contem fonte, titulo original e URL completa da materia consultada.
- Slides 2 e 5 passaram a orientar corretamente que o link esta no primeiro comentario.
- A trava editorial bloqueia o Radar se o comentario nao contiver o titulo ou o link HTTPS da materia real.
- Depois de o feed ser publicado, uma eventual falha ao comentar nao dispara republicacao duplicada: o erro fica salvo em `firstCommentError` e o ID confirmado fica em `firstCommentId`.
- `npm run validate-copy` passou e a previa `2026-08-16-205452-slot-0-render-only` confirmou legenda, comentario e slides corretos.
- Nenhuma nova publicacao foi enviada a Meta nesta atualizacao.
- Commit funcional: `33db605` (`Publica fonte do Radar no primeiro comentario`).
- Deploy final: `dpl_ACCg5hDHp36ZgaFa2pkQZsMFu3p6`; producao confirmou `v5.20`.

## 2026-08-16 20:51 BRT

Corrigida a frase incompleta do ultimo slide das pautas do Radar.

- Causa: o texto `Se isso acontece na sua empresa, podemos olhar para a rotina juntos` era dividido pelo componente visual e o trecho `a rotina juntos` desaparecia quando o restante do paragrafo ocupava o bloco de fechamento.
- Nova chamada completa: `Se isso acontece na sua empresa, vamos olhar juntos para a rotina que mais pesa.`
- A previa `2026-08-16-205029-slot-0-render-only` foi inspecionada e confirmou a frase inteira no cartao do slide 5.
- `npm run validate-copy` passou com todas as travas editoriais.
- Nenhuma nova publicacao foi enviada a Meta durante esta correcao.
- Commit funcional: `13a0fe1` (`Corrige chamada final do carrossel`).
- Deploy: `dpl_5jigGsWG5oiMwnFzsPKGUkonNnGY`; producao respondeu `HTTP 200` e confirmou `v5.19`.

## 2026-08-16 20:47 BRT

Republicada e confirmada no Instagram a materia com legenda ampliada e continuidade factual no slide 3.

- Workflow real: `31979969801`, concluido com sucesso.
- Post: `https://www.instagram.com/p/DcHrLtois0h/`.
- Feed Meta: `17950180794027663`.
- Story Meta: `18123558775877294`.
- Fonte: Olhar Digital; materia `CEO da Anthropic: rejeicao a IA e crise de confianca no setor`.
- A legenda publicada foi aberta no Instagram e confirmou tres paragrafos factuais: contexto do debate, critica de Gavin Baker e resposta de Dario Amodei.
- O slide 2 inicia a explicacao sobre a percepcao publica; o slide 3 continua com a reacao de Amodei as declaracoes de Gavin Baker.
- Slides 2 e 3 foram inspecionados diretamente no carrossel publicado, sem sobreposicao visual.
- O CTA final publicado e curto: `Comente IA e eu envio o material no seu Direct`.
- As imagens foram hospedadas no commit automatico `497d561` e o historico tecnico foi persistido em `0c243ad`.

## 2026-08-16 20:42 BRT

Corrigidas a legenda curta e a falta de continuidade da materia no slide 3 das pautas do Radar.

- O Radar agora abre a pagina original da noticia e extrai paragrafos factuais, em vez de depender apenas do resumo curto do RSS.
- Slide 2 apresenta o primeiro fato; slide 3 usa `A MATERIA CONTINUA` e apresenta o segundo fato da mesma fonte.
- A analise para empresas foi deslocada para o slide 4 e permanece identificada como analise editorial.
- A legenda passou a usar ate tres paragrafos factuais da materia antes da analise, titulo original, data, fonte e URL.
- Paragrafos de credito de imagem, publicidade, assinatura e biografia do autor sao descartados.
- O bloco promocional longo de 50 prompts foi substituido nas pautas do Radar por um CTA curto: `Comente IA`.
- A materia da Olhar Digital foi acessada diretamente e confirmou o contexto adicional sobre Gavin Baker, equilibrio entre riscos e oportunidades, crise de confianca e falta de entregas proporcionais as promessas.
- `npm run validate-copy` passou com `articleContinuationGuard: ok`.
- A previa `2026-08-16-204020-slot-2-render-only` confirmou visualmente a sequencia entre os slides 2 e 3 sem sobreposicao.
- Nenhuma nova publicacao foi enviada a Meta durante esta correcao.
- Commit funcional: `68e3c0c` (`Continua a materia no carrossel do Radar`).
- Deploy: `dpl_CDgNSXa2Yy6Q1tXE83f2Bhw34mPj`; producao respondeu `HTTP 200` e confirmou `v5.18`.

## 2026-08-16 20:36 BRT

Publicada e verificada no Instagram a versao factual corrigida da materia da Olhar Digital.

- Autorizacao de publicacao confirmada pelo usuario antes do envio.
- Workflow real: `31979415179`, concluido com sucesso.
- Post: `https://www.instagram.com/p/DcHpzDUF0XY/`.
- Feed Meta: `17971088042934886`.
- Story Meta: `18067488110721745`.
- Fonte: Olhar Digital; materia `CEO da Anthropic: rejeicao a IA e crise de confianca no setor`.
- O post e a legenda foram abertos diretamente no Instagram e confirmaram o fato: Dario Amodei nega pessimismo sobre IA e reconhece que o publico questiona os ganhos do avanco da tecnologia.
- A inspecao do slide 2 encontrou o texto factual correto, mas longo demais, invadindo o cartao inferior.
- O limite visual foi reduzido de 155 para 105 caracteres para as proximas publicacoes; a legenda continua preservando o resumo completo.
- A nova previa `2026-08-16-203512-slot-2-render-only` foi inspecionada sem sobreposicao no cartao inferior.
- O post publicado foi preservado; nao houve exclusao nem uma segunda republicacao automatica.
- Commit funcional: `804d222` (`Limita contexto factual ao espaco do slide`).
- Deploy de producao: `dpl_GRgET1xJb1fBGBUDMHoXvkpsZLMN`.
- Producao respondeu `HTTP 200` e confirmou a versao `v5.17`.

## 2026-08-16 20:30 BRT

Corrigida a pauta do Radar que repetia o titulo da materia no lugar de apresentar seu contexto real.

- Causa encontrada: quando nao havia traducao editorial manual, `localizedNews()` ignorava o resumo factual recebido pelo RSS e fabricava `A materia informa: [titulo]`.
- O Radar agora extrai e limpa o resumo real do RSS, removendo o rodape automatico `O post ... apareceu primeiro em ...`.
- Na materia da Olhar Digital, o fato recuperado e: Dario Amodei nega pessimismo em relacao as inteligencias artificiais e reconhece que o publico geral questiona os ganhos com o avanco da tecnologia.
- O slide 2 usa uma frase factual compacta; a legenda preserva o contexto factual mais completo, o titulo original, a fonte e a URL.
- O publicador bloqueia pauta sem fato real, fato igual ao titulo ou texto iniciado por `A materia informa`.
- Uma primeira previa com o resumo longo foi rejeitada internamente por estourar o layout. A previa final `2026-08-16-202614-slot-0-render-only` foi inspecionada e ficou dentro da arte.
- `npm run validate-copy` passou com `factualArticleContextGuard: ok`, arquitetura Feed `1080x1350` e Story com zonas seguras `250-1170-500`.
- Nenhuma nova publicacao foi enviada a Meta durante esta correcao. O post antigo nao foi apagado nem republicado.
- Commit funcional: `45d2515` (`Exige contexto factual nas pautas do Radar`).
- Deploy de producao: `dpl_3pcr1d2WmKxq48RBXDbWhyAVukpi`.
- Producao respondeu `HTTP 200` e confirmou a versao `v5.16`.

## 2026-08-16 20:20 BRT

Publicada e verificada uma pauta real pelo Radar apos as novas travas editoriais.

- Workflow real: `31978583103`, concluido com sucesso em 1 minuto e 43 segundos.
- Fonte: Olhar Digital.
- Materia: `CEO da Anthropic: rejeicao a IA e crise de confianca no setor`.
- Link original: `https://olhardigital.com.br/2026/08/16/inteligencia-artificial/ceo-da-anthropic-rejeicao-a-ia-e-crise-de-confianca-no-setor/`.
- Post confirmado diretamente no Instagram: `https://www.instagram.com/p/DcHnyS7Adj5/`.
- O carrossel possui cinco slides e mostra fonte, titulo real e indicacao do link na legenda.
- A legenda apresenta titulo original, data, separacao entre fato da materia e analise editorial, fonte e URL completa.
- Feed confirmado pelo dashboard e pelo Instagram; identificador interno da midia `3965312977028110585` e identificador da legenda `18029758466845697`.
- Story confirmado visualmente no perfil com a mesma pauta.
- As seis imagens do run foram hospedadas no commit automatico `4a1a304`.
- O workflow manual nao persistia `publication-history.json` porque a etapa excluia `workflow_dispatch`; a condicao foi corrigida para futuras publicacoes manuais.
- Esta publicacao foi acrescentada manualmente ao historico para bloquear reutilizacao da mesma URL.
- Versao operacional: `v5.15`.
- Commit funcional: `7379feb` (`Registra publicacao real do Radar`).
- Deploy de producao: `dpl_53Um3xaRRg9hzkJLcVNj43dMJ3wf`.
- Producao respondeu `HTTP 200` e confirmou a versao `v5.15`.

## 2026-08-16 20:10 BRT

Bloqueadas explicitamente as chamadas empresariais genericas nas pautas pesquisadas pelo Radar.

- A auditoria confirmou tres publicacoes antigas com fonte real, mas capa aleatoria e sem relacao editorial clara com o artigo:
  - AWS Machine Learning: `https://www.instagram.com/p/DcHMqdWE3bI/`, publicado as 16:19 BRT, artigo `How Pixieset achieved 35% AI feature adoption by solving the right problem with Amazon Bedrock`.
  - n8n: `https://www.instagram.com/p/DcHWmrXlbbd/`, publicado as 17:46 BRT, artigo `n8n Alternatives: Which AI Automation Platform Can You Deploy?`.
  - Olhar Digital: `https://www.instagram.com/p/DcHgRw_EmOe/`, publicado as 19:10 BRT, artigo `CEO da Anthropic: rejeicao a IA e crise de confianca no setor`.
- As tres ocorreram antes da primeira trava de contexto real implantada as 19:52 BRT.
- Frases genericas como `Trabalho repetido ocupa...`, `O cliente espera enquanto...` e `Sua equipe vive ocupada...` agora fazem parte de uma lista de capas proibidas em qualquer pack de pesquisa.
- O publicador rejeita automaticamente esses padroes, mesmo que uma alteracao futura tente reintroduzi-los.
- `npm run validate-copy` passou com a nova evidencia `genericResearchCoverGuard: ok`.
- A pesquisa ao vivo encontrou 26 pautas atuais e o render `2026-08-16-200904-slot-0-render-only` passou sem usar chamadas genericas proibidas.
- Nenhuma publicacao foi enviada a Meta durante a auditoria e os posts antigos nao foram apagados.
- Commit funcional: `2968ccb` (`Bloqueia chamadas genericas nas pautas do Radar`).
- Deploy de producao: `dpl_t3NJgpNcDvjyFGt32rRmDwMCT4uW`.
- Producao respondeu `HTTP 200` e confirmou a versao `v5.14`.

## 2026-08-16 20:07 BRT

Reforcada a identificacao visual da materia original em todas as pautas do Radar.

- Foi identificado o post antigo `https://www.instagram.com/p/DcHh7QPEzVY/`, Feed `18091689095415142` e Story `18067881548720888`, publicado as 19:25 BRT antes da trava editorial da versao `v5.11`.
- A fonte era real: OpenAI, artigo `What building an AI-native finance function taught me`, em `https://openai.com/index/building-an-ai-native-finance-function`.
- O erro foi visual/editorial: o artigo real ficou escondido por uma chamada empresarial generica e o cartao mostrava apenas `OpenAI - Pauta relevante para empresas`.
- Cada slide de uma pauta pesquisada agora precisa carregar fonte, titulo original e URL HTTPS; a publicacao e bloqueada se qualquer um desses anexos estiver ausente.
- O cartao de fonte na arte mostra nome da fonte, titulo real da materia e `Materia identificada - link na legenda`.
- A chamada pode ser traduzida para portugues, mas nao pode mais esconder qual artigo a originou.
- `npm run validate-copy` passou com todas as protecoes editoriais e visuais.
- Render verificado: `2026-08-16-200621-slot-0-render-only`; o cartao exibiu fonte n8n, titulo real e informacao do link sem publicar na Meta.
- O post antigo da OpenAI nao foi apagado nem republicado sem autorizacao explicita.
- Commit funcional: `052ee8c` (`Exibe a materia real nos cartoes do Radar`).
- Deploy de producao: `dpl_Huqfv9ccSZowLoevus3YjvcZED1p`.
- Producao respondeu `HTTP 200` e confirmou a versao `v5.13`.

## 2026-08-16 19:57 BRT

Padronizada a arquitetura obrigatoria das artes de Feed e Story.

- O Feed permanece fixo em `1080 x 1350 px`, proporcao vertical `4:5`.
- O Story permanece fixo em `1080 x 1920 px`, proporcao `9:16`.
- O Story agora reserva 250 px no topo e 500 px na base para a interface do Instagram; textos, marca, imagem e informacoes importantes ficam na area central segura de 1170 px.
- O publicador automatico usa essas medidas em todos os modelos e possui validacao permanente `feedArchitectureGuard` e `storySafeZoneGuard`.
- O gerador da Grade semanal tambem posiciona todo o conteudo do Story dentro da area segura.
- Uploads manuais fora de `1080 x 1350` para Feed ou `1080 x 1920` para Story sao rejeitados antes do envio.
- O painel informa dimensoes obrigatorias e a area segura do Story ao lado dos campos de upload.
- `npm run validate-copy` passou com `feedArchitectureGuard: 1080x1350-4:5` e `storySafeZoneGuard: 250-1170-500`.
- Render de verificacao: `2026-08-16-195611-slot-0-render-only`; a imagem foi inspecionada e todo o conteudo ficou dentro da area segura, sem sobreposicao.
- Nenhuma publicacao real foi enviada a Meta durante esta alteracao.
- Commit funcional: `bdf8f7e` (`Padroniza zonas seguras de Feed e Story`).
- Deploy de producao: `dpl_6ySxPMN4Jw16BgBwkNdqGwgyKLKQ`.
- Producao respondeu `HTTP 200` e confirmou a versao `v5.12` e a orientacao de zona segura.

## 2026-08-16 19:52 BRT

Corrigida a fidelidade editorial das pautas capturadas pelo Radar.

- A publicacao incorreta foi identificada pelo permalink `https://www.instagram.com/p/DcHiH0mmQGl/`, Feed `17908366407463721` e Story `18486146131099438`.
- A fonte real era uma materia do TecMundo sobre agentes de imigracao, mas o filtro interpretou a palavra `agentes` como agentes de IA e combinou o titulo com textos empresariais genericos.
- O Radar agora so aceita `agente/agentes` quando o titulo tambem possui qualificadores reais de inteligencia artificial; termos fortes como IA, automacao, workflow e machine learning continuam elegiveis.
- A capa e os slides preservam o titulo e o contexto real da materia. Analises para empresas passam a ser identificadas explicitamente como analise editorial.
- A legenda exige fonte, titulo original e URL completa da materia; pautas sem esses elementos sao bloqueadas antes da publicacao.
- A camada de engajamento nao pode mais substituir o titulo, os fatos ou os rotulos gerados pela pesquisa do Radar.
- `npm run validate-copy` passou com as novas travas `radarSemanticGuard` e `radarSourceIntegrityGuard`.
- Um teste especifico rejeitou a materia de agentes de imigracao e aceitou uma materia real sobre IA.
- Render de verificacao: `2026-08-16-194931-slot-0-render-only`, com materia real do n8n, contexto preservado e link completo; nenhuma nova publicacao foi enviada a Meta neste ajuste.
- A publicacao antiga nao foi apagada nem republicada, pois isso exige autorizacao explicita do usuario.
- Commit funcional: `f370527` (`Exige contexto real nas pautas do Radar`).
- Deploy de producao: `dpl_GnmfBVsTkSxNYatKPdaxZKDwa9cz`.
- Producao respondeu `HTTP 200` e confirmou a versao `v5.11`.

## 2026-08-16 19:45 BRT

Corrigido o retorno involuntario do scroll vertical da landing.

- A causa era o `scrollIntoView` executado a cada troca automatica do carrossel de telas.
- O comando centralizava o botao da pagina atual, mas tambem fazia o navegador voltar verticalmente para o carrossel a cada 6,5 segundos.
- A navegacao agora usa `carouselNav.scrollTo` e movimenta apenas a faixa horizontal dos botoes do carrossel.
- O scroll vertical do visitante nao e mais alterado pela rotacao automatica ou pela abertura inicial da landing.
- Teste real em producao: a pagina permaneceu em `scrollY = 3000` durante a troca automatica de `Conteudo` para `Automacao do Direct`, com variacao vertical igual a zero.
- Commit funcional: `23c632e` (`Corrige retorno involuntario do scroll da landing`).
- Deploy de producao: `dpl_6UEgfMDkVaF1Wb3Tdmy1t9kC5Q7y`.
- Producao respondeu `HTTP 200`, sem `scrollIntoView` e com a rolagem interna confirmada.

## 2026-08-16 19:42 BRT

Removida da interface a lista tecnica `GitHub Actions - Ultimas execucoes`.

- O bloco duplicava as informacoes de saude ja apresentadas no Checklist operacional e no Vigia automatico.
- Tambem foram removidos o botao `Atualizar runs`, o atalho de GitHub Actions no cabecalho e o codigo de consulta/renderizacao que nao era mais usado.
- A consulta operacional continua preservada internamente nos workflows e nos registros do vigia; apenas a lista redundante deixou de ser exibida.
- O rodape agora descreve a operacao na nuvem sem mencionar runs tecnicos.
- Checklist, Vigia, recuperacao automatica, versao e manutencao continuam disponiveis na aba Sistema.
- Commit funcional: `0abd4ac` (`Remove lista duplicada de execucoes`).
- Deploy de producao: `dpl_3bbZncNTM8Btq1hN1oSRMYvZiwC6`.
- Producao respondeu `HTTP 200`, confirmou `v5.09`, ausencia da lista e presenca do Checklist e do Vigia.

## 2026-08-16 19:38 BRT

Corrigida a repeticao frequente das fotos pessoais nos carrosseis.

- A rotacao da conta `cliente-x` foi ampliada de quatro para sete fotos reais ja existentes no projeto.
- Cada publicacao passa a registrar `coverAvatar` e `avatarRotationStart` no historico tecnico.
- A foto usada na capa nao pode reaparecer nas seis publicacoes seguintes; primeiro as sete opcoes precisam circular.
- Os slides internos e o Story continuam variando a partir da foto de capa escolhida.
- A validacao automatica simula sete publicacoes e exige sete capas distintas (`avatarRotationGuard: ok`).
- `npm run validate-copy` passou com 20 packs, 54 packs automaticos e 74 selecoes.
- Um render real de teste escolheu `avatar-marcondes-rotation-02.png` e gerou cinco slides mais Story sem publicar na Meta.
- Commit funcional: `0f56d34` (`Evita repeticao de fotos nas capas`).
- Deploy de producao: `dpl_GuYANuJz6XfNMpCV8j4TJmMREx61`.
- Producao respondeu `HTTP 200`, confirmou `v5.08`, sete fotos no remoto e a trava de historico.

## 2026-08-16 19:34 BRT

Adicionada recuperacao guiada e automatica para erros do vigia.

- O erro exibido no print era o antigo `ENOENT` do Story; ele ja estava resolvido desde 19:23 BRT pelo run `31976129574` e nao existe erro aberto no estado atual.
- Quando uma nova checagem encontrar erro aberto, o painel aciona automaticamente uma nova tentativa do vigia para o administrador.
- Cada erro e acionado automaticamente apenas uma vez por sessao, evitando disparos repetidos ao atualizar a tela.
- Durante a tentativa, o cabecalho e o terminal mostram `Correcao automatica em andamento`.
- O Checklist e o painel do Vigia exibem `Corrigir automaticamente` e `Abrir detalhes do erro`.
- Ao clicar no indicador do cabecalho, a tela leva o usuario diretamente ao painel do erro.
- Versao publicada: `v5.07`.
- Commit funcional: `5c86c98` (`Adiciona recuperacao automatica ao vigia`).
- Deploy de producao: `dpl_EawWBYhxf9cv6tR3i3xj5XzMdVzA`.
- Producao respondeu `HTTP 200` e confirmou a versao e todos os novos controles.

## 2026-08-16 19:27 BRT

Checkpoint final da atualizacao das telas da plataforma na landing comercial.

- Commit funcional da landing: `d0ebb9e` (`Atualiza telas da plataforma na landing`).
- Estado operacional mais recente preservado no merge `b35555d`, incluindo a publicacao automatica das 19:26 BRT.
- Deploy final de producao: `dpl_DkbgqcivNVrU1hEGgiPaYMoytkxf`.
- A landing publica as dez capturas atuais com cachebuster `v=506` e textos explicando Radar, Direct por data, Agenda, Feed/Story, Bio, Clientes e Sistema.
- Producao respondeu `HTTP 200`; as dez imagens PNG foram verificadas individualmente com `HTTP 200` e seus tamanhos corretos.
- Landing confirmada em `https://cliente-x-instagram.vercel.app/plataforma`.

## 2026-08-16 19:23 BRT

Atualizada a demonstracao da plataforma na landing comercial.

- As dez capturas em `docs/uploads/platform-tabs/` foram refeitas diretamente no dashboard autenticado atual.
- Todas as imagens usam a mesma resolucao de captura, 1890 x 897 px.
- Foram atualizadas as telas: Visao geral, Conteudo, Automacao do Direct, Historico do Direct, Agenda, Grade semanal, Pagina Bio, Clientes, Cobranca e Sistema.
- O Historico do Direct mostra a nova navegacao lateral por datas.
- A Agenda aparece em largura integral; a Grade semanal mostra a postagem pronta e os formatos Feed/Story; a Bio mostra a previa ao vivo.
- Os textos do carrossel comercial foram atualizados para explicar Radar, filtros do Direct, banners, Bio, onboarding e operacao.
- Foi adicionado `?v=506` nas imagens e links ampliados para impedir a reutilizacao dos prints antigos pelo cache do navegador.
- O carrossel continua com 10 paginas e o JavaScript da landing passou na validacao de sintaxe.
- `npm run validate-copy` e `git diff --check` passaram.

Correcao preventiva realizada antes das capturas:

- O erro `ENOENT` do Story no GitHub Actions era causado por um caminho absoluto sendo resolvido uma segunda vez.
- O publicador agora preserva caminhos absolutos e resolve apenas caminhos relativos.
- Commit da correcao: `d572c48` (`Corrige caminho absoluto do Story no vigia`).
- Deploy da correcao: `dpl_EmgJdLddPQyCgeNgUTxxHgL1MoK1`.
- Confirmacao real depois da correcao: o run `2026-08-16-192225-slot-0` hospedou cinco slides e um Story no commit `6317bcf`.
- A Meta confirmou Feed `18061986080757054`, Story `18004000334979257` e permalink `https://www.instagram.com/p/DcHhtghkwu8/`.
- O estado da agenda e o erro do vigia foram atualizados no commit `9ebbea6`.
- As capturas de Visao geral e Sistema foram refeitas depois dessa confirmacao para nao divulgar o erro ja resolvido.

## 2026-08-16 19:43 BRT

Checkpoint de producao da navegacao por datas do Direct.

- Commit funcional: `e061466` (`Adiciona filtro de datas ao historico do Direct`).
- O commit operacional `c1d7721` (`Update Instagram schedule state`) foi preservado e integrado no merge `13e3cdd`.
- Branch `feature/modern-editorial-system` e `origin/main` sincronizadas em `13e3cdd`.
- A primeira tentativa de deploy recebeu `Not authorized`; a sessao Vercel foi confirmada e a nova tentativa concluiu normalmente.
- Deploy de producao: `dpl_9Ferz1KTrP9s4hMedXe1Pmr69FVb`.
- Producao respondeu `HTTP 200` e confirmou `v5.06`, largura integral, coluna de datas, opcao Todas as datas, filtro, paginacao filtrada e adaptacao mobile.

## 2026-08-16 19:40 BRT

O Historico do Direct passou a usar o espaco lateral como navegacao por datas.

- A aba ocupa toda a largura disponivel.
- A coluna lateral lista `Todas as datas` e cada dia que possui registros.
- Cada botao mostra quantidade total, envios concluidos e falhas daquele dia.
- Ao clicar em uma data, a lista exibe somente os registros selecionados e reinicia a paginacao na pagina 1.
- A paginacao e recalculada com base no filtro ativo.
- Ao trocar de conta, o filtro volta automaticamente para todas as datas.
- Em telas de ate 920 px, o seletor de datas aparece acima do historico em uma grade compacta.
- Versao visivel atualizada para `v5.06`.
- Sintaxe da API e do JavaScript inline, estrutura do filtro, `npm run validate-copy` e `git diff --check` passaram.

## 2026-08-16 19:31 BRT

- O vigia concluiu a atualizacao do historico e dos slots no commit `093506d` (`Update Instagram schedule state`).
- O estado final, incluindo os novos banners e a execucao automatica concluida, foi integrado em `0243de0`.

## 2026-08-16 19:30 BRT

Estado final sincronizado depois de uma execucao simultanea do vigia.

- O commit remoto `9c73612` hospedou Feed e Story do run `2026-08-16-190958-slot-0` enquanto o checkpoint era gravado.
- As seis imagens geradas pelo run foram preservadas e integradas pelo merge `3321d79`.
- O checkpoint documental dos novos controles e `9ec4ece`.
- Nenhum arquivo da publicacao automatica foi sobrescrito.

## 2026-08-16 19:28 BRT

Checkpoint de producao dos banners prontos e gerados da Grade semanal.

- Commit funcional: `96a7058` (`Adiciona banners prontos e gerados na grade semanal`).
- O commit operacional remoto `0ad34fb` (`Force Instagram watchdog 2026-08-16T22:09:14.597Z`) foi preservado.
- Integracao final: merge `90f1d3e`.
- Branch `feature/modern-editorial-system` e `origin/main` sincronizadas em `90f1d3e`.
- Deploy de producao: `dpl_DRZVBictSUUAbwMPBdN8v7hJitDt`.
- Producao respondeu `HTTP 200` e confirmou `v5.05`, uploads separados, dimensoes 1080 x 1350 e 1080 x 1920, botao de geracao dupla e funcao do gerador.

## 2026-08-16 19:25 BRT

A Grade semanal passou a aceitar banners prontos separados e tambem gerar automaticamente as duas artes do programa.

- Cada programa possui upload e URL independentes para `Feed 4:5` e `Story 9:16`.
- As dimensoes recomendadas ficam visiveis: 1080 x 1350 px para Feed e 1080 x 1920 px para Story.
- A previa ao vivo usa o banner correspondente ao formato selecionado.
- O botao `Gerar os 2 banners` cria JPEGs nas dimensoes oficiais usando marca, horario, titulo, chamada e apresentador preenchidos.
- As artes geradas sao enviadas pelo fluxo de upload existente, incluindo o fallback do GitHub quando necessario.
- Os campos `feedImagePath`, `feedImageUrl`, `storyImagePath` e `storyImageUrl` sao preservados pela API de producao e pelo servidor local.
- O publicador usa a arte pronta de Feed no carrossel e a arte pronta de Story na publicacao vertical; se nao houver Story pronto, o gerador tradicional continua funcionando.
- URLs remotas de Feed nao sao enviadas incorretamente ao hospedador de arquivos locais do GitHub.
- Compatibilidade mantida com os campos antigos `imagePath` e `imageUrl`.
- Versao visivel atualizada para `v5.05`.
- Sintaxe das APIs, servidor, publicador e JavaScript inline, estrutura dos controles, `npm run validate-copy` e `git diff --check` passaram.

## 2026-08-16 19:15 BRT

Checkpoint de producao da correcao das metricas de interacao.

- Commit funcional: `73b679d` (`Corrige leitura das interacoes recentes`).
- Durante a publicacao, `origin/main` recebeu o commit operacional `653d65b` (`Update weekly programs for cliente-x`).
- O commit operacional foi preservado e integrado pelo merge `26b1278`, sem sobrescrever a Grade semanal salva.
- Branch `feature/modern-editorial-system` e `origin/main` sincronizadas em `26b1278`.
- Deploy de producao: `dpl_4FPsFUL4xpA4XxFw6M9D1Cc8UV8y`.
- Producao respondeu `HTTP 200` e confirmou `v5.04`, resumo recente, separacao do ultimo post e interacoes confirmadas.
- O endpoint de metricas permanece corretamente protegido por autenticacao (`HTTP 401` sem sessao); os numeros reais sao consultados quando o usuario autenticado abre ou atualiza o painel.

## 2026-08-16 19:12 BRT

Corrigida a leitura do cartao de interacoes do Instagram.

- O cartao anterior consultava somente o post mais recente, mas o texto podia ser interpretado como o total da conta.
- A API agora busca os 10 posts mais recentes diretamente na Meta e cria um resumo de curtidas, comentarios e quantidade de posts com interacao.
- O titulo mostra a data e hora exatas da publicacao considerada como ultimo post.
- Alcance, salvos e interacoes sao identificados explicitamente como metricas somente do ultimo post.
- O total confirmado do ultimo post usa o maior valor entre `total_interactions` da Meta e a soma publica ja confirmada de curtidas, comentarios e salvos, evitando exibir zero quando a metrica agregada estiver atrasada.
- O painel local e a API de producao usam a mesma regra.
- Versao visivel atualizada para `v5.04`.
- Sintaxe das APIs, servidor local e JavaScript inline, validacao editorial e `git diff --check` passaram.

## 2026-08-16 19:07 BRT

Checkpoint de producao da postagem pronta na Grade semanal.

- Commit funcional: `23c96ca` (`Adiciona previa da postagem na grade semanal`).
- Branch `feature/modern-editorial-system` e `origin/main` sincronizadas.
- Deploy de producao: `dpl_3kZ9hfT17Naq7MasdqiPS9RM5zAh`.
- Alias confirmado: `https://cliente-x-instagram.vercel.app`.
- Producao respondeu `HTTP 200` e confirmou `v5.03`, largura integral da Grade semanal, workspace, previa ao vivo, formatos Feed 4:5 e Story 9:16 e funcao de atualizacao em tempo real.

## 2026-08-16 19:05 BRT

A aba `Grade semanal` passou a mostrar a postagem pronta ao lado do formulario.

- A visualizacao agora usa toda a largura, eliminando a area vazia a direita.
- O editor fica a esquerda e a previa ao vivo permanece visivel a direita durante a rolagem.
- A previa atualiza titulo, chamada, apresentador, dias, horario, marca e imagem do programa conforme os campos sao editados.
- A imagem anexada ou informada por URL passa a compor o fundo da arte, com tratamento visual para manter os textos legiveis.
- Foram adicionados os formatos `Feed 4:5` e `Story 9:16` com alternancia imediata.
- Ao focar outro programa cadastrado, a previa passa a representar esse programa.
- Em telas de ate 920 px, a postagem pronta vai para baixo do editor.
- Versao visivel atualizada para `v5.03`.
- Sintaxe da API e do JavaScript inline, IDs da previa, regras de layout, `npm run validate-copy` e `git diff --check` validados com sucesso.

## 2026-08-16 19:02 BRT

Checkpoint de producao da Agenda em largura integral.

- Commit funcional: `eaecef0` (`Corrige largura da aba Agenda`).
- Branch `feature/modern-editorial-system` e `origin/main` sincronizadas.
- Deploy de producao: `dpl_F2cr6sqjsfKpQsNXeraxAFwfenyG`.
- Alias confirmado: `https://cliente-x-instagram.vercel.app`.
- Producao respondeu `HTTP 200` e confirmou `v5.02`, a regra de largura integral da Agenda, a grade principal em 100%, os 13 slots e as regras responsivas.
- A verificacao visual automatizada chegou corretamente ao login protegido; a confirmacao final da estrutura foi feita no HTML entregue pela producao, sem contornar a autenticacao.

## 2026-08-16 19:00 BRT

Corrigida a largura da aba `Agenda`, que ainda herdava a grade antiga de duas colunas e deixava uma grande area vazia a direita.

- A visualizacao Agenda agora ocupa toda a largura disponivel do painel.
- A linha dos 13 horarios ganhou o espaco horizontal necessario para evitar o corte do ultimo slot em telas desktop.
- Os cards de hoje, amanha, Radar, previa e edicao de horarios continuam no mesmo fluxo, agora usando a area central completa.
- O comportamento responsivo de uma coluna permanece preservado para telas menores.
- Versao visivel atualizada para `v5.02`.
- Sintaxe da API e do JavaScript inline validada.
- `npm run validate-copy` passou com 20 packs, 54 packs automaticos, 74 selecoes, protecao de duplicidade e balanceamento de fontes em `ok`.
- `git diff --check` passou.

## 2026-08-16 18:52 BRT

Checkpoint de producao da previa lateral da Pagina Bio.

- Commit funcional: `069ab71` (`Adiciona previa lateral ao editor da Bio`).
- Branch `feature/modern-editorial-system` e `origin/main` atualizadas no mesmo commit.
- Deploy de producao: `dpl_9PhjEMu3exUFZmNGJ5JfHY8jxRKg`.
- Alias confirmado: `https://cliente-x-instagram.vercel.app`.
- Producao respondeu `HTTP 200` e confirmou `v5.01`, largura integral da aba Bio, editor/previa lado a lado, rotulo `Previa ao vivo` e quebra responsiva em 920 px.

## 2026-08-16 18:50 BRT

A aba `Pagina Bio` passou a usar o espaco lateral como previa ao vivo da pagina publica.

Alteracoes:

- A aba Bio ocupa toda a largura disponivel, eliminando a coluna direita vazia.
- O painel foi dividido internamente em editor a esquerda e previa a direita.
- A previa fica dentro de uma moldura de celular e permanece visivel com `position: sticky` enquanto o usuario percorre os campos e botoes.
- A altura acompanha a janela do navegador, com limite confortavel para visualizar a pagina real.
- Textos, foto, links e botoes continuam atualizando a previa durante a edicao pelo mecanismo existente.
- O botao `Atualizar previa` permanece disponivel e a mensagem explica que salvar publica as alteracoes.
- Em telas de ate 920 px, a previa passa para baixo do editor; no celular recebe altura reduzida sem perder o conteudo.
- Versao visivel atualizada para `v5.01`.

Validacao:

- `node --check api/state.js`: passou.
- JavaScript inline do dashboard: sintaxe valida.
- Estrutura confirmou um unico painel Bio, iframe, botao de atualizacao e os contenedores de editor/previa.
- Regra de largura integral para a aba Bio confirmada.
- `npm run validate-copy`: passou com protecoes de duplicidade e balanceamento em `ok`.
- `git diff --check`: passou.

## 2026-08-16 18:46 BRT

Reorganizada a visao operacional para eliminar a coluna estreita, preencher a area central e mostrar o Radar e os principais recursos da plataforma.

Alteracoes:

- A aba `Sistema` passa a ocupar toda a largura, com os paineis organizados verticalmente em vez de comprimidos no canto direito.
- Foi criada a secao `O que esta funcionando nesta conta`, com seis cartoes dinamicos.
- Os cartoes mostram: Radar editorial, conteudo/criativos, agenda/publicacao, automacao do Direct, Pagina Bio e clientes/onboarding.
- O Radar exibe quantidade de fontes, estado da pesquisa, protecao contra repeticao e exigencia do link original.
- Conteudo mostra packs e horarios; agenda explica publicacao na nuvem e vigias; Direct mostra automacoes e entregas; Bio mostra botoes; clientes mostra empresas e conexoes.
- O Checklist operacional saiu da Visao geral e foi agrupado com a aba Sistema, junto dos workflows, vigia, versao e manutencao.
- A checkagem ganhou verificacoes de Radar, publicacao na nuvem, Direct, Bio e onboarding, alem de conteudos, duplicidade, vigia e Meta.
- O terminal passa automaticamente por todas essas verificacoes e informa o progresso no cabecalho.
- A grade de recursos usa tres colunas no desktop, duas em tablet e uma no celular.
- Foram corrigidos os IDs do layout anterior: `clientPortfolioPanel` agora pertence a Carteira de clientes e `newAccountPanel` ao formulario Cadastrar nova empresa.
- Versao visivel atualizada para `v5.00`.

Validacao:

- `node --check api/state.js`: passou.
- JavaScript inline do dashboard: sintaxe valida.
- IDs unicos e associacao dos paineis Clientes foram verificados automaticamente.
- `npm run validate-copy`: passou com `duplicateHistoryGuard` e `sourceBalanceGuard` em `ok`.
- `git diff --check`: passou.

Checkpoint e producao:

- Commit funcional: `f5ec93f` (`Amplia visao operacional da plataforma`), enviado para `origin/main` e `origin/feature/modern-editorial-system`.
- Deploy: `dpl_654XqDMJD5r6jWTYFb5AEgQEcFwF`, associado a `https://cliente-x-instagram.vercel.app`.
- Producao respondeu `HTTP 200` e confirmou `v5.00`, largura integral do Sistema, cartoes de Radar, Direct, Bio e onboarding e Checklist associado a essa aba.

## 2026-08-16 18:42 BRT

Reorganizada a aba `Clientes` para eliminar o grande espaco vazio e tornar o cadastro de empresas mais guiado.

Alteracoes:

- Quando `Clientes` esta ativa, o conteudo passa a ocupar uma unica coluna com toda a largura disponivel.
- A abertura da pagina mostra quatro etapas: cadastrar empresa, enviar convite, cliente conectar a Meta e conferir/ativar.
- `Adicionar conta` foi renomeado para `Cadastrar nova empresa` e recebeu explicacao direta sobre o resultado do processo.
- O formulario usa duas colunas no desktop e uma coluna no celular.
- Os campos foram separados visualmente em quatro grupos: responsavel/identificacao, plano, Instagram/direcao da marca e criacao do convite.
- O campo de Instagram deixa claro que e opcional e pode ser identificado durante a conexao.
- O botao principal agora diz `Criar empresa e gerar convite`.
- O convite ganhou destaque verde e permanece logo depois da criacao da empresa.
- `Usuarios por conta` tambem usa melhor a largura e fica abaixo do onboarding, como administracao secundaria.
- Em telas menores, etapas, formulario e usuarios retornam automaticamente para uma coluna.
- Versao visivel atualizada para `v4.99`.

Validacao:

- `node --check api/state.js`: passou.
- JavaScript inline do dashboard: sintaxe valida.
- IDs estruturais do novo layout aparecem uma unica vez.
- `npm run validate-copy`: passou com as protecoes de duplicidade e balanceamento de fontes em `ok`.
- `git diff --check`: passou.
- Preview Vercel criado em `dpl_egniMxiHNJGBnY72Rp6tQZkH1AcQ`; a tela publica de login carregou corretamente. A area autenticada foi validada pela estrutura e CSS porque a sessao nao e compartilhada com o dominio de preview.

Checkpoint e producao:

- Commit funcional: `f35b211` (`Reorganiza cadastro de empresas no painel`), enviado para `origin/main` e `origin/feature/modern-editorial-system`.
- Deploy de producao: `dpl_783HGZmg6Zy311LxLDvXC6YeNz9R`, associado a `https://cliente-x-instagram.vercel.app`.
- Producao respondeu `HTTP 200` e confirmou `v4.99`, largura integral em Clientes, quatro passos guiados, CTA novo e regras responsivas.

## 2026-08-16 18:35 BRT

Corrigido o rodizio do Radar que concentrava publicacoes em `AWS`, `n8n` e `OpenAI`, apesar de existirem mais fontes cadastradas.

Diagnostico:

- Existem `11` fontes padrao cadastradas, mas a selecao nao era aleatoria nem equilibrada: as noticias eram ordenadas por recencia e intercaladas antes do filtro final.
- As palavras-chave configuradas em ingles eliminavam muitos titulos em portugues de G1 Tecnologia, Olhar Digital e TecMundo.
- O historico local confirmou concentracao nas ultimas 11 pautas: 5 AWS, 3 n8n, 2 OpenAI e apenas uma outra origem.
- O watchdog reserva nao persistia `publication-history.json`; por isso uma publicacao feita por ele podia ser ignorada na escolha seguinte.

Correcao:

- O filtro reconhece equivalentes em portugues para IA, inteligencia artificial, automacao, agentes, fluxos, empresas, clientes, vendas, operacao, dados e produtividade.
- A selecao real agora ordena as fontes pela menor quantidade de publicacoes no historico e pela origem usada ha mais tempo.
- Dentro da fonte escolhida, a pauta continua variando por data e horario, preservando bloqueio de URL, capa e conteudo repetidos.
- O watchdog reserva agora grava `publication-history.json`, usando o mesmo grupo de concorrencia do workflow principal.
- O teste de copia ganhou a verificacao `sourceBalanceGuard` para impedir regressao do balanceamento.
- Versao visivel atualizada para `v4.98` no backend e no dashboard.

Validacao:

- `node --check` passou em `lib/editorial-research.js` e `publish-carousel.mjs`.
- `npm run validate-copy` passou com `duplicateHistoryGuard: ok` e `sourceBalanceGuard: ok`.
- Pesquisa real de 7 dias encontrou `34` noticias elegiveis em `6` fontes: G1 Tecnologia, Olhar Digital, TecMundo, n8n, AWS Machine Learning e OpenAI.
- Nenhuma das 11 fontes consultadas retornou erro; as demais nao tinham pauta elegivel no filtro e na janela atuais.
- Nenhuma publicacao real foi disparada durante esta validacao.

Checkpoint e producao:

- Commit funcional: `763bba1` (`Balanceia fontes do Radar pelo historico`), enviado para `origin/main` e `origin/feature/modern-editorial-system`.
- Deploy: `dpl_ELgHHpnEPjxatF5wCfGj1k2bZYs5`, associado a `https://cliente-x-instagram.vercel.app`.
- Producao respondeu `HTTP 200` e confirmou a versao `v4.98`.

## 2026-08-16 18:30 BRT

Implementado o onboarding seguro de novas empresas sem compartilhamento de login ou senha do Instagram.

Alteracoes:

- O cadastro de uma empresa passa a criar o estado `awaiting_connection` e retorna um convite assinado, valido por 48 horas.
- O @ do Instagram deixou de ser obrigatorio no cadastro; a conta pode ser identificada durante a autorizacao oficial.
- Nova pagina publica `/ativar` apresenta a empresa, explica que a senha nao e compartilhada e mostra um checklist de ativacao.
- O cliente usa `Conectar meu Instagram` e autoriza diretamente pelo Instagram Login da Meta.
- O OAuth solicita apenas as permissoes usadas pela plataforma: perfil basico profissional, publicacao, comentarios e mensagens.
- O callback valida assinatura, validade, empresa e, quando informado, o @ esperado antes de aceitar a conta.
- O token de longa duracao e o ID profissional sao gravados nos envs exclusivos da empresa; nenhum token e devolvido ao navegador.
- O painel ganhou campo para copiar o convite e botao para gerar outro convite para a conta selecionada.
- A carteira de clientes diferencia `Instagram conectado pela Meta` de `aguardando autorizacao do cliente`.
- `INSTAGRAM_APP_ID` e `INSTAGRAM_APP_SECRET` passaram a aparecer nos acessos administraveis e no `.env.example`.
- Versao visivel atualizada em conjunto para `v4.97`.

Validacoes:

- `node --check api/state.js`: passou.
- JavaScript inline de `docs/dashboard.html` e `docs/ativar.html`: sintaxe valida.
- `npm run validate-copy`: passou com `20` packs, `54` packs automaticos, `74` selecoes e protecao de duplicidade `ok`.
- Teste direto da API: convite valido retornou `HTTP 200` e a empresa correta; convite adulterado retornou `HTTP 400`; tentativa de conexao sem App Meta configurado foi redirecionada com erro seguro.
- `git diff --check`: passou.

Configuracao externa pendente:

- A producao ja possui `INSTAGRAM_APP_SECRET`, mas ainda nao lista `INSTAGRAM_APP_ID`; cadastrar o ID do mesmo aplicativo Meta antes da primeira autorizacao real.
- Registrar na Meta a URL de retorno `https://cliente-x-instagram.vercel.app/api/state?instagram=callback` e concluir o acesso avancado das permissoes usadas para atender empresas externas.
- Nenhuma senha de Instagram deve ser solicitada ao cliente.

Deploy/publicacao:

- Commit funcional: `336dd34` (`Adiciona onboarding seguro para novas empresas`), enviado para `origin/main` e `origin/feature/modern-editorial-system`.
- Deploy Vercel: `dpl_HJaUzpGEEGH3qfmddaVRnkRFgDz5`, pronto e associado a `https://cliente-x-instagram.vercel.app`.
- Producao confirmou `HTTP 200` no dashboard e em `/ativar`, versao `v4.97`, controles de convite e botao `Conectar meu Instagram`.
- A API de producao recusou convite invalido com `HTTP 400`.
- Instagram real: nenhuma publicacao foi criada; esta alteracao trata apenas do cadastro e da autorizacao de empresas.

## 2026-08-16 18:15 BRT

O resultado da checkagem operacional passou a aparecer em tempo real no cabecalho da plataforma.

Alteracao:

- Um indicador acessivel foi adicionado abaixo da versao e da identidade da conta no cabecalho.
- Ao iniciar, ele mostra `Verificando plataforma...` com ponto amarelo animado.
- Durante a execucao, informa `Etapa N de total` e o nome da verificacao atual.
- Quando termina sem erro, fica verde e mostra `Checkagem: tudo OK`.
- Quando encontra problema, fica vermelho e mostra `Atencao necessaria`; uma falha de carregamento mostra `Nao foi possivel verificar`.
- O resultado final registra o horario de Brasilia com horas, minutos e segundos.
- O indicador usa `role=status` e `aria-live=polite` para comunicar mudancas sem interromper a navegacao.

Validacao e deploy:

- JavaScript inline: sintaxe valida.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- Commit funcional: `94fa661` (`Exibe checkagem em tempo real no cabecalho`).
- Deploy Vercel: `dpl_CLRu7JraFD5fe9AamWM3x3rbDunE`, alias `https://cliente-x-instagram.vercel.app`.
- Producao respondeu `HTTP 200` e confirmou um indicador, regiao acessivel, progresso por etapa, estados finais, fuso `America/Sao_Paulo` e animacao de verificacao.
- A sessao autenticada continuava expirada; o comportamento foi validado no codigo servido, mas a aparencia final dentro do painel logado ainda pode ser conferida na proxima sessao.

## 2026-08-16 18:11 BRT

O Checklist operacional ganhou um segundo botao para repetir a checkagem diretamente abaixo do terminal.

Alteracao:

- O botao `Realizar nova checagem` aparece abaixo do resultado quando a execucao termina.
- Ele chama a mesma funcao completa usada por `Atualizar checagem` no cabecalho.
- Durante uma nova execucao, o botao inferior fica oculto para evitar cliques duplicados e reaparece no final, inclusive quando ocorre erro.
- O estilo ocupa toda a largura do terminal, facilitando o uso em telas pequenas depois de `CHECKAGEM CONCLUIDA`.

Validacao e deploy:

- JavaScript inline: sintaxe valida.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- Commit funcional: `618420b` (`Adiciona botao para repetir checkagem operacional`).
- Deploy Vercel: `dpl_tYZu2ZgB1pt4vq3th7sgDGyEV5F5`, alias `https://cliente-x-instagram.vercel.app`.
- Producao respondeu `HTTP 200` com um unico `repeatHealthCheck`, texto correto, listener para `runOperationalCheck`, ocultacao durante a execucao e exibicao no final.
- A sessao autenticada do navegador havia expirado durante a prova final; portanto, o clique real dentro do painel logado ainda deve ser conferido na proxima sessao autenticada.

## 2026-08-16 18:07 BRT

A pagina de configuracao da automacao de comentarios para Direct foi adicionada ao carrossel da landing.

Alteracao:

- A nova captura real mostra `Meta conectada`, automacao ativa, palavras-chave, regra de correspondencia, material e perfil editorial da conta.
- A imagem foi enquadrada em `1460 x 680` para preencher o slide e manter os campos principais legiveis.
- O novo slide aparece depois de `Conteudo` com o selo `Pagina 3 de 10 · Automacao do Direct`.
- O antigo `Historico do Direct` foi preservado como pagina separada e passou para a posicao 4.
- Todos os contadores, indices e seletores foram atualizados de 9 para 10 paginas.

Validacao e deploy:

- JavaScript inline: sintaxe valida.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- Teste local: `10` slides, `10` seletores, `10` imagens presentes e nenhum overflow horizontal.
- Commit funcional: `b11fae5` (`Adiciona pagina da automacao do Direct na landing`).
- Deploy Vercel: `dpl_CDnXwmFuNkMwFyL19wz3sXu9fgoH`, alias `https://cliente-x-instagram.vercel.app`.
- Producao: pagina 3 carregada em `1460 x 680`, seletor ativo e trilho confirmado em `translateX(-200%)`.

## 2026-08-16 18:03 BRT

O slide da Pagina Bio passou a usar a captura e o endereco publico real informados pelo usuario.

Alteracao:

- A captura foi refeita diretamente em `https://cliente-x-instagram.vercel.app/bio`.
- A imagem real em desktop possui `1905 x 904` e preenche o carrossel sem as faixas laterais da captura estreita anterior.
- O selo do slide agora informa `Pagina 6 de 9 · Bio real`.
- O titulo foi atualizado para `Pagina Bio real e pronta para o publico`.
- O botao `Abrir Bio real` aponta para `https://cliente-x-instagram.vercel.app/bio`; o endereco antigo `/docs/bio.html` foi removido da landing.

Validacao e deploy:

- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- JavaScript inline: sintaxe valida.
- Commit funcional: `891908b` (`Usa pagina Bio publica real na landing`).
- Deploy Vercel: `dpl_3HSF4GJ58FnqoPqPnZ9PpoADF6ff`, alias `https://cliente-x-instagram.vercel.app`.
- Producao: imagem `1905 x 904` carregada, link `/bio` confirmado, endereco antigo ausente e nenhum overflow horizontal.

## 2026-08-16 17:59 BRT

As capturas do Historico do Direct e da Pagina Bio foram refeitas para evitar areas vazias e mostrar exemplos mais claros na landing.

Alteracao:

- O Historico do Direct agora mostra exemplos reais de envios confirmados, incluindo palavra-chave, horario e status `Enviado`.
- A captura foi reenquadrada em `1080 x 380` para preencher o slide sem a grande area vazia anterior.
- A Pagina Bio deixou de mostrar o formulario de edicao e agora apresenta o resultado final visto pelo publico.
- A Bio pronta exibe foto, titulo, apresentacao, oferta principal e botoes de acesso.
- O link do slide mudou para `Abrir Bio pronta` e aponta diretamente para `/docs/bio.html`.

Validacao e deploy:

- JavaScript inline: `1` bloco com sintaxe valida.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- Teste local: Historico e Bio carregados, textos atualizados e nenhum overflow horizontal.
- Commit funcional: `44e37ab` (`Melhora exemplos do Direct e mostra Bio pronta`).
- Deploy Vercel: `dpl_3FKTmKBdwnwu1BALr1irnPc1kiJ8`, alias `https://cliente-x-instagram.vercel.app`.
- Producao: Historico confirmado em `1080 x 380`; Bio confirmada em `339 x 735`, com status `Pagina 6 de 9 · Bio pronta` e link publico correto.

## 2026-08-16 17:53 BRT

O carrossel de demonstracao da landing passou a mostrar capturas reais de todas as nove abas da plataforma autenticada.

Alteracao:

- Foram capturadas as abas `Visao geral`, `Conteudo`, `Historico do Direct`, `Agenda`, `Grade semanal`, `Pagina Bio`, `Clientes`, `Cobranca` e `Sistema`.
- Cada slide possui contador `Pagina N de 9`, titulo, explicacao do que a area faz e link para ampliar a captura.
- Os seletores das nove abas possuem rolagem horizontal e acompanham automaticamente a pagina ativa.
- As imagens usam enquadramento integral para facilitar a leitura sem cortar partes importantes do painel.
- O Historico do Direct foi enquadrado sem nomes de destinatarios, e a captura de Cobranca exclui o painel lateral com fragmentos mascarados de configuracao.
- Nenhum token, senha ou chave completa foi publicado na landing.

Validacao e deploy:

- JavaScript inline: `1` bloco com sintaxe valida.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- Teste local: `9` slides, `9` seletores, nenhum arquivo ausente e nenhum overflow horizontal.
- Commit funcional: `a9a8bd6` (`Exibe todas as abas reais da plataforma`).
- Deploy Vercel: `dpl_7QBXZr9rJnSFY3RVB84w3y5urSx7`, alias `https://cliente-x-instagram.vercel.app`.
- Producao: nove imagens carregadas; navegacao confirmada ate `Pagina 9 de 9 · Sistema` com `translateX(-800%)`.

## 2026-08-16 17:47 BRT

A oferta da landing ganhou destaque visual para o volume diario e uma nova secao de credibilidade com provas verificaveis e garantia de implantacao.

Alteracao:

- `Mais de 12 carrosseis por dia` e `12 Stories por dia` agora aparecem em dois blocos numericos maiores no cartao da oferta.
- A implantacao gratuita permanece destacada logo abaixo dos volumes.
- Como nao ha depoimentos reais autorizados no projeto, nenhum nome, empresa ou avaliacao ficticia foi criado.
- A nova secao de credibilidade utiliza publicacoes reais do Instagram, confirmacao tecnica no painel e links que o visitante pode conferir.
- Foi adicionada uma garantia de implantacao: a configuracao continua sem custo adicional ate marca, agenda e publicacao de teste estarem confirmadas.
- O texto delimita que a garantia cobre a implantacao tecnica e nao promete alcance, seguidores, engajamento ou vendas.

Validacao e deploy:

- JavaScript inline: `1` bloco com sintaxe valida.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- Commit funcional: `5b12678` (`Reforca volume diario e garantia da oferta`), integrado ao remoto em `7170303`.
- Deploy Vercel: `dpl_9LSizZaufbmruwMvhKYerNQphXzf`, alias `https://cliente-x-instagram.vercel.app`.
- Producao respondeu `HTTP 200` com `2` blocos de volume, `3` cartoes de credibilidade, garantia e ressalva de resultados presentes.

## 2026-08-16 17:40 BRT

A captura geral do painel no topo da landing foi substituida por uma demonstracao visual do funcionamento real do Radar editorial.

Alteracao:

- O hero agora explica que o Radar encontra pautas atuais antes de criar o conteudo.
- O fluxo apresenta quatro etapas: pesquisa de fontes recentes, validacao da origem e atualidade, prevencao de assuntos e capas repetidas e adaptacao da pauta para o negocio.
- A busca progressiva de `7`, `15` e `30` dias e a exigencia de link rastreavel foram comunicadas sem promessas alem do comportamento atual da automacao.
- O resultado visual informa que a pauta aprovada segue para carrossel, Story, legenda e agenda.
- A composicao anterior com a captura geral do dashboard foi removida apenas do hero; o carrossel de paginas reais da plataforma continua na secao de demonstracao.

Validacao e deploy:

- JavaScript inline: `1` bloco com sintaxe valida.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- Teste local: quatro etapas visiveis, sem overflow horizontal e com a composicao completa na primeira tela do desktop.
- Commit funcional: `97d331f` (`Destaca funcionamento do Radar na landing`).
- Deploy Vercel: `dpl_2QaeXkRvQv1UkiAZJeX8de8CVS4D`, alias `https://cliente-x-instagram.vercel.app`.
- Producao: Radar visivel, quatro etapas confirmadas, captura antiga ausente do hero e nenhum overflow horizontal.

## 2026-08-16 17:36 BRT

A captura unica do editor na landing foi transformada em um carrossel de paginas reais da plataforma.

Alteracao:

- O visitante pode alternar entre `Visao geral` e `Editor de conteudo`.
- A primeira pagina apresenta agenda, vigia automatico, conta ativa e publicacao confirmada.
- A segunda mostra a previa do post e os campos usados para ajustar o conteudo e preservar a identidade da marca.
- O carrossel possui setas, botoes nomeados, indicadores `Pagina 1 de 2` e `Pagina 2 de 2`, textos explicativos e links para ampliar cada captura.
- A troca ocorre automaticamente a cada `6,5 segundos`, pausa ao passar o mouse ou focar os controles e respeita `prefers-reduced-motion`.
- O estado acessivel usa `aria-hidden` nos slides e `aria-current` nos seletores.

Validacao e deploy:

- JavaScript inline: sintaxe valida.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- Teste local: selecao manual mudou de `Visao geral` para `Editor de conteudo`, com `translateX(-100%)` e sem erros de console.
- Commit funcional: `e3a6956` (`Adiciona carrossel de paginas da plataforma`).
- Deploy Vercel: `dpl_HSxN7MUai11bwMCxwhMR89JVrW8o`, alias `https://cliente-x-instagram.vercel.app`.
- Producao: dois slides confirmados, troca manual aprovada, componente antigo removido e nenhum erro de console.

## 2026-08-16 17:32 BRT

As duas artes isoladas da landing foram substituidas por publicacoes reais incorporadas do Instagram.

Alteracao:

- A secao de provas agora exibe dois carrosseis publicados no perfil `@marcondes.machado.oficial`, com cabecalho, perfil, navegacao do carrossel e link oficial do Instagram.
- Publicacoes utilizadas: `https://www.instagram.com/p/DcHMqdWE3bI/` e `https://www.instagram.com/p/DcHDsOKkzvp/`.
- Cada prova possui legenda clara e um link independente `Abrir post` como alternativa.
- Os antigos arquivos de previa de feed e Story deixaram de ser usados nessa secao.
- Um permalink indisponivel foi detectado durante a validacao e substituido antes do deploy.

Validacao e deploy:

- Os dois embeds foram abertos e inspecionados com conteudo real do perfil.
- Landing local: dois cards, sem mensagem de post removido e sem erros de console.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- Commit funcional: `a52b378` (`Exibe publicacoes reais do Instagram na landing`).
- Deploy Vercel: `dpl_HZ8gkZgV9aBXyMryrsnGbf3KUsod`, alias `https://cliente-x-instagram.vercel.app`.
- Producao: dois embeds confirmados, nenhuma imagem antiga da secao, nenhuma mensagem de link quebrado e nenhum erro de console.

## 2026-08-16 17:24 BRT

Landing comercial simplificada a partir da perspectiva de um usuario novo, com publicacao e validacao em producao.

Clareza comercial:

- A abertura agora explica imediatamente que a Nerion Social automatiza conteudo para Instagram.
- Nova headline: `Conteudo criado, agendado e publicado para a sua empresa.`
- O primeiro paragrafo informa, sem jargao, que a plataforma pesquisa pautas, cria carrosseis, Stories e legendas e publica automaticamente seguindo a marca.
- O botao `Quero ver uma demonstracao` foi movido para antes do preco e aparece na primeira tela do celular.
- A faixa inicial passou a responder para quem e o produto, o que ele cria, como publica e como funciona o Direct.
- Recursos tecnicos foram reescritos como resultados compreensiveis; a responsabilidade ficou clara: configuracao assistida na implantacao, execucao automatica pela plataforma e acompanhamento pelo cliente.
- Uma secao redundante e a pergunta isolada sobre AIDA foram removidas. O texto visivel caiu de aproximadamente `6275` para `5477` caracteres e a pagina ficou cerca de `800 px` menor no desktop.
- A oferta aprovada de `R$ 397/mes` por `R$ 197/mes`, implantacao gratuita, volumes, plano menor e licenca personalizada foram preservados.

Validacao e deploy:

- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- JavaScript inline: sintaxe valida.
- Desktop e celular: sem overflow horizontal no teste local, CTA antes da oferta e nenhum erro de console.
- Commit funcional: `625472a` (`Simplifica landing para novos usuarios`).
- Integracao com atualizacao automatica remota: `6f69153`.
- Deploy Vercel: `dpl_5bpMzYJdWkBe4xPMkk9G7csZEjtS`, com alias `https://cliente-x-instagram.vercel.app`.
- Producao confirmou HTTP `200`, nova headline, novo CTA e ausencia da headline anterior.

Confirmacao adicional do Direct:

- O comentario real `QUERO` acionou a automacao `Instagram automatico` em 2026-08-16 17:17 BRT.
- Entrega privada: `sent`, com `messageId` e `recipientId` registrados.
- Resposta publica: confirmada pelo ID `18089055641387771`.
- O teste operacional que estava pendente para a palavra-chave `Quero` foi concluido com sucesso.

## 2026-08-16 17:15 BRT

Regra permanente de checkpoint definida pelo usuario.

- Toda atualizacao concluida deve ser gravada automaticamente na memoria do projeto.
- `HISTORICO.md` deve receber uma nova entrada e `STATUS_ATUAL.md` deve refletir o estado final, sem exigir que o usuario repita o pedido para salvar.
- O checkpoint deve incluir data BRT, branch, commits, alteracoes, validacoes, deploy/publicacao, pendencias e proximo passo.
- Quando a alteracao for enviada ao remoto, o checkpoint correspondente tambem deve ser sincronizado.
- `README.md` e `COMO_ATUALIZAR.md` foram atualizados para tornar esta regra parte do procedimento oficial do projeto.

## 2026-08-16 17:14 BRT

Ativada a segunda automacao de comentario para Direct depois que o usuario informou que a palavra-chave `Quero` nao havia funcionado.

Diagnostico e correcao:

- A automacao `Instagram automatico` estava cadastrada com `enabled: false`; por isso o webhook a ignorava antes da comparacao da palavra-chave e nenhum erro era registrado no historico.
- A campanha foi ativada mantendo `matchMode: similar`, sem restricao de publicacao e com destino `https://cliente-x-instagram.vercel.app/plataforma#inicio`.
- As formas `Quero`, `QUERO` e `quero.` continuam normalizadas para a mesma palavra.
- Commit: `a2ed859` (`Ativa automacao de Direct para Quero`).
- `origin/main` e `origin/feature/modern-editorial-system` foram sincronizados nesse commit.

Validacao:

- JSON carregado com sucesso e campanha confirmada como ativa.
- `node --check api/state.js`: passou.
- `npm run validate-copy`: passou com `74` selecoes automaticas e protecao de duplicidade `ok`.
- O arquivo publico do `main` no GitHub confirmou `enabled: true` para `Instagram automatico`.
- Ainda falta o teste humano final: comentar `Quero` em uma publicacao e confirmar o Direct e o registro no historico.

## 2026-08-16 17:08 BRT

Retomada concluida a partir do checkpoint do painel e confirmacao da nova checkagem operacional automatica.

Alteracao recuperada:

- O commit `205a860` adicionou ao bloco `Checklist operacional` o botao `Atualizar checagem` e um terminal visual que mostra cada verificacao como `OK`, `ATENCAO` ou `ERRO`.
- O terminal encerra com um resultado explicito: `CHECKAGEM CONCLUIDA: TUDO OK`, `ERRO ENCONTRADO` ou falha de finalizacao.
- O commit `b584a48` passou a executar a checkagem automaticamente tanto ao restaurar uma sessao valida quanto depois de um novo login.
- O botao permanece disponivel para repetir a verificacao manualmente.

Validacao:

- Repositorio correto: `cliente-x-instagram-modern`, branch `feature/modern-editorial-system`.
- `HEAD`, `origin/main` e `origin/feature/modern-editorial-system` apontam para `b584a48`; workspace estava limpo antes deste registro.
- `node --check api/state.js`: passou.
- `npm run validate-copy`: passou com `20` packs, `54` packs automaticos e `74` selecoes automaticas; protecao de duplicidade `ok`.
- Producao confirmou o botao, o terminal e as chamadas automaticas no login e na restauracao de sessao.
- A pagina estava na tela protegida de login; por seguranca, nenhuma credencial salva foi procurada ou reutilizada. Por isso, a conclusao visual autenticada `TUDO OK` ainda deve ser conferida dentro de uma sessao do usuario.

Deploy/publicacao:

- Novo deploy nesta retomada: nao. O codigo dos commits `205a860` e `b584a48` ja foi encontrado no HTML servido por `https://cliente-x-instagram.vercel.app/`.
- Instagram real: nao; esta mudanca e apenas operacional no dashboard.

## 2026-08-16 16:07 BRT

Checkpoint do Radar salvo a pedido do usuario depois da correcao de duplicidade visual e da implantacao do rodizio de fontes.

Protecao contra capas repetidas:

- Foi confirmado que pautas e links diferentes podiam receber a mesma frase de capa, fazendo duas publicacoes parecerem duplicadas no perfil.
- O Radar agora compara a chamada de capa com as ultimas `50` publicacoes retornadas pela Meta e com o historico local.
- Cada publicacao nova registra `coverTitle` em `publication-history.json`.
- Fonte diferente nao autoriza mais repetir a mesma chamada visual; o seletor procura outra pauta antes de publicar.
- O conjunto de chamadas foi ampliado, mantendo linguagem humana e foco em dores reais da empresa.
- Commit da correcao: `be1ab0d` (`Impede repeticao de capas no Radar`).

Rodizio de fontes:

- As pautas elegiveis agora sao agrupadas e intercaladas por fonte, em vez de serem ordenadas apenas pela data global.
- O Radar impede duas publicacoes pesquisadas consecutivas da mesma fonte.
- Continuam ativos os filtros de nicho, atualidade, link ja utilizado, titulo de capa e conteudo repetido.
- Teste real em janela de `30 dias` encontrou rotacao entre `G1 Tecnologia`, `TecMundo`, `n8n`, `AWS Machine Learning`, `OpenAI`, `Microsoft Cloud` e `Anthropic Claude`, sem falhas de consulta.
- `Olhar Digital`, Google Cloud, Google DeepMind e NVIDIA permanecem cadastrados e entram no rodizio quando houver pauta recente que passe pelos filtros.
- Commit do rodizio: `ec47b1d` (`Adiciona rodizio de fontes ao Radar`).

Validacao:

- `npm run validate-copy`: passou com `20` packs, `54` packs automaticos e `74` selecoes automaticas.
- Protecao de historico, capa e fonte consecutiva: aprovada.
- Branch `feature/modern-editorial-system`, `origin/feature/modern-editorial-system` e `origin/main` ficaram sincronizadas em `ec47b1d` antes deste registro de memoria.
- A regra vale para as proximas publicacoes; posts duplicados que ja estavam no Instagram nao foram removidos.

## 2026-08-16 15:13 BRT

Checkpoint de comunicacao da landing solicitado pelo usuario:

- A frase aprovada passou a ser `A plataforma e acessada na nuvem.`.
- Todas as referencias a computador e celular foram retiradas da landing comercial.
- A mensagem foi sincronizada no bloco de prova, recurso de rede ativa, secao de automacao, imagem, passo de publicacao e FAQ.
- A FAQ agora explica que o acesso ocorre pela internet e que os fluxos programados executam a agenda automaticamente.
- Commit: `63664a1` (`Simplifica mensagem de acesso na nuvem`).
- Deploy: `dpl_BaTxQWHD1tyiYYizab2u4B9ZWM6f`, alias `https://cliente-x-instagram.vercel.app/plataforma`.
- Validacao em producao: HTTP `200`, frase nova presente e nenhuma ocorrencia de `computador` ou `celular` no HTML.
- Este e o texto comercial aprovado e deve ser preservado ate novo pedido explicito.

## 2026-08-16 15:03 BRT

Checkpoint geral solicitado pelo usuario depois das correcoes operacionais, editoriais e comerciais.

Radar e publicacao comprovada:

- A busca progressiva continua em `7`, `15` e `30 dias`, preservando fonte registrada e bloqueio de links ja publicados.
- A selecao deixou de rejeitar uma noticia nova somente porque sua estrutura editorial e seu CTA se parecem com publicacoes anteriores; para pautas pesquisadas, o link da fonte passa a identificar a novidade.
- Correcao: `f709b52`; integracao operacional: `29ae81c`.
- O run `31962694454` terminou com sucesso usando o codigo corrigido e publicou feed e Story.
- Prova real: `https://www.instagram.com/p/DcHCaxjG4Ew/`, media ID `18111090923046588`, Story ID `18623619439052055`.
- Fonte da pauta publicada: AWS Machine Learning, noticia de `2026-08-12` sobre pagamentos verificaveis com agentes no Amazon Bedrock.
- G1 Tecnologia, Olhar Digital e TecMundo foram adicionados como fontes jornalisticas complementares em `afcbe92`; as fontes primarias oficiais foram preservadas.
- Feeds validados: G1 Tecnologia via RSS, Olhar Digital via RSS e TecMundo via sitemap de noticias. O filtro passou a exigir o termo editorial no titulo para reduzir falsos positivos.

Direct:

- Variacoes repetidas dentro da mesma automacao, como `prompts`, `PROMPTS` e `Prompts`, agora sao normalizadas uma unica vez e nao geram falso conflito (`1f7f7e0`).
- A repeticao entre automacoes diferentes continua bloqueada.
- O status `Meta conectada` agora e preservado depois de salvar; a API devolve o campo `connected` e o navegador combina a resposta sem apagar o estado (`3112e84`, integracao `913677b`).
- Credenciais necessarias foram confirmadas na producao e existem duas automacoes salvas: `Material 1` e `Instagram automatico`, com uma ativa.

Landing comercial:

- A mensagem principal passou a ser `Sua rede social ativa, com conteudo que tem cara de gente.` em `a0158de`, integrada em `b7617a6`.
- O texto posiciona a IA como ferramenta e destaca estrategia, comunicacao humana, Radar de oportunidades, identidade da empresa e conteudo natural/profissional.
- Objetivos destacados: conversar com o publico, fortalecer a marca, gerar oportunidades de engajamento e apresentar o negocio a potenciais clientes.
- A oferta relampago de `R$ 397/mes` por `R$ 197/mes`, implantacao gratuita, volumes e WhatsApp foram preservados.
- Validacao visual em desktop e celular: sem overflow horizontal, sem sobreposicoes e sem erros de console.
- Deploy da landing: `dpl_2MwAKCbm8pfqtn94q271ib3uLTCJ`.

Cartao da fonte nas artes:

- O cartao `FONTE OFICIAL` foi compactado para evitar texto cortado: tipografia menor, espacamento interno reduzido, quebra para nomes longos e apoio `Pauta relevante para empresas.`.
- A correcao vale para o renderizador real, Story quando o cartao aparece e previa SVG do dashboard.
- Nova previa renderizada e inspecionada com todo o texto dentro da moldura; `npm run validate-copy` continuou aprovado.
- Commit: `a5b4466`; integracao: `83d491f`; deploy: `dpl_7q6CXhM1C5bmXgdWrpVi4uXc9hrm`.
- Este e o novo checkpoint funcional e visual do projeto e nao deve ser revertido sem pedido explicito.

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
# 2026-08-29 12:06 BRT — Versão v5.46 e acesso direto à lógica da postagem

- Causa confirmada: a implementação do Método IHC estava somente na branch local, sem push/deploy, e a versão permanecia fixada em `v5.45`.
- A versão visível foi atualizada para `v5.46` em `api/state.js` e `docs/dashboard.html`.
- O menu ganhou a área própria `Lógica da postagem`; o controle deixou de ficar escondido dentro de `Conteúdo`.
- O painel explica claramente os dois estados: Método IHC da Hanah ligado (Identificação, História e Conteúdo; 9 takes/10 cards) ou lógica editorial atual.
- `git diff --check`, `node --check api/state.js`, `node --check scripts/dashboard-server.mjs` e `npm run validate-copy` passaram; a validação cobriu 20 packs, 54 packs automáticos e 74 combinações.
- O servidor local abriu em `http://localhost:4173`; a tela de login foi confirmada. A área autenticada não foi alterada nem salva durante a checagem visual.
- Deploy/publicação: pendente neste checkpoint; enviar para `origin/main`, publicar na Vercel e confirmar `v5.46` no domínio principal.

Atualização operacional:

- Os oito commits locais foram reaplicados sem conflito sobre o `origin/main` atualizado e enviados ao remoto; commit final da correção: `1ec68a8`.
- O deploy manual com certificados confiáveis do Windows chegou à Vercel, mas foi recusado em autenticação com `Not authorized`; `VERCEL_TOKEN` não está disponível no ambiente local.
- O domínio principal respondeu HTTP 200 e ainda mostrou `v5.45`, portanto a correção não foi declarada como publicada.
- Próximo passo exato: renovar o login/token da Vercel por fluxo protegido, executar `npx vercel --prod --yes` com `NODE_OPTIONS=--use-system-ca` e confirmar no HTML público `v5.46` e `Lógica da postagem`.

Conclusão às 12:17 BRT:

- A autenticação protegida da Vercel foi renovada e reconheceu a conta `marcondesgestaotrafego-spec`.
- Deploy manual de produção concluído: `dpl_BpdpLqpZLhZ1TsoDNioT1wJaD7j1`, estado `READY`.
- O domínio principal `https://cliente-x-instagram.vercel.app` foi mantido e recebeu o alias do novo deploy; nenhuma integração Git ou alteração de domínio foi criada.
- Prova pública sem cache: HTTP 200, `Versão atual: v5.46`, aba `Lógica da postagem` e controle `Usar MÉTODO IHC DA HANAH` encontrados no HTML de produção.
- Nenhuma postagem foi enviada ao Instagram nesta atualização de painel.
# 2026-08-29 12:28 BRT — Primeira publicação real com Método IHC da Hanah

- O Método IHC da Hanah foi ativado em `contentProfile.storyMethod.ihcHanahEnabled` e permanece ligado para as próximas publicações automáticas.
- Preflight: `node --check`, `git diff --check` e `npm run validate-copy` passaram; a validação cobriu 20 packs, 54 automáticos e 74 combinações.
- Render local `2026-08-29-122105-slot-2-render-only` confirmou `reel-and-story`, exatamente 9 takes, formato `reels-9-takes`, Story e trilha `pulso-produtivo`.
- A primeira tentativa real, run `33260096504`, foi bloqueada antes da Meta porque o Radar não encontrou pauta oficial inédita em 30 dias. Nenhum post foi criado nessa tentativa.
- Para não inventar fonte, o Radar foi desligado somente durante o disparo de conteúdo editorial próprio da marca. O Método IHC permaneceu ativo.
- Run real `33260221670` concluiu todas as etapas, incluindo `Publish feed and story`, marcação do slot 2, resolução do alerta anterior e persistência do estado.
- Publicação: `https://www.instagram.com/reel/DcoQg0djKr3/`, media ID `18146973691557370`, Story ID `18214564504349184`, publicada em `2026-08-29T15:28:17.448Z`.
- Título de abertura: `Você sente que trabalha muito e mesmo assim a operação escapa?`; conteúdo editorial próprio, sem fonte jornalística inventada.
- Primeiro comentário: sem ID e sem erro. Reel hospedado em `1e85413`, Story em `4f0cddd` e estado em `9770bc2`.
- O Radar foi religado imediatamente após a confirmação; IHC continua ligado. Nenhuma alteração de domínio ou integração Vercel/Git foi realizada.
# 2026-08-29 12:34 BRT — Layout em largura total da lógica da postagem

- Causa confirmada: a nova view `posting-logic` não estava na regra de telas em coluna única e, por estar dentro do `aside`, era renderizada inteira na coluna lateral direita.
- A `v5.47` adiciona `posting-logic` às views de largura total e faz as duas grades internas ocuparem 100% da área útil.
- No desktop, o formulário editorial usa duas colunas equilibradas; Método IHC, Radar, paleta, ações e resultado ocupam a largura completa.
- Em telas de até 760 px, todos os campos voltam para uma coluna.
- Validação real no navegador local: em 1920 px, painel e `main` mediram 1456 px e começaram no mesmo eixo; em 390 px, painel e `main` mediram 351 px, sem rolagem horizontal (`bodyScrollWidth: 375`).
- `git diff --check`, sintaxe da API/servidor e `npm run validate-copy` passaram; 20 packs, 54 automáticos e 74 combinações validados.
- Deploy/publicação: deploy Vercel pendente neste checkpoint; nenhuma publicação Instagram foi feita nesta alteração visual.

Conclusão de produção:

- Commit funcional `81dfe5a` enviado ao `origin/main`.
- Deploy `dpl_Ezfk6xviEBcJVpotJoamj2NoxSPZ` concluído em estado `READY` e associado ao domínio principal existente.
- HTML público confirmou HTTP 200, `Versão atual: v5.47`, a regra de largura total de `posting-logic` e a grade desktop em duas colunas.
- Nenhuma publicação Instagram foi enviada nesta correção de layout.
# 2026-08-29 12:41 BRT — Continuação obrigatória do Story para o feed

- Causa confirmada na publicação IHC `DcoQg0djKr3`: o renderizador só mostrava a chamada para o feed quando `researchSource` existia. Conteúdo editorial próprio, sem Radar, ocultava o CTA.
- A `v5.48` passa o `publishMode` ao Story e exibe continuação em todo Story acompanhado de Reel/carrossel.
- Notícia do Radar mantém `Acompanhe a matéria na íntegra no feed.`; conteúdo editorial próprio usa `Continue este conteúdo no feed.`.
- Story avulso (`story-only`) continua sem chamada para um feed inexistente.
- `node --check`, `git diff --check` e `npm run validate-copy` passaram com 20 packs, 54 automáticos e 74 combinações.
- Render de notícia `2026-08-29-123840-slot-2-render-only` preservou o CTA jornalístico.
- Render IHC editorial `2026-08-29-123942-slot-2-render-only` confirmou Reel de 9 takes, Story sem fonte inventada e o novo CTA dentro da área segura, sem sobreposição com a foto.
- O Radar foi desligado somente no teste local editorial e religado antes do commit.
- Deploy/publicação: deploy Vercel pendente neste checkpoint; o Story já publicado não foi repostado e nenhuma nova mídia foi enviada à Meta.

Conclusão de produção:

- Commit funcional `51baed1` enviado ao `origin/main` depois de integrar o perfil salvo remotamente em `88ec4cb`.
- Deploy `dpl_AVXM4rPa8G8TxUaLZfcusCYYjsuu` concluído em estado `READY`, mantendo o domínio principal existente.
- HTML público confirmou HTTP 200 e `Versão atual: v5.48`.
- O Story anterior permanece como publicado originalmente; a nova chamada vale para os próximos Stories combinados. Nenhuma mídia foi repostada nesta correção.

# 2026-08-29 13:01 BRT — Salvamento independente da lógica da postagem

- O relato foi confirmado pelo histórico remoto: após desmarcar e tentar salvar, nenhum novo commit de configuração foi criado; o último `Update profile for cliente-x` ainda continha `ihcHanahEnabled: true`.
- Causa de usabilidade: o controle IHC dependia do botão geral `Salvar perfil da marca`, localizado muito abaixo e responsável por validar/gravar todo o formulário. Uma falha ou abandono em qualquer outro campo também impedia a alteração da lógica.
- A `v5.49` adiciona `Salvar lógica da postagem` imediatamente abaixo do controle IHC.
- A nova ação `update-posting-logic` grava somente `contentProfile.storyMethod.ihcHanahEnabled`, preservando os demais dados da conta, e retorna o estado persistido.
- Após salvar, o painel recarrega o GitHub e só mostra sucesso se o valor confirmado for igual ao escolhido; caso contrário, exibe erro e restaura o estado real.
- O Método IHC foi deixado desligado (`false`) para `cliente-x`, conforme solicitado; a lógica editorial atual volta a orientar as próximas postagens.
- Teste funcional local: POST com `false` seguido de novo GET retornou `saved: false` e `reloaded: false`.
- `git diff --check`, `node --check api/state.js`, `node --check scripts/dashboard-server.mjs` e `npm run validate-copy` passaram; 20 packs, 54 automáticos e 74 combinações foram validados.
- Commit funcional `d5578ca` enviado ao `origin/main`.
- Deploy `dpl_6Fp3eWmsGs4P2ooEmGaBvfPNrNQ3` concluido em estado `READY` e associado ao dominio principal existente, sem conectar Vercel ao Git nem alterar dominio.
- Prova publica: HTTP 200, `Versao atual: v5.49`, botao `Salvar logica da postagem` presente e configuracao oficial do GitHub com `ihcHanahEnabled: false`.
- Nenhuma midia foi enviada ao Instagram nesta correcao.

# 2026-08-29 13:05 BRT — Novo carrossel de impacto

- Foi criado um segundo caminho de conteudo no editor, acionado por `Novo carrossel de impacto`, independente do Metodo IHC e da logica editorial automatica.
- O botao gera um rascunho editavel com oito cards, alternando preto/branco, destaque vermelho, fotos e capturas grandes, textos curtos e CTA final.
- O novo estilo `impact-carousel` pode ser escolhido pelo proprio pack sem mudar a direcao visual permanente da conta.
- Conteudo editorial proprio nesse modo nao e substituido pelo Radar; nenhuma fonte jornalistica foi inventada e nenhuma imagem/texto do perfil usado como referencia foi copiado.
- O editor passou a permitir salvar um novo pack no fim da lista preservando `visualDirection`; posts manuais agendados continuam aceitos mesmo com Radar ativo.
- Primeiro teste preparado: `A IA nao deveria so responder. Ela deveria ajudar o trabalho a continuar.`, oito cards e CTA `Comente FLUXO`.
- Render final local `2026-08-29-125819-slot-0-render-only`: Feed 1080x1350 com oito cards e Story 1080x1920 com continuacao para o feed; contraste e area segura conferidos visualmente.
- `node --check`, `git diff --check` e `npm run validate-copy` passaram; 20 packs, 54 automaticos e 74 combinacoes validados.
- Commit funcional `b76bc24` enviou o novo modo ao `origin/main`; deploy inicial `dpl_9dLr6e39a4P7A6FPjC5vqjoug4MV` ficou `READY` e confirmou a `v5.50`.
- A primeira tentativa real, run `33262178330`, foi bloqueada antes da Meta no slide 4 por colisao entre imagem grande e avatar auxiliar. Nenhuma midia foi criada.
- A segunda tentativa, run `33262339312`, avancou ate o slide 7 e confirmou a mesma causa em outra composicao. Nenhuma midia foi criada.
- `7370021` corrigiu a causa na raiz: cards de impacto com foto explicita ocultam o avatar auxiliar, preservando titulo e imagem.
- Run real `33262436434` concluiu `Publish feed and story` e persistiu o estado.
- Publicacao: `https://www.instagram.com/p/DcoWISMCapA/`, media ID `18404277577091475`, Story ID `17988731289012552`, publicada em `2026-08-29T16:16:57.799Z`.
- O carrossel possui oito cards; o Story comunica `Continue este conteudo no feed.`; primeiro comentario sem ID e sem erro. Imagens hospedadas em `e4ffa6e` e estado em `67d3ff7`.
- Conteudo editorial proprio, sem fonte jornalistica inventada e sem copiar imagens ou textos do perfil de referencia.
- Deploy final `dpl_471TGBAgwQ88RQwZktufHEhWNdZG` concluido em estado `READY`; HTML publico confirmou HTTP 200, `Versao atual: v5.50` e `Novo carrossel de impacto` no dominio principal existente.

# 2026-08-29 13:25 BRT — Botão Bottini e acesso visível ao carrossel de impacto

- `Novo carrossel de impacto` estava somente em `Conteúdo`; agora também aparece destacado em `Lógica da postagem` e, ao clicar, cria o rascunho e abre o editor.
- A `v5.51` adiciona o `Botão Bottini — palavras com atitude`, separado do Método IHC.
- O controle possui liga/desliga, dose `leve`, `equilibrada` ou `alta` e até 12 palavras/expressões editáveis. Valores iniciais: `incrível`, `sensacional`, `excelente`, `imperdível` e `isso tem qualidade`.
- A dose leve atua na legenda; a equilibrada também reforça a capa; a alta pode reforçar o texto da capa. A palavra é escolhida conforme produto, promoção ou conteúdo geral.
- Notícias com `research.sourceUrl` ficam fora da voz Bottini para preservar precisão editorial e evitar exagero no Radar.
- Configuração inicial de `cliente-x`: desligada e equilibrada, aguardando escolha no painel. O salvamento é independente e confirma o estado recarregado.
- Verificações de sintaxe, `git diff --check` e `npm run validate-copy` passaram, incluindo aplicação em conteúdo próprio e exclusão do Radar; o POST local confirmou `enabled: false`, `intensity: balanced` e as cinco expressões persistidas.
- Commit funcional `5616fa1` enviado ao `origin/main`.
- Deploy `dpl_CSjtU1zTJp2r9zaHucozpXPeTyXe` concluído em estado `READY`, preservando o domínio principal e sem conectar a Vercel ao Git.
- Prova pública: HTTP 200, `Versão atual: v5.51`, `Novo carrossel de impacto`, `Botão Bottini`, botão de salvar e aviso de exclusão do Radar presentes no HTML do domínio principal.
- Nenhuma mídia foi enviada à Meta nesta atualização.

# 2026-08-29 13:40 BRT — Imagens grandes no carrossel de impacto

- O teste `A IA não deveria só responder` evidenciou grandes áreas vazias: somente três dos oito cards possuíam `imagePath`, e os layouts de impacto tratavam as imagens existentes como pequenos elementos auxiliares.
- A `v5.52` transforma a imagem em elemento principal do card de impacto: foto central ampla, recorte 4:5, leve degradê e cartão de texto sobreposto com contraste.
- O novo rascunho criado pelo botão agora entrega imagem em todos os oito cards, alternando cenas de equipe, aprovação humana, dashboard e continuidade operacional.
- Foram geradas três fotografias editoriais originais para o projeto: `impact-ai-workflow-team-v1.png`, `impact-ai-approval-v1.png` e `impact-ai-continuity-v1.png`; sem logotipos, textos ou marcas de terceiros.
- `developer.meta.com` foi avaliado, mas respondeu com limitação HTTP 429. Imagens institucionais da Meta não foram usadas num tema genérico para não sugerir parceria ou atribuir a pauta à empresa; fonte oficial da Meta continuará apropriada quando o assunto for especificamente um produto ou anúncio da Meta.
- Render local `2026-08-29-133638-slot-0-render-only` concluiu oito cards e Story; capa e card 6 foram inspecionados visualmente, com fotografia ampla, título legível e sem colisão.
- Commit funcional `a81b313` enviado ao `origin/main`.
- Deploy `dpl_AdPoEwmT4qwEHCBmVwiAcbRi6w6b` concluído em `READY`, sem alterar domínio nem conectar a Vercel ao Git.
- Prova pública: HTTP 200, `Versão atual: v5.52`, referência do novo conjunto visual no HTML e imagem `impact-ai-workflow-team-v1.png` acessível em `/docs/uploads/` com HTTP 200 e 1.613.037 bytes.
- Nenhuma mídia foi repostada; a correção vale para os próximos carrosséis criados pelo botão.

# 2026-08-29 13:45 BRT — Importar imagem por link ou página

- A `v5.53` amplia o campo de imagem de cada slide para aceitar tanto URL direta de JPG/PNG/WebP/AVIF quanto URL de uma página de site.
- Quando recebe uma página, a plataforma procura a imagem principal declarada pelo site (`og:image`/imagem editorial), baixa o arquivo e o incorpora ao layout do carrossel, preservando título, texto e identidade visual.
- O comportamento antigo de `imageUrl` enviava a imagem crua e pulava a composição; agora a imagem remota é transformada em fonte local temporária para renderizar o card completo.
- Segurança: somente HTTPS, até cinco redirecionamentos, 20 KB a 12 MB, formatos permitidos e bloqueio de localhost, domínios `.local` e redes privadas.
- Teste por página: matéria oficial `Introducing the Meta AI App` da Meta Newsroom extraiu a imagem principal e gerou o render `2026-08-29-134243-slot-1-render-only`.
- Teste por link direto: `Meta-AI-App_Header.jpg?w=1200` gerou o render `2026-08-29-134319-slot-0-render-only`.
- A inspeção visual confirmou imagem oficial dentro do carrossel com título e cartão de texto preservados.
- Deploy e prova pública: pendentes neste checkpoint intermediário. Nenhuma mídia foi publicada.
