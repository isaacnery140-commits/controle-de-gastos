-- Aplicado em 2026-11-11 no projeto pvhoumlovxjlqvmchobv
create table public.gastos_categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 40),
  tipo text not null check (tipo in ('despesa','receita')),
  cor text not null default '#3d42a0',
  icone text not null default '•',
  orcamento numeric(12,2) check (orcamento is null or orcamento >= 0),
  criado_em timestamptz not null default now(),
  unique (user_id, tipo, nome)
);
create table public.gastos_lancamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('despesa','receita')),
  valor numeric(12,2) not null check (valor > 0),
  descricao text not null default '' check (char_length(descricao) <= 120),
  data date not null default current_date,
  categoria_id uuid references public.gastos_categorias(id) on delete set null,
  forma text check (forma in ('dinheiro','pix','debito','credito','boleto','outro')),
  pago boolean not null default true,
  criado_em timestamptz not null default now()
);
create index gastos_lanc_user_data on public.gastos_lancamentos (user_id, data desc);
create index gastos_lanc_categoria on public.gastos_lancamentos (categoria_id);
create index gastos_cat_user on public.gastos_categorias (user_id);
alter table public.gastos_categorias enable row level security;
alter table public.gastos_lancamentos enable row level security;
create policy "gastos_cat_dono" on public.gastos_categorias for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "gastos_lanc_dono" on public.gastos_lancamentos for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.gastos_categorias, public.gastos_lancamentos to authenticated;
revoke all on public.gastos_categorias, public.gastos_lancamentos from anon;
