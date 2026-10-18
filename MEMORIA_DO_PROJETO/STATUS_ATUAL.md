## 2026-10-17 - resultado final: reposição v3 não ativada

Runs posteriores:39076836345 concluiu leituras individuais (sete confirmadas e uma descartada) mas reprovou o mapa;39077206295 reaproveitou leituras vinculadas a hashes e usou Sonnet para seleção textual, sem aprovação;39077433339 acrescentou identificação editorial da fonte, mantendo observação dos pixels e conferência bíblica independentes, e também rejeitou o mapa. Não atribuir a falha atual apenas ao transporte de imagem: o teste completo de correspondência com capa/texto/passagem não foi validado. Não houve nova receita automaticamente aprovada nem publicação.

Código v3 preserva leitura cega individual, descarte de respostas nulas somente nessa leitura, seleção/comparação/factual em modelo textual separado, fonte como contexto de identificação sem substituir pixels ou passagem, cache positivo de24h vinculado a modelo/versão/prompt/SHA original e imagem enviada, e limites que reservam espaço para comparação e controle factual. Leituras do run39076836345 foram recuperadas dos recibos Git, conferindo novamente hash do JPEG enviado, prompt e fonte original. Cache permite evitar repetir chamadas já confirmadas. Nenhuma aprovação foi criada manualmente.

Estado final enabled=false/circuit=vision_validation_failed, zero chamadas reservadas. Limites operacionais26/1,5M/3 restaurados. Guia/PDF v1.5 informa resultado completo, sem confundir Actions verde com cenas aprovadas. Deploy intermediário dpl_FWJQaipwkKQkiBDNx2GmNd8LB3F8 READY, guia/PDF200 e hash conferido. Anexar confirmação do deploy final após este registro. Falta um modelo/configuração de serviço que passe no piloto integral; não transferir a conferência recorrente ao usuário nem prometer continuidade de todos os horários.

## 2026-10-17 - correção v3 e bloqueio confirmado do serviço de visão

Pedido: automatizar revisão das cenas na nuvem, sem validação recorrente do usuário ou computador ligado. Branch fix/kids-illustrated-stock-slot8, worktree kids-profile-20261017 alinhada com origin/main. Nenhuma chave foi lida ou exibida; apenas o segredo GitHub existente foi usado no destino já autorizado.

Diagnóstico39075446351 comparou Sonnet base64/JSON (1 de2 verificações básicas), URL/JSON (1 de2, descrição errada), base64/resposta estruturada (2 de2) e Haiku base64/JSON (2 de2). Esses números não são aprovação semântica geral. Holdout39076244962: Haiku descreveu corretamente três imagens novas conferidas contra JPEGs originais; na quarta informou não conseguir ver. Não inferir precisão permanente por casos iniciais.

Implementada prova v3-blind: leitura de cada JPEG individual sem passagem, legenda ou nomes; seleção textual apenas das observações; outra comparação com cartões e passagem integral sem reescrever a observação; conferência factual literal. Prova exige observação vinculada ao SHA original e ao hash/tamanho da imagem enviada. Provas v2 antigas não autorizam receitas novas. Rejeições antigas não contaminam feedback de outra versão/modelo. Imagens sem leitura confirmada são descartadas; respostas nulas podem ser descartadas exclusivamente na leitura individual, nunca na seleção ou no controle factual.

Piloto39075839941 rejeitou seleção ainda feita em prancha. Seleção foi migrada para observações individuais. Piloto39076050174 cancelado: Sonnet descreveu uma pessoa deitada em cama inexistente na cena08 de Zaqueu. Piloto39076470290 com Haiku/JSON recusou cena07 já anexada e pediu envio da imagem; log sanitizado confirma. Nenhuma nova receita automaticamente aprovada, nenhum render novo aprovado, nenhuma ativação e nenhuma chamada Meta deste fluxo. Serviços de visão atuais permanecem inconsistentes; não pedir conferência manual recorrente como solução. Falta suporte confiável de visão no serviço/modelo e novo piloto integral.

Estado final enabled=false/circuit=vision_validation_failed; orçamento temporário restaurado26 chamadas/dia,1,5M entrada/dia,3 pautas/run. Reserva cancelada permanece contada pelo máximo. Auditorias textuais das quatro contas preservadas. Guia/PDF v1.5 atualizado e renderizado. Testes locais de transporte, limites/prova v3, montagem e auditoria textual passaram; são simulações e não comprovam precisão da API real. Atualizar evidência de deploy abaixo após publicação do guia.

## 2026-10-17 — verificação final publicada

Deploy final dpl_61r1kasecVjFpYynEi7XHmVxRyFN READY em cliente-x-instagram.vercel.app. Painel autenticado real verificado: quatro relatórios próprios, limpeza imediata ao trocar contas e indicador Carregando até a resposta correta. Evidência output/kids-scenes/validacao-api-contas-painel-final.png. HTTP200 do painel/guia e PDF versão1.4 com hash idêntico ao local. Testes de API consultiva, privacidade, citações/prova factual, montagem, busca, guard de publicação e sintaxe passaram. Conteúdo/agenda não foram alterados pelas recomendações; o bloqueio da visão Kids permanece ativo.

## 2026-10-17 — validação editorial por API nas quatro contas

Pedido explícito do usuário: usar API para validar e aprimorar a plataforma nas contas cadastradas. Criado workflow manual platform-editorial-api-validation.yml, com segredo existente no GitHub, host claude-ss fixo e nenhuma chamada Meta. Dossiê por conta exclui contatos, briefing, logos anexos, tokens e dados de clientes. Não salva/aplica recomendações no conteúdo ou agenda.

Teste factual real passou4/4 casos (afirmação correta, cena ausente de Lucas24, número errado e instrução maliciosa dentro de alegação). Run39073425934 registrou esse teste. Runs39073598254 e39074021721 concluíram auditorias consultivas das quatro contas: cliente-x, cliente-turismo, sabedoria-kids e radioieqpc. Controles locais conferem citações literais, IDs, formato, escopo e não misturam contas. Provedor ocasionalmente informa zero de entrada: registrado como desconhecido e contado pelo máximo, permitido apenas no plano fixo confirmado e com limites de chamadas/tokens. Sem alegação de cobrança exata.

Relatórios em editorial-api-validation.json (10 chamadas no total desta validação), API state devolve somente o relatório da conta selecionada. Aba Sistema mostra revisão textual, casos de teste, data e sugestões específicas. Composição e desempenho não foram avaliados nessa auditoria: diagnósticos visuais gerados indevidamente são retirados pelo filtro determinístico, inclusive campos internos de estilo. VisualStandard nulo não implica ausência de marca. Testes de troca de conta/limpeza imediata, citações inventadas e exclusão de dados privados passaram. Interface autenticada real verificada nas quatro contas; pendência de conexão da Rádio não foi tratada como autorização de publicação.

Kids recebeu prova v2 com seleção, observação dos pixels e controle factual independente de acontecimentos visíveis, sem confundir comentários culturais de legendas da fonte com conteúdo da imagem. Provas vinculam fonte integral, cenas, observações, citações, hashes e render. Receitas em review-rejected permanecem bloqueadas sem repetir montagem.

Pilotos39073772550/39074036137/39074391132 NÃO produziram receita nova aprovada. No último, o provedor descreveu crianças lendo/desenhando inexistentes no conjunto; conferência local dos oito JPEGs originais mostrou apenas Zaqueu/Jesus. Remapeamento final rejeitou corretamente a capa fora do momento do título. enabled=false, circuito vision_validation_failed, limites operacionais26/1,5M/3 restaurados. Teste de cores/código e teste factual4/4 não comprovam precisão semântica da visão. Não declarar reposição autônoma ativa nem publicação nova. Duas receitas previamente revisadas prontas e uma já publicada seguem preservadas.

PDF/guia versão1.3 atualizados e renderizados; painel diferencia configuração, prontidão e publicação. Falta anexar a verificação do deploy final abaixo.

## 2026-10-17 — resultado do piloto: bloqueio factual mantido

Run39071797266 comprovou correção da persistência; rejeitou pães/peixes por capa incompatível e Story fora da referência. Run39072053494 produziu seleção automática para ressurreição, mas conferência do render local detectou falso positivo: Jesus aparecendo às mulheres foi associado incorretamente a Lucas24:6; esse encontro não consta de Lucas24:1-12. Receita kids-biblia-32 em review-rejected, montagem bloqueada, nenhuma ativação ou chamada Meta deste fluxo. Run10 cancelado, montagem não executada. Chamada interrompida sem recibo conserva contabilização máxima. Limite temporário40 do piloto restaurado26; enabled=false e circuito semantic_false_positive. Não remover esse circuito só por um teste de conexão ou render bem-sucedido. Nova liberação exige controle factual adicional demonstrado em casos positivos e negativos. Outras três receitas previamente revisadas permanecem.

Persistência, prévia, painel e documentação foram implementados, mas o objetivo de reposição sem conferência humana NÃO foi concluído: a revisão semântica do provedor atual falhou no teste real. Não afirmar que há estoque automaticamente aprovado, publicação nova ou continuidade ilimitada.

## 2026-10-17 — reposição de cenas novas em validação real

Usuário confirmou plano fixo sem cobrança extra por uso no claude-ss.ia.br. Integração mantém host HTTPS fixo, Bearer no segredo GitHub existente, sem exposição de credencial e sem retries de rede no mesmo ciclo. Modelo anunciado claude-sonnet-4.6 passou desafio real de pixels (código aleatório e cores); isso não comprova identidade do modelo.

Implementados descoberta licenciada, passagem bíblica integral, duas avaliações visuais com evidência por cartão e Story, detecção de cópias/espelhamentos, vínculo criptográfico entre texto/cenas/revisão, download íntegro e render oficial obrigatório. Uma remarcação limitada é permitida após reprovação semântica. Conteúdo reprovado não recebe aprovação implícita. Workflows de visão e publicação usam filas distintas; montagem segue a fila Kids existente. Não há chamadas Meta no repositor.

Rotina preparada para 05h40,11h40,17h40,23h40 BRT, até três pautas por execução,26 chamadas/dia e1,5M tokens de entrada informados/dia. Estoque alvo24 é limitado por pautas inéditas e fontes compatíveis; não é promessa de publicação infinita. Aprovação automática permanece desativada até piloto com receita nova e render íntegro. Tentativas anteriores revelaram reprovações semânticas e erros de protocolo; nenhuma foi convertida em aprovação.

Corrigido persistState para gravações sucessivas no mesmo processo sem tratar sua própria alteração de arrays como conflito concorrente. Teste com repositórios Git locais comprova preservação de edição concorrente de outra conta e HEAD inalterado. Commit62b05608. Piloto após correção: run39071797266, em acompanhamento. Resultado final deve ser registrado abaixo.

Painel e guia/PDF versão1.1 publicados, deploy READY dpl_78bJ5mUNKxyfKCDhi9CemXuBdE3x. HTTP200 do guia e PDF de produção com hash idêntico ao arquivo local. Validações de reposição, montagem, fontes, padrão bíblico, guard e merge passaram; chamadas dos testes locais são simuladas. Não confundir sucesso técnico com estoque novo ou publicação.

## 2026-10-17 — servidor Claude intermediario autorizado e teste de imagem

Usuário forneceu configuração ANTHROPIC_BASE_URL=https://claude-ss.ia.br + ANTHROPIC_AUTH_TOKEN e autorizou explicitamente o envio da credencial GitHub e de uma imagem pública a esse serviço. Não reutilizar a chave exposta no chat nem registrá-la em código. Diagnóstico manual agora permite escolha fechada anthropic/claude-ss, host fixo, Bearer só no proxy, x-api-key só na Anthropic, redirects proibidos, sem retries. Nenhuma alteração nos publicadores, aprovação editorial ou agendamentos.

Commit 7314f52d adicionou proxy; run 39067130313 autenticou com sucesso, mas não encontrou alias esperado. Commit 4f169818 aceita nomes Haiku/Sonnet anunciados pelo proxy (caracteres filtrados, sem thinking/reasoning) e inclui testes simulados de headers/host/recibo sem segredo. Run 39067275498 / job 117497436117 passou em 1m54s, authentication=true, vision=true, status=vision_response_received; modelo anunciado claude-haiku-4.5. Isso comprova resposta textual a requisição com imagem, NÃO acurácia de revisão bíblica, identidade real do modelo ou automação editorial pronta. publicationTriggered=false, automaticApprovalEnabled=false.

Recibo do provedor informou inputTokens=121181, outputTokens=46; consumo de entrada alto para teste curto, cobrança/origem desse volume precisa ser esclarecida antes de chamadas recorrentes. Nenhuma nova chamada de inferência após esse resultado. Evidência output/kids-scenes/teste-proxy-claude-sucesso.png e artifact kids-claude-connection-test. Não ativar rotina recorrente como decorrência do sucesso do diagnóstico.

## 2026-10-17 — teste manual Claude recusado (401)

Segredo KIDS_VISION_ANTHROPIC_API_KEY cadastrado pelo usuário no GitHub (valor não lido). Diagnóstico manual kids-claude-test.yml / scripts/test-kids-claude.mjs, commit 24f9792a: GET /v1/models primeiro; uma imagem e até 160 tokens de saída somente após autenticação, sem retries ou publicação. Run 39066056216 / job 117493855321 terminou em 57s com authentication=false, vision=false, invalid_credentials, HTTP401 às 17h18 BRT. Nenhuma chamada Messages enviada. Necessário substituir credencial no GitHub; não presumir chave válida ou integração visual ativa. Testes simulados de segredo ausente,401,hash inválido e chamada única passaram.

## 2026-10-17 — conferência visual nova pendente de credencial

Usuário informou que ainda não possui chave de API com faturamento. Nenhuma chamada paga ou seleção visual autônoma foi ativada. Painel agora distingue essa pendência da busca e da montagem já existentes; guia conferencia-cenas.html explica cadastro seguro do segredo proposto KIDS_VISION_OPENAI_API_KEY. O segredo sozinho não ativa nada: integração de visão, controle de consumo e teste real ainda necessários. Não reportar a integração como pronta.


## 2026-10-17 — montagem automática das cenas revisadas

- Pedido explícito: automatizar a etapa de montagem das cenas. Workflow kids-scene-assembly.yml às 05h50, 11h50, 17h50 e 23h50 BRT, separado da busca e do disparo Meta. Usa a mesma fila de concorrência do publicador Kids.
- Catálogo inicial: três mapas de cenas já conferidas (José, sarça, maná) em kids-reviewed-scenes.json. Texto/referência vinculados por copyFingerprint. Novas imagens descobertas não recebem aprovação automática nem entram nesta etapa sem seleção revisada. Limite intencional e informado no painel; não prometer aprovação semântica autônoma ou estoque infinito.
- Rotina baixa arquivos ausentes com limite, verifica JPEG/hash/cena de origem/termos/licença, monta cinco cartões + Story distinto, executa render-only oficial e só depois persiste o pack pronto. Reutiliza montagem íntegra validada por até 24h; histórico impede remontar/republicar conteúdo usado. Sem token Meta no workflow.
- Falha de integridade, referência/texto, licença, fonte ou render bloqueia a pauta automaticamente com sceneAutomation.status=blocked; guard de publicação respeita o bloqueio. Mudança de texto após montagem invalida aprovação por hash, inclusive em merge concorrente.
- Estado/recibos em kids-scene-automation.json, imagens e acervo persistidos com merge de três versões/índice Git temporário, sem force; outras contas preservadas. Painel Agenda/acervo mostra montagens prontas, bloqueadas, horários e execução.
- Testes: montagem idempotente, licença/termos/cena alterados, arquivos corrompidos, downloads simulados, Story distinto, bloqueio de texto, e integração Git real local com conta concorrente + asset passaram. Busca, padrão bíblico, merge e scheduled guard passaram. Falta neste checkpoint verificar execução real na nuvem.


- Verificação real: run 39063975194 / job 117487618716, Success em 1m41s. Três montagens ready, zero bloqueios; renderVerified=true em cada recibo e publicationTriggered=false. Commit remoto 67693415 preservou acervo/recibos. Artefato kids-reviewed-scene-renders 12111978271 contém 4,75 MB de evidências de render.
- Segunda chamada local com rede deliberadamente indisponível reutilizou os três recibos íntegros, sem downloads nem render repetido; arquivos de estado do teste restaurados.
- Painel deploy READY dpl_GrHoMN6B9cjaudhQnd2BNDzTK9mD, código b1cbc925; HTTP 200 contém controles da montagem automática. Autenticação do painel não foi contornada.

## 2026-10-17 — cenas selecionadas, conferidas e montadas

- Continuação pedida para as cenas após busca automática. Selecionadas 18 ilustrações Sweet Publishing / FreeBibleimages CC BY-SA 3.0 para três pautas existentes inéditas: José/irmãos (Gênesis 45:1–15), Moisés/sarça (Êxodo 3:1–12) e maná (contexto ampliado para Êxodo 16:1–18). Cinco cenas no Feed e outra no Story por pauta, com créditos e licença nas legendas e CREDITOS.txt.
- Fonte Samuel descartada deste lote: várias cenas do mesmo episódio eram iguais ou espelhadas, apesar de hashes JPEG diferentes. Não confundir hash distinto com composição distinta. Arquivos rejeitados ficaram somente em output/kids-scenes/samuel-rejected-repetition.
- Manifesto kids-reviewed-scenes.json registra URLs, cenas de origem, descrições, hashes de arquivos e termos, referência e revisão editorial assistida. Não autoriza aprovação automática de cenas futuras. A busca automática continua pesquisa; estas três montagens foram conferidas neste turno.
- Inventário agora 12/37 pautas ilustradas, não significa 12 inéditas disponíveis. Cadência e histórico preservados; nenhum disparo manual de publicação feito neste turno.
- Renderizações de cinco cartões + Story: 2026-10-17-163833 (José), 163841 (sarça), 163846 (maná), slot-0-render-only. Revisão visual das 18 fontes e 18 artes finais; validate-copy, padrão bíblico e scheduled guard passaram. Prévia output/kids-scenes/previas-cenas-revisadas.png.
- output/ excluído do deploy Vercel: prévias locais, arquivos de pesquisa e cenas rejeitadas não devem ser publicados junto com o site.
- Produção READY dpl_GfGggca8DzXUwhsnf4DGhBkUggwG, código 3ca07005. Conferidos os três JPEGs de capa com HTTP 200 image/jpeg e /output/kids-scenes/selected.html com HTTP 404.


## 2026-10-17 — busca automática de imagens em sites para Sabedoria Kids

