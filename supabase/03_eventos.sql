-- =====================================================================
-- Módulo Eventos (com admin editável + inscrições persistidas)
-- Rodar UMA vez no Supabase SQL Editor
-- =====================================================================

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  subtitulo text,
  descricao text,
  data_evento date,
  hora_evento time,
  local text,
  imagem_capa_url text,
  valor_por_pessoa numeric not null default 0,
  idade_isenta integer not null default 5,
  vencimento_pagamento date,
  pix_chave text,
  pix_tipo text,
  pix_titular text,
  pix_banco text,
  texto_reembolso text,
  pedido_colaboracao text,
  whatsapp_grupo text,
  whatsapp_responsavel_financeiro text,
  nome_responsavel_financeiro text,
  niveis jsonb not null default '["Nível 1","Nível 1 e 1/2","Nível 2","Níveis 3 e 4"]'::jsonb,
  status text not null default 'ativo' check (status in ('ativo','encerrado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_eventos_slug on public.eventos(slug);

drop trigger if exists trg_eventos_updated_at on public.eventos;
create trigger trg_eventos_updated_at
  before update on public.eventos
  for each row execute function public.set_updated_at();

create table if not exists public.inscricoes_evento (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  email text not null,
  nome_associada text not null,
  nivel text,
  nome_responsavel text not null,
  confirmacao text not null check (confirmacao in ('sim','nao')),
  adultos integer default 0,
  criancas integer default 0,
  valor_total numeric default 0,
  pagamento_status text not null default 'pendente' check (pagamento_status in ('pendente','pago','isento')),
  pagamento_data date,
  pagamento_observacao text,
  created_at timestamptz not null default now()
);

create index if not exists idx_inscricoes_evento on public.inscricoes_evento(evento_id, created_at desc);

-- RLS
alter table public.eventos enable row level security;
alter table public.inscricoes_evento enable row level security;

drop policy if exists "eventos_select_public" on public.eventos;
create policy "eventos_select_public" on public.eventos
  for select to public using (true);

drop policy if exists "eventos_write_voluntarias" on public.eventos;
create policy "eventos_write_voluntarias" on public.eventos
  for all to authenticated
  using (public.is_voluntaria_ativa())
  with check (public.is_voluntaria_ativa());

grant select on public.eventos to anon, authenticated;
grant insert, update, delete on public.eventos to authenticated;

drop policy if exists "insc_ev_select_vol" on public.inscricoes_evento;
create policy "insc_ev_select_vol" on public.inscricoes_evento
  for select using (public.is_voluntaria_ativa());

drop policy if exists "insc_ev_update_vol" on public.inscricoes_evento;
create policy "insc_ev_update_vol" on public.inscricoes_evento
  for update using (public.is_voluntaria_ativa());

drop policy if exists "insc_ev_delete_vol" on public.inscricoes_evento;
create policy "insc_ev_delete_vol" on public.inscricoes_evento
  for delete using (public.is_voluntaria_ativa());

grant select, update, delete on public.inscricoes_evento to authenticated;

-- RPC pública pra inscrever
create or replace function public.inscrever_evento(
  _slug text,
  _email text,
  _nome_associada text,
  _nivel text,
  _nome_responsavel text,
  _confirmacao text,
  _adultos integer,
  _criancas integer
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  evt_id uuid;
  evt_status text;
  evt_valor numeric;
  total numeric;
  insc_id uuid;
begin
  select id, status, valor_por_pessoa into evt_id, evt_status, evt_valor
  from public.eventos where slug = _slug;
  if evt_id is null then raise exception 'Evento não encontrado'; end if;
  if evt_status <> 'ativo' then raise exception 'Este evento está encerrado'; end if;

  if _confirmacao not in ('sim','nao') then
    raise exception 'Confirmação inválida';
  end if;

  total := case when _confirmacao = 'sim' then coalesce(_adultos, 0) * evt_valor else 0 end;

  insert into public.inscricoes_evento (
    evento_id, email, nome_associada, nivel, nome_responsavel,
    confirmacao, adultos, criancas, valor_total,
    pagamento_status
  ) values (
    evt_id, _email, trim(_nome_associada), _nivel, trim(_nome_responsavel),
    _confirmacao, coalesce(_adultos, 0), coalesce(_criancas, 0), total,
    case when _confirmacao = 'nao' then 'isento' else 'pendente' end
  ) returning id into insc_id;

  return insc_id;
end;
$$;

grant execute on function public.inscrever_evento(text, text, text, text, text, text, integer, integer)
  to anon, authenticated;

-- Seed do Alfa Stars 2025 (idempotente)
insert into public.eventos (
  slug, nome, subtitulo, descricao,
  data_evento, hora_evento, local,
  valor_por_pessoa, idade_isenta, vencimento_pagamento,
  pix_chave, pix_tipo, pix_titular, pix_banco,
  texto_reembolso, pedido_colaboracao,
  whatsapp_grupo, whatsapp_responsavel_financeiro, nome_responsavel_financeiro
) values (
  'alfa-stars-2025',
  'Alfa Stars 2025',
  'Confraternização das Famílias',
  E'O nosso momento mais esperado do ano está chegando! A Confraternização das Famílias é um encontro preparado com muito carinho para celebrarmos, juntos, o desenvolvimento das nossas meninas — com gratidão, alegria e unidade.\n\nA programação terá início com uma meditação conduzida pelo Sacerdote, no oratório.\n\nPedimos atenção especial quanto ao cuidado com as vestimentas, adequadas ao ambiente e ao espírito do encontro.\n\n⚠️ A participação é restrita à família núcleo (pai, mãe, avós e irmãos não casados).',
  '2025-11-29', '17:00', 'Clube Alfa',
  30, 5, '2025-11-20',
  'exemplo@mameva.com.br', 'E-mail', 'Clube Juvenil Alfa', 'Banco Exemplo',
  'Caso não possa comparecer após a confirmação, o valor pago não será reembolsado.',
  'A lista do cardápio será divulgada no grupo do WhatsApp.',
  'https://chat.whatsapp.com/JDDKrOJRvRb4nuv5V4Wq4S',
  '5512981446430', 'Cláudia'
) on conflict (slug) do nothing;
