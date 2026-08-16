# Status Atual

Atualizado em: 2026-08-16 01:11 BRT

## Projeto ativo

- Pasta: `cliente-x-instagram-modern`
- Branch: `feature/modern-editorial-system`
- Commit de codigo em producao: `aa4b8d0` (`Padroniza fonte legivel dos cartoes`)
- Checkpoint completo aprovado pelo usuario: `aa4b8d0` (`Padroniza fonte legivel dos cartoes`)
- Repositorio operacional: `origin/main` = `aa4b8d0`
- Dashboard: `https://cliente-x-instagram.vercel.app`
- Versao visivel atual: `v4.90`

## Estado confirmado

- Workspace limpo no momento deste registro e checkpoint aprovado pelo usuario ("muito bom").
- O dashboard de producao esta confirmado na versao `v4.90`.
- O Radar usa somente fontes oficiais e aceita noticias dos ultimos 7 dias; ele nao usa o pack manual como reserva para `Publicar agora`.
- Se nao houver noticia oficial elegivel, o publicador bloqueia o envio em vez de publicar conteudo generico.
- A automacao agendada roda na nuvem por GitHub Actions e Meta/Instagram; o computador do usuario pode ficar desligado. O login do painel e necessario somente para acoes manuais no dashboard e expira em 12 horas.
- As capas do Radar variam pela pauta: cor, composicao, titulo e foto agora usam a fonte/tema como semente visual.
- As tres fotos com notebook e fundo escuro, muito semelhantes entre si, foram retiradas da rotacao. Permanecem apenas cenarios distintos: escritorio, reuniao, apresentacao e ambiente descontraido.
- Legendas do Radar agora sempre recebem hashtags no final, inclusive quando a fonte oficial nao as fornece.
- Cartoes de texto de apoio usam fonte padrao legivel e altura proporcional ao conteudo: textos longos aumentam o cartao, sem reduzir a fonte. No layout dividido, o cartao de abertura sobe de forma segura para nao cobrir o indicador “Arraste para ver”.

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
node --check lib/editorial-research.js
npm run validate-copy
npm run render-only
```

Resultado:

- Verificacao de sintaxe: passou.
- `validate-copy`: passou (`20` packs, `54` packs automaticos e `74` selecoes automaticas verificadas).
- `render-only`: passou; Radar encontrou `13` temas recentes em fontes oficiais.
- Inspecao visual do render confirmou o novo gancho humano, a hierarquia legivel, capas com cenarios visivelmente diferentes e cartoes de apoio maiores.

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
- Em uma retomada futura, iniciar deste checkpoint e preservar a versao `v4.90`, o CTA dos 50 prompts, as hashtags finais, a variacao de capas e o padrao editorial humano/AIDA.
