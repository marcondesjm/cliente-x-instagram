# Biblioteca de fotos: Pinterest e Vecteezy

Na conta Marcondes, abra Conteúdo → Biblioteca de fotos, ou /docs/licensed-media.html. Disponível ao administrador principal, pela sessão atual do painel. Não solicita senha de Pinterest ou Vecteezy e não conecta essas contas por OAuth.

1. Abra a pesquisa do Pinterest ou Vecteezy pelo botão da biblioteca. Faça login no próprio site, se necessário, e baixe o arquivo pela opção normal.
2. Confira a autorização comercial para o projeto, autor, crédito completo e eventuais autorizações de pessoas/marcas. Pinterest exige localizar a fonte original. No Vecteezy, excluir Editorial Use Only e respeitar o projeto autorizado por download.
3. Selecione o conteúdo de destino, informe os links da origem e da licença, data do download/autorização, autor e crédito. Envie JPG, PNG ou WEBP de até 2 MB e pelo menos 600 × 600 pixels. Use a headline revisada do Claude, criada a partir da pauta, ou desmarque essa opção e preencha o título e o texto manualmente.
4. A biblioteca compõe um JPEG de 1080 × 1350 com foto, identidade, texto e crédito. Confira a prévia, escolha o slide e clique Aplicar ao conteúdo.
5. Recarregue o editor no painel, revise e renderize antes de publicar. Aplicar salva no conteúdo manual; não dispara publicação nem altera posts já publicados.

A foto original é processada em memória e descartada. Somente a composição final e o registro de origem/licença são salvos. A aplicação acrescenta o crédito à legenda. O publicador confere o vínculo de projeto, integridade da peça e preserva os créditos; se a legenda exceder o limite, bloqueia para revisão.

O Claude prepara uma headline e texto de apoio por pauta nova, com uma segunda chamada de revisão, a cada vinte minutos ou pelo botão Criar headline com Claude. O texto revisado é reaproveitado enquanto a pauta não mudar. Registros rejeitados não provocam novas chamadas sem mudança de texto. O recibo de consumo é persistido antes de cada chamada e usa o mesmo orçamento/circuito do painel Claude. Nenhuma fotografia ou metadado da licença é enviado ao modelo.

Não há scraping ou download automático: a escolha é usar somente uploads de Pinterest e Vecteezy. Não há envio desses arquivos ao Claude. A biblioteca usa revisão humana declarada: registrar uma licença não prova sua validade. A reserva autoral aprovada e a conta Sabedoria Kids permanecem separadas deste fluxo. Uma nova campanha pode exigir novo download/licença.

Fontes oficiais:
- https://help.pinterest.com/en/article/download-an-image
- https://help.pinterest.com/pt-br/article/copyright
- https://policy.pinterest.com/en/terms-of-service
- https://www.vecteezy.com/licensing-agreement
- https://www.vecteezy.com/terms

Testes: node scripts/validate-licensed-media.mjs; node scripts/preview-licensed-media.mjs. Os testes usam arquivos sintéticos/locais, respostas simuladas e não publicam no Instagram. Nenhuma imagem Vecteezy ou Pinterest foi adquirida nesta implementação.

Capas fotográficas avulsas da conta Marcondes recebem a headline cadastrada sobre a foto, com contraste. Peças completas da biblioteca e imagens marcadas como capa pronta são preservadas. A correção não republica nem altera posts anteriores.
