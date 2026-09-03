# Status Atual

Atualizado em: 2026-09-02 15:15 BRT

## Regra permanente de checkpoint

- Toda atualizacao concluida deve ser registrada automaticamente em `HISTORICO.md` e refletida em `STATUS_ATUAL.md`.
- O usuario nao precisa pedir novamente para gravar a memoria do projeto.
- O checkpoint deve acompanhar a alteracao no Git e no remoto, quando aplicavel, antes do encerramento da tarefa.

## Projeto ativo

- Primeira publicacao real do livro confirmada no run `33665825418`: `https://www.instagram.com/p/Dcy2yCcIJ8P/`, carrossel ID `17897174445596019` e Story ID `17965005330177964`, publicados as 15:14 BRT. Primeiro comentario sem ID e sem erro.
- Pauta publicada: `A IA ficou mais rápida. A gestão ficou mais importante.`, baseada no Prefacio, pagina 3. O item `livro-claude-code-20260902-01` esta persistido como `published`; zero erro aberto no vigia.
- Campanha autoral do livro `Como Ser Gestor do Claude Code`, de Marcondes Jorge Machado, preparada na branch `feature/claude-book-editorial` sobre o `origin/main` atualizado.
- A agenda possui 21 publicacoes entre 02/09 e 08/09/2026, sempre 3 por dia. Em 02/09: 16:00, 19:00 e 22:00 BRT; nos demais dias: 08:10, 14:15 e 19:00 BRT.
- Cada pack possui cinco cards com trecho curto, capitulo, pagina, explicacao, aplicacao pratica e divulgacao da obra completa. Os packs sao autorais, nao possuem `research` e nao inventam fonte jornalistica do Radar.
- O ultimo card usa `Comente LIVRO` sem prometer envio ou link de compra ainda nao informado. Os rótulos autorais com `preserveEngagementCopy` permanecem intactos durante o aprimoramento automatico.
- Validacoes: 21 itens e 3 itens por dia confirmados, `node --check`, `git diff --check` e `npm run validate-copy` aprovados. Tres packs foram renderizados e o primeiro foi reinspecionado apos os ajustes; Feed 1080x1350 e Story 1080x1920 ficaram legiveis, sem sobreposicao e sem a chamada falsa `link na bio`.
- Campanha enviada ao `origin/main` pelos commits `179fcf4` (`Add authored Claude book campaign`), `7b3b306` (`Schedule Claude book publication series`) e checkpoint `5f0f488`. A antecipacao solicitada foi registrada em `869cdf8`; o estado publicado foi persistido automaticamente em `e1bd3cd`.
- Pasta operacional registrada: `cliente-x-instagram-modern-incident`; campanha preparada em worktree limpa `cliente-x-instagram-modern-book` para preservar o trabalho local existente.
- Branch operacional: `main` (trabalho preparado em `fix/watchdog-story-overlap-20260828`).
- Correcao funcional mais recente: `a2faee3` (`Use editorial reserve when Radar is exhausted`). Quando as pautas oficiais ineditas de ate 30 dias acabam, o fluxo automatico usa reserva editorial propria e inedita; se necessario, gera uma edicao operacional unica. A trava de fonte oficial continua obrigatoria para qualquer noticia do Radar.
- Correcao anti-repeticao mais recente: `5dea2b3` (`Block dated editorial duplicates`). O botao nao envia mais o pack fixo `O gargalo invisivel...`; titulo/tema proprietario repetido e bloqueado mesmo com outra data, e a reserva percorre ate 74 alternativas antes de desistir sem publicar.
- Slot 4 recuperado no run `33407799274`: `https://www.instagram.com/reel/DctZbQkAuvq/`, media ID `18349783783221542`, Story ID `18097489712377177`; quatro alertas fechados e slot registrado. Primeiro comentario: OAuthException codigo 10, separado do sucesso do Reel e Story.
- Deploy do botao no painel pendente: a CLI Vercel retornou `Not authorized`; o projeto web correto foi localizado, mas o upload pelo navegador aguarda confirmacao explicita.
- Incidente relatado: run `33347950948`, falha em `Publish feed and story` por esgotamento de pautas oficiais nao repetidas, sem relacao com token Meta. Recuperacao real confirmada no run `33404188722`: `https://www.instagram.com/reel/DctVSMOFPrW/`, media ID `17922140778422826`, Story ID `18112661300331225`, primeiro comentario sem erro; historico persistido em `83c8389`.
- Todas as nove ocorrencias abertas do slot 2 de 30/08 foram resolvidas pelo run `33404188722`, e o slot foi registrado como publicado. Recuperacoes manuais futuras passam a fechar tentativas antigas do mesmo slot mesmo quando executadas no dia seguinte.
- Estado operacional remoto atual: `c79c04b` (`Update Instagram schedule state`), com correcoes locais preparadas ate `17fea06`.
- Correcao funcional mais recente: `17fea06` (`Marca slot recuperado no fluxo manual`).
- Radar progressivo, protecao contra capas repetidas e rodizio de fontes fazem parte do estado atual; landing humana e cartao de fonte corrigido permanecem preservados.
- Repositorio operacional: `origin/main` contem a trava do Radar e a landing atualizada.
- Dashboard: `https://cliente-x-instagram.vercel.app`
- Landing comercial: `https://cliente-x-instagram.vercel.app/plataforma`
- Commit mais recente da landing: `9156514` (`Atualiza todas as telas da landing`).
- Versao atual em producao: `v5.50`, com um segundo modo de criacao chamado `Novo carrossel de impacto`; publicacao real e correcoes visuais confirmadas.
- O novo modo cria um rascunho editorial proprio e editavel com oito cards, alternancia preto/branco, destaque vermelho, fotos/telas grandes e CTA configuravel. Ele nao altera o Metodo IHC nem a logica editorial automatica.
- Prova real do modo de impacto: run `33262436434`, `https://www.instagram.com/p/DcoWISMCapA/`, media ID `18404277577091475`, Story ID `17988731289012552`, primeiro comentario sem erro.
- Deploy atual: `dpl_471TGBAgwQ88RQwZktufHEhWNdZG`, estado `READY`; HTML publico confirmou HTTP 200, `v5.50` e o novo botao.
- A area `Logica da postagem` possui o botao `Salvar logica da postagem` imediatamente abaixo do controle. Ele grava apenas o liga/desliga, recarrega o estado persistido e confirma `Metodo IHC ligado/desligado` na propria area.
- Estado solicitado para `cliente-x`: Metodo IHC da Hanah desligado (`ihcHanahEnabled: false`); as proximas postagens voltam a usar a logica editorial atual.
- O layout da area foi corrigido: duas colunas equilibradas no desktop e uma coluna no celular, sem o painel preso no canto direito ou rolagem horizontal.
- Deploy de producao atual: `dpl_6Fp3eWmsGs4P2ooEmGaBvfPNrNQ3`, estado `READY`; HTML publico confirmou HTTP 200, `v5.49` e o novo botao.
- O painel recarrega metricas privadas automaticamente a cada 60 segundos, ao voltar para a aba e ao receber foco (`b14c958`).

## Disparo automatico e composicao visual

