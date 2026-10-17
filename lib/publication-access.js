// A connected client can publish a reviewed manual example before activation.
// Scheduled jobs and paused/billing-blocked clients must keep their normal gates.
export function canPublishAccount(account, env = {}) {
  if (!account.clientProfile || account.clientProfile.status === 'active') return true;
  if (account.clientProfile.status !== 'onboarding' || account.onboarding?.status !== 'connected') return false;
  if (account.clientProfile.billing?.status && account.clientProfile.billing.status !== 'active') return false;
  if (env.INSTAGRAM_TEMPLATE_AUTOMATIC_RUN !== 'false') return false;
  try {
    const pack = JSON.parse(env.INSTAGRAM_TEMPLATE_PACK_JSON || '');
    return Array.isArray(pack.slides) && pack.slides.length > 0 && Boolean(pack.caption?.trim());
  } catch { return false; }
}
