import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const QUEUE_PATH = join(ROOT, 'automation', 'instagram-template', 'config', 'scheduled-posts.json');
const CAMPAIGN_PREFIX = 'livro-claude-code-20260902';
const BOOK_TITLE = 'Como Ser Gestor do Claude Code';
const BOOK_AUTHOR = 'Marcondes Jorge Machado';
const BOOK_VISUALS = [
  'docs/uploads/book-claude-leadership.png',
  'docs/uploads/book-claude-workflow.png',
  'docs/uploads/book-claude-briefing.png',
  'docs/uploads/book-claude-security.png',
  'docs/uploads/book-claude-saas.png',
  'docs/uploads/book-claude-systems.png',
  'docs/uploads/book-claude-consulting.png'
];
const BOOK_IMAGE_LAYOUTS = ['book-hero', 'book-split', 'book-editorial'];

const topics = [
  {
    page: 3,
    chapter: 'Prefácio',
    cover: 'A IA ficou mais rápida. A gestão ficou mais importante.',
    excerpt: 'Quanto mais poderosa é a ferramenta, maior é a importância de orientar, revisar e organizar.',
    lesson: 'Velocidade sem direção aumenta retrabalho. A liderança humana transforma produção de IA em resultado.',
    action: 'Antes de executar, defina objetivo, responsável, critério de aceite e forma de validação.'
  },
  {
    page: 6,
    chapter: 'Introdução',
    cover: 'Usar IA de forma improvisada custa caro.',
    excerpt: 'Perguntas soltas, código sem teste e textos sem revisão geram risco, retrabalho e frustração.',
    lesson: 'A primeira resposta não é uma entrega. Todo conteúdo ou sistema precisa passar por revisão.',
    action: 'Crie uma etapa obrigatória de teste antes de publicar, enviar ou colocar uma automação no ar.'
  },
  {
    page: 7,
    chapter: 'Capítulo 1',
    cover: 'O gestor de IA não substitui especialistas. Ele coordena.',
    excerpt: 'O Gestor do Claude Code acelera a execução sem abrir mão de estratégia, revisão humana e qualidade.',
    lesson: 'O valor está em conectar negócio, tecnologia, design, desenvolvimento e validação.',
    action: 'Transforme cada demanda vaga em escopo, etapas, responsáveis e evidências de conclusão.'
  },
  {
    page: 8,
    chapter: 'Capítulo 1',
    cover: 'Oito competências para liderar projetos com IA.',
    excerpt: 'Criar escopo, transformar ideias em requisitos, orientar ferramentas, testar e documentar decisões.',
    lesson: 'Gerenciar IA exige muito mais do que saber escrever um comando bonito.',
    action: 'Escolha uma dessas competências e pratique em um projeto pequeno nesta semana.'
  },
  {
    page: 9,
    chapter: 'Capítulo 2',
    cover: 'Pare de consumir respostas. Comece a arquitetar resultados.',
    excerpt: 'Um arquiteto de resultados define objetivo, restrições, etapas de controle e como saberá que deu certo.',
    lesson: 'A clareza da intenção determina a qualidade do trabalho produzido com inteligência artificial.',
    action: 'Troque a pergunta “como faço?” por “qual resultado preciso comprovar?”.'
  },
  {
    page: 10,
    chapter: 'Capítulo 2',
    cover: 'Problema antes da ferramenta.',
    excerpt: 'Não comece escolhendo tecnologia. Comece entendendo a dor.',
    lesson: 'Muitas empresas não precisam de um sistema complexo, mas de um fluxo simples e confiável.',
    action: 'Mapeie onde existe atraso, repetição ou perda de informação antes de escolher uma plataforma.'
  },
  {
    page: 10,
    chapter: 'Capítulo 2',
    cover: 'Pequeno antes de grande.',
    excerpt: 'Um MVP simples, testável e útil vale mais do que uma plataforma enorme que nunca fica pronta.',
    lesson: 'Projetos menores produzem aprendizado real e reduzem o custo de corrigir uma direção errada.',
    action: 'Escolha uma única dor, uma única entrega e uma métrica para a primeira versão.'
  },
  {
    page: 10,
    chapter: 'Capítulo 2',
    cover: 'Revisão antes da publicação.',
    excerpt: 'Nada deve ser entregue apenas porque a IA gerou.',
    lesson: 'Texto, código, layout, links, regras e dados precisam ser conferidos por uma pessoa responsável.',
    action: 'Adote um checklist curto e registre quem aprovou a entrega final.'
  },
  {
    page: 10,
    chapter: 'Capítulo 2',
    cover: 'Documentação antes da memória.',
    excerpt: 'Registre decisões, versões, processos, critérios de aceite e pendências.',
    lesson: 'Conversas desaparecem. Documentação permite continuidade, auditoria e recuperação do projeto.',
    action: 'Termine cada trabalho com um histórico do que mudou e qual é o próximo passo.'
  },
  {
    page: 11,
    chapter: 'Capítulo 3',
    cover: 'Você não precisa dominar tudo. Precisa compreender o fluxo.',
    excerpt: 'Lógica é a capacidade de organizar passos e enxergar a sequência de uma operação.',
    lesson: 'Quando o gestor entende entradas, decisões e saídas, consegue orientar melhor pessoas e ferramentas.',
    action: 'Desenhe o processo atual usando caixas e setas antes de pedir qualquer automação.'
  },
  {
    page: 12,
    chapter: 'Capítulo 3',
    cover: 'Ambiente local não é ambiente publicado.',
    excerpt: 'Todo projeto precisa rodar em algum lugar, e o gestor deve entender onde está cada versão.',
    lesson: 'Funcionar durante o desenvolvimento não comprova que clientes conseguem usar a solução publicada.',
    action: 'Valide o endereço público, a versão ativa e o comportamento real depois do deploy.'
  },
  {
    page: 13,
    chapter: 'Capítulo 4',
    cover: 'Prompt profissional não é frase solta.',
    excerpt: 'No trabalho profissional, prompt é especificação.',
    lesson: 'Contexto, público, objetivo, formato, limites e critérios tornam a instrução verificável.',
    action: 'Escreva o pedido como um briefing que outra pessoa também conseguiria executar.'
  },
  {
    page: 14,
    chapter: 'Capítulo 4',
    cover: 'Sete elementos de um prompt profissional.',
    excerpt: 'Contexto, público, formato, restrições, exemplos, critérios de qualidade e pedido de revisão.',
    lesson: 'Uma boa estrutura reduz respostas genéricas e aproxima a primeira entrega do resultado esperado.',
    action: 'Salve esta lista e confira os sete itens antes de enviar seu próximo prompt.'
  },
  {
    page: 15,
    chapter: 'Capítulo 5',
    cover: '“Quero um sistema” ainda não é um requisito.',
    excerpt: 'Uma ideia vaga é uma intenção. O trabalho do gestor é transformá-la em especificação.',
    lesson: 'Requisitos esclarecem usuário, tarefa, dados, regras, integrações e resultado esperado.',
    action: 'Pergunte quem usará, o que fará e como será possível confirmar que funcionou.'
  },
  {
    page: 16,
    chapter: 'Capítulo 5',
    cover: 'O documento simples que evita um projeto confuso.',
    excerpt: 'Objetivo, público, problema, funcionalidades, telas, dados, integrações e regras de negócio.',
    lesson: 'Um escopo claro protege prazo, orçamento e expectativas de quem compra e de quem executa.',
    action: 'Defina também o que ficará para uma versão futura.'
  },
  {
    page: 17,
    chapter: 'Capítulo 6',
    cover: 'Projetos com IA são rápidos, mas não podem ser caóticos.',
    excerpt: 'A velocidade aumenta a necessidade de controle.',
    lesson: 'Diagnóstico, escopo, planejamento, execução, revisão, teste e entrega formam um fluxo seguro.',
    action: 'Não pule a revisão só porque a primeira versão apareceu em poucos minutos.'
  },
  {
    page: 18,
    chapter: 'Capítulo 6',
    cover: 'Sem critério de aceite, ninguém sabe se terminou.',
    excerpt: 'Cada tarefa deve ter um critério de aceite.',
    lesson: 'Uma coluna “concluído” só tem valor quando existe uma condição objetiva para entrar nela.',
    action: 'Escreva o resultado observável que comprovará a conclusão de cada tarefa.'
  },
  {
    page: 19,
    chapter: 'Capítulo 7',
    cover: 'Código gerado por IA precisa ser revisado.',
    excerpt: 'A IA pode corrigir um problema e criar outro.',
    lesson: 'Algo que parece funcionar pode esconder falhas, dependências desnecessárias ou dificuldade de manutenção.',
    action: 'Teste o caminho principal, os erros esperados e o impacto sobre funções que já existiam.'
  },
  {
    page: 20,
    chapter: 'Capítulo 7',
    cover: 'Nunca publique uma senha junto com o projeto.',
    excerpt: 'Nunca coloque tokens no frontend nem publique arquivos de configuração com senhas.',
    lesson: 'Segurança começa no tratamento de credenciais, dados recebidos e permissões concedidas.',
    action: 'Procure chaves expostas e dados sensíveis antes de cada envio ou deploy.'
  },
  {
    page: 23,
    chapter: 'Capítulo 9',
    cover: 'Existem quatro caminhos para ganhar dinheiro com IA.',
    excerpt: 'Serviços, consultoria, agência e produtos próprios são modelos possíveis de monetização.',
    lesson: 'A ferramenta é apenas o meio. A oferta precisa resolver uma dor compreensível para o cliente.',
    action: 'Escolha um público, uma dor frequente e uma entrega simples para começar.'
  },
  {
    page: 24,
    chapter: 'Capítulo 9',
    cover: 'Não venda IA. Venda resultado.',
    excerpt: 'A oferta precisa explicar quem compra, qual dor resolve, o que será entregue e em quanto tempo.',
    lesson: 'Clientes entendem redução de atraso, mais organização e melhor atendimento; “IA” sozinha é abstrata.',
    action: 'Reescreva sua oferta começando pela transformação entregue, não pela tecnologia utilizada.'
  }
];

