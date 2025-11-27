import csv
import uuid
import os

# Configuration
CSV_FILE = r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\Dados\DADOS_POSTGRES\USUARIOS_NORMALIZADO_V1.csv"
OUTPUT_SQL = r"C:\Users\88417646191\Documents\NovaFolhaPonto\V1\Docs\SQL\migration_users.sql"

# UUID Namespace for deterministic IDs (using a random UUID as base)
NAMESPACE_SEFAZ = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8') # DNS namespace

def parse_csv_row(row):
    # Handle empty strings as NULL for SQL
    cleaned = {}
    for k, v in row.items():
        if v is None or v.strip() == '' or v.strip().lower() == 'atualizar':
            cleaned[k] = 'NULL'
        else:
            # Escape single quotes
            cleaned[k] = "'" + v.replace("'", "''") + "'"
    return cleaned

def generate_sql():
    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_SQL), exist_ok=True)

    with open(CSV_FILE, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        users_sql = []
        
        for i, row in enumerate(reader):
            # Debug: Print keys for the first row if needed
            # if i == 0: print(row.keys())
            
            # Process User
            cpf = row.get('cpf', '').replace('.', '').replace('-', '')
            matricula = row.get('matricula', '')
            
            if cpf and cpf.isdigit():
                user_uuid = uuid.uuid5(NAMESPACE_SEFAZ, cpf)
            elif matricula:
                user_uuid = uuid.uuid5(NAMESPACE_SEFAZ, matricula)
            else:
                user_uuid = uuid.uuid4()
                
            cleaned_row = parse_csv_row(row)
            
            fields = [
                'id', 'orgao_id', 'setor_id', 'papel', 'nome', 'matricula', 'vinculo_funcional', 'cpf', 'pis_pasep', 
                'sexo', 'estado_civil', 'data_nascimento', 'pai', 'mae', 'rg', 'tipo_rg', 'orgao_expedidor', 'uf_rg', 
                'expedicao_rg', 'cidade_nascimento', 'uf_nascimento', 'tipo_sanguineo', 'raca_cor', 'pne', 'tipo_vinculo', 
                'categoria', 'regime_juridico', 'regime_previdenciario', 'evento_tipo', 'forma_provimento', 'codigo_cargo', 
                'cargo', 'escolaridade_cargo', 'escolaridade_servidor', 'formacao_profissional_1', 'formacao_profissional_2', 
                'jornada', 'nivel_referencia', 'comissao_funcao', 'data_inicio_comissao', 'telefone', 'endereco', 
                'numero_endereco', 'complemento_endereco', 'bairro_endereco', 'cidade_endereco', 'uf_endereco', 'cep_endereco', 
                'email', 'senha', 'senha_alterada', 'usuario_ativo', 'ultimo_login', 'tentativas_login', 
                'data_criacao', 'data_atualizacao', 'bloqueado_ate'
            ]
            
            values = [f"'{user_uuid}'"]
            
            for field in fields[1:]: 
                if field in row:
                    values.append(cleaned_row[field])
                else:
                    values.append('NULL')
            
            lat = row.get('latitude', '').replace(',', '.')
            lon = row.get('longitude', '').replace(',', '.')
            
            try:
                float(lat)
                val_lat = lat
            except:
                val_lat = 'NULL'
                
            try:
                float(lon)
                val_lon = lon
            except:
                val_lon = 'NULL'
                
            fields.append('latitude')
            values.append(val_lat)
            fields.append('longitude')
            values.append(val_lon)
            
            cols_str = ', '.join(fields)
            vals_str = ', '.join(values)
            
            sql = f"INSERT INTO usuarios ({cols_str}) VALUES ({vals_str}) ON CONFLICT (id) DO NOTHING;"
            users_sql.append(sql)

    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write("-- Users Migration\n")
        f.write('\n'.join(users_sql))

if __name__ == '__main__':
    generate_sql()
