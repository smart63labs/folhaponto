CONNECT folhaponto_user/folhaponto123@localhost:1521/FOLHAPONTO_PDB
SELECT 'Conexao estabelecida com sucesso!' as status FROM dual;
DESC setores;
SELECT COUNT(*) as total_registros FROM setores;
SELECT * FROM setores WHERE ROWNUM <= 3;
EXIT;