- A escrita automatica deixou de repetir uma unica arquitetura: noticias do Radar alternam seis aberturas, rotulos, transicoes e duas ordens de cards; conteudos proprios alternam seis conjuntos de secoes. Fatos, fonte oficial, URL, separacao da analise e trava de duplicidade permanecem obrigatorios. Uma validacao exige ao menos cinco estruturas distintas em 12 pautas.
- Recuperacao manual deixou de ser requisito operacional: o fluxo principal roda uma vez para cada um dos 13 slots, sete minutos depois do horario, e o Vigia independente revisa pendencias a cada 15 minutos. Ambos consultam o livro de slots antes de publicar. O Vigia tambem instala FFmpeg e respeita automaticamente Reel/Feed por slot.
- A carga de agendamento caiu de ate 576 para 109 eventos por dia, afastados do inicio da hora para reduzir atrasos e descartes do `schedule` no GitHub Actions. Proxima validacao operacional deve ocorrer naturalmente, sem `workflow_dispatch`.
- Slot 5 das 13:00 BRT recuperado no run `33412961116`: `https://www.instagram.com/p/DctfosPmWyC/`, media ID `17990223194844851`, Story ID `18100193324369979`, primeiro comentario sem erro. O agendador nao criou o run ate 13:13 BRT; o disparo manual concluiu e persistiu o slot as 13:16 BRT em `502f74d`.
- O selo fixo `PROCESSO ANTES DA FERRAMENTA` foi removido de Story, Feed e Reel. A frase tambem saiu do card Radar e da previa reserva do dashboard. O render `2026-08-31-124857-slot-5-render-only` confirmou o Feed sem o selo e o Story somente com o CTA correto.
- Stories acompanhados de Feed/Reel usam a chamada direta `Confira o conteudo completo no feed.` para conteudo proprio e Radar. Story avulso permanece sem CTA para uma publicacao inexistente. O render `2026-08-31-124342-slot-5-render-only` confirmou leitura e area segura.
- Primeira publicacao real com Metodo IHC da Hanah: run `33260221670`, `https://www.instagram.com/reel/DcoQg0djKr3/`, media ID `18146973691557370`, Story ID `18214564504349184`, publicada em `2026-08-29T15:28:17.448Z`. O Reel usou 9 takes no fluxo Identificacao -> Historia -> Conteudo; primeiro comentario sem erro.
- O run inicial `33260096504` foi bloqueado corretamente porque o Radar nao encontrou pauta oficial inedita em 30 dias. Para a publicacao solicitada, foi usado conteudo editorial proprio sem inventar fonte; depois da confirmacao, o Radar foi religado e o Metodo IHC permaneceu ativo.
- Publicacao real mais recente: run `33258039686`, recuperacao manual do slot 1 de 2026-08-29, `https://www.instagram.com/p/DcoKxn_jZ2t/`, media ID `17963739330178902`, Story ID `18108159037891082`, publicada as `2026-08-29T14:37:52.907Z`. O run hospedou imagens em `e1dd202` e resolveu os alertas do Radar em `c79c04b`; a correcao local `17fea06` marca o slot 1 em `published-slots.json` e impede nova tentativa duplicada quando enviada ao remoto.
- Incidente do slot 1: o Radar bloqueou corretamente por falta de pauta oficial inedita em 30 dias. A solucao do vigia foi corrigida para orientar buscar pauta oficial/ampliar fontes do Radar, nao renovar token Meta.
- Modo editorial opcional no painel: `PROMPT -- METODO IHC DA HANAH`, salvo em `contentProfile.storyMethod.ihcHanahEnabled` e desligado por padrao. Quando ativado, apenas publicacoes automaticas/Radar usam o fluxo Identificacao -> Historia -> Conteudo; Reels saem com exatamente 9 takes e carrosseis com exatamente 10 cards. Packs manuais ou agendados explicitamente pelo painel nao sao reescritos.
- Validacoes da feature IHC: sintaxe do publicador, API e servidor local passaram; `npm run validate-copy` passou com 20 packs, 54 auto packs e 74 combinacoes automaticas. Sem push, deploy Vercel ou publicacao Instagram nesta alteracao.
- Publicacao real anterior: run `33257167618`, fonte `G1 Tecnologia`, pauta `Veja os 5 profissionais de tecnologia mais disputados pelos bancos; setor investirá R$ 3 bilhões em IA`, `https://www.instagram.com/reel/DcoIsXRglsx/`, media ID `18113312665991179` e Story ID `18048933059597084`. O erro do slot 0 foi resolvido pelo mesmo run; Reel em `c4dfc5d`, Story em `0b3b52b` e estado em `4717510`. O primeiro comentario foi recusado pela Meta com OAuthException codigo 10, sem afetar Reel e Story.
- Incidente de 2026-08-29 resolvido: o vigia `33254423905` falhou as 10:13 BRT em `Graph POST /17841404470203300/media` porque a Meta recusou a legenda com `The caption was too long`. `dbf7d42` aplica limite seguro antes da publicacao, reduz blocos longos e preserva titulo original, fonte HTTPS, CTA e hashtags. A mensagem de solucao do vigia para `Caption Too Long` / `36004` foi ajustada para nao sugerir renovacao de token Meta.
- Publicacao anterior confirmada: run `33233488693`, fonte `TecMundo`, pauta `OpenAI, Anthropic e mais de 100 empresas pedem mais seguranca contra IAs`, `https://www.instagram.com/reel/DcnEFDpDxFY/`, media ID `17954855115207895` e Story ID `18120976189894058`. A legenda usa tres fatos completos, sem credito de fotografia ou texto truncado; Reel em `ba47034`, imagens em `cd66f59` e estado em `094552b`. O primeiro comentario foi recusado pela Meta com OAuthException codigo 10, sem afetar Reel e Story.
- O Radar descarta legendas e creditos de fotografia, rejeita resumos terminados em reticencias e usa apenas frases completas do corpo da materia (`246118b`). A prova na mesma pauta do G1 removeu `O logotipo da OpenAI... Foto: AP/Michael Dwyer` e passou a apresentar tres fatos completos: operacao no Brasil, 215 milhoes de mensagens diarias e declaracao de Sam Altman. As 74 combinacoes editoriais passaram.
- Publicacao real mais recente: run `33232626886`, pauta `OpenAI abre operacao no Brasil apos pais se tornar 3 maior mercado do ChatGPT`, fonte `G1 Tecnologia`, `https://www.instagram.com/reel/DcnBvEVgJwC/`, media ID `18147166390538141` e Story ID `18047383550657974`. Reel e Story usaram a imagem oficial da materia; video em `c527763`, imagens em `a002cad` e estado em `76fdfed`. O primeiro comentario foi recusado pela Meta com OAuthException codigo 10, sem afetar as duas publicacoes.
- `c4dcca3` faz a validacao de acentos ignorar slugs de URLs, evitando falso bloqueio de textos corretos em portugues. As 74 combinacoes editoriais passaram e o render `2026-08-29-005525-slot-0-render-only` confirmou Reel, Story, imagem oficial e trilha `beethoven-02-vivace`.
- O Radar usa todas as 14 fontes oficiais configuradas e tenta extrair a imagem principal da propria materia por RSS, `og:image`, Twitter Card ou metadados estruturados (`96f55fe`). A imagem HTTPS e baixada, validada por tipo e tamanho e aplicada na capa do carrossel, no Story e na primeira cena do Reel, sempre com fonte real e link preservados. Logos, SVGs, pixels, arquivos pequenos, HTML e downloads invalidos sao rejeitados; nesses casos entra o rodizio visual seguro.
- Prova completa sem publicacao: render `2026-08-29-002617-slot-0-render-only`, pauta do `G1 Tecnologia`, encontrou 29 pautas oficiais em 30 dias, incorporou a foto real do artigo em AVIF e gerou cinco slides, Story e Reel com trilha `beethoven-01-classica`.
- A foto `sector-photos/ecommerce.jpg` (cartao, caixas e notebook) saiu dos rodizios genericos `business` e `services`; ela so pode voltar em pautas realmente classificadas como ecommerce (`a6b15aa`). A validacao percorre 16 escolhas de Reel generico e bloqueia qualquer vazamento futuro. Render `2026-08-29-000937-slot-0-render-only` confirmou capa com `automation-leave-office.jpg` e slide 4 com `automation-cloud-evening.jpg`, sem a imagem reclamada.
- Recuperacao real do slot 2: run `33230259514`, `https://www.instagram.com/reel/Dcm7Cs4kein/`, media ID `18112965037992789`, Story ID `17880179550688046`, trilha `beethoven-05-destino`. O run redundante `33230269009` foi cancelado antes de publicar na Meta.
- O conteudo editorial de reserva do vigia agora inclui uma edicao operacional unica no fingerprint, evitando novo bloqueio por repeticao sem remover a trava de duplicidade (`9124d9a`).
- A agenda visual agora identifica corretamente oito slots `reel + story` (06:30, 09:00, 12:10, 13:50, 14:15, 16:00, 17:40 e 22:00) e cinco slots `feed + story` (`4b1e85f`).
- Cada publicacao alterna um objetivo organico principal entre comentarios, salvamentos, compartilhamentos e alcance de novos publicos. O painel usa as metricas recentes para exibir o foco recomendado (`970b269`).
- Os Reels passam a escolher entre 12 trilhas: tres composicoes proprias e nove arranjos sintetizados proprios inspirados nas Sinfonias nº 1 a nº 9 de Beethoven. Nenhuma gravacao comercial e usada (`3bcfe94`).
- A prova local `beethoven-05-destino` confirmou AAC estereo 48 kHz, 22,4 segundos, volume medio `-16,1 dB` e pico `-1,6 dB`.
- Prova real da nova rotacao: run `33228996617`, `https://www.instagram.com/reel/Dcm3ck6ElYC/`, media ID `18107059028331902`, Story ID `18156576109501120`, trilha `beethoven-03-heroica`; video em `a352eae`, Story em `7c379c9` e estado em `13ecfc4`.
- O deploy da `v5.39` foi concluido apos configurar o Node para usar os certificados confiaveis do Windows com `--use-system-ca`; TLS permaneceu ativo.
- Os tons continuos dos Reels foram removidos em `21eebd5`. A v5.37 gera trilhas musicais originais arranjadas com bateria, baixo, acordes e melodia, em tres variacoes de 98 a 110 BPM, AAC 48 kHz estereo e normalizacao a `-15 LUFS`.
- Prova real: run `33227198988`, trilha `pulso-produtivo` a 104 BPM, `https://www.instagram.com/reel/DcmyfPGlO8G/`, media ID `17929839645147286`; video em `e6c1baa` e estado em `0691106`. O MP4 publicado foi auditado com volume medio `-17,0 dB`, pico `-0,9 dB` e nenhum erro de primeiro comentario.
- O botao `Corrigir automaticamente` voltou a funcionar apos a renovacao protegida do `GITHUB_TOKEN`, agora valido ate 26/11/2026. A v5.36 elimina o erro HTTP 401, bloqueia disparos duplicados por tres minutos e, quando o Radar esgota pautas oficiais ineditas, recupera o horario com conteudo editorial proprio sem enfraquecer a trava das noticias (`ee428de`).
- Prova real da recuperacao: run `33226668709`, `https://www.instagram.com/reel/DcmxGIPlZWZ/`, media ID `17895966213599689`, Story ID `18091479335215213`; imagens em `94866ed`, video em `671cd8b` e estado salvo em `e051236`. Todos os erros abertos do slot 2 foram resolvidos pelo run.
- A trilha dos Reels foi corrigida em `6cc8f69`: agora usa arranjo eletronico ambiente, AAC 48 kHz estereo, normalizacao para `-16 LUFS`, pico alvo `-1,5 dBTP` e fades. O arquivo real publicado mediu `-18,1 dB` de volume medio e `-6,6 dB` de pico, contra `-32,2 dB` e `-24,3 dB` no Reel anterior.
- Prova real da correcao: run `33225513924`, `https://www.instagram.com/reel/DcmuNuZjY3D/`, media ID `18083297000306014`, video hospedado em `b57e810` e estado salvo em `2a4bc48`. O primeiro comentario nao apresentou erro.
- O calendario preserva os 13 horarios BRT e publica Reel + Story em oito deles: 06:30, 09:00, 12:10, 13:50, 14:15, 16:00, 17:40 e 22:00. Os outros cinco horarios continuam com carrossel + Story (`c22c3ac`).
- Reels usam transicoes de 0,65 segundo em rodizio entre `fade`, `slideleft`, `smoothleft` e `circleopen`, mantendo a trilha instrumental original.
- Prova real completa: run `33224978112`, `https://www.instagram.com/reel/Dcms-MJjoGX/`, media ID `17991592248039786`, Story ID `17907262068494462`, trilha `tecnologia-serena`; video em `70bec66`, Story em `fbe8e02` e estado em `269d2fc`.
- Stories de Reels usam a hospedagem reserva do GitHub para nao depender do limite do ImgBB (`880b2c3`).
- Reels agora recebem uma trilha instrumental original gerada pela plataforma, com rodizio entre tres variacoes, volume baixo, AAC 48 kHz e fades de entrada/saida (`f48e396`).
- Prova real com audio: run `33224292928`, trilha `movimento-leve`, `https://www.instagram.com/reel/DcmrUxHjhK4/`, media ID `18421987573151325`; video hospedado em `215985b` e estado salvo em `9b6b04f`.
- Reels automaticos estao operacionais nos modos `reel-only` e `reel-and-story`: cinco cenas em portugues viram MP4 H.264 de 25 segundos, 1080x1920 e 30 FPS; o fluxo hospeda o video, aguarda o processamento da Meta e registra permalink e ID (`6b99732`, `7e34b4d`).
- Primeiro Reel real: run `33223701381`, fonte `n8n`, `https://www.instagram.com/reel/Dcmp9m2lQNJ/`, media ID `18058367948530681`; video hospedado em `a73cd0d` e estado salvo em `796d0a6`.
- Publicacao real mais recente: run `33222614158`, fonte `Google Oficial`, `https://www.instagram.com/p/DcmneBYASlO/`, media ID `18150159394524409`, Story ID `17955874029235228`.
- O artefato confirmou titulo, cartao de fonte, cinco slides, Story e legenda em portugues do Brasil. Capa e slide 4 usam fotos pessoais distintas; imagens hospedadas em `40458ee` e estado salvo em `d225dbf`.
- Carrosseis empresariais usam uma colecao de cinco fotos contextuais; capa e slide de resultado nao podem repetir a mesma imagem. A validacao automatica bloqueia qualquer regressao (`7d17fe7`).
- Regra permanente de idioma: titulo principal, slides, Story, legenda e titulo pequeno do cartao `FONTE OFICIAL` devem estar em portugues do Brasil. O titulo original em ingles fica apenas como referencia tecnica no link da legenda (`e37a4af`).
- Publicacao real mais recente: run `33221750143`, fonte `IBM AI`, `https://www.instagram.com/p/Dcmlfu_HR8J/`, media ID `17973789066139952`, Story ID `17918202105223733`.
- O artefato confirmou o bloco `Entenda a materia:` com dois fatos traduzidos; a primeira tentativa automatica `33221508012` foi bloqueada sem criar midia por falta de pauta nao repetida.
- O Radar sorteia entre fontes oficiais elegiveis com equilibrio pelas ultimas 12 publicacoes; a mesma fonte continua proibida em sequencia e noticias repetidas continuam bloqueadas (`bed0a88`).
- Fontes oficiais disponiveis ampliadas com Microsoft AI, Google Oficial e IBM AI (`e0c6ae6`).
- Publicacao real mais recente: run `33220820938`, fonte sorteada `Microsoft AI`, `https://www.instagram.com/p/DcmjdQPHCY2/`, media ID `18166974271460207`, Story ID `18127346965686411`.
- A auditoria encontrou boilerplate RSS em ingles nessa legenda; `dae86f8` agora descarta esse formato e bloqueia novas pautas internacionais sem traducao factual em portugues.
- Capas de noticias com titulo longo mantem cartao da fonte, foto pessoal e bloco textual separados; a renderizacao e bloqueada se dois elementos visuais ainda se sobrepuserem.
- Publicacao real mais recente: run `33219787467`, `https://www.instagram.com/p/DcmhYaAFkDC/`, media ID `18123340474891128`, Story ID `17885235213683751`; primeiro comentario sem erro.
- O Radar encontrou 28 pautas em 30 dias, mas bloqueou todas por repeticao no run `33219596814`; o conteudo editorial proprio foi usado sem enfraquecer a trava de fontes.
- O Radar usa 30 dias como janela principal e pode coletar ate 40 pautas candidatas; a validacao real encontrou 28 temas oficiais, mantendo a exclusao de fontes e pautas repetidas.
- Publicacao real mais recente: run `33218965450`, `https://www.instagram.com/p/Dcmf1LkH1jm/`, media ID `18368003272241923`, Story ID `17994351519033665`.
- Packs editoriais enviados explicitamente pelo painel podem ser publicados com Radar ativo sem inventar fonte; pautas pesquisadas continuam obrigadas a preservar a fonte oficial (`6dc9aac`).
- Stories passam por autocorrecao progressiva de largura, foto e compactacao vertical antes de um slot ser bloqueado (`69ed72e`).
- Pautas internacionais precisam apresentar traducao factual em portugues depois de `Entenda a materia:`; conteudo ingles sem traducao confiavel e descartado (`07fe734`).
- Teste real: run `33216450654`, `https://www.instagram.com/p/DcmbM_kGgSV/`, media ID `17953144551209392`, Story ID `17980736346111529`.
- O painel de producao confirmou esse post em 28/08/2026 19:22 BRT depois do deploy.
- Execucoes manuais bem-sucedidas agora resolvem alertas anteriores do vigia; o estado atual possui zero erro aberto (`13e4245`).
- O vigia forcado preserva o indice atrasado selecionado, em vez de sobrescreve-lo para `0`; livro de slots reparado e proximo atraso confirmado como indice `2` (`2536b35`).
- Incidente de 2026-08-28 resolvido: o CTA do Story invadia a foto nos layouts normal e de titulo longo; correcoes funcionais em `b3377a5` e `db9dc53`.
- Run de recuperacao `33215506981` concluiu feed e Story com sucesso e resolveu os erros abertos do vigia.
- Prova real mais recente: `https://www.instagram.com/p/DcmZo_rk_2f/`, media ID `18090005111272483`, Story ID `18144325813720376`.
- Slot de 2026-08-28 06:30 BRT foi marcado como publicado as 19:09 BRT; estado remoto final em `c212f13`.

