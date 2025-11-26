connect folhaponto_user/folhaponto123@localhost:1521/FOLHAPONTO_PDB
set sqlformat csv
SELECT /* LLM in use is gemini-2.0-flash */ table_name FROM user_tables;
exit
