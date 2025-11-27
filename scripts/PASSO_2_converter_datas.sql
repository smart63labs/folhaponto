-- PASSO 2: Execute este script APÓS importar os dados do CSV
-- Este script converte as datas de TEXT para TIMESTAMPTZ

-- 1. Criar colunas temporárias
ALTER TABLE setores ADD COLUMN data_criacao_temp timestamptz;
ALTER TABLE setores ADD COLUMN data_atualizacao_temp timestamptz;

-- 2. Converter datas do formato DD/MM/YYYY HH:MM
UPDATE setores
SET data_criacao_temp = TO_TIMESTAMP(data_criacao, 'DD/MM/YYYY HH24:MI')
WHERE data_criacao IS NOT NULL AND data_criacao != '';

UPDATE setores
SET data_atualizacao_temp = TO_TIMESTAMP(data_atualizacao, 'DD/MM/YYYY HH24:MI')
WHERE data_atualizacao IS NOT NULL AND data_atualizacao != '';

-- 3. Remover colunas antigas
ALTER TABLE setores DROP COLUMN data_criacao;
ALTER TABLE setores DROP COLUMN data_atualizacao;

-- 4. Renomear colunas temporárias
ALTER TABLE setores RENAME COLUMN data_criacao_temp TO data_criacao;
ALTER TABLE setores RENAME COLUMN data_atualizacao_temp TO data_atualizacao;

-- 5. Adicionar default
ALTER TABLE setores ALTER COLUMN data_criacao SET DEFAULT now();

-- 6. Converter latitude/longitude de BIGINT para NUMERIC com divisão
-- Criar colunas temporárias
ALTER TABLE setores ADD COLUMN latitude_temp numeric(12,8);
ALTER TABLE setores ADD COLUMN longitude_temp numeric(12,8);

-- Converter dividindo por 10000000
UPDATE setores
SET 
  latitude_temp = latitude / 10000000.0,
  longitude_temp = longitude / 10000000.0;

-- Remover colunas antigas
ALTER TABLE setores DROP COLUMN latitude;
ALTER TABLE setores DROP COLUMN longitude;

-- Renomear
ALTER TABLE setores RENAME COLUMN latitude_temp TO latitude;
ALTER TABLE setores RENAME COLUMN longitude_temp TO longitude;

-- 7. Verificar resultado
SELECT 
  id_original, 
  codigo_setor, 
  nome_setor,
  data_criacao, 
  data_atualizacao,
  latitude,
  longitude
FROM setores 
ORDER BY id_original
LIMIT 10;