const schedules = [
  ['2026-09-02', ['16:00', '19:00', '22:00']],
  ['2026-09-03', ['08:10', '14:15', '19:00']],
  ['2026-09-04', ['08:10', '14:15', '19:00']],
  ['2026-09-05', ['08:10', '14:15', '19:00']],
  ['2026-09-06', ['08:10', '14:15', '19:00']],
  ['2026-09-07', ['08:10', '14:15', '19:00']],
  ['2026-09-08', ['08:10', '14:15', '19:00']]
];

function buildPack(topic, index) {
  const cta = index % 3 === 0
    ? 'Qual parte da gestão de IA mais desafia você hoje?'
    : index % 3 === 1
      ? 'Salve este conteúdo para aplicar no seu próximo projeto.'
      : 'Envie este conteúdo para alguém que está começando a trabalhar com IA.';
  return {
    visualDirection: 'impact-carousel',
    authoredBook: {
      title: BOOK_TITLE,
      author: BOOK_AUTHOR,
      chapter: topic.chapter,
      page: topic.page
    },
    slides: [
      {
        eyebrow: 'Trecho do livro',
        title: topic.cover,
        body: `${BOOK_TITLE}, ${topic.chapter}, página ${topic.page}.`,
        imagePath: BOOK_VISUALS[index % BOOK_VISUALS.length],
        imageLayout: BOOK_IMAGE_LAYOUTS[index % BOOK_IMAGE_LAYOUTS.length],
        preserveEngagementCopy: true
      },
      { eyebrow: 'Nas palavras do autor', title: `“${topic.excerpt}”`, body: 'Trecho selecionado da obra.', preserveEngagementCopy: true },
      { eyebrow: 'O que isso significa', title: 'A ideia precisa sair do papel.', body: topic.lesson, preserveEngagementCopy: true },
      { eyebrow: 'Aplicação prática', title: 'Leve o conceito para o próximo projeto.', body: topic.action, preserveEngagementCopy: true },
      { eyebrow: 'Livro completo', title: BOOK_TITLE, body: `Comente LIVRO e diga qual tema você quer ver nos próximos posts. Obra de ${BOOK_AUTHOR}.`, preserveEngagementCopy: true }
    ],
    caption: `${topic.cover}\n\n“${topic.excerpt}”\n\n${topic.lesson}\n\nAplicação prática: ${topic.action}\n\nEste é um trecho de ${BOOK_TITLE}, de ${BOOK_AUTHOR}. A obra completa reúne fundamentos, prompts, checklists, estudos de caso, ideias de negócios e um plano de execução para liderar projetos com inteligência artificial.\n\n${cta}\n\nComente LIVRO e diga qual assunto você quer acompanhar nesta série.\n\n#ClaudeCode #InteligenciaArtificial #AgentesDeIA #GestaoDeProjetos #Automacao #SaaS #Livro #Tecnologia`
  };
}

