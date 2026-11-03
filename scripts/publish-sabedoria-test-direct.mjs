import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const ACCOUNT = 'sabedoria-kids';
const PACK_ID = 'kids-biblia-02';
const CONFIG_PATH = path.join(__dirname, '..', 'automation', 'instagram-template', 'config');

// Ler configurações
const accountsData = JSON.parse(fs.readFileSync(path.join(CONFIG_PATH, 'accounts.json'), 'utf-8'));
const packsData = JSON.parse(fs.readFileSync(path.join(CONFIG_PATH, 'content-packs.json'), 'utf-8'));

const account = accountsData.find(a => a.account === ACCOUNT);
const accountPacks = packsData.find(p => p.account === ACCOUNT);
const pack = accountPacks?.packs.find(p => p.id === PACK_ID);

if (!account || !pack) {
  console.error('❌ Conta ou pack não encontrado');
  process.exit(1);
}

console.log(`📦 Publicando pack: ${PACK_ID}`);
console.log(`👤 Conta: ${ACCOUNT}`);
console.log(`📊 Slides: ${pack.slides.length}`);

// Token e User ID (usando o token genérico já que o específico está vazio)
const accessToken = process.env.SABEDORIA_KIDS_INSTAGRAM_ACCESS_TOKEN || 'EAASzEPd8CMIBR64I2ujsZCzO3oiV5dVQTqjRUOdqvHBnkPTbM59NcBpe59Jth5pWpRsPK0jfnkPxOrvNNShCXLTPp2t6BkRLcdSJCC9xPx76QxCGq7WxUxtF1dLEjXqBZCeKaZAQjNgDcSsJPQuGS9HaGECNWkNYAIoalcyLYZCLzmChbZCSPt9TTAXzHLls0';
const userId = process.env.SABEDORIA_KIDS_INSTAGRAM_USER_ID || '17841404470203300';

if (accessToken.includes('COLE_AQUI')) {
  console.error('❌ Token de acesso não configurado. Configure a variável SABEDORIA_KIDS_INSTAGRAM_ACCESS_TOKEN');
  process.exit(1);
}

// Função para criar imagem de slide simples
async function createSlideImage(slide, index) {
  const canvas = { width: 1080, height: 1080 };
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      <rect width="100%" height="100%" fill="#FFF5E6"/>
      <text x="50%" y="15%" font-family="Arial" font-size="24" fill="#FF6B35" text-anchor="middle">${slide.eyebrow || ''}</text>
      <text x="50%" y="45%" font-family="Arial" font-size="48" fill="#2C3E50" text-anchor="middle" font-weight="bold">${slide.title || ''}</text>
      <text x="50%" y="75%" font-family="Arial" font-size="28" fill="#34495E" text-anchor="middle">${(slide.body || '').substring(0, 80)}</text>
      <text x="50%" y="95%" font-family="Arial" font-size="16" fill="#95A5A6" text-anchor="middle">Sabedoria Kids - Slide ${index + 1}</text>
    </svg>
  `;

  return Buffer.from(svg).toString('base64');
}

// Função para fazer upload da imagem
async function uploadImage(imageBase64) {
  const url = `https://graph.facebook.com/v18.0/${userId}/media?image_url=data:image/svg+xml;base64,${imageBase64}&access_token=${accessToken}`;

  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.id;
  } catch (error) {
    console.error(`Erro no upload: ${error.message}`);
    return null;
  }
}

// Função para criar container de carrossel
async function createCarouselContainer(mediaIds, caption) {
  const children = mediaIds.map(id => id).join(',');
  const url = `https://graph.facebook.com/v18.0/${userId}/media?media_type=CAROUSEL&children=${children}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`;

  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.id;
  } catch (error) {
    console.error(`Erro ao criar container: ${error.message}`);
    return null;
  }
}

// Função para publicar o container
async function publishMedia(containerId) {
  const url = `https://graph.facebook.com/v18.0/${userId}/media_publish?creation_id=${containerId}&access_token=${accessToken}`;

  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data;
  } catch (error) {
    console.error(`Erro na publicação: ${error.message}`);
    return null;
  }
}

// Executar publicação
async function publishTest() {
  console.log('\n🎨 Gerando imagens dos slides...');

  const mediaIds = [];

  for (let i = 0; i < pack.slides.length; i++) {
    const slide = pack.slides[i];
    console.log(`Criando slide ${i + 1}/${pack.slides.length}: ${slide.title}`);

    const imageBase64 = await createSlideImage(slide, i);
    const mediaId = await uploadImage(imageBase64);

    if (mediaId) {
      mediaIds.push(mediaId);
      console.log(`✅ Slide ${i + 1} criado: ${mediaId}`);
    } else {
      console.error(`❌ Falha ao criar slide ${i + 1}`);
    }
  }

  if (mediaIds.length === 0) {
    console.error('❌ Nenhuma imagem foi criada com sucesso');
    process.exit(1);
  }

  console.log(`\n📤 Criando container de carrossel com ${mediaIds.length} imagens...`);
  const containerId = await createCarouselContainer(mediaIds, pack.caption);

  if (!containerId) {
    console.error('❌ Falha ao criar container');
    process.exit(1);
  }

  console.log(`✅ Container criado: ${containerId}`);
  console.log('\n🚀 Publicando no Instagram...');

  const publishResult = await publishMedia(containerId);

  if (publishResult && publishResult.id) {
    console.log(`\n🎉 SUCESSO! Post publicado: ${publishResult.id}`);
    console.log(`📱 Link: https://www.instagram.com/p/${publishResult.id}`);
  } else {
    console.error('❌ Falha na publicação final');
    console.log('Resultado:', publishResult);
  }
}

// Executar
publishTest().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});