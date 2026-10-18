import {createHash} from 'node:crypto';
import {inspectGrounding,groundingSchema} from './editorial-grounding.js';
import {AUDIENCE_GROWTH_VERSION,assertGrowthCopy} from './audience-growth.js';
export const RESERVE_VERSION='claude-authorial-reserve-v1';
export const RESERVE_RENDER_VERSION='authorial-layout-v3';
export const SOURCE_BINDING_VERSION='exact-source-id-v1';
export function sourceBoundSchema(task){
 const schema=groundingSchema(task.claims.length);
 schema.properties.claims.items.properties.evidence.items={type:'object',additionalProperties:false,required:['sourceId'],properties:{sourceId:{type:'string',enum:task.sources.map(s=>s.id)}}};
 return schema;
}
export function bindSourceEvidence(task,value){
 const bound=structuredClone(value),sources=new Map(task.sources.map(s=>[s.id,s.text]));
 if(!Array.isArray(bound?.claims))throw Error('Resposta sem alegações.');
 for(const c of bound.claims){if(!Array.isArray(c.evidence))throw Error('Evidência ausente.');c.evidence=c.evidence.map(e=>{if(Object.keys(e).length!==1||!sources.has(e.sourceId))throw Error('ID de fonte inválido ou citação reescrita pelo modelo.');return {sourceId:e.sourceId,quote:sources.get(e.sourceId)};});}
 return bound;
}
export const digest=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
export const TOPICS=[
 {id:'extracao-campos',title:'Extração de pedidos',nodes:['MENSAGEM','CAMPOS','CONFERÊNCIA'],brief:'Proposta de exercício educativo com pedidos fictícios: definir campos produto, quantidade e prazo; pedir à IA uma tabela que preserve as informações recebidas; marcar como não informado qualquer campo ausente, sem completar por suposição; comparar cada campo com a mensagem original antes de cadastrar o pedido. Não usar dados reais de clientes no exercício.'},
 {id:'pedido-duplicado',title:'Pedidos sem duplicação',nodes:['PEDIDO','IDENTIFICADOR','REGISTRO'],brief:'Proposta de exercício educativo com pedidos fictícios: atribuir um identificador ao pedido; consultar se esse identificador já foi registrado antes de criar uma tarefa; se já existir, encaminhar para conferência em vez de criar outra tarefa; testar reenviando o mesmo pedido e verificar o registro. A regra depende da implementação e dos testes; não prometer que a IA sozinha elimina duplicações.'},
 {id:'base-respostas',title:'Base de respostas',nodes:['PERGUNTA','FONTE','REVISÃO'],brief:'Proposta de exercício educativo com uma política comercial fictícia: manter uma lista de respostas com fonte e data de revisão; pedir um rascunho baseado apenas nessa política; exigir que o rascunho indique o trecho usado; conferir o trecho na fonte, pois uma citação gerada não comprova sua validade; marcar a dúvida para revisão quando a resposta não estiver na política. Não alegar que esse método elimina erros.'},
 {id:'fila-prioridade',title:'Fila de atendimento',nodes:['SOLICITAÇÕES','CRITÉRIOS','FILA'],brief:'Proposta de exercício educativo com solicitações fictícias: definir critérios explícitos de prioridade, como prazo informado e tipo de solicitação; pedir à IA uma sugestão de classificação acompanhada da justificativa; comparar a justificativa com os critérios; revisar casos ambíguos antes de mudar a fila. Não inferir urgência por características pessoais nem prometer ganho de produtividade.'},
 {id:'teste-variacoes',title:'Teste de mensagens',nodes:['EXEMPLOS','VARIAÇÕES','COMPARAÇÃO'],brief:'Proposta de exercício educativo: escrever um pedido fictício e depois versões com abreviação, erro de digitação e informação ausente; executar o mesmo rascunho de instrução em cada versão; comparar os campos extraídos e anotar divergências; corrigir a instrução e repetir o conjunto antes de usar na rotina. É uma proposta de teste, sem prometer precisão ou resultados.'},
 {id:'versao-instrucao',title:'Histórico de instruções',nodes:['VERSÃO','TESTES','REGISTRO'],brief:'Proposta de exercício educativo: guardar a instrução usada pela IA com um nome de versão e a data; manter exemplos fictícios de entrada e os critérios esperados; ao alterar a instrução, executar os mesmos exemplos e comparar as respostas; registrar o que melhorou e o que piorou antes de escolher a versão. Não afirmar que uma versão específica garante resultados.'},
 {id:'medicao-rascunho',title:'Avaliação de rascunhos',nodes:['RASCUNHO','REVISÃO','ANOTAÇÕES'],brief:'Proposta de exercício educativo: escolher respostas fictícias de atendimento; definir critérios de correção, clareza e informações ausentes; comparar rascunhos com esses critérios; anotar correções necessárias e trabalho de revisão; decidir se vale testar o fluxo em uma etapa limitada. Não inventar percentuais, clientes, estudos ou economia comprovada.'},
 {id:'resumo-transferencia',title:'Resumo de atendimento',nodes:['CONVERSA','PENDÊNCIAS','RESUMO'],brief:'Proposta de exercício educativo com conversa fictícia: pedir um resumo separado em pedido do cliente, informações confirmadas e pendências; marcar como pendente o que não foi informado; conferir o resumo contra a conversa; encaminhar apenas o contexto necessário à pessoa que continuará o atendimento. Não incluir dados reais ou sensíveis no exercício nem inventar decisões tomadas.'}
];
const str=(min,max)=>({type:'string',minLength:min,maxLength:max});
const SCENARIOS=[['loja','uma loja fictícia de materiais de escritório, com pedidos enviados por mensagem'],['servicos','uma prestadora fictícia de serviços, com pedidos de orçamento e retorno ao cliente'],['distribuidora','uma distribuidora fictícia, com consultas comerciais e solicitações internas'],['cursos','uma escola fictícia de cursos livres, com dúvidas sobre horários e inscrições'],['oficina','uma oficina fictícia, com solicitações de orçamento e acompanhamento de serviço'],['equipe','uma equipe administrativa fictícia, com mensagens internas e tarefas de acompanhamento']];
export function authorialTopic(id){
 const original=TOPICS.find(t=>t.id===id);if(original)return original;
 const match=String(id).match(/^([a-z-]+)-v([1-9][0-9]{0,5})$/),base=match&&TOPICS.find(t=>t.id===match[1]);if(!base)return null;
 const scenario=SCENARIOS[(Number(match[2])-1)%SCENARIOS.length];
 return {...base,id,baseId:base.id,brief:base.brief+' Cenário proposto: '+scenario[1]+'. Desenvolva uma situação específica e um exercício ainda não cobertos no histórico. Trocar título, data ou nome de empresa não comprova novidade. Não relate um cliente real nem acrescente resultados comprovados.'};
}
export function nextAuthorialTopic(entries){
 const used=new Set(entries.map(e=>e.topic));const initial=TOPICS.find(t=>!used.has(t.id));if(initial)return initial;
 const counts=TOPICS.map(t=>({topic:t,count:entries.filter(e=>e.topic===t.id||e.topic?.startsWith(t.id+'-v')).length})).sort((a,b)=>a.count-b.count||TOPICS.indexOf(a.topic)-TOPICS.indexOf(b.topic));
 for(const {topic}of counts)for(let index=1;index<1_000_000;index++){const id=topic.id+'-v'+index;if(!used.has(id))return authorialTopic(id);}
 return null;
}
const object=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
const slide=object({eyebrow:str(3,32),title:str(12,72),body:str(35,180)});
export const draftSchema=()=>object({slides:{type:'array',minItems:4,maxItems:4,items:slide},caption:str(220,1050),storySlide:slide});
export function buildAuthorialPack(draft,topic,{growth=false}={}){
 if(!draft || draft.slides?.length!==4)throw Error('Lote autoral incompleto.');
 for(const s of [...draft.slides,draft.storySlide])for(const [key,min,max] of [['eyebrow',3,32],['title',12,72],['body',35,180]])if(typeof s?.[key]!=='string'||s[key].length<min||s[key].length>max)throw Error('Texto autoral fora dos limites.');
 if(typeof draft.caption!=='string'||draft.caption.length<220||draft.caption.length>1050)throw Error('Legenda autoral fora dos limites.');
 const text=JSON.stringify(draft);
 if(/https?:|\d|%|\b(?:garantid[oa]s?|comprovad[oa]s?|pesquisa revelou|estudo mostra)\b/i.test(text))throw Error('Reserva educativa não aceita fontes inventadas, números ou promessa de resultado.');
 const id='authorial-'+digest({topic:topic.id,draft,...(growth?{growth:AUDIENCE_GROWTH_VERSION}:{})}).slice(0,16),dir='docs/illustrations/cliente-x/'+id;
 const pack={id,authorialTopic:topic.id,editorialReserve:true,autoGenerated:true,...(growth?{audienceGrowth:{version:AUDIENCE_GROWTH_VERSION}}:{}),visualDirection:'impact-carousel',slides:draft.slides.map((s,i)=>({...s,preserveEngagementCopy:true,...(i===0?{imagePath:dir+'/cover.png'}:{typographicOnly:true})})),caption:draft.caption+'\n\nConteúdo educativo autoral com apoio de IA. Exemplo fictício; não é notícia nem resultado comprovado.',storySlide:{...draft.storySlide,imagePath:dir+'/story.png'}};
 if(growth)assertGrowthCopy(pack);return pack;
}
export const packClaims=pack=>[...pack.slides.map((s,i)=>({id:'slide-'+(i+1),text:[s.eyebrow,s.title,s.body].join('. ')})),{id:'caption',text:pack.caption},{id:'story',text:[pack.storySlide.eyebrow,pack.storySlide.title,pack.storySlide.body].join('. ')}];
export function reserveApproved(entry,readAsset){
 try{
 if(entry?.status!=='ready'||entry.version!==RESERVE_VERSION||entry.account!=='cliente-x'||entry.pack?.id!==entry.id||entry.packHash!==digest(entry.pack)||entry.pack.research||!entry.pack.autoGenerated||!entry.pack.editorialReserve)return false;
 if(!authorialTopic(entry.pack.authorialTopic)||entry.review?.decision!=='approve'||!['supported','novel','practical','visualMatch'].every(k=>entry.review[k]===true)||entry.review.packHash!==entry.packHash)return false;
 if(entry.pack.audienceGrowth){if(entry.pack.audienceGrowth.version!==AUDIENCE_GROWTH_VERSION||!['hookSpecific','payoffDelivered','followReason','shareReason'].every(k=>entry.review.growth?.[k]===true))return false;assertGrowthCopy(entry.pack);}
 if(!entry.review.callId||!entry.generationCallId||entry.review.callId===entry.generationCallId||!entry.render?.verifiedAt||entry.render.packHash!==entry.packHash||entry.render.feedCount!==4||entry.render.story!==true)return false;
 if(entry.render.version!==RESERVE_RENDER_VERSION||entry.render.imageHashes?.length!==5||entry.render.imageHashes.some(h=>!/^[a-f0-9]{64}$/.test(h)))return false;
 const topic=authorialTopic(entry.pack.authorialTopic),task=entry.review.groundingTask;
 if(JSON.stringify(task?.claims)!==JSON.stringify(packClaims(entry.pack))||task?.sources?.[0]?.text!==topic.brief||task.sources.length!==2||!inspectGrounding(task,entry.review).approved)return false;
 const paths=[entry.pack.slides[0].imagePath,entry.pack.storySlide.imagePath];
 return paths.every((path,i)=>path===`docs/illustrations/cliente-x/${entry.id}/${i?'story':'cover'}.png` && entry.assets?.[path] && digest(readAsset(path))===entry.assets[path]);
 }catch{return false;}
}
export const readyAuthorialPacks=(state,account,readAsset,calls=[])=>account==='cliente-x'?(state?.entries||[]).filter(e=>reserveApproved(e,readAsset)&&[[e.generationCallId,'generate'],[e.review.callId,'review']].every(([id,stage])=>calls.some(c=>c.id===id&&c.stage===`authorial:${stage}:${e.topic}`&&c.status==='completed'&&c.stopReason==='tool_use'&&c.outputTokens>0&&['provider_reported','unconfirmed_counted_at_maximum'].includes(c.usageStatus)))).map(e=>({...e.pack,authorialProof:{version:e.version,packHash:e.packHash}})):[];
export const approvedGeneratedPack=pack=>Boolean(pack?.authorialProof?.version===RESERVE_VERSION && pack.authorialProof.packHash===digest(Object.fromEntries(Object.entries(pack).filter(([key])=>key!=='authorialProof'))));
const escape=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function conceptSvg(topic,story=false){
 const colors=['#06b6d4','#a78bfa','#f59e0b','#34d399'],color=colors[TOPICS.findIndex(t=>t.id===(topic.baseId||topic.id))%colors.length];
 const nodes=topic.nodes;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760"><rect width="1200" height="760" rx="40" fill="#101b31"/><text x="65" y="85" font-family="Arial" font-size="27" fill="#b7c8df">ILUSTRAÇÃO AUTORAL · EXEMPLO EDUCATIVO</text><text x="65" y="165" font-family="Arial" font-size="46" font-weight="bold" fill="white">${escape(topic.title)}</text>${nodes.map((n,i)=>{const x=story?140+i*350:75+i*375,y=story?260+(i%2)*70:300;return `<rect x="${x}" y="${y}" width="300" height="220" rx="28" fill="${color}" opacity="${.95-i*.12}"/><circle cx="${x+150}" cy="${y+65}" r="27" fill="#101b31"/><path d="M${x+137} ${y+65}l10 10 19-21" stroke="white" fill="none" stroke-width="7"/><text x="${x+150}" y="${y+145}" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#101b31">${escape(n)}</text>${i<2?`<path d="M${x+312} ${y+110}h48m-12-12 12 12-12 12" stroke="${color}" stroke-width="7" fill="none"/>`:''}`;}).join('')}<text x="65" y="690" font-family="Arial" font-size="27" fill="#b7c8df">${story?'PERGUNTA PARA SUA EQUIPE':'ORGANIZE · TESTE · CONFIRA'}</text></svg>`;
}
