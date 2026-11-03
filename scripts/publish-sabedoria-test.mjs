import fs from 'fs';
import path from 'path';

// Configurações
const ACCOUNT = 'sabedoria-kids';
const PACK_ID = 'kids-biblia-01';

// Ler configurações
const configPath = path.join(process.cwd(), 'automation', 'instagram-template', 'config');
const accountsData = JSON.parse(fs.readFileSync(path.join(configPath, 'accounts.json'), 'utf-8'));
const packsData = JSON.parse(fs.readFileSync(path.join(configPath, 'content-packs.json'), 'utf-8'));

// Encontrar conta e pack
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

// Montar conteúdo do carrossel
const slides = pack.slides.map(slide => ({
  eyebrow: slide.eyebrow || '',
  title: slide.title || '',
  body: slide.body || ''
}));

// Montar legenda
const caption = pack.caption || '';

console.log('\n📝 Conteúdo do carrossel:');
slides.forEach((slide, i) => {
  console.log(`\nSlide ${i + 1}:`);
  console.log(`  Eyebrow: ${slide.eyebrow}`);
  console.log(`  Title: ${slide.title}`);
  console.log(`  Body: ${slide.body.substring(0, 100)}...`);
});

console.log(`\n📄 Legenda (${caption.length} caracteres):`);
console.log(caption.substring(0, 200) + '...');

console.log('\n✅ Pack pronto para publicação!');
console.log('⚠️  Para publicar no Instagram, é necessário:');
console.log('   1. Gerar as imagens do carrossel');
console.log('   2. Fazer upload via API do Instagram');
console.log('   3. Criar o container de mídia');
console.log('   4. Publicar o container');