# Status Atual

Atualizado em: 2026-08-16 18:42 BRT

## Regra permanente de checkpoint

- Toda atualizacao concluida deve ser registrada automaticamente em `HISTORICO.md` e refletida em `STATUS_ATUAL.md`.
- O usuario nao precisa pedir novamente para gravar a memoria do projeto.
- O checkpoint deve acompanhar a alteracao no Git e no remoto, quando aplicavel, antes do encerramento da tarefa.

## Projeto ativo

- Pasta: `cliente-x-instagram-modern`
- Branch: `feature/modern-editorial-system`
- Checkpoint funcional atual: `f35b211` (`Reorganiza cadastro de empresas no painel`).
- Radar progressivo, protecao contra capas repetidas e rodizio de fontes fazem parte do estado atual; landing humana e cartao de fonte corrigido permanecem preservados.
- Repositorio operacional: `origin/main` contem a trava do Radar e a landing atualizada.
- Dashboard: `https://cliente-x-instagram.vercel.app`
- Landing comercial: `https://cliente-x-instagram.vercel.app/plataforma`
- Commit mais recente da landing: `b11fae5` (`Adiciona pagina da automacao do Direct na landing`).
- Versao visivel atual: `v4.99`

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

- Entrar no dashboard e aguardar a checkagem automatica terminar; registrar o resultado final e corrigir qualquer item que apareca como `ERRO`.
- Acompanhar os proximos posts automaticos e conferir se o publico responde melhor ao novo tom humano e consultivo.
- Acompanhar a resposta ao post `DcFh6FWG8f0` e manter a confirmacao por permalink em cada nova publicacao manual.
- Conferir o primeiro post automatico posterior a trava estrita do Radar por permalink e inspecionar visualmente o Story publicado.
- Em uma retomada futura, iniciar deste checkpoint e preservar a versao `v4.96`, o CTA dos 50 prompts, as hashtags finais, a rotacao completa de quatro fotos, a foto de capa proporcional e o Story sem sobreposicao.
- Na Pagina Bio, criar um botao real pelo novo campo, salvar e conferir o resultado na pagina publica.
- Para a landing, preservar a promocao de `R$ 397/mes` por `R$ 197/mes`, implantacao gratuita, mais de 12 carrosseis no feed por dia, 12 Stories diarios, planos menores sob consulta e a mensagem de seguidores reais com potencial comercial sem garantia de resultado.
- Para o Direct, acompanhar as proximas entregas das duas automacoes pelo historico; `Quero` e a campanha dos 50 prompts ja possuem envios reais comprovados.
- Antes de vender em escala, validar o nome `Nerion Social`, preparar termos/politica de privacidade e definir contrato e onboarding.