- O commit `8e1d4a5` reforca o rodizio do Radar usando as ultimas 12 publicacoes pesquisadas, em vez do total acumulado. Isso evita o padrao recente `G1 -> outra fonte -> G1`.
- Pautas comerciais de compra, oferta, promocao e smartwatch foram excluidas do Radar. A primeira previa apos a mudanca escolheu `AWS Machine Learning`, com capa em portugues, e renderizou os cinco slides e Story.
- Em slides internos, uma foto decorativa sem area segura suficiente agora recua para preservar a leitura, sem bloquear todo o slot; a foto da capa continua obrigatoria.
- Primeira publicacao real apos a trava de portugues: run `32036009272`, `https://www.instagram.com/p/DcJKe7pFvhP/`, media ID `17904573321496712`, Story ID `17963038641168267`.
- Os cinco slides e o Story foram inspecionados visualmente e estao em portugues. A legenda publica foi extraida do proprio permalink (HTTP 200) e tambem esta integralmente em portugues, sem o vazamento `Comparing RPA`/`workflow automation`.
- O commit `f465019` bloqueia ingles no pacote final: todos os slides e a legenda sao validados depois da montagem; pautas sem adaptacao confiavel em portugues nao podem ser publicadas.
- A pauta n8n `RPA vs. Workflow Automation` ganhou traducao editorial explicita para portugues. O titulo original em ingles nao e mais repetido na legenda; a fonte e o link continuam preservados.
- Primeiro teste real posterior aos ajustes visuais confirmado pelo run `32034646438`: `https://www.instagram.com/p/DcJIpuCIF_F/`, media ID `17939869695302140`, Story ID `18006552392956384`.
- A publicacao usou o titulo `n8n explica a diferenca entre robo de clique e automacao de verdade.` e a foto `avatar-marcondes-meeting-tablet.png` com o novo encaixe proporcional sem corte.
- A falha do primeiro slot de 2026-08-17 foi causada pela validacao do Story, que rejeitava uma variacao de poucos pixels na borda da foto.
- A tolerancia tecnica da foto foi corrigida em `b8924dc`; textos continuam usando a validacao estrita da area segura.
- O mecanismo de recuperacao publicou realmente o slot pelo run `32033523845`.
- Prova real: `https://www.instagram.com/p/DcJHScOoCQl/`, media ID `18219025894339463`, Story ID `17868329220638472`.
- Titulos longos agora usam escala progressiva e largura maior no feed; no Story, selo, titulo, data e CTA possuem mais espacamento (`3ed5efe`).
- Fotos pessoais no feed e no Story usam encaixe proporcional completo, sem zoom ou recorte; as sobras recebem fundo claro (`14822ea`).
- `node --check`, `npm run validate-copy` e `npm run render-only` passaram; as ultimas previas foram inspecionadas sem corte ou sobreposicao.
- O erro de permissao Meta `OAuthException #10` permanece restrito ao primeiro comentario automatico; feed e Story foram publicados normalmente.

## Telas atuais da plataforma na landing

- A landing possui dez demonstracoes atualizadas: nove abas reais e uma captura adicional do editor/Radar dentro de Conteudo.
- As capturas foram refeitas diretamente no painel de producao v5.27.
- As dez opcoes agora ficam visiveis simultaneamente em uma grade, sem seletores escondidos por rolagem horizontal.
- No desktop aparecem cinco opcoes por linha; no celular, duas por linha.
- Automacao do Direct e editor/Radar aparecem em capturas separadas para deixar as duas funcoes compreensiveis.
- Nenhuma postagem foi enviada a Meta nesta alteracao.
- Producao confirmada: commit funcional `9156514`, deploy `dpl_4JTm9UNd7Gckzqt94j2CXjVyBWay`, versao `v5.28`, dez seletores encontrados e landing publica `HTTP 200`.

## Posts fixados na landing

- A secao de prova social mostra os dois posts que possuem o icone de fixado no perfil: `DcHuU08EiyD` e `DcHxTYymGS0`.
- Os cards usam as capas locais das publicacoes, selo `Fixado no Instagram` e link direto para o post oficial.
- A landing nao depende mais dos embeds que estavam indisponiveis e exibiam caixas vazias.
- O layout das capas e responsivo em desktop e celular.
- Nenhuma postagem foi enviada a Meta nesta alteracao.
- Producao confirmada: commit funcional `a9b4b7f`, deploy `dpl_Hf4r1nsbxN2Zq7gGkSo2Seu3Po1L`, versao `v5.27` e landing publica `HTTP 200`.

## Variacao do ultimo slide

- O fechamento do carrossel alterna entre oito combinacoes de selo, titulo e CTA.
- A escolha usa o link da materia: a mesma pauta permanece consistente e pautas diferentes recebem fechamentos diferentes.
- As frases variam entre diagnostico, processo prioritario, teste pequeno, gargalo e resultado esperado.
- Todas as opcoes terminam com convite claro para o Direct e evitam frases incompletas.
- A validacao automatica confirmou ao menos seis variacoes distintas (`finalSlideVariationGuard: ok`).
- Previa: `2026-08-16-215226-slot-0-render-only`.
- Nenhuma postagem foi enviada nesta alteracao.
- Producao confirmada: commit `f5b3e16`, deploy `dpl_BzH3C9gZXaRQ3YqWn2PFvE8oFiH8`, versao `v5.26` e API publica `HTTP 200`.

## Distribuicao segura do Story

