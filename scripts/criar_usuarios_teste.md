# Criação de Usuários de Teste - Sistema de Ponto Eletrônico

## Importante
Os usuários precisam ser criados no Supabase Auth primeiro. Isso pode ser feito de duas formas:

### Opção 1: Via Supabase Dashboard
1. Acesse: https://supabase.com/dashboard/project/mkkrgusbmciegbtuqpde/auth/users
2. Clique em "Add user" > "Create new user"
3. Crie cada usuário com email e senha

### Opção 2: Via SQL (após criar no Auth)

Após criar os usuários no Supabase Auth, execute este SQL para criar os perfis:

```sql
-- Criar setor de teste (Gabinete do Secretário)
INSERT INTO setores (orgao_id, codigo, nome, ativo)
VALUES 
('04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', '013.GABSEC', 'Gabinete do Secretário', true)
RETURNING id;

-- Assumindo que o setor retornou o ID: SETOR_ID_AQUI

-- Criar perfis (substitua USER_ID_X pelos IDs reais dos usuários criados no Auth)
INSERT INTO perfis (user_id, orgao_id, setor_id, papel, nome, email, ativo)
VALUES
-- Servidor
('USER_ID_1', '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', 'SETOR_ID_AQUI', 'servidor', 'João Silva', 'joao.silva@sefaz.to.gov.br', true),

-- Chefia
('USER_ID_2', '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', 'SETOR_ID_AQUI', 'chefia', 'Admin Chefia Setor', 'admin_chefiasetor@sefaz.to.gov.br', true),

-- RH
('USER_ID_3', '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', 'SETOR_ID_AQUI', 'rh', 'Admin Chefia RH', 'admin_chefiarh@sefaz.to.gov.br', true),

-- Admin
('USER_ID_4', '04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', 'SETOR_ID_AQUI', 'admin', 'Admin Ponto Eletrônico', 'admin_pontoeletronico@sefaz.to.gov.br', true);
```

## Usuários de Teste

| Email | Senha | Papel | Dashboard |
|-------|-------|-------|-----------|
| joao.silva@sefaz.to.gov.br | 123456 | servidor | Dashboard do Servidor |
| admin_chefiasetor@sefaz.to.gov.br | 123456 | chefia | Dashboard da Chefia |
| admin_chefiarh@sefaz.to.gov.br | 123456 | rh | Dashboard do RH |
| admin_pontoeletronico@sefaz.to.gov.br | 123456 | admin | Dashboard Admin |

## Próximos Passos

1. Criar os usuários no Supabase Auth Dashboard
2. Anotar os UUIDs gerados para cada usuário
3. Executar o SQL acima substituindo os USER_ID_X pelos UUIDs reais
4. Configurar as políticas RLS para redirecionar cada papel ao dashboard correto
