-- ============================================================================================================
-- 002 · Hora do servidor (ajustes de 14/10/2026; RF54)
-- As rodadas diárias dos minijogos renovam à meia-noite de Brasília. Para a conta, o jogo usa a hora do servidor, para
-- não dar para ganhar rodadas mudando o relógio do computador. Esta função só devolve a hora atual do banco: não lê nem
-- escreve nenhuma tabela.
-- Rodar uma vez no SQL Editor do Supabase (como o 001). Pode rodar de novo sem problema.
-- ============================================================================================================
create or replace function public.hora_do_servidor()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select now();
$$;

revoke all on function public.hora_do_servidor() from public;
grant execute on function public.hora_do_servidor() to anon, authenticated;
