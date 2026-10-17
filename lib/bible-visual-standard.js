export function requiresBibleIllustrations(account = {}) {
  return account.contentProfile?.visualStandard === 'illustrated-bible';
}
export function bibleVisualIssues(pack = {}, assetExists = () => true) {
  const issues = [];
  if (pack.illustrationSource?.generation && (pack.illustrationSource.generation.status !== 'approved' || !pack.illustrationSource.generation.digest || !pack.illustrationSource.generation.reviewer)) issues.push('ilustrações geradas por IA aguardando revisão');
  const slides = pack.slides || [];
  if (!slides.length) issues.push('pauta sem cartões');
  for (const [index, slide] of slides.entries()) {
    if (!slide.imagePath || slide.imageLayout !== 'bible-illustration' || slide.typographicOnly === true || !assetExists(slide.imagePath)) issues.push(`cartão ${index + 1} sem ilustração aprovada disponível`);
  }
  const story = pack.storySlide;
  if (!story?.imagePath || story.imageLayout !== 'bible-illustration' || story.typographicOnly === true || !assetExists(story.imagePath)) issues.push('Story sem ilustração aprovada disponível');
  if (story?.imagePath && story.imagePath === slides[0]?.imagePath) issues.push('Story repete a ilustração da capa');
  if (!pack.illustrationSource?.sourceUrl || !pack.illustrationSource?.license || !pack.illustrationSource?.creator || !pack.illustrationSource?.reviewedAt) issues.push('créditos/licença/revisão das ilustrações ausentes');
  return issues;
}
export function visualReadyPacks(packs, account, assetExists) {
  return requiresBibleIllustrations(account) ? packs.filter(pack => !bibleVisualIssues(pack, assetExists).length) : packs;
}
export function assertBibleVisualStandard(pack, account, assetExists) {
  if (!requiresBibleIllustrations(account)) return;
  const issues = bibleVisualIssues(pack, assetExists);
  if (issues.length) throw Object.assign(new Error(`Padrão ilustrado bíblico obrigatório: ${issues.join('; ')}. Pauta pendente de ilustração; nenhum cartão vazio será publicado.`), {stage:'bible-visual-standard'});
}
