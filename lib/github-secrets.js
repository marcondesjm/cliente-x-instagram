import sodium from 'libsodium-wrappers';

export async function saveInstagramGithubSecrets(account, token, userId, githubToken = process.env.GITHUB_TOKEN, fetcher = fetch) {
  if (!githubToken) throw new Error('GitHub não configurado para a publicação automática.');
  const base = 'https://api.github.com/repos/marcondesjm/cliente-x-instagram/actions/secrets';
  const headers = { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
  const response = await fetcher(`${base}/public-key`, { headers });
  if (!response.ok) throw new Error(`GitHub recusou a configuração dos secrets da conta (HTTP ${response.status}).`);
  const key = await response.json();
  await sodium.ready;
  const publicKey = sodium.from_base64(key.key, sodium.base64_variants.ORIGINAL);
  for (const [name, value] of [[account.accessTokenEnv, token], [account.userIdEnv, String(userId)]]) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(name || '') || !value) throw new Error('Configuração de secrets da conta inválida.');
    const encrypted = sodium.to_base64(sodium.crypto_box_seal(sodium.from_string(value), publicKey), sodium.base64_variants.ORIGINAL);
    const saved = await fetcher(`${base}/${name}`, { method: 'PUT', headers, body: JSON.stringify({key_id:key.key_id, encrypted_value:encrypted}) });
    if (!saved.ok) throw new Error(`GitHub recusou o secret ${name} (HTTP ${saved.status}).`);
  }
}
