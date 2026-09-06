import { createHash } from 'node:crypto';

export function normalizeContentFingerprint(value = '') {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/#\S+/g, ' ')
    .replace(/\b(?:serie pratica|edicao operacional|slot|run)\b[^\n.]*/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function packContentFingerprint(pack = {}) {
  const content = (pack.slides || []).map((slide) => ({
    eyebrow: normalizeContentFingerprint(slide.eyebrow),
    title: normalizeContentFingerprint(slide.title),
    body: normalizeContentFingerprint(slide.body)
  }));
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

export function isDuplicateContentError(text = '') {
  return /conte[uú]do repetido|duplicate|duplicad/i.test(text);
}

export function scheduledDuplicate(pack, history = []) {
  if (!pack?.slides?.length) return null;
  const fingerprint = packContentFingerprint(pack);
  const title = normalizeContentFingerprint(pack.slides[0].title);
  return history.find((entry) =>
    (entry.mediaId && (entry.feedFingerprint === fingerprint ||
      (title && normalizeContentFingerprint(entry.coverTitle) === title))) ||
    (entry.storyMediaId && (entry.storyFingerprint === fingerprint ||
      (title && normalizeContentFingerprint(entry.storyCoverTitle) === title)))) || null;
}

export function availableBookStoryPacks(posts = []) {
  // A future or retryable scheduled item owns its content until it is handled.
  return posts.filter((post) => post.status === 'published')
    .map((post) => post.pack).filter((pack) => pack?.authoredBook && pack.slides?.length);
}

export function reconcileScheduledDuplicates(posts, history, errors, account, now = new Date()) {
  let changed = false;
  for (const post of posts) {
    if (Date.parse(post.scheduledFor) > now.getTime()) continue;
    if (post.status !== 'pending' && !(post.status === 'failed' && isDuplicateContentError(post.error))) continue;
    const duplicate = scheduledDuplicate(post.pack, history);
    if (!duplicate) continue;
    post.status = 'skipped_duplicate';
    post.skippedAt = now.toISOString();
    post.skipReason = 'Conteudo ja utilizado; fila liberada sem republicar.';
    post.duplicatePublication = {
      publishedAt: duplicate.publishedAt,
      mediaId: duplicate.mediaId || null,
      storyMediaId: duplicate.storyMediaId || null,
      permalink: duplicate.permalink || null
    };
    changed = true;
    for (const entry of errors) {
      const samePost = entry.scheduledPostId === post.id ||
        (entry.scheduledAt && Date.parse(entry.scheduledAt) === Date.parse(post.scheduledFor));
      if (entry.account !== account || entry.status !== 'open' || !samePost || !isDuplicateContentError(entry.error)) continue;
      Object.assign(entry, { status: 'resolved', stage: 'content-selection', slotIndex: null,
        scheduledPostId: post.id, resolvedAt: now.toISOString(),
        resolution: 'scheduled-duplicate-skipped', duplicatePublication: post.duplicatePublication,
        solution: post.skipReason });
    }
  }
  return changed;
}
