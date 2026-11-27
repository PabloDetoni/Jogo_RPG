# Banco do jogo (Supabase)

Todo o SQL do jogo fica nesta pasta, em arquivos numerados. Cada um é rodado **uma vez**, em ordem, no **SQL Editor** do painel do Supabase (passo a passo em `documentacao/Supabase_passo_a_passo.md`). Os arquivos podem ser rodados de novo sem estragar nada (`if not exists`, `create or replace`). Uma mudança depois de rodado vira um arquivo novo (`002_...sql`), nunca uma edição escondida do antigo.

| Arquivo | O que cria | Fase |
|---|---|---|
| `001_contas.sql` | perfis (apelido), sessão única, saves com versão, partidas e o ranking público | Fase 2 |
| `002_hora_do_servidor.sql` | a hora do servidor, para as rodadas diárias dos minijogos da conta | ajustes de 14/10 · **rodado** |
| `003_...` | Área do Desenvolvedor (D1): **só existe no ramo `area-dev`** e **não roda agora** | parada |
| `004_apelido_de_conta_nao_confirmada.sql` | o apelido de quem nunca confirmou o e-mail não fica mais preso | Parte 0b (21/11) · **rodado em 27/11** (pelo Claude do chat, pela conexão do Supabase; os dois gatilhos conferidos; nenhum perfil preso existia) |
| `005_contas_de_teste_fora_do_ranking.sql` | as contas de teste (TesteA, TesteB e TesteC) fora do ranking público, sem apagar nada; cada uma ainda se vê logada | Parte 13 (27/11) · **falta rodar** |

## Rodar o 005 (para o Pablo)

1. Abra o painel do Supabase do jogo → **SQL Editor** → **New query**.
2. Abra `programacao/supabase/005_contas_de_teste_fora_do_ranking.sql`, copie **tudo**, cole e clique em **Run**.
3. Conferir: dentro de `programacao/`, `npm run conferir:configuracao` deve dizer "as contas de teste não aparecem no ranking público" (antes do 005, ele avisa que elas aparecem).
4. Avise o Claude que rodou. Nada é apagado: as contas, os saves e as partidas continuam, e os roteiros das contas continuam funcionando.

## Rodar o 004 (feito em 27/11)

O que ele resolve: hoje o apelido é reservado no **cadastro**. Quem se cadastra e nunca confirma o e-mail deixa o
apelido preso para sempre. Com o 004, o apelido só é reservado quando a conta **confirma o e-mail**; os já presos de
contas nunca confirmadas são soltos.

1. Abra o painel do Supabase do jogo → **SQL Editor** → **New query**.
2. Abra o arquivo `programacao/supabase/004_apelido_de_conta_nao_confirmada.sql`, copie **tudo** e cole.
3. Clique em **Run**. Deve aparecer "Success. No rows returned" (ou o número de perfis presos que foram soltos).
4. Conferir (opcional), numa query nova:
   ```sql
   select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
   ```
   Tem que listar `ao_criar_conta` e `ao_confirmar_conta`.
5. Teste de verdade (opcional): crie uma conta com um apelido novo e **não** confirme o e-mail; numa aba anônima, a tela
   Criar conta tem que aceitar o mesmo apelido. Confirmando a primeira conta depois, ela entra normalmente; se o apelido
   já tiver sido pego, o jogo pede outro no primeiro login.
6. Avise o Claude que rodou (ele marca no PLANO.md e nesta tabela). Arquivo rodado não se edita mais.

O 004 não apaga contas, saves nem partidas: só perfis de contas que **nunca confirmaram** o e-mail (essas contas nem
conseguem entrar no jogo).

## O que há no `001_contas.sql`

| Peça | Para que serve | Quem pode usar |
|---|---|---|
| tabela `perfis` | o apelido único de cada conta (RF02); "Pablo" e "pablo" contam como o mesmo | cada conta lê só o próprio |
| gatilho `ao_criar_conta` | cria o perfil com o apelido mandado no cadastro; apelido repetido faz o cadastro falhar | o próprio Supabase |
| `apelido_disponivel(apelido)` | a tela Criar conta avisa "apelido em uso" antes de cadastrar | todos (até sem login) |
| `definir_meu_apelido(apelido)` | conta sem apelido (criada pelo painel) escolhe um no primeiro login | a conta logada |
| tabela `sessoes` | a sessão ativa de cada conta e o último sinal (RF05) | ninguém direto; só as funções |
| `abrir_sessao`, `sinal_da_sessao`, `fechar_sessao` | entrar ("conta em uso" se outra sessão deu sinal há menos de 3 minutos), o sinal de cada minuto e a saída | a conta logada |
| tabela `saves` | o progresso de cada conta, com versão (RF10) | cada conta lê só o próprio; ninguém escreve direto |
| `salvar_progresso(sessao, versao, formato, progresso)` | grava só se a versão for **maior** que a guardada e se o pedido vier da sessão ativa; recusa números absurdos | a conta logada |
| tabela `partidas` | uma linha por partida de conta terminada: histórico (RF16) e ranking (RF15) | cada conta lê e registra só as próprias |
| `ranking(aba, classe, limite)` | as 6 abas do Salão da Glória; devolve só posição, apelido e números | todos (até sem login) |

## Regras que não mudam

- O jogo usa só a chave **publicável**. A chave secreta (secret / service_role) não entra no código, no `.env.local` nem na Vercel.
- Toda tabela tem RLS ligado. Escrever no save ou na sessão só pelas funções, que conferem `auth.uid()`.
- O convidado nunca grava nada no banco (RF01).
