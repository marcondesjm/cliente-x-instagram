import {englishReference} from './bible-reference.js';
import {dailyCallLimit,dailyInputTokenLimit} from './editorial-daily-budget.js';

export function remainingSceneBudget(state,now=new Date()){
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const used=(state.calls||[]).filter(c=>c.day===day);
 const tokens=used.reduce((n,c)=>n+(Number.isSafeInteger(c.inputTokens)&&c.inputTokens>=0?c.inputTokens:state.policy.maxInputTokensPerCall),0);
 return {maxCallsPerDay:Math.max(0,dailyCallLimit(state,day)-used.length),maxInputTokensPerDay:Math.max(0,dailyInputTokenLimit(state,day)-tokens),maxInputTokensPerCall:state.policy.maxInputTokensPerCall};
}

// Metadata only prioritizes which set to inspect; it never approves an image.
export function sourcePassageCoverage(reference,sourceReference=''){
 let english;try{english=englishReference(reference);}catch{return 0;}
 const required=english.match(/^((?:[1-3] )?[A-Za-z]+) (.+)$/);if(!required)return 0;
 const verses=[];
 for(const part of required[2].split(';')){
  const m=part.trim().match(/^(\d+):(\d+)(?:-(\d+))?$/);if(!m)return 0;
  for(let v=+m[2];v<=+(m[3]||m[2]);v++)verses.push({chapter:+m[1],verse:v});
 }
 const ranges=String(sourceReference).replace(/[–—]/g,'-').split(/[,;]/).map(s=>s.trim().match(/^((?:[1-3] )?[A-Za-z]+)\s+(\d+)(?::(\d+))?(?:\s*-\s*(?:(\d+):)?(\d+))?$/)).filter(m=>m&&m[1].toLowerCase()===required[1].toLowerCase());
 return verses.length?verses.filter(v=>ranges.some(m=>{
  const startChapter=+m[2],endChapter=m[3]?(m[4]?+m[4]:startChapter):+(m[5]||m[2]);
  if(v.chapter<startChapter||v.chapter>endChapter)return false;
  const start=v.chapter===startChapter?+(m[3]||1):1;
  const end=m[3]?(v.chapter===endChapter?+(m[5]||m[3]):176):176;
  return v.verse>=start&&v.verse<=end;
 })).length/verses.length:0;
}

export function retryAllowed(rejection,now=Date.now()){
 if(!rejection)return true;
 if(!rejection.retryAfter)return false;
 if(rejection.kind&&rejection.kind!=='temporary')return false;
 return Number.isFinite(Date.parse(rejection.retryAfter))&&Date.parse(rejection.retryAfter)<=now;
}
