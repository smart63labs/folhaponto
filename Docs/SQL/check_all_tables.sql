CONNECT folhaponto_user/folhaponto123@localhost:1521/FOLHAPONTO_PDB

-- Verificar todas as tabelas existentes
SELECT table_name FROM user_tables ORDER BY table_name;

-- Verificar se as principais tabelas do sistema existem
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'EXISTE' ELSE 'NAO EXISTE' END as status,
    'USUARIOS' as tabela
FROM user_tables WHERE table_name = 'USUARIOS'
UNION ALL
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'EXISTE' ELSE 'NAO EXISTE' END as status,
    'DADOS_PESSOAIS' as tabela
FROM user_tables WHERE table_name = 'DADOS_PESSOAIS'
UNION ALL
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'EXISTE' ELSE 'NAO EXISTE' END as status,
    'DADOS_PROFISSIONAIS' as tabela
FROM user_tables WHERE table_name = 'DADOS_PROFISSIONAIS'
UNION ALL
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'EXISTE' ELSE 'NAO EXISTE' END as status,
    'REGISTROS_PONTO' as tabela
FROM user_tables WHERE table_name = 'REGISTROS_PONTO'
UNION ALL
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'EXISTE' ELSE 'NAO EXISTE' END as status,
    'ESCALAS' as tabela
FROM user_tables WHERE table_name = 'ESCALAS';

EXIT;