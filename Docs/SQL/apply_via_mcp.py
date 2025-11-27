"""
Script para aplicar migração no Supabase
Lê o arquivo SQL e imprime para ser usado pelo MCP
"""
import sys

sql_file = r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\SQL\migration_users.sql"

try:
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Save the SQL content to a file that can be read by MCP
    output_file = r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\SQL\migration_for_mcp.sql"
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write(sql_content)
    
    print(f"SUCCESS: Migration SQL prepared")
    print(f"File size: {len(sql_content)} bytes")
    print(f"Output file: {output_file}")
    print(f"Ready to apply to Supabase project: mkkrgusbmciegbtuqpde")
    
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