- Pedido explícito: automatizar achar ilustrações em sites. Implementada descoberta de cenas licenciadas no FreeBibleimages, sem IA, chave de API ou disparos Meta.
- Rotina kids-image-discovery.yml: 05h35, 11h35, 17h35 e 23h35 BRT, oito pautas por execução, priorizando as menos consultadas, somente inéditas ainda sem padrão ilustrado completo. Usa a busca pública por referência bíblica traduzida e confere páginas de conjuntos.
- Fontes limitadas a originais Sweet Publishing com CC BY-SA 3.0/4.0, permissão comercial e adaptações verificadas e crédito social explícito. Rejeita licença incompatível, criador não autorizado, redirecionamento, host/caminho externo, página inválida e cartões finais de crédito; remove URLs duplicadas.
- Resultados em config/kids-image-discovery.json: cenas, miniaturas, referência, origem, licença, hash dos termos e data da consulta. Cada resultado permanece pending de revisão e publicationEnabled=false; não adiciona imagens automaticamente às pautas nem altera histórico/horários.
- Painel Agenda/acervo exibe contagens, execução, cenas sugeridas e links à fonte/licença. Falhas preservam pesquisa anterior com aviso; mudança de texto/referência invalida candidatos antigos.
- Primeiro teste de rede: quatro pautas, quatro conjuntos, 89 cenas; Moisés sarça, mar Vermelho, José reencontro e descanso/criação. Total pendente pesquisável 26; não confundir cenas localizadas com pautas ilustradas aptas (estas continuam nove).
- Testes de parser, licenças, URL/SSRF, repetição/créditos, limites de leitura e falhas passaram, junto com padrão bíblico, state merge e scheduled guard. Persistência usa helper concorrente existente. Falta neste checkpoint inicial verificar primeira execução na nuvem e deploy do painel.


- Validação final da busca: run 39062379350, job 117482818373, Success (1m03s), estado persistido em 55fd45ea. Após teste local + execução remota: 12 conjuntos, 236 cenas sugeridas para 11 pautas; uma das 12 consultadas não teve licença compatível confirmada. Nenhuma pauta promovida/publicada.
- Painel deploy READY dpl_HddHAAbDnLCQ4bedqiuEMhQLErCu (f5d243df), HTTP 200 com nova área. Login de produção solicitou autenticação; layout conferido em prévia local com dados reais e mesma função de renderização, sem contornar login.
- Falhas de rede/formato ao consultar conjunto preservam resultados anteriores e sinalizam erro; ausência de permissão/licença rejeita o conjunto.

## 2026-10-17 — decisão: usar sites licenciados, sem geração por IA

- Usuário interrompeu a implementação de geração de imagens: “DEIXA ENTAO ESSA PARTE VAMOS PROCURARR EM SITES”. Commit 2068dd01 integralmente revertido em 053566cc: workflow de IA, catálogo, API/controles e guia removidos. Nenhuma chamada paga realizada e nenhuma chave cadastrada. Não retomar IA sem novo pedido.
- Reposição por fontes existentes: FreeBibleimages / Sweet Publishing, conjuntos ruth-1 e baby-moses, licenças CC BY-SA 3.0 verificadas em páginas individuais; uso social/comercial e adaptações com atribuição/share-alike.
- Preparadas kids-biblia-11 (Rute 1:6–18) e kids-biblia-07 (Êxodo 2:1–10), cada uma com cinco cenas distintas no Feed e outra no Story. JPEGs originais e CREDITOS.txt em docs/illustrations/sabedoria-kids/ruth-naomi/ e baby-moses/.
- Mantidos padrão ilustrado, leitura com adulto, atividade/pergunta em família e créditos na legenda. Inventário: 9/37 pautas ilustradas, não implica nove inéditas disponíveis; bloqueios de histórico preservados.
- QA: duas renderizações completas Feed/Story e inspeção visual da galeria; validate-bible-visual-standard, scheduled guard e validate-copy. Imagens adicionadas ao acervo, sem disparar postagem nem alterar horários.
- Produção READY dpl_6hBaNXx9gHJXm9BMR17gASp2W68F, código b029a71c; dashboard HTTP 200 sem controles de IA e duas imagens novas HTTP 200 image/jpeg. Prévia local output/kids-sites/previas-rute-moises.png.


## 2026-10-17 — Sabedoria Kids: slot 8 recuperado e persistência concorrente

- Estoque ampliado com quatro pautas inéditas ilustradas e licenciadas: Noé, arco-íris, Davi/Jônatas e Daniel. Guardas visuais preservadas; 7 de 37 pautas possuem composição ilustrada.
- Run 39060499980 publicou Davi/Jônatas em 17/10 às 16:01 BRT: Feed 17988373710098613, Story 18388568455228554, https://www.instagram.com/p/Demz88IoH7T/ . Primeiro comentário não solicitado (IDs/erro nulos).
- A etapa Meta foi bem-sucedida; a gravação posterior falhou por conflito concorrente em watchdog-errors.json. IDs recuperados dos logs; histórico, slot 8 e resolução persistidos em 72ed18b8, sem republicação.
- Kids usa agora persist-instagram-state.mjs: reconciliação de JSON com três versões e push sem force, repetindo quando main avança; mantém histórico/erros de outras contas. Teste validate-instagram-state-merge passou.
- Restam três pautas inéditas ilustradas deste lote; não afirmar estoque para amanhã nem 37 pautas prontas. Permissão de insights/alcance permanece separada e pendente. Cliente X apresenta esgotamento visual próprio; não foi tratado nesta recuperação Kids.

## 2026-10-17 — reposição ilustrada para recuperar slot 8 de Sabedoria Kids

- Incidente informado: run 39058049685, job 117470011708, Publish feed and story falhou: conteúdo bíblico inédito esgotado, stage unknown. Acervo ilustrado já publicado; bloqueio preservou padrão e antirrepetição, não indicou falha de token.
- Branch fix/kids-illustrated-stock-slot8, base 39b3e6fd. Ilustradas quatro pautas existentes ainda inéditas: kids-biblia-03 Noé, 04 arco-íris, 14 Davi/Jônatas, 17 Daniel. Total elegível sete de 37, quatro inéditas antes da recuperação, 30 ainda sem ilustração completa. Cobertura adicional de quatro publicações, não prometer acervo infinito ou amanhã completo.
- 24 imagens individuais Sweet Publishing / FreeBibleimages CC BY-SA 3.0, conjuntos noah-ark, david-jonathan, daniel-lions. Referências ampliadas quando necessário para incluir contexto das cenas. Cenas originais, legendas-fonte, capas, cartões e Stories inspecionados; sem agressão gráfica. Cinco cartões distintos e Story diferente da capa em cada pack; atribuição/licença/adaptações na legenda e CREDITOS.txt.
- Padrão visual preservado: cena inteira em destaque, identificação discreta, pergunta/atividade e leitura em família, sem livro gigante ou cartão vazio. Nenhuma pauta antiga republicada.
- Falta de estoque passa a registrar bible-content-selection e solução orienta adicionar conteúdo bíblico ilustrado inédito. Não recomendar token ou conteúdo genérico para esse bloqueio. Foco orgânico Kids adaptado para leitura bíblica em família; demais contas preservadas. Alcance/insights são questão separada, não reparada com esta reposição.
- Testes: validate-bible-visual-standard (7 elegíveis), validate-copy Kids, validate-scheduled-content-guard, classificação de erro legado unknown e recomendação por conta aprovados. Quatro renders-only 15:56 BRT e Stories revisados. Dry-run automático slot 8 2026-10-17-155805-slot-8 passou, sem envio à Meta.
- Aguardando execução cloud com mídia, Story, permalink e histórico. Dry-run, push e render não comprovam publicação. Reposição não marca erro resolved manualmente.

## 2026-10-17 — resultados de crescimento somente automáticos

- Produção confirmada: código 952868d0, deploy READY dpl_4PJAMn9AzvuHeSQ5TL3C4FHnko1o, alias cliente-x-instagram.vercel.app. Asset HTTP 200 conferido sem campos manuais/data e com Resultados automáticos. Screenshot local output/growth-evidence-preview/automatic-only.png. Servidor de prévia encerrado; nenhum plano real alterado nos testes.

- Pedido explícito: retirar o manual e deixar só automático. Removidos tabela editável de resultados, data do experimento e botão de escolha do período da interface. Seção 4 Resultados automáticos exibe somente coletas, progresso, datas correntes e tabelas por formato/janela, com Atualizar resultados.
- Período padrão da API agora usa os últimos 14 dias completos em BRT, comparados aos 14 anteriores, independentemente da antiga data salva em setembro. Avança a cada dia. Não inventa visitas, conversas ou vendas quando não coletadas.
- Plano de preparação do perfil/bio preservado; botão renomeado Salvar plano. Valores manuais antigos permanecem armazenados e são preservados ao salvar o plano, sem campos editáveis ou apresentação como métricas automáticas. Isolamento de contas e proteção contra respostas atrasadas mantidos.
- QA local via CUA: zero campos manuais/data, quatro tabelas automáticas, atualizar resultados funciona. Salvar plano em fixture manteve reach=123 de registro antigo; não ocorreu gravação no plano real. Testes de período completo/meia-noite BRT e validate-growth-plan aprovados; validate-education-learning também aprovado.
- Nenhum disparo ou mudança na agenda, publicações ou critérios de aprendizado.

## 2026-10-17 — melhoria do acompanhamento e comparação de crescimento

- Entrega: código 206d94d2 em origin/main. Run cloud 39058775476 completed/success com novas validações. Deploy READY dpl_2feCQQf7PnDNM3MjSXHKVPaAzqRv, alias cliente-x-instagram.vercel.app. Asset de produção /docs/growth-panel.js retornou HTTP 200 e contém a nova área e seletor de período. Login do painel não foi refeito; QA visual ocorreu na prévia local com snapshot identificado. Sem alteração da agenda, plano salvo, critérios de aprendizado ou novas publicações.

- Pedido: aprimorar seção Melhorar Instagram, coletas automáticas e períodos de 14 dias de cliente-x.
- Diagnóstico em origin/main fb91c207: 120 amostras mantidas, zero tutoriais na amostra e nove publicações educativas/tutoriais no histórico. Coorte inicial 13–26/09 já encerrada. Limite fixo de 120 podia remover tanto aulas quanto amostras necessárias para duas janelas de 14 dias.
- Branch feat/growth-evidence-clarity. Novo lib/education-collection.js preserva últimas 120 amostras como piso, todas as disponíveis dos últimos 28 dias e educativas dos últimos 42 dias; mantém exclusões e datas reais. Seleção de coleta inclui aulas recentes, mantendo limite de idade de requisição já existente no coletor. Não recupera métricas antigas nem fabrica observações de 24h.
- API de plano aceita comparisonStartDate validada e usa a data salva por padrão; relatório automático segue o período escolhido. Adiciona diagnóstico de publicações, amostras, janelas ausentes, métricas faltantes, alcance baixo, formato/tema e idade. Nenhum critério do education-learning foi relaxado.
- UI: cartões de coleta/histórico/amostra/elegibilidade, datas em BRT, progresso 6 tutoriais/180 alcance/2 temas, razão da inelegibilidade, período concluído/em andamento, tabelas por formato e idade e aviso de base insuficiente. Aprendizado educativo explicitamente separado do indicador geral da conta. Dados ausentes não viram zero nem resultado positivo.
- Botão Usar últimos 14 dias completos muda rascunho e recarrega evidência, sem salvar nem mudar agenda. Ao trocar datas com totais preenchidos, pede confirmação para limpar o rascunho; plano salvo preservado até novo salvamento. Totais manuais não recebem medianas parciais automaticamente. Respostas atrasadas descartadas ao trocar conta/período.
- Validação: validate-education-collection, validate-education-learning, validate-growth-plan, coletor --validate e sintaxe JS/API aprovados. Teste legado validate-education-strategy falha em assert fixo de episódio 12 dependente do histórico atual; script, seus módulos e arquivos de entrada idênticos a origin/main, não decorrente desta alteração, não alterado para ocultar falha.
- QA em prévia local com snapshot real, não painel autenticado: CUA testou troca 03–16/10, tabelas reais de Feed/Reels e ausência de base anterior; mobile 390px sem rolagem horizontal e desktop legíveis. Evidências output/growth-evidence-preview/desktop.png e mobile.png; fixture local não representa publicação/alteração de plano real.
- Workflow performance passa a validar novo módulo e aprendizado educativo. Aguardar execução cloud/deploy; não alegar dados históricos recuperados ou aprendizado habilitado.

## 2026-10-17 — padrão ilustrado obrigatório em Sabedoria Kids

- Produção: commits 53d2c492 e 7884d7aa enviados; deploy READY dpl_7NUmt8a1Vh5igykhnssw1wXJhhcK, alias cliente-x-instagram.vercel.app. Teste integrado com pack explícito sem imagem retornou erro antes de render/upload/Meta. Painel recarregado exigiu novo login, portanto contagem na UI não foi visualmente confirmada nesta sessão. Nenhuma nova publicação disparada.

- Incidente: usuário mostrou Abraão deu o primeiro passo sem imagem após aprovação do padrão ilustrado. Causa confirmada: kids-biblia-05 ainda tinha typographicOnly=true e nenhum imagePath; apenas duas das 37 pautas tinham ilustração completa. Salvar preferência não implementou exigência de qualidade na seleção.
- Branch fix/kids-enforce-illustrated-standard, base 4a685016. contentProfile.visualStandard=illustrated-bible; filtro central retém apenas pautas com imagens existentes em todos os cartões, layout ilustrado, Story distinto da capa e fonte/licença/revisão. Guarda final também bloqueia packs explícitos/manuais sem esses requisitos antes de render/upload/Meta.
- Ilustrado Abraão com seis imagens individuais Sweet Publishing / FreeBibleimages, CC BY-SA 3.0, conjunto abraham-canaan. Fonte/atribuição/licença registradas; cenas e mapa inspecionados. Nenhuma substituição ou republicação do post já publicado DempTZ9msno.
- Estado real: três de 37 pautas ilustradas; 34 pendentes. As três já constam no histórico, portanto não afirmar que existem 12 publicações novas disponíveis. Pautas sem imagens deixam de ser selecionadas; horários podem aguardar novas pautas ilustradas inéditas. Antirrepetição mantida.
- Painel/API passam a mostrar contagem ilustradas/pendentes e explicar o bloqueio de pautas sem imagens. Acervo editável mantém todos os índices originais; prévia automática usa apenas elegíveis.
- Testes: validate-bible-visual-standard (imagem ausente/arquivo ausente/licença/Story repetido bloqueados; outras contas preservadas), --validate-copy sabedoria-kids (37 packs, três elegíveis), validate-editorial-support-layout, validate-photo-title-fit e sintaxe dashboard/API/publisher aprovados.
- Render-only 2026-10-17-150639-slot-0-render-only: cinco cartões e Story gerados; capa/fechamento/Story inspecionados. Prévia local, sem publicação.

## 2026-10-17 — composição dos cartões internos sem fotografia

- Código 9f374579 enviado a origin/main. Deploy READY dpl_AUKoBA7pqSYQS7cn53HNMjNMzeEZ, alias cliente-x-instagram.vercel.app. Prévia aprovada por inspeção local; nenhuma nova publicação disparada neste ajuste.

- Pedido: usuário apontou vazio central no cartão Entenda a matéria · 5 de cliente-x e pediu imagem complementar mais atraente.
- Branch fix/cliente-x-inner-card-composition, base origin/main ddf74825. Cartões internos curtos de notícias de IA/tecnologia de cliente-x sem foto verificada recebem ilustração SVG editorial conceitual identificada, com duas variações; título, arte e texto distribuídos no quadro. Retirado pseudo-elemento vazio da nota. Fotos verificadas mantêm prioridade; nenhuma imagem irrelevante, foto repetida ou afirmação factual acrescentada.
- Escopo preserva capa, fechamento, cartões com foto e Sabedoria Kids. Cartões com títulos longos mantêm composição anterior. Texto escuro sobre cartão claro também em tema escuro.
- QA: validate-editorial-support-layout gera Feed claro/escuro e Reel, valida separação título/ilustração/texto/progresso e cor legível; previews output/cliente-x-inner-cards. validate-photo-title-fit, validate-visual-agent e --validate-copy cliente-x aprovados. Ajustes iniciais de especificidade/contraste corrigidos antes da entrega.
- Mudança destinada a novos renders/publicações. Nenhum post existente excluído, alterado ou republicado.

## 2026-10-17 14:39 BRT — execução da correção confirmada

- Run 39054271599 publicou o próximo slot atrasado (5, original 13:30 BRT): Empresas de IA são incapazes de controlar seus modelos, alerta ex-pesquisador da OpenAI. Carrossel ID 17975613105154212, Story ID 18018183179953359, https://www.instagram.com/p/DemqcyDAYZr/ ; publicado 2026-10-17T17:39:01.714Z.
- Validação cloud aprovou foto pertinente inédita; reserva revisada não precisou ser usada. Estado persistido em origin/main 8e4ffe18. Slots 4 e 5 recuperados sequencialmente pela nuvem, sem envio manual local.
- Primeiro comentário também não autorizado pela Meta (código 10), nenhum ID de comentário. Testes e deploy não constituíram a comprovação: IDs de carrossel/Story e histórico persistido constituem.

## 2026-10-17 14:36 BRT — incidente 39052686174 resolvido com publicação real

- Watchdog 39054210999 concluiu success às 14:35 BRT. A nova coleta encontrou matéria Nossa IA com imagem inédita pertinente; recuperação ocorreu pela seleção normal de notícias, sem usar a reserva adicionada em baf55f7b.
- Reel A Grande Aposta de Mark Zuckerberg: Entre o Fracasso do Metaverso e a Corrida Frenética pela IA: ID 18005483804793255; Story ID 17872024878646010; https://www.instagram.com/reel/DemqA56E_mc/ ; publicado 2026-10-17T17:35:34.428Z, slot 4 de 17/10, horário original 12:10 BRT.
- Histórico e published-slots persistidos em origin/main 5aad03fe; watchdog-errors do run informado e demais falhas desse slot marcados resolved pelo run 39054210999. A execução histórica falhada continua vermelha no GitHub; resolução não altera seu resultado passado.
- Primeiro comentário não publicado: Meta código 10, Application does not have permission for this action. Não é falha de Feed/Reel ou Story; requer tratamento próprio de permissão.
- Instagram público verificado na conta marcondes.machado.oficial, evidência output/cliente-x-recovery/reel-publicado-1435.png. Deploy READY dpl_33tp3EFks3tjCLm9qpu1jYqrBgSY, alias cliente-x-instagram.vercel.app, código baf55f7b.
- Run push 39054271599 da correção em acompanhamento; a reserva revisada é proteção adicional e permanece sujeita a novidade, disponibilidade e guardas.

