# Guia de Importação Manual dos Dados CSV

## Tabelas Ajustadas

As tabelas `setores` e `perfis` foram modificadas para aceitar todos os campos dos arquivos CSV.

## 1. Importação da Tabela SETORES

### Arquivo: `Docs/Dados/SETORES.csv`

### Mapeamento de Colunas CSV → Banco de Dados:

| CSV | Banco de Dados | Observações |
|-----|----------------|-------------|
| ID | id_original | ID original para referência |
| CODIGO_SETOR | codigo | Código único do setor |
| NOME_SETOR | nome | Nome do setor |
| ORGAO | - | Usar o ID fixo do órgão SEFAZ-TO |
| ATIVO | ativo | Converter "0" para false, "1" para true |
| LOGRADOURO | logradouro | Endereço |
| NUMERO | numero | Número |
| COMPLEMENTO | complemento | Complemento |
| BAIRRO | bairro | Bairro |
| CIDADE | cidade | Cidade |
| ESTADO | estado | UF |
| CEP | cep | CEP |
| TELEFONE | telefone | Telefone |
| EMAIL | email | Email |
| DATA_CRIACAO | criado_em | Data de criação |
| DATA_ATUALIZACAO | data_atualizacao | Data de atualização |
| LATITUDE | latitude | Coordenada |
| LONGITUDE | longitude | Coordenada |

### ID do Órgão SEFAZ-TO:
```
04e86ec7-8fdd-4e80-ade9-1d4eb45447a3
```

### Exemplo de INSERT:
```sql
INSERT INTO setores (
  orgao_id, id_original, codigo, nome, ativo, 
  logradouro, numero, complemento, bairro, cidade, estado, cep, 
  telefone, email, latitude, longitude, criado_em, data_atualizacao
) VALUES (
  '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3',
  1,
  '013.AGEATABR',
  'Agência de Atendimento de Abreulândia',
  false,
  'R. Mariano Pereira',
  'sem número',
  null,
  'Centro',
  'Abreulândia',
  'TO',
  '77693-000',
  '(63) 1234-1234',
  'atualizar_email@sefaz.to.gov.br',
  -9.6221526,
  -49.1558343,
  '2025-10-14 09:26:42.999',
  '2025-11-14 08:10:29.252'
);
```

## 2. Importação da Tabela PERFIS (Servidores)

### Arquivo: `Docs/SERVIDORES.csv`

### Mapeamento de Colunas CSV → Banco de Dados:

| CSV | Banco de Dados | Observações |
|-----|----------------|-------------|
| ORDEM | ordem | Ordem do registro |
| NOME | nome | Nome completo |
| NUMFUNC | numfunc | Número funcional |
| NUMVINC | numvinc | Número de vínculo |
| CPF | cpf | CPF |
| PIS/PASEP | pis_pasep | PIS/PASEP |
| SEXO | sexo | M/F |
| ESTCIVIL | estado_civil | Estado civil |
| DTNASC | data_nascimento | Data de nascimento (converter formato) |
| PAI | nome_pai | Nome do pai |
| MAE | nome_mae | Nome da mãe |
| CIDNASC | cidade_nascimento | Cidade de nascimento |
| UFNASC | uf_nascimento | UF de nascimento |
| TIPO_SANGUINEO | tipo_sanguineo | Tipo sanguíneo |
| RACA_COR | raca_cor | Raça/Cor |
| PNE | pne | Converter "SIM"/"NAO" para true/false |
| TIPODEFIC | tipo_deficiencia | Tipo de deficiência |
| DT_INGRE_SERV_PUB | data_ingresso_servico_publico | Data de ingresso |
| TIPO_VINCULO | tipo_vinculo | Tipo de vínculo |
| CATEGORIA | categoria | Categoria |
| REGIMEJUR | regime_juridico | Regime jurídico |
| CODIGO_CARGO | codigo_cargo | Código do cargo |
| CARGO | cargo | Cargo |
| ORGAO | - | Usar ID do órgão SEFAZ-TO |
| SETOR | setor_id | Buscar ID do setor pelo código |
| LOTACAO | lotacao | Lotação |
| MUNICIPIO_LOTACAO | municipio_lotacao | Município |
| SITUACAO | situacao | ATIVO/INATIVO |
| HIERARQUIA_SETOR | hierarquia_setor | Hierarquia |
| TELEFONE | telefone | Telefone |
| ENDERECO | endereco | Endereço |
| NUMENDER | numero_endereco | Número |
| COMPLENDER | complemento_endereco | Complemento |
| BAIRROENDER | bairro_endereco | Bairro |
| CIDADEENDER | cidade_endereco | Cidade |
| UFENDER | uf_endereco | UF |
| CEPENDER | cep_endereco | CEP |
| E_MAIL | email | Email |

### Determinação do Papel (papel_usuario):

