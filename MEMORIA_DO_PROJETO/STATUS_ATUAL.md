# Status Atual

Atualizado em: 2026-08-15 22:30 BRT

## Projeto ativo

- Pasta: `cliente-x-instagram-modern`
- Branch: `feature/modern-editorial-system`
- Commit atual: `b855f93` (`Focus radar posts on business automation leads`)
- Dashboard: `docs/dashboard.html`
- Versao visivel atual: `v4.74`

## Estado do workspace

- Workspace de codigo limpo antes deste registro; esta atualizacao altera somente os arquivos de memoria.
- O projeto moderno esta em uma linha separada do `cliente-x-instagram` original.
- A versao `v4.74` esta validada e confirmada em producao.
- A publicacao real foi executada pelo fluxo operacional do repositorio irmao `cliente-x-instagram`, na branch `main`, commit `9449559`.

## Validacoes executadas

Comandos rodados em `cliente-x-instagram-modern`:

```powershell
node --check api\upload-image.js
npm run validate-copy
```

Resultado:

- `node --check api\upload-image.js`: passou.
- `validate-copy`: passou.
- Conta: `cliente-x`.

Validacao de operacao confirmada:

- GitHub Actions run `#713` concluiu com `success` em 2026-08-15 22:16 BRT.
- O feed do Instagram confirmou o carrossel publicado em `https://www.instagram.com/p/DcFQxaXICT-/`.
- Conta: `@marcondes.machado.oficial`.
- Pauta: noticia da OpenAI sobre modo ultrarrapido para fluxos de baixa latencia, com fonte oficial na legenda.
- Formato enviado: feed + story, carrossel de 5 slides.

## Correcao visual em andamento

- Quando o slide recebe uma foto real de contexto, o icone decorativo do nicho deixa de ser renderizado por cima dela.
- A mesma regra foi aplicada no gerador que publica e na pre-visualizacao do dashboard.
- Isso evita duplicar elementos visuais, como a foto de uma balanca acompanhada de outro icone de balanca.

## Direcionamento editorial do Radar

- Objetivo da conta `cliente-x`: `Captação de leads`.
- Fontes oficiais continuam sendo usadas para dar contexto e credibilidade, mas nao sao mais a abertura do post.
- Os proximos carrosseis abrem com uma dor de empresa (atendimento sem contexto, lead sem acompanhamento, processo manual, dados espalhados ou falta de controle).
- Cada pauta mostra impacto operacional, aplicacao de automacao e convite para diagnostico/contato no Direct.

## Proximos pontos provaveis

- Monitorar a entrega do story e o engajamento do carrossel publicado.
- Conferir a regra nos proximos renders automaticos.
- Acompanhar se os proximos posts atraem conversas de empresas interessadas em automacao.
- Conferir os proximos horarios automaticos para evitar repeticao de pauta ja publicada.
- Para alteracoes de codigo, identificar primeiro se o alvo e `cliente-x-instagram-modern` ou o fluxo operacional `cliente-x-instagram`.

## Cuidados importantes

- Preservar os 13 horarios de postagem.
- Nao tratar dry-run ou apenas um run verde como prova de post real; neste checkpoint ha permalink visivel no Instagram.
- O upload de imagens do painel tenta ImgBB primeiro; se o ImgBB retornar limite, o endpoint salva em `docs/uploads/dashboard/` via GitHub e devolve uma URL publica `raw.githubusercontent.com` para uso imediato.
- Para prova de publicacao real, exigir conta, permalink, horario e etapa exata.
- Bump de versao visivel deve atualizar `api/state.js` e `docs/dashboard.html` juntos quando houver mudanca aprovada para commit/deploy.
