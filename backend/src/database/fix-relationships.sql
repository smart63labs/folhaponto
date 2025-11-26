-- Script para corrigir relacionamentos conforme solicitado

-- 1. Alterar perfil_permissoes para ter usuario_id ao invés de perfil
-- Primeiro, criar nova estrutura
ALTER TABLE perfil_permissoes ADD usuario_id NUMBER;
ALTER TABLE perfil_permissoes ADD CONSTRAINT fk_perfil_permissoes_usuario
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Migrar dados existentes (associar permissões aos usuários baseados no perfil)
UPDATE perfil_permissoes pp
SET usuario_id = (
    SELECT u.id
    FROM usuarios u
    WHERE u.perfil = pp.perfil
    AND ROWNUM = 1  -- Pega apenas o primeiro usuário de cada perfil
);

-- Remover coluna perfil antiga
ALTER TABLE perfil_permissoes DROP COLUMN perfil;

-- 2. Adicionar relacionamento para feriados
-- Feriados podem afetar setores específicos
ALTER TABLE feriados ADD setor_id NUMBER;
ALTER TABLE feriados ADD CONSTRAINT fk_feriados_setor
FOREIGN KEY (setor_id) REFERENCES setores(id);

-- Verificar mudanças
SELECT table_name, column_name, data_type, nullable
FROM user_tab_columns
WHERE table_name IN ('PERFIL_PERMISSOES', 'FERIADOS')
ORDER BY table_name, column_id;

COMMIT;