CONNECT folhaponto_user/folhaponto123@localhost:1521/FOLHAPONTO_PDB

-- Verificar tabelas existentes
SELECT table_name FROM user_tables;

-- Verificar se tabela setores existe
SELECT COUNT(*) as existe_setores FROM user_tables WHERE table_name = 'SETORES';

-- Verificar se tabela usuarios existe  
SELECT COUNT(*) as existe_usuarios FROM user_tables WHERE table_name = 'USUARIOS';

EXIT;