-- PASSO 2: Execute este script APÓS importar os dados do CSV de USUARIOS
-- Este script converte campos TEXT para os tipos corretos

-- 1. Converter coluna PNE (SIM/NAO → boolean)
ALTER TABLE usuarios ADD COLUMN pne_temp boolean;

UPDATE usuarios
SET pne_temp = CASE 
  WHEN UPPER(pne) IN ('SIM', 'S', 'TRUE', 'T', '1') THEN true
  WHEN UPPER(pne) IN ('NAO', 'NÃO', 'N', 'FALSE', 'F', '0') THEN false
  ELSE false
END;

ALTER TABLE usuarios DROP COLUMN pne;
ALTER TABLE usuarios RENAME COLUMN pne_temp TO pne;
ALTER TABLE usuarios ALTER COLUMN pne SET DEFAULT false;

-- 2. Converter coluna SENHA_ALTERADA
ALTER TABLE usuarios ADD COLUMN senha_alterada_temp boolean;

UPDATE usuarios
SET senha_alterada_temp = CASE 
  WHEN UPPER(senha_alterada) IN ('SIM', 'S', 'TRUE', 'T', '1') THEN true
  WHEN UPPER(senha_alterada) IN ('NAO', 'NÃO', 'N', 'FALSE', 'F', '0') THEN false
  ELSE false
END;

ALTER TABLE usuarios DROP COLUMN senha_alterada;
ALTER TABLE usuarios RENAME COLUMN senha_alterada_temp TO senha_alterada;
ALTER TABLE usuarios ALTER COLUMN senha_alterada SET DEFAULT false;

-- 3. Converter coluna USUARIO_ATIVO
ALTER TABLE usuarios ADD COLUMN usuario_ativo_temp boolean;

UPDATE usuarios
SET usuario_ativo_temp = CASE 
  WHEN UPPER(usuario_ativo) IN ('SIM', 'S', 'TRUE', 'T', '1', 'ATIVO') THEN true
  WHEN UPPER(usuario_ativo) IN ('NAO', 'NÃO', 'N', 'FALSE', 'F', '0', 'INATIVO') THEN false
  ELSE true
END;

ALTER TABLE usuarios DROP COLUMN usuario_ativo;
ALTER TABLE usuarios RENAME COLUMN usuario_ativo_temp TO usuario_ativo;
ALTER TABLE usuarios ALTER COLUMN usuario_ativo SET DEFAULT true;

-- 4. Converter datas se necessário (formato DD/MM/YYYY)
-- Se data_nascimento estiver como TEXT
DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'data_nascimento') = 'text' THEN
    
    ALTER TABLE usuarios ADD COLUMN data_nascimento_temp date;
    
    UPDATE usuarios
    SET data_nascimento_temp = TO_DATE(data_nascimento, 'DD/MM/YYYY')
    WHERE data_nascimento IS NOT NULL AND data_nascimento != '';
    
    ALTER TABLE usuarios DROP COLUMN data_nascimento;
    ALTER TABLE usuarios RENAME COLUMN data_nascimento_temp TO data_nascimento;
  END IF;
END $$;

-- 5. Converter expedicao_rg se necessário
DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'expedicao_rg') = 'text' THEN
    
    ALTER TABLE usuarios ADD COLUMN expedicao_rg_temp date;
    
    UPDATE usuarios
    SET expedicao_rg_temp = TO_DATE(expedicao_rg, 'DD/MM/YYYY')
    WHERE expedicao_rg IS NOT NULL AND expedicao_rg != '';
    
    ALTER TABLE usuarios DROP COLUMN expedicao_rg;
    ALTER TABLE usuarios RENAME COLUMN expedicao_rg_temp TO expedicao_rg;
  END IF;
END $$;

-- 6. Converter data_inicio_comissao se necessário
DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'data_inicio_comissao') = 'text' THEN
    
    ALTER TABLE usuarios ADD COLUMN data_inicio_comissao_temp date;
    
    UPDATE usuarios
    SET data_inicio_comissao_temp = TO_DATE(data_inicio_comissao, 'DD/MM/YYYY')
    WHERE data_inicio_comissao IS NOT NULL AND data_inicio_comissao != '';
    
    ALTER TABLE usuarios DROP COLUMN data_inicio_comissao;
    ALTER TABLE usuarios RENAME COLUMN data_inicio_comissao_temp TO data_inicio_comissao;
  END IF;
END $$;

-- 7. Adicionar constraints NOT NULL de volta nos campos obrigatórios
ALTER TABLE usuarios ALTER COLUMN orgao_id SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN papel SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN nome SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN email SET NOT NULL;

-- 8. Converter timestamps (formato: DD/MM/YY HH24:MI:SS,MS TZ)
ALTER TABLE usuarios ADD COLUMN ultimo_login_temp timestamptz;
ALTER TABLE usuarios ADD COLUMN data_criacao_temp timestamptz;
ALTER TABLE usuarios ADD COLUMN data_atualizacao_temp timestamptz;
ALTER TABLE usuarios ADD COLUMN bloqueado_ate_temp timestamptz;

-- Converter ultimo_login
UPDATE usuarios
SET ultimo_login_temp = TO_TIMESTAMP(
  REGEXP_REPLACE(ultimo_login, ',.*', ''), 
  'DD/MM/YY HH24:MI:SS'
)
WHERE ultimo_login IS NOT NULL AND ultimo_login != '';

-- Converter data_criacao
UPDATE usuarios
SET data_criacao_temp = TO_TIMESTAMP(
  REGEXP_REPLACE(data_criacao, ',.*', ''), 
  'DD/MM/YY HH24:MI:SS'
)
WHERE data_criacao IS NOT NULL AND data_criacao != '';

-- Converter data_atualizacao
UPDATE usuarios
SET data_atualizacao_temp = TO_TIMESTAMP(
  REGEXP_REPLACE(data_atualizacao, ',.*', ''), 
  'DD/MM/YY HH24:MI:SS'
)
WHERE data_atualizacao IS NOT NULL AND data_atualizacao != '';

-- Converter bloqueado_ate
UPDATE usuarios
SET bloqueado_ate_temp = TO_TIMESTAMP(
  REGEXP_REPLACE(bloqueado_ate, ',.*', ''), 
  'DD/MM/YY HH24:MI:SS'
)
WHERE bloqueado_ate IS NOT NULL AND bloqueado_ate != '';

-- Remover colunas antigas e renomear
ALTER TABLE usuarios DROP COLUMN ultimo_login;
ALTER TABLE usuarios DROP COLUMN data_criacao;
ALTER TABLE usuarios DROP COLUMN data_atualizacao;
ALTER TABLE usuarios DROP COLUMN bloqueado_ate;

ALTER TABLE usuarios RENAME COLUMN ultimo_login_temp TO ultimo_login;
ALTER TABLE usuarios RENAME COLUMN data_criacao_temp TO data_criacao;
ALTER TABLE usuarios RENAME COLUMN data_atualizacao_temp TO data_atualizacao;
ALTER TABLE usuarios RENAME COLUMN bloqueado_ate_temp TO bloqueado_ate;

-- Adicionar default
ALTER TABLE usuarios ALTER COLUMN data_criacao SET DEFAULT now();

-- 9. Verificar resultado
SELECT 
  id,
  nome,
  cpf,
  pne,
  senha_alterada,
  usuario_ativo,
  data_nascimento,
  data_criacao,
  ultimo_login,
  papel
FROM usuarios 
LIMIT 10;