- A composicao usa 250 px livres no topo, 1170 px para o conteudo principal e 500 px livres na base.
- Titulo, resumo e CTA ocupam o bloco superior da area util; fotografia, assinatura e nome formam um bloco inferior equilibrado.
- Titulos longos usam 88 px de margem lateral e fotografia de `340 x 430 px`.
- O renderizador bloqueia sobreposicao e tambem rejeita qualquer elemento fora dos limites seguros.
- Previa confirmada: `2026-08-16-214551-slot-0-render-only`.
- `npm run validate-copy` passou; nenhuma postagem foi enviada nesta alteracao.
- Producao confirmada: commit `9029a62`, deploy `dpl_9Vxr5PwJqBNfWGdSndtpik4fbgZZ`, versao `v5.25` e API publica `HTTP 200`.

## Story adaptativo e rodizio de fotos

- Titulos longos e muito longos usam tamanhos e espacamentos adaptativos no formato 9:16.
- A renderizacao bloqueia colisao da foto com titulo, texto e chamada para o feed.
- Previa com o titulo longo do G1 validada em `2026-08-16-213050-slot-0-render-only`.
- O acervo da conta possui 10 fotos; as tres novas sao `avatar-marcondes-rotation-04.png`, `avatar-marcondes-rotation-05.png` e `avatar-marcondes-rotation-06.png`.
- O seletor evita repetir as 9 fotos utilizadas mais recentemente.
- Nenhuma publicacao foi enviada nesta alteracao.
- Producao confirmada: commit funcional `21dcf7d`, deploy `dpl_6kGQBhJrYp1uB5n43m2q6BcgB7MA`, versao `v5.24` e API publica `HTTP 200`.

## Ultima publicacao confirmada

- Radar publicou uma materia nova do G1 Tecnologia sobre trabalhadores que deixaram a CLT para produzir videos com IA.
- Workflow `31982592122` concluido com sucesso.
- Feed `18112792313046183`; Story `18108295541022431`.
- Post: `https://www.instagram.com/p/DcHxTYymGS0/`.
- Fonte real registrada na legenda: `https://g1.globo.com/empreendedorismo/noticia/2026/08/12/os-trabalhadores-que-dao-adeus-a-clt-atras-do-sonho-de-viver-fazendo-videos-de-ia.ghtml`.
- Story validado sem sobreposicao e com `avatar-marcondes-rotation-04.png`.
- O primeiro comentario continua sem permissao na Meta; o link completo permanece preservado na legenda.

## Idioma obrigatorio do Radar

- Slides, resumo factual e legenda editorial devem estar em portugues brasileiro.
- Paragrafos em ingles extraidos da pagina original sao descartados antes da montagem do pack.
- A pauta do n8n sobre observabilidade possui tres fatos editoriais em portugues validados.
- O titulo estrangeiro permanece somente como credito, marcado `Titulo original (em ingles)`.
- A validacao bloqueia o post se algum fato principal ainda estiver predominantemente em ingles.
- Nenhuma postagem foi enviada nesta alteracao.
- Producao: commit `b7691ab`, deploy final `dpl_6fAXjYvXtbRB8VNDbfDo7h8CMbdq`, versao `v5.23`.

## Publicacao imediata sem repetir materia

- `Publicar agora` consulta URLs e titulos do historico antes de selecionar a pauta.
- A mesma materia nao pode ser reutilizada pelo comando imediato.
- O link completo voltou a permanecer na legenda porque a Meta recusou o comentario automatico por falta de permissao.
- Publicacao que revelou o problema: workflow `31981001000`, feed `18113708173986576`, Story `17899737327349544`, permalink `https://www.instagram.com/p/DcHttB4FEDc/`.
- Correcao: commit `c519d57`, deploy final `dpl_C2ZzqJQ6CkTBUUrSpV6ax9qY7CSn`, versao `v5.22`.
- G1 confirmado: workflow `31981283031`, feed `18025226459893393`, Story `18133189693547611`, post `https://www.instagram.com/p/DcHuU08EiyD/`.
- n8n confirmado: workflow `31981284877`, feed `18111392795080213`, Story `18016864748879873`, post `https://www.instagram.com/p/DcHuh6Vn4_Q/`.
- O duplo acionamento ocorreu porque o arquivo do vigia foi enviado nas duas branches; proximos disparos desse arquivo devem ocorrer apenas em `main`.
- A permissao de comentarios continua ausente na Meta; por seguranca, o link real permanece na legenda.

## Chamada do Story para o feed

- Stories de materias reais exibem `Acompanhe a materia na integra no feed.`
- O cartao usa alto contraste e permanece dentro da area segura 9:16.
- Previa inspecionada: `2026-08-16-210036-slot-0-render-only`.
- Nenhuma publicacao foi enviada nesta alteracao.
- Producao: commit `22d3b1f`, deploy final `dpl_J4qAjBZ6f6wGgzXMM3CwnDfAviGU` e versao `v5.21`.

## Fonte no primeiro comentario

- A legenda identifica a fonte e avisa que o link esta no primeiro comentario.
- O comentario automatico leva fonte, titulo original e URL completa da materia.
- A publicacao e bloqueada antes de chegar a Meta se titulo ou URL estiverem ausentes do comentario preparado.
- Se somente o comentario falhar depois de o feed existir, a falha e registrada sem provocar outro post duplicado.
- Previa validada: `2026-08-16-205452-slot-0-render-only`.
- Nenhuma postagem foi enviada nesta alteracao.
- Producao: commit funcional `33db605`, deploy final `dpl_ACCg5hDHp36ZgaFa2pkQZsMFu3p6` e versao `v5.20` confirmados.

## Chamada final completa

- O slide 5 nao usa mais a frase quebrada `podemos olhar para`.
- Nova frase: `Se isso acontece na sua empresa, vamos olhar juntos para a rotina que mais pesa.`
- Previa validada: `2026-08-16-205029-slot-0-render-only`.
- Nenhuma postagem foi enviada nesta alteracao.
- Producao: commit `13a0fe1`, deploy `dpl_5jigGsWG5oiMwnFzsPKGUkonNnGY`, versao `v5.19` e `HTTP 200` confirmados.

## Materia desenvolvida entre slides e legenda

- O Radar consulta a pagina original e extrai fatos do corpo da noticia.
- O slide 2 inicia a explicacao e o slide 3 continua a mesma materia; a analise empresarial entra somente no slide 4.
- A legenda inclui ate tres paragrafos factuais, evitando o antigo resumo de apenas quatro linhas.
- Creditos de imagem, publicidade, assinatura e biografia nao entram no conteudo.
- O CTA do material foi encurtado para preservar espaco editorial e continua usando `Comente IA`.
- Validacoes: `factualArticleContextGuard` e `articleContinuationGuard` aprovadas; previa `2026-08-16-204020-slot-2-render-only` inspecionada.
- Nenhuma postagem foi enviada nesta alteracao.
- Producao: commit `68e3c0c`, deploy `dpl_CDgNSXa2Yy6Q1tXE83f2Bhw34mPj`, versao `v5.18` e `HTTP 200` confirmados.

## Republicacao corrigida confirmada

- Workflow: `31979969801`, concluido com sucesso.
- Post: `https://www.instagram.com/p/DcHrLtois0h/`.
- Feed Meta: `17950180794027663`; Story Meta: `18123558775877294`.
- Legenda verificada com tres paragrafos reais da materia antes da analise e do CTA.
- Slide 2 inicia o fato e slide 3 continua com Gavin Baker e a resposta de Dario Amodei.
- Inspecao direta no Instagram confirmou a leitura dos dois slides sem sobreposicao.
- Estado automatico salvo pelos commits `497d561` e `0c243ad`.

## Publicacao factual confirmada em 20:33 BRT

- Workflow: `31979415179`, concluido com sucesso.
- Post confirmado diretamente no Instagram: `https://www.instagram.com/p/DcHpzDUF0XY/`.
- Feed Meta: `17971088042934886`; Story Meta: `18067488110721745`.
- Fonte real: Olhar Digital; o slide e a legenda apresentam o contexto sobre Dario Amodei e a crise de confianca em IA.
- A inspecao visual encontrou sobreposicao no slide 2 publicado porque o fato tinha 145 caracteres.
- Para as proximas artes, o fato visual foi limitado a 105 caracteres e o contexto completo permanece na legenda.
- Previa posterior verificada sem sobreposicao: `2026-08-16-203512-slot-2-render-only`.
- O post atual nao foi apagado nem republicado novamente.
- Producao: commit `804d222`, deploy `dpl_GRgET1xJb1fBGBUDMHoXvkpsZLMN` e versao `v5.17` confirmados.

## Contexto factual obrigatorio no Radar

- O Radar nao pode substituir o conteudo da materia por uma repeticao do titulo.
- O resumo factual vindo do RSS e limpo e usado no slide 2 e na legenda; rodapes automaticos do feed sao removidos.
- O publicador bloqueia pauta sem fato real, fato equivalente ao titulo ou o antigo fallback `A materia informa`.
- Para a materia da Olhar Digital sobre o CEO da Anthropic, o contexto recuperado informa que Dario Amodei negou pessimismo sobre IA e reconheceu que o publico questiona os ganhos do avanco da tecnologia.
- A previa final verificada foi `2026-08-16-202614-slot-0-render-only`; nao houve nova publicacao na Meta.
- Producao: commit `45d2515`, deploy `dpl_3pcr1d2WmKxq48RBXDbWhyAVukpi` e versao `v5.16` confirmados.

## Publicacao real apos as travas editoriais

- Run: `31978583103`, concluido com sucesso.
- Post: `https://www.instagram.com/p/DcHnyS7Adj5/`.
- Fonte real: Olhar Digital.
- Materia: `CEO da Anthropic: rejeicao a IA e crise de confianca no setor`.
- URL original completa aparece na legenda publicada.
- Feed com cinco slides e Story foram confirmados diretamente no Instagram.
- A materia e a analise editorial aparecem separadas, sem chamada empresarial aleatoria atribuida a fonte.
- O historico tecnico registra a URL para impedir repeticao.
- A persistencia do historico passa a incluir tambem publicacoes acionadas manualmente por `workflow_dispatch`.
- Producao: commit `7379feb`, deploy `dpl_53Um3xaRRg9hzkJLcVNj43dMJ3wf` e versao `v5.15` confirmados.

## Capas genericas de pesquisa bloqueadas