const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf8'));
let group = queue.find((item) => item.account === 'cliente-x');
if (!group) {
  group = { account: 'cliente-x', posts: [] };
  queue.push(group);
}
const completedCampaignPosts = new Map(
  (group.posts || [])
    .filter((post) => String(post.id || '').startsWith(CAMPAIGN_PREFIX) && post.status !== 'pending')
    .map((post) => [post.id, post])
);
group.posts = (group.posts || []).filter((post) => !String(post.id || '').startsWith(CAMPAIGN_PREFIX));

let topicIndex = 0;
for (const [date, times] of schedules) {
  for (const time of times) {
    const topic = topics[topicIndex];
    const id = `${CAMPAIGN_PREFIX}-${String(topicIndex + 1).padStart(2, '0')}`;
    group.posts.push(completedCampaignPosts.get(id) || {
      id,
      status: 'pending',
      packIndex: 0,
      pack: buildPack(topic, topicIndex),
      scheduledFor: `${date}T${time}:00-03:00`,
      mode: topicIndex % 3 === 1 ? 'reel-and-story' : 'feed-and-story',
      title: topic.cover,
      createdAt: '2026-09-02T18:03:00.000Z',
      campaign: 'divulgacao-livro-claude-code',
      sourceDocument: 'Como_Ser_Gestor_do_Claude_Code_COMPLETO_ILUSTRADO.pdf'
    });
    topicIndex += 1;
  }
}

writeFileSync(QUEUE_PATH, `${JSON.stringify(queue, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ ok: true, campaign: CAMPAIGN_PREFIX, scheduled: topicIndex, first: schedules[0], last: schedules.at(-1) }, null, 2));
