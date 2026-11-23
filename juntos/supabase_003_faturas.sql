-- Juntos: faturas do cartão importadas (cada fatura agrupa seus lançamentos e pode ser desfeita inteira).
-- Itens de fatura não geram notificação um a um; a fatura gera uma só ("💳 Fatura importada").
create table public.juntos_faturas (
  id uuid primary key default gen_random_uuid(),
  dono uuid not null default auth.uid() references auth.users(id) on delete cascade,
  cartao text not null default '' check (char_length(cartao) <= 40),
  vencimento date not null,
  total numeric(12,2) not null default 0,
  qtd integer not null default 0,
  modo text not null default 'itens' check (modo in ('itens','total')),
  criado_por uuid default auth.uid() references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index juntos_faturas_dono on public.juntos_faturas (dono, vencimento desc);
alter table public.juntos_faturas enable row level security;
create policy juntos_faturas_acesso on public.juntos_faturas for all to authenticated
  using (public.juntos_pode(dono, 'gastos')) with check (public.juntos_pode(dono, 'gastos'));
grant select, insert, update, delete on public.juntos_faturas to authenticated;
revoke all on public.juntos_faturas from anon;

alter table public.juntos_lancamentos
  add column fatura_id uuid references public.juntos_faturas(id) on delete cascade,
  add column data_compra date;
create index juntos_lanc_fatura on public.juntos_lancamentos (fatura_id);

-- juntos_notificar() foi recriada para: ignorar itens com fatura_id, avisar na inclusão/remoção da fatura
-- (gatilho abaixo) e checar os campos de cada tabela em IFs separados.
create trigger juntos_faturas_notificar after insert or delete on public.juntos_faturas
  for each row execute function public.juntos_notificar();
