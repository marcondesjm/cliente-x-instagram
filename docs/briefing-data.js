import { normalizeBriefingLogo } from './briefing-logo.js';

export function normalizeBriefing(input) {
  if (input?.schema !== 'instagram-client-briefing' || input.version !== 1) throw new Error('Arquivo de briefing inválido ou versão incompatível.');
  const data = { schema: input.schema, version: 1 };
  if (input.logoAttachment != null) data.logoAttachment = normalizeBriefingLogo(input.logoAttachment);
  for (const key of ['username','brand','contact','email','whatsapp','niche','audience','offer','preferences','sources','logo','colors']) {
    data[key] = String(input[key] || '').trim();
    if (data[key].length > 5000) throw new Error('Um dos campos ultrapassa o limite de 5.000 caracteres.');
  }
  let username = data.username.replace(/^@/, '');
  if (/^https?:/i.test(username)) {
    const url = new URL(username);
    if (!['instagram.com','www.instagram.com'].includes(url.hostname) || url.pathname.split('/').filter(Boolean).length !== 1) throw new Error('Informe o link do perfil do Instagram.');
    username = url.pathname.split('/').filter(Boolean)[0];
  }
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username) || ['p','reel','reels','stories','explore','accounts'].includes(username.toLowerCase())) throw new Error('Informe um @ válido do Instagram.');
  data.username = username.toLowerCase();
  for (const key of ['brand','niche','audience','offer']) if (!data[key]) throw new Error('Preencha nome da marca, nicho, público e conteúdo ou oferta principal.');
  data.goal = ['authority','leads','offer','personalBrand','reactivation'].includes(input.goal) ? input.goal : 'authority';
  data.tone = ['consultivo','autoridade','educativo','provocativo'].includes(input.tone) ? input.tone : 'educativo';
  data.postsPerDay = Number(input.postsPerDay);
  const allowedFormats = ['feed', 'reels', 'stories'];
  if (input.formats !== undefined && (!Array.isArray(input.formats) || !input.formats.length || input.formats.some(value => !allowedFormats.includes(value)))) throw new Error('Escolha onde deseja publicar: Feed, Reels ou Stories.');
  if (input.formats !== undefined) data.formats = [...new Set(input.formats)];
  if (!Number.isInteger(data.postsPerDay) || data.postsPerDay < 1 || data.postsPerDay > 24) throw new Error('Informe de 1 a 24 publicações por dia.');
  data.times = (Array.isArray(input.times) ? input.times : String(input.times || '').split(/[,;\n]+/)).map(value => String(value).trim()).filter(Boolean);
  if (data.times.length > 24 || data.times.some(value => !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) || new Set(data.times).size !== data.times.length) throw new Error('Use horários únicos no formato 07:00, 12:00.');
  if (data.times.length && data.times.length !== data.postsPerDay) throw new Error('A quantidade de horários deve corresponder às publicações por dia. Deixe em branco para combinar depois.');
  for (const value of [data.logo, ...data.sources.split('\n')].filter(Boolean)) {
    let url;
    try { url = new URL(value); } catch { throw new Error('Use links completos nas fontes e no logotipo.'); }
    if (url.protocol !== 'https:') throw new Error('Use links HTTPS nas fontes e no logotipo.');
  }
  return data;
}

export function briefingNotes(data) {
  const names = { feed: 'Feed (imagem ou carrossel)', reels: 'Reels (vídeo curto)', stories: 'Stories' };
  const logo = data.logoAttachment ? `Anexo: ${data.logoAttachment.name}${data.logo ? `; link: ${data.logo}` : ''}` : data.logo || 'Não informado';
  return [`BRIEFING — ${data.brand}`, `Instagram: @${data.username}`, `Onde publicar (preferência a revisar): ${(data.formats || []).map(value => names[value]).join(', ') || 'A combinar'}`, `Publicações desejadas por dia (total entre os formatos): ${data.postsPerDay}`, `Horários (Brasília): ${data.times.join(', ') || 'A combinar'}`, `Distribuição por formato e horário: a definir na revisão da programação.`, `Logotipo: ${logo}`, `Cores: ${data.colors || 'A combinar'}`, `Fontes indicadas pelo cliente (revisar licença e adequação):\n${data.sources || 'Não informadas'}`, `Preferências e assuntos a evitar:\n${data.preferences || 'Não informados'}`].join('\n\n');
}
