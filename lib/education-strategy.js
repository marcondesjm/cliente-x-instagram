import { seriesPacks } from './follower-series.js';
import { chooseEducationLesson } from './education-learning.js';

export const EDUCATION = { id: 'educacao-negocios-v1', startDate: '2026-09-13', reviewDate: '2026-09-27', timeBrt: '16:00', dailyLimit: 1 };
const cycle = ['tutorial', 'tutorial', 'tutorial', 'news', 'tutorial', 'tutorial', 'tutorial', 'news', 'tutorial', 'offer'];
export const educationEnabled = account => account?.educationStrategy?.enabled === true;
export const educationIntegrated = account => educationEnabled(account) && account.educationStrategy.mode === 'integrated-slot';
export const educationSlotIndex = account => educationIntegrated(account) ? Number(account.educationStrategy.slotIndex) : 0;
export const educationForSlot = (account, date, slotIndex) => educationEnabled(account) && Number(slotIndex) === educationSlotIndex(account) && date >= account.educationStrategy.startDate;
export function educationDayBlocked(account, date, history = []) {
  if (!educationEnabled(account)) return false;
  return date < account.educationStrategy.startDate || history.some(h => (!educationIntegrated(account) || h.education?.strategy === account.educationStrategy.id) && h.mediaId && Number.isFinite(Date.parse(h.publishedAt)) && new Date(h.publishedAt).toLocaleDateString('en-CA', {timeZone:'America/Sao_Paulo'}) === date);
}
export function educationKind(date, start = EDUCATION.startDate) {
  const day = Math.floor((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000);
  return day < 0 || !Number.isFinite(day) ? 'transition' : cycle[day % cycle.length];
}
const demos = {
  6: ['Cliente pergunta: vocês abrem domingo? Base fictícia: segunda a sexta, 9h às 18h.', 'Responda usando apenas esta base. Se a informação faltar, encaminhe para uma pessoa.', 'Não abrimos domingo. Atendemos de segunda a sexta, das 9h às 18h.'],
  7: ['CRM fictício: proposta enviada na terça; próximo contato ainda sem data.', 'Liste propostas sem próximo passo. Rascunhe uma pergunta sem inventar desconto nem prazo.', 'Há uma proposta sem próximo passo. Rascunho: ficou alguma dúvida sobre o escopo?'],
  8: ['Pedido fictício: 10 caixas para sexta. Endereço e horário não informados.', 'Separe quantidade, data, endereço e horário. Marque campos ausentes como a confirmar.', 'Quantidade: 10 caixas. Data: sexta. Endereço e horário: a confirmar.'],
  9: ['Serviço fictício: configurar um catálogo. Escopo aprovado: 12 produtos e uma revisão.', 'Crie um checklist usando só este escopo. Separe materiais necessários e dúvidas para o cliente.', 'Solicitar dados dos 12 produtos; preparar catálogo; enviar para a revisão prevista.'],
  10: ['Email fictício: quero saber quando chega. Sem número do pedido.', 'Resuma o pedido e liste o que falta para atendê-lo. Não adivinhe a entrega.', 'Dúvida sobre entrega. Falta identificar o pedido antes de consultar o prazo.'],
  11: ['Arquivo fictício: proposta final nova.pdf. Projeto: Loja Sol. Data: 2026-09-01.', 'Sugira um nome com projeto, data e tipo. Não assuma versão aprovada sem evidência.', 'Loja-Sol_2026-09-01_proposta_status-a-confirmar.pdf. Revise antes de renomear.'],
  12: ['Entrega fictícia concluída na segunda. Responsável: Ana. Contato ainda não definido.', 'Crie um lembrete interno de acompanhamento. Liste responsável e informações a confirmar.', 'Ana: confirmar com a equipe quando acompanhar a entrega. Nenhuma mensagem foi enviada.'],
  13: ['Regra antiga: revisão em dois dias. Regra nova aprovada: revisão em três dias úteis.', 'Compare as regras. Diga o que mudou e quais documentos internos precisam ser conferidos.', 'Prazo passou para três dias úteis. Conferir modelos e orientações que citam o prazo antigo.'],
  14: ['Teste fictício: antes, 20 minutos e uma correção; depois, 12 minutos e quatro correções.', 'Compare tempo e correções sem concluir que o teste foi melhor. Liste o que falta medir.', 'O tempo caiu, mas as correções aumentaram. Falta medir o esforço e o impacto dessas correções.']
};
const extra = [
  ['feedback', 'O que três reclamações ensinam sobre seu atendimento?', 'ecommerce.jpg', 'Comentários fictícios: não achei o prazo; prazo confuso; entrega no prazo.', 'Agrupe comentários por tema e conte cada grupo. Não invente causas nem intenção dos clientes.', 'Clareza do prazo: dois comentários. Entrega no prazo: um comentário. Revise a amostra.'],
  ['catalogo', 'Escreva uma descrição sem inventar benefícios', 'ecommerce.jpg', 'Produto fictício: caneca de cerâmica, 300 ml, azul. Nenhuma outra característica confirmada.', 'Escreva uma descrição curta usando só esses dados. Liste dúvidas separadamente.', 'Caneca azul de cerâmica, com capacidade de 300 ml. Uso no micro-ondas: a confirmar.'],
  ['fornecedores', 'Compare propostas sem esconder o que falta', 'operations-review.png', 'Propostas fictícias: A, R$ 100 e frete não informado; B, R$ 110 com frete incluso.', 'Organize preço e frete em uma tabela. Marque o que falta e não escolha um vencedor.', 'A: R$ 100, frete a confirmar. B: R$ 110, frete incluso. Confirme o custo total de A.'],
  ['abertura', 'Transforme uma rotina em checklist de abertura', 'restaurant.jpg', 'Rotina fictícia: conferir caixa, ligar equipamentos e checar reservas.', 'Transforme estas três ações em checklist. Não acrescente exigências que não foram informadas.', 'Conferir caixa; ligar equipamentos; checar reservas. Responsáveis e horários: a confirmar.'],
  ['cadastro', 'Seu cadastro tem nomes diferentes para o mesmo item?', 'ecommerce.jpg', 'Planilha fictícia: caneca azul 300 ml; caneca 300ml azul; copo azul 300 ml.', 'Aponte possíveis duplicatas, explique o motivo e mantenha todos os registros para revisão.', 'As duas canecas podem ser duplicatas. Copo não é necessariamente caneca. Confira os códigos.'],
  ['briefing', 'Uma ideia vaga pode virar um briefing revisável', 'operations-review.png', 'Pedido fictício: divulgar nosso curso de planilhas para iniciantes. Data e preço não definidos.', 'Organize público, oferta e pendências. Não crie preço, data, depoimento ou garantia.', 'Público: iniciantes. Oferta: curso de planilhas. Data, preço e formato: a confirmar.'],
  ['escopo', 'Confira se a proposta responde ao pedido do cliente', 'operations-review.png', 'Pedido fictício: duas páginas e formulário. Proposta: duas páginas, formulário não mencionado.', 'Compare pedido e proposta. Liste itens cobertos e lacunas, sem presumir que algo está incluso.', 'Duas páginas: cobertas. Formulário: não consta. Confirme o escopo antes de fechar.']
];
const card = (eyebrow, title, body) => ({ eyebrow, title, body, typographicOnly: true, preserveEngagementCopy: true });
function lesson(pack, id, input, prompt, output) {
  const title = pack.slides[0].title;
  const cta = 'Salve o passo a passo para testar com um exemplo do seu negócio.';
  return { ...pack, education: { strategy: EDUCATION.id, kind: 'tutorial', lessonId: id },
    slides: [pack.slides[0], card('EXEMPLO FICTÍCIO', 'Comece com uma entrada pequena', input), card('PROMPT PARA TESTAR', 'Peça à IA uma tarefa delimitada', prompt), card('SAÍDA ILUSTRATIVA', 'Compare a resposta com a entrada', output), card('REVISE ANTES DE USAR', 'Confira cada dado e o que ficou pendente', 'Teste sem dados de clientes. O resultado real pode variar; corrija a resposta antes de usar.'), card('GUARDE PARA APLICAR', 'Uma tarefa que você pode testar hoje', cta)],
    caption: `${title}\n\nEXEMPLO FICTÍCIO\n${input}\n\nCOPIE ESTE PROMPT\n${prompt}\n\nSAÍDA ILUSTRATIVA\n${output}\n\nCOMO TESTAR\n1. Use a entrada fictícia.\n2. Cole o prompt em uma ferramenta de IA que sua empresa autorize.\n3. Confira os dados e corrija o que precisar. A saída é ilustrativa, não garantida.\n\n${cta}\n\n#IAParaNegócios #Automação #Gestão` };
}
export function educationLessons() {
  return [...seriesPacks().filter(p => demos[p.editorialSeries.episode]).map(p => lesson(p, `serie-${p.editorialSeries.episode}`, ...demos[p.editorialSeries.episode])),
    ...extra.map(([id,title,image,input,prompt,output]) => lesson({ slides:[{...card('IA NA PRÁTICA',title,'Aprenda com um exemplo e um prompt pronto para revisar.'),imagePath:`docs/uploads/sector-photos/${image}`}] },id,input,prompt,output))];
}
export function offerPack(index = 0) {
  const titles = ['Qual tarefa vale levar para uma conversa sobre IA?', 'Antes de contratar uma automação, descreva o processo', 'Sua equipe precisa de treinamento ou de automação?'];
  const title = titles[index % titles.length];
  return { education:{strategy:EDUCATION.id,kind:'offer',lessonId:`oferta-${index % titles.length}`}, slides:[{...card('IA PARA EMPRESAS',title,'Comece por uma rotina concreta de atendimento, vendas ou operação.'),imagePath:'docs/uploads/sector-photos/operations-review.png'},card('PREPARE O CONTEXTO','Descreva a tarefa como ela acontece hoje','Anote a entrada, quem executa, a saída esperada e onde o trabalho trava.'),card('O QUE AVALIAR','Identifique limites antes de escolher a ferramenta','Dados disponíveis, revisão humana e forma de medir o resultado orientam a conversa.'),card('PRÓXIMO PASSO','Solicite uma conversa pelo link da bio','Informe seu negócio e a tarefa que deseja melhorar para avaliar um possível escopo.')],caption:`${title}\n\nTrabalho com consultoria, treinamentos e automações de IA para empresas.\n\nPara começar, descreva uma tarefa repetitiva: o que chega, quem executa, qual saída você precisa e onde costuma haver retrabalho.\n\nIsso ajuda a avaliar se o próximo passo é organizar o processo, treinar a equipe ou desenvolver uma automação. Prazo, investimento e escopo dependem dessa avaliação.\n\nSolicite uma conversa pelo link da bio e conte qual tarefa deseja melhorar.` };
}
export function nextEducationPack(history = [], duplicate = () => false, kind = 'tutorial', learning = {}) {
  const candidates = kind === 'offer' ? [0,1,2].map(offerPack) : educationLessons();
  const eligible = candidates.filter(p => !history.some(h => h.mediaId && (h.education?.lessonId === p.education.lessonId || (p.editorialSeries && h.editorialSeries?.id === p.editorialSeries.id && h.editorialSeries?.episode === p.editorialSeries.episode))) && !duplicate(p));
  return kind === 'offer' ? eligible[0] || null : chooseEducationLesson(eligible, learning);
}
export function isBusinessAINews(pack) {
  const r = pack?.research || {};
  const text = `${r.sourceTitle || ''} ${r.sourceFact || ''}`;
  return Boolean(r.sourceUrl && /\b(IA|AI|inteligência artificial|artificial intelligence|machine learning)\b/i.test(text) && /atendimento|vendas|empresa|negócio|customer|business|enterprise|workflow|processo|produtividade|documento|planilha|automatiza|automation/i.test(text) && !/espionagem|armas|vigilância|dissidentes|processos no STF/i.test(text));
}
export function newsWithPracticalExercise(pack) {
  const facts = (pack.research.sourceFacts || [pack.research.sourceFact]).slice(0,2).join('\n\n');
  return {...pack, education:{strategy:EDUCATION.id,kind:'news',lessonId:pack.research?.sourceUrl}, slides:[...pack.slides.slice(0, -1), card('EXERCÍCIO DE AVALIAÇÃO','Essa novidade resolve uma tarefa sua?','Escolha uma rotina, confira na fonte os recursos e limites, e teste com dados fictícios. Compare a saída com seu processo atual.'),card('CRITÉRIO DE DECISÃO','Registre o que funcionou e o que precisou corrigir','Avalie tempo, erros e esforço de revisão. Não adote a ferramenta só por ser novidade.')],caption:`${pack.slides[0].title}\n\n${facts}\n\nFonte: ${pack.research.sourceUrl}\n\nEXERCÍCIO PARA O SEU NEGÓCIO\n1. Escolha uma tarefa concreta.\n2. Confira na fonte se o recurso está disponível e quais são os limites.\n3. Se for adequado, teste com dados fictícios e compare tempo, erros e revisão com o processo atual.\n\nO exercício é uma orientação editorial, não um resultado prometido pela notícia.\n\nQual tarefa você avaliaria primeiro?`};
}
export function educationPreview(account, date, history = []) {
  const kind = date < account.educationStrategy?.startDate ? 'transition' : educationIntegrated(account) ? 'tutorial' : educationKind(date, account.educationStrategy?.startDate);
  const pack = nextEducationPack(history, () => false, kind);
  const educational = {time:'16:00',slotIndex:educationSlotIndex(account),type:'automatic',status:'planned',educationKind:kind,title:kind === 'news' ? 'Notícia de IA com exercício prático; tutorial se não houver pauta adequada' : kind === 'transition' ? 'Transição de agenda: novo ciclo começa amanhã' : pack?.slides[0].title || 'Biblioteca educativa precisa de novas aulas',caption:pack?.caption || '',mode:'feed + story',packIndex:pack?.education.lessonId || null,slides:kind === 'tutorial' || kind === 'offer' ? pack?.slides || [] : []};
  if (!educationIntegrated(account)) return [educational];
  return (account.scheduleUtc || []).map((cron, slotIndex) => {
    if (educationForSlot(account, date, slotIndex)) return educational;
    const [minute, hour] = cron.split(' ').map(Number);
    const time = `${String((hour + 21) % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    return {time, slotIndex, type:'automatic', status:'planned', title:'Pauta do Radar selecionada no horário da publicação', caption:'', mode:(account.reelScheduleSlots || []).includes(slotIndex) ? 'reel + story' : 'feed + story', packIndex:null, slides:[]};
  });
}
