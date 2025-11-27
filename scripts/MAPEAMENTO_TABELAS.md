# Mapeamento Completo das Tabelas para Importação CSV

## Tabela SETORES - Estrutura Atual no Banco

| Coluna no Banco | Tipo | Coluna no CSV | Observações |
|-----------------|------|---------------|-------------|
| **id** | uuid | - | Gerado automaticamente (UUID) |
| **orgao_id** | uuid | - | Fixo: `04e86ec7-8fdd-4e80-ade9-1d4eb45447a3` |
| **id_original** | integer | **ID** | ID original do CSV |
| **codigo** | text | **CODIGO_SETOR** | Ex: 013.AGEATABR |
| **nome** | text | **NOME_SETOR** | Nome do setor |
| **ativo** | boolean | **ATIVO** | Converter: "0" → false, "1" → true |
| **logradouro** | text | **LOGRADOURO** | Endereço |
| **numero** | text | **NUMERO** | Número |
| **complemento** | text | **COMPLEMENTO** | Complemento |
| **bairro** | text | **BAIRRO** | Bairro |
| **cidade** | text | **CIDADE** | Cidade |
| **estado** | text | **ESTADO** | UF |
| **cep** | text | **CEP** | CEP |
| **telefone** | text | **TELEFONE** | Telefone |
| **email** | text | **EMAIL** | Email |
| **latitude** | numeric | **LATITUDE** | Coordenada |
| **longitude** | numeric | **LONGITUDE** | Coordenada |
| **criado_em** | timestamptz | **DATA_CRIACAO** | Data de criação |
| **data_atualizacao** | timestamptz | **DATA_ATUALIZACAO** | Data de atualização |
| **parent_id** | uuid | - | NULL (não usado no CSV) |

### Colunas do CSV SETORES.csv:
```
ID, CODIGO_SETOR, NOME_SETOR, ORGAO, ATIVO, LOGRADOURO, NUMERO, COMPLEMENTO, 
BAIRRO, CIDADE, ESTADO, CEP, TELEFONE, EMAIL, DATA_CRIACAO, DATA_ATUALIZACAO, 
LATITUDE, LONGITUDE
```

### Exemplo de INSERT para SETORES:
```sql
INSERT INTO setores (
  orgao_id,
  id_original,
  codigo,
  nome,
  ativo,
  logradouro,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cep,
  telefone,
  email,
  latitude,
  longitude,
  criado_em,
  data_atualizacao
) VALUES (
  '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3',  -- orgao_id fixo
  1,                                         -- ID do CSV
  '013.AGEATABR',                           -- CODIGO_SETOR
  'Agência de Atendimento de Abreulândia', -- NOME_SETOR
  false,                                     -- ATIVO (0 = false)
  'R. Mariano Pereira',                     -- LOGRADOURO
  'sem número',                             -- NUMERO
  null,                                      -- COMPLEMENTO
  'Centro',                                  -- BAIRRO
  'Abreulândia',                            -- CIDADE
  'TO',                                      -- ESTADO
  '77693-000',                              -- CEP
  '(63) 1234-1234',                         -- TELEFONE
  'atualizar_email@sefaz.to.gov.br',       -- EMAIL
  -9.6221526,                               -- LATITUDE
  -49.1558343,                              -- LONGITUDE
  '2025-10-14 09:26:42.999',               -- DATA_CRIACAO
  '2025-11-14 08:10:29.252'                -- DATA_ATUALIZACAO
);
```

---

## Tabela PERFIS - Estrutura para Servidores

### Colunas do CSV SERVIDORES.csv:
```
ORDEM, NOME, NUMFUNC, NUMVINC, CPF, PIS/PASEP, SEXO, ESTCIVIL, DTNASC, PAI, MAE, 
CIDNASC, UFNASC, TIPO_SANGUINEO, RACA_COR, PNE, TIPODEFIC, DT_INGRE_SERV_PUB, 
TIPO_VINCULO, CATEGORIA, REGIMEJUR, CODIGO_CARGO, CARGO, ORGAO, SETOR, LOTACAO, 
MUNICIPIO_LOTACAO, SITUACAO, HIERARQUIA_SETOR, TELEFONE, ENDERECO, NUMENDER, 
COMPLENDER, BAIRROENDER, CIDADEENDER, UFENDER, CEPENDER, E_MAIL
```

### Mapeamento CSV → Banco de Dados:

