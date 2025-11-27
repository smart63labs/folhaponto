import sys

# Read the SQL file
sql_file = r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\SQL\migration_users.sql"

with open(sql_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Print the content (will be captured by the calling process)
print(content)
