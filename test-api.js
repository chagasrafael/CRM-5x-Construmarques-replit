// Script para testar a API

async function testAPI() {
  const fetch = globalThis.fetch;
  try {
    const response = await fetch('https://workflows-webhook.iev.com.br/webhook/crm/apiv1/negociacoes');
    const data = await response.json();
    console.log('Exemplo de resposta da API:');
    console.log(JSON.stringify(data[0], null, 2));
    
    // Analisar os valores de status
    const statusValues = new Set();
    const stageValues = new Set();
    
    data.forEach(item => {
      if (item.status) statusValues.add(item.status);
      if (item.estagio) stageValues.add(item.estagio);
    });
    
    console.log('\nValores de Status encontrados:', [...statusValues]);
    console.log('Valores de Estágio encontrados:', [...stageValues]);
    
    // Verificar se temos os novos campos
    const hasResume = data.some(item => item.resumo !== undefined);
    const hasLinkConversa = data.some(item => item.link_conversa !== undefined);
    
    console.log('\nCampo resumo presente:', hasResume);
    console.log('Campo link_conversa presente:', hasLinkConversa);
    
  } catch (error) {
    console.error('Erro ao acessar a API:', error);
  }
}

testAPI();