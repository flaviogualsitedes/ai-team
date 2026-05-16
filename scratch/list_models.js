/**
 * Script utilitário para listar modelos disponíveis no Google Generative AI (Sem dependências).
 */
async function listModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.error('❌ Erro: Variável GOOGLE_GENERATIVE_AI_API_KEY não encontrada.');
    return;
  }

  console.log('📡 Consultando modelos disponíveis...');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error('❌ Erro da API:', data.error.message);
      return;
    }

    console.log('\n✅ Modelos encontrados (IDs para o AITeam):');
    data.models.forEach((m) => {
      if (m.supportedGenerationMethods.includes('generateContent')) {
        const id = m.name.replace('models/', '');
        console.log(`- ${id} [${m.displayName}]`);
      }
    });
  } catch (error) {
    console.error('❌ Erro ao consultar API:', error.message);
  }
}

listModels();
