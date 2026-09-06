export function brtDate(value = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}
export function upsertFollowerSnapshot(state = {}, followers, collectedAt = new Date().toISOString()) {
  if (!Number.isInteger(followers) || followers < 0) throw new Error('Contagem de seguidores ausente ou inválida.');
  const date = brtDate(collectedAt);
  const days = [...(state.days || [])];
  const index = days.findIndex(d => d.date === date);
  const previous = index >= 0 ? days[index] : null;
  const entry = { date, firstCollectedAt: previous?.firstCollectedAt || collectedAt,
    firstFollowers: previous?.firstFollowers ?? followers, collectedAt, followers };
  if (index >= 0) days[index] = entry; else days.push(entry);
  days.sort((a,b) => a.date.localeCompare(b.date));
  return { ...state, days: days.slice(-120), status: 'available', lastError: null, lastAttemptAt: collectedAt };
}
export function followerSummary(state = {}) {
  const days = state.days || [];
  const latest = days.at(-1);
  const previous = days.at(-2);
  const previousDate = latest ? brtDate(Date.parse(`${latest.date}T12:00:00-03:00`) - 86400000) : null;
  const consecutive = previous?.date === previousDate;
  return { status: state.status || 'pending', lastError: state.lastError || null,
    followers: latest?.followers ?? null, collectedAt: latest?.collectedAt || null,
    dailyDelta: consecutive ? latest.followers - previous.followers : null,
    comparisonFrom: consecutive ? previous.collectedAt : null,
    comparisonTo: latest?.collectedAt || null, observedDays: days.length,
    profileVisits: state.profileVisits || null, days,
    attribution: 'account-net-change-not-attributed-to-posts' };
}
export function seriesPerformance(samples = [], seriesId) {
  const unique = [...new Map(samples.filter(s => s.mediaId && s.editorialSeries?.id === seriesId).map(s => [s.mediaId,s])).values()];
  return { seriesId, observedPosts: unique.length, windows: [2,24,72].flatMap(windowHours =>
    ['FEED','REELS'].map(format => {
      const observations = unique.filter(s => s.mediaProductType === format).map(s =>
        (s.observations || []).find(o => o.windowHours === windowHours && o.ageHours >= windowHours && o.ageHours <= windowHours + ({2:3,24:8,72:24}[windowHours]))).filter(Boolean);
      const metric = key => { const values = observations.map(o => o.metrics?.[key]).filter(v => typeof v === 'number' && Number.isFinite(v) && v >= 0); return { availablePosts: values.length, total: values.length ? values.reduce((a,b)=>a+b,0) : null }; };
      return { windowHours, format, posts: observations.length, views: metric('views'), shares: metric('shares'), follows: metric('follows'), profileVisits: metric('profileVisits') };
    })) };
}
