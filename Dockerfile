FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Instalar dependências do sistema para manipulação de imagens se necessário
RUN apt-get update && apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Script de verificação anti-duplicidade
CMD ["node", "scripts/run-cloud-automation.mjs"]