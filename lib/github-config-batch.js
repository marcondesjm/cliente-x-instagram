// Keep account, content and queue registration atomic. A concurrent main update
// rejects the non-fast-forward ref update without exposing a partial account.
export async function commitConfigBatch(githubJson, parent, files, message) {
  const commit = await githubJson(`git/commits/${parent}`);
  const tree = await githubJson('git/trees', {
    method: 'POST',
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: files.map(file => ({ path: file.path, mode: '100644', type: 'blob', content: `${JSON.stringify(file.data, null, 2)}\n` })) })
  });
  const next = await githubJson('git/commits', { method: 'POST', body: JSON.stringify({ message, tree: tree.sha, parents: [parent] }) });
  try {
    await githubJson('git/refs/heads/main', { method: 'PATCH', body: JSON.stringify({ sha: next.sha, force: false }) });
  } catch (error) {
    if ([409, 422].includes(error.statusCode)) {
      const conflict = new Error('A configuração mudou durante o cadastro. Atualize o painel e tente novamente; nenhum cadastro parcial foi salvo.');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }
  return next.sha;
}
