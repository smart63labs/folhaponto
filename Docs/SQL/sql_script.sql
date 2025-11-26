-- Conectar ao banco de dados
CONNECT folhaponto_user/folhaponto123@localhost:1521/FOLHAPONTO_PDB

-- Verificar a estrutura da tabela setores
DESC setores;

-- Listar todas as colunas da tabela setores
SELECT column_name, data_type, nullable 
FROM user_tab_columns 
WHERE table_name = 'SETORES' 
ORDER BY column_id;

-- Verificar se existe dados na tabela
SELECT COUNT(*) as total_registros FROM setores;

-- Mostrar alguns registros da tabela (se existirem)
SELECT * FROM setores WHERE ROWNUM <= 5;

-- Sair
EXIT;