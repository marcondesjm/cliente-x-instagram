export const FACEBOOK_HISTORY_PATH = 'automation/instagram-template/config/facebook-publication-history.json';

export function facebookPublication(entry) {
  const { id, pageId, format, publishedAt, title } = entry || {};
  if (typeof id !== 'string' || typeof pageId !== 'string' || !/^\d+$/.test(pageId) ||
      !['photos', 'reel'].includes(format) || typeof publishedAt !== 'string' || !Number.isFinite(Date.parse(publishedAt))) return null;
  const [prefix, suffix] = id.split('_');
  if (format === 'reel' ? !/^\d+$/.test(id) :
      !/^\d+(?:_\d+)?$/.test(id) || (suffix && prefix !== pageId)) return null;
  const permalink = format === 'reel' ? `https://www.facebook.com/reel/${id}`
    : `https://www.facebook.com/permalink.php?story_fbid=${suffix || id}&id=${pageId}`;
  return { id, pageId, format, publishedAt, title: typeof title === 'string' ? title.trim().slice(0, 180) : '', permalink };
}

export async function loadFacebookPublications(readHistory) {
  try {
    const history = await readHistory();
    if (!Array.isArray(history)) return { available: false, posts: [] };
    const posts = history.map(facebookPublication).filter(Boolean)
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 10);
    return { available: true, posts };
  } catch (error) {
    return { available: error.statusCode === 404, posts: [] };
  }
}
