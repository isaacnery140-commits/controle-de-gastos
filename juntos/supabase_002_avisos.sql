-- Juntos: aviso antes do compromisso + notificações (Web Push) de tudo que é criado, alterado ou excluído.
-- As chaves secretas ficam só no banco (juntos_config), nunca neste repositório.

alter table public.juntos_eventos
  add column if not exists aviso_min integer check (aviso_min is null or aviso_min between 0 and 10080),
  add column if not exists avisado_em timestamptz;

create table if not exists public.juntos_config (
  id integer primary key default 1 check (id = 1),
  vapid_public text, vapid_private text, push_secret text
);
alter table public.juntos_config enable row level security;
revoke all on public.juntos_config from anon, authenticated;
-- Usa o mesmo par de chaves de notificação da Agenda; o segredo de chamada é próprio.
insert into public.juntos_config (id, vapid_public, vapid_private, push_secret)
select 1, vapid_public, vapid_private, replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
from public.agenda_config where id = 1
on conflict (id) do nothing;

create table if not exists public.juntos_push_subs (
  endpoint text primary key check (endpoint ~ '^https://' and char_length(endpoint) <= 1000),
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null, auth text not null,
  criado_em timestamptz not null default now()
);
create index if not exists juntos_push_subs_user on public.juntos_push_subs (user_id);
alter table public.juntos_push_subs enable row level security;
revoke all on public.juntos_push_subs from anon, authenticated;

-- Liga este celular à conta de quem está logado (se outra conta usava o mesmo celular, passa para esta).
create or replace function public.juntos_inscrever(p_endpoint text, p_p256dh text, p_auth text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'sem_login'; end if;
  insert into public.juntos_push_subs (endpoint, user_id, p256dh, auth)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth;
  return true;
end $$;
create or replace function public.juntos_desinscrever(p_endpoint text)
returns boolean language sql security definer set search_path = '' as $$
  delete from public.juntos_push_subs where endpoint = p_endpoint and user_id = auth.uid() returning true;
$$;
revoke all on function public.juntos_inscrever(text, text, text) from public, anon;
revoke all on function public.juntos_desinscrever(text) from public, anon;
grant execute on function public.juntos_inscrever(text, text, text) to authenticated;
grant execute on function public.juntos_desinscrever(text) to authenticated;

-- Todos que enxergam a área (agenda ou gastos) deste dono: o dono e quem recebeu o compartilhamento.
create or replace function public.juntos_destinatarios(p_dono uuid, p_area text, p_tirar uuid)
returns uuid[] language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(distinct x), '{}') from (
    select p_dono as x
    union
    select u.id from public.juntos_compart c join auth.users u on lower(u.email) = c.email
    where c.dono = p_dono and ((p_area = 'agenda' and c.agenda) or (p_area = 'gastos' and c.gastos))
  ) t where p_tirar is null or x <> p_tirar;
$$;
revoke all on function public.juntos_destinatarios(uuid, text, uuid) from public, anon, authenticated;

