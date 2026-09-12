// Collection health is independent of tomorrow's editorial mix or pack IDs.
export function radarCollectionHealth(config = {}, cache = null, { live = true, now = Date.now() } = {}) {
  const sources = (config.sources || []).filter(source => source?.name && source?.url);
  const timestamp = Date.parse(cache?.researchedAt);
  const validDate = Number.isFinite(timestamp) && timestamp <= now + 300000;
  const maxAgeMs = (Number(config.maxAgeDays) || 30) * 86400000;
  const candidates = (Array.isArray(cache?.packs) ? cache.packs : []).filter(pack => {
    const r = pack?.research;
    const published = Date.parse(r?.publishedAt);
    return r?.source && r?.sourceTitle && r?.sourceFact && /^https?:\/\//.test(r?.sourceUrl || '')
      && Number.isFinite(published) && published <= now + 300000 && now - published <= maxAgeMs;
  });
  const articleCount = new Set(candidates.map(pack => pack.research.sourceUrl)).size;
  const sourceCount = new Set(candidates.map(pack => pack.research.source)).size;
  const evidence = { researchedAt: validDate ? cache.researchedAt : null, articleCount, sourceCount, live };
  const result = (status, label, message) => ({ ...evidence, status, label, message });
  if (!config.enabled) return result('disabled', 'Radar desativado', 'O Radar está desativado para esta conta.');
  if (!sources.length) return result('fallback', 'Radar sem fontes', 'Cadastre fontes para pesquisar notícias.');
  if (!live) return result('unverified', 'Coleta não confirmada', 'Não foi possível conferir a coleta remota agora. Isso não confirma uma falha do Radar; tente atualizar o painel.');
  if (!validDate) return result('fallback', 'Radar sem coleta confirmada', 'Ainda não há uma coleta com data válida registrada. Atualize as notícias e confira as fontes.');
  const when = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(timestamp));
  if (now - timestamp > 48 * 3600000) return result('fallback', 'Coleta desatualizada', `Última coleta registrada em ${when} (Brasília), há mais de 48 horas. Atualize as notícias e confira as fontes.`);
  if (!articleCount) return result('fallback', 'Radar sem notícias na janela', `Coleta registrada em ${when} (Brasília), sem notícias com fonte e data válidas na janela configurada.`);
  return result('working', 'Radar com coleta recente', `Coleta registrada em ${when} (Brasília): ${articleCount} notícias de ${sourceCount} fontes. A pauta final passa pelas verificações de qualidade e repetição no horário da publicação.`);
}

export async function loadRadarCollectionHealth(config, accountKey, { fetchImpl = fetch, now = Date.now() } = {}) {
  if (!config.enabled) return radarCollectionHealth(config, null, { now });
  try {
    const response = await fetchImpl(`https://raw.githubusercontent.com/marcondesjm/cliente-x-instagram/main/automation/instagram-template/config/radar-cache.json?v=${now}`, {
      cache: 'no-store', headers: { accept: 'application/json', 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const stored = await response.json();
    return radarCollectionHealth(config, stored?.[accountKey], { now });
  } catch {
    return radarCollectionHealth(config, null, { live: false, now });
  }
}
