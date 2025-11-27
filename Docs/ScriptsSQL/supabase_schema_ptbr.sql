create extension if not exists pgcrypto;

create type papel_usuario as enum ('servidor','chefia','rh','admin');

create table orgao_gov (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  sigla text not null,
  cnpj text,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table perfis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  orgao_id uuid not null references orgao_gov(id) on delete cascade,
  setor_id uuid references setores(id),
  papel papel_usuario not null,
  nome text not null,
  email text not null,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table setores (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id) on delete cascade,
  nome text not null,
  codigo text not null,
  parent_id uuid references setores(id),
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table hierarquia_setores (
  orgao_id uuid not null,
  setor_ancora_id uuid not null references setores(id) on delete cascade,
  setor_desc_id uuid not null references setores(id) on delete cascade,
  profundidade int not null,
  primary key (orgao_id, setor_ancora_id, setor_desc_id)
);

create table jornadas (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  nome text not null,
  tipo text not null,
  hora_inicio time not null,
  hora_fim time not null,
  intervalo_minutos int default 60,
  regras jsonb,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table escalas (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  setor_id uuid references setores(id),
  perfil_id uuid references perfis(id),
  data_inicio date not null,
  data_fim date not null,
  jornada_id uuid references jornadas(id),
  observacoes text,
  criado_em timestamptz default now()
);

create table registros_ponto (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  perfil_id uuid not null references perfis(id),
  setor_id uuid references setores(id),
  data date not null,
  tipo text not null,
  horario timestamptz not null,
  origem text not null,
  localizacao jsonb,
  manual boolean default false,
  observacoes text
);

create table frequencias (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  perfil_id uuid not null references perfis(id),
  data date not null,
  horas_trabalhadas numeric(6,2) default 0,
  horas_devidas numeric(6,2) default 8,
  status text not null,
  observacoes text,
  unique (orgao_id, perfil_id, data)
);

create table ocorrencias (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  perfil_id uuid not null references perfis(id),
  tipo text not null,
  data_ocorrencia date not null,
  descricao text,
  justificativa text,
  anexos jsonb,
  status text not null default 'pendente',
  prioridade text default 'media',
  criado_em timestamptz default now(),
  prazo_limite date
);

create table aprovacoes (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  referencia_tipo text not null,
  referencia_id uuid not null,
  nivel int not null,
  aprovador_id uuid not null references perfis(id),
  aprovador_papel papel_usuario not null,
  status text not null,
  aprovado_em timestamptz,
  observacoes text,
  unique (orgao_id, referencia_tipo, referencia_id, nivel, aprovador_id)
);

create table banco_horas_saldos (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  perfil_id uuid not null references perfis(id),
  saldo_atual numeric(7,2) not null default 0,
  saldo_disponivel numeric(7,2) not null default 0,
  horas_vencendo numeric(7,2) default 0,
  data_vencimento date
);

create table banco_horas_movimentos (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  perfil_id uuid not null references perfis(id),
  data date not null,
  tipo text not null,
  horas numeric(7,2) not null,
  descricao text,
  status text not null default 'pendente',
  aprovado_por uuid references perfis(id),
  data_aprovacao date,
  observacoes text,
  solicitado_em timestamptz default now()
);

create table atestos (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  perfil_id uuid not null references perfis(id),
  periodo daterange not null,
  status text not null default 'pending',
  criado_em timestamptz default now(),
  concluido_em timestamptz,
  observacoes text
);

create table uploads_frequencia (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  setor_id uuid references setores(id),
  mes int not null,
  ano int not null,
  arquivo text not null,
  status text not null,
  funcionarios int,
  observacoes text,
  tamanho_bytes bigint,
  data_upload timestamptz default now()
);

create table modelos_frequencia (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  nome text not null,
  descricao text,
  arquivo text,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table modelos_relatorios (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  nome text not null,
  categoria text not null,
  descricao text,
  parametros jsonb,
  formatos text[],
  status text not null default 'disponivel'
);

create table relatorios_agendados (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  modelo_id uuid not null references modelos_relatorios(id),
  nome text not null,
  frequencia text not null,
  proxima_execucao date,
  status text not null,
  ultima_execucao date,
  destinatarios text[]
);

create table modelos_exportacao (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  nome text not null,
  descricao text,
  tipo text not null,
  formato text not null,
  campos text[],
  filtros jsonb,
  agendamento jsonb,
  ultima_execucao timestamptz,
  status text not null,
  criado_por text,
  criado_em date
);

create table exportacoes (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  modelo_id uuid references modelos_exportacao(id),
  status text not null,
  progresso int default 0,
  inicio timestamptz,
  fim timestamptz,
  arquivo text,
  tamanho text,
  erro text
);

create table auditoria_logs (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  timestamp timestamptz not null default now(),
  perfil_id uuid references perfis(id),
  modulo text not null,
  acao text not null,
  detalhes text,
  ip inet,
  user_agent text,
  status text,
  nivel text,
  dados_anteriores jsonb,
  dados_novos jsonb
);

create table feriados (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  data date not null,
  nome text not null,
  escopo text not null,
  setor_id uuid references setores(id)
);

create table configuracoes_sistema (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  categoria text not null,
  chave text not null,
  valor jsonb not null,
  sensivel boolean default false,
  unique (orgao_id, categoria, chave)
);

create table cadastro_facial (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  perfil_id uuid not null references perfis(id),
  descriptor float8[] not null,
  imagem_path text,
  criado_em timestamptz default now()
);

create table dispositivos (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  perfil_id uuid references perfis(id),
  tipo text,
  identificador text,
  ultimo_uso timestamptz,
  dados jsonb
);

create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  orgao_id uuid not null references orgao_gov(id),
  perfil_id uuid references perfis(id),
  titulo text,
  mensagem text,
  canal text,
  status text,
  criado_em timestamptz default now()
);

create index idx_registros_ponto_orgao_perfil_data on registros_ponto(orgao_id, perfil_id, data);
create index idx_registros_ponto_orgao_setor_data on registros_ponto(orgao_id, setor_id, data);
create index idx_frequencias_orgao_perfil_data on frequencias(orgao_id, perfil_id, data);
create index idx_ocorrencias_orgao_perfil_status_data on ocorrencias(orgao_id, perfil_id, status, data_ocorrencia);
create index idx_aprovacoes_orgao_ref on aprovacoes(orgao_id, referencia_tipo, referencia_id);
create index idx_bh_mov_orgao_perfil_data_status on banco_horas_movimentos(orgao_id, perfil_id, data, status);
create index idx_auditoria_logs_orgao_timestamp on auditoria_logs(orgao_id, timestamp);
create index idx_uploads_frequencia_orgao_ano_mes_setor on uploads_frequencia(orgao_id, ano, mes, setor_id);

-- =============================================================================
-- RLS (Row Level Security) Policies
-- =============================================================================

-- Enable RLS on all tables
alter table orgao_gov enable row level security;
alter table perfis enable row level security;
alter table setores enable row level security;
alter table hierarquia_setores enable row level security;
alter table jornadas enable row level security;
alter table escalas enable row level security;
alter table registros_ponto enable row level security;
alter table frequencias enable row level security;
alter table ocorrencias enable row level security;
alter table aprovacoes enable row level security;
alter table banco_horas_saldos enable row level security;
alter table banco_horas_movimentos enable row level security;
alter table atestos enable row level security;
alter table uploads_frequencia enable row level security;
alter table modelos_frequencia enable row level security;
alter table modelos_relatorios enable row level security;
alter table relatorios_agendados enable row level security;
alter table modelos_exportacao enable row level security;
alter table exportacoes enable row level security;
alter table auditoria_logs enable row level security;
alter table feriados enable row level security;
alter table configuracoes_sistema enable row level security;
alter table cadastro_facial enable row level security;
alter table dispositivos enable row level security;
alter table notificacoes enable row level security;

-- Helper Function to get current user context
-- Returns the profile associated with the authenticated user
create or replace function public.get_my_claim()
returns jsonb
language sql stable
as $$
  select to_jsonb(p.*) from public.perfis p where p.user_id = auth.uid() limit 1;
$$;

-- Basic Policies (Examples - Adjust based on strict requirements)

-- 1. Orgao Gov
-- Readable by users belonging to it.
create policy "Orgao visivel para membros" on orgao_gov
  for select using (id in (select orgao_id from perfis where user_id = auth.uid()));

-- 2. Perfis
-- Users can see profiles in their same org.
create policy "Perfis visiveis para membros do mesmo orgao" on perfis
  for select using (orgao_id in (select orgao_id from perfis where user_id = auth.uid()));
-- Users can update their own profile (e.g. name, email - limited fields in reality)
create policy "Usuario pode editar proprio perfil" on perfis
  for update using (user_id = auth.uid());

-- 3. Setores
-- Visible to org members.
create policy "Setores visiveis para orgao" on setores
  for select using (orgao_id in (select orgao_id from perfis where user_id = auth.uid()));
-- Manageable by Admin/RH
create policy "Setores gerenciaveis por Admin/RH" on setores
  for all using (
    exists (
      select 1 from perfis 
      where user_id = auth.uid() 
      and orgao_id = setores.orgao_id 
      and papel in ('admin', 'rh')
    )
  );

-- 4. Registros Ponto
-- Visible to own user, or Chefia (of sector), or RH/Admin.
create policy "Ponto visivel para dono" on registros_ponto
  for select using (perfil_id in (select id from perfis where user_id = auth.uid()));

create policy "Ponto visivel para Chefia/RH/Admin" on registros_ponto
  for select using (
    exists (
      select 1 from perfis p
      where p.user_id = auth.uid()
      and p.orgao_id = registros_ponto.orgao_id
      and (
        p.papel in ('admin', 'rh')
        or (p.papel = 'chefia' and p.setor_id = registros_ponto.setor_id)
      )
    )
  );

create policy "Ponto inserivel pelo proprio usuario (se manual permitido) ou sistema" on registros_ponto
  for insert with check (
    perfil_id in (select id from perfis where user_id = auth.uid())
  );

-- ... (Similar policies should be applied to all other tables)
-- For brevity in this initial script, we apply a 'Deny All' default (implicit) and 'Allow by Org + Role' pattern.

-- General Org Isolation Policy (Template for other tables)
-- CREATE POLICY "Tenant Isolation" ON table_name
-- USING (orgao_id = (select orgao_id from perfis where user_id = auth.uid()));

