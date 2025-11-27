-- Script para converter datas após importação
-- Execute este script DEPOIS de importar os dados do CSV

-- Criar colunas temporárias com tipo correto
ALTER TABLE setores ADD COLUMN data_criacao_temp timestamptz;
ALTER TABLE setores ADD COLUMN data_atualizacao_temp timestamptz;

-- Converter datas do formato DD/MM/YYYY HH:MM para timestamptz
UPDATE setores
SET data_criacao_temp = TO_TIMESTAMP(data_criacao, 'DD/MM/YYYY HH24:MI')
WHERE data_criacao IS NOT NULL AND data_criacao != '';

UPDATE setores
SET data_atualizacao_temp = TO_TIMESTAMP(data_atualizacao, 'DD/MM/YYYY HH24:MI')
WHERE data_atualizacao IS NOT NULL AND data_atualizacao != '';

-- Remover colunas antigas
ALTER TABLE setores DROP COLUMN data_criacao;
ALTER TABLE setores DROP COLUMN data_atualizacao;

-- Renomear colunas temporárias
ALTER TABLE setores RENAME COLUMN data_criacao_temp TO data_criacao;
ALTER TABLE setores RENAME COLUMN data_atualizacao_temp TO data_atualizacao;

-- Adicionar default para novos registros
ALTER TABLE setores ALTER COLUMN data_criacao SET DEFAULT now();

-- Verificar resultado
SELECT id_original, codigo_setor, data_criacao, data_atualizacao 
FROM setores 
LIMIT 5;
