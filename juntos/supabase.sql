-- App "Juntos" (agenda + gastos com compartilhamento separado por área).
-- Projeto Supabase pvhoumlovxjlqvmchobv. Tabelas novas com prefixo juntos_; não mexe em agenda_* nem gastos_*.

create table public.juntos_perfis (
  id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  nome text not null default '' check (char_length(nome) <= 40),
  email text not null default '' check (char_length(email) <= 120),
  criado_em timestamptz not null default now()
);

-- Um compartilhamento: o dono libera para um e-mail a agenda, os gastos ou os dois.
create table public.juntos_compart (
  id uuid primary key default gen_random_uuid(),
  dono uuid not null default auth.uid() references auth.users(id) on delete cascade,
  email text not null check (email = lower(email) and char_length(email) between 3 and 120),
  agenda boolean not null default false,
  gastos boolean not null default false,
  criado_em timestamptz not null default now(),
  unique (dono, email),
  check (agenda or gastos)
);

create table public.juntos_eventos (
  id uuid primary key default gen_random_uuid(),
  dono uuid not null default auth.uid() references auth.users(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 120),
  data date not null,
  hora text check (hora is null or hora ~ '^[0-2][0-9]:[0-5][0-9]$'),
  local text not null default '' check (char_length(local) <= 120),
  notas text not null default '' check (char_length(notas) <= 1000),
  feito boolean not null default false,
  criado_por uuid default auth.uid() references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index juntos_eventos_dono_data on public.juntos_eventos (dono, data);

create table public.juntos_lancamentos (
  id uuid primary key default gen_random_uuid(),
  dono uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('despesa','receita')),
  valor numeric(12,2) not null check (valor > 0),
  descricao text not null default '' check (char_length(descricao) <= 120),
  categoria text not null default 'Outros' check (char_length(categoria) <= 40),
  data date not null default current_date,
  criado_por uuid default auth.uid() references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index juntos_lanc_dono_data on public.juntos_lancamentos (dono, data desc);

-- Quem está logado pode ver/alterar a área (agenda ou gastos) deste dono?
create or replace function public.juntos_pode(p_dono uuid, p_area text)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_dono = auth.uid() or exists (
    select 1 from public.juntos_compart c
    where c.dono = p_dono
      and c.email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and ((p_area = 'agenda' and c.agenda) or (p_area = 'gastos' and c.gastos))
  );
$$;
revoke all on function public.juntos_pode(uuid, text) from public, anon;
grant execute on function public.juntos_pode(uuid, text) to authenticated;

-- As duas pessoas estão ligadas por algum compartilhamento? (para mostrar o nome)
create or replace function public.juntos_ligados(p_outro uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.juntos_compart c
    left join auth.users u on u.id = p_outro
    where (c.dono = p_outro and c.email = lower(coalesce(auth.jwt() ->> 'email', '')))
       or (c.dono = auth.uid() and c.email = lower(u.email))
  );
$$;
revoke all on function public.juntos_ligados(uuid) from public, anon;
grant execute on function public.juntos_ligados(uuid) to authenticated;

alter table public.juntos_perfis enable row level security;
alter table public.juntos_compart enable row level security;
alter table public.juntos_eventos enable row level security;
alter table public.juntos_lancamentos enable row level security;

create policy juntos_perfis_ver on public.juntos_perfis for select to authenticated
  using (id = (select auth.uid()) or public.juntos_ligados(id));
create policy juntos_perfis_inserir on public.juntos_perfis for insert to authenticated
  with check (id = (select auth.uid()));
create policy juntos_perfis_alterar on public.juntos_perfis for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- O dono gerencia os próprios compartilhamentos; o convidado vê os que recebeu e pode sair.
create policy juntos_compart_ver on public.juntos_compart for select to authenticated
  using (dono = (select auth.uid()) or email = lower(coalesce((select auth.jwt()) ->> 'email', '')));
create policy juntos_compart_inserir on public.juntos_compart for insert to authenticated
  with check (dono = (select auth.uid()));
create policy juntos_compart_alterar on public.juntos_compart for update to authenticated
  using (dono = (select auth.uid())) with check (dono = (select auth.uid()));
create policy juntos_compart_apagar on public.juntos_compart for delete to authenticated
  using (dono = (select auth.uid()) or email = lower(coalesce((select auth.jwt()) ->> 'email', '')));

create policy juntos_eventos_acesso on public.juntos_eventos for all to authenticated
  using (public.juntos_pode(dono, 'agenda')) with check (public.juntos_pode(dono, 'agenda'));
create policy juntos_lanc_acesso on public.juntos_lancamentos for all to authenticated
  using (public.juntos_pode(dono, 'gastos')) with check (public.juntos_pode(dono, 'gastos'));

grant select, insert, update, delete on public.juntos_perfis, public.juntos_compart,
  public.juntos_eventos, public.juntos_lancamentos to authenticated;
revoke all on public.juntos_perfis, public.juntos_compart,
  public.juntos_eventos, public.juntos_lancamentos from anon;
