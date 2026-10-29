
import fs from 'node:fs';

const C = 'automation/instagram-template/config/';
const packs = JSON.parse(fs.readFileSync(C + 'content-packs.json', 'utf8')).find(g => g.account === 'sabedoria-kids').packs;
const pack = packs.find(p => p.id === process.argv[2]);

if (!pack) {
  console.error('Pauta não encontrada:', process.argv[2]);
  process.exit(1);
}

const apiKey = process.env.KIDS_VISION_ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('API key não definida. Defina KIDS_VISION_ANTHROPIC_API_KEY.');
  process.exit(1);
}

console.log('Gerando descrições de ilustração para:', pack.id, '-', pack.slides[0].title);

const slideContent = pack.slides.map(s => s.body).join(' ');
const prompt = `Crie uma descrição detalhada de uma ilustração infantil colorida e acolhedora para a seguinte história bíblica:\n\nTítulo: ${pack.slides[0].title}\nReferência: ${pack.biblicalReference || 'Bíblia'}
Conteúdo: ${slideContent}

Estilo: Ilustração infantil suave, cores quentes, personagens amigáveis, adequado para crianças de 4-8 anos.
Formato: Paisagem (16:9)
Não inclua texto na imagem.

Retorne apenas a descrição visual da cena, sem comentários adicionais.`;

try {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const illustrationDescription = data.content[0].text;

  console.log('\nDescrição da ilustração gerada:');
  console.log(illustrationDescription);

  // Salvar o resultado em um arquivo de saída
  const outputDir = 'output/kids-illustrations/';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = `${outputDir}${pack.id}-description.txt`;
  fs.writeFileSync(outputFile, illustrationDescription);
  console.log('\nDescrição salva em:', outputFile);

} catch (error) {
  console.error('Erro ao gerar descrição da ilustração:', error.message);
  process.exit(1);
}
