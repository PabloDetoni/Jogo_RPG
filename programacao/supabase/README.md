# Banco do jogo (Supabase)

Todo o SQL do jogo fica nesta pasta, em arquivos numerados. Cada um é rodado **uma vez**, em ordem, no **SQL Editor** do painel do Supabase (passo a passo em `documentacao/Supabase_passo_a_passo.md`). Os arquivos podem ser rodados de novo sem estragar nada (`if not exists`, `create or replace`). Uma mudança depois de rodado vira um arquivo novo (`002_...sql`), nunca uma edição escondida do antigo.

| Arquivo | O que cria | Fase |
|---|---|---|
| `001_contas.sql` | perfis (apelido), sessão única, saves com versão, partidas e o ranking público | Fase 2 |

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