| Coluna no Banco | Tipo | Coluna no CSV | Conversão Necessária |
|-----------------|------|---------------|----------------------|
| **id** | uuid | - | Gerado automaticamente |
| **user_id** | uuid | - | NULL (preencher depois) |
| **orgao_id** | uuid | - | Fixo: `04e86ec7-8fdd-4e80-ade9-1d4eb45447a3` |
| **setor_id** | uuid | **SETOR** | Buscar ID pelo código do setor |
| **papel** | enum | **CARGO** | Determinar por lógica (ver abaixo) |
| **nome** | text | **NOME** | - |
| **email** | text | **E_MAIL** | - |
| **ativo** | boolean | **SITUACAO** | "ATIVO" → true, outros → false |
| **ordem** | integer | **ORDEM** | - |
| **numfunc** | text | **NUMFUNC** | - |
| **numvinc** | text | **NUMVINC** | - |
| **cpf** | text | **CPF** | - |
| **pis_pasep** | text | **PIS/PASEP** | - |
| **sexo** | text | **SEXO** | - |
| **estado_civil** | text | **ESTCIVIL** | - |
| **data_nascimento** | date | **DTNASC** | Converter DD/MM/YYYY → YYYY-MM-DD |
| **nome_pai** | text | **PAI** | - |
| **nome_mae** | text | **MAE** | - |
| **cidade_nascimento** | text | **CIDNASC** | - |
| **uf_nascimento** | text | **UFNASC** | - |
| **tipo_sanguineo** | text | **TIPO_SANGUINEO** | - |
| **raca_cor** | text | **RACA_COR** | - |
| **pne** | boolean | **PNE** | "SIM" → true, "NAO" → false |
| **tipo_deficiencia** | text | **TIPODEFIC** | - |
| **data_ingresso_servico_publico** | date | **DT_INGRE_SERV_PUB** | Converter DD/MM/YYYY → YYYY-MM-DD |
| **tipo_vinculo** | text | **TIPO_VINCULO** | - |
| **categoria** | text | **CATEGORIA** | - |
| **regime_juridico** | text | **REGIMEJUR** | - |
| **codigo_cargo** | text | **CODIGO_CARGO** | - |
| **cargo** | text | **CARGO** | - |
| **lotacao** | text | **LOTACAO** | - |
| **municipio_lotacao** | text | **MUNICIPIO_LOTACAO** | - |
| **situacao** | text | **SITUACAO** | - |
| **hierarquia_setor** | text | **HIERARQUIA_SETOR** | - |
| **telefone** | text | **TELEFONE** | - |
| **endereco** | text | **ENDERECO** | - |
| **numero_endereco** | text | **NUMENDER** | - |
| **complemento_endereco** | text | **COMPLENDER** | - |
| **bairro_endereco** | text | **BAIRROENDER** | - |
| **cidade_endereco** | text | **CIDADEENDER** | - |
| **uf_endereco** | text | **UFENDER** | - |
| **cep_endereco** | text | **CEPENDER** | - |
| **criado_em** | timestamptz | - | now() |

### Lógica para Determinar o PAPEL:

```sql
CASE 
  WHEN LOWER(cargo) LIKE '%diretor%' 
    OR LOWER(cargo) LIKE '%gerente%' 
    OR LOWER(cargo) LIKE '%coordenador%' 
    OR LOWER(cargo) LIKE '%chefia%'
    OR LOWER(cargo) LIKE '%chefe%'
  THEN 'chefia'
  
  WHEN LOWER(cargo) LIKE '%rh%' 
    OR LOWER(cargo) LIKE '%recursos humanos%'
    OR LOWER(cargo) LIKE '%gestão de pessoas%'
  THEN 'rh'
  
  WHEN LOWER(cargo) LIKE '%admin%' 
    OR LOWER(cargo) LIKE '%secretário%'
    OR LOWER(cargo) LIKE '%secretario%'
    OR LOWER(cargo) LIKE '%superintendente%'
  THEN 'admin'
  
  ELSE 'servidor'
END as papel
```

### Exemplo de INSERT para PERFIS:

