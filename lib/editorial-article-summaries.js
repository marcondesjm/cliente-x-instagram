// Reviewed adaptations. Indices refer to the ordered paragraphs returned by
// extractArticleFacts. A source digest prevents reuse after the article changes.
export const ARTICLE_SUMMARIES = {
  'https://olhardigital.com.br/2026/10/17/colunistas/quem-responde-quando-um-agente-de-ia-toma-a-decisao-errada/': {
    sourceDigest: '2611e523ed99bd58132b7471d3c23d11bfa393c66f24ce1e86069a035954019a',
    author: 'Alessandra Montini',
    apiSlides: [
      { title: 'A IA agora executa decisões.', body: 'Agentes usam dados e ferramentas; seus erros podem afetar a operação. O artigo cita a IBM: 61% dos CEOs já adotavam agentes ou preparavam expansão. Na McKinsey, o uso em escala nas grandes empresas passou de 27% para 40% dos profissionais ouvidos.', sourceFactIndices: [0, 1, 2, 3, 4] },
      { title: 'Governança precisa acompanhar.', body: 'Na Deloitte citada, só 21% tinham governança madura e 74% esperavam usar agentes até 2027. A autora defende responsabilidade humana: num prejuízo ao negociar, é preciso examinar fornecedor, contratante, implantação, parâmetros e supervisão.', sourceFactIndices: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
      { title: 'Aprovar cada ação não escala.', body: 'O Gartner citado projeta mais de 150 mil agentes por empresa média da Fortune 500 em 2028, frente a menos de 15 em 2025. Só 13% declaravam governança adequada. Milhares de ações exigem controles além da aprovação humana individual.', sourceFactIndices: [17, 18, 19] },
      { title: 'O controle começa na implantação.', body: 'É preciso definir responsáveis pela escolha do modelo, acesso a dados, autonomia, revisão humana, auditoria e tolerância a erros. A coluna cita o AI Act: há obrigações de documentação, monitoramento, rastreabilidade e supervisão em certos sistemas de alto risco, distribuídas pela cadeia.', sourceFactIndices: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29] },
      { title: 'O risco sai da resposta e vira ação.', body: 'Na McKinsey citada, quase dois terços apontam segurança e riscos como barreira; imprecisão preocupa 74% e cibersegurança, 72%. Uma falha pode alterar cadastros, expor dados, cancelar operações ou executar transações: também é preciso controlar a execução.', sourceFactIndices: [30, 31, 32, 33] },
      { title: 'Defina a autonomia por tarefa.', body: 'Responder dúvidas pode ser automático, enquanto descontos, contratos e contratação podem exigir aprovação. A empresa deve escolher essa fronteira pelo risco: o fato de um sistema conseguir executar algo não lhe concede autorização.', sourceFactIndices: [34, 35, 36, 37] },
      { title: 'Gestores também liderarão agentes.', body: 'Acompanhar desempenho, revisar decisões, perceber desvios e retirar autonomia passam a fazer parte da gestão. É necessário mapear quais agentes existem, seus acessos, decisões permitidas e formas de auditoria.', sourceFactIndices: [38, 39, 40] },
      { title: 'Cada agente precisa de um responsável.', body: 'A conclusão atribui a alguém a responsabilidade pelas regras, limites e resultados do agente. Isso exige prestação de contas, mesmo quando ninguém acompanha cada ação em tempo real.', sourceFactIndices: [41] }
    ],
    slides: [
      { title: 'O risco agora inclui agir.', body: 'Agentes acessam dados, usam ferramentas e executam decisões. Uma falha pode sair da conversa e afetar a operação.', sourceFactIndices: [0, 1, 2] },
      { title: 'A adoção está acelerando.', body: 'O artigo cita a IBM: 61% dos CEOs consultados já adotavam agentes ou preparavam sua expansão.', sourceFactIndices: [3] },
      { title: 'O uso em escala também cresce.', body: 'No levantamento da McKinsey citado, a expansão em grandes empresas passou de 27% para 40% dos profissionais ouvidos.', sourceFactIndices: [4] },
      { title: 'Os controles ficam para trás.', body: 'Segundo a Deloitte citada, só 21% tinham governança madura; 74% esperavam usar agentes ao menos moderadamente até 2027.', sourceFactIndices: [5] },
      { title: 'A responsabilidade continua humana.', body: 'A autora rejeita atribuir a culpa à máquina. Dar mais autonomia exige definir com clareza quem responde pelas consequências.', sourceFactIndices: [6, 7, 8] },
      { title: 'Quem responde por uma negociação?', body: 'Se um agente causa prejuízo ao negociar, entram em discussão fornecedor, contratante, executivo, definição de regras e supervisão.', sourceFactIndices: [9, 10, 11, 12, 13, 14, 15, 16] },
      { title: 'A escala exige outro controle.', body: 'A projeção do Gartner citada supera 150 mil agentes por empresa média da Fortune 500 em 2028; apenas 13% declaravam governança adequada.', sourceFactIndices: [17] },
      { title: 'Aprovar tudo não resolve.', body: 'Com milhares de ações simultâneas, a autora propõe controles que funcionem em escala, sem exigir aprovação individual de cada tarefa.', sourceFactIndices: [18, 19] },
      { title: 'As escolhas anteriores importam.', body: 'Modelo, acesso a dados, autonomia, auditoria, revisão humana e tolerância a erros precisam ter responsáveis desde a implantação.', sourceFactIndices: [20, 21, 22, 23, 24, 25, 26, 27] },
      { title: 'Há deveres em toda a cadeia.', body: 'A coluna cita o AI Act: certos sistemas de alto risco exigem documentação, monitoramento, rastreabilidade e supervisão humana.', sourceFactIndices: [28, 29] },
      { title: 'Segurança freia a expansão.', body: 'Na McKinsey citada, quase dois terços apontam segurança e riscos como barreira; imprecisão preocupa 74% e cibersegurança, 72%.', sourceFactIndices: [30] },
      { title: 'Uma falha pode virar uma ação.', body: 'Erros podem alterar cadastros, cancelar operações, expor dados ou mover transações. É preciso controlar também o que o agente executa.', sourceFactIndices: [31, 32, 33] },
      { title: 'A autonomia depende da tarefa.', body: 'Responder dúvidas pode ser automático. Descontos, contratos e contratação podem exigir aprovação, conforme o risco definido pela empresa.', sourceFactIndices: [34, 35, 36] },
      { title: 'Capacidade não concede permissão.', body: 'A organização precisa escolher os limites. Conseguir executar uma tarefa não basta para autorizar o agente a realizá-la.', sourceFactIndices: [37] },
      { title: 'Gestores também liderarão agentes.', body: 'Será preciso acompanhar desempenho, revisar decisões, detectar desvios e retirar autonomia quando os resultados pedirem intervenção.', sourceFactIndices: [38, 39] },
      { title: 'Cada agente precisa de um responsável.', body: 'A conclusão pede um mapa de agentes, acessos e decisões, com alguém responsável por suas regras, limites, resultados e auditoria.', sourceFactIndices: [40, 41] }
    ]
  }
};