```sql
-- Lógica para determinar o papel baseado no cargo:
CASE 
  WHEN LOWER(cargo) LIKE '%diretor%' OR LOWER(cargo) LIKE '%gerente%' 
       OR LOWER(cargo) LIKE '%coordenador%' OR LOWER(cargo) LIKE '%chefia%' 
  THEN 'chefia'
  
  WHEN LOWER(cargo) LIKE '%rh%' OR LOWER(cargo) LIKE '%recursos humanos%' 
  THEN 'rh'
  
  WHEN LOWER(cargo) LIKE '%admin%' OR LOWER(cargo) LIKE '%secretário%' 
       OR LOWER(cargo) LIKE '%secretario%'
  THEN 'admin'
  
  ELSE 'servidor'
END
```

### Exemplo de INSERT:
```sql
-- Primeiro, buscar o setor_id pelo código do setor
WITH setor_lookup AS (
  SELECT id FROM setores WHERE codigo = '013.DIREXEFIN' AND orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3'
)
INSERT INTO perfis (
  orgao_id, setor_id, papel, ordem, nome, numfunc, numvinc, cpf, 
  pis_pasep, sexo, estado_civil, data_nascimento, nome_pai, nome_mae,
  cidade_nascimento, uf_nascimento, tipo_sanguineo, raca_cor, pne,
  tipo_deficiencia, data_ingresso_servico_publico, tipo_vinculo,
  categoria, regime_juridico, codigo_cargo, cargo, lotacao,
  municipio_lotacao, situacao, hierarquia_setor, telefone, endereco,
  numero_endereco, complemento_endereco, bairro_endereco, cidade_endereco,
  uf_endereco, cep_endereco, email, ativo
) 
SELECT 
  '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3',
  setor_lookup.id,
  'chefia', -- Determinar baseado no cargo
  1,
  'ABMAEL SANTOS BORGES',
  '11583177',
  '6',
  '063.743.251-76',
  '21275538152',
  'M',
  'SOLTEIRO',
  '1999-03-01',
  'ANIBRA DA SILVA BORGES',
  'SILVIA FERREIRA DOS SANTOS BORGES',
  'MIRACEMA DO TOCANTINS',
  'TO',
  'Atualizar',
  'Parda',
  false,
  'Atualizar',
  '2017-03-01',
  'COMISSIONADO',
  'CARGO COMISSAO',
  'ESTATUTARIO',
  '1978',
  'Diretor de Execução Financeira',
  'Diretoria de Execução Financeira',
  'PALMAS',
  'ATIVO',
  'SEFAZ/013.GABSEC/013.GABSEXT/013.SUTES/013.DIREXEFIN',
  '(63) 99984-2328',
  'ARNO 71 ALAMEDA 23 17 N 17 QI 10 LT 01 CASA',
  '3',
  'Atualizar',
  'CENTRO',
  'PALMAS',
  'TO',
  '77001877',
  'atualizar_email@sefaz.to.gov.br',
  true
FROM setor_lookup;
```

## 3. Ferramentas Recomendadas para Importação

### Opção 1: Supabase Dashboard (Recomendado para poucos registros)
1. Acesse: https://supabase.com/dashboard/project/mkkrgusbmciegbtuqpde/editor
2. Use o SQL Editor para executar os INSERTs

### Opção 2: DBeaver / pgAdmin (Recomendado para muitos registros)
1. Conecte ao banco Supabase
2. Use o recurso de importação CSV
3. Mapeie as colunas conforme a tabela acima

### Opção 3: Script Python/Node.js
Criar um script que lê o CSV e faz INSERTs em lote via API do Supabase

## 4. Observações Importantes

1. **Ordem de Importação**: Importe SETORES primeiro, depois PERFIS
2. **Conversão de Datas**: O formato do CSV é DD/MM/YYYY, converter para YYYY-MM-DD
3. **Valores Booleanos**: Converter "0"/"1" e "SIM"/"NAO" para false/true
4. **Valores Nulos**: Campos vazios ou "Atualizar" devem ser NULL
5. **user_id**: Deixar NULL inicialmente (será preenchido quando criar usuários no Auth)
6. **Encoding**: Os CSVs estão em UTF-8, atenção com caracteres especiais

## 5. Validação Pós-Importação

```sql
-- Verificar quantidade de setores importados
SELECT COUNT(*) FROM setores WHERE orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3';
-- Esperado: 289 registros

-- Verificar quantidade de perfis importados
SELECT COUNT(*) FROM perfis WHERE orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3';
-- Esperado: 1956 registros

-- Verificar distribuição por papel
SELECT papel, COUNT(*) 
FROM perfis 
WHERE orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3'
GROUP BY papel;

-- Verificar setores sem perfis
SELECT s.codigo, s.nome, COUNT(p.id) as total_servidores
FROM setores s
LEFT JOIN perfis p ON p.setor_id = s.id
WHERE s.orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3'
GROUP BY s.id, s.codigo, s.nome
ORDER BY total_servidores DESC;
```

## 6. Próximos Passos Após Importação

1. Criar usuários de teste no Supabase Auth
2. Vincular user_id aos perfis correspondentes
3. Testar as políticas RLS
4. Configurar os dashboards por papel
