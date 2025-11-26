CONNECT folhaponto_user/folhaponto123@localhost:1521/FOLHAPONTO_PDB
SELECT COUNT(*) AS total FROM user_tables WHERE table_name = 'SETORES';
SELECT COUNT(*) AS total_registros FROM setores;
SELECT * FROM setores WHERE ROWNUM <= 5;
EXIT;