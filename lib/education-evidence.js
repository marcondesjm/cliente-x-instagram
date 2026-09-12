const dateBrt = date => new Date(date).toLocaleDateString('en-CA', {timeZone:'America/Sao_Paulo'});
const median = values => { if (!values.length) return null; const v = values.slice().sort((a,b)=>a-b); const m = Math.floor(v.length/2); return v.length % 2 ? v[m] : (v[m-1]+v[m])/2; };
export function educationEvidence(samples = [], startDate = '2026-09-13', collectedAt = null) {
  const start = Date.parse(`${startDate}T00:00:00-03:00`);
  const end = start + 14*86400000, before = start - 14*86400000;
  const observations = [];
  for (const sample of samples) {
    const published = Date.parse(sample.publishedAt);
    if (!sample.mediaId || !Number.isFinite(published) || published < before || published >= end) continue;
    for (const window of [24,72]) {
      const valid = (sample.observations || []).filter(o => Number(o.windowHours) === window && Number.isFinite(o.ageHours) && o.ageHours >= window && o.ageHours <= (window === 24 ? 36 : 96)).sort((a,b)=>a.ageHours-b.ageHours)[0];
      if (!valid) continue;
      observations.push({ mediaId:String(sample.mediaId), publishedAt:sample.publishedAt, period:published < start ? 'before' : 'after', format:sample.mediaProductType || sample.learningContext?.format || 'UNKNOWN', window, collectedAt:valid.collectedAt, metrics:valid.metrics || {} });
    }
  }
  const unique = [...new Map(observations.map(o=>[`${o.mediaId}:${o.window}`,o])).values()];
  const groups = [...new Set(unique.map(o=>`${o.format}:${o.window}`))].map(key => {
    const [format, window] = key.split(':');
    const periods = {};
    for (const period of ['before','after']) {
      const rows = unique.filter(o=>o.format===format && o.window===Number(window) && o.period===period);
      periods[period] = { posts:rows.length, metrics:{} };
      for (const metric of ['views','reach','saved','shares']) {
        const values = rows.map(o=>o.metrics[metric]).filter(v=>typeof v==='number' && Number.isFinite(v) && v>=0);
        periods[period].metrics[metric] = { median:median(values), observed:values.length };
      }
    }
    return {format, window:Number(window), ...periods};
  });
  return { startDate, endDate:dateBrt(end-1), baselineStart:dateBrt(before), baselineEnd:dateBrt(start-1), collectedAt, groups, observations:unique };
}