- Packs do Radar nao podem usar chamadas empresariais aleatorias no lugar do assunto factual da materia.
- Os padroes antigos identificados em posts da AWS, n8n, Olhar Digital, OpenAI e TecMundo sao recusados pelo publicador.
- A validacao automatica tenta inserir uma chamada antiga e somente passa quando ela e corretamente bloqueada (`genericResearchCoverGuard`).
- As tres ocorrencias mais recentes apontadas foram publicadas as 16:19, 17:46 e 19:10 BRT, antes da trava editorial das 19:52 BRT.
- Pesquisa ao vivo com 26 pautas e render `2026-08-16-200904-slot-0-render-only` confirmaram o fluxo novo sem publicar na Meta.
- Producao: commit `2968ccb`, deploy `dpl_t3NJgpNcDvjyFGt32rRmDwMCT4uW` e versao `v5.14` confirmados.

## Anexo real visivel nas pautas do Radar

- Toda pauta pesquisada carrega fonte, titulo original e URL HTTPS em cada slide.
- O cartao visual nao mostra mais apenas o nome da fonte: apresenta tambem o titulo real e informa que o link esta na legenda.
- O publicador bloqueia qualquer pauta pesquisada cujo anexo visual esteja incompleto.
- O post antigo da OpenAI em `https://www.instagram.com/p/DcHh7QPEzVY/` foi publicado antes desta correcao; a fonte real era o artigo `What building an AI-native finance function taught me`, mas a arte substituiu o contexto por uma chamada generica.
- A publicacao antiga foi preservada e nao houve exclusao ou republicacao automatica.
- Render verificado: `2026-08-16-200621-slot-0-render-only`, sem envio real a Meta.
- Producao: commit `052ee8c`, deploy `dpl_Huqfv9ccSZowLoevus3YjvcZED1p` e versao `v5.13` confirmados.

## Arquitetura obrigatoria das artes

- Feed: `1080 x 1350 px`, proporcao `4:5`.
- Story: `1080 x 1920 px`, proporcao `9:16`.
- Zona segura do Story: 250 px reservados no topo, 1170 px centrais para o conteudo principal e 500 px reservados na base.
- Marca, titulo, texto, foto e CTA devem permanecer na area central para nao serem cobertos pela interface do Instagram.
- Os modelos automaticos e o gerador da Grade semanal obedecem a mesma arquitetura.
- Upload manual com dimensoes diferentes e bloqueado no painel antes do envio.
- Testes permanentes: `feedArchitectureGuard` e `storySafeZoneGuard`.
- Render verificado: `2026-08-16-195611-slot-0-render-only`, sem sobreposicao e sem publicacao real na Meta.
- Producao: commit `bdf8f7e`, deploy `dpl_6ySxPMN4Jw16BgBwkNdqGwgyKLKQ` e versao `v5.12` confirmados.

## Radar fiel a materia original

- O Radar nao considera mais a palavra isolada `agente/agentes` como evidencia de uma pauta sobre agentes de IA.
- Titulo, fato central, fonte e URL completa da materia precisam permanecer no conteudo e na legenda.
- A aplicacao empresarial e apresentada separadamente como analise editorial, sem atribuir a fonte afirmacoes que ela nao fez.
- A camada de engajamento preserva o texto pesquisado e nao transforma noticias em chamadas genericas.
- A validacao bloqueia pauta sem contexto real, link completo ou titulo original antes da publicacao.
- O caso incorreto do TecMundo foi identificado no permalink `https://www.instagram.com/p/DcHiH0mmQGl/`; a publicacao existente nao foi removida nem republicada.
- Verificacao feita por testes semanticos e pelo render-only `2026-08-16-194931-slot-0-render-only`; nenhuma nova publicacao real foi criada durante a correcao.
- Producao: commit `f370527`, deploy `dpl_GnmfBVsTkSxNYatKPdaxZKDwa9cz` e versao `v5.11` confirmados.

## Scroll livre na landing

- O carrossel movimenta somente a navegacao horizontal interna.
- A troca automatica de telas nao reposiciona mais o scroll vertical do visitante.
- Teste de producao manteve `scrollY = 3000` antes e depois da troca de slide, com variacao zero.
- Producao: commit `23c632e`, deploy `dpl_6UEgfMDkVaF1Wb3Tdmy1t9kC5Q7y` e versao `v5.10` confirmados.

## Sistema simplificado

- A lista `Ultimas execucoes` nao aparece mais na aba Sistema.
- O botao `Atualizar runs` e o atalho tecnico do GitHub Actions foram removidos do cabecalho.
- O Checklist operacional e o Vigia automatico concentram a leitura de saude e recuperacao.
- Os workflows e registros tecnicos continuam ativos nos bastidores.
- Producao: commit `0abd4ac`, deploy `dpl_3bbZncNTM8Btq1hN1oSRMYvZiwC6` e versao `v5.09` confirmados.

## Rotacao de fotos sem repeticao proxima

- A conta principal usa sete fotos diferentes na rotacao visual.
- A foto da capa fica bloqueada nas seis publicacoes seguintes e so volta depois que as demais circularem.
- O historico de publicacao registra `coverAvatar` e `avatarRotationStart` para manter a regra entre execucoes do GitHub Actions.
- A validacao de copia tambem testa o rodizio completo das sete imagens.
- Producao: commit `0f56d34`, deploy `dpl_GuYANuJz6XfNMpCV8j4TJmMREx61` e versao `v5.08` confirmados.

## Recuperacao automatica do vigia

- A checagem operacional tenta recuperar automaticamente cada novo erro aberto uma vez por sessao.
- Enquanto o GitHub Actions processa a nova tentativa, o painel mostra `Correcao automatica em andamento`.
- O usuario tambem pode usar `Corrigir automaticamente` ou abrir o run original em `Abrir detalhes do erro`.
- O indicador do cabecalho direciona ao painel do vigia quando existe erro.
- O antigo erro de caminho do Story esta resolvido pelo run `31976129574`; estado atual com zero erros abertos.
- Producao: commit `5c86c98`, deploy `dpl_EawWBYhxf9cv6tR3i3xj5XzMdVzA`, versao `v5.07` e controles confirmados por `HTTP 200`.

## Landing com telas atuais

- O carrossel comercial possui 10 novas capturas reais do dashboard autenticado.
- As imagens mostram os layouts atuais da Agenda, Grade semanal, Bio, Direct por datas, Clientes e Sistema/Radar.
- Textos e alternativas das telas explicam os recursos novos e usam cachebuster `v=506`.
- Deploy final: `dpl_DkbgqcivNVrU1hEGgiPaYMoytkxf`; pagina e dez PNGs confirmados com `HTTP 200`.
- A correcao do caminho absoluto do Story esta no commit `d572c48` e deploy `dpl_EmgJdLddPQyCgeNgUTxxHgL1MoK1`.
- Publicacao posterior confirmou a correcao: Feed `18061986080757054`, Story `18004000334979257` e permalink `https://www.instagram.com/p/DcHhtghkwu8/`.

## Historico do Direct por data

- A aba ocupa toda a largura e usa a lateral para listar as datas com registros.
- Cada data informa total, enviados e falhas e pode ser clicada para filtrar o historico.
- `Todas as datas` remove o filtro e a paginacao acompanha a selecao atual.
- No celular, as datas aparecem antes da lista em formato compacto.
- Producao: deploy `dpl_9Ferz1KTrP9s4hMedXe1Pmr69FVb`, versao `v5.06` e componentes confirmados por `HTTP 200`.

## Banners da Grade semanal

- Cada programa aceita uma arte pronta para Feed 4:5 e outra para Story 9:16.
- O painel mostra upload, URL, remocao e miniatura separadamente para cada formato.
- O gerador interno cria e envia os dois JPEGs nas dimensoes 1080 x 1350 e 1080 x 1920.
- A previa e o publicador escolhem automaticamente a imagem correspondente ao formato.
- Programas antigos continuam compativeis pelo campo de imagem legado.
- Producao: deploy `dpl_DRZVBictSUUAbwMPBdN8v7hJitDt`, versao `v5.05` e controles confirmados por `HTTP 200`.

## Metricas de interacao

- O painel separa as metricas do ultimo post do resumo dos 10 posts mais recentes.
- O ultimo post mostra data/hora, curtidas, comentarios, alcance, salvos e interacoes confirmadas.
- O resumo recente informa curtidas, comentarios e quantos posts tiveram interacao.
- O total confirmado nao fica abaixo das curtidas, comentarios e salvos ja retornados pela Meta.
- Producao: deploy `dpl_4FPsFUL4xpA4XxFw6M9D1Cc8UV8y`, versao `v5.04` e interface confirmadas por `HTTP 200`.

## Grade semanal com postagem pronta

- A aba ocupa toda a largura e organiza editor e previa ao vivo lado a lado.
- A arte acompanha os campos do programa e aceita a imagem cadastrada como fundo.
- O usuario alterna entre Feed 4:5 e Story 9:16 antes de salvar.
- A previa acompanha o programa que estiver sendo editado e, no celular, aparece abaixo do formulario.
- Producao: deploy `dpl_3kZ9hfT17Naq7MasdqiPS9RM5zAh`, versao `v5.03` e componentes confirmados por `HTTP 200`.

## Agenda em largura integral

- A aba Agenda nao herda mais a coluna lateral vazia do layout geral.
- Os 13 horarios, a programacao de hoje e amanha, o Radar, a previa e o editor usam toda a largura disponivel.
- Em telas menores, a grade geral continua em uma coluna.
- Producao: deploy `dpl_F2cr6sqjsfKpQsNXeraxAFwfenyG`, versao `v5.02` e estrutura confirmadas por `HTTP 200`.

## Editor da Pagina Bio

- A aba ocupa toda a largura e usa editor a esquerda e previa real a direita.
- A previa acompanha a rolagem em uma moldura de celular e atualiza durante a edicao.
- Abaixo de 920 px, a previa vai para baixo do formulario para preservar leitura e toque.
- Salvar continua sendo a acao que atualiza a pagina publica.
- Producao: deploy `dpl_9PhjEMu3exUFZmNGJ5JfHY8jxRKg`, versao `v5.01` e componentes confirmados por `HTTP 200`.

## Visao operacional completa

- A aba Sistema ocupa toda a largura, sem deixar o centro vazio e os controles comprimidos no canto.
- A abertura apresenta seis recursos dinamicos: Radar, criacao de conteudo, agenda/publicacao, Direct, Pagina Bio e clientes/onboarding.
- O Checklist operacional, terminal, workflows, vigia, versao e manutencao ficam reunidos na mesma area.
- A checkagem inclui Radar/fontes, quantidade de conteudos, duplicidade, nuvem, Direct, Bio, onboarding, vigia e Meta/metricas.
- A grade usa tres colunas no desktop, duas em tablet e uma no celular.
- Producao: deploy `dpl_654XqDMJD5r6jWTYFb5AEgQEcFwF`, versao `v5.00` e nova visao confirmadas por `HTTP 200`.

