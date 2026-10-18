# Aprendizado editorial contínuo

Na conta Cliente X, a coleta existente consulta métricas da Meta a cada duas horas. O algoritmo de seleção continua atualizando pesos com confiança, diversidade e decaimento temporal. A criação autoral pelo Claude agora recebe também um resumo atualizado desses resultados a cada execução de reposição.

O resumo contém até dezesseis publicações recentes da própria conta, deduplicadas, com observações de vinte e quatro horas coletadas entre vinte e quatro e trinta e duas horas após a publicação. Formatos são identificados para evitar comparações indevidas. Métricas ausentes permanecem nulas. Dados com mais de cinco horas não são usados como tendências atuais.

O Claude pode adaptar abertura, clareza, utilidade e proposta de exercício dentro do briefing aprovado. Recebe orientação para testar uma mudança editorial por pauta. Resultados fracos ou amostras pequenas são hipóteses, sem atribuição causal. O sistema não treina os pesos internos do modelo Claude nem modifica autonomamente código, permissões ou limites financeiros. Não controla o algoritmo do Instagram.

Cada nova entrada da reserva registra versão do contexto, data da coleta, confiança, IDs das publicações consultadas e impressão digital dos dados. O recibo da geração fica vinculado à entrada. Revisão factual, visual, novidade e agenda continuam obrigatórias. Conteúdo já aprovado não é refeito automaticamente por esta mudança.

Validação: `node scripts/validate-claude-learning.mjs`. O teste também roda no workflow de reposição antes das chamadas pagas.
