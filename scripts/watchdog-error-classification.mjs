export function isMetaInternalPublishError(errorText = '', stage = '') {
  const text = `${stage} ${errorText}`.toLowerCase();
  return /media_publish/.test(text)
    && (/error_subcode["':\s]+2207085/.test(text)
      || (/erro interno gen[eé]rico|internal server error/.test(text) && /code["':\s]+-1/.test(text)));
}

export function isMetaCredentialError(errorText = '', stage = '') {
  const text = `${stage} ${errorText}`.toLowerCase();
  return /session has expired|error validating access token|access token has expired|invalid oauth access token/.test(text)
    || /code["':\s]+190/.test(text)
    || /error_subcode["':\s]+463/.test(text);
}

export function solutionForWatchdogError(errorText = '', stage = '') {
  const text = `${stage} ${errorText}`.toLowerCase();
  if (isMetaInternalPublishError(errorText, stage)) {
    return 'A Meta apresentou erro interno ao concluir o Reel. O vigia valida o container, confirma que a midia nao apareceu no perfil e recupera o mesmo conteudo como carrossel; renovar o token somente se a validacao retornar erro 190/463.';
  }
  if (/ffmpeg|spawnsync\s+ffmpeg\s+enoent/.test(text)) {
    return 'O vigia deve instalar e validar o FFmpeg para qualquer fila pendente antes de gerar Reel; a proxima publicacao bem-sucedida encerra este alerta automaticamente.';
  }
  if (/caption too long|caption was too long|legenda muito longa|36004|2207010/.test(text)) {
    return 'Reduzir a legenda final antes de publicar, preservar a fonte oficial e rodar validar textos antes de recuperar o slot.';
  }
  if (/radar ativo.*nenhuma pauta oficial|nenhuma pauta oficial.*nao repetida|nenhuma pauta oficial.*não repetida/.test(text)) {
    return 'Recuperar o slot com a reserva editorial propria e inedita. O fluxo automatico nao deve renovar token nem repetir ou inventar uma fonte jornalistica.';
  }
  if (/update is not a fast forward/.test(text)) {
    return 'Concorrencia temporaria ao hospedar a midia. O publicador rele o HEAD e tenta novamente automaticamente; se todas as tentativas falharem, o vigia recupera o slot sem duplicar a publicacao.';
  }
  if (isMetaCredentialError(errorText, stage) || /permission|permiss/.test(text)) {
    return 'Gerar novo token Meta/Instagram, atualizar o secret da conta no Vercel e no GitHub, depois rodar validar acessos no painel.';
  }
  if (/conta errada|expectedusername|username|user_id|user id/.test(text)) {
    return 'Conferir se o Instagram User ID e o token pertencem ao mesmo @ configurado em accounts.json.';
  }
  if (/imgbb|upload/.test(text)) {
    return 'Validar ou trocar IMGBB_API_KEY no painel, salvar no Vercel/GitHub Secrets e redeployar se necessário.';
  }
  if (/mojibake|acento|validate copy|caption|texto|slide/.test(text)) {
    return 'Corrigir o texto do pack indicado no painel, rodar validar textos e salvar antes da próxima publicação.';
  }
  if (/playwright|chromium|browser/.test(text)) {
    return 'Reexecutar o workflow; se repetir, conferir instalação do Playwright no GitHub Actions.';
  }
  if (/duplicate|duplicad/.test(text)) {
    return 'Adicionar ou editar packs com captions novas para evitar bloqueio por conteúdo repetido.';
  }
  return 'Abrir o run do GitHub Actions, copiar a etapa que falhou e corrigir o conteúdo ou dependência indicada antes da próxima tentativa.';
}
