# Status Atual

Atualizado em: 2026-08-16 13:01 BRT

## Projeto ativo

- Pasta: `cliente-x-instagram-modern`
- Branch: `feature/modern-editorial-system`
- Commit de codigo em producao: `6ca72ab` (`Adiciona novo botao na pagina Bio`).
- Checkpoint completo aprovado pelo usuario: `6ca72ab`.
- Repositorio operacional: `origin/main` contem a trava do Radar e a landing atualizada.
- Dashboard: `https://cliente-x-instagram.vercel.app`
- Landing comercial: `https://cliente-x-instagram.vercel.app/plataforma`
- Commit mais recente da landing em producao: `6496736` (`Anima galeria de produto da landing`).
- Versao visivel atual: `v4.95`

## Estado confirmado

- Workspace limpo no momento deste registro e checkpoint aprovado pelo usuario ("muito bom").
- O dashboard de producao esta confirmado na versao `v4.95`.
- A Pagina Bio permite criar ate `10` botoes. Ha um controle no cabecalho e outro campo destacado abaixo do ultimo cartao; o novo botao recebe icone, titulo, descricao e link, com rolagem e foco automaticos.
- O Radar usa somente fontes oficiais e aceita noticias dos ultimos 7 dias; ele nao usa pack manual nem pack automatico generico como reserva.
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

## Landing comercial em producao

- Nome provisorio: `Nerion Social`; ainda requer validacao formal de marca antes do lancamento definitivo.
- Oferta principal: `R$ 397/mes` para uma marca, com publicacoes diarias conforme o calendario contratado.
- Implantacao de `R$ 297` riscada e apresentada como gratuita.
- Entrega comunicada: criacao automatica de conteudo, criativos, carrossel, Story e legendas; agenda, publicacao na nuvem e Direct.
- Para um volume menor, a pagina oferece consulta de plano menor; licenca personalizada permanece sob medida.
- Promessa central: manter a rede social ativa, cuidada e atualizada sem o cliente criar ou publicar cada conteudo manualmente e sem depender do computador ligado.
- Beneficio comercial: aumentar oportunidades de engajamento e atrair seguidores reais e alinhados, com potencial para comprar produtos ou contratar servicos.
- Limite de comunicacao: nao garantir seguidores, curtidas ou vendas; consistencia e conteudo atual aumentam oportunidades, nao resultados certos.
- Visual: moderno, neutro e responsivo. O hero usa texto e plataforma lado a lado em desktop; as capturas do dashboard/editor e os criativos mantem molduras proporcionais e sem distorcao.
- Animacoes: hero em camadas com perspectiva, brilho, flutuacao e sinais operacionais; editor com `editor-breathe`; Carrossel e Story com `creative-float` alternado; cartoes com revelacao, desfoque e profundidade. Todo o conjunto respeita `prefers-reduced-motion`.
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
- Bump de versao visivel deve atualizar `api/state.js` e `docs/dashboard.html` juntos.
- O projeto moderno e separado do checkout antigo `cliente-x-instagram`; confirmar o repositorio-alvo antes de alterar ou publicar.

## Proximo passo recomendado

- Acompanhar os proximos posts automaticos e conferir se o publico responde melhor ao novo tom humano e consultivo.
- Acompanhar a resposta ao post `DcFh6FWG8f0` e manter a confirmacao por permalink em cada nova publicacao manual.
- Conferir o primeiro post automatico posterior a trava estrita do Radar por permalink e inspecionar visualmente o Story publicado.
- Em uma retomada futura, iniciar deste checkpoint e preservar a versao `v4.95`, o CTA dos 50 prompts, as hashtags finais, a rotacao completa de quatro fotos, a foto de capa proporcional e o Story sem sobreposicao.
- Na Pagina Bio, criar um botao real pelo novo campo, salvar e conferir o resultado na pagina publica.
- Para a landing, preservar a oferta de `R$ 397/mes`, implantacao gratuita, publicacoes diarias conforme o calendario contratado, planos menores sob consulta e a mensagem de seguidores reais com potencial comercial sem garantia de resultado.
- Antes de vender em escala, validar o nome `Nerion Social`, preparar termos/politica de privacidade e definir contrato e onboarding.
