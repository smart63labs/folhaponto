# Instruções Pós-Importação

## Após importar o arquivo SETORES_1.csv, execute:

### Via Supabase SQL Editor:
1. Acesse: https://supabase.com/dashboard/project/mkkrgusbmciegbtuqpde/sql
2. Cole e execute o conteúdo do arquivo: `scripts/PASSO_2_converter_datas.sql`

### Ou via MCP (se preferir):
Execute o script SQL que está em `scripts/PASSO_2_converter_datas.sql`

## O que o script faz:
1. ✅ Converte `data_criacao` de TEXT para TIMESTAMPTZ
2. ✅ Converte `data_atualizacao` de TEXT para TIMESTAMPTZ  
3. ✅ Corrige latitude/longitude (divide por 10000000)
4. ✅ Adiciona default `now()` em data_criacao
5. ✅ Mostra os primeiros 10 registros para validação

## Validação:
Após executar, verifique se as datas estão corretas:
```sql
SELECT 
  codigo_setor,
  data_criacao,
  data_atualizacao,
  latitude,
  longitude
FROM setores
LIMIT 5;
```

Esperado:
- Datas no formato: `2025-10-14 09:26:00+00`
- Latitude: `-9.6221526` (não `-96221526`)
- Longitude: `-49.1558343` (não `-491558343`)
