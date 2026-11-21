-- Jogo RPG · 004: o apelido de uma conta que nunca confirmou o e-mail não fica mais preso (Parte 0b, 21/11/2026)
-- Como usar: no painel do Supabase, SQL Editor → New query → cole este arquivo inteiro → Run.
-- Pode rodar de novo sem estragar nada (create or replace, drop trigger if exists).
-- NÃO depende do 003 (Área do Desenvolvedor), que continua sem rodar.
--
-- O problema: no 001, o perfil (com o apelido) é criado no CADASTRO. Se a pessoa nunca confirma o e-mail, a conta fica
-- parada, mas o apelido fica reservado para sempre: ninguém mais consegue usar "Lucas", por exemplo.
--
-- A solução escolhida: o perfil passa a ser criado só quando a conta CONFIRMA o e-mail.
--   * Antes de confirmar, o apelido não reserva nada (apelido_disponivel continua olhando só a tabela perfis).
--   * Se, no meio tempo, outra pessoa confirmou primeiro com o mesmo apelido, a confirmação NÃO falha: a conta só fica
--     sem perfil, e o jogo já pede um apelido novo no primeiro login (definir_meu_apelido, do 001). Ninguém trava.
--   * Projeto com a confirmação de e-mail desligada: a conta já nasce confirmada, e o perfil é criado no cadastro, como
--     antes.
--   * Os perfis que já existem de contas nunca confirmadas são apagados no fim deste arquivo (o apelido fica livre). Se
--     a pessoa confirmar depois, o perfil é recriado com o apelido do cadastro (se ainda estiver livre).
-- Por que não "liberar depois de N dias": precisaria de uma tarefa agendada ou de conferir a data em toda consulta, e
-- deixaria o apelido preso por N dias. Criar na confirmação é mais simples e não tem prazo para errar.

-- ============================================================================================================
-- 1. Criar o perfil da conta confirmada (nunca lança erro: apelido repetido ou fora da regra = conta sem perfil)
-- ============================================================================================================
create or replace function public.criar_perfil_da_conta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null
     and new.raw_user_meta_data ->> 'apelido' is not null
     and not exists (select 1 from public.perfis where id = new.id) then
    begin
      insert into public.perfis (id, apelido) values (new.id, new.raw_user_meta_data ->> 'apelido');
    exception when unique_violation or check_violation then
      -- o apelido foi pego antes por outra conta confirmada (ou está fora da regra): sem perfil, o jogo pede outro
      null;
    end;
  end if;
  return new;
end;
$$;

-- No cadastro (vale quando a confirmação de e-mail está desligada: a conta já nasce confirmada)
drop trigger if exists ao_criar_conta on auth.users;
create trigger ao_criar_conta
  after insert on auth.users
  for each row execute function public.criar_perfil_da_conta();

-- Na confirmação do e-mail (email_confirmed_at deixa de ser vazio)
drop trigger if exists ao_confirmar_conta on auth.users;
create trigger ao_confirmar_conta
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.criar_perfil_da_conta();

-- ============================================================================================================
-- 2. Soltar os apelidos já presos: perfis de contas que nunca confirmaram o e-mail
-- ============================================================================================================
-- (uma conta sem confirmação não consegue entrar no jogo, então ela não tem save, partidas nem sessão para perder)
delete from public.perfis p
using auth.users u
where u.id = p.id
  and u.email_confirmed_at is null;