```sql
-- Buscar setor_id pelo código
WITH setor_info AS (
  SELECT id 
  FROM setores 
  WHERE codigo = '013.DIREXEFIN' 
    AND orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3'
)
INSERT INTO perfis (
  orgao_id,
  setor_id,
  papel,
  nome,
  email,
  ativo,
  ordem,
  numfunc,
  numvinc,
  cpf,
  pis_pasep,
  sexo,
  estado_civil,
  data_nascimento,
  nome_pai,
  nome_mae,
  cidade_nascimento,
  uf_nascimento,
  tipo_sanguineo,
  raca_cor,
  pne,
  tipo_deficiencia,
  data_ingresso_servico_publico,
  tipo_vinculo,
  categoria,
  regime_juridico,
  codigo_cargo,
  cargo,
  lotacao,
  municipio_lotacao,
  situacao,
  hierarquia_setor,
  telefone,
  endereco,
  numero_endereco,
  complemento_endereco,
  bairro_endereco,
  cidade_endereco,
  uf_endereco,
  cep_endereco
)
SELECT
  '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3',  -- orgao_id
  setor_info.id,                            -- setor_id
  'chefia',                                 -- papel (determinar pela lógica)
  'ABMAEL SANTOS BORGES',                   -- nome
  'atualizar_email@sefaz.to.gov.br',       -- email
  true,                                      -- ativo (SITUACAO = 'ATIVO')
  1,                                         -- ordem
  '11583177',                               -- numfunc
  '6',                                       -- numvinc
  '063.743.251-76',                         -- cpf
  '21275538152',                            -- pis_pasep
  'M',                                       -- sexo
  'SOLTEIRO',                               -- estado_civil
  '1999-03-01',                             -- data_nascimento (convertido)
  'ANIBRA DA SILVA BORGES',                 -- nome_pai
  'SILVIA FERREIRA DOS SANTOS BORGES',      -- nome_mae
  'MIRACEMA DO TOCANTINS',                  -- cidade_nascimento
  'TO',                                      -- uf_nascimento
  'Atualizar',                              -- tipo_sanguineo
  'Parda',                                   -- raca_cor
  false,                                     -- pne (NAO = false)
  'Atualizar',                              -- tipo_deficiencia
  '2017-03-01',                             -- data_ingresso_servico_publico
  'COMISSIONADO',                           -- tipo_vinculo
  'CARGO COMISSAO',                         -- categoria
  'ESTATUTARIO',                            -- regime_juridico
  '1978',                                    -- codigo_cargo
  'Diretor de Execução Financeira',        -- cargo
  'Diretoria de Execução Financeira',      -- lotacao
  'PALMAS',                                  -- municipio_lotacao
  'ATIVO',                                   -- situacao
  'SEFAZ/013.GABSEC/013.GABSEXT/013.SUTES/013.DIREXEFIN', -- hierarquia_setor
  '(63) 99984-2328',                        -- telefone
  'ARNO 71 ALAMEDA 23 17 N 17 QI 10 LT 01 CASA', -- endereco
  '3',                                       -- numero_endereco
  'Atualizar',                              -- complemento_endereco
  'CENTRO',                                  -- bairro_endereco
  'PALMAS',                                  -- cidade_endereco
  'TO',                                      -- uf_endereco
  '77001877'                                -- cep_endereco
FROM setor_info;
```

---

## Conversões Necessárias

### 1. Datas (DD/MM/YYYY → YYYY-MM-DD)
```
01/03/1999 → 1999-03-01
```

### 2. Booleanos
```
ATIVO: "0" → false, "1" → true
PNE: "SIM" → true, "NAO" → false
SITUACAO: "ATIVO" → true, outros → false
```

### 3. Valores NULL
```
"Atualizar", "atualizar endereço", "sem número", "0" → NULL (quando apropriado)
```

---

## Ordem de Importação

1. ✅ **SETORES** (289 registros)
2. ✅ **PERFIS** (1956 registros) - Após setores estarem importados

---

## Validação Pós-Importação

```sql
-- Total de setores
SELECT COUNT(*) as total_setores 
FROM setores 
WHERE orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3';
-- Esperado: 289

-- Total de perfis
SELECT COUNT(*) as total_perfis 
FROM perfis 
WHERE orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3';
-- Esperado: 1956

-- Distribuição por papel
SELECT papel, COUNT(*) as total
FROM perfis 
WHERE orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3'
GROUP BY papel
ORDER BY total DESC;

-- Servidores por setor
SELECT s.codigo, s.nome, COUNT(p.id) as total_servidores
FROM setores s
LEFT JOIN perfis p ON p.setor_id = s.id
WHERE s.orgao_id = '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3'
GROUP BY s.id, s.codigo, s.nome
ORDER BY total_servidores DESC
LIMIT 20;
```
