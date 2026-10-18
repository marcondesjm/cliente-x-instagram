import fs from 'node:fs';
import {persistState} from './persist-instagram-state.mjs';
import {recoveryPlan} from '../lib/authorial-recovery.js';
import {isAuthorialShortage} from '../lib/authorial-recovery.js';
import {solutionForWatchdogError} from './watchdog-error-classification.mjs';
const C='automation/instagram-template/config/',P=C+'authorial-reserve.json',read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const state=read(P),previous=JSON.stringify(state),errors=read(C+'watchdog-errors.json'),oldErrors=JSON.stringify(errors),plan=recoveryPlan({state,budget:read(C+'editorial-api-validation.json'),history:read(C+'publication-history.json')['cliente-x']||[],errors,readAsset:p=>fs.readFileSync(p),event:process.env.GITHUB_EVENT_NAME||'schedule'});
const prior=state.automaticRecovery;
state.automaticRecovery={...state.automaticRecovery,...plan,checkedAt:new Date().toISOString(),workflowRun:process.env.GITHUB_RUN_ID||null};
if(prior&&['pending','pendingSlot','available','recoveryReady','run','phase','nextAttemptAt'].every(k=>JSON.stringify(prior[k])===JSON.stringify(plan[k])))state.automaticRecovery=prior;
if(plan.phase==='waiting_daily_budget'){state.health='daily_limit';state.message='Reposição automática aguarda a renovação diária da cota; será retomada pelo agendamento, sem ação manual.';}
for(const e of errors)if(isAuthorialShortage(e))e.solution=solutionForWatchdogError(e.error,e.stage);
const changed=[];if(JSON.stringify(state)!==previous)changed.push(P);
if(JSON.stringify(errors)!==oldErrors)changed.push(C+'watchdog-errors.json');
if(process.argv.includes('--persist')&&changed.length){for(const p of changed)fs.writeFileSync(p,JSON.stringify(p===P?state:errors,null,2)+'\n');persistState(changed);}
if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`run=${plan.run}\nrecovery_ready=${plan.recoveryReady}\nphase=${plan.phase}\n`);
console.log(JSON.stringify(plan));
