import https from 'https';

const url = 'https://mkkrgusbmciegbtuqpde.supabase.co/rest/v1/';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ra3JndXNibWNpZWdidHVxcGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTIzMzksImV4cCI6MjA3OTcyODMzOX0.DPPKucXuk3T4krdJ-JW462IIWiZ3CQkaoaaiyuSzKsE';

const options = {
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  }
};

console.log(`Conectando a ${url}...`);

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      // A raiz da API REST retorna um Swagger/OpenAPI JSON com as definições
      const json = JSON.parse(data);
      
      if (json.definitions) {
        console.log('\n✅ Tabelas encontradas (expostas na API):');
        const tables = Object.keys(json.definitions);
        if (tables.length === 0) {
            console.log(' - Nenhuma tabela pública encontrada.');
        } else {
            tables.forEach(t => console.log(` - ${t}`));
        }
      } else {
        console.log('\n⚠️  Não foi possível listar as definições de tabela.');
        console.log('Resposta da API:', data.substring(0, 200) + '...');
      }
    } catch (e) {
      console.log('\n❌ Erro ao processar resposta:', e.message);
      console.log('Conteúdo recebido:', data.substring(0, 200));
    }
  });
}).on('error', (e) => {
  console.error('\n❌ Erro de conexão:', e.message);
});
