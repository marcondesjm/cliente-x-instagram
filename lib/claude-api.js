import {getSession,isOwner} from './auth.js';
import {commitConfigBatch} from './github-config-batch.js';
import {CLAUDE_CONFIG,CLAUDE_SCOPES,controlSummary,applyControlSettings,assertCanRun} from './claude-control.js';
const BASE='https://api.github.com/repos/marcondesjm/cliente-x-instagram/';
export function createClaudeHandler({fetchImpl=fetch,sessionFor=getSession,tokenFor=()=>process.env.GITHUB_TOKEN||process.env.GITHUB_PAT,now=()=>new Date()}={}) {
 return async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  const session=sessionFor(req);
  if(!isOwner(session))return res.status(session?403:401).json({error:'Controle do Claude disponível apenas para o administrador principal.'});
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método não permitido.'});
  if(req.method==='POST'&&req.headers?.origin){
   try{if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Origem da solicitação inválida.'});}catch{return res.status(403).json({error:'Origem da solicitação inválida.'});}
  }
  try {
   const token=await tokenFor();if(!token)return res.status(503).json({error:'Conexão com GitHub não configurada no servidor.'});
   const gh=async(path,options={})=>{
    const response=await fetchImpl(BASE+path,{...options,redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'}});
    if(!response.ok)throw Object.assign(new Error('Não foi possível concluir a operação no GitHub.'),{statusCode:[409,422].includes(response.status)?409:502});
    return response.status===204?null:response.json();
   };
   const body=req.method==='POST'?(typeof req.body==='string'?JSON.parse(req.body):req.body||{}):{};
   const scope=req.method==='GET'?req.query?.scope:body.scope;
   const config=Object.hasOwn(CLAUDE_SCOPES,scope||'')?CLAUDE_SCOPES[scope]:null;
   if(!config)return res.status(400).json({error:'Selecione uma conta compatível com o Claude.'});
   const head=(await gh('git/ref/heads/main')).object.sha;
   const read=async name=>{const f=await gh('contents/'+CLAUDE_CONFIG+name+'?ref='+head);return JSON.parse(Buffer.from(f.content,'base64').toString('utf8'));};
   const budget=await read(config.budget),stock=config.stock===config.budget?budget:await read(config.stock);
   const summary=()=>({...controlSummary(budget,stock,now()),scope,revision:head});
   const workflowUrl='https://github.com/marcondesjm/cliente-x-instagram/actions/workflows/'+config.workflow;
   if(req.method==='GET'){
    const runs=(await gh('actions/workflows/'+config.workflow+'/runs?branch=main&per_page=5')).workflow_runs||[];
    return res.status(200).json({...summary(),workflowUrl,runs:runs.map(r=>({id:r.id,status:r.status,conclusion:r.conclusion,url:r.html_url}))});
   }
   if(body.revision!==head)return res.status(409).json({error:'O estado mudou na nuvem. Atualize os dados antes de continuar.'});
   if(body.action==='settings'){
    const settings=applyControlSettings(budget,stock,body,now());
    const files=[{path:CLAUDE_CONFIG+config.budget,data:budget}];
    if(config.stock!==config.budget)files.push({path:CLAUDE_CONFIG+config.stock,data:stock});
    files.push({path:CLAUDE_CONFIG+'claude-control-last-change.json',data:{scope,settings,actor:session.email,changedAt:now().toISOString()}});
    const revision=await commitConfigBatch(gh,head,files,'Update Claude controls from authenticated platform admin');
    return res.status(200).json({...summary(),revision,saved:true,workflowUrl});
   }
   if(['run','audit','calibrate'].includes(body.action)){
    if(body.action==='audit'&&scope!=='cliente-x'||body.action==='calibrate'&&scope!=='sabedoria-kids')return res.status(400).json({error:'Ação incompatível com esta conta.'});
    const status=summary();
    // Diagnostic workflows retain their own circuit and quota checks.
    if(body.action==='run')assertCanRun(status);
    else if(status.inFlight||status.usage.remaining<1)return res.status(409).json({error:'Não há cota livre para o diagnóstico ou existe chamada em andamento.'});
    const filename=body.action==='audit'?'platform-editorial-api-validation.yml':config.workflow;
    const workflow='actions/workflows/'+filename;
    const runs=(await gh(workflow+'/runs?branch=main&per_page=20')).workflow_runs||[];
    const active=runs.find(r=>['queued','in_progress','waiting','pending','requested'].includes(r.status));
    if(active)return res.status(409).json({error:'Já existe uma execução na nuvem. Aguarde a conclusão.',runUrl:active.html_url});
    await gh(workflow+'/dispatches',{method:'POST',body:JSON.stringify({ref:'main',...(scope==='sabedoria-kids'?{inputs:{mode:body.action==='calibrate'?'calibrate':'replenish'}}:{})})});
    return res.status(202).json({accepted:true,message:'Solicitação enviada. A aprovação e a publicação serão conferidas separadamente.',workflowUrl:'https://github.com/marcondesjm/cliente-x-instagram/actions/workflows/'+filename});
   }
   return res.status(400).json({error:'Ação desconhecida.'});
  }catch(error){return res.status(error instanceof SyntaxError?400:error.statusCode||502).json({error:error instanceof SyntaxError?'Solicitação inválida.':error.statusCode?error.message:'Controle temporariamente indisponível. Nenhuma chave foi exibida.'});}
 };
}
export default createClaudeHandler();
