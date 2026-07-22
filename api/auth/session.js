import { configuredAdminEmail, getSession, hasAdminConfig } from '../_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo nao permitido.' });
    return;
  }

  const session = getSession(req);
  res.setHeader('cache-control', 'no-store');
  res.status(200).json({
    authenticated: Boolean(session),
    email: session?.email || null,
    adminConfigured: hasAdminConfig(),
    adminEmail: configuredAdminEmail() || null
  });
}
