-- Jogo RPG · Parte 13 (27/11/2026): as contas de teste fora do ranking público
--
-- As contas TesteA, TesteB e TesteC existem para os roteiros de teste das contas (npm run testar:contas e
-- testar:contas:publicado) e continuam existindo: nada é apagado (nem conta, nem save, nem partida).
-- O que muda:
--   * perfis ganha a coluna fora_do_ranking (falso para todo mundo; verdadeiro para as três contas de teste);
--   * a função ranking deixa de mostrar quem está fora do ranking para os outros. A própria conta de teste, logada,
--     ainda se vê (o roteiro das contas confere que o ranking destaca a própria conta).
-- Ninguém consegue mudar essa coluna pelo jogo: a tabela perfis só tem a regra de ler o próprio perfil (RLS do 001).
-- Pode ser rodado de novo sem estragar nada.

-- 1. A marca de quem fica fora do ranking público
alter table public.perfis add column if not exists fora_do_ranking boolean not null default false;

update public.perfis
set fora_do_ranking = true
where lower(apelido) in ('testea', 'testeb', 'testec');

-- 2. O ranking (o mesmo do 001_contas.sql, seção 5), sem as contas fora do ranking, menos para elas mesmas
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
    where not p.fora_do_ranking or p.id = (select auth.uid())
  )
  select rank() over (order by valor desc, desempate desc) as posicao, apelido, valor, desempate
  from base
  where valor is not null
  order by valor desc, desempate desc, lower(apelido)
  limit least(greatest(coalesce(p_limite, 50), 1), 100);
$$;
revoke all on function public.ranking(text, text, integer) from public;
grant execute on function public.ranking(text, text, integer) to anon, authenticated;
