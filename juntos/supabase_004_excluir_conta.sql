-- Exclusão de conta exigida pela Google Play: apaga tudo do Juntos da pessoa logada.
-- O login (auth.users) só é apagado se a pessoa não tiver dados no app Controle de Gastos,
-- que usa o mesmo login; assim excluir o Juntos não apaga o outro app.
create or replace function public.juntos_excluir_conta()
returns text language plpgsql security definer set search_path = '' as $$
declare
  eu uuid := auth.uid();
  meu_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  usa_outro boolean;
begin
  if eu is null then raise exception 'sem_login'; end if;
  delete from public.juntos_lancamentos where dono = eu;
  delete from public.juntos_faturas where dono = eu;
  delete from public.juntos_eventos where dono = eu;
  delete from public.juntos_compart where dono = eu or email = meu_email;
  delete from public.juntos_push_subs where user_id = eu;
  delete from public.juntos_perfis where id = eu;
  update public.juntos_lancamentos set criado_por = null where criado_por = eu;
  update public.juntos_eventos set criado_por = null where criado_por = eu;
  update public.juntos_faturas set criado_por = null where criado_por = eu;
  select exists (select 1 from public.gastos_lancamentos where user_id = eu)
      or exists (select 1 from public.gastos_categorias where user_id = eu)
      or exists (select 1 from public.gastos_importacoes where user_id = eu)
    into usa_outro;
  if not usa_outro then
    delete from auth.users where id = eu;
    return 'conta_apagada';
  end if;
  return 'dados_apagados';
end $$;
revoke all on function public.juntos_excluir_conta() from public, anon;
grant execute on function public.juntos_excluir_conta() to authenticated;
