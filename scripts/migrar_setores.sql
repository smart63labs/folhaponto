-- Migração de Setores do CSV para o Supabase
-- Órgão: Secretaria da Fazenda do Tocantins (SEFAZ-TO)

-- Inserir setores (primeiros 50 registros como exemplo)
INSERT INTO setores (orgao_id, codigo, nome, ativo, logradouro, numero, complemento, bairro, cidade, estado, cep, telefone, email, latitude, longitude, criado_em, data_atualizacao)
VALUES
('04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', '013.AGEATABR', 'Agência de Atendimento de Abreulândia', false, 'R. Mariano Pereira', 'sem número', null, 'Centro', 'Abreulândia', 'TO', '77693-000', '(63) 1234-1234', 'atualizar_email@sefaz.to.gov.br', -9.6221526, -49.1558343, '2025-10-14 09:26:42.999', '2025-11-14 08:10:29.252'),
('04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', '013.AGEATAGU', 'Agência de Atendimento de Aguiarnópolis', false, 'atualizar endereço', '0', null, 'CENTRO', 'AGUIARNOPOLIS', 'TO', '77908-000', '63 - 1234-5678', 'atualizar_email@sefaz.to.gov.br', -6.56256251, -47.4710243, '2025-10-14 09:26:42.999', '2025-11-14 08:10:29.254'),
('04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', '013.AGEATALT', 'Agência de Atendimento de Aliança do Tocantins', false, 'atualizar endereço', '0', null, 'CENTRO', 'ALIANCA DO TOCANTINS', 'TO', '77455000', '63 - 1234-5678', 'atualizar_email@sefaz.to.gov.br', -11.30677761, -48.93887309, '2025-10-14 09:26:42.999', '2025-11-14 08:10:29.255'),
('04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', '013.AGEATALM', 'Agência de Atendimento de Almas', false, 'atualizar endereço', '0', null, 'CENTRO', 'ALMAS', 'TO', '77310000', '63 - 1234-5678', 'atualizar_email@sefaz.to.gov.br', -11.56794243, -47.17041349, '2025-10-14 09:26:42.999', '2025-11-14 08:15:47.060'),
('04e86ec7-8fdd-4e80-ade9-1d4eb45447a3', '013.AGEATALV', 'Agência de Atendimento de Alvorada', false, 'atualizar endereço', '0', null, 'CENTRO', 'ALVORADA', 'TO', '77480000', '63 - 1234-5678', 'atualizar_email@sefaz.to.gov.br', -12.49298486, -49.13165217, '2025-10-14 09:26:42.999', '2025-11-14 08:18:56.060');

-- Nota: Este é apenas um exemplo com 5 registros.
-- Para migrar todos os 289 setores, você precisará processar o CSV completo.
