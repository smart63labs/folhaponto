-- Script para adicionar constraints de relacionamento que estão faltando

-- Adicionar FK para auditoria_login.usuario_id -> usuarios.id
ALTER TABLE auditoria_login
ADD CONSTRAINT fk_auditoria_usuario
FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

-- Verificar se as constraints foram adicionadas
SELECT
    table_name,
    constraint_name,
    constraint_type,
    r_constraint_name
FROM user_constraints
WHERE table_name IN ('AUDITORIA_LOGIN', 'PERFIL_PERMISSOES')
ORDER BY table_name, constraint_name;

COMMIT;