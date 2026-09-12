export const EDUCATION_LEARNING_VERSION = 'education-learning-v1';
const topics = { 'serie-6':'atendimento','serie-7':'vendas','serie-8':'operacao','serie-9':'atendimento','serie-10':'atendimento','serie-11':'operacao','serie-12':'atendimento','serie-13':'operacao','serie-14':'operacao',feedback:'atendimento',catalogo:'vendas',fornecedores:'operacao',abertura:'operacao',cadastro:'operacao',briefing:'vendas',escopo:'vendas' };
export const educationTopic = id => topics[id] || null;
export function educationLearningModel(samples = [], updatedAt = null, now = Date.now()) {
  const result = {version:EDUCATION_LEARNING_VERSION,status:'insufficient-evidence',reason:'Aguardando ao menos 6 tutoriais com coleta válida de 24h, 3 por tema em dois temas e alcance acumulado de 180.',eligiblePosts:0,totalReach:0,positiveInteractions:0,topics:{},updatedAt};
  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp) || now-timestamp>72*3600000 || timestamp>now+300000) return {...result,status:'stale',reason:'Dados ausentes ou desatualizados; a ordem editorial permanece neutra.'};
  const unique = new Map();
  for (const sample of samples) {
    if (!sample.mediaId || sample.education?.strategy !== 'educacao-negocios-v1' || sample.education?.kind !== 'tutorial' || sample.mediaProductType !== 'FEED') continue;
    const topic = educationTopic(sample.education.lessonId), published = Date.parse(sample.publishedAt);
    if (!topic || !Number.isFinite(published) || published > now || now-published>42*86400000) continue;
    const observation = (sample.observations || []).filter(o=>{
      const collected=Date.parse(o.collectedAt), age=(collected-published)/3600000;
      return o.windowHours===24 && o.ageHours>=24 && o.ageHours<=36 && collected<=now && age>=24 && age<=36 && Math.abs(age-o.ageHours)<=1;
    }).sort((a,b)=>a.ageHours-b.ageHours)[0];
    const m=observation?.metrics;
    if (!m || !['reach','saved','shares','comments'].every(k=>typeof m[k]==='number' && Number.isFinite(m[k]) && m[k]>=0) || m.reach<20) continue;
    const key=String(sample.mediaId), previous=unique.get(key);
    if (!previous || observation.ageHours<previous.ageHours) unique.set(key,{topic,lessonId:sample.education.lessonId,metrics:m,ageHours:observation.ageHours});
  }
  const independent = [...new Map([...unique.values()].map(row=>[row.lessonId,row])).values()];
  for (const {topic,metrics:m} of independent) {
    const group=result.topics[topic] ||= {posts:0,reach:0,saved:0,shares:0,comments:0,adjustment:0};
    group.posts++; for(const k of ['reach','saved','shares','comments']) group[k]+=m[k];
    result.totalReach+=m.reach; result.positiveInteractions+=m.saved+m.shares+m.comments;
  }
  result.eligiblePosts=independent.length;
  if (result.eligiblePosts<6 || result.totalReach<180 || Object.values(result.topics).filter(g=>g.posts>=3).length<2) return result;
  if (result.positiveInteractions<3) return {...result,status:'no-positive-signal',reason:'Ainda não há interações suficientes para favorecer um tema. Zero não é tratado como sucesso.'};
  for(const group of Object.values(result.topics)) if(group.posts>=3) group.adjustment=Math.min(4,20*(2*group.saved+2*group.shares+group.comments)/(group.reach+100));
  return {...result,status:'ready',reason:'Preferência assistida por utilidade observada; 20% das datas ficam reservadas à exploração. Não é prova de causalidade.'};
}
export function chooseEducationLesson(candidates, options = {}) {
  if (!candidates.length) return null;
  const model=educationLearningModel(options.samples,options.updatedAt,options.now);
  const date=options.date || new Date(options.now || Date.now()).toISOString().slice(0,10);
  const hash=[...date].reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,0);
  const explore=model.status==='ready' && hash%5===0;
  const ranked=candidates.map((pack,index)=>({pack,index,topic:educationTopic(pack.education.lessonId),score:model.topics[educationTopic(pack.education.lessonId)]?.adjustment || 0})).sort((a,b)=>b.score-a.score || a.index-b.index);
  const chosen=model.status!=='ready' ? ranked.find(row=>row.index===0) : explore ? ranked[hash%ranked.length] : ranked[0];
  return {...chosen.pack,education:{...chosen.pack.education,topic:chosen.topic,decision:{version:model.version,mode:model.status==='ready' ? explore ? 'explore' : 'assisted' : 'editorial',reason:model.reason,eligiblePosts:model.eligiblePosts,totalReach:model.totalReach,adjustment:model.status==='ready' ? chosen.score : 0,sourceUpdatedAt:model.updatedAt}}};
}
