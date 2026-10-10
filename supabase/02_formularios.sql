-- =====================================================================
-- Módulo Formulários
-- Rodar UMA vez no Supabase SQL Editor
-- =====================================================================

create table if not exists public.formularios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text,
  campos jsonb not null default '[]'::jsonb,
  status text not null default 'ativo' check (status in ('ativo','encerrado')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_formularios_slug on public.formularios(slug);

create table if not exists public.respostas_formulario (
  id uuid primary key default gen_random_uuid(),
  formulario_id uuid not null references public.formularios(id) on delete cascade,
  dados jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_respostas_form on public.respostas_formulario(formulario_id, created_at desc);

-- Trigger updated_at
drop trigger if exists trg_formularios_updated_at on public.formularios;
create trigger trg_formularios_updated_at
  before update on public.formularios
  for each row execute function public.set_updated_at();

-- RLS
alter table public.formularios enable row level security;
alter table public.respostas_formulario enable row level security;

-- Formulários: qualquer um pode LER (necessário pra render público), só voluntárias CRUD
drop policy if exists "formularios_select_public" on public.formularios;
create policy "formularios_select_public" on public.formularios
  for select to public using (true);

drop policy if exists "formularios_write_voluntarias" on public.formularios;
create policy "formularios_write_voluntarias" on public.formularios
  for all to authenticated
  using (public.is_voluntaria_ativa())
  with check (public.is_voluntaria_ativa());

grant select on public.formularios to anon, authenticated;
grant insert, update, delete on public.formularios to authenticated;

-- Respostas: só voluntárias LEEM/APAGAM; INSERT via RPC
drop policy if exists "respostas_select_voluntarias" on public.respostas_formulario;
create policy "respostas_select_voluntarias" on public.respostas_formulario
  for select using (public.is_voluntaria_ativa());

drop policy if exists "respostas_delete_voluntarias" on public.respostas_formulario;
create policy "respostas_delete_voluntarias" on public.respostas_formulario
  for delete using (public.is_voluntaria_ativa());

grant select, delete on public.respostas_formulario to authenticated;

-- RPC pública para enviar resposta
create or replace function public.enviar_resposta(
  _slug text,
  _dados jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  form_id uuid;
  form_status text;
  resposta_id uuid;
begin
  select id, status into form_id, form_status
  from public.formularios where slug = _slug;

  if form_id is null then
    raise exception 'Formulário não encontrado';
  end if;
  if form_status <> 'ativo' then
    raise exception 'Este formulário está encerrado';
  end if;

  insert into public.respostas_formulario (formulario_id, dados)
  values (form_id, _dados)
  returning id into resposta_id;

  return resposta_id;
end;
$$;

grant execute on function public.enviar_resposta(text, jsonb) to anon, authenticated;
