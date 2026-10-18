export const AUDIENCE_GROWTH_VERSION='business-audience-growth-v1';
export const GROWTH_EDITORIAL_BRIEF='Prioridade editorial: atrair pessoas interessadas em IA aplicada a empresas e dar motivo para acompanhar o perfil. Comece por uma situação reconhecível no atendimento, vendas ou operação, em linguagem que um dono de negócio entenda. A capa abre uma dúvida específica e o próprio carrossel entrega a resposta, com exemplo fictício concreto e exercício realizável. Evite jargão na capa. Mostre o que a pessoa poderá conferir ou organizar, sem prometer economia, precisão ou resultado. A legenda inclui um único convite natural para seguir o perfil, explicando o benefício: aprender aplicações práticas de IA em empresas. Ofereça um conteúdo útil para salvar ou enviar a um colega, sem exigir curtida, marcação, comentário ou compartilhamento como condição para receber a resposta. Sem correntes, polêmicas artificiais, urgência falsa, promessa de viralizar ou fórmula de seguidores. Não prometa um próximo episódio que não esteja planejado. O Story faz uma pergunta concreta sobre a rotina e leva ao conteúdo completo no feed. Curtidas são uma métrica de resposta, não prova de que alguém passou a seguir.';
export const growthEnabled=account=>account?.contentProfile?.goal==='growth';
export const GROWTH_ANGLES={
 'fila-prioridade':'A mensagem parece urgente. Quem definiu a prioridade?',
 'teste-variacoes':'O pedido veio abreviado. Sua IA entendeu o mesmo?',
 'versao-instrucao':'Você mudou a instrução. A resposta melhorou mesmo?',
 'medicao-rascunho':'A IA respondeu rápido. Quanto você precisou corrigir?',
 'resumo-transferencia':'Vai transferir o atendimento? Leve as pendências junto.'
};
export function growthDiscoveryStrategy(date,slot){
 const strategies=[
 {id:'growth-discovery',primarySignal:'alcance de nao seguidores',hook:'Uma situação da rotina merece um teste com IA.',prompt:'Use o exemplo do post para comparar com uma tarefa da sua empresa.',cta:'Siga o perfil para aprender aplicações práticas de IA no atendimento, nas vendas e na operação.'},
 {id:'growth-save',primarySignal:'salvamentos',hook:'Um exercício para revisar com a equipe.',prompt:'Confira as etapas e adapte o exemplo à sua rotina.',cta:'Salve para testar com dados fictícios e acompanhe o perfil para conhecer outras aplicações de IA em empresas.'},
 {id:'growth-share',primarySignal:'compartilhamentos',hook:'Uma conversa útil para quem organiza o trabalho da equipe.',prompt:'Que parte do exemplo se parece com a rotina da sua empresa?',cta:'Envie a quem trabalha nessa rotina e acompanhe o perfil para aprender outras aplicações práticas de IA.'}
 ];
 const seed=[...String(date)].reduce((sum,c)=>sum+c.charCodeAt(0),0);
 return strategies[((seed+Number(slot||0))%strategies.length+strategies.length)%strategies.length];
}
export function growthEditorialSignals(pack){
 const title=pack.research?.sourceTitle||pack.slides?.[0]?.title||'';
 const text=[title,...(pack.research?.sourceFacts||[]),...(pack.slides||[]).slice(0,3).map(s=>s.body)].join(' ');
 const concrete=/pedido|atendimento|cliente|planilha|relat[oó]rio|estoque|proposta|cobran[cç]a|e-?mail|mensage[mn]|documento|agenda|equipe|or[cç]amento/iu.test(text);
 const actionable=/teste|testar|passo|confira|conferir|compare|comparar|exemplo|checklist|organizar|rascunho|extra[iç]|triagem/iu.test(text);
 const offNiche=/\btrump\b|m[ií]ssil|coreia do norte|call of duty|pok[eé]mon|playstation|videogame/iu.test(title)&&!concrete;
 const reasons=[];let adjustment=0;
 if(concrete){adjustment+=6;reasons.push('situacao-empresarial-reconhecivel');}
 if(concrete&&actionable){adjustment+=5;reasons.push('aplicacao-pratica-para-o-publico');}
 if(offNiche){adjustment-=12;reasons.push('distancia-do-publico-empresarial');}
 return {adjustment,reasons};
}
export function assertGrowthCopy(pack){
 const text=[pack.caption,...pack.slides.map(s=>s.body)].join(' ');
 if(!/(?:siga|acompanhe|seguir)[^.\n]{0,140}(?:aplica[cç][oõ]es|aprender|ia|intelig[eê]ncia artificial|automa[cç][aã]o|empresa|receber exerc[ií]cios)/iu.test(text))throw Error('Pauta de crescimento precisa explicar por que acompanhar o perfil.');
 if(/(?:comente|curta|marque|compartilhe)[^.\n]{0,70}(?:para liberar|para desbloquear|s[oó] assim|sen[aã]o|azar|corrente)|(?:garant|viraliz)[^.\n]{0,40}(?:seguidores|curtidas|viral)/iu.test(text))throw Error('Convite artificial de engajamento ou promessa de crescimento bloqueado.');
}
