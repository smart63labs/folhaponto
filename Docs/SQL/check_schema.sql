CONNECT folhaponto_user/folhaponto123@localhost:1521/FOLHAPONTO_PDB

-- Verificar todas as tabelas do schema
SELECT table_name FROM user_tables ORDER BY table_name;

-- Verificar se a tabela setores existe e sua estrutura
SELECT column_name, data_type, nullable, data_length 
FROM user_tab_columns 
WHERE table_name = 'SETORES' 
ORDER BY column_id;

-- Contar registros na tabela setores
SELECT COUNT(*) as total_setores FROM setores;

-- Verificar outras tabelas importantes
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Verificar se existem dados de exemplo
SELECT * FROM setores WHERE ROWNUM <= 3;

EXIT;