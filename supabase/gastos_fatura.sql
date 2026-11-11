-- Aplicado em 2026-11-11: importação de fatura, regras aprendidas e novas categorias
create table public.gastos_importacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  arquivo text not null default '' check (char_length(arquivo) <= 200),
  vencimento date, qtd int not null default 0, total numeric(12,2) not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.gastos_lancamentos
  add column origem text not null default 'manual' check (origem in ('manual','fatura')),
  add column importacao_id uuid references public.gastos_importacoes(id) on delete cascade,
  add column data_compra date;
create table public.gastos_regras (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  termo text not null check (char_length(termo) between 2 and 60),
  categoria_id uuid not null references public.gastos_categorias(id) on delete cascade,
  criado_em timestamptz not null default now(),
  unique (user_id, termo)
);
-- RLS: cada usuário só vê as próprias linhas (mesmo padrão das outras tabelas gastos_)
alter table public.gastos_importacoes enable row level security;
alter table public.gastos_regras enable row level security;
create policy "gastos_imp_dono" on public.gastos_importacoes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "gastos_regras_dono" on public.gastos_regras for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.gastos_importacoes, public.gastos_regras to authenticated;
revoke all on public.gastos_importacoes, public.gastos_regras from anon;
