import fs from 'node:fs';

const CONFIG_PATH = 'automation/instagram-template/config/content-packs.json';
const SOURCES_PATH = 'automation/instagram-template/config/sabedoria-kids-sources.json';

console.log('🔍 Lendo configurações...');
const contentPacks = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const sourcesData = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));

const skIndex = contentPacks.findIndex(g => g.account === 'sabedoria-kids');
if (skIndex === -1) {
  console.error('❌ Conta sabedoria-kids não encontrada em content-packs.json');
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.KIDS_VISION_ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ Chave de API não definida. Defina ANTHROPIC_API_KEY ou KIDS_VISION_ANTHROPIC_API_KEY');
  process.exit(1);
}

async function generateContent(entry) {
  const prompt = `Você é um especialista em conteúdo bíblico infantil. Crie um post completo para Instagram baseado na história: "${entry.title}"

REQUISITOS:
- 5 slides curtos e envolventes para crianças de 4-8 anos
- Linguagem simples, acolhedora e educativa
- Cada slide deve ter: eyebrow (rótulo curto), title (título) e body (texto principal)
- Uma legenda completa com hashtags relevantes (#bibliainfantil #sabedoriakids etc.)
- Tom: educativo, caloroso, convidativo à leitura em família
- NÃO inclua texto nas imagens (apenas descreva visualmente se necessário)
- Mantenha fidelidade à passagem bíblica original

Retorne APENAS um objeto JSON válido neste formato exato:
{
  "slides": [
    {"eyebrow": "...", "title": "...", "body": "..."},
    ...
  ],
  "caption": "..."
}`;

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
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const jsonMatch = data.content[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta da API não contém JSON válido');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`  ⚠️ Erro ao gerar conteúdo para "${entry.title}": ${error.message}`);
    return null;
  }
}

async function main() {
  const researchEntries = sourcesData.entries.filter(e => e.status === 'research');
  const existingPackIds = new Set(contentPacks[skIndex].packs.map(p => p.id));

  console.log(`📋 Encontrados ${researchEntries.length} temas pendentes de pesquisa`);
  console.log(`📦 Packs existentes: ${contentPacks[skIndex].packs.length}`);

  let generated = 0;
  let failed = 0;

  for (const entry of researchEntries) {
    const packId = `kids-biblia-${String(entry.sourceLesson).padStart(2, '0')}`;
    if (existingPackIds.has(packId)) {
      console.log(`⏭️ Pack ${packId} já existe, pulando...`);
      continue;
    }

    console.log(`\n Gerando conteúdo para: ${entry.title} (lição ${entry.sourceLesson})...`);
    const content = await generateContent(entry);

    if (content && content.slides && content.slides.length > 0 && content.caption) {
      const newPack = {
        id: packId,
        biblicalReference: entry.title,
        sourceLesson: entry.sourceLesson,
        slides: content.slides,
        caption: content.caption,
        status: 'approved',
        createdAt: new Date().toISOString()
      };

      contentPacks[skIndex].packs.push(newPack);

      // Atualizar status na fonte
      const sourceEntry = sourcesData.entries.find(e => e.sourceLesson === entry.sourceLesson);
      if (sourceEntry) {
        sourceEntry.status = 'approved';
      }

      generated++;
      console.log(`✅ Pack ${packId} criado com ${content.slides.length} slides`);

      // Salvar progresso parcial a cada geração
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(contentPacks, null, 2), 'utf8');
      fs.writeFileSync(SOURCES_PATH, JSON.stringify(sourcesData, null, 2), 'utf8');
    } else {
      failed++;
      console.log(`❌ Falha ao gerar conteúdo para lição ${entry.sourceLesson}`);
    }

    // Pequena pausa para evitar rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n🎉 Conclusão: ${generated} packs gerados, ${failed} falhas`);
  console.log(`📊 Total de packs agora: ${contentPacks[skIndex].packs.length}`);
  console.log(' Arquivos salvos automaticamente durante o processo');
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});