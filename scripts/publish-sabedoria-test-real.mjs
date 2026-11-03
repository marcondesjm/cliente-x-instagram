import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const ACCOUNT = 'sabedoria-kids';
const PACK_ID = 'kids-biblia-01';
const ROOT_DIR = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT_DIR, 'automation', 'instagram-template', 'config');

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

// Token e User ID
const accessToken = process.env.SABEDORIA_KIDS_INSTAGRAM_ACCESS_TOKEN || 'COLE_AQUI_O_NOVO_TOKEN_DA_CONTA_SABEDORIAKIDSOFCIAL';
const userId = process.env.SABEDORIA_KIDS_INSTAGRAM_USER_ID || '17841404470203300';

if (accessToken.includes('COLE_AQUI')) {
  console.error('❌ Token de acesso não configurado. Configure a variável SABEDORIA_KIDS_INSTAGRAM_ACCESS_TOKEN no arquivo .env');
  console.error('   Ou use um token válido da conta @sabedoriakidsofcial');
  process.exit(1);
}

// Função para fazer upload de imagem local para o Instagram
async function uploadLocalImage(imagePath) {
  const absolutePath = path.join(ROOT_DIR, imagePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Imagem não encontrada: ${absolutePath}`);
    return null;
  }

  // Primeiro, precisamos subir a imagem para um servidor público
  // Como o Instagram API requer URL pública ou upload direto, vamos usar o ImgBB
  const imgbbKey = process.env.IMGBB_API_KEY || 'cc55b27877badf456f91810418723bb6';

  try {
    const imageBuffer = fs.readFileSync(absolutePath);
    const form = new FormData();
    form.append('image', imageBuffer.toString('base64'));

    const response = await fetch(`https://api.imgbb.com/v1/upload?key=${imgbbKey}`, {
      method: 'POST',
      body: form
    });

    const data = await response.json();

    if (data.success && data.data && data.data.url) {
      console.log(`✅ Imagem enviada para ImgBB: ${data.data.url}`);
      return data.data.url;
    } else {
      console.error(`❌ Erro no ImgBB:`, data);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erro ao fazer upload da imagem: ${error.message}`);
    return null;
  }
}

// Função para criar container de mídia no Instagram
async function createMediaContainer(imageUrl, caption) {
  const url = `https://graph.facebook.com/v18.0/${userId}/media`;

  const params = new URLSearchParams({
    image_url: imageUrl,
    caption: caption,
    access_token: accessToken
  });

  try {
    const response = await fetch(`${url}?${params}`, {
      method: 'POST'
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.id;
  } catch (error) {
    console.error(`❌ Erro ao criar container: ${error.message}`);
    return null;
  }
}

// Função para publicar o container
async function publishMedia(containerId) {
  const url = `https://graph.facebook.com/v18.0/${userId}/media_publish`;

  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken
  });

  try {
    const response = await fetch(`${url}?${params}`, {
      method: 'POST'
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data;
  } catch (error) {
    console.error(`❌ Erro na publicação: ${error.message}`);
    return null;
  }
}

// Executar publicação
async function publishTest() {
  console.log('\n🎨 Processando imagens dos slides...');

  // Para teste, vamos usar apenas o primeiro slide com imagem
  const slideWithImage = pack.slides.find(s => s.imagePath);

  if (!slideWithImage || !slideWithImage.imagePath) {
    console.error('❌ Pack não possui imagens configuradas nos slides');
    console.log('💡 Dica: Use um pack que tenha imagePath definido, como kids-biblia-05');
    process.exit(1);
  }

  console.log(`📸 Usando imagem: ${slideWithImage.imagePath}`);

  // Fazer upload da imagem
  const imageUrl = await uploadLocalImage(slideWithImage.imagePath);

  if (!imageUrl) {
    console.error('❌ Falha ao fazer upload da imagem');
    process.exit(1);
  }

  console.log(`\n📤 Criando container de mídia...`);
  const containerId = await createMediaContainer(imageUrl, pack.caption);

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