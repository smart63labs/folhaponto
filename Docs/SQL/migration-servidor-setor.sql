-- Migration para adequar tabelas de Servidores e Setores
-- Baseado nos CSVs SERVIDORES.csv e SETORES.csv

-- 1. Adicionar campo setor_id na tabela usuarios
ALTER TABLE usuarios ADD setor_id NUMBER;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_setor FOREIGN KEY (setor_id) REFERENCES setores(id);

-- 2. Atualizar tabela dados_profissionais
-- Adicionar novos campos baseados no CSV SERVIDORES.csv
ALTER TABLE dados_profissionais ADD setor_id NUMBER;
ALTER TABLE dados_profissionais ADD situacao VARCHAR2(50);
ALTER TABLE dados_profissionais ADD CONSTRAINT fk_dados_prof_setor FOREIGN KEY (setor_id) REFERENCES setores(id);

-- 3. Criar índices para melhor performance
CREATE INDEX idx_usuarios_setor_id ON usuarios(setor_id);
CREATE INDEX idx_dados_prof_setor_id ON dados_profissionais(setor_id);
CREATE INDEX idx_setores_codigo ON setores(code);

-- 4. Comentários nas colunas para documentação
COMMENT ON COLUMN usuarios.setor_id IS 'Referência para o setor do usuário na tabela setores';
COMMENT ON COLUMN dados_profissionais.setor_id IS 'Referência para o setor nos dados profissionais';
COMMENT ON COLUMN dados_profissionais.situacao IS 'Situação do servidor: ATIVO, INATIVO, APOSENTADO, etc.';

-- 5. Atualizar dados existentes (se houver)
-- Nota: Este script deve ser executado após a importação dos dados dos CSVs
-- UPDATE usuarios u SET setor_id = (SELECT s.id FROM setores s WHERE s.code = 'CODIGO_DO_CSV');

-- 6. Verificações de integridade
-- Verificar se todos os códigos de setor do CSV existem na tabela setores
-- SELECT DISTINCT setor FROM dados_temp_servidores WHERE setor NOT IN (SELECT code FROM setores);

-- 7. Script para popular dados dos CSVs (exemplo)
/*
-- Primeiro, importar SETORES.csv
INSERT INTO setores (name, code, description, active)
SELECT 
    NOME_SETOR,
    CODIGO_SETOR,
    DESCRICAO_SETOR,
    1
FROM temp_setores_csv;

-- Depois, importar SERVIDORES.csv e vincular com setores
INSERT INTO usuarios (nome, cpf, matricula, email, perfil, setor_id, ativo)
SELECT 
    s.NOME,
    s.CPF,
    s.MATRICULA,
    s.EMAIL,
    CASE 
        WHEN s.TIPO_VINCULO = 'ESTAGIARIO' THEN 'SERVIDOR'
        ELSE 'SERVIDOR'
    END,
    st.id,
    CASE WHEN s.SITUACAO = 'ATIVO' THEN 1 ELSE 0 END
FROM temp_servidores_csv s
LEFT JOIN setores st ON st.code = s.SETOR;

-- Inserir dados profissionais
INSERT INTO dados_profissionais (usuario_id, matricula, cargo, setor_id, tipo_vinculo, categoria, regime_jur, situacao)
SELECT 
    u.id,
    s.MATRICULA,
    s.CARGO,
    u.setor_id,
    s.TIPO_VINCULO,
    s.CATEGORIA,
    s.REGIME_JURIDICO,
    s.SITUACAO
FROM temp_servidores_csv s
JOIN usuarios u ON u.matricula = s.MATRICULA;
*/