-- Chama a Edge Function "juntos-push". Nunca impede o salvamento se falhar.
create or replace function public.juntos_push_call(p_body jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare s text;
begin
  select push_secret into s from public.juntos_config where id = 1;
  if s is null then return; end if;
  perform net.http_post(
    url := 'https://pvhoumlovxjlqvmchobv.supabase.co/functions/v1/juntos-push',
    headers := jsonb_build_object('Content-Type','application/json','x-juntos-secret', s),
    body := p_body
  );
exception when others then null;
end $$;
revoke all on function public.juntos_push_call(jsonb) from public, anon, authenticated;

create or replace function public.juntos_quando(d date, h text)
returns text language sql immutable set search_path = '' as $$
  select to_char(d, 'DD/MM') || case when h is null then '' else ' às ' || h end;
$$;

-- Ao mudar dia, hora ou aviso, o lembrete volta a valer.
create or replace function public.juntos_eventos_antes()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.data is distinct from old.data or new.hora is distinct from old.hora or new.aviso_min is distinct from old.aviso_min then
    new.avisado_em := null;
  end if;
  return new;
end $$;
drop trigger if exists juntos_eventos_antes on public.juntos_eventos;
create trigger juntos_eventos_antes before update on public.juntos_eventos
  for each row execute function public.juntos_eventos_antes();

-- Avisa as outras pessoas de tudo que entra, muda ou sai.
create or replace function public.juntos_notificar()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  r record := coalesce(new, old);
  area text := case when tg_table_name = 'juntos_eventos' then 'agenda' else 'gastos' end;
  autor uuid := auth.uid();
  quem text;
  para uuid[];
  tit text; corpo text;
  valor text;
begin
  if tg_op = 'UPDATE' and area = 'agenda'
     and (new.titulo, new.data, new.hora, new.local, new.notas, new.feito, new.aviso_min)
         is not distinct from (old.titulo, old.data, old.hora, old.local, old.notas, old.feito, old.aviso_min) then
    return null; -- só o controle interno do lembrete mudou
  end if;
  para := public.juntos_destinatarios(r.dono, area, autor);
  if coalesce(array_length(para, 1), 0) = 0 then return null; end if;
  select nullif(nome, '') into quem from public.juntos_perfis where id = autor;
  if area = 'agenda' then
    tit := case
      when tg_op = 'INSERT' then '📅 Novo compromisso'
      when tg_op = 'DELETE' then '📅 Compromisso excluído'
      when new.feito and not old.feito then '✅ Compromisso concluído'
      when old.feito and not new.feito then '📅 Compromisso reaberto'
      else '📅 Compromisso alterado' end;
    corpo := r.titulo || ' · ' || public.juntos_quando(r.data, r.hora);
  else
    valor := 'R$ ' || replace(replace(replace(to_char(r.valor, 'FM999G999G990D00'), ',', '#'), '.', ','), '#', '.');
    tit := case
      when tg_op = 'INSERT' then case when r.tipo = 'receita' then '💰 Nova entrada' else '💸 Nova saída' end
      when tg_op = 'DELETE' then '💰 Lançamento excluído'
      else '💰 Lançamento alterado' end;
    corpo := valor || ' · ' || coalesce(nullif(r.descricao, ''), r.categoria);
  end if;
  if quem is not null then corpo := corpo || ' · por ' || quem; end if;
  perform public.juntos_push_call(jsonb_build_object('kind', 'send', 'users', to_jsonb(para), 'title', tit, 'body', corpo,
    'tela', case when area = 'agenda' then 'agenda' else 'gastos' end));
  return null;
end $$;
drop trigger if exists juntos_eventos_notificar on public.juntos_eventos;
create trigger juntos_eventos_notificar after insert or update or delete on public.juntos_eventos
  for each row execute function public.juntos_notificar();
drop trigger if exists juntos_lanc_notificar on public.juntos_lancamentos;
create trigger juntos_lanc_notificar after insert or update or delete on public.juntos_lancamentos
  for each row execute function public.juntos_notificar();

-- Lembretes que já chegaram na hora de avisar (horário de Brasília). Sem hora marcada, conta a partir das 8h do dia.
create or replace function public.juntos_lembrete_devido(e public.juntos_eventos)
returns boolean language sql stable set search_path = '' as $$
  select e.avisado_em is null and e.aviso_min is not null and not e.feito
    and e.data between current_date - 1 and current_date + 8
    and ((e.data + coalesce(e.hora, '08:00')::time) at time zone 'America/Sao_Paulo') - make_interval(mins => e.aviso_min) <= now()
    and ((e.data + coalesce(e.hora, '08:00')::time) at time zone 'America/Sao_Paulo') > now() - interval '15 minutes';
$$;
create or replace function public.juntos_lembretes()
returns table (users uuid[], title text, body text) language plpgsql security definer set search_path = '' as $$
begin
  return query
  with due as (
    update public.juntos_eventos e set avisado_em = now()
    where public.juntos_lembrete_devido(e)
    returning e.dono, e.titulo, e.data, e.hora, e.local, e.aviso_min
  )
  select public.juntos_destinatarios(d.dono, 'agenda', null),
         '⏰ ' || d.titulo,
         (case when d.hora is not null and d.aviso_min = 0 then 'Agora'
               when d.data = (now() at time zone 'America/Sao_Paulo')::date then 'Hoje' || coalesce(' às ' || d.hora, '')
               when d.data = (now() at time zone 'America/Sao_Paulo')::date + 1 then 'Amanhã' || coalesce(' às ' || d.hora, '')
               else public.juntos_quando(d.data, d.hora) end)
           || case when d.local <> '' then ' · ' || d.local else '' end
  from due d;
end $$;
revoke all on function public.juntos_lembretes() from public, anon, authenticated;
revoke all on function public.juntos_lembrete_devido(public.juntos_eventos) from public, anon, authenticated;

-- Confere a cada minuto; só chama a função de envio quando há lembrete para mandar.
select cron.unschedule(jobid) from cron.job where jobname = 'juntos-lembretes';
select cron.schedule('juntos-lembretes', '* * * * *', $c$
  select public.juntos_push_call('{"kind":"lembretes"}'::jsonb)
  where exists (select 1 from public.juntos_eventos e where public.juntos_lembrete_devido(e))
$c$);