## Usabilidade da aba Clientes

- A aba ocupa toda a largura e nao deixa mais a area central vazia enquanto os formularios ficam comprimidos na lateral.
- O fluxo visual possui quatro passos: cadastro, convite, conexao Meta e ativacao.
- O cadastro da empresa esta dividido em secoes claras e duas colunas no desktop.
- O CTA principal e `Criar empresa e gerar convite`; o convite seguro aparece em destaque logo abaixo.
- Usuarios por conta ficam depois do onboarding e usam uma grade mais ampla.
- No celular, todas as etapas e campos ficam em uma coluna.
- Producao: deploy `dpl_783HGZmg6Zy311LxLDvXC6YeNz9R`, versao `v4.99` e novo layout confirmados por `HTTP 200`.

## Rodizio atual das fontes do Radar

- O Radar possui 11 fontes padrao cadastradas; a disponibilidade real depende de cada feed possuir noticia recente e aderente ao perfil.
- A escolha de publicacao nao depende mais apenas da ordem/recencia do RSS: prioriza a fonte menos publicada no historico e a que esta ha mais tempo sem aparecer.
- Termos em ingles reconhecem equivalentes em portugues, liberando pautas validas de G1 Tecnologia, Olhar Digital e TecMundo.
- A validacao real atual encontrou 34 noticias elegiveis em 6 origens: G1 Tecnologia, Olhar Digital, TecMundo, n8n, AWS Machine Learning e OpenAI.
- O watchdog principal e o reserva persistem `publication-history.json`; ambos participam do mesmo grupo de concorrencia.
- URL ja usada, fonte consecutiva, chamada de capa repetida e conteudo duplicado continuam bloqueados.
- Producao: deploy `dpl_ELgHHpnEPjxatF5wCfGj1k2bZYs5`, versao `v4.98` confirmada por `HTTP 200`.

## Onboarding seguro de novas empresas

- O administrador cria a empresa e recebe um link de ativacao com assinatura e validade de 48 horas.
- O @ do Instagram e opcional no cadastro; se informado, ele e conferido contra a conta autorizada.
- O cliente acessa `/ativar` e conecta a propria conta pelo Instagram Login da Meta, sem entregar login ou senha.
- O checklist publico mostra empresa criada, conta profissional, conexao, permissoes e liberacao final.
- O painel permite copiar o convite inicial e gerar um novo convite para a empresa selecionada.
- A carteira de clientes informa se o Instagram esta conectado ou aguardando o cliente.
- Tokens e IDs ficam somente no servidor, nos envs separados por empresa, e nao aparecem no navegador.
- O fluxo esta implementado e validado localmente. A producao ja possui `INSTAGRAM_APP_SECRET`, mas falta `INSTAGRAM_APP_ID`; tambem e necessario registrar o callback na Meta e possuir acesso avancado para contas externas.
- Callback esperado: `https://cliente-x-instagram.vercel.app/api/state?instagram=callback`.
- Producao: deploy `dpl_HJaUzpGEEGH3qfmddaVRnkRFgDz5`, com `/ativar` e controles do painel confirmados por `HTTP 200`; convite invalido recusado com `HTTP 400`.

## Checkagem operacional do painel

- O bloco `Checklist operacional` possui o botao `Atualizar checagem` e um terminal que detalha as verificacoes como `OK`, `ATENCAO` ou `ERRO`.
- O cabecalho exibe a checkagem em tempo real: estado aguardando, progresso `Etapa N de total`, resultado verde `Checkagem: tudo OK`, resultado vermelho para atencao e horario final em BRT.
- O indicador do cabecalho e uma regiao `aria-live=polite` e usa ponto animado enquanto a verificacao esta em andamento.
- Depois da conclusao, o terminal exibe abaixo dele o botao de largura completa `Realizar nova checagem`, que repete o mesmo diagnostico. Ele fica oculto durante a execucao e reaparece no final.
- A checkagem roda automaticamente ao restaurar uma sessao valida e logo depois de um novo login; tambem pode ser repetida manualmente pelo botao.
- Os commits funcionais sao `205a860` (`Adiciona terminal de checkagem operacional`), `b584a48` (`Executa checkagem automaticamente no painel`), `618420b` (`Adiciona botao para repetir checkagem operacional`) e `94fa661` (`Exibe checkagem em tempo real no cabecalho`).
- A producao foi inspecionada sem autenticacao e confirmou a entrega do botao, do terminal e das duas chamadas automaticas no HTML servido.
- A producao confirmou o novo botao, seu listener e a alternancia de visibilidade no HTML servido. Como a sessao do navegador expirou, falta somente confirmar o clique real dentro de uma sessao autenticada.

## Estado confirmado

- O usuario confirmou explicitamente: `ate tudo funcionando grave na memoria tudo que foi feito`.
- Workspace limpo no momento da confirmacao; branch local, `origin/main` e `origin/feature/modern-editorial-system` estavam no checkpoint de memoria `dbe6ce9` antes deste novo registro.
- O dashboard de producao esta confirmado na versao `v4.96`.
- A Pagina Bio permite criar ate `10` botoes. Ha um controle no cabecalho e outro campo destacado abaixo do ultimo cartao; o novo botao recebe icone, titulo, descricao e link, com rolagem e foco automaticos.
- Cada conta permite ate `10` automacoes de Direct, cada uma com nome, tags, material e mensagens proprias. A campanha antiga permanece compativel e o historico identifica qual automacao respondeu.
- A conta atual possui `Material 1` e `Instagram automatico`; as duas automacoes estao ativas. A segunda responde a `Quero` e entrega o link da plataforma. Variacoes de caixa da mesma palavra nao geram falso conflito, mas a mesma tag permanece proibida entre materiais diferentes.
- O painel preserva `Meta conectada` depois de salvar as automacoes; webhook, segredo do app e token de mensagens existem na producao.
- A automacao `Instagram automatico` foi comprovada com o comentario real `QUERO`: Direct com status `sent` e resposta publica registrada em 2026-08-16 17:17 BRT.
- O Radar usa somente fontes oficiais e aceita noticias dos ultimos 7 dias; ele nao usa pack manual nem pack automatico generico como reserva.
- Quando nao encontra pauta oficial valida e nao repetida em 7 dias, o Radar amplia automaticamente para 15 dias e depois para 30 dias. Somente bloqueia depois de esgotar as tres janelas.
- Uma pauta com link de fonte diferente e aceita mesmo quando usa a mesma estrutura editorial; o mesmo link continua bloqueado. A regra publicou com sucesso `https://www.instagram.com/p/DcHCaxjG4Ew/` no run `31962694454`.
- Fontes atuais incluem os provedores oficiais de IA e, como cobertura jornalistica complementar, G1 Tecnologia, Olhar Digital e TecMundo.
- As pautas sao intercaladas por fonte, e duas publicacoes pesquisadas consecutivas nao podem usar a mesma origem. Teste real encontrou G1 Tecnologia, TecMundo, n8n, AWS, OpenAI, Microsoft Cloud e Anthropic na mesma fila elegivel.
- O Radar compara tambem a frase da capa com as ultimas `50` publicacoes da Meta e com `coverTitle` salvo no historico; uma noticia diferente nao pode reutilizar uma chamada visual recente.
- A trava agora vale para `Publicar agora`, horarios automaticos, packs manuais e posts agendados: toda publicacao real com Radar ativo exige `research.sourceUrl`.
- Se nao houver noticia oficial elegivel e nao repetida, o publicador bloqueia o envio em vez de publicar conteudo solto.
- A automacao agendada roda na nuvem por GitHub Actions e Meta/Instagram; o computador do usuario pode ficar desligado. O login do painel e necessario somente para acoes manuais no dashboard e expira em 12 horas.
- As capas do Radar variam pela pauta: cor, composicao, titulo e foto agora usam a fonte/tema como semente visual.
- As tres fotos com notebook e fundo escuro, muito semelhantes entre si, foram retiradas da rotacao. Permanecem apenas cenarios distintos: escritorio, reuniao, apresentacao e ambiente descontraido.
- Legendas do Radar agora sempre recebem hashtags no final, inclusive quando a fonte oficial nao as fornece.
- Cartoes de texto de apoio usam fonte grande para leitura no celular: o bloco verde usa 30 px e a frase de apoio e curta e completa. A legenda preserva a explicacao completa; a arte evita paragrafo comprimido e nao cobre o indicador “Arraste para ver”.
- A rotacao percorre as quatro fotos de Marcondes antes de repetir, sem a semente da pauta anular a sequencia dos horarios.
- A foto da capa usa moldura padrao de `410 x 280`, recorte proporcional e altura minima protegida contra achatamento.
- O Story mostra a primeira ideia completa do slide e possui validacao que rejeita qualquer sobreposicao entre texto e foto.
- O cartao `FONTE OFICIAL` usa tipografia e espacamento compactos, quebra nomes longos e mostra `Pauta relevante para empresas.` sem cortar texto.

## Landing comercial em producao

