"""
Script para aplicar migração SQL no Supabase via Python
Lê o arquivo SQL e aplica usando subprocess para chamar o MCP
"""
import subprocess
import json

# Read the SQL file
sql_file = r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\SQL\migration_users.sql"

with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

print(f"SQL file size: {len(sql_content)} characters")
print(f"First 500 chars:\n{sql_content[:500]}")
print(f"\nLast 500 chars:\n{sql_content[-500:]}")
