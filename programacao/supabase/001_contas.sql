-- Jogo RPG · Fase 2: contas, saves, sessão única, partidas e ranking (TASK-092, RNF02, RNF06, RNF07)
-- Como usar: no painel do Supabase, SQL Editor → New query → cole este arquivo inteiro → Run.
-- Pode rodar de novo sem estragar nada: tudo usa "if not exists", "create or replace" ou apaga a política antes.
--
-- Segurança (RLS): cada conta só lê e altera o que é dela. Ninguém escreve direto nas tabelas de save e de sessão:
-- só as funções abaixo, que conferem quem está logado (auth.uid()) e a versão do save. O ranking é público, mas só
-- mostra apelidos e números (função ranking). O jogo usa só a chave publicável; a chave secreta nunca entra no código.

-- ============================================================================================================
-- 1. Perfis: o apelido único de cada conta (RF02). Criado sozinho no cadastro, a partir do apelido enviado.
-- ============================================================================================================
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  apelido text not null,
  criado_em timestamptz not null default now(),
  -- 3 a 16 letras (com acento), números ou _ (a mesma regra do jogo: src/regras/contas.js)
  constraint perfis_apelido_formato check (apelido ~ '^[A-Za-z0-9_À-ÖØ-öø-ÿ]{3,16}$')
);
-- Único sem diferenciar maiúsculas: "Pablo" e "pablo" são o mesmo apelido
create unique index if not exists perfis_apelido_unico on public.perfis (lower(apelido));

alter table public.perfis enable row level security;
drop policy if exists "perfis: ler o próprio" on public.perfis;
create policy "perfis: ler o próprio" on public.perfis
  for select to authenticated using (id = (select auth.uid()));

-- No cadastro pelo jogo, o apelido vem nos dados do usuário (options.data.apelido). Apelido repetido ou fora da regra
-- faz o cadastro inteiro falhar: o jogo confere antes com apelido_disponivel e mostra "apelido em uso".
-- Conta criada sem apelido (pelo painel do Supabase, por exemplo) fica sem perfil, e o jogo pede um apelido no
-- primeiro login (função definir_meu_apelido).
create or replace function public.criar_perfil_da_conta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'apelido' is not null then
    insert into public.perfis (id, apelido) values (new.id, new.raw_user_meta_data ->> 'apelido');
  end if;
  return new;
end;
$$;

drop trigger if exists ao_criar_conta on auth.users;
create trigger ao_criar_conta
  after insert on auth.users
  for each row execute function public.criar_perfil_da_conta();

-- Para a tela Criar conta avisar "apelido em uso" antes de cadastrar (também sem login)
create or replace function public.apelido_disponivel(p_apelido text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.perfis where lower(apelido) = lower(p_apelido));
$$;
revoke all on function public.apelido_disponivel(text) from public;
grant execute on function public.apelido_disponivel(text) to anon, authenticated;