- Nome provisorio: `Nerion Social`; ainda requer validacao formal de marca antes do lancamento definitivo.
- Oferta promocional: de `R$ 397/mes` por `R$ 197/mes` para novos clientes.
- O selo de destaque da oferta agora diz `Oferta relampago`; este e o checkpoint comercial visual mais recente.
- Volume destacado: mais de `12` carrosseis no feed por dia e `12` Stories diarios aparecem em blocos numericos proprios no cartao principal da oferta.
- Implantacao de `R$ 297` riscada e apresentada como gratuita.
- A secao de credibilidade usa provas verificaveis: publicacoes reais do Instagram, confirmacao tecnica no painel e links publicos; nao ha depoimentos ficticios.
- Garantia de implantacao: a configuracao continua sem custo adicional ate marca, agenda e uma publicacao de teste estarem confirmadas. A garantia nao promete alcance, seguidores, engajamento ou vendas.
- Entrega comunicada: criacao automatica de conteudo, criativos, carrossel, Story e legendas; agenda, publicacao na nuvem e Direct.
- Para um volume menor, a pagina oferece consulta de plano menor; licenca personalizada permanece sob medida.
- Promessa central: manter a rede social ativa, cuidada e atualizada sem o cliente criar ou publicar cada conteudo manualmente e sem depender do computador ligado.
- Headline atual: `Conteudo criado, agendado e publicado para a sua empresa.` A abertura explica diretamente que a Nerion Social pesquisa pautas, cria carrosseis, Stories e legendas e publica automaticamente no Instagram seguindo a identidade da marca.
- O hero nao repete mais uma captura geral do painel: apresenta o Radar editorial em quatro etapas, explicando pesquisa recente, validacao de fonte, prevencao de repeticao e adaptacao ao negocio.
- A demonstracao do Radar comunica a busca progressiva de `7`, `15` e `30` dias, a exigencia de link rastreavel e o encaminhamento da pauta aprovada para carrossel, Story, legenda e agenda.
- O CTA `Quero ver uma demonstracao` aparece antes do preco e na primeira tela do celular. A faixa seguinte resume publico, criacao, publicacao e Direct sem exigir conhecimento tecnico.
- A contratacao foi esclarecida: o Plano Completo combina plataforma, configuracao assistida e suporte para uma marca; operacoes com varias contas ou integracoes usam projeto personalizado.
- A secao de provas nao usa mais artes isoladas de feed/Story: ela incorpora duas publicacoes reais do perfil `@marcondes.machado.oficial`, com navegacao e links oficiais para `DcHMqdWE3bI` e `DcHDsOKkzvp`.
- Os embeds reais foram confirmados em producao sem mensagem de post removido e sem erros de console; cada card tambem possui o link `Abrir post` como alternativa.
- A demonstracao do painel agora e um carrossel com 10 capturas reais: `Visao geral`, `Conteudo`, `Automacao do Direct`, `Historico do Direct`, `Agenda`, `Grade semanal`, `Pagina Bio`, `Clientes`, `Cobranca` e `Sistema`.
- Cada pagina possui contador, explicacao, link para ampliar, seletor direto e navegacao por setas. A troca automatica continua a cada `6,5 segundos`, pausa durante interacao e respeita movimento reduzido.
- O slide `Automacao do Direct` mostra Meta conectada, campanha ativa, palavras-chave, correspondencia, material e perfil editorial da conta.
- A captura de Cobranca exclui o painel lateral de configuracoes; nenhum token, senha ou chave completa aparece na landing.
- O slide `Historico do Direct` foi reenquadrado para preencher a area e agora mostra exemplos reais de envios confirmados com palavra-chave, horario e status.
- O slide `Pagina Bio` usa uma captura desktop real de `https://cliente-x-instagram.vercel.app/bio`, com selo `Bio real` e botao `Abrir Bio real` apontando para o mesmo endereco publico.
- Mensagem de infraestrutura aprovada: `A plataforma e acessada na nuvem.` A landing nao deve mencionar computador nem celular, salvo novo pedido explicito.
- Beneficio comercial: aumentar oportunidades de engajamento e atrair seguidores reais e alinhados, com potencial para comprar produtos ou contratar servicos.
- Limite de comunicacao: nao garantir seguidores, curtidas ou vendas; consistencia e conteudo atual aumentam oportunidades, nao resultados certos.
- Visual: moderno, neutro e responsivo. O hero usa texto e plataforma lado a lado; capturas reenquadradas em 4:3 e 16:9 priorizam nitidez; beneficios ocupam toda a largura em quatro colunas no desktop e duas em telas menores.
- Animacoes: hero em camadas, brilho nas molduras e cartoes com revelacao/desfoque. Zoom e flutuacao continua foram removidos das capturas para preservar foco. Todo o conjunto respeita `prefers-reduced-motion`.
- Ultima validacao responsiva da landing: desktop e celular sem overflow horizontal, sem sobreposicao e sem erros de console.
- Validacao: imagens HTTP `200`, sem overflow horizontal, sem erros de console e `40` elementos animados testados ate o estado visivel.

## Padrao editorial aprovado para os proximos posts

- Escrever em portugues brasileiro simples, sem copiar titulos tecnicos ou em ingles das fontes.
- A noticia oficial serve de contexto e prova; ela nao deve ser a manchete principal.
- Abrir com uma situacao humana e reconhecivel da empresa: cliente esperando, equipe sobrecarregada, informacao perdida ou oportunidade sem retorno.
- Estrutura do carrossel: conexao humana, clareza do problema, o que a noticia mostra, caminho seguro e convite natural para conversar.
- Priorizar clareza, confianca e convencimento sem promessas exageradas ou pressao comercial.
- A tecnologia/IA fica como ferramenta de bastidor. O foco da comunicacao e equipe, clientes, rotina e resultados.
- Creditar a fonte de forma curta (`Fonte oficial: n8n, 14/08/2026`), sem repetir o titulo original em ingles na arte ou na legenda.
- Preservar o CTA final fixo dos 50 prompts, as hashtags finais e os 13 horarios em BRT.

## Validacoes executadas

Ultimas validacoes em `cliente-x-instagram-modern`:

```powershell
node --check automation/instagram-template/scripts/publish-carousel.mjs
npm run validate-copy
npm run render-only
```

Resultado:

- Verificacao de sintaxe: passou.
- `validate-copy`: passou (`20` packs, `54` packs automaticos e `74` selecoes automaticas verificadas).
- `render-only`: passou; Radar encontrou `13` temas recentes em fontes oficiais.
- Inspecao visual confirmou capa com foto proporcional e Story com texto encerrado acima da imagem, ambos sem corte nem sobreposicao.

## Publicacao real mais recente confirmada

- Conta: `@marcondes.machado.oficial`.
- GitHub Actions: run `33216450654`, concluido com `success` em 2026-08-28 19:23 BRT.
- Permalink confirmado no perfil: `https://www.instagram.com/p/DcmbM_kGgSV/`.
- Media ID: `17953144551209392`; Story ID: `17980736346111529`.
- Fonte: G1 Tecnologia; pauta e fatos persistidos em portugues.
- Registro anterior:
- GitHub Actions: run `33215506981`, concluido com `success` em 2026-08-28 19:09 BRT.
- Permalink confirmado no perfil: `https://www.instagram.com/p/DcmZo_rk_2f/`.
- Media ID: `18090005111272483`; Story ID: `18144325813720376`.
- Pauta: OpenAI, `Supporting Thailand’s next generation of AI startups`, com fonte oficial preservada na legenda.
- O erro `OAuthException #10` permaneceu restrito ao primeiro comentario e nao impediu feed nem Story.
- Registro anterior:
- GitHub Actions: run `31925600428`, concluido com `success` em 2026-08-16 01:02 BRT.
- Permalink confirmado no perfil: `https://www.instagram.com/p/DcFjsXZHIil/`.
- Pauta: Radar editorial com fonte oficial recente, adaptada para a realidade de empresas brasileiras.
- Legenda gerada com hashtags finais e arte usando o cartao de texto ampliado da versao `v4.89`.
- Registro anterior: run `31924984201`, concluido com `success` em 2026-08-16 00:46 BRT.
- Permalink confirmado no perfil: `https://www.instagram.com/p/DcFh6FWG8f0/`.
- Pauta: n8n; abordagem para empresas sobre rastreabilidade e clareza nas decisoes.
- A capa publicada usa a nova rotacao de cenarios distintos da versao `v4.87`.
- A fonte foi conferida no carrossel visivel do perfil apos a conclusao do workflow.
- Registro anterior: run `31923469806`, concluido com `success` em 2026-08-16 00:08 BRT.
- Permalink: `https://www.instagram.com/p/DcFdj-ZjQef/`.
- Fonte: n8n, noticia oficial publicada em 14/08/2026.
- Observacao: esse post foi publicado antes do refinamento final de linguagem e conexao humana da versao `v4.84`; os proximos posts usarao o novo padrao.

## Cuidados importantes

- Nao tratar dry-run, render ou apenas um run verde como prova de post real: exigir permalink do Instagram e etapa `Publish feed and story` concluida.
- Nao reduzir os 13 horarios para resolver repeticao; variar pauta e abordagem.
- Nao remover o rodizio de fontes nem a trava de `coverTitle`; elas evitam concentracao em n8n/OpenAI e duplicidade visual entre pautas diferentes.
- Bump de versao visivel deve atualizar `api/state.js` e `docs/dashboard.html` juntos.
- O projeto moderno e separado do checkout antigo `cliente-x-instagram`; confirmar o repositorio-alvo antes de alterar ou publicar.

## Proximo passo recomendado

- Correcao de 2026-09-02 19:35 BRT pronta para envio: separar a fila manual da fila automatica, reforcar os quatro disparos independentes de 15 minutos do watchdog, executar recuperacao apos o workflow principal e persistir por 48 horas a ultima coleta valida do Radar. O cache inicial contem 27 pautas de G1 Tecnologia, n8n e OpenAI. A Vercel Hobby foi descartada como segundo cron por aceitar apenas execucao diaria. Depois do envio, exigir prova do proximo slot automatico por run final, ledger, permalink, ID do Feed/Reel e ID do Story.
- Primeira prova sem intervencao: run agendado `33692327772` as 19:50 BRT acionou o watchdog `33692370977` por `workflow_run`; ambos concluiram com sucesso no commit `30c9b3f` e nao publicaram fora de horario. O proximo teste com publicacao devida e o slot 12, as 22:00 BRT.

- Capa dos proximos Reels corrigida em 2026-09-02 17:30 BRT: a foto deixa de ser miniatura isolada no alto; tres composicoes amplas passam a alternar por horario e o banco empresarial sobe de quatro para sete imagens. Confirmar visualmente o proximo Reel real antes de considerar a correcao encerrada.

- Correcao enviada ao `origin/main` em 2026-09-02 17:24 BRT para contornar automaticamente o `422 Update is not a fast forward` na hospedagem GitHub: carrossel, Story e Reel passam a reler o HEAD e repetir somente essa colisao segura ate seis vezes. Validacoes de sintaxe, diff e copy aprovadas; falta apenas confirmar o comportamento no proximo run automatico real.

- Direct: `LIVRO` esta cadastrado na automacao `50 Prompts de IA`, mas a Meta bloqueia o envio enquanto `Permitir acesso as mensagens` estiver desligado no aplicativo Instagram. Ativar essa chave e testar com comentario de outra conta.

- Conferir visualmente o Reel `https://www.instagram.com/reel/Dcy6bJVAPuC/`, publicado com a nova capa lateral; IDs confirmados: Reel `18077182838342033` e Story `18063951035769508`.
- A campanha do livro possui agora dois itens publicados e 19 pendentes.
- Os 19 posts pendentes possuem imagem nos cinco slides, com oito visuais e tres composicoes em rodizio; o render completo foi aprovado antes da liberacao.
- O primeiro carrossel integralmente corrigido esta publicado em `https://www.instagram.com/p/Dcy8DiAmLUq/`; Feed `17884934352476762`, Story `18094862405434959`. Restam 18 posts do livro.

