import { decodeHTMLStrict } from 'entities';

const API = 'https://commons.wikimedia.org/w/api.php';
export const WIKIMEDIA_USER_AGENT = 'MJM-Digital-NewsRadar/1.0 (https://github.com/marcondesjm/cliente-x-instagram)';

const subjects = [
  [/\b(?:chips? (?:de|para) (?:ia|inteligencia artificial)|aceleradores? (?:de|para) (?:ia|inteligencia artificial)|ai accelerator)\b/, 'AI accelerator', /\bai accelerator\b/],
  [/\b(?:computadores? quantic[oa]s?|computacao quantica|quantum comput\w*)\b/, 'quantum computer', /\bquantum comput\w*\b/],
  [/\b(?:centros? de dados|datacenters?|data cent(?:er|re)s?)\b/, 'data center', /\b(?:data cent(?:er|re)|datacenter|server room)s?\b/],
  [/\b(?:supercomput\w*|supercomputacao)\b/, 'supercomputer', /\bsupercomput\w*\b/],
  [/\b(?:semicondutores?|semiconductors?|microchips?)\b/, 'semiconductor wafer', /\b(?:semiconductor|silicon)\b.*\bwafer\b|\bwafer\b.*\b(?:semiconductor|silicon)\b/],
  [/\b(?:robos? industria\w*|industrial robots?|robotica industrial)\b/, 'industrial robot', /\b(?:industrial robot|robotic arm)s?\b/]
];

function normalized(text = '') {
  return String(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function httpsUrl(value, host, prefix) {
  try {
    const url = new URL(value);
    return url.origin === `https://${host}` && !url.username && !url.password && url.pathname.startsWith(prefix)
      ? url.href : '';
  } catch {
    return '';
  }
}

function metadataText(value = '') {
  return decodeHTMLStrict(String(value).replace(/<[^>]*>/g, '')).replace(/[\s\p{Cc}\p{Cf}]+/gu, ' ').trim();
}

function photoCandidate(page, subject) {
  const info = page.imageinfo?.[0];
  if (!info || info.mime !== 'image/jpeg' || info.width < 800 || info.height < 450) return null;
  const title = normalized(page.title);
  if (!subject.test(title) || /\b(?:logo|icon|diagram|drawing|render|simulation|screenshot|portrait|selfie|people|team|graph|poster|sign|airship|protest|topological|supercomputer center)\b/.test(title)) return null;

  const meta = info.extmetadata || {};
  const license = metadataText(meta.LicenseShortName?.value);
  const reportedLicense = String(meta.LicenseUrl?.value || '').replace(/^http:/, 'https:');
  const canonicalPath = /^CC BY (?:2\.0|2\.5|3\.0|4\.0)$/.test(license)
    ? `/licenses/by/${license.split(' ').at(-1)}`
    : license === 'CC0' ? '/publicdomain/zero/1.0' : '';
  const reportedUrl = httpsUrl(reportedLicense, 'creativecommons.org', '/');
  const acceptedLicense = canonicalPath && reportedUrl
    && new URL(reportedUrl).pathname.replace(/\/deed(?:\.[a-z-]+)?\/?$|\/$/i, '') === canonicalPath;
  const licenseUrl = `https://creativecommons.org${canonicalPath}/`;
  const creator = metadataText(meta.Artist?.value);
  if (!acceptedLicense || metadataText(meta.Restrictions?.value) || !creator || creator.length > 90
    || /^(?:unknown|desconhecido|anônimo|anonymous|see below|own work)$/i.test(creator)) return null;

  const thumbnail = httpsUrl(info.thumburl, 'thumb.wikimedia.org', '/wikipedia/commons/thumb/')
    || httpsUrl(info.thumburl, 'upload.wikimedia.org', '/wikipedia/commons/thumb/');
  const imageUrl = thumbnail || httpsUrl(info.url, 'upload.wikimedia.org', '/wikipedia/commons/');
  const imageSourcePageUrl = httpsUrl(info.descriptionurl, 'commons.wikimedia.org', '/wiki/File:');
  if (!imageUrl || !imageSourcePageUrl) return null;
  return {
    imageUrl: imageUrl.split('?')[0],
    imageSourcePageUrl,
    imageCredit: creator,
    imageLicense: license,
    imageLicenseUrl: licenseUrl,
    imageIllustrative: true,
    imageEvidence: 'Foto ilustrativa do assunto no Wikimedia Commons.'
  };
}

export async function searchWikimediaEditorialPhotos(research, { fetchImpl = fetch, signal = AbortSignal.timeout(4500) } = {}) {
  const headline = normalized(research?.sourceTitle);
  const topic = subjects.find(([match]) => match.test(headline));
  if (!topic) return [];
  const [, phrase, subject] = topic;
  const url = new URL(API);
  url.search = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `intitle:"${phrase}" filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl|Restrictions',
    iiurlwidth: '1200',
    format: 'json',
    formatversion: '2',
    maxlag: '5'
  });
  try {
    const response = await fetchImpl(url, {
      headers: { accept: 'application/json', 'user-agent': WIKIMEDIA_USER_AGENT },
      redirect: 'error',
      signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error.code || 'erro na consulta');
    return (payload.query?.pages || []).sort((a, b) => a.index - b.index)
      .map(page => photoCandidate(page, subject)).filter(Boolean);
  } catch (error) {
    console.warn(`Wikimedia Commons indisponível para o radar: ${error.message}`);
    return [];
  }
}

export function wikimediaPhotoCaption(photo) {
  return photo?.imageIllustrative
    ? `Foto ilustrativa: ${photo.imageCredit} / Wikimedia Commons (${photo.imageLicense}). Imagem adaptada ao layout. Arquivo: ${photo.imageSourcePageUrl} · Licença: ${photo.imageLicenseUrl}`
    : '';
}
