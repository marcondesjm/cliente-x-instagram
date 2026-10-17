import fs from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash, scenePrompt, candidateDigest, canRequest, requestIllustration, checkApproval, sourceRevision } from '../lib/kids-illustration-generation.js';
import { packContentFingerprint } from '../lib/scheduled-content-guard.js';
import { bibleVisualIssues } from '../lib/bible-visual-standard.js';
import { persistState } from './persist-instagram-state.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(ROOT);
const CONFIG='automation/instagram-template/config/';
const QUEUE=CONFIG+'kids-illustration-queue.json';
const PACKS=CONFIG+'content-packs.json';
const read=path=>JSON.parse(fs.readFileSync(path,'utf8').replace(/^\uFEFF/,''));
const write=(path,data)=>fs.writeFileSync(path,JSON.stringify(data,null,2)+'\n');
const arg=name=>process.argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3);
const queue=read(QUEUE);
const groups=read(PACKS);
const packs=groups.find(g=>g.account==='sabedoria-kids').packs;
const history=read(CONFIG+'publication-history.json')['sabedoria-kids'] || [];
const used=pack=>history.some(x=>x.feedFingerprint===packContentFingerprint(pack) || x.coverTitle===pack.slides[0].title);
const plans=read(CONFIG+'kids-illustration-plans.json');
const save=(paths=[QUEUE])=>{
  write(QUEUE,queue);
  if(process.argv.includes('--persist')) {
    const assets=queue.flatMap(x=>x.images || []).map(x=>x.path).filter(x=>fs.existsSync(x));
    persistState(paths,assets);
  }
};

if(arg('approve')) {
  const candidate=queue.find(x=>x.id===arg('approve'));
  const pack=packs.find(x=>x.id===candidate?.packId);
  if(!candidate || !pack || !arg('reviewer') || !process.argv.includes('--bible-and-visual-reviewed')) throw new Error('Informe lote, revisor e confirmação da revisão bíblica/visual.');
  checkApproval(candidate,arg('digest'),pack,packContentFingerprint,path=>fs.readFileSync(path));
  if(used(pack)) throw new Error('Pauta já publicada; lote não será ativado.');
  const now=new Date().toISOString();
  pack.slides.forEach((slide,i)=>Object.assign(slide,{imagePath:candidate.images[i].path,imageLayout:'bible-illustration',imageAsIllustration:true,typographicOnly:false}));
  pack.storySlide={...pack.storySlide,imagePath:candidate.images.at(-1).path,imageLayout:'bible-illustration',imageAsIllustration:true,typographicOnly:false};
  pack.illustrationSource={sourceUrl:'https://developers.openai.com/api/docs/guides/image-generation',creator:'Ilustração editorial gerada por IA para Sabedoria Kids',license:'Imagem gerada por IA; uso sujeito aos termos do serviço, sem licença CC atribuída',reviewedAt:now,generation:{status:'approved',reviewer:arg('reviewer'),digest:candidateDigest(candidate),model:'gpt-image-2'}};
  pack.caption+='\n\nIlustrações editoriais geradas por inteligência artificial e revisadas; representações interpretativas da passagem bíblica.';
  candidate.status='approved'; candidate.reviewedAt=now; candidate.reviewer=arg('reviewer');
  write(PACKS,groups); save([QUEUE,PACKS]);
  console.log(`Lote ${candidate.id} aprovado para o acervo; nenhuma publicação foi disparada.`);
} else {
  const plan=plans.find(p=>{
    const pack=packs.find(x=>x.id===p.packId);
    return pack && !used(pack) && bibleVisualIssues(pack,x=>fs.existsSync(x)).length && !queue.some(q=>q.packId===p.packId && ['pending_review','approved','needs_attention'].includes(q.status));
  });
  if(!plan) { console.log('Nenhum roteiro revisado disponível para preparar.'); process.exit(0); }
  const pack=packs.find(x=>x.id===plan.packId);
  if(plan.reference!==pack.biblicalReference || plan.scenes.length!==pack.slides.length+1 || new Set(plan.scenes).size!==plan.scenes.length) throw new Error('Roteiro incompatível com a pauta.');
  const planHash=hash({plan,pack:packContentFingerprint(pack),promptVersion:1});
  const id=`${pack.id}-${planHash.slice(0,12)}`;
  let candidate=queue.find(x=>x.id===id);
  if(candidate && candidate.planHash!==planHash) throw new Error('Roteiro mudou durante o lote.');
  if(process.argv.includes('--plan')) {
    console.log(JSON.stringify({id,title:pack.slides[0].title,reference:plan.reference,images:plan.scenes.length,status:'planning_only',prompts:plan.scenes.map((s,i)=>scenePrompt(pack,s,i))},null,2)); process.exit(0);
  }
  const limit=Number(process.env.KIDS_AI_MAX_IMAGES_PER_DAY || 0);
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(!process.env.KIDS_OPENAI_API_KEY || !canRequest(queue,day,limit)) {
    console.log('Geração aguardando KIDS_OPENAI_API_KEY e KIDS_AI_MAX_IMAGES_PER_DAY (1 a 12). Nenhuma chamada paga realizada.'); process.exit(0);
  }
  if(!candidate) { candidate={id,packId:pack.id,title:pack.slides[0].title,reference:pack.biblicalReference,sourceFingerprint:packContentFingerprint(pack),sourceRevision:sourceRevision(pack),planHash,status:'preparing',images:[],attempts:[],workflowRun:process.env.GITHUB_RUN_ID || null}; queue.push(candidate); }
  // An interrupted request might already have been billed: stop for reconciliation.
  if(candidate.attempts.some(x=>x.status==='reserved')) throw new Error('Há uma tentativa interrompida; conferir antes de gerar novamente.');
  for(let i=candidate.images.length;i<plan.scenes.length;i++) {
    if(!canRequest(queue,day,limit)) { console.log('Limite diário atingido; lote continuará em outro dia.'); break; }
    const prompt=scenePrompt(pack,plan.scenes[i],i);
    const attempt={id:`${id}-${i}`,day,status:'reserved',createdAt:new Date().toISOString()};
    candidate.attempts.push(attempt); save(); // persist budget reservation BEFORE paid request
    try {
      const {bytes,usage}=await requestIllustration(prompt,{apiKey:process.env.KIDS_OPENAI_API_KEY});
      const sha256=hash(bytes);
      if(candidate.images.some(x=>x.sha256===sha256)) throw new Error('Imagem repetida recebida; revisar o lote.');
      const path=`docs/illustrations/sabedoria-kids/generated/${id}/${i+1}-${sha256.slice(0,12)}.png`;
      fs.mkdirSync(dirname(path),{recursive:true}); fs.writeFileSync(path,bytes);
      candidate.images.push({id:String(i+1),path,sha256,promptHash:hash(prompt),scene:plan.scenes[i],usage});
      attempt.status='completed';
      candidate.status=candidate.images.length===plan.scenes.length?'pending_review':'preparing';
      if(candidate.status==='pending_review') candidate.digest=candidateDigest(candidate);
    } catch(error) {
      attempt.status='failed'; candidate.status='needs_attention'; candidate.error=error.message; save(); throw error;
    }
    save();
  }
  console.log(`Lote ${candidate.id}: ${candidate.status}; ${candidate.images.length}/${plan.scenes.length} imagens. Não publicado.`);
}