- Campanha do livro: acompanhar o proximo item das 19:00 BRT ja com imagem grande e composicao alternada; confirmar a publicacao por permalink, ID do Feed/Reel e ID do Story.
- Story da campanha corrigido: os 18 itens pendentes passam a reutilizar a imagem da capa em um painel fotografico grande no formato 9:16; a trava automatica impede regressao para Story apenas textual. Aguardar o proximo run real para a prova visual e os IDs.
- Commit funcional do Story: `6dca382`, enviado ao `origin/main`; sem deploy Vercel. Validacoes: sintaxe, `git diff --check` e `validate-copy` aprovados.
- Publicacao real com o Story corrigido confirmada no run `33673473650`: `https://www.instagram.com/p/Dcy_cy5DfLo/`, Feed `18436198660131973`, Story `17912968407263304`, as 16:30 BRT. A arte hospedada foi inspecionada e possui fotografia grande na metade inferior. Fila persistida em `60ca672`; restam 17 posts do livro.
- Publicacao seguinte confirmada no run `33674428382`: `https://www.instagram.com/reel/DczAgGDjrOF/`, Reel `18103495247195444`, Story `17913972708445687`, as 16:40 BRT. A tentativa anterior `33673971851` falhou antes da Meta por corrida de referencia do GitHub e nao gerou post. Story final inspecionado com fotografia ampla e sem sobreposicao; restam 16 itens.
- Falha visual identificada no slide 2 desse Reel: o cartao cobriu a citacao. O renderizador agora detecta `headline x note`, ajusta o titulo/cartao e bloqueia qualquer colisao restante. O pack completo corrigido foi aprovado visualmente no dry-run `2026-09-02-164520-slot-0`; o post existente nao foi republicado.
- Primeira publicacao real com a trava: run `33675445921`, `https://www.instagram.com/p/DczBszGnftV/`, Feed `18625376119055915`, Story `17887053027614953`, as 16:50 BRT. Cinco slides e Story inspecionados sem sobreposicao. Restam 15 posts, tres por dia de 04/09 a 08/09, as 08:10, 14:15 e 19:00 BRT.
- Manter os sete visuais e as tres composicoes rotativas nos 20 posts pendentes; nao recolocar o primeiro item publicado na fila.
- O rodizio da campanha foi ampliado para oito visuais originais; pesquisas externas devem usar fonte oficial e nunca ser apresentadas como trecho do livro.

- Entrar no dashboard e aguardar a checkagem automatica terminar; registrar o resultado final e corrigir qualquer item que apareca como `ERRO`.
- Acompanhar os proximos posts automaticos e conferir se o publico responde melhor ao novo tom humano e consultivo.
- Acompanhar a resposta ao post `DcFh6FWG8f0` e manter a confirmacao por permalink em cada nova publicacao manual.
- Conferir o primeiro post automatico posterior a trava estrita do Radar por permalink e inspecionar visualmente o Story publicado.
- Em uma retomada futura, iniciar deste checkpoint e preservar a versao `v4.96`, o CTA dos 50 prompts, as hashtags finais, a rotacao completa de quatro fotos, a foto de capa proporcional e o Story sem sobreposicao.
- Na Pagina Bio, criar um botao real pelo novo campo, salvar e conferir o resultado na pagina publica.
- Para a landing, preservar a promocao de `R$ 397/mes` por `R$ 197/mes`, implantacao gratuita, mais de 12 carrosseis no feed por dia, 12 Stories diarios, planos menores sob consulta e a mensagem de seguidores reais com potencial comercial sem garantia de resultado.
- Para o Direct, acompanhar as proximas entregas das duas automacoes pelo historico; `Quero` e a campanha dos 50 prompts ja possuem envios reais comprovados.
- Antes de vender em escala, validar o nome `Nerion Social`, preparar termos/politica de privacidade e definir contrato e onboarding.

## Atualizacao 2026-08-29 13:25 BRT — v5.51

- `Novo carrossel de impacto` agora também aparece em `Lógica da postagem` e leva ao editor em `Conteúdo`.
- Novo `Botão Bottini` por conta: liga/desliga, dose leve/equilibrada/alta e vocabulário editável.
- `cliente-x`: desligado, dose equilibrada, palavras `incrível`, `sensacional`, `excelente`, `imperdível`, `isso tem qualidade`.
- Conteúdo próprio pode receber a energia Bottini; matérias do Radar permanecem sem esse tratamento.
- Validação de código e copy concluída. Commit `5616fa1` no `origin/main`; deploy `dpl_CSjtU1zTJp2r9zaHucozpXPeTyXe` em `READY` e HTML público confirmando a v5.51 e os dois novos controles.

## Atualizacao 2026-08-29 13:40 BRT — v5.52

- O carrossel de impacto passa a criar os oito cards com imagens e usa fotografia ampla como parte principal do layout.
- Três imagens editoriais originais foram adicionadas para fluxo, aprovação humana e continuidade operacional.
- Render `2026-08-29-133638-slot-0-render-only` aprovado visualmente, sem vazio central nem colisão entre foto e texto.
- Nenhuma postagem foi repetida. Commit `a81b313` no `origin/main`; deploy `dpl_AdPoEwmT4qwEHCBmVwiAcbRi6w6b` em `READY`; v5.52 e novo ativo visual confirmados publicamente.

## Atualizacao 2026-08-29 13:45 BRT — v5.53

- Cada slide aceita link direto de imagem ou link da página do site; páginas têm sua imagem principal localizada automaticamente.
- A imagem externa passa pelo layout do carrossel, sem eliminar título e descrição.
- Importação segura limita HTTPS, formato, tamanho, redirecionamentos e bloqueia redes privadas.
- Página oficial e URL direta da Meta Newsroom foram renderizadas com sucesso. Commit `93dc89f`; deploy `dpl_AcnJA3U3nbDES1jLqUa82YYJc2Gz` em `READY`; v5.53 e novo campo confirmados publicamente.

## Atualizacao 2026-08-29 13:50 BRT — v5.54

- A aba `Lógica da postagem` ganhou uma faixa superior com todos os cinco botões principais, antes dos campos longos do perfil.
- Atalhos: carrossel de impacto, Método IHC, Bottini, Radar e salvar perfil completo.
- Layout responsivo em 5/2/1 colunas. Commit `1d6f1f2`; deploy `dpl_785ZvJbNbpArFJk9iRQ4vx85mc4J` em `READY`; sessão autenticada confirmou v5.54 e todos os cinco botões visíveis no topo.

## Atualizacao 2026-09-03 14:21 BRT — token Meta e vigia

- Token de publicacao Meta sincronizado no GitHub e no Vercel; Graph API confirmou HTTP 200 para `@marcondes.machado.oficial`.
- Deployment de producao `dpl_AY4EMdPgB7PjMxDE8JWACs9eJou1` esta `READY`.
- Alertas vencidos do slot 12 foram marcados como resolvidos; novos sucessos passam a encerrar automaticamente todos os erros antigos de credencial da mesma conta.
- Capas de Reel nao exibem mais o cartao explicativo abaixo da foto; chamada, titulo, fotografia, progresso e CTA ficam na area segura. Correcao validada em render local sem republicacao automatica.
- Versao operacional atual: `v5.55`, base funcional `37a2de0`. O indicador do painel e a API foram sincronizados; nao usar mais `v5.54` como versao atual.
- Versao operacional preparada: `v5.56`. O botao `Forcar vigia` despacha diretamente o workflow backup, mostra retorno persistente na propria secao e mantem a trava do livro de slots contra duplicidade.

## Atualizacao 2026-09-03 15:10 BRT — slot 8 publicado

- Run `33788473847` concluido com publicacao real: `https://www.instagram.com/p/Dc1a1vUILNI/`.
- Feed `17993741744830872`; Story `18151594885469699`; publicado as 15:08 BRT.
- A colisao visual da tentativa `33788043842` foi corrigida no commit `3cc1272` e seu alerta esta resolvido. O vigia esta sem erros abertos.
- Proximo slot automatico: slot 9, as 16:00 BRT, em modo Reel + Story.

## Atualizacao 2026-09-03 15:25 BRT — Radar e visual de noticias

- Radar ativo com 26 fontes cadastradas e busca ampliada para ate 160 candidatos recentes.
- Coleta real validada: 107 pautas elegiveis, 12 fontes com resultados e 106 imagens editoriais disponiveis.
- Noticias automaticas usam `impact-carousel` e priorizam a imagem principal do site na capa e no Story.
- A protecao semantica bloqueia titulos que repetem a mesma frase/promessa trocando apenas o assunto inicial.
- Render `2026-09-03-151914-slot-9-render-only` aprovado visualmente; nenhum post de teste foi publicado.

## Atualizacao 2026-09-03 16:18 BRT — novo formato comprovado em producao

- Slot 9 publicado automaticamente pelo run `33795075492`: `https://www.instagram.com/reel/Dc1ie2IIMzk/`.
- Reel `17959746996078289`; Story `17987405637044763`; horario real 16:15 BRT.
- Primeira pauta do Radar ampliado veio da Nossa IA e utilizou a imagem editorial do site em destaque.
- Story real inspecionado sem corte ou sobreposicao; livro de slots atualizado e zero alertas abertos.
- Primeiro comentario falhou isoladamente com Meta `OAuthException #10`; a publicacao principal e o Story foram concluídos.

## Atualizacao 2026-09-03 16:27 BRT — preenchimento dos cards

- Cards internos do `impact-carousel` foram reequilibrados para eliminar o grande vazio central visto no slot 9.
- Titulos, paineis explicativos e CTA final agora ocupam proporcionalmente a tela 4:5, com texto centralizado verticalmente e sem faixa branca estreita.
- Render `2026-09-03-162428-slot-10-render-only` aprovado nos cinco cards; sem colisao e sem publicacao de teste.

## Atualizacao 2026-09-03 16:33 BRT — Reel sem instrucao de carrossel

- `ARRASTE PARA VER` deixa de ser renderizado em `reel-only` e `reel-and-story`, permanecendo apenas nos carrosseis.
- A validação automatizada compara os dois modos e bloqueia regressão; `npm run validate-copy` aprovado.
- Branch `ops/record-slot8-20260903`, base `17a3878`; falta enviar a correção e comprovar visualmente no próximo Reel real.
