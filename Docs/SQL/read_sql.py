"""
Script para aplicar migração no Supabase lendo o arquivo SQL
Este script lê o SQL e o imprime para ser capturado
"""
import sys

sql_file = r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\SQL\migration_users.sql"

with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Output the SQL content
sys.stdout.write(sql_content)
