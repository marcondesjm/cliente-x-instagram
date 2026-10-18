# Reserva preventiva Sabedoria Kids

Meta operacional: doze conteúdos inéditos aprovados, com todos os cartões ilustrados, Story distinto, licença e revisão. Contam apenas pautas sem publicação no histórico. Uma seleção de cenas aguardando montagem não é estoque pronto.

A checagem de reposição ocorre a cada vinte minutos. Ao completar a reserva, o script encerra antes de calibração e chamadas pagas. Seleções já revisadas e recentes aguardam montagem sem gerar novas avaliações para preencher a mesma falta. O lote respeita a falta restante e o máximo de três pautas por execução. O planner evita instalar dependências sem saldo mínimo e só abre a montagem quando há seleção inédita pendente ou integridade a conferir.

Economia: a leitura cega de uma imagem é reutilizável por até vinte e quatro horas quando arquivo, identidade, modelo, versão e instrução coincidem. Novos registros também vinculam o recibo da chamada original ao hash da imagem analisada. Esse cache não substitui a revisão da passagem, a segunda avaliação dos pixels, a conferência factual ou o render.

Uma rejeição editorial não é reavaliada automaticamente com o mesmo fingerprint de texto, passagem, conjunto, licença e versão da revisão. Mudanças de data de consulta não são material novo. Falta de orçamento é temporária e aguarda a virada do dia em Brasília. Respostas incompletas têm uma correção de formato limitada; rejeição editorial completa não dispara essa correção. A revisão direcionada explícita mantém orçamento e validações.

Os conjuntos são priorizados pela cobertura declarada da passagem antes da quantidade de cenas. Metadados nunca aprovam uma imagem. O tamanho do conjunto de novas leituras considera chamadas e tokens ainda disponíveis, preservando saldo para seleção e revisões posteriores. Se não houver saldo para um conjunto completo, nenhuma leitura parcial daquele conjunto começa.

O Controle do Claude mostra o saldo apurado e contagens de leituras reaproveitadas, novas leituras confirmadas e candidatos inalterados ignorados. Meta configurada não significa meta atingida. Quando não houver material novo elegível ou orçamento, a rotina aguarda sem liberar conteúdo rejeitado.

## Limite do Gateway

O modo `policy.quotaMode=provider` só é elegível para Claude Gateway com plano fixo confirmado. Nesse modo, a plataforma registra chamadas e estimativas, mas não bloqueia pelo número de chamadas ou teto diário interno de tokens. O Gateway continua aplicando os limites reais do plano. Não há sincronização automática do saldo do provedor.

Falhas, respostas incompletas, consumo por chamada acima do limite técnico, chamada sem recibo e revisão editorial continuam bloqueantes. Os limites por execução, pilotos diagnósticos e meta de estoque permanecem ativos. O administrador pode voltar ao modo interno no Controle do Claude; os limites numéricos ficam preservados como alternativa.

Verificações: `validate-kids-reserve-policy.mjs`, `validate-kids-stock-summary.mjs`, `validate-kids-scene-replenishment.mjs`, `validate-kids-scene-matching.mjs` e `validate-kids-scene-assembly.mjs`.
