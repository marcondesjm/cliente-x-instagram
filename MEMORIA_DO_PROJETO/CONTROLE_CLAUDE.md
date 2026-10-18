# Controle do Claude na plataforma

O administrador principal encontra **Controle do Claude** na área de sistema do painel, junto da manutenção. O painel usa a integração Claude já existente nos workflows; não cria uma segunda credencial no navegador.

## Controles disponíveis

- Modelo configurado e data da última resposta confirmada. A data não é um teste atual de conexão.
- Consumo diário em Brasília, saldo de chamadas e tokens de entrada contabilizados. Quando o recibo não informa a contagem completa, o sistema reserva o máximo por chamada. Esses números não representam uma fatura nem um saldo de créditos do provedor.
- Limite diário normal e limite total temporário para o dia atual. O extra expira à meia-noite de Brasília; o teto de tokens acompanha o número autorizado de chamadas.
- Pausar e retomar a reposição. Pausar não cancela uma tarefa já iniciada.
- Repor conteúdo autoral do Cliente X e recuperar um horário pendente com publicação de Feed/Reel e Story, somente após aprovação.
- Repor cenas do Sabedoria Kids e montar as prévias; a agenda continua responsável pela publicação.
- Executar auditoria editorial das contas cadastradas ou calibração visual Kids, sem publicação nessas ações. Ambas podem consumir chamadas.
- Histórico de chamadas, estoque, últimas execuções, links para logs e gerenciamento da credencial no GitHub.

O formulário exige salvar as configurações antes de executar. O sistema rejeita limites abaixo do consumo registrado e alterações concorrentes. Não zera recibos, não remove circuitos de proteção e não força aprovação.

## Implementação

- `docs/claude-control.js`: cartão responsivo carregado pelo dashboard.
- `api/state.js?claudeControl=1`: rota autenticada, reutilizando a função existente.
- `lib/claude-api.js`: leitura e gravação no GitHub, autorização owner, verificação de origem, despacho de workflows.
- `lib/claude-control.js`: projeção pública, validação dos controles e orçamento.
- Alterações de orçamento e pausa são gravadas atomicamente na configuração, junto de `claude-control-last-change.json` com autor e horário. Um conflito na branch retorna HTTP 409, sem sobrescrever outro processo.
- `GITHUB_TOKEN` ou `GITHUB_PAT` no servidor deve permitir Contents e Actions no repositório. A chave Claude permanece no GitHub Secret `KIDS_VISION_ANTHROPIC_API_KEY`, usada somente pelo workflow. Não é retornada pelo endpoint nem enviada ao navegador.

## Validação

`node scripts/validate-claude-control.mjs` verifica autorização, origem, expiração em Brasília, estimativa de tokens, aplicação real das cotas, gravação atômica e conflitos. `node scripts/preview-claude-control.mjs` testa interface desktop/celular e formulário com API simulada, sem chamadas pagas ou publicação.

As configurações não alteram automaticamente o modelo, a chave, os critérios editoriais ou os horários de publicação. A execução segue os limites e as revisões independentes já existentes.