## 2026-10-17 14:35 BRT — recuperação do radar visual de cliente-x

- Incidente informado: watchdog 39052686174, Publish feed and story; bloqueio antes da Meta, sem publicação nessa tentativa. Duas pautas Tecnoblog elegíveis com todas as imagens identificadas no histórico, inclusive variantes de tamanho.
- Branch fix/radar-visual-39052686174, base 9d3e34a8. Mantidos guardas de foto pertinente, unicidade e antirrepetição. Esgotamento visual passa a procurar apenas reserva autoral explicitamente revisada (editorialReserve=true), sem pesquisa e sem autoGenerated; sem reserva inédita, continua bloqueado.
- Adicionada uma pauta educativa autoral: Antes de automatizar, defina quando a IA deve parar. Imagens ilustrativas existentes, capa e Story distintos; cartões internos tipográficos. Legenda identifica conteúdo autoral, sem notícia ou resultado comprovado inventado. Uma pauta de reserva não garante todos os horários futuros.
- Testes: node --check, validate-editorial-visual-reserve, validate-visual-agent, validate-photo-title-fit e --validate-copy cliente-x aprovados. Render-only 2026-10-17-143234-slot-4-render-only aprovado e capa/fechamento/Story inspecionados. Primeiras prévias falharam nos guardas e não foram publicadas.
- Aguardando execução cloud e IDs persistidos; render e push não constituem prova de publicação.

## 2026-10-17 — publicação ilustrada autorizada e fechamento sem livro grande

- Usuário aprovou a prévia e autorizou publicar/seguir o estilo; pediu melhor distribuição e retirar destaque indevido ao livro.
- Branch feat/kids-illustrated-publish-20261017, base 1a441a60; e3fe873f e 70557e45 enviados ao origin/main. Imagens explícitas em Sabedoria Kids usam composição de cena inteira; painel/avatar grande oculto no modo ilustrado, mantendo identificação discreta no cabeçalho.
- Fechamento do Bom Samaritano: Quem você pode ajudar hoje?, referência e atividade em família; CTA salve para ler em família. Removido selo numérico que sobrepunha texto e reposicionada a progressão abaixo da imagem.
- Bondade já publicada às 13:53: tema não reenviado. Escolhido pack inédito kids-biblia-24, O bom samaritano parou para ajudar, com cinco ilustrações e Story distinto, fonte Sweet Publishing/FreeBibleimages CC BY-SA 3.0, créditos na legenda.
- Render final 2026-10-17-140817-slot-0-render-only aprovado com QA visual de capa/fechamento; validação dos 37 packs e guardas de antirrepetição aprovadas. Run manual 39052509987 acionado com conta sabedoria-kids, feed-and-story, dry_run=false, pack explícito e mark_automatic_slot=false. Não substitui slot automático nem ativa outra conta.
- Em acompanhamento até IDs/permalink/histórico persistido; não considerar o simples disparo como publicação concluída.

- Publicação confirmada: run 39052509987 terminou success; Feed ID 18097755125543253, Story ID 17866270857676988, permalink https://www.instagram.com/p/DemnVJSlF4I/, publicado em 17/10/2026 às 14:11:38 BRT. Primeiro comentário sem ID/erro registrado, não enviado.
- Histórico persistido em origin/main 367620a3. Instagram aberto e cinco páginas navegadas; créditos presentes na legenda. Evidências locais output/sabedoria-kids/samaritano-publicado-capa.png e samaritano-publicado-fechamento.png.
- Deploy READY dpl_ETa2nARfn4DghMhaUPXvACMZrZ6y, código 70557e45, alias cliente-x-instagram.vercel.app. Padrão salvo para pautas de Sabedoria Kids com imagens explícitas; 35 pautas do acervo ainda carecem de ilustrações. Nenhuma busca indiscriminada, exclusão ou republicação de Bondade.

## 2026-10-17 — ilustrações licenciadas no acervo de Sabedoria Kids

- Usuário pediu melhorar a arte de Bondade com imagens dos sites. Branch feat/kids-illustrated-library-20261017, base d2cd9e3a.
- Seis imagens individuais do conjunto Good Samaritan (Sweet Publishing / FreeBibleimages), fonte https://www.freebibleimages.org/illustrations/good-samaritan/, licença CC BY-SA 3.0 conferida na página; créditos e adaptações sob mesma licença na legenda e CREDITOS.txt.
- Duas pautas existentes receberam cinco ilustrações distintas e Story com outra cena: O bom samaritano parou para ajudar e Bondade é um fruto que podemos cultivar. Bondade explicita Lucas 10 como exemplo complementar, sem apresentar a ilustração como cena de Gálatas.
- Layout opcional bible-illustration mantém paleta/identidade, mostra cena inteira sem corte vertical e dá maior espaço à imagem. Campo storySlide opcional permite arte relacionada distinta; fallback anterior preservado nos demais packs.
- Renderização das duas pautas aprovada com cinco slides + Story; guardas de imagem/limites/sobreposição mantidas. QA visual identificou e corrigiu corte da cena e sobreposição inicial de marca/badge. validate-kids-onboarding, sintaxe e git diff --check aprovados.
- Prévia estática: docs/generated/sabedoria-kids/previa-bondade-ilustrada-20261017. Somente prévia; nenhuma republicação solicitada ou disparada. Post já publicado continua DemlNycIInI. Acervo total continua 37, agora com duas pautas ilustradas; demais 35 ainda não receberam imagens. Sem busca indiscriminada/automática em todos os sites e sem enfraquecer antirrepetição.

- Implementação enviada ao origin/main em d70807d4 após rebase sobre a462298c. Deploy READY dpl_GbHpwacHG3UAt5k1qLRVY3h2ef5x, alias cliente-x-instagram.vercel.app. Capa, Story e CREDITOS.txt da prévia retornam HTTP 200 com SHA-256 idêntico aos arquivos revisados. Validação de copy dos 37 packs e guardas de antirrepetição também aprovada.

## 2026-10-17 — aviso de radar adaptado ao acervo bíblico

- Branch fix/kids-biblical-radar-label-20261017, base 44d586a1; implementação ff69dce6 enviada ao origin/main.
- Causa do aviso mostrado pelo usuário: renderNewsRadar interpretava radar propositalmente desativado em curatedOnly como falha de notícias, exibindo atualização de notícias/60 dias/fake news na conta bíblica.
- Perfis com acervo preparado agora mostram status do acervo em vez do alerta de notícias. Sabedoria Kids mostra quantidade de conteúdos, temas da pesquisa com data, fontes bíblicas cadastradas e distinção entre referência e site efetivamente consultado.
- Temas encontrados continuam sugestões para desenvolver/revisar; número de conteúdos não é prova de publicação futura. Nenhuma ativação do radar de notícias nem alteração de agenda/publicador.
- validate-account-onboarding (inclui sintaxe do JS do painel) e git diff --check aprovados.

- Produção READY: dpl_67idTaWfBFYXNd3DgnkHzzpV9sU9, código ff69dce6, alias cliente-x-instagram.vercel.app. Conferido no navegador autenticado, conta sabedoria-kids, Agenda: Acervo bíblico preparado, 37 conteúdos, 59 temas (consulta 17/10 às 10:58 BRT), sete fontes e guia de revisão; botão de notícias ausente neste modo. Evidência local output/sabedoria-kids/acervo-biblico-painel.png.

## 2026-10-17 — início de Sabedoria Kids antecipado a pedido do titular

- Usuário confirmou antecipar para hoje e monitorar uma publicação real. Branch ops/kids-start-today-20261017; implementação 51c0b315 enviada ao origin/main.
- automaticScheduleStartsAt alterado de 18/10 às 07h BRT para 17/10 às 13h BRT (2026-10-17T16:00:00Z). Preservados os 12 horários e modo automático; horários anteriores da manhã não são recuperados.
- Seletor real confirmou has_due=true, slot_index=6, slot_date=2026-10-17, scheduled_at=16:00Z. validate-kids-onboarding e git diff --check aprovados.
- Rotina agendada anterior 39050429887 havia pulado publicação por ainda não haver slot liberado no checkout. Vigia da própria conta acionado após a mudança: run 39051179904, automático com seleção de pendência e marcação de ledger; não é publicação manual de pack fixo.
- Em acompanhamento até histórico persistido, Feed/Reel e Story IDs e primeiro comentário; ainda sem afirmar nova publicação nesta etapa.

- Resultado confirmado: run 39051179904 terminou success, etapa Publish feed and story success. Publicado Bondade é um fruto que podemos cultivar em 17/10/2026 às 13:53:13 BRT (16:53:13Z).
- Feed ID 17969893599165135; permalink https://www.instagram.com/p/DemlNycIInI/; Story ID 18142193101604169. Primeiro comentário sem ID e sem erro registrado (não confirmado/enviado).
- publication-history.json e published-slots.json persistidos no origin/main 560d50fb. Slot 6 de 17/10, agendado para 13h BRT, marcado published às 13:53:13, workflowRun 39051179904. Não recuperar slots anteriores ao início autorizado.
- Produção alinhada ao início de hoje: deploy READY dpl_FBtbJmFNkWc25uo7UqpZ6sDE2ZW9, código 51c0b315, alias cliente-x-instagram.vercel.app. Próximo horário da agenda: 14h BRT, ainda sem afirmar sua publicação.

## 2026-10-17 — correção da prévia na troca de conta

- Branch fix/account-post-preview-20261017; implementação 07cd4223 enviada ao origin/main após rebase sobre ae5cd9e2, preservando atualizações operacionais concorrentes.
- Causa: cartão mantinha DOM/links da conta anterior e loadPrivateMetrics reutilizava uma promessa global em andamento. Falhas/ausência de mídia não limpavam a imagem anterior.
- Troca de conta limpa imagem, slides, links, legenda e horário imediatamente; incrementa versão da visualização e invalida deduplicação da consulta anterior. Respostas tardias de métricas e estado de outra seleção são ignoradas.
- Sem mídia, erro ou perfil divergente não reutiliza publicação anterior. Imagens reaparecem em consultas bem-sucedidas; removidos exemplos fixos do HTML inicial.
- validate-account-post-preview aprovado: respostas fora de ordem, troca, ausência de mídia, perfil divergente e erro; validate-account-onboarding/sintaxe e git diff --check aprovados. Sem alteração de publicação, agenda ou credenciais.

- Correção adicional da causa do HTTP 500 de Sabedoria Kids: api/private-metrics.js usava graph.facebook.com fixo, embora a conta use instagramLogin=instagram. Agora escolhe graph.instagram.com/v23.0 por conta, como o publicador; falhas retornam JSON controlado. Implementação 994c6ad6, checkpoint 3687a4a6.
- validate-metrics-account-host aprovado com handler autenticado, roteamento dos dois tipos de login e falha estruturada. Deploy final READY dpl_FxFvo4aL7LbF7uzprzWDszaBEvHo, alias cliente-x-instagram.vercel.app. Validação visual final concluída: seletor sabedoria-kids limpa imediatamente a imagem anterior e depois exibe Jesus acolhe as crianças, permalink https://www.instagram.com/p/DemShwemsHk/, confirmado pela Meta. Evidência local output/account-switch/sabedoria-kids-corrigido.png. Nenhum novo post enviado.

## 2026-10-17 — orientação de conta profissional no briefing

- Branch feat/briefing-professional-20261017 alinhada ao origin/main db840683; implementação 277ced01 enviada ao main, preservando atualizações operacionais concorrentes.
- /briefing mostra aviso junto à identificação do Instagram: conexão/publicação requer conta profissional Empresa ou Criador; conta pessoal pode preencher o briefing e converter antes da conexão.
- Guia expansível com passos no aplicativo, aviso de variação dos menus, busca por tipo de conta e link à Central de Ajuda oficial. Formatos disponíveis ficam sujeitos à conferência na conexão e revisão; nenhuma garantia universal de formatos por tipo de conta.
- Mudança de orientação HTML, sem alteração de autorização, cadastro, agenda ou publicador. validate-client-briefing e git diff --check aprovados.

- Produção READY: dpl_GkwU88957bNUBhuERxnocMWJvaD7, código 277ced01; alias https://cliente-x-instagram.vercel.app. Aviso e abertura do guia confirmados no navegador, incluindo os cinco passos e o link oficial. Evidência local: output/client-briefing/conta-profissional.png.

## 2026-10-17 — logotipo anexado no briefing

- Branch feat/briefing-logo-20261017, base 5c154b92; implementação c8164a8c enviada ao origin/main.
- Formulário público recebe PNG/JPG/WebP de até 1 MB, por seletor de arquivos do computador/celular; mostra prévia e remoção. Link HTTPS continua opcional. Arquivo é embutido no JSON de briefing, sem upload automático do formulário.
- Importação permite briefing de até 1,6 MB, mostra logo/nome e permite removê-lo. Cadastro envia anexo validado para contentProfile.logoAttachment. Isso preserva a referência de marca; não aplica automaticamente logo às artes/publicações.
- Validação compartilhada limita tamanho, MIME, base64 e assinatura; página também verifica decodificação. SVG e executáveis não aceitos. Arquivos anteriores sem anexo seguem compatíveis.
- validate-client-briefing aprovado com roundtrip do anexo, formatos inválidos e tamanho; validate-account-onboarding confirma persistência no handler simulado; validate-publication-access, sintaxe JS e git diff --check aprovados. Nenhuma conta real criada.

- Produção READY: dpl_J7r9bWmyKYH4ahP3QeDkP2oU79j6, código c8164a8c, alias https://cliente-x-instagram.vercel.app. Campo de anexo e alternativa de link confirmados no navegador; captura output/client-briefing/anexar-logotipo.png. Teste ponta a ponta de seleção pela extensão continua limitado pela permissão local de arquivos identificada anteriormente; serialização e persistência validadas em testes locais.

## 2026-10-17 — formatos no briefing do cliente

- Branch feat/briefing-formats-20261017; base 45fd4c24; implementação 80a4d77f enviada ao origin/main.
- /briefing permite selecionar Feed (imagem/carrossel), Reels (vídeo curto) e Stories, com seleção múltipla obrigatória para novos formulários. Quantidade diária explicitada como total entre os formatos; distribuição por formato/horário fica para revisão antes da ativação.
- JSON e briefing importado preservam formatos. Arquivos anteriores sem formatos continuam aceitos com indicação A combinar. Nenhuma mudança no publicador ou ativação automática.
- validate-client-briefing aprovado com seleção múltipla, roundtrip, rejeição de formatos inválidos/vazios e compatibilidade anterior; validate-account-onboarding, sintaxe JS e git diff --check aprovados.

- Produção confirmada em 17/10/2026: dpl_7e9DK7FZjRHMnhB7LJnB2bZKwo4X; alias https://cliente-x-instagram.vercel.app. Navegador confirmou as três caixas selecionáveis e quantidade total 3. Evidência local: output/client-briefing/formatos-publicados.png. Sem cadastro ou publicação de teste.

## 2026-10-17 11:37 BRT — formulário compartilhável de briefing

- Branch feat/client-briefing-20261017, base 077c951b; implementação d88b8b00 enviada ao origin/main.
- Nova rota pública /briefing, sem login: Instagram, marca, contato opcional, nicho, público, oferta/conteúdo, objetivo, tom, quantidade/horários BRT, logotipo, cores, fontes e preferências. Não pede senha nem código do Instagram.
- Cliente baixa JSON e o devolve ao operador; não há envio automático nem banco público de respostas. Painel Clientes > Cadastrar nova empresa permite copiar o link, abrir formulário e importar JSON validado para revisão.
- Importação não cria/ativa conta nem publica. Aprovação é mantida como padrão; horários podem ficar em branco para combinar. Preferências/fontes ficam no contentProfile.editorialBriefing quando o cadastro é criado, sem ativar coleta ou licenciamento automático.
- Testes aprovados: validate-client-briefing (roundtrip, URLs, horários, schema e limites), handler autenticado com persistência de briefing, validate-kids-onboarding, validate-publication-access, sintaxe e git diff --check. Nenhuma conta de teste criada na produção.

- Produção READY: dpl_HG96E83aywGbFyM6svEdYCrmJWou, alias https://cliente-x-instagram.vercel.app, código d88b8b00. Formulário público e controles no painel autenticado confirmados no navegador.
- Download real gerou briefing-fixture.cliente.json (457 bytes), validado pelo normalizador. Arquivo apenas local; nenhuma conta fictícia foi criada. Importação visual não concluída: extensão Chrome bloqueou file chooser por falta de Allow access to file URLs; testes locais de roundtrip e persistência no handler aprovados.
- Evidência visual: output/client-briefing/formulario-publicado.png. Próximo passo operacional: enviar /briefing ao cliente, receber JSON, importar/revisar e criar o convite próprio de conexão.

## 2026-10-17 — cadastro replicável implantado em produção

- Login Vercel renovado pelo titular; CLI 64.5.0 com certificados do sistema. Deploy de produção READY: dpl_GwjDHbC4UGC7mz4oe3Ng9jpejXpa, código 3185e16d; domínio https://cliente-x-instagram.vercel.app confirmado pelo alias.
- HTTP 200 em produção com newAccountTimes, entrada @/URL e aprovação como padrão. Formulário visível no navegador autenticado.
- Teste real sem criação: envio do perfil já existente sabedoriakidsoficial com chave omitida foi rejeitado com Este Instagram já está cadastrado. Selecione a conta existente. Nenhum novo cadastro ou convite criado.
- Testes locais aprovados novamente: validate-account-onboarding (50 identidades simuladas), validate-kids-onboarding, validate-publication-access e git diff --check.
- Workflow Sabedoria Kids permanece active; rotina prevista para 18/10 às 07h BRT. As duas publicações manuais seguem como evidência atual; primeira execução automática futura ainda pendente.
- Próximo passo: cadastrar o próximo perfil real com seu briefing, conectar autorização própria e validar publicação. Escala de 50 publicações simultâneas, filas genéricas por conta e aprovação Meta para clientes externos continuam pendentes.

## 2026-10-17 — cadastro replicável por nicho

