# Aprendizado educativo v6.06 — 12/09/2026

O seletor agora escolhe entre aulas inéditas por tema (atendimento, vendas e operação), depois das travas de duplicidade. A decisão, motivo, amostra, alcance e versão acompanham o metadado education no histórico de publicação e nas próximas coletas.

Somente tutoriais desta estratégia em FEED entram na comparação: observação real de 24–36 horas, dados atualizados há no máximo 72 horas, publicação nos últimos 42 dias, alcance mínimo de 20 e salvamentos, compartilhamentos e comentários conhecidos. Ausência não vira zero. IDs e aulas repetidas não aumentam a amostra.

A preferência começa com seis aulas distintas, três por tema em pelo menos dois temas, alcance total de 180 e três interações positivas. Pontuação por tema: min(4, 20 * (2 * salvamentos + 2 * compartilhamentos + comentários) / (alcance + 100)). São heurísticas internas, não parâmetros do Instagram nem evidência causal. Datas com hash módulo 5 igual a zero reservam aproximadamente 20% das oportunidades para exploração determinística; novas tentativas na mesma data reproduzem a escolha para o mesmo estado.

Sem evidência suficiente, mantém a ordem editorial. Oferta não aprende conversão a partir de curtidas. Notícias antigas, Reels e os 0,05% do relatório externo não são misturados à amostra de tutoriais. O painel informa o motivo e cobertura do aprendizado. A biblioteca continua finita: é necessário acrescentar aulas revisadas quando esgotada.

Validação local: testes de janela real, atualidade, nulos e zeros, duplicidade de ID/aula, tamanho mínimo, preferência por utilidade, exploração reproduzível e preservação das travas. Dados atuais: zero tutoriais elegíveis; nenhum ganho de engajamento comprovado. Agenda mantida para início em 13/09 às 16h BRT.
