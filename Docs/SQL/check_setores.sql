CONNECT folhaponto_user/folhaponto123@localhost:1521/FOLHAPONTO_PDB

-- Verificar estrutura da tabela setores
DESC setores;

-- Contar registros
SELECT COUNT(*) as total_setores FROM setores;

-- Verificar alguns registros se existirem
SELECT id, codigo_setor, nome_setor, orgao FROM setores WHERE ROWNUM <= 5;

EXIT;