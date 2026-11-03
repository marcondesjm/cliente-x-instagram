# 🚀 Como Rodar a Automação na Nuvem (PC Desligado)

Para que a automação do **Sabedoria Kids** funcione 24/7 sem depender do seu computador estar ligado, o projeto precisa ser hospedado em um servidor na nuvem. 

Preparamos os arquivos de configuração (`Dockerfile` e `railway.toml`) para que o deploy seja feito de forma simples e gratuita (ou de baixo custo) usando plataformas como o **Railway**.

## Passo a Passo para Deploy no Railway

### 1. Suba o código para o GitHub
Se ainda não fez isso, envie os arquivos do projeto para um repositório no GitHub.
- Certifique-se de que os arquivos `Dockerfile` e `railway.toml` estejam na raiz do repositório.
- **Importante:** Nunca suba o arquivo `.env` com seus tokens para o GitHub. Adicione `.env` ao seu arquivo `.gitignore`.

### 2. Crie uma conta no Railway
- Acesse [railway.app](https://railway.app) e crie uma conta (você pode usar sua conta do GitHub para facilitar).
- O Railway oferece um crédito inicial gratuito e um plano "Hobby" acessível para projetos que rodam 24/7.

### 3. Conecte o Repositório
- No painel do Railway, clique em **"New Project"**.
- Escolha **"Deploy from GitHub repo"**.
- Selecione o repositório onde você subiu o código do `cliente-x-instagram`.

### 4. Configure as Variáveis de Ambiente (Tokens)
Como o arquivo `.env` não vai para o GitHub, você precisa configurar as credenciais diretamente no painel do Railway:
- No seu projeto no Railway, vá na aba **"Variables"**.
- Adicione as seguintes variáveis (copie os valores do seu arquivo `.env` local):
  - `SABEDORIA_KIDS_INSTAGRAM_ACCESS_TOKEN` = (seu token real)
  - `SABEDORIA_KIDS_INSTAGRAM_USER_ID` = `17841404470203300`
  - `CLIENTE_X_INSTAGRAM_ACCESS_TOKEN` = (seu token real, se for usar)
  - `CLIENTE_X_INSTAGRAM_USER_ID` = `17841404470203300`
  - `IMGBB_API_KEY` = `cc55b27877badf456f91810418723bb6`

### 5. Inicie o Deploy
- O Railway detectará automaticamente o `Dockerfile` e o `railway.toml`.
- Ele começará a construir (build) e depois a executar (deploy) o projeto.
- O comando de inicialização configurado é: `node scripts/process-scheduled-posts.mjs` (ou o script de monitoramento que você preferir).

### 6. Verifique se está rodando
- Na aba **"Deployments"**, você verá os logs em tempo real.
- Se aparecerem mensagens como "📦 Publicando pack..." ou "⏳ Verificando agendamentos...", significa que a automação está rodando com sucesso na nuvem.

---

## Alternativa: VPS (DigitalOcean, Contabo, Hetzner)
Se preferir ter controle total de um servidor Linux:
1. Contrate uma VPS básica (1 vCPU, 1GB RAM é suficiente).
2. Instale o Node.js e o Git no servidor.
3. Clone o repositório.
4. Crie o arquivo `.env` no servidor com os tokens.
5. Instale o `pm2` (`npm install -g pm2`).
6. Inicie o script: `pm2 start scripts/process-scheduled-posts.mjs --name "instagram-automation"`.
7. Configure o `pm2` para iniciar no boot: `pm2 startup` e `pm2 save`.

---

**Próximos passos:** 
Assim que o deploy estiver feito no Railway ou na VPS, a automação verificará o arquivo `scheduled-posts.json` e publicará os posts agendados automaticamente, **mesmo que seu computador esteja completamente desligado**.