- Branch feat/multiaccount-onboarding-20261017; base c455fa39; implementação enviada ao origin/main em 13456434.
- Cadastro aceita @ ou URL de perfil e gera chave quando omitida. Bloqueia perfil repetido e chaves que colidam nos nomes de credenciais.
- Agenda inicial própria, recebida em BRT, ou vazia; não herda horários da conta selecionada. Novo perfil fica onboarding/awaiting_connection, com acervo preparado e aprovação como padrão.
- Conteúdo inicial acompanha nicho, público e oferta; removido template fixo sobre IA. Credenciais Instagram individuais; hospedagem de mídia usa infraestrutura IMGBB da plataforma.
- Conta, acervo e fila salvos em um commit GitHub, com leitura do mesmo SHA e atualização sem force. Conflitos não deixam cadastro parcialmente visível.
- Testes aprovados: validate-account-onboarding (50 identidades fictícias, não 50 publicações reais, conflito e handler autenticado), validate-publication-access, validate-kids-onboarding, node --check e git diff --check. Nenhuma conta fictícia criada na produção.
- Produção ainda não atualizada: HTTP 200 do painel, mas HTML não contém newAccountTimes; token local Vercel recebe HTTP 403 forbidden. Renovação de login em andamento.
- Sabedoria Kids: última publicação confirmada permanece DemShwemsHk; rotina começa em 18/10 às 07h BRT. Nenhuma execução futura pode ser considerada comprovada hoje.
- Pendências de escala: aprovação Meta para clientes externos, credenciais dinâmicas no publicador, filas/limites/monitoramento para 50 contas e teste de carga real.

## 2026-10-17 11:09 BRT — carrossel ilustrado publicado e rotina autorizada

- Usuário autorizou publicar e continuar amanhã. Publicado Jesus acolhe as crianças, cinco slides ilustrados com créditos Gavin Thomson / Little Zebra Books, CC BY 4.0.
- Run 39039416968 concluído com sucesso; Feed ID 18090373076257154; permalink https://www.instagram.com/p/DemShwemsHk/; 17/10/2026 às 11:09:41 BRT. Histórico persistido em c493bb03. Somente feed; Story e primeiro comentário não enviados.
- 7895de19: conta ativa e automaticScheduleStartsAt=2026-10-18T10:00:00Z (07h BRT). Mantidos 12 horários: 07h, 08h, 09h, 10h, 11h, 12h, 13h, 14h, 15h, 16h, 18h e 20h. Workflow Instagram Sabedoria Kids confirmado active no GitHub.
- Testes: seletor retorna has_due=false hoje e seleciona slot 0 em simulação de 18/10 às 07:03 BRT; validação Kids aprovada. Acervo agora possui 37 packs; demais conteúdos ainda usam visuais existentes.
- Painel recusou índice 36 como slot (HTTP 422, sem dispatch). Publicação concluída por workflow manual com slot 0 e pack explícito; c1745cf5 corrige mapeamento no código da API, testado com requisição stream e fetch simulado. Deploy da correção da API ainda não comprovado.
- Próximo passo: verificar primeira execução agendada de 18/10 até IDs/permalink e ampliar o acervo ilustrado. Configuração ativa não equivale a publicação futura comprovada.

## 2026-10-17 11:04 BRT — prévia com ilustrações licenciadas

- Bíblia para Crianças informa uso não comercial. Para o teste de Marcos 10:13–16, selecionadas cinco ilustrações de Gavin Thomson / Little Zebra Books via FreeBibleimages, conjunto zb-jesus-children, CC BY 4.0 e uso em redes sociais com atribuição indicado na página.
- Fonte visual adicionada ao perfil, com exigência de verificar licença por conjunto. Créditos e licença incluídos na legenda do pack de teste e CREDITOS.txt. Imagens originais não redistribuídas no ZIP de carrossel.
- Publicador: flag opcional imageAsIllustration=true mantém texto e diagramação ao inserir imagem; envio de banners prontos preservado quando a flag não está presente.
- Render-only concluído e cinco slides inspecionados; node --check e git diff --check aprovados. ZIP em output/sabedoria-kids/teste-fontes-marcos-10/carrossel-ilustrado.zip. Nenhuma nova publicação nem rotina ativada.
- Limite: seleção e licença verificadas de forma assistida; não há busca automática genérica de imagens licenciadas.

## 2026-10-17 11:01 BRT — teste das seis fontes e prévia de Marcos 10

- Teste HTTP das seis fontes: cinco acessíveis; SBB retornou HTTP 403 na consulta direta pelo Node. Não contornar bloqueio; fonte permanece como referência para consulta assistida.
- Marcos 10:13–16 conferido no YouVersion e na Bíblia Online, ambos NVI. Criado texto original infantil Jesus acolhe as crianças, com referências das duas páginas e atividade em família.
- Render-only dos cinco slides concluído; cinco imagens inspecionadas, sem texto cortado observado. Agente visual aprovou composição tipográfica.
- Relatório e pack salvos em output/sabedoria-kids na raiz do workspace; ZIP e capa em teste-fontes-marcos-10. Nenhuma publicação disparada neste teste.
- Limite: teste de acesso e preparação editorial assistida; não comprova extração automática das cinco novas fontes. Coletor continua implementado somente para Bíblia para Crianças.

## 2026-10-17 — quatro fontes adicionais da Sabedoria Kids

- Pedido explícito: cadastrar mais fontes. Adicionadas SBB, YouVersion Bíblia em português, YouVersion Bíblia para Crianças e 3 Palavrinhas; total de seis fontes no perfil.
- Páginas consultadas ao vivo; finalidades registradas distinguem referência bíblica de apoio pedagógico. Textos e imagens devem ser originais e passagens conferidas.
- Validação: JSON válido, seis URLs HTTPS únicas com finalidade e demais contas idênticas; git diff --check aprovado.
- Cadastro não amplia automaticamente o coletor: os 59 temas continuam vindo do catálogo Bíblia para Crianças. As novas fontes ficam disponíveis para pesquisa editorial e no painel; nenhuma nova publicação disparada.

## 2026-10-17 10:58 BRT — fontes bíblicas conferidas e pesquisa atualizada

- Pedido: usar fontes bíblicas nas postagens da Sabedoria Kids. Confirmadas as fontes cadastradas em accounts.json: Bíblia para Crianças (pautas infantis) e Bíblia Online NVI (conferência das passagens).
- Coletor executado com TLS do sistema; retornou 59 temas. Catálogo atualizado em sabedoria-kids-sources.json; publicationEnabled=false e curatedOnly=true preservados.
- Workflow de pesquisa diário já cadastrado às 05:20 BRT. A coleta oferece sugestões; não transforma automaticamente cada tema em post. Os 36 packs preparados continuam como acervo de publicação.
- Nenhuma nova publicação nem ativação da rotina nesta etapa. Próximo passo: desenvolver pautas do catálogo com passagem verificada, texto original e revisão infantil.

## 2026-10-17 10:52 BRT — primeiro exemplo publicado na Sabedoria Kids

- Pedido explícito: pode postar exemplo. Carrossel de cinco slides Deus criou um mundo cheio de vida, Gênesis 1:1–31, revisado visualmente antes do envio; publicação somente no feed.
- Run 39038224704 concluído com sucesso. Feed ID 17931592575165167; permalink https://www.instagram.com/p/DemQkPaG6xI/; publicado em 17/10/2026 às 10:52:36 BRT. publication-history.json persistido em origin/main 357782ab.
- Story não solicitado nem publicado; primeiro comentário não enviado. Rotina automática continua bloqueada por clientProfile.status=onboarding.
- Correções: 3c57e1fb disponibiliza Secrets Kids somente no dispatch dessa conta; d92cae20 permite exemplo manual com pack explícito e conta conectada em onboarding. Automação, contas pausadas e bloqueios de cobrança preservados.
- Validação: teste publication-access, validate-kids-onboarding, node --check e git diff --check aprovados; render manual local cinco slides inspecionados.
- Próximo passo: avaliar o exemplo e decidir sobre ativação da rotina. Nenhuma validação de escala para 50 contas concluída.

## 2026-10-17 10:44 BRT — conexão da Sabedoria Kids concluída

- Branch fix/kids-profile-20261017; conexão persistida no origin/main e7153b12, onboarding.status=connected. clientProfile.status permanece onboarding.
- Convite de Testador do Instagram enviado e aceito para o perfil exato sabedoriakidsoficial. Erro Meta 100 superado na nova autorização.
- Permissão Secrets read/write adicionada com aprovação explícita ao token cliente-x-instagram-vercel, somente para marcondesjm/cliente-x-instagram. GitHub confirmou atualização. Os Secrets SABEDORIA_KIDS_INSTAGRAM_ACCESS_TOKEN e SABEDORIA_KIDS_INSTAGRAM_USER_ID estão presentes.
- Teste seguro em produção: Conexão aprovada; @sabedoriakidsoficial; BUSINESS; 16 mídias. Permissão de publicação ainda inconclusiva: painel informa confirmação na primeira publicação.
- Nenhum post publicado; rotina de 12 horários não ativada. Próximo passo: revisar criativo e validar publicação real com ID/permalink antes da ativação.

## 2026-10-17 — Sabedoria Kids: nicho evangélico confirmado

- Branch: fix/kids-profile-20261017; base alinhada com origin/main 39fceb67.
- Perfil sabedoria-kids atualizado para evangélico infantil, público de famílias e educadores evangélicos; briefing em docs/sabedoria-kids-operacao.md.
- Validação local: JSON válido, demais contas idênticas, 12 horários, 36 pautas com referência e estados onboarding/awaiting_connection preservados; git diff --check aprovado.
- Conexão: última tentativa retornou Meta 100 ao consultar o perfil. Convite de testador preparado no navegador, sem envio confirmado. Nenhuma publicação executada.
- Próximo passo: resolver autorização e validar identidade/permissões, criativo e publicação real antes da ativação. Escala de 50 contas ainda não validada.

## 2026-10-17 09:59 BRT — carrossel corrigido publicado

- Pedido explícito do usuário: poste no instagram. Carrossel de 10 slides publicado em @marcondes.machado.oficial; cobertura dos 42 trechos confirmada.
- Run 39034591742 concluído com sucesso; permalink https://www.instagram.com/p/DemKhweld57/; Feed ID 18098498537539858; publicação em 17/10/2026 às 09:59:49 BRT. Ledger publication-history.json persistido em origin/main 3bcbb3ff.
- Primeiro comentário recusado pela Meta, OAuthException #10 (permissão). Fonte, título e link permanecem na legenda. Story não solicitado nem publicado (feed-only). Reel anterior preservado.
- Primeira tentativa 39034376439 bloqueada antes da Meta por reutilização da foto original. Correção aafbf450 permite reutilizar a foto exclusivamente em revisão manual vinculada ao ID e à URL da mesma matéria; automação e duplicação de fotos entre slides mantêm proteções. Testes de cobertura, autorização de revisão e agente visual aprovados.
- Próximo passo: acompanhar a publicação pelo permalink; corrigir permissões de comentários em tarefa própria se solicitado.

## 2026-10-17 09:55 BRT — entrega da correção de carrosséis

- Código enviado para origin/main no commit 027f328e; confirmado por git ls-remote. Próximas execuções do workflow recebem a correção; nenhuma publicação executada nesta sessão.
- Dois renders finais aprovados com comparação integral do texto no DOM e limites da área visível: 18 e 10 slides, ambos com cobertura dos 42 trechos. ZIPs Carrossel-IA-{18,10}-slides-20261017.zip entregues na pasta de runs. Teste de cobertura incluído no workflow de publicação.
- Deploy manual do painel recusado pela Vercel com Not authorized. Verificação HTTPS: novo PDF retorna 404 e dashboard ainda apresenta o link anterior. PDF local atualizado e código do painel enviados ao GitHub; atualização pública depende de restaurar a autorização Vercel.
- Sem exclusão, agendamento ou republicação do post existente. IDs/permalink novos não existem nesta sessão.

## 2026-10-17 09:46 BRT — carrossel com cobertura completa

- Base origin/main c0eb5e30; worktree cliente-x-instagram-carousel-20261017; branch fix/carrossel-cobertura-20261017. Alterações preexistentes em cliente-x-instagram-modern preservadas.
- Extração percorre os parágrafos e listas, sem o corte em cinco fatos. Paginação conserva o final; cobertura registra os trechos representados. Adaptações que não cabem são recusadas em vez de truncadas. Resumo de feed não recebe cobertura integral da matéria.
- Layout de notícia conserva todas as frases, com verificação do texto no DOM e da área visível. Método de engajamento preserva adaptações completas.
- Coluna de Alessandra Montini no Olhar Digital de 17/10: adaptação própria em 18 slides para o aplicativo e versão reorganizada em 10 para a API. 42/42 trechos mapeados nas duas versões. Hash exige revisão se a fonte mudar.
- Documentação da Meta consultada por HTTPS: carrossel da API limitado a 10; aplicativo aceita até 20. Guardas impedem descarte silencioso ou envio de excedentes.
- Verificações: validate-copy (21 packs, 54 automáticos, 75 seleções), teste de extração/paginação/conclusão/IHC/limites, dois renders reais (18 e 10 slides), inspeção visual e comparação texto/DOM. PDF de quatro páginas atualizado com adendo; botão e headers ajustados.
- Nenhuma mídia apagada, substituída, agendada ou republicada. Arquivos JPG em automation/instagram-template/runs/2026-10-17-materia-agentes-{18,10}-slides. Aplicação na produção e próxima publicação ainda precisam de evidência própria.

## 2026-09-19 — Story alinhado ao feed

- Base origin/main 34604723; worktree cliente-x-instagram-story-consistency-20260919, branch fix/story-feed-consistency-20260919.
- Incidente comprovado no run 35435465262 (19/09 06:45 BRT): Reel 17905873356480438, Story 18105760100222204, https://www.instagram.com/reel/DdduB0hjG6U/. Feed sobre Ozempic, Story com texto do livro e imagem da notícia; fingerprints e títulos diferentes persistidos no histórico.
- Causa: rodízio após cinco notícias substituía storyPack e storyStyle, mas reutilizava o contexto visual do feed. Removida essa substituição nas publicações; Story usa o mesmo pack, estilo e contexto da publicação selecionada. Conteúdos próprios/agendados de livro mantidos.
- Validações: sintaxe, validate-copy (75 seleções), validate-story-feed-consistency (15 combinações de modo/conteúdo e histórico de seis notícias), renderStory real com guardas de layout e inspeção visual da prévia de Ozempic. Prévia reconstruída dos fatos e título persistidos, com estilo impact-carousel branco; não é comprovante de publicação.
- Nenhuma mídia existente apagada ou republicada. Comentário do Reel original falhou separadamente por permissão Meta #10. Correção enviada para origin/main em ee00fc14; próxima publicação com a correção ainda não observada. Prévia entregue em output/story/Cliente-X-Ozempic-story-corrigido.jpg no workspace pai.

## 2026-09-12 — apresentação pública atualizada

- /plataforma destaca Melhorar Instagram, aulas com prompts e revisão, aprendizado por desempenho, Radar com data da coleta e agenda de 13 horários.
- Dois guias novos no carrossel; dez capturas anteriores identificadas como referência v5.27. Exemplo público substituído pelo carrossel e Story reais de 12/09, permalink DdMatQPFIiW.
- Validação: 12 slides/12 controles, imagens existentes e carregadas, HTML HTTPS correspondente ao arquivo local (normalizadas quebras de linha). Navegação e inspeção visual desktop/celular; largura 390px sem overflow horizontal, guias sem corte vertical; viewport restaurado.
- Vercel produção READY: dpl_9UuVAV8UQHmiyFimyyvLyFC2LHSL; alias cliente-x-instagram.vercel.app.

## 2026-09-12 13h31 BRT — slot das 13h recuperado com Feed e Story

