# Historico

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
