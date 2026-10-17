import { educationTopic } from './education-learning.js';
const educational = row => row.education?.strategy === 'educacao-negocios-v1';
const inWindow = (row, now) => {const age=now-Date.parse(row.publishedAt);return Number.isFinite(age)&&age>=0&&age<=42*86400000;};
export function collectionHistory(history, exclusions = new Set(), now = Date.now()) {
  const valid=history.filter(row=>row.mediaId&&row.publishedAt&&!exclusions.has(String(row.mediaId)));
  return [...new Map([...valid.slice(-60),...valid.filter(row=>educational(row)&&inWindow(row,now))].map(row=>[String(row.mediaId),row])).values()];
}
export function retainPerformanceSamples(samples, exclusions = new Set(), now = Date.now()) {
  const sorted=samples.filter(row=>!exclusions.has(String(row.mediaId))).sort((a,b)=>Date.parse(a.publishedAt)-Date.parse(b.publishedAt));
  return [...new Map([...sorted.slice(-120),...sorted.filter(row=>{const age=now-Date.parse(row.publishedAt);return Number.isFinite(age)&&age>=0&&(age<=28*86400000||(educational(row)&&inWindow(row,now)));})].map(row=>[String(row.mediaId),row])).values()].sort((a,b)=>Date.parse(a.publishedAt)-Date.parse(b.publishedAt));
}
export function educationCollectionDiagnostics(samples = [], history = [], now = Date.now()) {
  const published=history.filter(row=>educational(row)&&row.mediaId);
  const tutorials=published.filter(row=>row.education.kind==='tutorial');
  const tracked=samples.filter(row=>educational(row)&&row.education.kind==='tutorial');
  const ids=new Set(tracked.map(row=>String(row.mediaId)));
  const reasons={waiting:0,missingWindow:0,missingMetrics:0,lowReach:0,otherFormat:0,unmappedTopic:0,outsideWindow:0};
  for(const row of tracked){
    const age=(now-Date.parse(row.publishedAt))/3600000;
    if(!Number.isFinite(age)||age<0||age>42*24){reasons.outsideWindow++;continue;}
    if(row.mediaProductType!=='FEED'){reasons.otherFormat++;continue;}
    if(!educationTopic(row.education.lessonId)){reasons.unmappedTopic++;continue;}
    if(age<24){reasons.waiting++;continue;}
    const observation=(row.observations||[]).find(o=>{const hours=(Date.parse(o.collectedAt)-Date.parse(row.publishedAt))/3600000;return o.windowHours===24&&o.ageHours>=24&&o.ageHours<=36&&Date.parse(o.collectedAt)<=now&&hours>=24&&hours<=36&&Math.abs(hours-o.ageHours)<=1;});
    if(!observation){reasons.missingWindow++;continue;}
    const m=observation.metrics||{};
    if(!['reach','saved','shares','comments'].every(key=>typeof m[key]==='number'&&Number.isFinite(m[key])&&m[key]>=0)){reasons.missingMetrics++;continue;}
    if(m.reach<20)reasons.lowReach++;
  }
  return {publishedEducational:published.length,publishedTutorials:tutorials.length,trackedTutorials:tracked.length,missingFromSamples:tutorials.filter(row=>!ids.has(String(row.mediaId))).length,totalSamples:samples.length,reasons};
}