- Publicação real confirmada no run 34705287535 (success), código 76423e19: 12/09 às 13:29:42 BRT. Carrossel “Advogado é multado após IA inventar testemunhas em caso de assassinato”.
- Feed 18405571927094061; Story 17947150239306300; permalink https://www.instagram.com/p/DdMatQPFIiW/. Slot 5 publicado em published-slots.json e entrada correspondente em publication-history.json, persistidos em main (33c90c29). Alertas do slot resolvidos.
- Falha visual corrigida em dca52ef0: título longo deixava espaço insuficiente para a fotografia, mesmo sem encostar no cartão de apoio. Ajuste apenas quando necessário, sem cortar texto, ocultar foto ou reduzir abaixo de 38px; leitura dos limites do título atualizada após redimensionamento.
- Dry-run 34705054342 aprovado sem marcar slot; slide 2 e Story inspecionados. Também inspecionados slide 2 e Story dos artefatos da publicação real, separados e sem sobreposição. Arquivos finais persistidos em docs/generated/cliente-x/2026-09-12-132851-slot-5/.
- Falha seguinte (run 34705107355) foi Supabase HTTP 504 na leitura inicial, antes da Meta. 76423e19 aplica as tentativas limitadas existentes à consulta GET, sem substituir conteúdos nem repetir erros permanentes de autenticação. Regressão 504→200, limite de tentativas e 401 aprovada.
- Proteção complementar: dry-run não deve resolver alerta de publicação; gate ajustado e validado. A publicação real desta recuperação já está comprovada independentemente dos alertas resolvidos pelo dry-run anterior.
- Comentário automático continua sem publicação por permissão Meta (#10); Feed e Story confirmados. Nenhuma credencial alterada.
- Agenda de 13 horários e aula às 16h a partir de 13/09 mantidas. Próximo horário previsto: 13h50 BRT. O atraso no disparo foi contornado pelo gatilho cloud existente; não foi comprovada a causa interna do agendador GitHub nem prometida pontualidade futura.

## 2026-09-12 13h14 BRT — monitoramento e recuperação do slot 5

- Usuário autorizou acompanhar e corrigir a próxima publicação. Slot 5, 13h BRT, ainda pendente; até a consulta de 13h14 não havia execução nova do principal/backup. Ambos ativos no GitHub; ausência de disparo observada, sem atribuir causa interna ao agendador.
- Corrigido risco no gatilho de recuperação por push: antes rodava mesmo sem pendência e selecionava slot 0. Agora exige fila ou slot pendente, preserva modo manual explícito e metadados da fila; se outro run concluir antes, não publica conteúdo extra.
- Testes validate-recovery-workflow e validate-restored-schedule aprovados (pendência, fila, modo manual, FFmpeg, marcação e tolerância/horário BRT).
- Disparo de recuperação pelo arquivo já configurado no workflow; mantém grupo de concorrência automática e consulta de main. Prova de Feed/Story e ledger ainda pendente.

## 2026-09-12 — indicador do Radar corrigido, v6.08

- O checklist confundia a prévia educativa de amanhã com falha do Radar: exigia que todos os packs futuros tivessem prefixo news-. Removida essa inferência.
- Saúde do Radar passa a ler a coleta persistida em main, isolada por conta, mostrando data em BRT, notícias únicas por URL e fontes representadas. Dados acima de 48h, ausência de pauta com origem/data válidas e falha na consulta mantêm aviso; agenda educativa não interfere.
- Verificação remota anterior ao deploy: coleta de 12/09 às 08h16 BRT, 103 variantes, 102 URLs de notícias na janela e 13 fontes representadas entre 26 cadastradas. Não é garantia de pauta inédita pronta; qualidade e repetição continuam avaliadas no disparo.
- Versão da API alinhada ao HTML em v6.08. Agenda de 13 horários preservada.
- Testes: radar-health (datas, ausência, conta, HTTP/timeout e mix educativo), growth-plan (sintaxe do painel) e restored-schedule aprovados. Produção: 5807cf36 em main; deploy dpl_4rD6wcBq3bK1TmPrqfmo7eDVce6k READY. Aba autenticada recarregada e inspecionada às 12h58 BRT: v6.08, Radar verde com coleta 08h16, 102 notícias/13 fontes e agenda com 13 horários.

## 2026-09-12 — restauração autorizada dos 13 horários, v6.07

- Pedido confirmado: 13 publicações diárias, com aula educativa incluída no slot 9 às 16h BRT, a partir de 13/09; aprendizado educativo mantido. Demais slots continuam com Radar e proteções de repetição e qualidade.
- Restaurados os 13 crons e agenda anterior. Modo integrated-slot limita somente a aula, sem bloquear notícias publicadas no mesmo dia. Slot educativo em carrossel com Story; demais formatos anteriores preservados.
- Retomada considera somente horários a partir de 12/09 às 12:43:30 BRT; slots anteriores não são acumulados. Próxima janela: 13h BRT, checagem principal 13h07.
- Validações: estratégia educativa, aprendizado, painel, textos e regressão de agenda (crons, limite diário, horário BRT, tolerância e ausência de acúmulo) aprovadas.
- Produção confirmada: cc1378e9 em origin/main; deploy dpl_7Fdgzs2N29hHmJn3qU2G6DfPyUqS READY no alias cliente-x-instagram.vercel.app. Domínio HTTP 200 com v6.07 e growth-panel.js público idêntico ao validado. Nenhuma nova publicação Meta afirmada; aguardar a próxima janela de 13h BRT.

## 2026-09-12 — aprendizado educativo v6.06 publicado

- Código 56a81123 integrado a origin/main; deploy dpl_AWunksTqYinawAc94gwZ55BAgNd8 READY no alias cliente-x-instagram.vercel.app.
- Seletor favorece temas de aulas inéditas por salvamentos, compartilhamentos e comentários sobre alcance, somente depois de seis aulas distintas com janela real de 24–36h e demais critérios. Mantém exploração determinística e travas de duplicidade. Decisão acompanha o metadado education no histórico.
- Painel informa motivo, quantidade de tutoriais elegíveis e alcance. Estado atual sem amostra educativa suficiente; nenhuma melhora de engajamento atribuída. Agenda preservada: início 13/09 às 16h BRT.
- Testes validate-education-learning e validate-education-strategy passaram; validate-growth-plan e validate-copy também passaram durante a implementação. HTTP 200 confirmou v6.06 e growth-panel.js público idêntico ao arquivo validado. Inspeção autenticada após deploy não concluída: navegador retornou Debugger unattached; não alegar verificação visual da nova mensagem.
- Critérios e limites: APRENDIZADO_EDUCATIVO_2026-09-12.md. Métrica externa de 0,05% não usada como evidência comparável.
## 2026-09-12 — estratégia educativa ativa v6.05

- Pedido “bora fazer tudo” implementado: biblioteca de 16 aulas com exemplos, prompts e revisão; ciclo 7 tutoriais / 2 notícias aplicáveis / 1 oferta; um carrossel às 16h BRT com Story. Configuração remota confirmada com educationStrategy.enabled=true, início 13/09, revisão 27/09. Hoje já houve publicações; seletor respondeu has_due=false pela transição/limite diário.
- Código 596f2e6c e correção 72c769c5 integrados a main. Deploy final dpl_5nuG517Y28GCt9mVou2xJBkVwb35 READY no alias principal; código equivalente ao commit anterior à reaplicação sobre uma coleta automática de métricas. Única diferença recebida do remoto durante essa reaplicação: performance-insights.json, consultado ao vivo pelo painel.
- Domínio HTTP 200, v6.05; sessão autenticada exibiu estratégia ativa, plano salvo, um horário e comparação automática FEED/REELS em 24h/72h, com coleta de 12/09 às 12:30:32Z. Corrigidos limite de 1MB da leitura de métricas e contagem de agenda exibida antes do carregamento.
- Página Bio pública confirmada: “Aprenda a aplicar IA no trabalho do seu negócio” e “Conversa sobre IA no seu negócio”. Bio do Instagram já estava atualizada pelo usuário e foi preservada.
- Baseline parcial persistido, 181 observações elegíveis no snapshot inicial; painel informa cobertura atual por métrica. Conversas e vendas continuam manuais. Nenhum ganho ainda atribuído ao experimento.
- Primeira aula prevista: “A equipe responde a mesma dúvida todo dia?”, episódio 6, 13/09 às 16h. Render do carrossel e Story validado e inspecionado sem publicar. Prova de publicação Meta depende do horário futuro; não há Feed/Story ID desse novo ciclo ainda.
- Detalhes e limites da biblioteca: ESTRATEGIA_EDUCATIVA_2026-09-12.md. validate-copy, validate-growth-plan, validate-follower-growth e validate-education-strategy passaram.

## 2026-09-12 — painel de melhoria v6.04

- Nova aba Melhorar Instagram publicada: checklist, bio copiável, três modelos no editor e resultados de um experimento de 14 dias, salvos por conta.
- Código 8ae064f9 integrado a main. Deploy dpl_3LcRGUyQjTjoMjivxqTJ2Gxjc8tK READY, alias cliente-x-instagram.vercel.app. HTTP 200 confirmou v6.04, a nova aba e CSS/JS; script público idêntico ao validado.
- Testes passaram para autorização, isolamento entre contas, salvamento com GitHub simulado, conflitos de revisão, limites, datas e ausência versus zero. Detalhes em PAINEL_CRESCIMENTO_2026-09-12.md.
- Agenda de publicação, perfil do Instagram e layout editorial preservados. Um post por dia permanece proposta para revisar no painel, não alteração automática. Sem resultado de crescimento ainda medido.

## 2026-09-07 11:06 BRT — retomada e revisão da série

- Referência remota conferida por fetch: origin/main c542e4d3; checkout followers, branch feat/follower-growth-series-20260906, atualizado por fast-forward. Arquivo de QA local preexistente preservado.
- Série de 14 episódios já integrada ao remoto em 63c9d8a5. Primeiro episódio: “Seu orçamento precisa começar do zero?”. Slot editorial 9 às 16:00 BRT, checagem principal às 16:07, a partir de 07/09. Nenhum episódio ainda consta no histórico consultado.
- Validação scripts/validate-follower-growth.mjs passou; arquivos testados idênticos a origin/main. Cobertura: datas BRT, 14 episódios, limites de slot, recuperação de episódios faltantes, contagem e atribuição de seguidores.
- Coleta persistida às 09:36 BRT: nerion-adaptive-v1.4.0; seguidores 2.398 às 09:35, contra 2.399 na coleta de 06/09. Saldo da conta -1, sem atribuição a posts. Visitas ao perfil em 06/09: 10.
- Slots 0, 1 e 2 de hoje constam publicados no ledger, com atraso. Último: 10:58 BRT, run 34130077202, Reel 18089248472184821, Story 17986934532058082, https://www.instagram.com/reel/Dc_RXPyisZQ/.
- Esta revisão confirmou código e estado persistido no GitHub; não incluiu inspeção visual da mídia nem nova verificação do deploy Vercel. Próxima evidência necessária: publicação automática do episódio 1 e avaliação visual, seguida das janelas de 2/24/72 h.
## 2026-09-06 — convite para seguir na série editorial (registro histórico)

- Texto escolhido pelo usuário: “Siga para acompanhar aplicações práticas de IA no seu negócio.”
- Aplicado ao último card dos 14 episódios, consistente com o convite já presente nas legendas.
- Situação no momento deste registro: alteração local. Atualização de 07/09 acima confirma integração ao remoto; publicação do primeiro episódio ainda pendente.

## 2026-09-06 — retenção e distribuição v1.4.0

- Pedido do usuário: trabalhar no algoritmo de “descongelamento”. Tratado como melhoria de distribuição e retenção; nenhuma evidência de bloqueio da conta foi constatada ou alegada.
- Base origin/main 4777c761; worktree cliente-x-instagram-modern-retention-20260906; branch feat/retention-learning-20260906.
- Corrigido cálculo que inferia milissegundos pelo tamanho do valor e assumia 15 segundos para todo vídeo. Tempo médio bruto convertido de ms; taxa de pulos tratada em porcentagem, inclusive valores entre 0 e 1. Sem duração registrada, retenção relativa fica null. Zero medido continua zero.
- Renderização passa a persistir a duração calculada do Reel no resultado/histórico; coletor a utiliza nas próximas observações. Histórico sem duração não recebe duração inventada. Migração recalcula janelas e latestObservation.
- Novo ajuste por tipo de abertura somente em REELS, limitado a +/-3 pontos, após pelo menos 3 mídias únicas maduras de 24/72h, alcance de 20 por mídia e 100 acumulado. Janela de 42 dias, decaimento de 21 dias; coletas tardias excluídas. Estes limites são escolhas conservadoras do nosso modelo, não regras do Instagram.
- Preservados os 13 horários, aprendizado assistido, exploração 70/20/10 e travas de originalidade, fonte, fatos, imagem e repetição. Abertura com abandono consistente perde prioridade; com retenção consistente ganha prioridade quando elegível.
- Regressões de unidades, duração, dados ausentes, amostra pequena, maturação, IDs duplicados e ajuste exclusivo de Reel passaram. Coletor --validate e validate-copy (75 seleções) passaram.
- Ensaio com histórico atual encontrou somente uma amostra elegível no grupo alerta; ajuste inativo por insuficiência de evidência. Nenhum ganho de visualizações foi comprovado.
- Produção verificada: código bab83eb2; run automático de aprendizado 34061868181 concluído; estado v1.4.0 persistido em e36661d9 às 18:42 BRT. Modelo de retenção permanece neutro por apenas uma amostra elegível. Deployment dpl_9k36Wci5B7VDicqidB9ZdNHyLbYu READY, alias cliente-x-instagram.vercel.app. Crescimento de views ainda depende de avaliação posterior.

## Correção 2026-09-06 18:30 BRT — fila e rodízio sem colisão

- Base confirmada em origin/main 294b434e; branch fix/watchdog-duplicate-20260906, worktree cliente-x-instagram-modern-duplicate-fix-20260906.
- Run 34048561762 falhou em Publish feed and story: o Story 18100281905263544 do run 34045432363 já havia usado o trecho agendado 14 às 16:28:26Z. O trecho 13 sofreu a mesma colisão com Story 18489215359128882.
- Rodízio 5 notícias / 1 livro passa a usar apenas packs de agendamentos publicados, reservando os pendentes e os que falharam. Política existente de rotação de Stories já publicados preservada.
- Antes de selecionar a fila, o fluxo compara fingerprint e título com publicações comprovadas por IDs. Agendamentos vencidos já utilizados recebem skipped_duplicate, com prova anterior; não recebem status published nem marcam slot automático.
- Os dois alertas antigos foram reconciliados com os respectivos agendamentos e provas. Alertas novos de fila usam scheduledPostId em vez do slot fictício 0; duplicidade tem classificação e orientação próprias.
- Validação: teste de regressão com a colisão real, reserva de futuros, fila inédita, isolamento de conta/alerta, idempotência, sintaxe e validate-copy (75 seleções). Nenhuma mídia apagada ou republicada; 13 horários preservados.
- Produção confirmada: correção 80c4e175 em origin/main; deployment Vercel dpl_BcCXE52XEaK2uAZwFCoPBnr6F5BH READY no alias principal. API pública confirmou zero alertas abertos e dois agendamentos/alertas reconciliados; HTML servido contém a identificação de erro por post agendado. Nenhuma publicação posterior à correção foi observada nesta verificação.

## Atualização 2026-09-06 — aprendizado de distribuição v1.3.0

- Base de produção confirmada em `origin/main` (`b145a618`), com execução cloud usando esse estado; trabalho isolado em `feat/discovery-learning-20260906`.
- Novo sinal compara views com a mediana de outras publicações do mesmo formato e janela (2/24/72 h), em até 42 dias. Exige cinco pares, elimina IDs duplicados e descarta coletas atrasadas para aquela janela. Sinal de 2 h tem apenas 25% do peso.
- Fontes, temas e tipos de abertura só recebem o novo ajuste na seleção após três amostras maduras; ajuste limitado a quatro pontos e subordinado às travas editoriais e à validade da coleta.
- Notas editoriais altas passam a reservar espaço para o aprendizado. Exploit escolhe a maior nota, sorteando somente empates; exploração 70/20/10 permanece e experimentos têm limite de distância para a melhor pauta.
- Métrica de abandono indisponível permanece null, sem ser interpretada como abandono zero.
- Validação: coletor `--validate`, `npm run validate-copy` (75 packs) e `git diff --check`. Histórico local: 98 amostras, 60 comparáveis, 48 maduras. Esses números são cobertura de dados, não previsão de alcance.
- Mantidos os 13 horários e as exclusões de aprendizado. Nenhuma mídia existente alterada; resultado em views ainda depende das futuras publicações.
- Produção confirmada: código `71c13c61`, coleta automática `34059331710` concluída e estado persistido em `aa0f5188`, às 17:53 BRT. JSON remoto confirma `nerion-adaptive-v1.3.0`, 61 publicações comparáveis, aprendizado habilitado e confiança moderada. Aumento de visualizações ainda não foi medido.
# Status Atual

Atualizado em: 2026-09-05 22:49 BRT

## Marco de crescimento — 40 visualizações e modelo v1.2.1

- O usuário confirmou que `https://www.instagram.com/p/Dc613j-Hb24/` chegou a **40 visualizações**, novo marco acima das 39 registradas anteriormente.
- A coleta automática já havia observado 32 visualizações na janela de 2 h, mas a Meta retornou alcance zero e a versão anterior descartava a nota de desempenho.
- O `nerion-adaptive-v1.2.1` passa a aproveitar visualizações e interações absolutas de forma conservadora quando o alcance estiver indisponível; nenhuma taxa por alcance é inventada.
- Prova em nuvem: o coletor persistiu o estado no commit `fe8a571d`; a observação de 32 visualizações passou de `performance: null` para nota 51 no modo `views-only-with-absolute-interactions`.
- A mídia será reavaliada nas janelas de 24 h e 72 h. Um único resultado não libera repetição de pauta, texto ou imagem e o aprendizado continua assistido.
- O marco serve como evidência de distribuição; as ressalvas visuais já documentadas continuam separadas e não se tornam padrão editorial.

## Próxima postagem automática — 2026-09-06

- Primeiro slot editorial de amanhã: **06:30 BRT**.
- A checagem principal do GitHub Actions começa às **06:37 BRT**, sete minutos depois do slot, e só publica se o livro de slots ainda indicar que a postagem está pendente.
- O watchdog executa nos minutos 14, 29, 44 e 59 e pode recuperar automaticamente o slot caso a execução principal não conclua.
- A agenda permanece com 13 horários diários; o conteúdo será escolhido pelo Radar no momento do disparo e deverá passar pelas travas editoriais vigentes.

## Atualização 2026-09-05 22:44 BRT — nova publicação de IA auditada

- Run automático `34004317650`: `https://www.instagram.com/p/Dc7YMtwiG6U/`, Feed `18112294880603563`, Story `18489215359128882`, publicado às 22:40 BRT.
- O Radar escolheu corretamente a pauta da Exame `Nova IA identifica sinais de doenças cardíacas em menos de 2 segundos`, em modo `exploit` do `nerion-adaptive-v1.2.0`; a confiança continua moderada e o aprendizado assistido.
- O Reel encontrou o erro interno Meta `2207085` e foi recuperado automaticamente como carrossel. O primeiro comentário falhou separadamente com OAuth `#10`, sem invalidar Feed ou Story.
- A inspeção dos cinco cards confirmou imagem pertinente e textos legíveis, mas reprovou o card 2: um crédito fotográfico entrou no fato, terminou como `(Imagem gerada.` e a fonte apareceu duplicada.
- O Feed permanece publicado e não deve ser apagado sem autorização. O Media ID foi excluído do aprendizado; a extração agora remove créditos fotográficos finais e a composição não duplica frases curtas.
- O Story autoral `Sete elementos de um prompt profissional.` foi inserido pela regra de equilíbrio após cinco Stories de notícias; a arte 9:16 está preenchida, legível e sem colisões.

## Atualização 2026-09-05 22:29 BRT — publicação comemorativa e auditoria

- Run automático final `34003725690`: permalink `https://www.instagram.com/p/Dc7W2jYFNmI/`, Feed `17943988341302275`, Story `18108098993601068`.
- A primeira tentativa revelou e corrigiu a ausência de FFmpeg no gatilho automático extraordinário por `push`.
- O post final foi publicado, mas a revisão reprovou a pauta de jogo fora do foco empresarial e o fragmento textual `não apenas a.`; a mídia foi excluída do aprendizado.
- Novas travas impedem confundir `aí` com a sigla `AI` e usam travessões como limite seguro de oração factual.
- O post permanece no perfil. Não apagar nem republicar sem autorização explícita.

## Marco de desempenho — 2026-09-05 22:17 BRT

- O carrossel `Dc613j-Hb24` alcançou 39 visualizações, conforme confirmação visual do usuário, superando pela primeira vez a barreira observada de 20.
- Feed `18090398927175449`; Story `17993232135031088`; run `33990643430`.
- Tratar como sinal promissor, não como conclusão isolada. Manter aprendizado assistido e comparar os demais indicadores nas coletas de 2 h, 24 h e 72 h.

## Atualização 2026-09-05 22:18 BRT — texto factual completo

- Próximos cards internos do Radar usam frases factuais completas, sem cortes terminados em `...`.
- A fonte principal foi reduzida e agora escala conforme o comprimento da frase: 62 px, 54 px ou 48 px.
- Render `2026-09-05-221505-slot-12-render-only` inspecionado com a pauta Mobile Time: cards 2 e 3 legíveis, completos e sem colisões.
- A matéria integral e a atribuição permanecem na legenda; a compactação não pode inventar complemento factual.
- Validações locais aprovadas. Nenhuma publicação existente foi alterada ou republicada.

## Regra permanente de checkpoint

- Toda atualizacao concluida deve ser registrada automaticamente em `HISTORICO.md` e refletida em `STATUS_ATUAL.md`.
- O usuario nao precisa pedir novamente para gravar a memoria do projeto.

## Landing e Página do Facebook — concluídas

- Landing implantada manualmente a partir do commit `9fb9a08a`; deployment `4FEdFqKMPexwGdjyvheJ38reDN1K` em `READY` e alias principal preservado em `https://cliente-x-instagram.vercel.app`.
- Prova pública: HTTP 200, contenção móvel nova presente e filtro antigo de blur ausente.
- A Página `Marcondes Machado` exibe dez especialidades preenchidas e salvas na seção Serviços.
- Primeiro post público da Página confirmado em `https://www.facebook.com/Marcondes.Jorge.Machado/posts/1391150076551048`, com cartão para a Página Bio.
- O Instagram continua `@marcondes.machado.oficial`; nenhuma configuração de domínio ou integração Git foi alterada.
- O checkpoint deve acompanhar a alteracao no Git e no remoto, quando aplicavel, antes do encerramento da tarefa.

## Projeto ativo

- Correção do slot 4 preparada sobre `origin/main` `7eaad1eb`: `OAuthException` code `-1` / subcode `2207085` é erro interno de `media_publish`, não prova de token vencido.
- Renovação de token fica reservada a code `190`, subcode `463` ou mensagem explícita de expiração. Para `2207085`, o publicador revalida o contêiner e repete com espera progressiva de 15 s e 30 s.
- Se o Reel continuar recusado, a automação consulta as mídias recentes para evitar duplicação e recupera o mesmo conteúdo como carrossel somente quando confirma que o Reel não apareceu.
- O carrossel de recuperação usa URLs hospedadas no GitHub pelo próprio run; o timeout observado no `i.ibb.co` não bloqueia mais esse caminho.
- Slot 4 recuperado pelo run automático `33983609919`: carrossel `https://www.instagram.com/p/Dc6m2IHmlZz/`, Feed ID `18018870773718810`, Story ID `18096657224062384` e ledger publicado às 15h29 BRT. Alertas do slot encerrados.
- Primeiro comentário falhou separadamente com `OAuthException #10`; isso não invalida o Feed nem o Story. O histórico agora registra formato efetivamente publicado e o fallback aplicado.
- QA visual identificou que o Reel publicado usou cards tipográficos sem fotografias, enquanto o Story tinha imagem. Reels de impacto agora exigem foto em todos os quadros e o layout `statement` não pode ocultá-la.
- Render `2026-09-05-153807-slot-4-render-only` aprovado visualmente: cinco de cinco quadros com fotografias distintas e sem sobreposição. Media ID defeituoso `18018870773718810` excluído do aprendizado.
- A mídia já publicada permanece intacta; apagar e republicar exige autorização específica do usuário.
- Alertas abertos receberam orientação corrigida. O slot 4 permanece pendente até prova automática completa em histórico, permalink, Feed/Reel ID e Story ID.
- Validações locais aprovadas: sintaxe dos três scripts, assertions da classificação, `git diff --check` e `npm run validate-copy` com 75 packs.

- Carrossel do livro `Dc4azkPIC2q` corrigido em `a346e4f`: palavras longas não quebram no meio no layout editorial, `SALVE ESTE PASSO` não cobre mais o cartão e os selos possuem contraste preto/branco explícito.
- Reprodução exata aprovada no render `2026-09-05-094407-slot-0-render-only`; slides 1 e 3 inspecionados visualmente, com barra de progresso livre. Nenhuma republicação foi feita.
- Story com vazio inferior corrigido na branch limpa `fix/story-lower-balance-20260905`, criada sobre `origin/main` em `b9202a6`.
- A fotografia dos Stories de impacto agora ocupa 720 px e pode avançar somente como elemento visual pela faixa inferior; título, data, CTA e assinatura mantêm a área segura estrita.
- Render `2026-09-05-093827-slot-0-render-only` aprovado visualmente, sem colisão e com composição inferior preenchida. Validações `node --check`, `git diff --check`, `npm run validate-copy` e `npm run render-only` aprovadas.
- Correção funcional em `5ed5a5c`, sincronizada com `origin/main` no conjunto concluído em `62c23cb`. Nenhuma republicação foi feita; o próximo Story automático será a prova em produção.
- Capa defeituosa confirmada em `Dc3qOE0HPqm`, Media ID `18060129533789175`: miniatura WordPress de 7.820 bytes foi rejeitada e o layout permaneceu sem fotografia.
- Correção preparada: tentar automaticamente a imagem WordPress original sem o sufixo de dimensão e manter fallback fotográfico para capas de impacto.
- Render exato aprovado: `2026-09-04-123737-slot-0-render-only`, com imagem oficial do Project Zenith, título amplo e sem vazio central.
- A mídia defeituosa foi excluída do aprendizado. Nenhuma republicação foi feita; repostar somente com autorização do usuário.
- Correção em produção: `6578e21`; gatilho imediato das exclusões: `722571a`; run de aprendizado `33890850627` com sucesso e estado `296d0e8`. As mídias defeituosas `18060129533789175` e `18109419116466917` possuem zero amostra no modelo remoto.
- Primeira comprovação automática após a correção: run `33879785141`, Reel `https://www.instagram.com/reel/Dc3huyfACsk/`, Reel ID `18147204064544355`, Story ID `18407241052082096`, estado persistido em `d1c8c89`.
- Story real inspecionado: foto editorial da pauta presente, sem degradê substituto, sem sobreposição e dentro da área segura. O slot 2 foi recuperado pelo cron principal sem disparo manual.
- Seleção do algoritmo: modo `experiment`, pauta inédita da Mobile Time sobre agentes de IA da Genesys no Brasil. O resultado entrará no aprendizado somente nas janelas maduras de 2 h, 24 h e 72 h.
- Primeiro comentário com `OAuthException #10`, isolado; não invalida Reel nem Story.
- Correção visual preparada na branch limpa `fix/story-photo-overlap-20260904`, criada a partir do `origin/main` em `bb3e359`.
- Story defeituoso confirmado em `Dc3Y7WUoAlp`: imagem editorial inválida do tipo YouTube embed virou degradê e `.visual-card` não participava da trava de colisão.
- Correção: rejeição de URLs de vídeo como imagem, nova extração da foto real da matéria, fallback fotográfico válido e checagem de colisão/área segura incluindo `.visual-card`.
- Render aprovado visualmente: `2026-09-04-095705-slot-0-render-only`, reproduzindo a pauta Dyson com foto real e sem sobreposição.
- Media ID defeituoso `18109419116466917` excluído do aprendizado. O algoritmo continua aprendendo somente com amostras independentes de desempenho em 2 h, 24 h e 72 h; esta falha visual não influenciará os modelos.
- Legendas do Radar passam pelo limite de 2.100 caracteres antes da validação do conjunto de candidatos, preservando título, fonte, CTA e hashtags.
- Validações aprovadas: `node --check`, `git diff --check`, `node scripts/collect-instagram-performance.mjs --validate`, `npm run validate-copy` e `npm run render-only`.
- Correção enviada ao `origin/main` em `01f4a30`. O aprendizado em nuvem concluiu com sucesso no run `33875551975` e persistiu o estado em `007e4ef`: 64 mídias acompanhadas e nenhuma amostra do Media ID defeituoso `18109419116466917`.
- Nenhum post foi repetido. Próximo passo: inspecionar o primeiro Story automático posterior à correção e exigir foto real, ausência de sobreposição, permalink e IDs.
- Motor de crescimento implementado no commit `1b4d18e`: amostra efetiva por mídia, retenção, abandono, visualizações por alcance, segmentação de público, classificação de gancho e evolução semanal.
- Seleção automática 70/20/10 ativa somente entre candidatos inéditos e aprovados: 70% aproveitamento, 20% exploração e 10% experimento. As 13 publicações BRT e todas as travas editoriais permanecem preservadas.
- O dashboard passa a explicar a diferença entre coletas e posts independentes e exibe cobertura de retenção, alcance/interações semanais, público e gancho em destaque.
- Produção comprovada: run `33803568631` bem-sucedido, estado `e773eb9` com 57 mídias, 23 amostras efetivas, cinco públicos, quatro ganchos e alcance semanal 181; deploy `dpl_34MJyHpbw65FTPWh4jXi2guGvoA9` em estado `READY`.
- Dashboard: a aba `Visão geral` agora possui `Aprendizado de desempenho`, exibindo dados persistidos pela automação na nuvem por fonte, tema e formato, base observada, janelas de 2 h/24 h/72 h e última coleta.
- Segurança: o endpoint privado fornece somente um resumo de `performance-insights.json`; não expõe token Meta, secrets nem mensagens internas completas.
- Implementação registrada no commit `7cd2785`, checkout `cliente-x-instagram-modern-deploy-20260903`, branch `ops/record-slot8-20260903`. Validações de sintaxe, diff e copy aprovadas. Deploy `dpl_BYBkvenVHNiarMAQEJEd2iVSH4Vy` está `READY` e confirmado no domínio `cliente-x-instagram.vercel.app`.
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
- Correção enviada ao `origin/main` no commit `35c797e`, pela branch `ops/record-slot8-20260903`; falta comprovar visualmente no próximo Reel real.

## Atualizacao 2026-09-03 16:37 BRT — somente Beethoven nos Reels

- O último Reel tinha áudio tecnicamente normal, mas recebeu a trilha genérica `futuro-leve` porque ela ainda participava da rotação de 12 opções.
- A rotação passa a usar exclusivamente nove arranjos próprios inspirados nas Sinfonias nº 1 a nº 9 de Beethoven.
- `reelSoundtrackGuard: beethoven-only-9`, `node --check` e `git diff --check` aprovados; correção enviada ao `origin/main` em `19f8b28` e falta comprovação no próximo Reel real.

## Atualizacao 2026-09-03 16:47 BRT — publicação extra comprovada

- Run manual `33797996650`: `https://www.instagram.com/reel/Dc1l5OGlzpT/`, Reel `18035816840832046`, Story `18616966816059533`, publicado às 16:45 BRT.
- Trilha real: `beethoven-02-vivace`, inspirada na Sinfonia nº 2; MP4 com AAC estéreo, média `-16,8 dB` e pico `-1,7 dB`.
- Pauta inédita da Exame sobre economia de tokens; somente o primeiro comentário falhou com Meta `OAuthException #10`.
- A marcação acidental do slot 10 foi removida para preservar as 17:40. Novo input `mark_automatic_slot` separa postagem extra de recuperação automática; correção enviada ao `origin/main` em `5d23592`.

## Atualizacao 2026-09-03 16:52 BRT — seleção por potencial orgânico

- Motor interno e invisível pontua pauta por recência, imagem, especificidade, utilidade empresarial, curiosidade, aderência ao perfil e densidade factual.
- Conteúdo antigo, título longo, promoção e clickbait recebem penalidade; novidade semântica e rodízio de fontes continuam obrigatórios.
- A seleção ocorre dentro da fonte equilibrada e conserva uma lista curta para manter variação humana, sem promessa artificial de viralização.
- Nota e sinais são gravados somente nos artefatos técnicos. `organicPotentialGuard` e toda a suíte `validate-copy` aprovados; motor enviado ao `origin/main` em `052484a`.

## Atualizacao 2026-09-03 17:00 BRT — ranking comprovado em publicação real

- Run `33799323838`: `https://www.instagram.com/reel/Dc1ndzdggi2/`, Reel `18143386705559746`, Story `17900125953566762`, publicado às 16:59 BRT.
- O ranking escolheu uma pauta recente da Nossa IA sobre receita do Azure e impacto financeiro da IA, com imagem editorial da matéria.
- Reel real auditado: 22,37 s, AAC estéreo 48 kHz, média `-16,7 dB`, pico `-1,6 dB` e trilha `beethoven-08-brincante` da Sinfonia nº 8.
- Capa visualmente aprovada e sem `ARRASTE PARA VER`. Primeiro comentário falhou isoladamente com Meta `OAuthException #10`.
- A publicação extra não marcou o slot 10; as 17:40 continuam pendentes no livro automático.

## Atualizacao 2026-09-03 17:08 BRT — algoritmo aprende com resultados

- Novo coletor em nuvem observa desempenho após 2 h, 24 h e 72 h e persiste `performance-insights.json` sem segredos.
- Nota normalizada por alcance usa compartilhamentos, salvamentos, comentários, curtidas, interações e retenção quando a Meta disponibiliza; métricas incompatíveis são ignoradas individualmente.
- Modelos por fonte, tema e formato usam suavização de amostra pequena. O ranking só aplica aprendizado com duas ou mais observações e limita o ajuste para não atropelar qualidade editorial.
- Workflow `Instagram Performance Learning` roda a cada duas horas e no primeiro deploy. Travas de novidade, fonte e integridade factual continuam obrigatórias.
- Testes de score, modelos, sintaxe, `validate-copy`, JSON, YAML e diff aprovados; falta enviar e confirmar a primeira coleta real.

## Atualizacao 2026-09-03 17:11 BRT — coleta real operacional

- Workflow `Instagram Performance Learning` comprovado no run `33800597525`; commit automático `f7a659f` armazenou 57 publicações.
- Primeira observação válida de 2 h registrada com alcance, visualizações e interações normalizadas.
- Métricas atuais descobertas na resposta real da Meta: `ig_reels_video_view_total_time`, `ig_reels_avg_watch_time`, `reels_skip_rate`, `reposts`, `follows` e `profile_visits`.
- Coletor ajustado para retenção, abandono, repostagem e conversão. Mídias antigas sem acesso ficam fora do aprendizado sem derrubar o workflow.
- Toda a suíte continua aprovada; falta enviar esse ajuste e conferir a próxima coleta.

## Atualizacao 2026-09-03 17:15 BRT — confiança por amostra e alcance

- Segunda coleta confirmada no run `33800885079`; commit automático `c8abd60`, com 57 mídias acompanhadas e 23 observadas.
- Modelos atuais: duas fontes, três temas e dois formatos. Alcance inicial ainda baixo, entre 1 e 7 em várias observações.
- Aprendizado agora combina quantidade de posts e alcance acumulado; permanece quase neutro até ter volume confiável e só atinge influência plena com cinco posts e alcance 200 por grupo.
- Score, confiança, sintaxe, `validate-copy`, YAML e diff aprovados; proteção final enviada ao `origin/main` em `571db26`.

## Atualizacao 2026-09-04 16:00 BRT — recuperação FFmpeg do vigia corrigida

- Branch de trabalho: `fix/watchdog-ffmpeg-queue-20260904`, criada sobre o `origin/main` de produção e enviada novamente ao `main` em `939556d`.
- O backup agora instala e valida FFmpeg tanto para `scheduled_queue` quanto para `auto_slot`; a fila agendada também exporta data e horário para evitar novos registros `sem-data`/`unknown`.
- Uma publicação bem-sucedida encerra falhas abertas de infraestrutura mesmo quando o run anterior não registrou o slot. O alerta do run `33901832291` está resolvido pelo run automático `33905655081`.
- Sintaxe, JSON, `validate-copy` e `git diff --check` aprovados. O próximo disparo agendado do vigia deve ser observado sem intervenção manual para comprovar a execução do novo commit na nuvem.

## Atualizacao 2026-09-04 16:00 BRT — recuperação automática de FFmpeg no vigia

- Base de produção confirmada em `0e6a96e`; trabalho isolado na branch `fix/watchdog-ffmpeg-queue-20260904`.
- O backup agora instala FFmpeg tanto para a fila editorial agendada quanto para o livro automático de slots, eliminando a condição que causou `spawnSync ffmpeg ENOENT` no run `33901832291`.
- Itens da fila agendada exportam data e horário para que falhas futuras não apareçam como `slot 0unknown`.
- Uma publicação bem-sucedida encerra alertas abertos de infraestrutura mesmo se eles estiverem sem metadados; o alerta existente foi marcado como resolvido pelo run `33905655081`.
- Correção funcional enviada como `b0cf25d` e consolidada no `origin/main` em `fdb6a61`. O run automático `33912573012` carregou o código corrigido com sucesso; não havia item devido e, corretamente, não publicou.

## Atualizacao 2026-09-04 16:58 BRT — Nerion Social v6.0 estável

- Versão em produção: `v6.0`, rótulo `Versão estável`, modelo `nerion-adaptive-v1.0.0`; commit funcional `7a83fa5`, checkpoint `0d11ab7` e estado automático `b54b4ca` no `origin/main`.
- Estado do aprendizado: assistido e protegido por confiança; a autonomia só é liberada com 50 amostras efetivas, alcance 1.000, 30 testes controlados e cobertura mínima de `exploit`, `explore` e `experiment`.
- Coleta com mais de cinco horas ativa `editorial-fallback`: o histórico vencido deixa de influenciar o ranking, mas originalidade, qualidade, fontes e antirrepetição continuam obrigatórios.
- Cada publicação futura registra a versão e a decisão do modelo. O painel mostra confiança, frescor, alcance efetivo, testes controlados e fallback.
- O workflow também reage à conclusão de `Instagram Feed Cliente X`, além do cron de duas horas, para recuperar coletas perdidas automaticamente na nuvem.
- Validações locais aprovadas. Deploy `dpl_BaZNSUVyo7TJHKL7KQWwuUSkxqZ9` em `READY`; domínio principal respondeu HTTP 200 e confirmou a v6.0 e o painel adaptativo.
- Primeira coleta v6.0 concluída automaticamente: 71 mídias, 34 amostras efetivas, alcance 228, dez testes controlados, confiança moderada e modo assistido. Autonomia ainda não liberada; próximo passo é acumular alcance 1.000, 50 amostras e cobertura mínima dos três modos.

## Atualizacao 2026-09-04 17:08 BRT — aprendizado contínuo no painel v6.01

- Checkout alinhado à produção confirmado em `72c3954`, na branch `feat/v6-stable-learning`; o checkout antigo `modern-incident` não foi usado.
- A API privada deixou de depender apenas do `performance-insights.json` empacotado no deploy e agora consulta, sem cache, o estado mais recente persistido pela automação no `origin/main`.
- Se o GitHub estiver temporariamente indisponível, o painel usa o snapshot do deploy como contingência e sinaliza essa condição, sem interromper a automação nem desativar as travas editoriais.
- O painel v6.01 identifica a origem dos dados e mostra `Evoluindo` quando acompanha o estado vivo. Teste real da origem remota confirmou HTTP 200, atualização `2026-09-04T20:00:34.546Z`, 71 mídias e 34 amostras observadas.
- Sintaxe da API e do estado, JavaScript do dashboard, `validate-copy` com 75 seleções e `git diff --check` aprovados. Implementação funcional `b917c17` e checkpoint inicial `16abe42` enviados ao `origin/main`.
- Deploy de produção `dpl_CsVqECS1anq2isvG6Q6HcJHYfFpy` concluído em `READY`. O domínio principal respondeu HTTP 200 com v6.01, commit estável `b917c17`, cartão de atualização contínua, origem viva e estado `Evoluindo`; `/api/private-metrics` permaneceu corretamente protegido com HTTP 401 sem sessão.

## Atualizacao 2026-09-04 17:14 BRT — Reel nativo sem faixas desfocadas

- O Reel era composto por cards 1080 x 1350 centralizados em 1080 x 1920; o FFmpeg ampliava e desfocava o próprio card para preencher o topo e a base, produzindo o efeito de sombra indicado pelo usuário.
- Cards de `reel-only` e `reel-and-story` agora são renderizados nativamente em 1080 x 1920. Carrosséis permanecem em 1080 x 1350 e Stories mantêm suas zonas seguras.
- O vídeo usa o quadro vertical diretamente, sem `gblur` nem sobreposição do card 4:5. A trava `reelFullFrameGuard: 1080x1920-native-no-blurred-bars` impede regressão.
- Render sem publicação `2026-09-04-171417-slot-1-render-only` inspecionado na capa, card interno e fechamento. MP4 confirmado em 1080 x 1920, SAR 1:1 e DAR 9:16; sintaxe, 75 seleções editoriais e `git diff --check` aprovados.
- Correção funcional `556db3c` e checkpoint `46311a8` enviados ao `origin/main`; falta comprovar o enquadramento no próximo Reel automático real.

## Atualizacao 2026-09-04 17:30 BRT — aprendizado adaptativo v1.1

- O modelo `nerion-adaptive-v1.1.0` passa a calcular resultados específicos para descoberta, utilidade, conversa, conversão e retenção; visitas ao perfil e seguidores ganham peso próprio para não confundir curtida com resultado comercial.
- Cada publicação automática registra formato, faixa horária BRT, objetivo, sinal principal, modo 70/20/10, eixo controlado, razões da decisão, penalidade de fadiga e versão do modelo.
- O baseline contextual combina formato, faixa horária e objetivo. Dados antigos recebem decaimento com meia-vida de 21 dias; fonte, tema e gancho muito recentes perdem pontos sem substituir as travas rígidas de novidade.
- O painel ganhou contexto em destaque e visitas ao perfil. O modo permanece assistido e os critérios de autonomia continuam inalterados.
- Validações aprovadas: modelo puro v1.1, cinco objetivos, baseline contextual, decaimento temporal, auditoria, fadiga, sintaxe, dashboard, 75 seleções editoriais e `git diff --check`. Commit funcional `b0a0b45` e checkpoint `1b625c7` enviados ao `origin/main`.
- Workflow automático `33916264377` concluiu todas as etapas e persistiu `df45fa2`: schema 3, modelo v1.1, 71 publicações contextualizadas, 36 observadas, confiança moderada e modo assistido.
- Deploy `dpl_HwJdyEYHjo2bZpe6Q37Y3LzQ1ijB` em `READY`; o domínio principal confirmou contexto em destaque, visitas ao perfil, commit estável e descrição v1.1. Próxima prova: observar decisões e resultados das novas publicações contextualizadas.
# Atualizacao 2026-09-05 10:09 BRT — publicação visual comprovada e painel multi-conta mais eficiente

- `origin/main` contém a correção de capa vertical (`17828c46`) e a agenda modernizada com teste seguro de conexão (`817772d1`).
- Prova Instagram: “Ambiente local não é ambiente publicado.”, Reel `17906748327503939`, Story `18033045212654103`, permalink `https://www.instagram.com/reel/Dc6BfBFAg4Z/`, publicado automaticamente às 10:03 BRT e persistido em `publication-history.json`.
- O painel mostra resumo e filtros na previsão de amanhã, reduz a densidade visual dos cartões e preserva os 13 horários BRT.
- Novas contas continuam sendo criadas por convite OAuth mascarado. Depois da conexão, o botão “Testar conta selecionada” faz verificação somente leitura e não publica conteúdo.
- Facebook: conta vinculada e compartilhamento automático de posts/Stories estavam ativos, porém o Reel novo ainda não apareceu na aba de Reels na verificação das 10:09 BRT. Publicação no Facebook segue pendente de prova.
# Atualizacao 2026-09-05 10:15 BRT — correção visual do livro pronta

- Commit `8f119331` no `origin/main` corrige texto branco sobre cartão branco no último slide e usa a área livre da capa vertical para mostrar o apoio editorial.
- Render exato aprovado em `2026-09-05-101333-slot-0-render-only` (Reel + Story) e `2026-09-05-101443-slot-0-render-only` (Feed + Story), sem republicação.
- O Facebook mostra 323 grupos vinculados ao perfil. Os grupos editorialmente aderentes encontrados incluem Comunidade Anthropic Claude Brasil e CLAUDE CODE BRASIL; nenhuma publicação em grupo foi enviada sem seleção explícita do destino.

# Atualizacao 2026-09-05 10:31 BRT — Stories equilibram notícias e conteúdo autoral

- Branch de trabalho `fix/story-lower-balance-20260905`, baseada no `origin/main` `cfab20ea`.
- Próximos Stories automáticos mantêm as notícias como fluxo principal e inserem um conteúdo do livro após cada cinco Stories noticiosos, sem mexer no Feed/Reel correspondente.
- Existem 21 Stories autorais configurados; títulos ainda não usados têm prioridade e o histórico registra separadamente o conteúdo efetivamente publicado no Story.
- Validações aprovadas: sintaxe, 75 seleções editoriais, 21 candidatos autorais, intervalo mínimo de cinco notícias, reinício após livro e `git diff --check`.
- Nenhuma publicação foi feita. Próxima prova operacional: observar a primeira ativação natural da regra e exigir o Story ID persistido; o permalink e o ID do Feed/Reel continuam pertencendo à notícia do horário.
- Implementação funcional disponível no `origin/main` em `05410252`.

# Atualizacao 2026-09-05 10:38 BRT — publicação autoral comprovada

- Run automático `33969336338` publicou `Prompt profissional não é frase solta.` às 10:37 BRT.
- Permalink: `https://www.instagram.com/p/Dc6Fdv9oNO_/`; Feed `18117859415286922`; Story `17960957823207557`.
- `scheduled-posts.json` e `publication-history.json` estão persistidos no remoto; Story 9:16 inspecionado com texto, CTA e fotografia aprovados.
- Não houve erro de primeiro comentário; o conteúdo não tinha comentário inicial configurado.

# Atualizacao 2026-09-05 10:43 BRT — nome fora da foto; Facebook ainda não integrado

- Stories com fotografia deixam de repetir `Marcondes Machado` sobre a imagem; o identificador do perfil permanece no topo.
- Render exato `2026-09-05-104247-slot-0-render-only` aprovado sem publicação ou repostagem.
- O Facebook foi verificado no perfil real e o post novo não aparece. O workflow atual publica apenas no Instagram e não possui publicação direta para Facebook.
- Para automação suportada e auditável no Facebook, falta configurar uma Página administrada com credenciais e permissões próprias; nenhuma configuração da Meta foi alterada nesta etapa.

# Atualizacao 2026-09-05 10:51 BRT — Página pessoal reativada

- `marcondes_j_machado` está novamente ativa no Facebook como Página de figura pública.
- Estado inicial confirmado: 0 seguidores e nenhum post; Página aberta no navegador para conferência.
- Ainda falta revisar nome/identidade, conectar o Instagram e autorizar o caminho de publicação da Página antes de qualquer teste real.
- Nenhum conteúdo foi publicado e a Página `Eletro e Casa Shop` permaneceu intacta.

# Atualizacao 2026-09-05 15:50 BRT — Radar sem repetição de imagens

- Cada cartão pesquisado pelo Radar exige uma foto editorial inédita vinda das matérias sobre IA; fotos genéricas locais não são mais usadas nesse fluxo.
- A trava compara URL e hash do arquivo, registra a proveniência visual no run e no histórico e bloqueia a publicação se faltar uma imagem diferente para qualquer slide.
- Render `2026-09-05-154731-slot-4-render-only` aprovado visualmente com cinco imagens distintas. Nenhuma mídia foi publicada ou republicada nesta correção.

# Atualizacao 2026-09-05 15:54 BRT — acentuação HTML corrigida

- O Radar passa a converter entidades como `H&aacute;`, `g&aacute;s`, `n&atilde;o`, `&ccedil;` e códigos numéricos para caracteres portugueses normais antes de montar o conteúdo.
- O cache anterior recebe a mesma correção ao ser carregado e a validação bloqueia qualquer texto que ainda contenha entidade HTML.
- Teste de regressão com a frase reportada, sintaxe, `validate-copy` e `git diff --check` aprovados. Nenhuma publicação foi refeita.

# Atualizacao 2026-09-05 15:56 BRT — post Magalu Cloud com falha visual auditado

- `Dc6oFhHlDuB` foi publicado antes da trava visual: Feed `18147144790553771`, Story `18109069519887173`, run `33984588888`.
- Os arquivos reais comprovam quatro cartões sem fotografia editorial e um cartão com foto genérica; o post foi excluído do aprendizado de desempenho.
- A correção `eb1a2a63` já impede o mesmo resultado nas próximas pautas. O conteúdo existente permanece no perfil até haver autorização para removê-lo e publicar uma versão nova.

# Atualizacao 2026-09-05 17:50 BRT — Nerion Visual Cloud ativo

- Agente em nuvem: `Nerion Visual Cloud` v1.0.0, integrado ao workflow principal e ao publicador.
- Somente imagens vinculadas à URL da pauta selecionada podem entrar na arte; fotografias de outras notícias estão proibidas.
- Capa e Story priorizam a foto real da matéria. Sem múltiplas imagens comprovadas, os cartões internos ficam tipográficos.
- O fallback de Reel `2207085` cria um carrossel novo em 1080x1350; quadros 9:16 não são mais publicados como Feed.
- Cada publicação registra versão, política, decisões por slide, fonte, URL, hash e eventual `reusedRelevantImage`.
- Provas preservadas: `Dc6ziUhCUdM` (Feed `18071851835727747`, Story `18082908059497157`) e `Dc613j-Hb24` (Feed `18090398927175449`, Story `17993232135031088`). A segunda revelou imagens sem relação e não é exemplo visual aprovado.
- Render aprovado sem publicação: `2026-09-05-174816-slot-12-render-only`, com foto pertinente na capa/Story e slides internos sem imagens cruzadas.
- Próxima prova real deve exigir `visualAgent` no histórico, permalink, Feed/Reel ID e Story ID; workflow verde isolado não basta.

## 2026-09-06 — Série aprovada e antecipação autorizada

- Série de 14 episódios com CTA exato aprovado; Reel + Story no slot 9, 16:00 BRT (checagem 16:07), mantendo os 13 horários.
- Usuário autorizou antecipar somente episódio 1 hoje por execução cloud explícita sem marcar slot automático. Publicação e IDs ainda pendentes neste checkpoint.
- Próximo episódio passa a ser o primeiro ainda sem mediaId no histórico: prioridade da fila e falhas não descartam capítulos; conclusão pode ultrapassar o fim inicialmente planejado. Após antecipação, episódio 2 será elegível amanhã às 16h.
- Foto pertinente de revisão operacional na capa/Story; cards internos e CTA tipográficos sem fotos genéricas. Render Reel + Story isolado 2026-09-06-190147-slot-9-render-only aprovado visualmente; validações de conteúdo, seguidores, sequência e sintaxe aprovadas.

## 2026-09-08 — correção do bloqueio HTML no Radar

- Base de produção 2d020c59; worktree cliente-x-instagram-html-fix-20260908; branch fix/radar-html-queue-20260908.
- Falhas desde 07/09 15:25 BRT: entidade &uuml; em pauta Radar abortava a validação global antes de selecionar o agendamento do livro. Última falha consultada: run 34220963006.
- Decodificação ampliada com entities 8.1.0; pautas Radar inválidas são rejeitadas individualmente, com fonte e erro registrados, antes da seleção. Travas de fatos, origem e duplicidade mantidas.
- Regressões de entidades, cache e isolamento passaram; sintaxe, validate-copy (75 seleções) e dry-run --scheduled-only aprovados. Ensaio selecionou livro-claude-code-20260902-18 e renderizou Feed/Story sem publicar.
- Publicação automática posterior à correção ainda pendente de verificação; não considerar o ensaio prova de recuperação.

### Verificação de produção — 08/09/2026 10:07 BRT

- Correção 963fa3e9 publicada em main. Gatilho de recuperação existente acionado por push e1042993, sem workflow_dispatch; não confundir esse início com disparo cron.
- Run 34229571001 concluído: livro-claude-code-20260902-18 publicado às 10:04 BRT; Feed 18071464916720037, Story 18123239998842942, https://www.instagram.com/p/DdBwCuDDBBU/. Fila marcada published; histórico persistido; Story real do artefato inspecionado visualmente. Primeiro comentário sem ID e sem erro registrado.
- Watchdog iniciou automaticamente via workflow_run e concluiu run 34229755437: outro agendamento do livro publicado às 10:06 BRT; Feed 18408767569080919, Story 18149885944547971, https://www.instagram.com/p/DdBwU1THcfG/. Histórico em 9e87cf1f comprova continuidade da fila.
- Ambos eram agendamentos: Mark automatic slot published foi corretamente ignorado. Os 13 horários permanecem configurados; recuperação dos slots Radar e próximo disparo por cron ainda não comprovados. Alertas antigos associados aos slots não foram apagados ou declarados resolvidos sem publicação correspondente.

## 2026-09-08 10:34 BRT — cartão de texto sobre a fotografia

- Capturas do usuário revelaram sobreposição nos slides internos dos livros publicados às 10:04 e 10:06. A inspeção anterior de capa/Story não cobriu esse defeito nos slides internos.
- Causa: regras genéricas role-value/role-proof recolocavam .note em top 680 sobre a fotografia; a guarda verificava título e imagens, mas não foto x cartão de texto.
- Corrigido CSS dos cards internos Feed e adicionada guarda geométrica foto x cartão inteiro, com ajuste da altura disponível e bloqueio se persistir colisão. Medição aguarda as fontes carregarem.
- Base origin/main e7480add. Sintaxe, validate-copy e render dos dois packs completos passaram; slides internos 2 e 4 inspecionados. Evidências locais: 2026-09-08-103234-slot-0-render-only e 2026-09-08-103320-slot-0-render-only.
- Correção para próximas renderizações. Posts existentes não foram apagados ou republicados. Nova publicação com esta alteração ainda não verificada.

## 2026-09-08 10:54 BRT — próxima publicação automática monitorada

- Run 34234414987, Instagram Feed Cliente X, evento schedule, SHA f60afe40. Sem disparo manual. Publish feed and story, Mark automatic slot published e Persist schedule state concluídos com sucesso.
- Slot editorial 1 das 08:10 BRT recuperado às 10:51:55 BRT. Feed 18104779481263467; Story 18111981737083305; https://www.instagram.com/p/DdB1elelG1b/.
- Histórico e published-slots persistidos em 41c6965c. Artefato 10059270296 baixado; cinco slides e Story reais inspecionados: sem sobreposição foto/texto. Capa com imagem da matéria, interiores tipográficos e avatar separado do cartão.
- Primeiro comentário falhou com Meta code 10 (Application does not have permission for this action). Feed/Story estão publicados; comentário não confirmado.
- Esta amostra confirma publicação real com a correção visual. Os slides internos desta notícia são tipográficos; não substitui uma futura verificação de post do livro com fotos internas.

## 2026-09-08 — padrão visual aprovado pelo usuário

- Aprovação explícita: "ficou bom grave isso pra nao precisar alterar mais".
- Referência aprovada: https://www.instagram.com/p/DdB1elelG1b/, run 34234414987, correção f60afe40, cinco slides e Story verificados. Arquivos: docs/generated/cliente-x/2026-09-08-105115-slot-1/.
- Preservar composição, cores, espaçamento e separação entre foto e cartão de texto. Não redesenhar ou fazer alterações visuais espontâneas; alterar o visual somente por solicitação do usuário. Correções operacionais devem manter o padrão aprovado e as guardas de colisão.
- Aprovação registrada também na memória persistente do assistente. Nenhuma alteração de layout ou publicação foi feita neste registro.

## 2026-09-10 — Story sem foto e rodapé sobreposto
- Caso comprovado no histórico: AirPods, https://www.instagram.com/p/DdHQjLRDMGP/, visualSources vazio e approvedVisuals=0.
- A imagem da fonte respondeu HTTP 200, mas tem 13.568 bytes, abaixo do mínimo de 20 KB. As tentativas de original sem o sufixo de miniatura retornaram 404.
- Proteção anterior 8dda9356 bloqueia capa editorial ausente/reutilizada. Story agora verifica carregamento real da foto no navegador e inclui nota/rodapé na checagem de colisões; assinatura inferior removida do layout impact-carousel.
- Validação: validate-copy (75 seleções), validate-visual-agent, sintaxe e diff; renderStory real com a miniatura exclusivamente para QA do layout, inspecionado visualmente; foto ausente/corrompida rejeitada. Prévia em automation/instagram-template/runs/story-photo-qa/story.jpg. Miniatura não aprovada para publicação.
- Nenhuma exclusão ou republicação. Resultado de próxima publicação automática ainda não verificado.

## 2026-09-10 — Recuperação de foto por fonte alternativa verificada
- Fluxo tenta imagem do feed, imagem principal da página original e alternativa externa previamente vinculada à matéria. Primeiro vínculo verificado: Tecnoblog AirPods 5 -> anúncio oficial Apple de 09/09/2026.
- Registra imageSourcePageUrl, imageCredit e imageEvidence em visualSources. Rejeita URL/hash já publicados e continua procurando alternativa. Não usa correspondência genérica de palavras para trocar modelos ou eventos.
- Teste real: imagem Apple de 37.030 bytes baixada; Story renderizado e inspecionado em automation/instagram-template/runs/official-image-qa/story.jpg. Reuso rejeitado no segundo teste. Nenhuma republicação realizada.
- Checks: validate-copy, validate-image-fallbacks, validate-visual-agent, node --check e git diff --check. Novas matérias precisam de vínculo verificado para alternativa externa; tentativa na própria página é geral.

## 2026-09-10 — Busca automática e fotografias distintas por cartão/cena
- Pedido: procurar imagens em outros portais e impedir repetição em Stories, carrosséis e Reels.
- Busca ampliada às páginas de cobertura relacionada presentes nos packs pesquisados pelo Radar (até 8), com filtros conservadores de título, números/modelos e data de até 72 horas. Mantém alternativas oficiais verificadas e explora fotos identificadas no corpo das matérias. A correspondência textual é heurística, não uma aprovação semântica humana.
- Carrossel/Reel editorial exige uma foto distinta por cartão/cena; Story-only exige uma. Bloqueia quantidade insuficiente. Stories usam o histórico editorial de fotos; o Story que acompanha o Feed ainda usa a foto da capa da mesma publicação.
- Compara URL normalizada, SHA256 e assinatura visual dHash (256 bits, limiar conservador de 48). Guarda novas assinaturas no histórico visual. Histórico antigo sem assinatura ainda conta com URL/hash; a comparação visual histórica passa a valer nas novas entradas.
- Renderização também verifica repetição visual de fotografias explícitas/locais, incluindo livros, antes de gerar carrossel/Reel. Faltando foto no layout impact-carousel, bloqueia. Busca automática externa está vinculada às pautas do Radar; conteúdo autoral sem matéria exige ativo apropriado.
- Teste real AirPods: 3 fotos distintas encontradas; versões redimensionadas descartadas e pacote de 5 bloqueado. Dois cartões e duas cenas renderizados e inspecionados; duplicação intencional rejeitada. Ajustados tamanho da foto final no Feed, contraste do selo e colisão da nota final no Reel.
- Passaram validate-copy (75 seleções), validate-image-fallbacks, validate-visual-agent, sintaxe e diff. Não houve publicação ou exclusão; confirmação visual em produção permanece pendente.

## 2026-09-10 16:24 BRT — seleção alternativa após bloqueio visual
- Retomada no worktree cliente-x-instagram-photo-fix-20260910, branch fix/photo-quality-20260910, base origin/main af981b36; checkout incident é histórico.
- Produção: runs 34517955312 e 34518111324 falharam no slot 6 (13:50 BRT) por fotos distintas insuficientes; nenhuma recuperação comprovada.
- Seleção Radar agora avalia até oito fontes inéditas pela mesma seleção com guardas de duplicidade e aprendizagem. Uma pauta sem fotos suficientes é rejeitada e outra é avaliada antes da renderização. Agendamentos, conteúdo do painel e série explícita são preservados.
- Auditoria visual-selection.json registra fonte, quantidade necessária/encontrada e decisão; imagens ficam em subpastas por candidato. Nenhuma redução de cartões, repetição de fotos ou mudança de layout.
- Sintaxe, validate-copy (75 seleções), validate-visual-agent, validate-image-fallbacks e teste controlado de alternativa aprovada/agendamento preservado/esgotamento passaram.
- Dry-run real 2026-09-10-162051-slot-0 percorreu oito pautas, com uma ou duas fotos por pauta para cinco cartões, e bloqueou corretamente. Não é prova de recuperação nem publicação.
- Próximo passo: acompanhar execução automática com a correção; exigir histórico, slot, permalink, Feed/Reel ID, Story ID e inspeção visual. Escassez de fotos suficientes permanece pendente.

## 2026-09-10 17:22 BRT — bloqueio por cinco fotos corrigido
- Monitoramento confirmou falhas reais nos runs 34521839910, 34522811586, 34522817623, 34523189175, 34524403955, 34524581733 e 34525227503. Todos preservaram o slot 6 e falharam porque nenhuma pauta fornecia cinco fotos distintas.
- Nerion Visual Cloud v1.1.1 exige foto real, pertinente e inédita na capa/Story. Fotos adicionais só entram quando distintas; cartões internos sem outra foto comprovada usam o layout tipográfico aprovado.
- O Radar avalia até oito pautas e escolhe a que tiver a melhor cobertura visual, sem repetir imagens, reduzir o carrossel ou misturar fotos de matérias diferentes.
- Dry-run real 2026-09-10-171855-slot-0: oito pautas avaliadas; pauta do IT Forum escolhida com uma foto válida; cinco cards e Story gerados. Capa, card tipográfico 2/5 e Story inspecionados sem sobreposição e mantendo o padrão aprovado.
- Validações: sintaxe, validate-copy (75 seleções), validate-visual-agent, validate-image-fallbacks e diff. Nenhuma publicação foi feita neste teste.
- Próximo passo: enviar para main e acompanhar a primeira execução automática até histórico persistido, permalink, Feed/Reel ID e Story ID.

## 2026-09-10 17:44 BRT — recuperação automática comprovada
- Correção v1.1.1 publicada em main pelo commit 0d5283a6. O run automático 34527660625 recuperou o slot 6 sem workflow_dispatch.
- Slot persistido como published às 17:42 BRT. Reel 18114211153790240; Story 18175609840435856; permalink https://www.instagram.com/reel/DdHt-ywDDti/.
- Pauta: Mobile Time, `Apple apresenta iPhone 18 Pro e Max com Siri AI reformulada`. Histórico registrou o plano visual, fonte, hashes e três cartões tipográficos.
- Story e seis quadros do Reel hospedado foram inspecionados. Composição e separação de texto/foto estão corretas; uma transição intermediária contém o crossfade esperado e o quadro final fica limpo.
- A inspeção revelou que as duas fotos aceitas eram a mesma imagem em URL original e derivada `-1280x640.jpg.webp`. O post existente foi preservado. `photoIdentity` agora colapsa dimensões e extensões de conversão para impedir esse reuso nas próximas publicações; regressão adicionada.
- Primeiro comentário falhou separadamente com Meta OAuthException code 10 por falta de permissão. Feed/Reel e Story permanecem publicados.
- Erro anterior 34525227503 marcado como resolved pelo run 34527660625. Próximo passo: enviar a deduplicação de derivados para main e acompanhar nova amostra visual automática.
- Deduplicação de derivados enviada para `origin/main` no commit de código a69cb958. Próximo passo vigente: acompanhar a próxima amostra automática; não apagar nem republicar o Reel já publicado.

## 2026-09-10 17:53 BRT — área inferior dos cards tipográficos preenchida
- Usuário apontou vazio excessivo abaixo do cartão no Reel do Olhar Digital, publicado pelo run 34525227503 em https://www.instagram.com/reel/DdHuTYIjlqr/.
- Alteração visual explicitamente autorizada: cards internos tipográficos 9:16 passam a ocupar 720 px na metade inferior, com texto maior, faixa lateral da marca e alinhamento vertical; CTA final ocupa 760 px.
- Cores, tipografia, título, progressão, avatares e padrão aprovado foram preservados. Nenhum texto factual novo ou fotografia genérica foi acrescentado.
- Validação de sintaxe, validate-copy com 75 seleções e diff passaram. Render 2026-09-10-175019-slot-7-render-only gerou Reel completo; quadros 3, 4 e 5 foram inspecionados em 1080x1920 sem colisão e com a área inferior preenchida.
- Correção vale para próximas renderizações. O Reel existente não foi apagado nem republicado.

## 2026-09-10 19:03 BRT — slot 9 e cartões tipográficos da série
- Run 34534761003 falhou em Publish feed and story; slot 9 não consumido. Base origin/main fe4ec9f8, worktree photo-fix, branch fix/photo-quality-20260910.
- Causa: guarda nova aceitava cartão interno sem foto somente com researchSource; série autoral usa typographicOnly=true. Renderer agora respeita essa marcação apenas após a capa. Mantidas guardas de capa, fotos distintas e colisão; nenhum layout alterado.
- Classificação do vigia agora distingue falhas de fotografia de erros de texto.
- Sintaxe, validate-copy (75 seleções), validate-visual-agent, validate-follower-growth e diff passaram. Render automático local do slot 9 selecionou episódio 4 e concluiu cinco slides, Reel e Story; slide 2 e Story inspecionados sem colisão. Evidência: runs/cliente-x/2026-09-10-190126-slot-9-render-only.
- Publicação real e encerramento do alerta ainda pendentes; acompanhar recuperação automática após envio.

### Recuperação comprovada — 10/09/2026 19:07 BRT
- Correção 42030e3a em main; gatilho existente por push 5f98b9a8 iniciou run 34535460397, concluído com sucesso. Não foi disparo cron nem workflow_dispatch.
- Episódio 4 publicado às 19:05:53 BRT: Reel 18108358226362779, Story 18106991546034941, https://www.instagram.com/reel/DdH3ju4jD2I/.
- Estado persistido em 1075eea0: slot 9 published e alerta 34534761003 resolved pelo run 34535460397. Primeiro comentário sem ID e sem erro registrado; não confirmado.
- Story real e cinco quadros do Reel hospedado em docs/generated/cliente-x/2026-09-10-190452-slot-9 inspecionados sem sobreposição. Foto de capa preservada e cartões internos tipográficos renderizados. Nenhum post existente excluído ou republicado.

## 2026-09-10 19:22 BRT — imagens próprias por episódio futuro da série
- Pedido autorizado: variar fotografias conforme o tema mantendo layout. Base origin/main 62ce233d, worktree photo-fix, branch fix/photo-quality-20260910.
- Episódios 1-4 confirmados no histórico e preservados. Episódios 5-14 agora têm dez fotografias ilustrativas distintas, geradas com image_gen integrado, em docs/uploads/follower-series; prompts e proveniência em prompts.json.
- Cenas: relatório, base de respostas, propostas, pedidos, onboarding, email, arquivos, pós-venda, procedimentos e avaliação da automação. Capa e Story do mesmo episódio compartilham a imagem temática; interiores tipográficos e layout mantidos.
- validate-follower-growth verifica existência, caminhos e SHA256 distintos das dez imagens, incluindo não reuso da foto antiga. Sintaxe, validate-copy (75 seleções) e diff passaram.
- Dez imagens inspecionadas. Ensaio automático com SLOT_DATE=2026-09-11 selecionou episódio 5 e gerou cinco slides, Reel e Story. Capa e Story inspecionados sem colisão: runs/cliente-x/2026-09-10-191757-slot-9-render-only.
- Alteração preparada para próximas publicações; nenhuma publicação antecipada, exclusão ou republicação. Prova de postagem com a nova foto depende da execução futura do slot 9.
## 2026-09-19 10:28 BRT — Story de Ozempic corrigido e publicado

- Publicação manual autorizada pelo usuário, limitada ao Story corrigido; o feed não foi repetido e nenhum slot automático foi consumido.
- Run `35445792221` concluído com sucesso em `story-only`. Story Meta `18380125852236605`, publicado em `2026-09-19T13:28:19Z`.
- Histórico persistido em `origin/main`: `storyCoverTitle` e `coverTitle` agora registram “IA vasculha 400 mil posts e encontra sintomas inesperados ligados ao Ozempic”; `mediaId` e permalink são nulos porque não houve nova publicação de feed.
- Imagem publicada: `docs/generated/cliente-x/2026-09-19-story-correction-ozempic/story.jpg`. Primeiro comentário não se aplica ao modo Story e não houve erro registrado.
## 2026-09-19 10:42 BRT — prompts educativos reestruturados

- A captura do episódio 11 mostrou que “Sugira um nome...” era uma instrução curta apresentada como prompt; ela não ensinava contexto, limites, formato de saída nem revisão.
- As 16 aulas agora geram prompts completos com papel, contexto e dados, tarefa, três regras explícitas, formato verificável e checagem antes da conclusão. A legenda inclui o prompt copiável e um método de teste em cinco passos.
- O carrossel usa dez cartões: entrada fictícia, cinco partes legíveis do prompt, exemplo de resposta, revisão humana e aplicação. Teste impede prompts com menos de 430 caracteres ou sem qualquer bloco obrigatório.
- Próxima aula inédita: episódio 12, pós-venda. Render `2026-09-19-104202-slot-9-render-only` inspecionado: regras, formato, checagem e Story legíveis, sem sobreposição. Publicações antigas foram preservadas; a melhoria vale para as aulas ainda não publicadas.

## 2026-09-19 10:57 BRT — aula 12 publicada e verificada

- Publicação manual autorizada pelo usuário, em `feed-and-story`, sem marcar o slot automático como publicado.
- Run `35447132492` concluído com sucesso. Carrossel `17986961867870252`, Story `18017622122938743` e permalink https://www.instagram.com/p/DdeKzlaHP1Q/.
- Episódio 12, “O pós-venda depende de alguém lembrar?”, publicado com dez cartões e o prompt completo. O post foi aberto no Instagram e a legenda com papel, contexto, tarefa, regras, formato, checagem e método de teste foi conferida.
- `publication-history.json` persistiu `lessonId: serie-12`, `publishedFormat: CAROUSEL`, os dois IDs e o permalink. `firstCommentId` e `firstCommentError` ficaram nulos; não há comentário confirmado.

## 2026-10-04 — Sabedoria Kids: cadastro e pré-ativação
- Conta confirmada pelo usuário: @sabedoriakidsoficial. Tema: Bíblia para crianças. Frequência: 12 posts/dia.
- Instagram Login do app nerion-IG: INSTAGRAM_APP_ID 1010383948566434; cadastrado na Vercel Production. Callback existente conferido na Meta.
- Grade BRT: 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 18 e 20 horas. Conta continua onboarding até autorização e preflight Meta.
- 36 pautas bíblicas originais com referências e resumos infantis; packs antigos de IA removidos apenas da conta Kids. CuratedOnly bloqueia negócios/IA e fallback genérico quando esgotar a biblioteca.
- Workflow independente instagram-sabedoria-kids.yml, com os secrets próprios do Kids e sem tokens Meta da conta Marcondes.
- Correção de api/schedule: conversão BRT, permissão por conta, gravação no GitHub com SHA e proteção de índices já iniciados.
- OAuth preparado para sincronizar token/ID para Vercel e GitHub Actions usando sealed boxes. Kids solicita somente basic/content_publish.
- Checks: sintaxe, validate-copy (36 packs), validate-kids-onboarding (isolamento/agenda/secrets), render feed e Story. Prévia 2026-10-04-104509-slot-0-render-only inspecionada.
- Pendente: deploy, autorização Meta, teste de conexão, dry-run e liberação da agenda com data inicial. Nenhuma publicação Kids realizada nesta etapa.
- Deploy de produção confirmado READY: dpl_A6f47VxrXZvf7zXshrTMYNdc1ktD, domínio cliente-x-instagram.vercel.app. Commit funcional e6bff43a em main.
- Painel de produção confirmou os 12 horários e o ID do Instagram configurado. Salvamento de agenda executado no novo endpoint.
- Fluxo OAuth alcançou o consentimento na Meta, mas a sessão inicial era @marcondes.machado.oficial; consentimento cancelado para não conectar a conta errada. Troca/login de @sabedoriakidsoficial em andamento.
- Consentimento de publicação da conta Kids ainda não concedido; nenhum token/ID Kids confirmado e nenhuma publicação Kids realizada. Conta continua onboarding.
- GitHub confirmou o workflow Instagram Sabedoria Kids como active, ainda sem execução registrada. Isso não é prova de publicação.
- Login do Sabedoria Kids encontrou reCAPTCHA (“Não sou um robô”). Verificação deixada para o usuário no navegador; autorização Meta Kids permanece pendente. Não houve clique em Permitir.

## 04/10/2026 - Calendario Sabedoria Kids e pesquisa biblica
- Main 27165c16: calendario mensal na Agenda, 12 horarios BRT previstos, publicacoes por conta com IDs reais, navegacao entre meses e detalhes por dia.
- Pesquisa diaria em GitHub Actions as 05:20 BRT: catalogo de 59 temas do Biblia para Criancas. Sugestoes de pesquisa; nao gera/publica textos de terceiros automaticamente.
- Fontes no cadastro: bibleforchildren.org (historias) e bibliaonline.com.br/nvi (conferencia de passagens).
- Pesquisa na nuvem passou: https://github.com/marcondesjm/cliente-x-instagram/actions/runs/37208348759
- Calendario e catalogo verificados no painel de producao da conta sabedoria-kids.
- Conexao ainda pendente: usuario concluiu seguranca, mas a sessao visivel do Instagram continua marcondes.machado.oficial. Solicitada entrada na conta Kids. Nenhuma publicacao Kids confirmada.


## 2026-10-18 10:00 BRT — reposição Kids: critérios, piloto e guia v1.7

- Worktree `cliente-x-instagram-kids-profile-20261017`, branch `fix/kids-illustrated-stock-slot8`; estado remoto atualizado antes das alterações. Pré-existentes: edições do guia HTML, botão do painel, PDF e gerador Python, preservadas e concluídas nesta etapa.
- Critério por cartão agora explica que atividade familiar/leitura usa cena bíblica pertinente, sem encenar desenhar ou ler. A revisão distingue ambiente compartilhado de repetição e mantém bloqueios para ambiguidades e contradições.
- Commits funcionais: `d730fed4`, `c43960e0`, `2e8a1541`, `1a3255b3`. Versão única `card-options-family-context-v4` identifica tanto o cache de rejeição como os pareceres reutilizáveis. Piloto sem candidato elegível encerra com erro explícito.
- Primeiro disparo `39128872463` não avaliou pauta; montagem redundante cancelada. Piloto `39128997063` reprovado; prancha baixada e inspecionada. Piloto final `39129415731`, com critério v4, também reprovado após seleção, revisão e nova seleção (três chamadas). Estado persistido: `pilotRun.status=rejected`, `enabled=false`, `circuit=vision_validation_failed`. Nenhuma seleção nova, montagem ou publicação foi confirmada por estes pilotos.
- A revisão ainda produz descrições/decisões ambíguas; não há evidência suficiente para ativar a reposição recorrente. Próximo passo: validar a precisão visual e semântica em imagens individuais antes de repetir pilotos ou liberar a rotina. Não tratar falta de aprovação como prova de inexistência de imagens adequadas na fonte.
- Passaram: sintaxe do script/API, parser dos scripts do painel, validate-kids-scene-matching, validate-kids-scene-replenishment, validate-kids-scene-assembly, validate-kids-vision-transport e git diff --check. Testes locais são simulados, distintos dos pilotos reais.
- Guia PDF v1.7 de 18/10 gerado e conferido visualmente em uma página; links do guia e do painel atualizados. Painel passa a v6.09. Deploy e conferência do download em produção serão registrados após execução.


### 2026-10-18 10:02 BRT — deploy e download confirmados
- Commit documental/guia: cfe9c891, sincronizado com origin/main. Deploy de produção READY: dpl_HTd6z4YSkzM2e4Gvu6am2a8gMc4X; domínio https://cliente-x-instagram.vercel.app.
- Verificação pública: raiz HTTP 200 com v6.09 e botão PDF v1.7; /docs/conferencia-cenas.html HTTP 200 com versão 1.7 de 18/10; PDF HTTP 200 application/pdf, 1.106.667 bytes, SHA256 idêntico ao arquivo local conferido visualmente.
- Piloto final: https://github.com/marcondesjm/cliente-x-instagram/actions/runs/39129415731 — reprovado, sem nova seleção aprovada. Reposição recorrente continua desativada. Nenhuma publicação nova foi disparada nesta retomada.
- Único resíduo local fora do Git: output/ com prévias e evidências preservadas.
