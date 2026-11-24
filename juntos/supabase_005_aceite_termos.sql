-- Juntos: guarda qual versão dos Termos de uso a pessoa aceitou e quando.
alter table public.juntos_perfis
  add column if not exists termos_versao text not null default '' check (char_length(termos_versao) <= 20),
  add column if not exists termos_aceitos_em timestamptz;
