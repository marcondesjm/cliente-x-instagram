# Status Atual

Atualizado em: 2026-08-16 00:40 BRT

## Projeto ativo

- Pasta: `cliente-x-instagram-modern`
- Branch: `feature/modern-editorial-system`
- Commit de codigo em producao: `55fe44b` (`Use distinct avatar scenes on radar covers`)
- Repositorio operacional: `origin/main` = `55fe44b`
- Dashboard: `https://cliente-x-instagram.vercel.app`
- Versao visivel atual: `v4.87`

## Estado confirmado

- Workspace limpo no momento deste registro.
- O dashboard de producao esta confirmado na versao `v4.87`.
- O Radar usa somente fontes oficiais e aceita noticias dos ultimos 7 dias; ele nao usa o pack manual como reserva para `Publicar agora`.
- Se nao houver noticia oficial elegivel, o publicador bloqueia o envio em vez de publicar conteudo generico.
- A automacao agendada roda na nuvem por GitHub Actions e Meta/Instagram; o computador do usuario pode ficar desligado. O login do painel e necessario somente para acoes manuais no dashboard e expira em 12 horas.
- As capas do Radar variam pela pauta: cor, composicao, titulo e foto agora usam a fonte/tema como semente visual.
- As tres fotos com notebook e fundo escuro, muito semelhantes entre si, foram retiradas da rotacao. Permanecem apenas cenarios distintos: escritorio, reuniao, apresentacao e ambiente descontraido.

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
- Inspecao visual do render confirmou o novo gancho humano, a hierarquia legivel e capas com cenarios visivelmente diferentes.

## Publicacao real mais recente confirmada

- Conta: `@marcondes.machado.oficial`.
- GitHub Actions: run `31923469806`, concluido com `success` em 2026-08-16 00:08 BRT.
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
- Antes de uma nova publicacao manual, usar o dashboard na `v4.87` e confirmar o permalink final.
