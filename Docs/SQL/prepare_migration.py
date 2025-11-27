"""
Script para ler o arquivo SQL e preparar para aplicação via MCP
"""
import sys

# Read the SQL file
sql_file = r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\SQL\migration_users.sql"

try:
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Save to a variable that can be used
    print(f"SQL file loaded successfully")
    print(f"Total size: {len(content)} characters")
    print(f"Total lines: {content.count(chr(10)) + 1}")
    
    # Write to a temp file for easier handling
    with open(r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\SQL\migration_ready.sql", 'w', encoding='utf-8') as out:
        out.write(content)
    
    print("Migration file ready for application")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
