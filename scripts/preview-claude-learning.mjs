import fs from 'node:fs';
import {chromium} from 'playwright';
const html=fs.readFileSync('docs/dashboard.html','utf8');
const styles=html.match(/<style[\s\S]*?<\/style>/g).join('');
const fn=html.slice(html.indexOf('    function renderPerformanceLearning('),html.indexOf('    function renderShowcaseSlide()'));
const stored=JSON.parse(fs.readFileSync('automation/instagram-template/config/performance-insights.json'));
const account=stored.accounts['cliente-x'];
const reserve=JSON.parse(fs.readFileSync('automation/instagram-template/config/authorial-reserve.json'));
const data={available:true,...account.readiness,updatedAt:account.updatedAt,totalMedia:account.samples.length,observedMedia:account.samples.filter(s=>s.observations.length).length,observationCount:account.samples.reduce((n,s)=>n+s.observations.length,0),weeklyGrowth:account.weeklyGrowth,followerGrowth:account.followerGrowthSummary,models:{},windowsHours:[2,24,72],dataSource:'github-main',claudeStrategy:reserve.learningStrategy||null};
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.setContent(styles+'<main class="panel" style="margin:16px"><h2>Aprendizado adaptativo</h2><span id="performanceLearningStatus"></span><div class="capability-grid" id="performanceLearningGrid"></div><div class="message" id="performanceLearningMessage"></div><div class="message" id="claudeLearningDiagnosis" style="white-space:pre-line;overflow-wrap:anywhere"></div></main>');
await page.addScriptTag({content:`const appState={selectedAccount:'cliente-x'};const escapeHtml=v=>String(v??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));const formatNumber=v=>Number(v||0).toLocaleString('pt-BR');const formatDateTime=v=>new Date(v).toLocaleString('pt-BR');${fn}`});
await page.evaluate(data=>renderPerformanceLearning(data),data);
fs.mkdirSync('output/claude-learning',{recursive:true});
for(const [name,width,height] of [['desktop',1280,1000],['mobile',390,844]]){
 await page.setViewportSize({width,height});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth))throw Error('Horizontal overflow: '+name);
 await page.screenshot({path:`output/claude-learning/${name}.png`,fullPage:true});
 await page.locator('#claudeLearningDiagnosis').screenshot({path:`output/claude-learning/${name}-diagnosis.png`});
}
await browser.close();console.log('PASS: performance dashboard rendered desktop/mobile without horizontal overflow. Local stored metrics; no remote mutation.');
