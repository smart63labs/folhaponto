"""
Script Python para ler o SQL e aplicar usando MCP do Supabase
Este script lê o arquivo SQL e retorna o conteúdo como string
"""
import sys

sql_file = r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\SQL\migration_for_mcp.sql"

# Read SQL content
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Print the SQL content as a Python string literal
print(repr(sql_content))
