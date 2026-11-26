# Retomada da integração TikTok · 16/11/2026

## Objetivo

Conectar o Cliente X ao TikTok e testar a publicação de conteúdo em português, com a identidade editorial de @marcondes.machado.oficial no Instagram. O primeiro perfil de teste é @machado.marcondes no TikTok.

## Estado confirmado

- Organização MJM Digital e app Cliente X criados no TikTok for Developers.
- Sandbox Cliente X TikTok criado e configuração salva com ícone CX, Login Kit, Content Posting API e Direct Post: https://developers.tiktok.com/app/7708883909438638087/sandbox/7708872068976986130
- @machado.marcondes confirmado na lista Target Users do sandbox.
- Redirect URI cadastrada: https://cliente-x-instagram.vercel.app/api/tiktok-connect
- URL dos Termos cadastrada: https://cliente-x-instagram.vercel.app/docs/terms.html. O arquivo é uma minuta no PR e ainda precisa ser publicado.
- URL da Política de Privacidade cadastrada: https://cliente-x-instagram.vercel.app/docs/privacy.html. O texto precisa ser atualizado para refletir o tratamento de dados do TikTok.
- PR em rascunho: https://github.com/marcondesjm/cliente-x-instagram/pull/10. Contém o ícone em PNG e SVG, os Termos de Uso e uma rota de teste OAuth para o administrador. A rota verifica a autorização e descarta os tokens. A implantação e a autorização real ainda não foram executadas. O botão no painel e o envio de vídeo ainda precisam ser implementados.

## Conteúdo do Instagram

- Perfil de referência: https://www.instagram.com/marcondes.machado.oficial/
- Foto de perfil baixada no computador de Marcondes, pasta Downloads, arquivo 902825752_18436147081149007_7634681693217581_n.jpg.
- Foram identificadas 24 publicações no feed com login. O download da primeira publicação expirou. O acervo e as legendas ainda estão pendentes.
- A verificação automática do navegador bloqueou a inspeção da Central de Contas porque essa área inclui dados privados. Marcondes tentou a exportação manual e informou que não conseguiu. Nenhum ZIP foi recebido.

## Próxima sessão

1. Validar a rota do PR e preparar a implantação de teste na Vercel. Configurar as credenciais do sandbox nas variáveis protegidas do ambiente e autorizar @machado.marcondes.
2. Implementar o envio de um vídeo original e confirmar o resultado no sandbox antes de configurar agenda ou solicitar revisão de produção. Um arquivo original existente já serve para começar o teste.
3. Para reunir o acervo do Instagram, retomar a exportação de publicações e mídia pela própria conta ou usar arquivos originais e legendas já disponíveis do Cliente X. A coleta integral pode seguir em paralelo com o teste.

Publicação automática no TikTok ainda inativa. Nenhum conteúdo foi publicado no TikTok nesta etapa.
