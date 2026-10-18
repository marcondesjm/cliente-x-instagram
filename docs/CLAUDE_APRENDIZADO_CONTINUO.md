# Aprendizado editorial contínuo

Na conta Cliente X, a coleta existente consulta métricas da Meta a cada duas horas. O algoritmo de seleção continua atualizando pesos com confiança, diversidade e decaimento temporal. A criação autoral pelo Claude agora recebe também um resumo atualizado desses resultados a cada execução de reposição.

O resumo contém até dezesseis publicações recentes da própria conta, deduplicadas, com observações de vinte e quatro horas coletadas entre vinte e quatro e trinta e duas horas após a publicação. Formatos são identificados para evitar comparações indevidas. Métricas ausentes permanecem nulas. Dados com mais de cinco horas não são usados como tendências atuais.

O Claude pode adaptar abertura, clareza, utilidade e proposta de exercício dentro do briefing aprovado. Recebe orientação para testar uma mudança editorial por pauta. Resultados fracos ou amostras pequenas são hipóteses, sem atribuição causal. O sistema não treina os pesos internos do modelo Claude nem modifica autonomamente código, permissões ou limites financeiros. Não controla o algoritmo do Instagram.

Cada nova entrada da reserva registra versão do contexto, data da coleta, confiança, IDs das publicações consultadas e impressão digital dos dados. O recibo da geração fica vinculado à entrada. Revisão factual, visual, novidade e agenda continuam obrigatórias. Conteúdo já aprovado não é refeito automaticamente por esta mudança.

Validação: `node scripts/validate-claude-learning.mjs`. O teste também roda no workflow de reposição antes das chamadas pagas.

## Diagnóstico e experimentos editoriais

O workflow `claude-learning-review.yml` consulta o resumo medido após coletas e por agendamento. Há no máximo uma tentativa de análise a cada seis horas, inclusive se a resposta for rejeitada; ela compartilha o orçamento existente e o mutex das demais chamadas Claude. O comando `--analyze-only` nunca gera nem publica posts. Dados antigos ou menos de seis exemplos impedem a chamada.

O Claude retorna diagnóstico, limitações e uma hipótese sobre abertura, convite ou paleta. A aplicação valida eixo, variante, formato, métrica e referências a exemplos reais, com mesma janela e métricas disponíveis. A hipótese expira após um dia. Novas pautas recebem atribuição aleatória entre padrão e variante, registrada antes da revisão. Variantes passam também por conferência independente de aplicação. Reparos em conteúdo aprovado preservam a atribuição original.

Identificadores e grupos acompanham a publicação no histórico e na coleta de desempenho. O painel compara grupos do mesmo formato na janela de vinte e quatro horas, com ações por cem de alcance somado e contagem de posts. Não são pessoas únicas. Ausência de métrica permanece indisponível, não zero. Comparações são exploratórias: não promovem vencedores nem demonstram causalidade; horário, tema e distribuição também variam. As análises seguintes recebem o resumo dessas comparações.

O administrador pode solicitar análise no Controle do Claude. A ação respeita o intervalo, limites, pausa, circuito e execuções já ativas. Relatório só aparece como existente quando há resposta validada. Confiança do seletor e hipótese do Claude são apresentadas separadamente. Nenhuma mudança no algoritmo proprietário do Instagram é possível por esta integração.

Validação adicional: `node scripts/validate-claude-strategy.mjs`, incluindo execução da função de renderização do painel e troca de conta.
