const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://mkkrgusbmciegbtuqpde.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'SUA_CHAVE_AQUI';
const supabase = createClient(supabaseUrl, supabaseKey);

// ID do órgão SEFAZ-TO
const ORGAO_ID = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3';

// Função para processar CSV
function parseCSV(content, delimiter = ',') {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(delimiter).map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || null;
    });
    return obj;
  });
}

// Migrar setores
async function migrarSetores() {
  console.log('Migrando setores...');
  
  const csvContent = fs.readFileSync(path.join(__dirname, '../Docs/Dados/SETORES.csv'), 'utf-8');
  const setores = parseCSV(csvContent);
  
  for (const setor of setores) {
    const { data, error } = await supabase
      .from('setores')
      .insert({
        orgao_id: ORGAO_ID,
        codigo: setor.CODIGO_SETOR,
        nome: setor.NOME_SETOR,
        ativo: setor.ATIVO === '1',
        logradouro: setor.LOGRADOURO,
        numero: setor.NUMERO,
        complemento: setor.COMPLEMENTO,
        bairro: setor.BAIRRO,
        cidade: setor.CIDADE,
        estado: setor.ESTADO,
        cep: setor.CEP,
        telefone: setor.TELEFONE,
        email: setor.EMAIL,
        latitude: setor.LATITUDE ? parseFloat(setor.LATITUDE) : null,
        longitude: setor.LONGITUDE ? parseFloat(setor.LONGITUDE) : null,
        criado_em: setor.DATA_CRIACAO,
        data_atualizacao: setor.DATA_ATUALIZACAO
      });
    
    if (error) {
      console.error(`Erro ao inserir setor ${setor.NOME_SETOR}:`, error);
    } else {
      console.log(`✓ Setor ${setor.NOME_SETOR} migrado`);
    }
  }
}

// Migrar servidores (perfis)
async function migrarServidores() {
  console.log('\nMigrando servidores...');
  
  const csvContent = fs.readFileSync(path.join(__dirname, '../Docs/SERVIDORES.csv'), 'utf-8');
  const servidores = parseCSV(csvContent, ';');
  
  // Buscar setores para mapear
  const { data: setores } = await supabase
    .from('setores')
    .select('id, codigo')
    .eq('orgao_id', ORGAO_ID);
  
  const setorMap = {};
  setores.forEach(s => {
    setorMap[s.codigo] = s.id;
  });
  
  for (const servidor of servidores.slice(0, 100)) { // Processar primeiros 100 para teste
    // Determinar papel baseado no cargo
    let papel = 'servidor';
    const cargo = (servidor.CARGO || '').toLowerCase();
    
    if (cargo.includes('diretor') || cargo.includes('gerente') || cargo.includes('coordenador') || cargo.includes('chefia')) {
      papel = 'chefia';
    } else if (cargo.includes('rh') || cargo.includes('recursos humanos')) {
      papel = 'rh';
    } else if (cargo.includes('admin') || cargo.includes('secretário')) {
      papel = 'admin';
    }
    
    const setorId = setorMap[servidor.SETOR] || null;
    
    // Nota: Não podemos criar usuários no auth.users diretamente via API
    // Isso precisa ser feito via Supabase Auth ou manualmente
    console.log(`Servidor: ${servidor.NOME} - ${papel} - Setor: ${servidor.SETOR}`);
  }
  
  console.log('\nNota: A criação de usuários precisa ser feita via Supabase Auth.');
  console.log('Os perfis serão criados após a criação dos usuários no sistema de autenticação.');
}

// Executar migrações
async function main() {
  try {
    await migrarSetores();
    await migrarServidores();
    console.log('\n✓ Migração concluída!');
  } catch (error) {
    console.error('Erro na migração:', error);
  }
}

main();
