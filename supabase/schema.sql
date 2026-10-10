-- =====================================================================
-- Sistema Clube Juvenil Alfa — Schema completo
-- Rodar UMA ÚNICA VEZ no Supabase SQL Editor (projeto oagtlufdoziwrgutxpwi)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Perfis (voluntárias) — vinculado ao Supabase Auth
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  cargo text not null check (cargo in ('diretora','preceptora','monitora')),
  telefone text,
  data_nasc date,
  status text not null default 'ativa' check (status in ('ativa','inativa')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_cargo on public.profiles(cargo);

-- ---------------------------------------------------------------------
-- 2. Famílias (contatos dos pais; sem login)
-- ---------------------------------------------------------------------
create table if not exists public.familias (
  id uuid primary key default gen_random_uuid(),
  responsavel text not null,
  telefone text,
  email text,
  observacoes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Meninas
-- ---------------------------------------------------------------------
create table if not exists public.meninas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data_nasc date,
  familia_id uuid references public.familias(id) on delete set null,
  status text not null default 'ativa' check (status in ('ativa','inativa')),
  observacoes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_meninas_status on public.meninas(status);
create index if not exists idx_meninas_familia on public.meninas(familia_id);

-- ---------------------------------------------------------------------
-- 4. Encontros (sábados / eventos especiais)
-- ---------------------------------------------------------------------
create table if not exists public.encontros (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  tema text,
  atividades text,
  tipo text not null default 'regular' check (tipo in ('regular','especial','passeio','retiro')),
  observacoes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_encontros_data on public.encontros(data);

-- ---------------------------------------------------------------------
-- 5. Presenças
-- ---------------------------------------------------------------------
create table if not exists public.presencas (
  id uuid primary key default gen_random_uuid(),
  encontro_id uuid not null references public.encontros(id) on delete cascade,
  menina_id uuid not null references public.meninas(id) on delete cascade,
  presente boolean not null default true,
  observacao text,
  registered_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (encontro_id, menina_id)
);

create index if not exists idx_presencas_encontro on public.presencas(encontro_id);
create index if not exists idx_presencas_menina on public.presencas(menina_id);

-- ---------------------------------------------------------------------
-- 6. Banco de atividades
-- ---------------------------------------------------------------------
create table if not exists public.atividades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  idade_min integer,
  idade_max integer,
  virtude text,
  duracao_min integer,
  materiais text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. Formação dos pais (eventos específicos pra pais)
-- ---------------------------------------------------------------------
create table if not exists public.formacao_pais (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  hora time,
  tema text not null,
  descricao text,
  local text,
  convite_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_formacao_pais_data on public.formacao_pais(data);

-- ---------------------------------------------------------------------
-- 8. Reuniões da equipe
-- ---------------------------------------------------------------------
create table if not exists public.reunioes (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  hora time,
  titulo text not null,
  participantes text,
  pauta text,
  ata text,
  status text not null default 'agendada' check (status in ('agendada','realizada','cancelada')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_reunioes_data on public.reunioes(data);

-- ---------------------------------------------------------------------
-- 9. Anotações livres do calendário
-- ---------------------------------------------------------------------
create table if not exists public.anotacoes_calendario (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  tema text,
  texto text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_anot_cal_data on public.anotacoes_calendario(data);

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Função helper: retorna o cargo da voluntária logada
create or replace function public.cargo_do_usuario_atual()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select cargo from public.profiles where id = auth.uid() and status = 'ativa';
$$;

-- Função helper: usuário logado é voluntária ativa?
create or replace function public.is_voluntaria_ativa()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and status = 'ativa'
  );
$$;

-- Função helper: usuário logado é diretora?
create or replace function public.is_diretora()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'ativa' and cargo = 'diretora'
  );
$$;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Ativar RLS em todas as tabelas
alter table public.profiles              enable row level security;
alter table public.familias              enable row level security;
alter table public.meninas               enable row level security;
alter table public.encontros             enable row level security;
alter table public.presencas             enable row level security;
alter table public.atividades            enable row level security;
alter table public.formacao_pais         enable row level security;
alter table public.reunioes              enable row level security;
alter table public.anotacoes_calendario  enable row level security;

-- ---------------------------------------------------------------------
-- Policies: profiles
-- Toda voluntária ativa VÊ todos os perfis (pra listar equipe).
-- Só diretora CRIA/EDITA/REMOVE outros perfis.
-- Qualquer voluntária edita o próprio perfil.
-- ---------------------------------------------------------------------
drop policy if exists "profiles_select_all_ativas" on public.profiles;
create policy "profiles_select_all_ativas" on public.profiles
  for select using (public.is_voluntaria_ativa());

drop policy if exists "profiles_insert_diretora" on public.profiles;
create policy "profiles_insert_diretora" on public.profiles
  for insert with check (public.is_diretora());

drop policy if exists "profiles_update_self_or_diretora" on public.profiles;
create policy "profiles_update_self_or_diretora" on public.profiles
  for update using (id = auth.uid() or public.is_diretora());

drop policy if exists "profiles_delete_diretora" on public.profiles;
create policy "profiles_delete_diretora" on public.profiles
  for delete using (public.is_diretora());

-- ---------------------------------------------------------------------
-- Policies genéricas: toda voluntária ativa pode TUDO em dados operacionais
-- (familias, meninas, encontros, presencas, atividades, formacao_pais, reunioes, anotacoes)
-- Diferenciação por cargo acontece no frontend/escolha de abas,
-- não precisa travar no banco pra equipe pequena.
-- ---------------------------------------------------------------------
do $$
declare
  t text;
  tabelas text[] := array[
    'familias','meninas','encontros','presencas','atividades',
    'formacao_pais','reunioes','anotacoes_calendario'
  ];
begin
  foreach t in array tabelas loop
    execute format('drop policy if exists "%I_rw_voluntarias" on public.%I', t, t);
    execute format(
      'create policy "%I_rw_voluntarias" on public.%I for all using (public.is_voluntaria_ativa()) with check (public.is_voluntaria_ativa())',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Trigger: atualiza updated_at em profiles
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();