-- Conta sem perfil escolhe o apelido: 'ok', 'em_uso', 'invalido' ou 'ja_tem' (o apelido não muda depois)
create or replace function public.definir_meu_apelido(p_apelido text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conta uuid := auth.uid();
begin
  if v_conta is null then
    raise exception 'sem login' using errcode = '28000';
  end if;
  if exists (select 1 from public.perfis where id = v_conta) then
    return 'ja_tem';
  end if;
  if p_apelido is null or p_apelido !~ '^[A-Za-z0-9_À-ÖØ-öø-ÿ]{3,16}$' then
    return 'invalido';
  end if;
  if exists (select 1 from public.perfis where lower(apelido) = lower(p_apelido)) then
    return 'em_uso';
  end if;
  insert into public.perfis (id, apelido) values (v_conta, p_apelido);
  return 'ok';
exception
  when unique_violation then
    return 'em_uso';
end;
$$;
revoke all on function public.definir_meu_apelido(text) from public, anon;
grant execute on function public.definir_meu_apelido(text) to authenticated;

-- ============================================================================================================
-- 2. Sessão única (RF05): uma sessão ativa por conta; o jogo manda um sinal a cada 1 minuto, e a sessão sem sinal
--    há 3 minutos expira. Ninguém mexe na tabela direto: só as três funções.
-- ============================================================================================================
create table if not exists public.sessoes (
  conta uuid primary key references auth.users (id) on delete cascade,
  sessao uuid not null,
  ultimo_sinal timestamptz not null default now()
);
alter table public.sessoes enable row level security;
-- (sem políticas: só as funções abaixo leem e escrevem)

-- Entrar: 'ok' (a sessão passa a ser esta) ou 'em_uso' (outra sessão viva, em outra máquina ou aba)
create or replace function public.abrir_sessao(p_sessao uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conta uuid := auth.uid();
  v_atual public.sessoes%rowtype;
begin
  if v_conta is null then
    raise exception 'sem login' using errcode = '28000';
  end if;
  perform pg_advisory_xact_lock(hashtext(v_conta::text)); -- duas entradas ao mesmo tempo não passam juntas
  select * into v_atual from public.sessoes where conta = v_conta;
  if found and v_atual.sessao <> p_sessao and v_atual.ultimo_sinal > now() - interval '3 minutes' then
    return 'em_uso';
  end if;
  insert into public.sessoes (conta, sessao, ultimo_sinal) values (v_conta, p_sessao, now())
    on conflict (conta) do update set sessao = excluded.sessao, ultimo_sinal = now();
  return 'ok';
end;
$$;

-- Sinal a cada minuto: 'ok', ou 'perdida' (outra sessão entrou depois que esta expirou)
create or replace function public.sinal_da_sessao(p_sessao uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conta uuid := auth.uid();
begin
  if v_conta is null then
    raise exception 'sem login' using errcode = '28000';
  end if;
  update public.sessoes set ultimo_sinal = now() where conta = v_conta and sessao = p_sessao;
  if found then
    return 'ok';
  end if;
  if exists (select 1 from public.sessoes where conta = v_conta) then
    return 'perdida';
  end if;
  insert into public.sessoes (conta, sessao, ultimo_sinal) values (v_conta, p_sessao, now())
    on conflict (conta) do nothing;
  return 'ok';
end;
$$;

-- Sair da conta (ou fechar a aba): a sessão acaba na hora
create or replace function public.fechar_sessao(p_sessao uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.sessoes where conta = auth.uid() and sessao = p_sessao;
$$;

revoke all on function public.abrir_sessao(uuid) from public, anon;
revoke all on function public.sinal_da_sessao(uuid) from public, anon;
revoke all on function public.fechar_sessao(uuid) from public, anon;
grant execute on function public.abrir_sessao(uuid) to authenticated;
grant execute on function public.sinal_da_sessao(uuid) to authenticated;
grant execute on function public.fechar_sessao(uuid) to authenticated;

-- ============================================================================================================
-- 3. Saves (RF10, RNF06): o progresso de cada conta, com versão. Só a função salvar_progresso escreve, e ela
--    só aceita uma versão MAIOR que a guardada, e só da sessão ativa da conta.
-- ============================================================================================================
create table if not exists public.saves (
  conta uuid primary key references auth.users (id) on delete cascade,
  versao integer not null check (versao >= 1),
  formato integer not null check (formato >= 1),
  progresso jsonb not null check (pg_column_size(progresso) <= 200000),
  salvo_em timestamptz not null default now()
);
alter table public.saves enable row level security;
drop policy if exists "saves: ler o próprio" on public.saves;
create policy "saves: ler o próprio" on public.saves
  for select to authenticated using (conta = (select auth.uid()));
-- (sem política de inserir, alterar ou apagar: só a função salvar_progresso escreve)

-- Devolve { "aceito": true|false, "versao": versão guardada agora, "motivo": null | 'versao' | 'sessao' }
create or replace function public.salvar_progresso(p_sessao uuid, p_versao integer, p_formato integer, p_progresso jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conta uuid := auth.uid();
  v_linhas integer;
  v_guardada integer;
begin
  if v_conta is null then
    raise exception 'sem login' using errcode = '28000';
  end if;
  -- Só a sessão ativa salva: um navegador que perdeu a sessão para outro não passa por cima do progresso dele
  if exists (select 1 from public.sessoes where conta = v_conta and sessao <> p_sessao) then
    select versao into v_guardada from public.saves where conta = v_conta;
    return jsonb_build_object('aceito', false, 'versao', v_guardada, 'motivo', 'sessao');
  end if;
  -- O que o ranking lê precisa ser número de tamanho normal (um save estragado ou com número absurdo não derruba o
  -- ranking dos outros). Os limites são folgados: bem acima do que o jogo consegue dar.
  if jsonb_typeof(p_progresso) <> 'object'
    or jsonb_typeof(p_progresso -> 'ouro') is distinct from 'number'
    or (p_progresso ->> 'ouro')::numeric not between 0 and 1000000000000
    or jsonb_typeof(p_progresso -> 'personagens') is distinct from 'array'
    or jsonb_array_length(p_progresso -> 'personagens') > 10
    or jsonb_typeof(p_progresso -> 'estatisticas' -> 'monstrosDerrotados') is distinct from 'number'
    or (p_progresso -> 'estatisticas' ->> 'monstrosDerrotados')::numeric not between 0 and 1000000000000
    or exists (
      select 1 from jsonb_array_elements(p_progresso -> 'personagens') pe
      where jsonb_typeof(pe -> 'classe') is distinct from 'string'
        or jsonb_typeof(pe -> 'nivel') is distinct from 'number'
        or jsonb_typeof(pe -> 'xp') is distinct from 'number'
        or (pe ->> 'nivel')::numeric not between 0 and 1000
        or (pe ->> 'xp')::numeric not between 0 and 1000000000000
    )
  then
    raise exception 'progresso com formato errado' using errcode = '22023';
  end if;

  insert into public.saves as s (conta, versao, formato, progresso, salvo_em)
    values (v_conta, p_versao, p_formato, p_progresso, now())
    on conflict (conta) do update
      set versao = excluded.versao, formato = excluded.formato, progresso = excluded.progresso, salvo_em = now()
      where s.versao < excluded.versao;
  get diagnostics v_linhas = row_count;
  select versao into v_guardada from public.saves where conta = v_conta;
  return jsonb_build_object('aceito', v_linhas > 0, 'versao', v_guardada, 'motivo', case when v_linhas > 0 then null else 'versao' end);
end;
$$;
revoke all on function public.salvar_progresso(uuid, integer, integer, jsonb) from public, anon;
grant execute on function public.salvar_progresso(uuid, integer, integer, jsonb) to authenticated;

-- ============================================================================================================
-- 4. Partidas (RF15, RF16; TASK-100): uma linha por partida terminada de conta. Convidado não grava; partida
--    interrompida também não (o jogo só grava no fim).
-- ============================================================================================================
create table if not exists public.partidas (
  id bigint generated always as identity primary key,
  conta uuid not null references auth.users (id) on delete cascade,
  jogada_em timestamptz not null default now(),
  bioma text not null check (char_length(bioma) <= 20),
  resultado text not null check (resultado in ('grandeVitoria', 'vitoria', 'retornoForcado', 'derrota')),
  pontuacao integer not null check (pontuacao >= 0),
  ouro integer not null check (ouro >= 0),
  monstros integer not null check (monstros >= 0),
  tempo_ativo integer not null check (tempo_ativo >= 0),
  tempo_total integer not null check (tempo_total >= 0)
);
create index if not exists partidas_da_conta on public.partidas (conta, jogada_em desc);

alter table public.partidas enable row level security;
drop policy if exists "partidas: ler as próprias" on public.partidas;
create policy "partidas: ler as próprias" on public.partidas
  for select to authenticated using (conta = (select auth.uid()));
drop policy if exists "partidas: registrar as próprias" on public.partidas;
create policy "partidas: registrar as próprias" on public.partidas
  for insert to authenticated with check (conta = (select auth.uid()));

-- ============================================================================================================
-- 5. Ranking público (RF15; TASK-101): só apelido e números, para qualquer um, até sem login.
--    Abas: melhoresPontuacoes, nivelTotal, porClasse (com p_classe; desempate por XP), ouro, monstros, maiorDuracao.
--    Só entram contas (o convidado nunca está no banco).
-- ============================================================================================================
create or replace function public.ranking(p_aba text, p_classe text default null, p_limite integer default 50)
returns table (posicao bigint, apelido text, valor bigint, desempate bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with base as (
    select
      p.apelido,
      case p_aba
        when 'melhoresPontuacoes' then (select max(pa.pontuacao)::bigint from public.partidas pa where pa.conta = p.id)
        when 'maiorDuracao' then (select max(pa.tempo_ativo)::bigint from public.partidas pa where pa.conta = p.id)
        when 'ouro' then (s.progresso ->> 'ouro')::numeric::bigint
        when 'monstros' then (s.progresso -> 'estatisticas' ->> 'monstrosDerrotados')::numeric::bigint
        when 'nivelTotal' then (
          select sum((pe ->> 'nivel')::numeric)::bigint from jsonb_array_elements(s.progresso -> 'personagens') pe
        )
        when 'porClasse' then (
          select (pe ->> 'nivel')::numeric::bigint from jsonb_array_elements(s.progresso -> 'personagens') pe
          where pe ->> 'classe' = p_classe limit 1
        )
      end as valor,
      case
        when p_aba = 'porClasse' then (
          select (pe ->> 'xp')::numeric::bigint from jsonb_array_elements(s.progresso -> 'personagens') pe
          where pe ->> 'classe' = p_classe limit 1
        )
        else 0
      end as desempate
    from public.perfis p
    left join public.saves s on s.conta = p.id
  )
  select rank() over (order by valor desc, desempate desc) as posicao, apelido, valor, desempate
  from base
  where valor is not null
  order by valor desc, desempate desc, lower(apelido)
  limit least(greatest(coalesce(p_limite, 50), 1), 100);
$$;
revoke all on function public.ranking(text, text, integer) from public;
grant execute on function public.ranking(text, text, integer) to anon, authenticated;
